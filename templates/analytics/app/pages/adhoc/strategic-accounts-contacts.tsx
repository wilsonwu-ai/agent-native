import { useState, useMemo } from "react";
import { IconRefresh } from "@tabler/icons-react";
import { useSendToAgentChat } from "@agent-native/core/client";
import {
  STRATEGIC_ACCOUNTS,
  getCoverageLevel,
  DATA_LAST_UPDATED,
} from "./strategic-accounts/data";
import { CoverageStats } from "./strategic-accounts/CoverageStats";
import { AccountTable } from "./strategic-accounts/AccountTable";

type FilterCoverage = "all" | "clear" | "partial" | "gap";

export default function StrategicAccountContactsPage() {
  const [filterCoverage, setFilterCoverage] = useState<FilterCoverage>("all");
  const [search, setSearch] = useState("");
  const { send: sendToAgent, isGenerating } = useSendToAgentChat();

  function handleRefresh() {
    sendToAgent({
      message:
        "Refresh the strategic accounts contact data in app/pages/adhoc/strategic-accounts/data.ts. Re-pull the latest data from Gong (last 90 days), HubSpot contacts, and Slack for all 25 strategic accounts. Update champion, enabler, and exec sponsor assignments, confidence levels, rationale, source counts (gongCalls, hubspotContacts, hasSlack), and notes based on the freshest signals. Keep the same TypeScript structure. Also update the DATA_LAST_UPDATED constant at the top of the file to the current ISO timestamp. Update the file when done.",
      submit: true,
    });
  }

  const filtered = useMemo(() => {
    return STRATEGIC_ACCOUNTS.filter((a) => {
      if (filterCoverage !== "all" && getCoverageLevel(a) !== filterCoverage)
        return false;
      if (search) {
        const q = search.toLowerCase();
        const inName = a.name.toLowerCase().includes(q);
        const inChampions = a.champions.some(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q),
        );
        const inEnablers = a.enablers.some(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q),
        );
        const inExecs = a.execSponsors.some(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q),
        );
        return inName || inChampions || inEnablers || inExecs;
      }
      return true;
    });
  }, [filterCoverage, search]);

  const coverageCounts = useMemo(
    () => ({
      clear: STRATEGIC_ACCOUNTS.filter((a) => getCoverageLevel(a) === "clear")
        .length,
      partial: STRATEGIC_ACCOUNTS.filter(
        (a) => getCoverageLevel(a) === "partial",
      ).length,
      gap: STRATEGIC_ACCOUNTS.filter((a) => getCoverageLevel(a) === "gap")
        .length,
    }),
    [],
  );

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Strategic Account Coverage
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Champion, Enabler, and Executive Sponsor coverage across all 25
            strategic accounts — sourced from Gong (90 days), HubSpot, and
            Slack.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <button
            onClick={handleRefresh}
            disabled={isGenerating}
            className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-background text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IconRefresh
              className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`}
            />
            {isGenerating ? "Refreshing…" : "Refresh Data"}
          </button>
          <span className="text-xs text-muted-foreground">
            Updated{" "}
            {new Date(DATA_LAST_UPDATED).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              timeZone: "UTC",
            })}
          </span>
        </div>
      </div>

      <CoverageStats
        counts={coverageCounts}
        total={STRATEGIC_ACCOUNTS.length}
      />

      <div className="flex flex-wrap gap-6 text-xs text-muted-foreground border border-border rounded-lg px-4 py-3 bg-muted/30">
        <div>
          <span className="font-semibold text-foreground">Champion</span> —
          sells for you when you're not in the room. External-facing,
          deal-centric. Has personal stake and actively advocates internally.
        </div>
        <div>
          <span className="font-semibold text-foreground">Enabler</span> —
          internal change agent driving ongoing adoption post-sale. Bridges exec
          vision to frontline. Accountable for program momentum.
        </div>
        <div>
          <span className="font-semibold text-foreground">Exec Sponsor</span> —
          executive with budget authority backing the initiative.
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search accounts or contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring w-64"
        />

        <div className="flex items-center gap-1 text-sm">
          <span className="text-muted-foreground mr-1">Coverage:</span>
          {(["all", "clear", "partial", "gap"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setFilterCoverage(v)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                filterCoverage === v
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {v === "all"
                ? `All (${STRATEGIC_ACCOUNTS.length})`
                : `${v.charAt(0).toUpperCase() + v.slice(1)} (${coverageCounts[v as keyof typeof coverageCounts]})`}
            </button>
          ))}
        </div>

        {(filterCoverage !== "all" || search) && (
          <button
            onClick={() => {
              setFilterCoverage("all");
              setSearch("");
            }}
            className="text-xs text-muted-foreground underline"
          >
            Clear
          </button>
        )}

        <span className="ml-auto text-xs text-muted-foreground">
          {filtered.length} of {STRATEGIC_ACCOUNTS.length} accounts
        </span>
      </div>

      <AccountTable accounts={filtered} />
    </div>
  );
}
