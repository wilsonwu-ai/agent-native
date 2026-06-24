import { useQuery } from "@tanstack/react-query";
import { getIdToken } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconSparkles,
  IconPhone,
  IconFileText,
  IconMessage,
  IconAlertCircle,
} from "@tabler/icons-react";

async function authFetch(url: string) {
  const token = await getIdToken();
  const res = await fetch(url, {
    headers: { ...(token && { Authorization: `Bearer ${token}` }) },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

interface AccountSummaryResponse {
  summary: string | null;
  reason?: "no_data" | "no_api_key";
  context?: {
    calls?: any[];
    notes?: any[];
    slackMessages?: any[];
    callCount?: number;
    noteCount?: number;
    slackCount?: number;
  };
}

interface KeyUpdatesProps {
  accountName: string;
  companyId?: string;
}

export function KeyUpdates({ accountName, companyId }: KeyUpdatesProps) {
  const { data, isLoading, error } = useQuery<AccountSummaryResponse>({
    queryKey: ["account-summary", accountName, companyId],
    queryFn: () => {
      const params = new URLSearchParams({ account: accountName, days: "30" });
      if (companyId) params.set("companyId", companyId);
      return authFetch(`/api/account-summary?${params}`);
    },
    staleTime: 10 * 60 * 1000,
    retry: false,
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <IconSparkles className="h-5 w-5 text-purple-500" />
          <CardTitle>Account Brief</CardTitle>
        </div>
        <CardDescription>
          AI-generated summary from Gong calls, HubSpot notes, and Slack — last
          30 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2.5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[95%]" />
            <Skeleton className="h-4 w-[88%]" />
            <Skeleton className="h-4 w-full mt-3" />
            <Skeleton className="h-4 w-[92%]" />
            <Skeleton className="h-4 w-[75%]" />
          </div>
        ) : error ? (
          <div className="flex items-start gap-2 text-sm text-destructive">
            <IconAlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>Failed to generate account brief</span>
          </div>
        ) : data?.reason === "no_api_key" ? (
          <div className="space-y-4">
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
              <IconAlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                Add a <code className="font-mono">GEMINI_API_KEY</code>{" "}
                environment variable to enable AI summaries. Get a free key at{" "}
                <a
                  href="https://aistudio.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  aistudio.google.com
                </a>
                .
              </span>
            </div>

            {data.context && (
              <div className="grid grid-cols-3 gap-4 pt-1">
                <ContextPill
                  icon={<IconPhone className="h-3.5 w-3.5" />}
                  label="Gong calls"
                  count={data.context.calls?.length ?? 0}
                  items={
                    data.context.calls
                      ?.slice(0, 3)
                      .map((c: any) => c.title || "Untitled") ?? []
                  }
                />
                <ContextPill
                  icon={<IconFileText className="h-3.5 w-3.5" />}
                  label="HubSpot notes"
                  count={data.context.notes?.length ?? 0}
                  items={
                    data.context.notes
                      ?.slice(0, 2)
                      .map((n: any) => n.body?.substring(0, 60) + "…") ?? []
                  }
                />
                <ContextPill
                  icon={<IconMessage className="h-3.5 w-3.5" />}
                  label="Slack messages"
                  count={data.context.slackMessages?.length ?? 0}
                  items={
                    data.context.slackMessages
                      ?.slice(0, 2)
                      .map((m: any) => m?.substring(0, 60) + "…") ?? []
                  }
                />
              </div>
            )}
          </div>
        ) : data?.reason === "no_data" ? (
          <p className="text-sm text-muted-foreground italic">
            No recent activity found across Gong, HubSpot, or Slack for this
            account in the last 30 days.
          </p>
        ) : data?.summary ? (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
              {data.summary}
            </p>
            {data.context && (
              <div className="flex items-center gap-4 pt-1 border-t border-border text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <IconPhone className="h-3 w-3" />{" "}
                  {data.context.callCount ?? 0} calls
                </span>
                <span className="flex items-center gap-1">
                  <IconFileText className="h-3 w-3" />{" "}
                  {data.context.noteCount ?? 0} notes
                </span>
                <span className="flex items-center gap-1">
                  <IconMessage className="h-3 w-3" />{" "}
                  {data.context.slackCount ?? 0} Slack messages
                </span>
              </div>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ContextPill({
  icon,
  label,
  count,
  items,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  items: string[];
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        <span className="font-medium">{label}</span>
        <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4">
          {count}
        </Badge>
      </div>
      {items.length > 0 ? (
        <ul className="space-y-1">
          {items.map((item, i) => (
            <li key={i} className="text-xs text-muted-foreground line-clamp-2">
              • {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground italic">None</p>
      )}
    </div>
  );
}
