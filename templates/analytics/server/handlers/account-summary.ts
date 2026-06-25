import { defineEventHandler, getQuery, setResponseStatus } from "h3";
import {
  runApiHandlerWithContext,
  resolveCredential,
} from "../lib/credentials";
import type { CredentialContext } from "../lib/credentials";
import { searchCalls, getCallDetail } from "../lib/gong";
import { resolveAnalyticsGongCredentials } from "../lib/provider-credentials";
import { getAssociatedHubSpotObjects } from "../lib/hubspot";
import {
  HUBSPOT_ANALYTICS_CREDENTIAL_KEYS,
  hasAnalyticsProviderCredential,
} from "../lib/provider-credentials";
import { listChannels, getChannelHistory } from "../lib/slack";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

async function callGemini(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 600, temperature: 0.3 },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${text}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

async function fetchHubSpotNotes(
  ctx: CredentialContext,
  companyId: string,
  days: number,
): Promise<string[]> {
  const hasHubSpot = await hasAnalyticsProviderCredential({
    provider: "hubspot",
    keys: HUBSPOT_ANALYTICS_CREDENTIAL_KEYS,
    ctx,
  });
  if (!hasHubSpot) return [];
  const since = Date.now() - days * 24 * 60 * 60 * 1000;
  try {
    const notes = await getAssociatedHubSpotObjects({
      fromObjectType: "companies",
      fromObjectId: companyId,
      toObjectType: "notes",
      limit: 20,
      properties: ["hs_note_body", "hs_timestamp"],
    });
    return notes
      .filter(
        (n) => new Date(n.properties.hs_timestamp || 0).getTime() >= since,
      )
      .map((n) => n.properties.hs_note_body || "")
      .filter(Boolean);
  } catch {
    return [];
  }
}

async function fetchSlackMessages(
  accountName: string,
  days: number,
): Promise<string[]> {
  try {
    const channelName = `customer-${accountName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")}`;
    const channels = await listChannels("primary");
    const channel = channels.find((c) => c.name === channelName);
    if (!channel) return [];
    const since = Date.now() / 1000 - days * 24 * 60 * 60;
    const result = await getChannelHistory("primary", channel.id, 30);
    return result.messages
      .filter((m) => parseFloat(m.ts) >= since && m.text?.trim())
      .map((m) => m.text);
  } catch {
    return [];
  }
}

export const handleAccountSummary = defineEventHandler((event) =>
  runApiHandlerWithContext(event, async (ctx) => {
    const {
      account,
      companyId: companyIdParam,
      days: daysParam,
    } = getQuery(event);
    const accountName = typeof account === "string" ? account : "";
    const companyId = typeof companyIdParam === "string" ? companyIdParam : "";
    const days = daysParam ? parseInt(daysParam as string, 10) : 30;

    if (!accountName) {
      setResponseStatus(event, 400);
      return { error: "account parameter required" };
    }

    try {
      const hasGong = !!(await resolveAnalyticsGongCredentials({ ctx }));

      const [calls, notes, slackMessages] = await Promise.all([
        hasGong
          ? searchCalls(accountName, days).then((r) => r.calls)
          : Promise.resolve([]),
        companyId
          ? fetchHubSpotNotes(ctx, companyId, days)
          : Promise.resolve([]),
        fetchSlackMessages(accountName, days),
      ]);

      const recentCalls = calls.slice(0, 3);
      const callDetails = await Promise.all(
        recentCalls.map((c: any) => getCallDetail(c.id).catch(() => null)),
      );

      const callContext = callDetails
        .filter(Boolean)
        .map((d: any) => {
          const date = new Date(d.started).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          const parts: string[] = [`[${date}] ${d.title}`];
          if (d.brief) parts.push(`Summary: ${d.brief}`);
          if (d.keyPoints?.length)
            parts.push(`Key points: ${d.keyPoints.join("; ")}`);
          return parts.join("\n");
        })
        .join("\n\n");

      const notesContext = notes.slice(0, 5).join("\n");
      const slackContext = slackMessages.slice(0, 10).join("\n");

      if (!callContext && !notesContext && !slackContext) {
        return { summary: null, reason: "no_data" };
      }

      const geminiKey = await resolveCredential("GEMINI_API_KEY", ctx);
      if (!geminiKey) {
        return {
          summary: null,
          reason: "no_api_key",
          context: {
            calls: callDetails.filter(Boolean),
            notes,
            slackMessages,
          },
        };
      }

      const prompt = `You are a customer success analyst at Builder.io. Based on recent activity data for the ${accountName} account, write a concise 2-3 paragraph account brief that a sales or CS leader would find useful before a meeting or review.

Focus on: what's been happening, any risks or blockers, positive momentum, and what the next priorities should be. Be specific and factual. Do not make things up.

Recent Gong calls:
${callContext || "None"}

HubSpot notes:
${notesContext || "None"}

Slack channel highlights:
${slackContext || "None"}

Write the account brief now (2-3 paragraphs, no headers, plain prose):`;

      const summary = await callGemini(geminiKey, prompt);
      return {
        summary,
        context: {
          callCount: calls.length,
          noteCount: notes.length,
          slackCount: slackMessages.length,
        },
      };
    } catch (err: any) {
      console.error("Account summary error:", err.message);
      setResponseStatus(event, 500);
      return { error: err.message };
    }
  }),
);
