import { useState } from "react";
import { IconAlertCircle, IconCircleCheck } from "@tabler/icons-react";
import { type StrategicAccount, type Contact, getCoverageLevel } from "./data";

const CONFIDENCE_CONFIG = {
  high: {
    dot: "bg-emerald-500",
    label: "High",
    ring: "ring-1 ring-emerald-200 dark:ring-emerald-800",
  },
  medium: {
    dot: "bg-amber-400",
    label: "Med",
    ring: "ring-1 ring-amber-200 dark:ring-amber-800",
  },
  low: {
    dot: "bg-red-400",
    label: "Low",
    ring: "ring-1 ring-red-200 dark:ring-red-800",
  },
};

interface ContactCardProps {
  contact: Contact;
  isPrimary: boolean;
  onConfirm?: () => void;
  isConfirmed?: boolean;
}

export function ContactCard({
  contact,
  isPrimary,
  onConfirm,
  isConfirmed,
}: ContactCardProps) {
  const [open, setOpen] = useState(false);
  const { dot, label, ring } = CONFIDENCE_CONFIG[contact.confidence];

  return (
    <div
      className={`rounded-md p-2.5 space-y-1.5 ${isPrimary ? "bg-muted/30" : "bg-muted/10"} ${ring}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-medium text-sm leading-tight">
              {contact.name}
            </span>
            {contact.sameAsOtherRole && (
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded whitespace-nowrap">
                same person
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground leading-tight mt-0.5">
            {contact.title}
          </div>
          <a
            href={`mailto:${contact.email}`}
            className="text-xs text-blue-500 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {contact.email}
          </a>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className={`w-2 h-2 rounded-full ${dot}`} />
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {label}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          className="text-[11px] text-muted-foreground/60 hover:text-muted-foreground"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(!open);
          }}
        >
          {open ? "hide ↑" : "why? ↓"}
        </button>

        {onConfirm &&
          (isConfirmed ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <IconCircleCheck className="w-3 h-3" />
              Confirmed
            </span>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onConfirm();
              }}
              className="text-[11px] font-medium text-primary hover:text-primary/80 border border-primary/30 hover:border-primary/60 rounded px-2 py-0.5 transition-colors"
            >
              Confirm →
            </button>
          ))}
      </div>

      {open && (
        <p className="text-xs text-muted-foreground leading-relaxed bg-background/60 rounded p-2">
          {contact.rationale}
        </p>
      )}
    </div>
  );
}

interface RoleColumnProps {
  contacts: Contact[];
  label: string;
  onConfirm?: (contact: Contact) => void;
  confirmedKeys?: Set<string>;
}

export function RoleColumn({
  contacts,
  label,
  onConfirm,
  confirmedKeys,
}: RoleColumnProps) {
  if (contacts.length === 0) {
    return (
      <div className="flex items-center gap-1.5 text-muted-foreground/50 py-1">
        <IconAlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
        <span className="text-xs italic">Not identified</span>
      </div>
    );
  }

  const sorted = [...contacts].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.confidence] - order[b.confidence];
  });

  const hasCandidates =
    contacts.length > 1 || contacts[0].confidence !== "high";

  return (
    <div className="space-y-1.5">
      {hasCandidates && contacts.length > 1 && (
        <div className="text-[10px] text-muted-foreground/60 uppercase tracking-wide font-medium">
          {contacts.length} candidates
        </div>
      )}
      {sorted.map((c, i) => (
        <ContactCard
          key={c.email}
          contact={c}
          isPrimary={i === 0}
          onConfirm={onConfirm ? () => onConfirm(c) : undefined}
          isConfirmed={confirmedKeys?.has(`${c.name}::${label}`)}
        />
      ))}
    </div>
  );
}

interface AccountCoverageModuleProps {
  account: StrategicAccount;
  onConfirm?: (contact: Contact, roleName: string) => void;
  confirmedKeys?: Set<string>;
}

export function AccountCoverageModule({
  account,
  onConfirm,
  confirmedKeys,
}: AccountCoverageModuleProps) {
  const level = getCoverageLevel(account);
  const coverageStyles = {
    clear:
      "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
    partial:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
    gap: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
  };

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Sourced from Gong ({account.sources.gongCalls} calls), HubSpot (
          {account.sources.hubspotContacts} contacts)
          {account.sources.hasSlack ? ", and Slack" : ""}
        </p>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium ${coverageStyles[level]}`}
        >
          {level.charAt(0).toUpperCase() + level.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-1.5">
            Champion
          </div>
          <RoleColumn
            contacts={account.champions}
            label="Champion"
            onConfirm={onConfirm ? (c) => onConfirm(c, "Champion") : undefined}
            confirmedKeys={confirmedKeys}
          />
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-1.5">
            Enabler
          </div>
          <RoleColumn
            contacts={account.enablers}
            label="Enabler"
            onConfirm={onConfirm ? (c) => onConfirm(c, "Enabler") : undefined}
            confirmedKeys={confirmedKeys}
          />
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-1.5">
            Exec Sponsor
          </div>
          <RoleColumn
            contacts={account.execSponsors}
            label="Exec Sponsor"
            onConfirm={
              onConfirm ? (c) => onConfirm(c, "Exec Sponsor") : undefined
            }
            confirmedKeys={confirmedKeys}
          />
        </div>
      </div>

      {account.notes && (
        <p className="text-xs text-muted-foreground leading-relaxed border-t border-border/50 pt-3">
          <span className="font-medium text-foreground">Analysis: </span>
          {account.notes}
        </p>
      )}
    </div>
  );
}
