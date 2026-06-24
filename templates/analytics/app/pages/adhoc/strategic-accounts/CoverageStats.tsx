import { STRATEGIC_ACCOUNTS, type Confidence } from "./data";

interface Props {
  counts: { clear: number; partial: number; gap: number };
  total: number;
}

function bestConfidence(
  contacts: { confidence: Confidence }[],
): Confidence | null {
  if (contacts.some((c) => c.confidence === "high")) return "high";
  if (contacts.some((c) => c.confidence === "medium")) return "medium";
  if (contacts.length > 0) return "low";
  return null;
}

function roleStats(role: "champions" | "enablers" | "execSponsors") {
  const high = STRATEGIC_ACCOUNTS.filter(
    (a) => bestConfidence(a[role]) === "high",
  ).length;
  const medium = STRATEGIC_ACCOUNTS.filter(
    (a) => bestConfidence(a[role]) === "medium",
  ).length;
  const low = STRATEGIC_ACCOUNTS.filter(
    (a) => bestConfidence(a[role]) === "low",
  ).length;
  const none = STRATEGIC_ACCOUNTS.filter((a) => a[role].length === 0).length;
  return { high, medium, low, none };
}

function RoleBar({
  label,
  stats,
  total,
  colors,
}: {
  label: string;
  stats: ReturnType<typeof roleStats>;
  total: number;
  colors: { high: string; medium: string; low: string; none: string };
}) {
  const pct = (n: number) => `${Math.round((n / total) * 100)}%`;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">
          {stats.high + stats.medium} / {total} identified (med+)
        </span>
      </div>
      <div className="flex rounded-full overflow-hidden h-3 bg-muted gap-px">
        {stats.high > 0 && (
          <div
            className={`${colors.high}   h-full`}
            style={{ width: pct(stats.high) }}
            title={`High confidence: ${stats.high}`}
          />
        )}
        {stats.medium > 0 && (
          <div
            className={`${colors.medium} h-full`}
            style={{ width: pct(stats.medium) }}
            title={`Medium confidence: ${stats.medium}`}
          />
        )}
        {stats.low > 0 && (
          <div
            className={`${colors.low}    h-full`}
            style={{ width: pct(stats.low) }}
            title={`Low confidence: ${stats.low}`}
          />
        )}
        {stats.none > 0 && (
          <div
            className={`${colors.none}  h-full`}
            style={{ width: pct(stats.none) }}
            title={`Not identified: ${stats.none}`}
          />
        )}
      </div>
      <div className="flex gap-3 text-[10px] text-muted-foreground">
        <span>
          <span
            className={`inline-block w-2 h-2 rounded-full mr-1 ${colors.high}`}
          />
          High: {stats.high}
        </span>
        <span>
          <span
            className={`inline-block w-2 h-2 rounded-full mr-1 ${colors.medium}`}
          />
          Med: {stats.medium}
        </span>
        <span>
          <span
            className={`inline-block w-2 h-2 rounded-full mr-1 ${colors.low}`}
          />
          Low: {stats.low}
        </span>
        <span>
          <span
            className={`inline-block w-2 h-2 rounded-full mr-1 ${colors.none}`}
          />
          None: {stats.none}
        </span>
      </div>
    </div>
  );
}

export function CoverageStats({ counts, total }: Props) {
  const cStats = roleStats("champions");
  const eStats = roleStats("enablers");
  const xStats = roleStats("execSponsors");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-2xl font-bold">{total}</div>
          <div className="text-sm text-muted-foreground mt-0.5">
            Strategic Accounts
          </div>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-900 p-4">
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            {counts.clear}
          </div>
          <div className="text-sm text-emerald-600 dark:text-emerald-500 mt-0.5">
            Clear Coverage
          </div>
          <div className="text-xs text-emerald-500/80 mt-1">
            2+ roles at med+ confidence
          </div>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-4">
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
            {counts.partial}
          </div>
          <div className="text-sm text-amber-600 dark:text-amber-500 mt-0.5">
            Partial Coverage
          </div>
          <div className="text-xs text-amber-500/80 mt-1">
            At least one role identified
          </div>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 p-4">
          <div className="text-2xl font-bold text-red-700 dark:text-red-400">
            {counts.gap}
          </div>
          <div className="text-sm text-red-600 dark:text-red-500 mt-0.5">
            Coverage Gaps
          </div>
          <div className="text-xs text-red-500/80 mt-1">
            No roles clearly identified
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4 grid sm:grid-cols-3 gap-6">
        <RoleBar
          label="Champions"
          stats={cStats}
          total={total}
          colors={{
            high: "bg-violet-500",
            medium: "bg-violet-300",
            low: "bg-violet-100",
            none: "bg-muted-foreground/20",
          }}
        />
        <RoleBar
          label="Enablers"
          stats={eStats}
          total={total}
          colors={{
            high: "bg-blue-500",
            medium: "bg-blue-300",
            low: "bg-blue-100",
            none: "bg-muted-foreground/20",
          }}
        />
        <RoleBar
          label="Exec Sponsors"
          stats={xStats}
          total={total}
          colors={{
            high: "bg-indigo-500",
            medium: "bg-indigo-300",
            low: "bg-indigo-100",
            none: "bg-muted-foreground/20",
          }}
        />
      </div>
    </div>
  );
}
