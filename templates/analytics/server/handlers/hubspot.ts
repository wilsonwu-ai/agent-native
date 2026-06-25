import {
  defineEventHandler,
  getRouterParam,
  getQuery,
  setResponseStatus,
} from "h3";
import { runApiHandlerWithContext } from "../lib/credentials";
import {
  HUBSPOT_ANALYTICS_CREDENTIAL_KEYS,
  hasAnalyticsProviderCredential,
} from "../lib/provider-credentials";
import {
  getAssociatedHubSpotObjects,
  getHubSpotAssociations,
  readHubSpotObjects,
  searchHubSpotObjects,
  getDealPipelines,
} from "../lib/hubspot";
import type { CredentialContext } from "../lib/credentials";

function missingHubSpotCredentials() {
  return {
    error: "missing_api_key",
    key: "HUBSPOT_ACCESS_TOKEN",
    label: "HubSpot",
    message: "Connect HubSpot to see this data",
    settingsPath: "/data-sources",
  };
}

async function ensureHubSpot(ctx: CredentialContext) {
  return hasAnalyticsProviderCredential({
    provider: "hubspot",
    keys: HUBSPOT_ANALYTICS_CREDENTIAL_KEYS,
    ctx,
  });
}

export const handleHubSpotDeals = defineEventHandler((event) =>
  runApiHandlerWithContext(event, async (ctx) => {
    if (!(await ensureHubSpot(ctx))) return missingHubSpotCredentials();
    const companyId = getRouterParam(event, "companyId");
    if (!companyId) {
      setResponseStatus(event, 400);
      return { error: "companyId is required" };
    }

    try {
      const [dealRecords, pipelines] = await Promise.all([
        getAssociatedHubSpotObjects({
          fromObjectType: "companies",
          fromObjectId: companyId,
          toObjectType: "deals",
          limit: 100,
          properties: ["dealtype", "hs_is_closed_won"],
        }),
        getDealPipelines(),
      ]);

      const stageMap = new Map<
        string,
        { label: string; pipelineLabel: string }
      >();
      for (const pipeline of pipelines) {
        for (const stage of pipeline.stages) {
          stageMap.set(stage.id, {
            label: stage.label,
            pipelineLabel: pipeline.label,
          });
        }
      }

      const deals = dealRecords
        .filter((deal) => {
          const closedWon = deal.properties.hs_is_closed_won;
          const isClosed = closedWon === "true";
          const stageName =
            stageMap.get(deal.properties.dealstage ?? "")?.label ||
            deal.properties.dealstage ||
            "";
          const lower = stageName.toLowerCase();
          const isClosedLost =
            lower.includes("closed") && lower.includes("lost");
          return !isClosed && !isClosedLost;
        })
        .map((deal) => {
          const stageInfo = stageMap.get(deal.properties.dealstage ?? "");
          return {
            deal_id: deal.id,
            dealname: deal.properties.dealname || `Deal ${deal.id}`,
            amount: parseFloat(deal.properties.amount || "0"),
            pipeline_label: stageInfo?.pipelineLabel || "Unknown Pipeline",
            dealtype: deal.properties.dealtype || null,
            stage_name:
              stageInfo?.label || deal.properties.dealstage || "Unknown Stage",
            close_date: deal.properties.closedate || null,
          };
        });

      deals.sort((a, b) => {
        if (a.close_date && b.close_date) {
          return (
            new Date(a.close_date).getTime() - new Date(b.close_date).getTime()
          );
        }
        if (a.close_date) return -1;
        if (b.close_date) return 1;
        return b.amount - a.amount;
      });

      return { success: true, deals };
    } catch (err: any) {
      console.error("HubSpot deals error:", err.message);
      setResponseStatus(event, 500);
      return { error: err.message };
    }
  }),
);

export const handleHubSpotMeetings = defineEventHandler((event) =>
  runApiHandlerWithContext(event, async (ctx) => {
    if (!(await ensureHubSpot(ctx))) return missingHubSpotCredentials();
    const companyId = getRouterParam(event, "companyId");
    if (!companyId) {
      setResponseStatus(event, 400);
      return { error: "companyId is required" };
    }

    try {
      const meetingRecords = await getAssociatedHubSpotObjects({
        fromObjectType: "companies",
        fromObjectId: companyId,
        toObjectType: "meetings",
        limit: 100,
      });

      if (meetingRecords.length === 0) {
        return { success: true, meetings: [] };
      }

      // Resolve contact associations for each meeting (cap to 50 to limit calls)
      const meetingContactIds = new Map<string, string[]>();
      const limited = meetingRecords.slice(0, 50);
      const batchSize = 10;
      for (let i = 0; i < limited.length; i += batchSize) {
        const batch = limited.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (meeting) => {
            const ids = await getHubSpotAssociations({
              fromObjectType: "meetings",
              fromObjectId: meeting.id,
              toObjectType: "contacts",
            }).catch(() => [] as string[]);
            meetingContactIds.set(meeting.id, ids);
          }),
        );
      }

      const allContactIds = new Set<string>();
      meetingContactIds.forEach((ids) =>
        ids.forEach((id) => allContactIds.add(id)),
      );

      const contactMap = new Map<
        string,
        { name: string; email: string; isBuilder: boolean }
      >();
      if (allContactIds.size > 0) {
        const contacts = await readHubSpotObjects({
          objectType: "contacts",
          ids: Array.from(allContactIds),
          properties: ["firstname", "lastname", "email"],
        });
        for (const contact of contacts) {
          const firstName = contact.properties.firstname || "";
          const lastName = contact.properties.lastname || "";
          const email = contact.properties.email || "";
          const name = `${firstName} ${lastName}`.trim() || email || "Unknown";
          contactMap.set(contact.id, {
            name,
            email,
            isBuilder: email.endsWith("@builder.io"),
          });
        }
      }

      const now = new Date().toISOString();
      const meetings = meetingRecords.map((meeting) => {
        const startTime =
          meeting.properties.hs_meeting_start_time ||
          meeting.properties.hs_timestamp ||
          "";
        const isUpcoming = startTime > now;

        const builderAttendees: string[] = [];
        const customerAttendees: string[] = [];
        for (const id of meetingContactIds.get(meeting.id) || []) {
          const contact = contactMap.get(id);
          if (!contact) continue;
          (contact.isBuilder ? builderAttendees : customerAttendees).push(
            contact.name,
          );
        }

        return {
          id: meeting.id,
          title: meeting.properties.hs_meeting_title || "Untitled Meeting",
          startTime,
          endTime: meeting.properties.hs_meeting_end_time || undefined,
          status: isUpcoming ? "scheduled" : "completed",
          outcome: meeting.properties.hs_meeting_outcome || undefined,
          notes:
            meeting.properties.hs_meeting_body ||
            meeting.properties.hs_internal_meeting_notes ||
            undefined,
          builderAttendees,
          customerAttendees,
        };
      });

      meetings.sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
      );

      return { success: true, meetings };
    } catch (err: any) {
      console.error("HubSpot meetings error:", err.message);
      setResponseStatus(event, 500);
      return { error: err.message };
    }
  }),
);

export const handleHubSpotCompany = defineEventHandler((event) =>
  runApiHandlerWithContext(event, async (ctx) => {
    if (!(await ensureHubSpot(ctx))) return missingHubSpotCredentials();
    const companyId = getRouterParam(event, "companyId");
    if (!companyId) {
      setResponseStatus(event, 400);
      return { error: "companyId is required" };
    }

    try {
      const [company] = await readHubSpotObjects({
        objectType: "companies",
        ids: [companyId],
        properties: ["expansion_thesis", "name"],
      });
      return {
        expansion_thesis: company?.properties.expansion_thesis || null,
        name: company?.properties.name || null,
      };
    } catch (err: any) {
      console.error("HubSpot company error:", err.message);
      setResponseStatus(event, 500);
      return { error: err.message };
    }
  }),
);

export const handleHubSpotContacts = defineEventHandler((event) =>
  runApiHandlerWithContext(event, async (ctx) => {
    if (!(await ensureHubSpot(ctx))) return missingHubSpotCredentials();
    const { company } = getQuery(event);
    const companyName = typeof company === "string" ? company : "";
    if (!companyName) {
      setResponseStatus(event, 400);
      return { error: "company parameter is required" };
    }

    try {
      const { records } = await searchHubSpotObjects({
        objectType: "companies",
        query: companyName,
        limit: 1,
      });
      const companyId = records[0]?.id;
      if (!companyId) return { contacts: [], total: 0 };

      const contacts = await getAssociatedHubSpotObjects({
        fromObjectType: "companies",
        fromObjectId: companyId,
        toObjectType: "contacts",
        limit: 100,
        properties: ["firstname", "lastname", "email", "jobtitle"],
      });

      return { contacts, total: contacts.length };
    } catch (err: any) {
      console.error("HubSpot contacts error:", err.message);
      setResponseStatus(event, 500);
      return { error: err.message };
    }
  }),
);
