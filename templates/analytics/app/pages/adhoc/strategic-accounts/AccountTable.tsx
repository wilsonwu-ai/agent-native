import { useState } from "react";
import {
  IconChevronDown,
  IconChevronUp,
  IconMessage,
  IconBuilding,
  IconPhone,
  IconAlertCircle,
} from "@tabler/icons-react";
import { type StrategicAccount, type Contact, getCoverageLevel } from "./data";
import { ContactCard, RoleColumn } from "./AccountCoverageModule";

interface Props {
  accounts: StrategicAccount[];
}

function CoverageBadge({ account }: { account: StrategicAccount }) {
  const level = getCoverageLevel(account);
  const styles = {
    clear:
      "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
    partial:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
    gap: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium ${styles[level]}`}
    >
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  );
}

function SourceIcons({
  gongCalls,
  hasSlack,
  hubspotContacts,
}: {
  gongCalls: number;
  hasSlack: boolean;
  hubspotContacts: number;
}) {
  return (
    <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <IconPhone
          className={`w-3.5 h-3.5 flex-shrink-0 ${gongCalls > 0 ? "text-violet-500" : "text-muted-foreground/30"}`}
        />
        <span>{gongCalls} calls</span>
      </span>
      <span className="flex items-center gap-1.5">
        <IconBuilding
          className={`w-3.5 h-3.5 flex-shrink-0 ${hubspotContacts > 0 ? "text-orange-500" : "text-muted-foreground/30"}`}
        />
        <span>{hubspotContacts} contacts</span>
      </span>
      <span className="flex items-center gap-1.5">
        <IconMessage
          className={`w-3.5 h-3.5 flex-shrink-0 ${hasSlack ? "text-emerald-500" : "text-muted-foreground/30"}`}
        />
        <span>{hasSlack ? "Slack ✓" : "No Slack"}</span>
      </span>
    </div>
  );
}

function AccountRow({ account }: { account: StrategicAccount }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className={`border-b border-border transition-colors ${expanded ? "bg-muted/10" : ""}`}
      >
        <td className="px-4 py-3 align-top w-[140px]">
          <div className="space-y-2">
            <div className="font-semibold text-sm">{account.name}</div>
            <CoverageBadge account={account} />
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              {expanded ? (
                <IconChevronUp className="w-3.5 h-3.5" />
              ) : (
                <IconChevronDown className="w-3.5 h-3.5" />
              )}
              {expanded ? "hide notes" : "notes"}
            </button>
          </div>
        </td>

        <td className="px-4 py-3 align-top border-l border-border/40 w-[230px]">
          <RoleColumn contacts={account.champions} label="Champion" />
        </td>

        <td className="px-4 py-3 align-top border-l border-border/40 w-[230px]">
          <RoleColumn contacts={account.enablers} label="Enabler" />
        </td>

        <td className="px-4 py-3 align-top border-l border-border/40 w-[230px]">
          <RoleColumn contacts={account.execSponsors} label="Exec Sponsor" />
        </td>

        <td className="px-4 py-3 align-top border-l border-border/40 w-[110px]">
          <SourceIcons {...account.sources} />
        </td>
      </tr>

      {expanded && (
        <tr className="bg-muted/10 border-b border-border">
          <td colSpan={5} className="px-4 py-3">
            <p className="text-sm text-muted-foreground max-w-4xl leading-relaxed">
              <span className="font-medium text-foreground">Analysis: </span>
              {account.notes}
            </p>
          </td>
        </tr>
      )}
    </>
  );
}

export function AccountTable({ accounts }: Props) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Account
            </th>
            <th className="px-4 py-3 text-left border-l border-border/40">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Champion
              </div>
              <div className="text-[10px] font-normal normal-case text-muted-foreground/60 mt-0.5">
                Sells internally on your behalf
              </div>
            </th>
            <th className="px-4 py-3 text-left border-l border-border/40">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Enabler
              </div>
              <div className="text-[10px] font-normal normal-case text-muted-foreground/60 mt-0.5">
                Drives adoption post-sale
              </div>
            </th>
            <th className="px-4 py-3 text-left border-l border-border/40">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Exec Sponsor
              </div>
              <div className="text-[10px] font-normal normal-case text-muted-foreground/60 mt-0.5">
                Budget authority &amp; backing
              </div>
            </th>
            <th className="px-4 py-3 text-left border-l border-border/40">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Sources
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((account) => (
            <AccountRow key={account.name} account={account} />
          ))}
        </tbody>
      </table>

      {accounts.length === 0 && (
        <div className="py-12 text-center text-muted-foreground text-sm">
          No accounts match your filters.
        </div>
      )}
    </div>
  );
}
