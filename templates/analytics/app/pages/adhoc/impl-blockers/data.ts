// Implementation blocker types
export type BlockerStatus = "active" | "resolved" | "monitoring";
export type BlockerSeverity = "critical" | "high" | "medium" | "low";

export interface Blocker {
  type: BlockerType;
  summary: string;
  detail?: string;
  status: BlockerStatus;
  severity: BlockerSeverity;
  source: ("gong" | "slack" | "hubspot")[];
  lastUpdated?: string;
}

export type BlockerType =
  | "git-integration"
  | "admin-approval-bottleneck"
  | "security-vpn-network"
  | "data-privacy-hosting"
  | "feature-gap"
  | "sso-auth"
  | "onboarding-setup"
  | "enablement-playbook"
  | "developer-workflow"
  | "ai-agent-trust"
  | "credit-usage-visibility"
  | "code-handoff"
  | "collaboration-workflow"
  | "executive-engagement"
  | "stakeholder-bottleneck"
  | "legacy-migration-dep"
  | "platform-reliability"
  | "design-system"
  | "performance-latency";

export const BLOCKER_TYPE_LABELS: Record<BlockerType, string> = {
  "git-integration": "Git Repo Integration",
  "admin-approval-bottleneck": "Admin / Permissions Bottleneck",
  "security-vpn-network": "Security / VPN / Network",
  "data-privacy-hosting": "Data Privacy & Hosting Restrictions",
  "feature-gap": "Feature Gap",
  "sso-auth": "SSO / Auth / IAM",
  "onboarding-setup": "Onboarding & Setup Delays",
  "enablement-playbook": "Enablement & Playbook Gaps",
  "developer-workflow": "Developer Workflow Resistance",
  "ai-agent-trust": "AI Agent Trust / Behavior",
  "credit-usage-visibility": "Credit & Usage Visibility",
  "code-handoff": "Designer → Developer Code Handoff",
  "collaboration-workflow": "Collaboration Workflow Gaps",
  "executive-engagement": "Executive Engagement",
  "stakeholder-bottleneck": "Single Stakeholder Bottleneck",
  "legacy-migration-dep": "Legacy Platform Migration Dependency",
  "platform-reliability": "Platform Reliability / Bugs",
  "design-system": "Design System Not Connected",
  "performance-latency": "Performance / Latency",
};

export const BLOCKER_TYPE_COLORS: Record<BlockerType, string> = {
  "git-integration": "bg-orange-100 text-orange-800 border-orange-200",
  "admin-approval-bottleneck": "bg-amber-100 text-amber-800 border-amber-200",
  "security-vpn-network": "bg-red-100 text-red-800 border-red-200",
  "data-privacy-hosting": "bg-rose-100 text-rose-800 border-rose-200",
  "feature-gap": "bg-purple-100 text-purple-800 border-purple-200",
  "sso-auth": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "onboarding-setup": "bg-blue-100 text-blue-800 border-blue-200",
  "enablement-playbook": "bg-sky-100 text-sky-800 border-sky-200",
  "developer-workflow": "bg-pink-100 text-pink-800 border-pink-200",
  "ai-agent-trust": "bg-violet-100 text-violet-800 border-violet-200",
  "credit-usage-visibility": "bg-teal-100 text-teal-800 border-teal-200",
  "code-handoff": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "collaboration-workflow": "bg-cyan-100 text-cyan-800 border-cyan-200",
  "executive-engagement": "bg-rose-100 text-rose-800 border-rose-200",
  "stakeholder-bottleneck":
    "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
  "legacy-migration-dep": "bg-stone-100 text-stone-800 border-stone-200",
  "platform-reliability": "bg-gray-100 text-gray-800 border-gray-200",
  "design-system": "bg-lime-100 text-lime-800 border-lime-200",
  "performance-latency": "bg-emerald-100 text-emerald-800 border-emerald-200",
};

export interface AccountBlockers {
  company: string;
  hubspotStatus: string;
  blockers: Blocker[];
  notes?: string;
}

export const accountData: AccountBlockers[] = [
  {
    company: "Walmart",
    hubspotStatus: "Active — Fusion Expansion ($500K)",
    blockers: [
      {
        type: "code-handoff",
        summary:
          "Designer → Developer handoff improving — Living Design Kit in progress",
        detail:
          "Pim is building an official 'Living Design Kit' starter template for designers. Template inheritance bug fixed. ~60 designers onboarded. First true eng+design collaboration now happening.",
        status: "monitoring",
        severity: "high",
        source: ["slack", "gong"],
        lastUpdated: "Apr 1, 2026",
      },
      {
        type: "developer-workflow",
        summary:
          "Designers don't want to use git repos — but collaboration now starting",
        detail:
          "Apr 1: Ratul's org and Pim's org are now actively collaborating and planning a unified onsite in Bentonville (week of April 20). Designer git aversion remains but is being worked around.",
        status: "monitoring",
        severity: "medium",
        source: ["slack"],
        lastUpdated: "Apr 1, 2026",
      },
      {
        type: "git-integration",
        summary:
          "Cannot connect to production repos — facsimile design systems",
        detail:
          "Walmart's design team uses a facsimile design system rather than connecting real component libraries.",
        status: "active",
        severity: "high",
        source: ["gong"],
        lastUpdated: "Apr 1, 2026",
      },
      {
        type: "enablement-playbook",
        summary:
          "No best practice for starter kits / facsimile design system setup",
        detail:
          "Mentioned across Walmart, Netflix, Intuit, CBRE: customers are each reinventing the design system setup process.",
        status: "active",
        severity: "high",
        source: ["gong"],
        lastUpdated: "Apr 1, 2026",
      },
      {
        type: "security-vpn-network",
        summary:
          "builder.io.xyz + fly.dev blocked by Walmart McAfee firewall — critical escalation",
        detail:
          "Apr 6-10: builder.io.xyz (Kubernetes container cluster) and fly.dev blocked by Walmart's McAfee-based firewall. Urgent internal Builder meeting called Apr 6. GCP self-hosting discussed as longer-term solution.",
        status: "active",
        severity: "critical",
        source: ["slack", "gong"],
        lastUpdated: "Apr 10, 2026",
      },
      {
        type: "executive-engagement",
        summary:
          "VP-level engagement growing — Jason Armstrong new contract POC",
        detail:
          "Apr 9: Jason Armstrong confirmed as primary POC. Both Ratul's org and Pim's org collaborating, April 20 Bentonville onsite planned.",
        status: "monitoring",
        severity: "medium",
        source: ["slack", "gong"],
        lastUpdated: "Apr 9, 2026",
      },
    ],
    notes:
      "Apr 10 EOW: builder.io.xyz and fly.dev both blocked by McAfee — urgent escalation. Apr 20 Bentonville eng+design onsite confirmed.",
  },
  {
    company: "Thales",
    hubspotStatus: "Active — New customer (Closed Won $87K)",
    blockers: [
      {
        type: "onboarding-setup",
        summary:
          "Onboarding progressing — governance and permission boundaries emerging as next challenge",
        detail:
          "Apr 10 call: Multiple team members now onboarding. Governance track underway: team discussing how to split responsibilities and permission boundaries across projects/roles.",
        status: "monitoring",
        severity: "low",
        source: ["slack", "gong"],
        lastUpdated: "Apr 10, 2026",
      },
      {
        type: "collaboration-workflow",
        summary:
          "Governance and permission model — who controls what across projects",
        detail:
          "Apr 10: Team working through parallel discussions on governance: how to split responsibilities within the team, permission boundaries between users.",
        status: "monitoring",
        severity: "low",
        source: ["gong"],
        lastUpdated: "Apr 10, 2026",
      },
    ],
    notes:
      "Apr 10 call: Governance track emerging as team scales onboarding. Strong overall momentum.",
  },
  {
    company: "ServiceNow",
    hubspotStatus: "Active — Reheat deal ($65K)",
    blockers: [
      {
        type: "admin-approval-bottleneck",
        summary:
          "GitHub Enterprise connection still blocked — legal AND security review now required",
        detail:
          "Apr 7: GitHub access remains blocked. 'It's a lot longer process than originally expected — there's legal stuff as well as security.' Attempting to arrange a three-way meeting to find a less intrusive path.",
        status: "active",
        severity: "high",
        source: ["gong", "slack"],
        lastUpdated: "Apr 7, 2026",
      },
      {
        type: "admin-approval-bottleneck",
        summary: "Figma admin approval pending",
        detail:
          "Figma integration requires an admin-level approval that has not been granted.",
        status: "active",
        severity: "medium",
        source: ["gong"],
      },
      {
        type: "developer-workflow",
        summary:
          "DT + product team merger creating workflow confusion — is GitHub even the right path?",
        detail:
          "Apr 7: ServiceNow recently merged their DT team with the product team. Now unclear whether they will use the design system at all, or what their dev workflow looks like going forward.",
        status: "active",
        severity: "critical",
        source: ["slack", "gong"],
        lastUpdated: "Apr 7, 2026",
      },
      {
        type: "enablement-playbook",
        summary: "No playbook for legacy-heavy / non-standard dev environments",
        detail:
          "Builder's onboarding assumes modern dev workflows. ServiceNow's environment is so non-standard that standard onboarding doesn't apply.",
        status: "active",
        severity: "high",
        source: ["slack"],
      },
    ],
    notes:
      "Apr 7: GitHub blocked by legal + security. DT+product team merger causing confusion. Internal Builder alignment sync scheduled for Apr 14.",
  },
  {
    company: "Optum/UHG",
    hubspotStatus: "Active — PharmacyRX Fusion ($96K)",
    blockers: [
      {
        type: "sso-auth",
        summary:
          "SSO implementation contact still not identified — IDP unknown",
        detail:
          "Team asking what IDP Optum uses, still trying to get intro to SSO implementation contact from Mike. SSO contact sourcing remains stuck.",
        status: "active",
        severity: "high",
        source: ["slack"],
        lastUpdated: "Mar 30, 2026",
      },
      {
        type: "security-vpn-network",
        summary:
          "Domain whitelisting — small movement, looped into email with URL questions",
        detail:
          "Apr 7: 'Finally have small movement on Optum — looped into email with questions about URLs/domains to whitelist.' Still blocked on whitelisting but first concrete step toward resolution.",
        status: "active",
        severity: "high",
        source: ["slack"],
        lastUpdated: "Apr 7, 2026",
      },
    ],
    notes:
      "Apr 7: Small movement — email thread opened with specific URL/domain whitelisting questions. SSO contact still unidentified.",
  },
  {
    company: "Netflix",
    hubspotStatus: "Active — Fusion Renewal ($90K, renews 1/18/27)",
    blockers: [
      {
        type: "code-handoff",
        summary:
          "Production repo connectivity blocked — using facsimile design systems",
        detail:
          "Netflix uses a facsimile component library because live repos can't be connected.",
        status: "active",
        severity: "high",
        source: ["gong"],
        lastUpdated: "Mar 26, 2026",
      },
      {
        type: "design-system",
        summary: "Design system behind private artifactory — cannot be indexed",
        detail:
          "Netflix's design system may be behind a private artifactory instance. Can't index it directly without authentication/proxy support.",
        status: "active",
        severity: "medium",
        source: ["gong"],
        lastUpdated: "Mar 26, 2026",
      },
    ],
    notes:
      "Mar 26: Kylo deployed a prototype using Hawkins Design System — positive momentum. Private artifactory still an issue.",
  },
  {
    company: "Nasdaq",
    hubspotStatus:
      "Active — Fusion Renewal ($65K, renews 10/30/26) + expansion 30→80 users",
    blockers: [
      {
        type: "feature-gap",
        summary: "Privacy mode concerns — resolved, retro pending",
        detail:
          "Edwin raised concerns about privacy mode effort/complexity. Mar 24 Slack: ticket largely resolved minus retro.",
        status: "resolved",
        severity: "medium",
        source: ["slack", "gong"],
        lastUpdated: "Apr 2, 2026",
      },
      {
        type: "git-integration",
        summary:
          "Starter templates + GitLab registry — partially resolved, PAT/deploy token support still open",
        detail:
          "Apr 9: Starter templates now carry over env variables/settings when connected to GitLab — confirmed working. NEW open item: PAT/deploy tokens for starter template repos.",
        status: "monitoring",
        severity: "medium",
        source: ["slack"],
        lastUpdated: "Apr 9, 2026",
      },
    ],
    notes:
      "Apr 9: Most GitLab issues resolved. New open item: PAT/deploy tokens for starter template repos. Expansion 30→80 users actively negotiated.",
  },
  {
    company: "KPMG",
    hubspotStatus: "Active — Renewal 9/14/26",
    blockers: [
      {
        type: "security-vpn-network",
        summary:
          "VPN/firewall allowlist — workaround applied but additional users still affected",
        detail:
          "Apr 8: User arokde@kpmg.com still getting VPN access errors. Root cause: builder.io.xyz container URLs blocked by KPMG network AI policy. Hosting URL switched as workaround.",
        status: "monitoring",
        severity: "medium",
        source: ["slack", "gong"],
        lastUpdated: "Apr 8, 2026",
      },
      {
        type: "executive-engagement",
        summary:
          "Christina Show & Tell next week — identifying additional AIQ projects for Builder",
        detail:
          "Apr 8: Christina presenting in internal KPMG Show & Tell next week about her success using Builder. The design that took 2-2.5 weeks normally was done in 5 hours.",
        status: "monitoring",
        severity: "low",
        source: ["slack", "gong"],
        lastUpdated: "Apr 8, 2026",
      },
    ],
    notes:
      "NEXT WEEK (Apr 14-18): Christina presenting internally at KPMG Show & Tell. Apr 2 BIG WIN: Christina shipped live site in 5 hours vs. 2-2.5 weeks normally.",
  },
  {
    company: "Intuit",
    hubspotStatus: "Active — Expansion $1.69M (Closed Won) + Fusion $205K",
    blockers: [
      {
        type: "credit-usage-visibility",
        summary:
          "Vibe Code App Store team still blind to credit spend (confirmed Mar 26)",
        detail:
          "'They still don't know what they've spent over 3 weeks.' Data is in BigQuery but access/visibility pathway for their team is unclear.",
        status: "active",
        severity: "high",
        source: ["slack"],
        lastUpdated: "Mar 26, 2026",
      },
      {
        type: "sso-auth",
        summary: "Login issues for some Intuit product designers",
        detail:
          "Muyi (Product Designer) and others experiencing login issues. Redirected to support.",
        status: "monitoring",
        severity: "medium",
        source: ["slack"],
        lastUpdated: "Apr 9, 2026",
      },
      {
        type: "code-handoff",
        summary: "Production repo connectivity — facsimile components in use",
        detail:
          "Intuit uses facsimile design components as a workaround to the production connectivity problem.",
        status: "active",
        severity: "high",
        source: ["gong"],
        lastUpdated: "Mar 31, 2026",
      },
    ],
    notes:
      "Apr 9: NPS Score 10 from samir_safi2@intuit.com — 'It's amazing to work with.' VPC opportunity emerging.",
  },
  {
    company: "Deloitte",
    hubspotStatus: "Active — Multiple deals, recent renewal",
    blockers: [
      {
        type: "onboarding-setup",
        summary:
          "Workshop completed Mar 25 — strong engagement, expansion plan being built",
        detail:
          "Mar 25 workshop: Strong technical questions. Great feedback from Bernie. Apr 1: Expansion plan being built, AE looping in leadership.",
        status: "monitoring",
        severity: "low",
        source: ["slack", "gong"],
        lastUpdated: "Apr 1, 2026",
      },
      {
        type: "enablement-playbook",
        summary:
          "Anthropic enterprise license + broad AI competition — differentiation critical",
        detail:
          "Apr 9: Builder ran a session with 40+ engineers from Deloitte Africa team. Mar 20: Deloitte purchased an enterprise-wide Anthropic license. Builder needs to differentiate vs. Anthropic for the consulting use case.",
        status: "active",
        severity: "high",
        source: ["slack"],
        lastUpdated: "Apr 9, 2026",
      },
    ],
    notes:
      "Apr 9: 40+ engineers from Deloitte Africa team session. COMPETITIVE THREAT: Anthropic enterprise-wide license purchased Mar 20.",
  },
  {
    company: "CBRE",
    hubspotStatus: "Active — Multiple expansions, User Expansion Q2",
    blockers: [
      {
        type: "feature-gap",
        summary: "Per-user credit usage tracking — marked Blocked in JIRA",
        detail:
          "CBRE needs per-user credit tracking to report internally and demonstrate ROI.",
        status: "active",
        severity: "high",
        source: ["slack"],
        lastUpdated: "Apr 1, 2026",
      },
      {
        type: "feature-gap",
        summary:
          "'Lines of code accepted' metric missing — marked Blocked in JIRA",
        detail:
          "CBRE wants to track lines of code accepted as a developer productivity metric.",
        status: "active",
        severity: "medium",
        source: ["slack"],
        lastUpdated: "Apr 1, 2026",
      },
      {
        type: "git-integration",
        summary: "Azure DevOps PR metrics — cumbersome to query separately",
        detail:
          "Spent over an hour in calls discussing PR metrics. CBRE not happy about having to query AzureDevOps separately.",
        status: "monitoring",
        severity: "medium",
        source: ["slack"],
        lastUpdated: "Apr 1, 2026",
      },
      {
        type: "code-handoff",
        summary: "Production repo connectivity — facsimile design system",
        detail:
          "CBRE is one of multiple accounts using a facsimile design system instead of connecting real production repos.",
        status: "active",
        severity: "high",
        source: ["gong"],
        lastUpdated: "Apr 1, 2026",
      },
      {
        type: "executive-engagement",
        summary:
          "Daiva VP Engineering meeting CONFIRMED — expansion blocked pending metrics clarity",
        detail:
          "Apr 9: AE waiting to push Karthik on expansion until metrics/overages/model issue clarified. Daiva (VP Engineering) meeting confirmed for Apr 14.",
        status: "monitoring",
        severity: "medium",
        source: ["slack", "gong"],
        lastUpdated: "Apr 9, 2026",
      },
      {
        type: "credit-usage-visibility",
        summary:
          "Figma import triggering expensive model switch — confirmed + under investigation",
        detail:
          "Apr 9 Gong: Confirmed pattern — when users import large Figma designs, Builder switches to high-context model. The expensive context window then persists for the entire subsequent conversation.",
        status: "active",
        severity: "medium",
        source: ["slack", "gong"],
        lastUpdated: "Apr 9, 2026",
      },
    ],
    notes:
      "Apr 9: AE holding expansion push until metrics/overage/model issues clarified. Apr 14: Daiva (VP Engineering) meeting confirmed. 32 Gong calls in 90 days — highest engagement.",
  },
  {
    company: "Anheuser-Busch",
    hubspotStatus: "Active — Multiple expansions ($15K + $81K + more)",
    blockers: [
      {
        type: "developer-workflow",
        summary:
          "Key users moved to BEES agency — trial shutdown being discussed",
        detail:
          "Mar 13 Slack: John and Phil (former VP Eng) are now at BEES — AB InBev's B2B digital commerce agency. Last usage Feb 20 by justin.licari@labatt.com.",
        status: "active",
        severity: "critical",
        source: ["slack"],
        lastUpdated: "Mar 13, 2026",
      },
      {
        type: "stakeholder-bottleneck",
        summary: "All champions gone — Jeff email bounced, Trae still ghosting",
        detail:
          "Apr 7: Jeff (former champion) email bounced — he is now at MilliporeSigma. Another outreach attempt sent to Trae (still at AB) on Apr 7. No active users since Feb 20.",
        status: "active",
        severity: "critical",
        source: ["slack"],
        lastUpdated: "Apr 7, 2026",
      },
    ],
    notes:
      "Apr 7: Jeff's email bounced — confirmed now at MilliporeSigma. All original champions have left or disengaged. Last usage Feb 20.",
  },
  {
    company: "Amazon",
    hubspotStatus: "Active — Katal Design Team ($62K) + multiple teams",
    blockers: [
      {
        type: "security-vpn-network",
        summary: "Amazon infosec approval — RESOLVED",
        detail:
          "Builder was officially approved by Amazon infosec. This was a long-standing blocker that has now been cleared.",
        status: "resolved",
        severity: "critical",
        source: ["slack"],
        lastUpdated: "Apr 1, 2026",
      },
      {
        type: "feature-gap",
        summary:
          "Publish NOT moving forward — Amazon deprioritized due to roadmap conflicts",
        detail:
          "Apr 9: Amazon team confirmed they are NOT moving forward with Publish at this time. 'We have a lot of things happening on our roadmap and competing priorities.'",
        status: "resolved",
        severity: "medium",
        source: ["gong"],
        lastUpdated: "Apr 9, 2026",
      },
      {
        type: "enablement-playbook",
        summary:
          "NEW: Fusion for design system migration — Katal → Cloudscape is the primary use case",
        detail:
          "Apr 9: Dave (Amazon) revealed that the primary opportunity is using Fusion to help migrate design systems from Katal to Cloudscape.",
        status: "monitoring",
        severity: "medium",
        source: ["gong"],
        lastUpdated: "Apr 9, 2026",
      },
    ],
    notes:
      "Apr 9: PIVOT — Publish NOT moving forward. NEW primary use case: Fusion to migrate Katal → Cloudscape design systems. Strong cross-org expansion potential.",
  },
  {
    company: "Western Union",
    hubspotStatus: "Active — Fusion ($52K, renewal 10/31/26)",
    blockers: [
      {
        type: "onboarding-setup",
        summary:
          "Self-imposed 'setup before we use' gate — low usage by design",
        detail:
          "Mar 30: Alan has built out the design system internally and is working on Angular template foundation. Still gating broader rollout until that's complete.",
        status: "active",
        severity: "high",
        source: ["slack", "gong"],
        lastUpdated: "Mar 30, 2026",
      },
      {
        type: "stakeholder-bottleneck",
        summary: "Alan (senior designer) is sole driver and gatekeeper",
        detail:
          "All onboarding is gated through Alan. He's engaged but creating a single point of failure.",
        status: "active",
        severity: "high",
        source: ["gong"],
        lastUpdated: "Mar 30, 2026",
      },
      {
        type: "security-vpn-network",
        summary:
          "Two-layer network blocker: Node.js cert layer PLUS builder.io.xyz domain blocking",
        detail:
          "Apr 7: Root cause identified — Node.js needs explicit permission to use WU's internal security certificate. Additionally, builder.io.xyz domain blocked by their firewall.",
        status: "active",
        severity: "critical",
        source: ["gong"],
        lastUpdated: "Apr 7, 2026",
      },
      {
        type: "git-integration",
        summary: "Angular GitLab template project still in progress",
        detail:
          "Alan is building a default GitLab project with Angular root as the standard starting point for developers.",
        status: "monitoring",
        severity: "medium",
        source: ["slack"],
        lastUpdated: "Mar 30, 2026",
      },
      {
        type: "credit-usage-visibility",
        summary: "High AI credit consumption concerns",
        detail:
          "WU concerned about burn rate. Rollover model not yet explained to Alan. Causing hesitation on broader rollout.",
        status: "active",
        severity: "medium",
        source: ["slack"],
        lastUpdated: "Mar 30, 2026",
      },
      {
        type: "executive-engagement",
        summary: "Darius (VP) not engaged; Nate's engagement has dwindled",
        detail:
          "No active executive sponsor. UX leader Nate's engagement has dropped off.",
        status: "active",
        severity: "high",
        source: ["gong"],
        lastUpdated: "Mar 30, 2026",
      },
      {
        type: "developer-workflow",
        summary:
          "Moving team away from Figma toward Builder — change management challenge",
        detail:
          "Alan is deliberately migrating UX team workflows from Figma to Builder.",
        status: "monitoring",
        severity: "medium",
        source: ["slack"],
        lastUpdated: "Mar 30, 2026",
      },
    ],
    notes:
      "Apr 7: Two-layer blocker identified — Node.js cert issue PLUS builder.io.xyz domain blocked. 5 people, 2% credit usage — highly throttled.",
  },
  {
    company: "WebMD",
    hubspotStatus: "Multiple past lost deals; actively using Fusion",
    blockers: [
      {
        type: "design-system",
        summary: "No design system — Figma-to-code only workflow",
        detail:
          "WebMD has no design system to connect. Relying entirely on Figma-to-code. Limits what Builder can do for them long-term.",
        status: "active",
        severity: "medium",
        source: ["slack"],
        lastUpdated: "Apr 1, 2026",
      },
      {
        type: "data-privacy-hosting",
        summary: "Cannot host sensitive data in Builder infrastructure",
        detail:
          "Security/compliance constraint prevents WebMD from hosting sensitive healthcare content within Builder's platform.",
        status: "active",
        severity: "medium",
        source: ["slack"],
        lastUpdated: "Apr 1, 2026",
      },
    ],
    notes:
      "Apr 1 Slack: Contact research in progress. No new technical blockers.",
  },
  {
    company: "Swiss Re",
    hubspotStatus:
      "Active — Fusion Renewal ($2K base, renews 10/30/26) + Expansion $100K qualified",
    blockers: [
      {
        type: "git-integration",
        summary:
          "ADO OAuth grants — implementation confirmed, official docs still needed",
        detail:
          "Apr 5: Builder confirmed ADO integration supports 'authorization code grant' and 'refresh token grant.' Customer still needs official documentation link for their IT approval process.",
        status: "monitoring",
        severity: "medium",
        source: ["slack"],
        lastUpdated: "Apr 5, 2026",
      },
      {
        type: "sso-auth",
        summary: "External role mapping to Builder roles (IAM integration)",
        detail:
          "Swiss Re wants to map externally provisioned IAM roles to Builder roles (admin, editor). Also needs: builder user as commit author, and user activity logging for compliance.",
        status: "active",
        severity: "medium",
        source: ["slack"],
        lastUpdated: "Mar 2026",
      },
      {
        type: "collaboration-workflow",
        summary:
          "Concurrent multi-user branching + prototype handoff workflow — expansion prep underway",
        detail:
          "Apr 3-5: Active expansion prep happening. SDLC profile compiled. Swiss Re uses Figma (transitioning from Sketch), with prototype handoff workaround.",
        status: "active",
        severity: "medium",
        source: ["slack"],
        lastUpdated: "Apr 5, 2026",
      },
    ],
    notes:
      "Apr 3-5: SERIOUS EXPANSION PREP underway. SDLC profile compiled. ADO OAuth grant types confirmed — still need official docs link.",
  },
  {
    company: "Schneider Electric",
    hubspotStatus: "Active — Multiple expansions ($157K + $263K RFP + more)",
    blockers: [
      {
        type: "platform-reliability",
        summary:
          "Dropdown in content list bug (Issue #828) — sprint slippage risk",
        detail:
          "Bug scheduled for Mar 24–Apr 6 sprint. Customer is sensitive to further delays.",
        status: "active",
        severity: "high",
        source: ["slack"],
        lastUpdated: "Apr 2, 2026",
      },
      {
        type: "feature-gap",
        summary: "External developer access beyond contracted team",
        detail:
          "Devs outside Schneider's direct business unit want access to Fusion. Current access model doesn't easily accommodate this.",
        status: "active",
        severity: "medium",
        source: ["slack"],
        lastUpdated: "Apr 2, 2026",
      },
      {
        type: "feature-gap",
        summary:
          "Copilot + Builder MCP — strat call happened, internal discovery call being scheduled",
        detail:
          "Apr 3: Copilot MCP discussed on strat call. Next steps: set up 15-min internal call to confirm what is known and identify gaps.",
        status: "monitoring",
        severity: "medium",
        source: ["slack"],
        lastUpdated: "Apr 3, 2026",
      },
    ],
    notes:
      "Apr 10: BILLING RISK — Akash (Schneider) emailed threatening service disruption over invoices that were supposed to be waived. Urgent resolution needed.",
  },
  {
    company: "Roku",
    hubspotStatus: "Active — Fusion ($24K)",
    blockers: [
      {
        type: "platform-reliability",
        summary:
          "Desktop app dependency install failure (mise/node version error)",
        detail:
          "Eileen sent SOS: desktop app fails during dependency install (mise node@22.16.0 download). Engineering notified.",
        status: "active",
        severity: "high",
        source: ["slack"],
        lastUpdated: "Apr 3, 2026",
      },
      {
        type: "platform-reliability",
        summary:
          "'Apply Visual Changes' button not working (Design→Interact tab)",
        detail:
          "'Select element with a prompt' works as a workaround, but the direct button does not apply changes.",
        status: "monitoring",
        severity: "medium",
        source: ["slack"],
        lastUpdated: "Apr 3, 2026",
      },
      {
        type: "developer-workflow",
        summary:
          "Backends too complex for Builder — scoping to UI/frontend layer only",
        detail:
          "Apr 7: Roku's backends are too complex to spin up with Builder. Their approach: mock APIs/data externally and use Builder only for the UI/frontend layer.",
        status: "monitoring",
        severity: "medium",
        source: ["slack"],
        lastUpdated: "Apr 7, 2026",
      },
    ],
    notes:
      "Apr 7: Scope confirmed — backends too complex for Builder, UI/frontend only use case. First production app live (password reset).",
  },
  {
    company: "Rakuten",
    hubspotStatus: "Active — Rakuten Kobo ($57K) + Rakuten Holdings ($30K)",
    blockers: [
      {
        type: "credit-usage-visibility",
        summary: "Billing overage dispute — charged more than expected",
        detail:
          "Apr 1 Slack: Customer flagged discrepancy between total logged user count and what was billed for overages.",
        status: "active",
        severity: "high",
        source: ["slack"],
        lastUpdated: "Apr 3, 2026",
      },
      {
        type: "ai-agent-trust",
        summary:
          "Formal vendor lock-in risk assessment sent — concerned about platform dependency",
        detail:
          "Apr 3 Slack: Customer sent written risk assessment: 'If Builder.io becomes central to our operations, there is a possibility of significant losses should it be discontinued.'",
        status: "active",
        severity: "high",
        source: ["slack"],
        lastUpdated: "Apr 3, 2026",
      },
    ],
    notes:
      "RISK (Apr 3): Customer sent formal vendor lock-in risk assessment. Billing overage dispute ongoing. Expansion being invoiced.",
  },
  {
    company: "OCBC Bank",
    hubspotStatus: "Active — Renewal 10/30/26 ($75K)",
    blockers: [
      {
        type: "security-vpn-network",
        summary:
          "Enterprise bank security policy restricts to VS Code extension only",
        detail:
          "Security policy prevents desktop app, Chrome extension, and web app usage. Only VS Code extension is permitted. Missing major features as a result.",
        status: "active",
        severity: "critical",
        source: ["gong"],
        lastUpdated: "Mar 24, 2026",
      },
      {
        type: "data-privacy-hosting",
        summary: "China risk bank — strict data handling constraints",
        detail:
          "As a China risk-category bank, OCBC faces additional data residency and handling requirements.",
        status: "active",
        severity: "high",
        source: ["gong"],
        lastUpdated: "Mar 26, 2026",
      },
      {
        type: "platform-reliability",
        summary:
          "VS Code extension EPERM error (v0.2.38) + fetch errors blocking users",
        detail:
          "Mar 18/24: EPERM error in extension v0.2.38 blocking onboarding. Mar 23: fetch errors blocking several team members. Mar 24: Aziz pushed a fix before the call and it worked.",
        status: "monitoring",
        severity: "high",
        source: ["slack"],
        lastUpdated: "Mar 24, 2026",
      },
      {
        type: "feature-gap",
        summary: "Design → Figma export not available in VS Code extension",
        detail:
          "Mar 24: Team needs a way to bring designs from Builder back to Figma. No Chrome extension allowed. VS Code extension doesn't support this export.",
        status: "active",
        severity: "high",
        source: ["gong", "slack"],
        lastUpdated: "Mar 24, 2026",
      },
      {
        type: "feature-gap",
        summary: "Multi-repo workspace — RESOLVED, docs shared, team ramping",
        detail:
          "Mar 26: Team 'recently unblocked' on multi-repo/monorepo setup. Docs and recordings shared.",
        status: "resolved",
        severity: "medium",
        source: ["gong", "slack"],
        lastUpdated: "Mar 26, 2026",
      },
      {
        type: "executive-engagement",
        summary: "End users happy but no C-level/CTO/CIO engagement yet",
        detail:
          "End users positive, good quality output. But no executive engagement at CTO/CIO level.",
        status: "active",
        severity: "medium",
        source: ["gong"],
        lastUpdated: "Mar 26, 2026",
      },
    ],
    notes:
      "Mar 26: Team 'recently unblocked' on multi-repo. EPERM fix pushed. 23 Gong calls in 90 days. Singapore-based, China risk bank.",
  },
  {
    company: "NTT Data",
    hubspotStatus: "Active — New Deal ($60K, renewal 10/16/26)",
    blockers: [
      {
        type: "git-integration",
        summary: "GitLab Enterprise connection failing — credential issues",
        detail:
          "Integration with their GitLab Enterprise instance is failing on credentials. Initial setup completed but GitLab connection is unstable.",
        status: "active",
        severity: "high",
        source: ["slack"],
        lastUpdated: "Mar 2026",
      },
      {
        type: "performance-latency",
        summary: "Platform latency/performance inquiry from NTT engineering",
        detail:
          "NTT raised a technical inquiry specifically about platform latency and infrastructure performance. They are analyzing our infrastructure.",
        status: "active",
        severity: "medium",
        source: ["slack"],
        lastUpdated: "Mar 2026",
      },
    ],
    notes:
      "GitLab Enterprise + Android Compose (native mobile) integration are key differentiators for this account.",
  },
  {
    company: "Nationwide",
    hubspotStatus: "Active — New Deal ($65K, Dec 2025)",
    blockers: [
      {
        type: "sso-auth",
        summary: "SSO + network ports fully resolved — team is in",
        detail:
          "Feb 13 Slack: Jordan Lloyd added as Builder space admin to finalize Entra/SAML settings. Feb 23 Gong: SSO confirmed working. As of Apr 1, all 20 users have access.",
        status: "resolved",
        severity: "medium",
        source: ["gong", "slack"],
        lastUpdated: "Apr 1, 2026",
      },
      {
        type: "design-system",
        summary:
          "Bolt design system indexing in progress — deep onboarding underway",
        detail:
          "Feb 24 Gong: Nationwide connecting their Bolt component library so Builder AI has context on components. Key stakeholder: Brian Greene (head of design system).",
        status: "monitoring",
        severity: "medium",
        source: ["gong", "slack"],
        lastUpdated: "Feb 24, 2026",
      },
      {
        type: "onboarding-setup",
        summary:
          "Training in progress — designers struggling with dev-heavy UX, desktop app download friction",
        detail:
          "Apr 8: Some users not installed until Mon/Tue. Designers feeling overwhelmed by 'developer-y' parts. Desktop app download popup alarming users. Branch hang issue discovered.",
        status: "monitoring",
        severity: "medium",
        source: ["gong", "slack"],
        lastUpdated: "Apr 9, 2026",
      },
    ],
    notes:
      "Apr 9: Internal planning call being scheduled. Apr 8: Training friction — designers overwhelmed. Apr 2 training completed. SSO + Firebase fully resolved.",
  },
  {
    company: "J.D. Power",
    hubspotStatus: "Active — Fusion ($54K, renewal 10/26/26)",
    blockers: [
      {
        type: "feature-gap",
        summary:
          "Multi-repo workspace — docs sent, Seamus engaged and about to start using Builder heavily",
        detail:
          "Apr 10: Competitor is GitHub Copilot — 'makes us more able to be competitive.' Mar 31: Multi-repo support docs sent via email. Seamus confirmed he plans to start using it this week.",
        status: "monitoring",
        severity: "high",
        source: ["slack", "gong"],
        lastUpdated: "Apr 10, 2026",
      },
      {
        type: "onboarding-setup",
        summary:
          "Exec reset meeting Apr 10 — 'The Opportunity: reset the vision for Fusion'",
        detail:
          "Apr 10: New exec meeting happening today with Taylor and Adam (Builder leadership). Agenda: 'Welcome & Intros to Taylor // Adam, The Opportunity — reset the vision for Fusion.'",
        status: "monitoring",
        severity: "medium",
        source: ["slack", "gong"],
        lastUpdated: "Apr 10, 2026",
      },
    ],
    notes:
      "Apr 10 (TODAY): Exec meeting happening — resetting vision for Fusion with Taylor/Adam. Competitor is GitHub Copilot (NOT Cursor).",
  },
  {
    company: "ClickUp",
    hubspotStatus: "Closed Lost (multiple past attempts) — Churn Risk",
    blockers: [
      {
        type: "platform-reliability",
        summary: "Environment setup issues (startup times, localhost errors)",
        detail:
          "Customer running into slow startup times, localhost connection errors. Usage has nearly dropped to zero. Apr 3: Active re-engagement meeting happened.",
        status: "active",
        severity: "critical",
        source: ["slack"],
        lastUpdated: "Apr 3, 2026",
      },
      {
        type: "ai-agent-trust",
        summary: "Agent making unauthorized / unexpected changes",
        detail:
          "Agent autonomously making changes the customer didn't explicitly approve. This is a core trust and safety concern eroding confidence in the product.",
        status: "active",
        severity: "critical",
        source: ["slack"],
        lastUpdated: "Mar 2026",
      },
      {
        type: "credit-usage-visibility",
        summary:
          "Bandwidth overages not reflecting actual usage (billing anomaly)",
        detail:
          "Customer seeing bandwidth overages that don't match their actual usage. Asset library is empty. Root cause investigation ongoing.",
        status: "active",
        severity: "high",
        source: ["slack"],
        lastUpdated: "Mar 2026",
      },
    ],
    notes:
      "RE-ENGAGEMENT IN PROGRESS (Apr 3): Meeting happened — Ziv mapping additional ClickUp contacts as next step. Still churn risk but active recovery underway.",
  },
  {
    company: "Caesars",
    hubspotStatus: "Active — Renewal upcoming ($230K original deal)",
    blockers: [
      {
        type: "feature-gap",
        summary:
          "Last-mile connect + publish — new VP of Engineering pushing for it",
        detail:
          "Mar 27: New VP of Engineering Carl (from Amazon) wants to enable direct publish for static pages without dev PR review. 'Connect and publish' dragging for over a month.",
        status: "active",
        severity: "high",
        source: ["gong", "slack"],
        lastUpdated: "Mar 27, 2026",
      },
      {
        type: "developer-workflow",
        summary:
          "Figma ran a hackathon for Caesars (Mar 16) + internal Cursor push — competitive threat escalating",
        detail:
          "Apr 7: Figma hosted a hackathon specifically for Caesars on March 16. Internal company also pushing Cursor/cloud tools.",
        status: "active",
        severity: "high",
        source: ["gong", "slack"],
        lastUpdated: "Apr 7, 2026",
      },
      {
        type: "collaboration-workflow",
        summary:
          "No safe sandbox / prototype space separate from enterprise git",
        detail:
          "Product people making unwanted changes in the enterprise git-connected space. Need a cloned project environment where users can prototype without ability to create repos or PRs.",
        status: "active",
        severity: "high",
        source: ["gong"],
        lastUpdated: "Mar 27, 2026",
      },
      {
        type: "enablement-playbook",
        summary:
          "Fusion adoption struggling — only 2 active users (Josh + partial Steph)",
        detail:
          "Mar 30 Slack update: 'Fusion adoption at Caesars is struggling. Only Joshua and partially Steph are actively using it.'",
        status: "active",
        severity: "critical",
        source: ["gong", "slack"],
        lastUpdated: "Mar 30, 2026",
      },
      {
        type: "legacy-migration-dep",
        summary: "AEM migration incomplete — blocking full Publish adoption",
        detail:
          "Caesars purchased Builder to migrate off AEM. That migration was due last year. Still not complete.",
        status: "active",
        severity: "high",
        source: ["gong", "hubspot"],
        lastUpdated: "Mar 27, 2026",
      },
      {
        type: "feature-gap",
        summary: "Figma-MCP integration quality — 40-50% output completeness",
        detail:
          "Figma MCP is doing roughly 40-50% of the work. Final output still requires significant manual work.",
        status: "monitoring",
        severity: "medium",
        source: ["gong"],
        lastUpdated: "Mar 27, 2026",
      },
    ],
    notes:
      "Mar 30: Adoption struggling (only Josh + Steph). New VP Carl (from Amazon) is a potential exec champion for Publish. AEM migration still overdue.",
  },
  {
    company: "Bayer",
    hubspotStatus: "Renewal Closed Lost ($45K original) — active re-engagement",
    blockers: [
      {
        type: "sso-auth",
        summary: "VS Code extension SSO connectivity issues",
        detail:
          "SSO integration broken in VS Code extension. Desktop app recommended as primary workaround.",
        status: "active",
        severity: "high",
        source: ["slack"],
        lastUpdated: "Mar 13, 2026",
      },
      {
        type: "platform-reliability",
        summary:
          "Dev server container hanging — 'initializing branch' never completes",
        detail:
          "Mar 13 Gong: Michel onboarding Usra on design system — container reaches 'container ready' then dies. Both browser and desktop app affected.",
        status: "active",
        severity: "high",
        source: ["gong", "slack"],
        lastUpdated: "Mar 13, 2026",
      },
      {
        type: "onboarding-setup",
        summary:
          "Access issue resolved — workshop planned, roadmap discussion requested",
        detail:
          "Mar 27: Chris resolved Builder access issue. Heiko wants product roadmap discussion post-workshop. Apr 1: Microsite being built.",
        status: "monitoring",
        severity: "low",
        source: ["slack"],
        lastUpdated: "Apr 1, 2026",
      },
    ],
    notes:
      "MOMENTUM POSITIVE: Mar 27 — access issue resolved by Chris. Workshop/hackathon planned with pilot project identified. Apr 1: Microsite being built for Bayer.",
  },
];

export function getBlockerTypeSummary(): {
  type: BlockerType;
  label: string;
  companies: string[];
  activeCount: number;
  resolvedCount: number;
}[] {
  const summary: Record<
    BlockerType,
    { companies: Set<string>; active: number; resolved: number }
  > = {} as any;

  for (const account of accountData) {
    for (const blocker of account.blockers) {
      if (!summary[blocker.type]) {
        summary[blocker.type] = {
          companies: new Set(),
          active: 0,
          resolved: 0,
        };
      }
      summary[blocker.type].companies.add(account.company);
      if (blocker.status === "active") summary[blocker.type].active++;
      else if (blocker.status === "resolved") summary[blocker.type].resolved++;
    }
  }

  return (Object.keys(summary) as BlockerType[])
    .map((type) => ({
      type,
      label: BLOCKER_TYPE_LABELS[type],
      companies: [...summary[type].companies],
      activeCount: summary[type].active,
      resolvedCount: summary[type].resolved,
    }))
    .sort((a, b) => b.activeCount - a.activeCount);
}
