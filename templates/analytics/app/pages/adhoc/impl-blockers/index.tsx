import { useState } from "react";
import { useSendToAgentChat } from "@agent-native/core/client";
import { cn } from "@/lib/utils";
import {
  accountData,
  getBlockerTypeSummary,
  BLOCKER_TYPE_LABELS,
  BLOCKER_TYPE_COLORS,
  type BlockerType,
  type BlockerStatus,
  type AccountBlockers,
} from "./data";

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

type Tab = "by-type" | "by-company" | "dictionary";

interface DictEntry {
  definition: string;
  rootCause: string;
  howToSpot: string[];
  examples: string[];
  solutionPaths: string[];
}

const DICTIONARY: Record<BlockerType, DictEntry> = {
  "git-integration": {
    definition:
      "A technical failure to establish a working connection between Builder and the customer's source control system (GitHub, GitLab, ADO). Distinct from permissions — the plumbing itself isn't working.",
    rootCause:
      "Credential misconfiguration, unsupported Enterprise versions, self-signed certificates, proxy interception, or missing OAuth scopes in the customer's git server setup.",
    howToSpot: [
      "Customer reports repo not indexing or showing stale code",
      "Token creation / repo connection steps completed but Builder can't read files",
      "'Connection failing' or 'credential error' language in Slack/support",
      "Customer falling back to manual file uploads or copy-paste",
    ],
    examples: [
      "NTT Data: GitLab Enterprise connection failing on credentials after initial setup",
      "Western Union: Angular GitLab foundation project not connecting cleanly",
      "CBRE: Azure DevOps PR metrics requiring separate workaround queries",
      "Nasdaq: Unconnected repo starters causing duplication issues (now resolved)",
    ],
    solutionPaths: [
      "Dedicated git integration troubleshooting runbook per provider (GitHub/GitLab/ADO)",
      "Support for self-signed certificate injection / custom CA bundles",
      "Clearer OAuth scope documentation per git platform",
      "Connection health check UI in Builder showing exactly what's failing",
    ],
  },
  "admin-approval-bottleneck": {
    definition:
      "Implementation is blocked not by a technical failure, but by the absence of a specific human — typically an IT admin, security officer, or manager — who has not yet granted a required permission or approval.",
    rootCause:
      "Enterprise organizations require formal approval chains for third-party tool access. The right person is often not in the initial deal/onboarding loop.",
    howToSpot: [
      "'Waiting for someone to approve / connect / enable' language",
      "Integration technically feasible but not started due to access",
      "One named individual gating the entire next step",
      "Weeks passing with no technical progress despite willingness from the user team",
    ],
    examples: [
      "ServiceNow: GitHub Enterprise connection requires one specific person with admin rights",
      "ServiceNow: Figma admin approval still pending",
      "Swiss Re: IT approval process requires formal list of OAuth grant scopes before proceeding",
    ],
    solutionPaths: [
      "Exec sponsor escalation path — get VP/EB to mandate IT approval",
      "Pre-built 'IT approval package': scope lists, security docs, infosec questionnaire answers",
      "CS playbook for identifying and looping in the right admin early (week 1 of onboarding)",
      "Builder-hosted security/compliance documentation hub for enterprise IT teams",
    ],
  },
  "security-vpn-network": {
    definition:
      "Builder is inaccessible or degraded because the customer's corporate network configuration (VPN, firewall, proxy, DNS) interferes with the connection.",
    rootCause:
      "Enterprise networks often SSL-inspect outbound traffic, block non-allowlisted domains, or require VPN split-tunneling that doesn't route Builder's endpoints correctly.",
    howToSpot: [
      "Works off-VPN, breaks on-VPN (or vice versa)",
      "Intermittent access — some users affected, others not",
      "SSL/TLS handshake errors or certificate warnings in console",
      "Customer's IT team involved in troubleshooting",
    ],
    examples: [
      "KPMG: Users blocked on/off VPN — access to Builder projects fails depending on network state",
      "Amazon: Infosec approval required before any Builder access was permitted (now resolved)",
      "OCBC: Strict security policies prevent all surfaces except VS Code extension",
    ],
    solutionPaths: [
      "Network troubleshooting guide: IP allowlists, proxy settings, DNS requirements",
      "Support for corporate proxy configuration within Builder's desktop app",
      "Pre-built infosec questionnaire / security whitepaper to accelerate enterprise approval",
      "On-prem / private cloud deployment option for high-security customers",
    ],
  },
  "data-privacy-hosting": {
    definition:
      "The customer cannot use certain Builder features or surfaces because of legal, regulatory, or policy constraints on where their data can live or how it can be processed.",
    rootCause:
      "Healthcare (HIPAA), financial services (SOC2, PCI), government (FedRAMP), or internal compliance policies restrict use of cloud-hosted tools for sensitive content.",
    howToSpot: [
      "'Cannot host sensitive data' or 'data residency' language",
      "Restricted to a subset of Builder surfaces due to compliance",
      "China risk / GDPR / HIPAA mentioned as constraints",
    ],
    examples: [
      "WebMD: Cannot host sensitive healthcare content in Builder's infrastructure",
      "OCBC: China risk bank classification requires additional data handling restrictions",
    ],
    solutionPaths: [
      "Data processing addendum (DPA) and compliance documentation per regulation",
      "Customer-controlled data residency options (EU, APAC regions)",
      "On-prem or private deployment for regulated industries",
      "Clear documentation of what data Builder stores vs. processes transiently",
    ],
  },
  "feature-gap": {
    definition:
      "The customer needs a specific product capability that doesn't exist yet or exists on a surface they can't access. The gap is blocking a core use case or causing competitive disadvantage.",
    rootCause:
      "Product roadmap hasn't prioritized this yet, or the feature exists in one surface (web/desktop) but not another (VS Code extension).",
    howToSpot: [
      "Feature request filed or referenced in Slack/Gong",
      "'This is why we use Copilot instead' language",
      "Workaround in place that's clearly unsustainable",
      "JIRA ticket marked 'Blocked'",
    ],
    examples: [
      "J.D. Power: Multi-repo workspace support in VS Code — #1 reason they'd choose Copilot over Builder",
      "OCBC: Design → Figma export exists in web/desktop but NOT in VS Code extension",
      "CBRE: Per-user credit tracking and 'lines of code accepted' metric — both marked Blocked in JIRA",
    ],
    solutionPaths: [
      "Prioritization framework: track which feature gaps are causing competitive losses or churn risk",
      "Surface parity audit: identify which features are desktop-only vs. VS Code-only",
      "Customer advisory board to validate roadmap against real enterprise needs",
    ],
  },
  "sso-auth": {
    definition:
      "The customer's identity and authentication setup (SSO, SAML, OAuth, IAM) is not fully integrated with Builder, preventing users from logging in cleanly or requiring manual user management.",
    rootCause:
      "Enterprise IT requires SSO for all approved tools. Builder's SSO configuration requires specific SAML/OIDC settings that aren't always well-documented.",
    howToSpot: [
      "Users getting login errors or falling back to email/password",
      "SSO configured but not tested — users can't log in",
      "'Entra', 'SAML', 'Okta', 'IAM' mentioned with issues",
      "VS Code extension SSO broken while web app works (or vice versa)",
    ],
    examples: [
      "Nationwide: Entra / SAML configuration still being finalized by Jordan Lloyd (admin)",
      "Bayer: VS Code extension SSO connectivity broken — desktop app recommended as workaround",
      "Intuit: Some designers hitting login issues",
    ],
    solutionPaths: [
      "Improved SAML/OIDC setup guide with provider-specific screenshots (Okta, Entra, PingFederate)",
      "VS Code extension SSO parity with web app",
      "SCIM provisioning support for automated user lifecycle management",
    ],
  },
  "onboarding-setup": {
    definition:
      "The customer is delayed in reaching meaningful usage because they are still in an initial setup or configuration phase.",
    rootCause:
      "Enterprise customers often feel they must have everything 'perfect' before letting users in. Alternatively, legitimate technical prerequisites create sequential dependencies.",
    howToSpot: [
      "Very low credit/seat usage weeks or months into the contract",
      "'Not ready yet' or 'still setting up' language",
      "Each check-in results in the same status with no new users",
    ],
    examples: [
      "Western Union: 5 users, 2% credits — intentionally throttled while Alan builds Angular GitLab foundation",
      "Nationwide: SSO setup still pending as gate to any real usage",
      "Caesars: Damon + partial staff are the only users; formal onboarding plan not yet established",
    ],
    solutionPaths: [
      "Time-boxed onboarding milestones: 'By week 2 you should have X users doing Y'",
      "Proactive CS intervention when usage is <5% of contracted seats at 30 days",
      "'Start messy' onboarding philosophy — encourage usage before full setup",
    ],
  },
  "enablement-playbook": {
    definition:
      "Customers lack a clear, structured path to success. They're figuring out how to use Builder through trial and error rather than following a proven implementation guide.",
    rootCause:
      "Builder's onboarding assumes a certain technical sophistication and workflow. When customers don't match that profile, there's no adapted path.",
    howToSpot: [
      "Customers asking 'where do we start?' repeatedly",
      "Each account reinventing the same setup steps (design system, rules files, etc.)",
      "Customers quoting 'you have to figure it out yourself'",
    ],
    examples: [
      "Caesars (Damon): 'Our onboarding is not healthy. You kind of have to figure out half the stuff yourself.'",
      "Walmart/Netflix/CBRE/Intuit: Each independently building facsimile design systems with no Builder-provided guide",
    ],
    solutionPaths: [
      "Starter kit library: Angular, React, Vue templates with design system placeholders",
      "Facsimile design system setup guide",
      "Role-specific onboarding paths: Designer track vs. Developer track",
    ],
  },
  "developer-workflow": {
    definition:
      "Developers at the customer organization resist, distrust, or are unable to adapt to the workflow changes that Builder introduces.",
    rootCause:
      "Developers have established workflows, tools, and habits. Builder changes the design-to-dev handoff, introduces AI into their code.",
    howToSpot: [
      "Developers not logging in or engaging with generated code",
      "'Developers don't want to use it' language from CSMs",
      "Design team using it, dev team ignoring it",
    ],
    examples: [
      "ServiceNow: Devs manually copy-paste code into text boxes with no package manager",
      "Anheuser-Busch: Entire team has gone MIA and stopped using Fusion",
      "ClickUp: Agent making unexpected changes is eroding developer trust",
    ],
    solutionPaths: [
      "Developer-specific value framing: 'Builder generates 60% of the code you review — you stay in control'",
      "Code review integration — Builder PRs look like normal PRs",
      "Dev champion program: find one developer per account who is enthusiastic",
    ],
  },
  "ai-agent-trust": {
    definition:
      "The customer does not trust the AI agent's behavior — specifically that it acts within expected boundaries, doesn't make unauthorized changes, and produces reliable output.",
    rootCause:
      "AI agents are non-deterministic and can take actions that users didn't explicitly request.",
    howToSpot: [
      "'Agent made changes I didn't ask for' language",
      "Customer manually reviewing every output before accepting anything",
      "Usage drop-off after a bad AI interaction",
    ],
    examples: [
      "ClickUp: Agent making unauthorized changes to code is the primary reason they've moved to Churn Risk status.",
    ],
    solutionPaths: [
      "Explicit agent permission levels: 'suggest only', 'apply with approval', 'apply autonomously'",
      "Agent action log / audit trail: show exactly what the agent did and why",
      "Undo/rollback for agent actions at the file level",
    ],
  },
  "credit-usage-visibility": {
    definition:
      "Customers don't have clear visibility into how AI credits are being consumed — by whom, on what, and at what rate.",
    rootCause: "Credit tracking is not surfaced clearly in the Builder UI.",
    howToSpot: [
      "Questions about 'how much have we spent?'",
      "Customers manually tracking usage in spreadsheets",
      "Rollout paused 'until we understand the credit model better'",
    ],
    examples: [
      "Intuit (Vibe Code App Store): 'They still don't know what they've spent over 3 weeks'",
      "Western Union: High credit consumption concerns causing Alan to throttle rollout",
    ],
    solutionPaths: [
      "Per-user credit usage dashboard (in-product)",
      "Daily/weekly credit burn rate alerts",
      "Per-project / per-team credit attribution",
    ],
  },
  "code-handoff": {
    definition:
      "Designers can generate code in Builder, but there's no clean, automated path for developers to receive and use that code in their real development environment.",
    rootCause:
      "Builder's Fusion workflow is optimized for the design-to-code generation step, but the 'last mile' of getting prototyped code into a developer's local environment isn't solved.",
    howToSpot: [
      "Zip downloads or manual copy-paste as the current handoff method",
      "'Designers build it but devs can't use it' language",
    ],
    examples: [
      "Walmart: 'Designers are actively building UI prototypes but developers have no clean way to pull that code down.'",
      "Netflix, Intuit, CBRE: All using facsimile design systems as a workaround to production repo connectivity",
    ],
    solutionPaths: [
      "Export-to-PR feature: one click to open a PR from a Builder prototype into a target repo",
      "Developer 'pull' flow: dev can pull Builder-generated code without designer needing git access",
    ],
  },
  "collaboration-workflow": {
    definition:
      "Multiple users working in Builder simultaneously create conflicts, accidental overwrites, or lack of structured review flows.",
    rootCause:
      "Builder's collaboration model wasn't designed for high-concurrency enterprise teams.",
    howToSpot: [
      "Merge conflicts when multiple users work in the same project",
      "Requests for a 'sandbox' environment separate from the main project",
      "Only 1-2 people allowed in at a time due to fear of overwriting",
    ],
    examples: [
      "Swiss Re: Multiple users in different branches causing merge conflicts",
      "Caesars: Product team members making unwanted changes in enterprise git-connected space",
    ],
    solutionPaths: [
      "Branch-per-user or branch-per-feature workflow support",
      "Protected project mode: prototype without write access to main git branch",
      "Role-based permissions within a project",
    ],
  },
  "executive-engagement": {
    definition:
      "The Builder relationship exists only at the practitioner level. There is no executive champion or sponsor who can unblock resources, mandate adoption, or advocate for renewal/expansion.",
    rootCause:
      "Initial deals are often championed by a single designer or tech lead who lacks organizational authority.",
    howToSpot: [
      "Only one team or individual using Builder despite larger org",
      "Admin approvals and IT blockers that don't get escalated",
      "No executive on any customer call",
    ],
    examples: [
      "Walmart: Daniel (Head of AI Transformation) meeting not yet booked",
      "OCBC: End users very happy — but zero CTO/CIO level engagement",
      "KPMG: Frustration building at user level without exec cover to resolve it",
    ],
    solutionPaths: [
      "Executive Business Review (EBR) template: ROI story, usage data, strategic value narrative",
      "Builder exec sponsorship program: pair customer exec with Builder exec",
      "Executive-ready usage reports: non-technical summary of what their teams are building",
    ],
  },
  "stakeholder-bottleneck": {
    definition:
      "A single individual controls the pace of the entire implementation. If they slow down, go quiet, or leave, the whole account stalls.",
    rootCause:
      "Builder is often championed by one motivated individual who becomes the de facto owner of setup, onboarding, and adoption.",
    howToSpot: [
      "One named person mentioned in every update",
      "Usage drops to zero when that person is OOO or disengages",
      "'Waiting for [name]' as the consistent status",
    ],
    examples: [
      "Western Union: Alan (senior designer) controls all onboarding gates.",
      "Anheuser-Busch: Entire Fusion usage depended on John. When he disengaged, usage fell to zero.",
    ],
    solutionPaths: [
      "Stakeholder mapping as part of onboarding: identify 3+ individuals across design, dev, and leadership",
      "Multi-stakeholder check-in cadence",
      "Redundant champion identification: who's the backup if the primary champion leaves?",
    ],
  },
  "legacy-migration-dep": {
    definition:
      "The customer's ability to fully adopt Builder is blocked by an internal migration they haven't yet completed.",
    rootCause:
      "Enterprise platform migrations routinely slip by months or years.",
    howToSpot: [
      "References to AEM, Sitecore, Adobe, or other legacy platforms still in use",
      "'We'll really get started once migration is done' language",
    ],
    examples: [
      "Caesars: Purchased Builder specifically to migrate off AEM. That migration was due last year — still not complete.",
    ],
    solutionPaths: [
      "Decouple Builder value from migration completion — identify use cases that work alongside legacy platform",
      "Parallel running strategy: use Builder for net-new pages/experiences while legacy handles existing",
    ],
  },
  "platform-reliability": {
    definition:
      "Customers experience product bugs, crashes, or unexpected errors that interrupt their workflow.",
    rootCause:
      "Fast-moving product development, edge cases in enterprise environments, or regressions from recent releases.",
    howToSpot: [
      "SOS messages in Slack with error screenshots",
      "Customers filing support tickets for reproducible errors",
      "Feature works for some users but not others (environment-specific)",
    ],
    examples: [
      "Roku: Desktop app fails during dependency install (mise node@22.16.0 download error).",
      "ClickUp: Startup time issues, localhost connection errors",
      "Caesars: Agent stopped mid-task with error — filed a support ticket",
    ],
    solutionPaths: [
      "Customer-facing bug status dashboard: 'Known issues and ETA'",
      "Faster triage SLA for bugs reported by strategic accounts",
      "Desktop app version pinning: let enterprise customers stay on a stable release",
    ],
  },
  "design-system": {
    definition:
      "Builder's ability to generate high-quality, on-brand code is significantly limited because the customer's design system hasn't been connected, doesn't exist, or can't be indexed.",
    rootCause:
      "Many customers buy Builder expecting it to 'just work' with their design. Without a connected design system, Builder generates generic code.",
    howToSpot: [
      "Generated code doesn't match company component library",
      "Customer mentions they 'don't have a design system'",
      "Design system exists but is behind authentication/private artifactory",
    ],
    examples: [
      "WebMD: No design system at all — entirely Figma-to-code only workflow.",
      "Netflix: Design system behind private artifactory — can't be indexed directly.",
    ],
    solutionPaths: [
      "Design system indexing guide: step-by-step for public, private, and artifactory-hosted systems",
      "Private package registry support (npm, artifactory) with token-based auth",
      "Design system 'starter kit': get value immediately with a placeholder system",
    ],
  },
  "performance-latency": {
    definition:
      "Customers or their engineering teams report that Builder's platform is too slow for their workflow to be productive.",
    rootCause:
      "AI inference latency is inherently variable. Enterprise customers with large codebases or high concurrency can hit performance ceilings.",
    howToSpot: [
      "Direct latency complaints from engineering team",
      "Customers measuring and reporting response times",
      "Comparisons to faster competitors",
    ],
    examples: [
      "NTT Data: Engineering team proactively reached out with a technical inquiry about platform latency. They are benchmarking Builder's performance.",
    ],
    solutionPaths: [
      "Latency transparency: show customers estimated response time based on their query complexity",
      "Performance SLA for strategic accounts",
      "Edge caching or regional inference for APAC/EU customers",
    ],
  },
};

export default function ImplBlockersDashboard() {
  const [tab, setTab] = useState<Tab>("by-type");
  const [selectedType, setSelectedType] = useState<BlockerType | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [showResolved, setShowResolved] = useState(true);
  const { send } = useSendToAgentChat();

  const typeSummary = getBlockerTypeSummary();

  const filteredAccounts =
    selectedType !== null
      ? accountData.filter((a) =>
          a.blockers.some(
            (b) =>
              b.type === selectedType &&
              (showResolved || b.status !== "resolved"),
          ),
        )
      : accountData;

  const displayedCompany = selectedCompany
    ? accountData.find((a) => a.company === selectedCompany)
    : null;

  const allBlockerCount = accountData.reduce(
    (acc, a) => acc + a.blockers.filter((b) => b.status === "active").length,
    0,
  );
  const resolvedCount = accountData.reduce(
    (acc, a) => acc + a.blockers.filter((b) => b.status === "resolved").length,
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Strategic Account Implementation Blockers
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sourced from Gong calls (90 days), Slack customer channels, and
            HubSpot — across all 25 strategic accounts. Last updated: April 10,
            2026.
          </p>
        </div>
        <button
          onClick={() =>
            send({
              message: `Please refresh the Strategic Account Implementation Blockers data. Follow these steps exactly for EVERY account:

1. Read \`app/pages/adhoc/impl-blockers/data.ts\` and note the \`lastUpdated\` date for each account.

2. GONG: For each account, check whether the most recent call date is newer than the account's \`lastUpdated\`. If so, the entry is stale — pull transcripts for newer calls and extract new blockers, resolved blockers, and key status changes.

3. SLACK: For each account, find the customer Slack channel (usually #customer-<company>) and fetch recent message history. Look for updates, escalations, or resolved issues newer than \`lastUpdated\`.

4. HUBSPOT: For each account, check contact-level activity dates and any recent email engagement.

5. Cross-reference all three sources. Update \`app/pages/adhoc/impl-blockers/data.ts\` for every stale account: mark resolved blockers as "resolved", update monitoring ones, add newly discovered blockers, and update \`lastUpdated\` to the date of the most recent signal found.

6. Update the 'Last updated' timestamp in \`app/pages/adhoc/impl-blockers/index.tsx\` to today's date.

This file feeds both the impl-blockers dashboard and the ImplBlockersModule on each strategic account page, so updates reflect everywhere.`,
              submit: true,
            })
          }
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-background hover:bg-accent transition-colors whitespace-nowrap shrink-0"
        >
          ↻ Refresh data
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Strategic Accounts"
          value={accountData.length.toString()}
          color="text-foreground"
        />
        <StatCard
          label="Active Blockers"
          value={allBlockerCount.toString()}
          color="text-red-600"
        />
        <StatCard
          label="Blocker Types"
          value={typeSummary.length.toString()}
          color="text-purple-600"
        />
        <StatCard
          label="Resolved"
          value={resolvedCount.toString()}
          color="text-green-600"
        />
      </div>

      <div className="flex items-center gap-2 border-b border-border">
        {(["by-type", "by-company", "dictionary"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              if (t !== "by-type") setSelectedType(null);
              if (t !== "by-company") setSelectedCompany(null);
            }}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
              tab === t
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t === "by-type" && "By Blocker Type"}
            {t === "by-company" && "By Company"}
            {t === "dictionary" && "Dictionary"}
          </button>
        ))}

        {tab !== "dictionary" && (
          <label className="flex items-center gap-1.5 text-sm text-muted-foreground ml-auto cursor-pointer pb-2">
            <input
              type="checkbox"
              checked={showResolved}
              onChange={(e) => setShowResolved(e.target.checked)}
              className="rounded"
            />
            Show resolved
          </label>
        )}
      </div>

      {tab === "by-type" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
              Blocker Types ({typeSummary.length})
            </p>
            {typeSummary
              .filter((t) => showResolved || t.activeCount > 0)
              .map((t) => (
                <button
                  key={t.type}
                  onClick={() =>
                    setSelectedType(selectedType === t.type ? null : t.type)
                  }
                  className={cn(
                    "w-full text-left rounded-lg border p-3 transition-all",
                    selectedType === t.type
                      ? "border-foreground bg-accent"
                      : "border-border hover:border-foreground/40 hover:bg-accent/50",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full border",
                        BLOCKER_TYPE_COLORS[t.type],
                      )}
                    >
                      {t.label}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                      {t.companies.length} co.
                    </span>
                  </div>
                  <div className="flex gap-3 mt-2 text-xs">
                    {t.activeCount > 0 && (
                      <span className="text-red-600 font-medium">
                        {t.activeCount} active
                      </span>
                    )}
                    {t.resolvedCount > 0 && (
                      <span className="text-green-600">
                        {t.resolvedCount} resolved
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5 truncate">
                    {t.companies.slice(0, 4).join(", ")}
                    {t.companies.length > 4
                      ? ` +${t.companies.length - 4}`
                      : ""}
                  </p>
                </button>
              ))}
          </div>

          <div className="lg:col-span-2 space-y-3">
            {selectedType ? (
              <>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
                  {BLOCKER_TYPE_LABELS[selectedType]} — Affected Accounts (
                  {filteredAccounts.length})
                </p>
                {filteredAccounts.map((account) => (
                  <CompanyCard
                    key={account.company}
                    account={account}
                    highlightType={selectedType}
                    showResolved={showResolved}
                  />
                ))}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm">
                <span className="text-3xl mb-2">👈</span>
                Select a blocker type to see affected accounts
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "by-company" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1 mb-2">
              Strategic Accounts ({accountData.length})
            </p>
            {accountData.map((account) => {
              const activeCount = account.blockers.filter(
                (b) => b.status === "active",
              ).length;
              const hasChurnRisk = account.notes
                ?.toLowerCase()
                .includes("churn risk");
              return (
                <button
                  key={account.company}
                  onClick={() =>
                    setSelectedCompany(
                      selectedCompany === account.company
                        ? null
                        : account.company,
                    )
                  }
                  className={cn(
                    "w-full text-left rounded-lg border px-3 py-2 transition-all flex items-center justify-between",
                    selectedCompany === account.company
                      ? "border-foreground bg-accent"
                      : "border-border hover:border-foreground/40 hover:bg-accent/50",
                  )}
                >
                  <span className="text-sm font-medium flex items-center gap-1.5">
                    {hasChurnRisk && (
                      <span title="Churn Risk" className="text-red-500 text-xs">
                        ⚠️
                      </span>
                    )}
                    {account.company}
                  </span>
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-medium",
                      activeCount === 0
                        ? "bg-green-100 text-green-700"
                        : activeCount >= 3
                          ? "bg-red-100 text-red-700"
                          : "bg-orange-100 text-orange-700",
                    )}
                  >
                    {activeCount === 0 ? "✓ clear" : `${activeCount} active`}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-2">
            {displayedCompany ? (
              <CompanyDetail
                account={displayedCompany}
                showResolved={showResolved}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm">
                <span className="text-3xl mb-2">👈</span>
                Select a company to see their blockers
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "dictionary" && <DictionaryView />}

      <div className="border border-border rounded-lg p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Data Sources & Legend
        </p>
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className={cn("w-2 h-2 rounded-full", STATUS_DOT.active)} />
            Active blocker
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className={cn("w-2 h-2 rounded-full", STATUS_DOT.monitoring)}
            />
            Monitoring / in progress
          </span>
          <span className="flex items-center gap-1.5">
            <span className={cn("w-2 h-2 rounded-full", STATUS_DOT.resolved)} />
            Resolved
          </span>
          <span className="ml-4">📞 Gong (90 days)</span>
          <span>💬 Slack (#customer-*)</span>
          <span>🏢 HubSpot CRM</span>
        </div>
      </div>
    </div>
  );
}

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function exportDictionaryCSV() {
  const typeSummary = getBlockerTypeSummary();
  const headers = [
    "Blocker Type ID",
    "Blocker Type Name",
    "Active Accounts Count",
    "Affected Accounts",
    "What It Is (Definition)",
    "Root Cause",
    "How to Spot It",
    "Examples from Current Accounts",
    "Potential Solution Paths",
  ];

  const rows = typeSummary.map((t) => {
    const entry = DICTIONARY[t.type];
    return [
      csvCell(t.type),
      csvCell(t.label),
      csvCell(String(t.activeCount)),
      csvCell(t.companies.join("; ")),
      csvCell(entry.definition),
      csvCell(entry.rootCause),
      csvCell(entry.howToSpot.join("\n")),
      csvCell(entry.examples.join("\n")),
      csvCell(entry.solutionPaths.join("\n")),
    ].join(",");
  });

  const csv = [headers.map(csvCell).join(","), ...rows].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "impl-blocker-dictionary.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function DictionaryView() {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<BlockerType | null>(null);
  const typeSummary = getBlockerTypeSummary();

  const filtered = typeSummary.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const entry = DICTIONARY[t.type];
    return (
      t.label.toLowerCase().includes(q) ||
      entry.definition.toLowerCase().includes(q) ||
      entry.rootCause.toLowerCase().includes(q) ||
      entry.examples.some((e) => e.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-muted-foreground">
          Definitions, root causes, how to identify, and solution paths for each
          of the {typeSummary.length} blocker types.
        </p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search types..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-border rounded-md px-3 py-1.5 text-sm bg-background w-48 focus:outline-none focus:ring-1 focus:ring-foreground/30"
          />
          <button
            onClick={exportDictionaryCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-background hover:bg-accent transition-colors whitespace-nowrap"
          >
            ↓ Export CSV
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((t) => {
          const entry = DICTIONARY[t.type];
          const isOpen = expanded === t.type;
          return (
            <div
              key={t.type}
              className="rounded-lg border border-border overflow-hidden"
            >
              <button
                onClick={() => setExpanded(isOpen ? null : t.type)}
                className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full border shrink-0",
                      BLOCKER_TYPE_COLORS[t.type],
                    )}
                  >
                    {t.label}
                  </span>
                  {!isOpen && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {entry.definition}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {t.activeCount > 0 && (
                    <span className="text-xs text-red-600 font-medium">
                      {t.activeCount} active
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {t.companies.length} accounts
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {isOpen ? "▲" : "▼"}
                  </span>
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-5 space-y-5 border-t border-border bg-muted/20">
                  <div className="pt-4">
                    <p className="text-sm font-semibold text-foreground mb-1">
                      What it is
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {entry.definition}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">
                        Root Cause
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {entry.rootCause}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">
                        How to Spot It
                      </p>
                      <ul className="space-y-1">
                        {entry.howToSpot.map((s, i) => (
                          <li
                            key={i}
                            className="text-sm text-muted-foreground flex gap-2"
                          >
                            <span className="text-foreground/40 shrink-0">
                              •
                            </span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">
                      Examples from Current Accounts
                    </p>
                    <div className="space-y-1.5">
                      {entry.examples.map((ex, i) => (
                        <div key={i} className="flex gap-2 text-sm">
                          <span className="text-blue-500 shrink-0">→</span>
                          <span className="text-muted-foreground">{ex}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">
                      Potential Solution Paths
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                      {entry.solutionPaths.map((s, i) => (
                        <div key={i} className="flex gap-2 text-sm">
                          <span className="text-green-500 shrink-0">✓</span>
                          <span className="text-muted-foreground">{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">
                      Affected Accounts
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {t.companies.map((co) => (
                        <span
                          key={co}
                          className="text-xs px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground"
                        >
                          {co}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("text-3xl font-bold mt-1", color)}>{value}</p>
    </div>
  );
}

function BlockerPill({ type }: { type: BlockerType }) {
  return (
    <span
      className={cn(
        "text-xs font-medium px-2 py-0.5 rounded-full border",
        BLOCKER_TYPE_COLORS[type],
      )}
    >
      {BLOCKER_TYPE_LABELS[type]}
    </span>
  );
}

function SourceBadges({
  sources,
}: {
  sources: ("gong" | "slack" | "hubspot")[];
}) {
  const icons: Record<string, string> = {
    gong: "📞",
    slack: "💬",
    hubspot: "🏢",
  };
  return (
    <span className="flex gap-1">
      {sources.map((s) => (
        <span key={s} className="text-xs" title={s}>
          {icons[s]}
        </span>
      ))}
    </span>
  );
}

function CompanyCard({
  account,
  highlightType,
  showResolved,
}: {
  account: AccountBlockers;
  highlightType?: BlockerType;
  showResolved: boolean;
}) {
  const relevantBlockers = account.blockers.filter(
    (b) =>
      (!highlightType || b.type === highlightType) &&
      (showResolved || b.status !== "resolved"),
  );

  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <div>
        <p className="font-semibold text-sm">{account.company}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {account.hubspotStatus}
        </p>
      </div>
      <div className="space-y-2">
        {relevantBlockers.map((b, i) => (
          <div key={i} className="rounded-md bg-muted/50 p-3 space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={cn(
                    "w-2 h-2 rounded-full shrink-0 mt-0.5",
                    STATUS_DOT[b.status],
                  )}
                />
                <span className="text-sm font-medium">{b.summary}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <SourceBadges sources={b.source} />
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    STATUS_STYLES[b.status],
                  )}
                >
                  {b.status}
                </span>
              </div>
            </div>
            {b.detail && (
              <p className="text-xs text-muted-foreground pl-4">{b.detail}</p>
            )}
            {b.lastUpdated && (
              <p className="text-xs text-muted-foreground/60 pl-4">
                Updated {b.lastUpdated}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CompanyDetail({
  account,
  showResolved,
}: {
  account: AccountBlockers;
  showResolved: boolean;
}) {
  const blockers = account.blockers.filter(
    (b) => showResolved || b.status !== "resolved",
  );
  const activeCount = blockers.filter((b) => b.status === "active").length;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border p-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold">{account.company}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {account.hubspotStatus}
            </p>
          </div>
          <span
            className={cn(
              "text-sm px-3 py-1 rounded-full font-medium",
              activeCount === 0
                ? "bg-green-100 text-green-700"
                : activeCount >= 3
                  ? "bg-red-100 text-red-700"
                  : "bg-orange-100 text-orange-700",
            )}
          >
            {activeCount} active blocker{activeCount !== 1 ? "s" : ""}
          </span>
        </div>
        {account.notes && (
          <div className="mt-3 text-xs text-muted-foreground bg-muted/50 rounded-md p-3">
            <span className="font-medium text-foreground">Notes: </span>
            {account.notes}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {blockers.map((b, i) => (
          <div
            key={i}
            className="rounded-lg border border-border p-4 space-y-2"
          >
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "w-2.5 h-2.5 rounded-full shrink-0",
                    STATUS_DOT[b.status],
                  )}
                />
                <span className="text-sm font-semibold">{b.summary}</span>
              </div>
              <div className="flex items-center gap-2">
                <SourceBadges sources={b.source} />
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    STATUS_STYLES[b.status],
                  )}
                >
                  {b.status}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <BlockerPill type={b.type} />
              {b.lastUpdated && (
                <span className="text-xs text-muted-foreground/60">
                  Updated {b.lastUpdated}
                </span>
              )}
            </div>
            {b.detail && (
              <p className="text-xs text-muted-foreground leading-relaxed pl-1">
                {b.detail}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
