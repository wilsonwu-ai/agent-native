import { Link } from "react-router";
import { IconShieldExclamation, IconExternalLink } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  accountData,
  BLOCKER_TYPE_LABELS,
  BLOCKER_TYPE_COLORS,
  type BlockerStatus,
} from "../impl-blockers/data";

const STATUS_STYLES: Record<BlockerStatus, string> = {
  active: "bg-red-100 text-red-800 border border-red-200",
  resolved: "bg-green-100 text-green-800 border border-green-200",
  monitoring: "bg-yellow-100 text-yellow-800 border border-yellow-200",
};

const STATUS_DOT: Record<BlockerStatus, string> = {
  active: "bg-red-500",
  resolved: "bg-green-500",
  monitoring: "bg-yellow-500",
};

const SOURCE_ICONS: Record<string, string> = {
  gong: "📞",
  slack: "💬",
  hubspot: "🏢",
};

interface ImplBlockersModuleProps {
  accountName: string;
}

export function ImplBlockersModule({ accountName }: ImplBlockersModuleProps) {
  const account = accountData.find(
    (a) => a.company.toLowerCase() === accountName.toLowerCase(),
  );

  const activeCount =
    account?.blockers.filter((b) => b.status === "active").length ?? 0;
  const resolvedCount =
    account?.blockers.filter((b) => b.status === "resolved").length ?? 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <IconShieldExclamation className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Implementation Blockers</CardTitle>
          </div>
          <Link
            to="/adhoc/impl-blockers"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View all accounts
            <IconExternalLink className="h-3 w-3" />
          </Link>
        </div>
        <CardDescription>
          {account
            ? `${activeCount} active${resolvedCount > 0 ? `, ${resolvedCount} resolved` : ""} — sourced from Gong, Slack, HubSpot`
            : "No blocker data for this account"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!account ? (
          <p className="text-sm text-muted-foreground">
            No implementation blockers tracked for {accountName}.
          </p>
        ) : account.blockers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No blockers recorded.</p>
        ) : (
          <div className="space-y-3">
            {account.blockers.map((blocker, i) => (
              <div
                key={i}
                className="rounded-lg border border-border p-4 space-y-2"
              >
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "w-2.5 h-2.5 rounded-full shrink-0 mt-0.5",
                        STATUS_DOT[blocker.status],
                      )}
                    />
                    <span className="text-sm font-semibold">
                      {blocker.summary}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="flex gap-1">
                      {blocker.source.map((s) => (
                        <span key={s} className="text-xs" title={s}>
                          {SOURCE_ICONS[s]}
                        </span>
                      ))}
                    </span>
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        STATUS_STYLES[blocker.status],
                      )}
                    >
                      {blocker.status}
                    </span>
                  </div>
                </div>
                <span
                  className={cn(
                    "inline-block text-xs font-medium px-2 py-0.5 rounded-full border",
                    BLOCKER_TYPE_COLORS[blocker.type],
                  )}
                >
                  {BLOCKER_TYPE_LABELS[blocker.type]}
                </span>
                {blocker.detail && (
                  <p className="text-xs text-muted-foreground leading-relaxed pl-1">
                    {blocker.detail}
                  </p>
                )}
              </div>
            ))}

            {account.notes && (
              <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-3 mt-2">
                <span className="font-medium text-foreground">Notes: </span>
                {account.notes}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
