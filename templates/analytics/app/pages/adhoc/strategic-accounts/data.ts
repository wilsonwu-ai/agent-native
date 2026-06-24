/** ISO timestamp of when this file was last refreshed from Gong, HubSpot, and Slack. */
export const DATA_LAST_UPDATED = "2026-04-01T00:00:00.000Z";

export type Confidence = "high" | "medium" | "low";

export interface Contact {
  name: string;
  title: string;
  email: string;
  confidence: Confidence;
  /** Why we think this person fits this role */
  rationale: string;
  /** If true, this person is also identified in another role */
  sameAsOtherRole?: boolean;
}

export interface AccountSources {
  gongCalls: number;
  hasSlack: boolean;
  hubspotContacts: number;
}

export interface StrategicAccount {
  name: string;
  /**
   * Champion = externally-oriented deal advocate.
   * Sells for you internally, has personal stake, actively advocates.
   * Multiple candidates when confidence is unclear.
   */
  champions: Contact[];
  /**
   * Enabler = internally-oriented transformation driver.
   * Post-sale, bridges exec vision to frontline, owns program momentum.
   */
  enablers: Contact[];
  /**
   * Exec Sponsor = executive with budget/authority backing the initiative.
   */
  execSponsors: Contact[];
  sources: AccountSources;
  notes: string;
}

/** Overall coverage based on highest-confidence contact in each role */
export function getCoverageLevel(
  account: StrategicAccount,
): "clear" | "partial" | "gap" {
  const bestConfidence = (contacts: Contact[]): Confidence | null => {
    if (contacts.some((c) => c.confidence === "high")) return "high";
    if (contacts.some((c) => c.confidence === "medium")) return "medium";
    if (contacts.length > 0) return "low";
    return null;
  };

  const cC = bestConfidence(account.champions);
  const eC = bestConfidence(account.enablers);
  const xC = bestConfidence(account.execSponsors);

  const highOrMed = [cC, eC, xC].filter(
    (c) => c === "high" || c === "medium",
  ).length;
  const anyFilled = [cC, eC, xC].filter(Boolean).length;

  if (highOrMed >= 2) return "clear";
  if (anyFilled >= 1) return "partial";
  return "gap";
}

export const STRATEGIC_ACCOUNTS: StrategicAccount[] = [
  {
    name: "Walmart",
    champions: [
      {
        name: "Amy Ha",
        title: "Product Manager",
        email: "amy.ha@walmart.com",
        confidence: "high",
        sameAsOtherRole: true,
        rationale:
          "Named directly by leadership. On Gong calls. Actively advocates for Builder internally.",
      },
    ],
    enablers: [
      {
        name: "Amy Ha",
        title: "Product Manager",
        email: "amy.ha@walmart.com",
        confidence: "high",
        sameAsOtherRole: true,
        rationale:
          "Slack shows her blasting usage updates across the whole channel — classic enabler behavior. Same person playing both roles.",
      },
      {
        name: "Ratul Kislaya",
        title: "Director of Engineering",
        email: "ratul.kislaya@walmart.com",
        confidence: "low",
        rationale:
          "Director of Eng on Gong calls. Could be running adoption within his team. Secondary candidate worth investigating.",
      },
    ],
    execSponsors: [
      {
        name: "Vaishali Bajaj",
        title: "Senior Director, Product Management",
        email: "vaishali.bajaj@walmart.com",
        confidence: "medium",
        rationale:
          "Sr. Director in HubSpot. Right seniority. Need to validate she has exec line-of-sight over this initiative.",
      },
    ],
    sources: { gongCalls: 18, hasSlack: true, hubspotContacts: 51 },
    notes:
      "Amy Ha confirmed as both champion and enabler. Slack is active (38 members). Daniel Danker mentioned in Slack — may be worth surfacing as an exec contact.",
  },
  {
    name: "Thales",
    champions: [
      {
        name: "Mithun Singh",
        title: "Product Lead – Privacy & Orchestration",
        email: "mithun.singh@thalesgroup.com",
        confidence: "high",
        sameAsOtherRole: true,
        rationale:
          "Coordinating the Builder rollout and has personal stake (Builder fits his product area). On multiple Gong calls.",
      },
    ],
    enablers: [
      {
        name: "Mithun Singh",
        title: "Product Lead – Privacy & Orchestration",
        email: "mithun.singh@thalesgroup.com",
        confidence: "high",
        sameAsOtherRole: true,
        rationale:
          "Running the onboarding sessions for his team, translating the CTO's vision into ground-level adoption. Same person playing both roles.",
      },
    ],
    execSponsors: [
      {
        name: "Jordi Clement",
        title: "Chief Technology Officer, IAM",
        email: "jordi.clement@thalesgroup.com",
        confidence: "high",
        rationale:
          "Slack: 'Jordi (CTO of IAM) is pushing on something pretty forward-looking that lines up with where Fusion is going.' Clear, active exec sponsor.",
      },
    ],
    sources: { gongCalls: 10, hasSlack: true, hubspotContacts: 52 },
    notes:
      "Strong full coverage. Mithun is champion and enabler; Jordi is deeply bought-in exec. Jason Keenaghan also on calls.",
  },
  {
    name: "ServiceNow",
    champions: [
      {
        name: "Preetha Kumar",
        title: "Internal Driver (GitHub Connection Lead)",
        email: "preetha.kumar@servicenow.com",
        confidence: "high",
        rationale:
          "Slack explicitly: 'Preetha has been the person giving status and driving to get GitHub Connection going.' Active advocacy with clear personal stake.",
      },
    ],
    enablers: [
      {
        name: "Sushma Devarapalli",
        title: "Director, Application Development",
        email: "sushma.devarapalli@servicenow.com",
        confidence: "medium",
        rationale:
          "Director-level on Gong calls and in HubSpot. App Dev scope means she has cross-team reach. Could own the ongoing adoption program.",
      },
      {
        name: "Collin Neugebauer",
        title: "Director, Design Systems",
        email: "collin.neugebauer@servicenow.com",
        confidence: "low",
        rationale:
          "'Director of Design Systems' is a perfect enabler title — owns the design system that Builder would plug into. In HubSpot but not in Gong calls yet.",
      },
    ],
    execSponsors: [
      {
        name: "Spandan Chakraborty",
        title: "Senior Director, Applications Development",
        email: "spandan.chakraborty@servicenow.com",
        confidence: "medium",
        rationale:
          "Senior Director in HubSpot. Direct manager-level above Sushma and Preetha's area.",
      },
      {
        name: "Rajeev Sethi",
        title: "Group Vice President, Emerging Technologies",
        email: "rajeev.sethi@servicenow.com",
        confidence: "low",
        rationale:
          "Group VP in HubSpot — highest seniority in the account. 'Emerging Technologies' mandate is highly relevant. Not yet in Gong calls.",
      },
    ],
    sources: { gongCalls: 12, hasSlack: true, hubspotContacts: 50 },
    notes:
      "Preetha is a high-confidence champion. Enabler and exec sponsor need validation. Rajeev Sethi (Group VP) would be an ideal exec sponsor to activate. Weekly onboarding sessions running through March 2026 — active ramp underway.",
  },
  {
    name: "Optum/UHG",
    champions: [
      {
        name: "Gigen Thomas",
        title: "Sr. Director, Software Engineering",
        email: "gigen.thomas@optum.com",
        confidence: "high",
        rationale:
          "Referenced in Slack by the account team as key deal contact. On Gong calls Jan–Mar 2026. Sr. Director with engineering scope = power and personal stake.",
      },
    ],
    enablers: [
      {
        name: "Andre McDowall",
        title: "Head of User Experience & UX",
        email: "andre.mcdowall@optum.com",
        confidence: "medium",
        rationale:
          "'Head of UX' with cross-team reach. On Gong calls Feb 2026. UX heads often own tool adoption programs. Fits enabler profile but not confirmed.",
      },
      {
        name: "Leo Janze",
        title: "Head of Engineering",
        email: "leo.janze@optum.com",
        confidence: "low",
        rationale:
          "'Head of Engineering' in HubSpot — broad mandate. Could be the enabler if he owns engineering tooling. Not yet in Gong calls.",
      },
    ],
    execSponsors: [
      {
        name: "Dan Zerafa",
        title: "SVP – Technology Software Engineering",
        email: "dan.zerafa@optum.com",
        confidence: "high",
        rationale:
          "SVP appeared on the January Gong call — exec presence on a vendor call is a strong signal of real sponsorship.",
      },
    ],
    sources: { gongCalls: 8, hasSlack: true, hubspotContacts: 50 },
    notes:
      "Strong champion and exec. Enabler is the gap — need to confirm who owns the ongoing adoption program. Haris Dindo (Sr. Director AI/ML Eng) also engaged in Gong. Call cadence has slowed — 3 fewer calls vs prior 90-day window, worth checking in on momentum.",
  },
  {
    name: "Netflix",
    champions: [
      {
        name: "Chris Munn",
        title: "Internal Advocate",
        email: "cmunn@netflix.com",
        confidence: "medium",
        rationale:
          "On multiple Gong calls and mentioned repeatedly in Slack. Appears to be the primary relationship holder. Title unknown.",
      },
      {
        name: "JC Ehle",
        title: "Internal Advocate",
        email: "jehle@netflix.com",
        confidence: "low",
        rationale:
          "On Gong calls Feb 2026. Referenced alongside Chris Munn in Slack. Secondary candidate.",
      },
    ],
    enablers: [
      {
        name: "Kylo Xue",
        title: "Design Engineer",
        email: "jkyloxue@netflix.com",
        confidence: "high",
        rationale:
          "Slack: 'Kylo has built a prototype using the Hawkins Design System and deployed it for internal use and feedback.' Building real prototypes and driving internal adoption = textbook enabler.",
      },
    ],
    execSponsors: [
      {
        name: "Kathryn Koehler",
        title: "Head of Dev Productivity",
        email: "kkoehler@netflix.com",
        confidence: "medium",
        rationale:
          "'Head of Dev Productivity' — owns the mandate for developer tooling decisions. In HubSpot but not yet in Gong calls. Need to get her into the conversation.",
      },
      {
        name: "Gagan Hasteer",
        title: "Vice President, Content Engineering",
        email: "ghasteer@netflix.com",
        confidence: "low",
        rationale:
          "VP in HubSpot. High seniority but less directly relevant to tooling. Secondary exec candidate.",
      },
    ],
    sources: { gongCalls: 5, hasSlack: true, hubspotContacts: 54 },
    notes:
      "Kylo is a standout enabler. Champion role (deal advocacy) is less clear — Chris Munn is likely but title unknown. Kathryn Koehler (Head of Dev Productivity) is the exec sponsor to activate.",
  },
  {
    name: "Nasdaq",
    champions: [
      {
        name: "Hedi Uustalu-Viks",
        title: "Lead Product Manager",
        email: "hedi.uustalu-viks@nasdaq.com",
        confidence: "medium",
        rationale:
          "Lead PM on Jan 2026 Gong call. PM with product ownership = personal stake. More recently Austin Bott and Edwin Aoki are the visible contacts.",
      },
      {
        name: "Austin Bott",
        title: "Unknown title",
        email: "austin.bott@nasdaq.com",
        confidence: "low",
        rationale:
          "On recent Gong calls (Mar 2026) and referenced in Slack. Role/title unknown — needs enrichment.",
      },
    ],
    enablers: [
      {
        name: "Jayashree Rajendran",
        title: "Senior Director, Web Development",
        email: "jayashree.rajendran@nasdaq.com",
        confidence: "medium",
        rationale:
          "Sr. Director of Web Development has cross-team authority over web teams — right scope for an enabler. In HubSpot. Not yet in Gong calls.",
      },
      {
        name: "Craig Tjerandsen",
        title: "Director – Web Development",
        email: "craig.tjerandsen@nasdaq.com",
        confidence: "low",
        rationale:
          "Director under Jayashree (likely). Could be running day-to-day adoption. In HubSpot.",
      },
    ],
    execSponsors: [
      {
        name: "Bill Dague",
        title: "Vice President, Head of Data Product",
        email: "bill.dague@nasdaq.com",
        confidence: "low",
        rationale: "VP in HubSpot. Not engaged in Gong calls.",
      },
      {
        name: "Bharat Patel",
        title: "Vice President, Corporate Technology",
        email: "bharat.patel@nasdaq.com",
        confidence: "low",
        rationale:
          "'VP Corporate Technology' — potentially more relevant mandate than Data Product. In HubSpot.",
      },
    ],
    sources: { gongCalls: 6, hasSlack: true, hubspotContacts: 51 },
    notes:
      "Exec sponsor is the weakest layer. Neither VP has Gong presence. Need to determine who among the HubSpot contacts has real exec authority over the Builder initiative.",
  },
  {
    name: "KPMG",
    champions: [
      {
        name: "Peter Centofante",
        title: "Director of Product Design",
        email: "pcentofante@kpmg.com",
        confidence: "high",
        rationale:
          "On multiple Gong calls including recent Mar 2026. Director level with product design ownership — personal stake and organizational influence.",
      },
    ],
    enablers: [
      {
        name: "Ryan Lee",
        title: "Director of User Experience, Financial Services",
        email: "ryanlee1@kpmg.com",
        confidence: "medium",
        rationale:
          "Director of UX for Financial Services vertical — cross-team scope within that BU. On Gong calls. May be running ongoing enablement for his practice area.",
      },
      {
        name: "Kate Iannelli",
        title: "Director, Digital Product Design",
        email: "kiannelli@kpmg.com",
        confidence: "low",
        rationale:
          "Director of Digital Product Design in HubSpot. Similar scope to Ryan. Secondary candidate.",
      },
    ],
    execSponsors: [
      {
        name: "Michael Harper",
        title: "Managing Director",
        email: "mcharper@kpmg.com",
        confidence: "medium",
        rationale:
          "Managing Director on Gong call Mar 2026. Exec presence on a vendor call is meaningful.",
      },
      {
        name: "Tom Schenk",
        title: "Managing Director",
        email: "tschenk@kpmg.com",
        confidence: "medium",
        rationale:
          "Referenced in Slack as a key stakeholder ('Hi Tom', 'their Managing Director'). May be even more influential than Michael Harper.",
      },
    ],
    sources: { gongCalls: 19, hasSlack: true, hubspotContacts: 54 },
    notes:
      "Most active Gong account (19 calls). Strong across all three roles. Two MDs as exec candidates — worth clarifying who owns the ultimate budget decision.",
  },
  {
    name: "Intuit",
    champions: [
      {
        name: "Shawn McClelland",
        title: "Confirmed Champion",
        email: "shawn_mcclelland@intuit.com",
        confidence: "high",
        rationale:
          "Named directly by leadership as the confirmed champion. On Gong calls Mar 2026. Actively advocating for Builder internally.",
      },
    ],
    enablers: [
      {
        name: "Shawn McClelland",
        title: "Confirmed Enabler",
        email: "shawn_mcclelland@intuit.com",
        confidence: "high",
        sameAsOtherRole: true,
        rationale:
          "Confirmed by leadership as the ideal enabler. Playing both champion and enabler roles. Note: his exact title and team at Intuit are not in our systems — would help to document his org scope.",
      },
      {
        name: "Kaelig Deloumeau-Prigent",
        title: "Design System Lead",
        email: "(unknown)",
        confidence: "low",
        rationale:
          "Slack: 'Design System lead at Intuit posting about Builder.' An organic internal advocate building on top of Builder — potential secondary enabler to cultivate.",
      },
    ],
    execSponsors: [
      {
        name: "Sunil Sreekumar",
        title: "Head of Go-to-Market Enablement",
        email: "sunil_sreekumar@intuit.com",
        confidence: "medium",
        rationale:
          "'Head of GTM Enablement' — the word 'enablement' in his title suggests he may be directly connected to the Builder program. In HubSpot. Needs Gong validation.",
      },
    ],
    sources: { gongCalls: 17, hasSlack: true, hubspotContacts: 51 },
    notes:
      "Shawn is confirmed as both champion and enabler by Brent. Missing: his actual title and org scope at Intuit — documenting this would sharpen our picture of his influence. The IES (Intuit Enterprise Suite) team is also engaged. Call cadence steady at 17.",
  },
  {
    name: "Deloitte",
    champions: [
      {
        name: "Kavya Sriram",
        title: "Senior Manager, Innovation",
        email: "kasriram@deloitte.com",
        confidence: "medium",
        rationale:
          "'Innovation' title suggests executive line-of-sight and strategic mandate. On Gong calls Jan–Feb 2026. Has personal stake if Builder is part of her portfolio.",
      },
      {
        name: "Bernie Zimmermann",
        title: "Unknown title",
        email: "bgzimmermann@deloitte.com",
        confidence: "low",
        rationale:
          "Mentioned in Slack as providing feedback after a recent session ('Great feedback from Bernie and a list of emails!'). Active participant. Title unknown.",
      },
    ],
    enablers: [],
    execSponsors: [
      {
        name: "Andrew Chernack",
        title: "Managing Director",
        email: "achernack@deloitte.com",
        confidence: "medium",
        rationale:
          "Managing Director on Jan 2026 Gong call. MD-level exec presence is meaningful.",
      },
      {
        name: "Nick Bullard",
        title: "Managing Director",
        email: "nbullard@deloitte.com",
        confidence: "medium",
        rationale:
          "Managing Director on Gong call. Need to determine which MD has the actual budget/authority for this program.",
      },
    ],
    sources: { gongCalls: 9, hasSlack: true, hubspotContacts: 68 },
    notes:
      "No clear enabler — the biggest gap in this account. Kavya (Senior Manager, Innovation) is a champion candidate. Need someone who will own ongoing adoption internally. Arun Aalla is another recurring Gong contact.",
  },
  {
    name: "CBRE Group",
    champions: [
      {
        name: "Satya Raju",
        title: "Vice President, Digital Technology",
        email: "satya.raju@cbre.com",
        confidence: "medium",
        rationale:
          "VP with Digital Technology scope. On Gong calls. Has power and stake. Could be championing Builder at the exec level.",
      },
      {
        name: "Sam Verschaetse",
        title: "Director of Product Management",
        email: "sam.verschaetse@cbre.com",
        confidence: "low",
        rationale:
          "Director of PM on Gong calls. Product ownership = personal stake. Secondary champion candidate.",
      },
    ],
    enablers: [
      {
        name: "Chaitanya Reddy",
        title: "Engineering Lead (operational driver)",
        email: "chaitanyareddy.jambuluri@cbre.com",
        confidence: "medium",
        rationale:
          "Slack: 'Got this note from Chaitanya this morning' — day-to-day operational driver. Classic enabler behavior, but lacks the seniority (Director+) to truly bridge exec and frontline.",
      },
      {
        name: "Chris Quinn",
        title: "Director of UX Design",
        email: "chris.quinn2@cbre.com",
        confidence: "low",
        rationale:
          "Director of UX Design on Gong calls. Has design team scope. Could formalize ongoing enablement. Secondary candidate.",
      },
    ],
    execSponsors: [
      {
        name: "Khadir Fayaz",
        title: "SVP, Digital Technology",
        email: "khadir.fayaz@cbre.com",
        confidence: "low",
        rationale:
          "SVP in HubSpot — right seniority. Not visible in Gong calls. Not yet confirmed as engaged.",
      },
    ],
    sources: { gongCalls: 35, hasSlack: true, hubspotContacts: 51 },
    notes:
      "Most active account in Gong (35 calls, up 3 this period). New call types detected: 'Executive Alignment' (Feb 3), 'Enablement & Scale Planning' (Mar 19), and weekly 'Fusion Readiness' cadence all through Q1. Chris Quinn (Director of UX) now having direct 1:1s with Builder (CBRE/Chris - Builder/Erin Connect). Chaitanya is a solid operational enabler but needs seniority. Satya or Khadir should be pulled into a strategic exec conversation.",
  },
  {
    name: "Anheuser-Busch",
    champions: [
      {
        name: "Avik Ganguly",
        title: "Senior Director of Engineering",
        email: "avik.ganguly@anheuser-busch.com",
        confidence: "medium",
        rationale:
          "Sr. Director on the Feb 2026 Gong call. Has engineering scope and seniority. But only 2 total calls suggests limited active advocacy.",
      },
    ],
    enablers: [],
    execSponsors: [
      {
        name: "Robert McElroy",
        title: "Senior Director, Marketing Technology & Operations",
        email: "robert.mcelroy@anheuser-busch.com",
        confidence: "low",
        rationale:
          "Sr. Director MarTech in HubSpot. MarTech + Builder could be a natural fit. Not in Gong calls.",
      },
      {
        name: "Martin Suter",
        title: "VP, eCommerce (North America Zone)",
        email: "martin.suter@ab-inbev.com",
        confidence: "low",
        rationale:
          "VP in HubSpot. Higher seniority but less operationally relevant. Not in Gong calls.",
      },
    ],
    sources: { gongCalls: 2, hasSlack: true, hubspotContacts: 50 },
    notes:
      "Very low engagement (2 calls). No enabler identified. Engagement appears stalled. This account needs active champion/enabler identification before expansion is realistic.",
  },
  {
    name: "Amazon",
    champions: [
      {
        name: "Deborah Foley",
        title: "Head of UX Design, Appstore",
        email: "fodyness@amazon.com",
        confidence: "medium",
        rationale:
          "'Head of UX Design, Appstore' — has personal stake and authority within her BU. On Mar 2026 Gong call. Champion for Appstore specifically, not Amazon broadly.",
      },
      {
        name: "Zhonghe Wen",
        title: "Unknown title",
        email: "zhonghew@amazon.com",
        confidence: "low",
        rationale:
          "Referenced frequently in Slack. On Gong calls. Role unclear. Secondary candidate.",
      },
    ],
    enablers: [],
    execSponsors: [],
    sources: { gongCalls: 24, hasSlack: true, hubspotContacts: 59 },
    notes:
      "Multiple separate Amazon BUs engaging independently (24 calls, up 2 this period). No single enabler or exec sponsor. Amazon may need a central DX/platform team champion. Dave Maynard also frequently mentioned in Slack.",
  },
  {
    name: "Western Union",
    champions: [
      {
        name: "Alan Rhatigan",
        title: "Internal Champion & Enabler",
        email: "alan.rhatigan@westernunion.com",
        confidence: "high",
        sameAsOtherRole: true,
        rationale:
          "Slack: Alan described the rollout strategy as a 'big breath before scaling up' — clearly the internal advocate coordinating the expansion plan.",
      },
    ],
    enablers: [
      {
        name: "Alan Rhatigan",
        title: "Internal Champion & Enabler",
        email: "alan.rhatigan@westernunion.com",
        confidence: "high",
        sameAsOtherRole: true,
        rationale:
          "Slack: 'moving the team away from Figma in favor of Builder, starting with the UX team.' Running the internal transformation program. Same person playing both roles.",
      },
    ],
    execSponsors: [
      {
        name: "Dariusz Danielewski",
        title: "VP, Retail Software Engineering",
        email: "dariusz.danielewski@westernunion.com",
        confidence: "low",
        rationale:
          "VP in HubSpot. Not confirmed as engaged. Colleen Keegan (on Gong call) may sit closer to Alan's management chain.",
      },
      {
        name: "Youri Bebic",
        title: "SVP, Global Retail Product & Operations",
        email: "youri.bebic@westernunion.com",
        confidence: "low",
        rationale:
          "SVP in HubSpot — highest seniority in the account. Not in Gong calls. Recommend activating as exec sponsor.",
      },
    ],
    sources: { gongCalls: 4, hasSlack: true, hubspotContacts: 43 },
    notes:
      "Alan plays both champion and enabler — strong signal. Exec sponsor is the gap. Recommend getting Youri Bebic or Dariusz into a strategic conversation to lock in exec backing.",
  },
  {
    name: "WebMD Health",
    champions: [],
    enablers: [],
    execSponsors: [
      {
        name: "Alejandra Azcoitia",
        title: "Senior Director, Global Product & Sales Engineering",
        email: "aazcoitia@webmd.com",
        confidence: "low",
        rationale:
          "Best HubSpot title match (Sr. Director). No Gong or Slack presence. Not confirmed as engaged.",
      },
      {
        name: "Patrick Alburtus",
        title: "Director of Engineering",
        email: "palburtus@webmd.com",
        confidence: "low",
        rationale:
          "Director of Engineering in HubSpot. More likely to be the operational contact than exec sponsor.",
      },
    ],
    sources: { gongCalls: 2, hasSlack: true, hubspotContacts: 50 },
    notes:
      "Major coverage gap. Almost no engagement signal. The single Gong contact (Martin Michaelides) has a mismatched name/email. Needs active outreach to identify and cultivate champion and enabler.",
  },
  {
    name: "Swiss Re",
    champions: [
      {
        name: "Jan Kanderal",
        title: "Unknown title",
        email: "jan_kanderal@swissre.com",
        confidence: "medium",
        rationale:
          "On Jan 2026 Gong calls and referenced in Slack as a key contact. No title in systems — needs enrichment to confirm seniority.",
      },
    ],
    enablers: [
      {
        name: "Katharine Kind",
        title: "Head of Product & Experience Design, P&C Re",
        email: "katharine_kind@swissre.com",
        confidence: "medium",
        rationale:
          "'Head of Product & Experience Design' — owns the design/product system. Perfect enabler scope. In HubSpot but not in Gong calls yet.",
      },
      {
        name: "Vel Parvath",
        title: "Head of Engineering",
        email: "vel_parvath@swissre.com",
        confidence: "low",
        rationale:
          "'Head of Engineering' in HubSpot. Broad engineering mandate. Secondary enabler candidate.",
      },
    ],
    execSponsors: [
      {
        name: "Feby Thomas",
        title: "Senior Vice President, Architecture & Engineering",
        email: "feby_thomas@swissre.com",
        confidence: "low",
        rationale:
          "SVP in HubSpot. High seniority but not confirmed as engaged.",
      },
    ],
    sources: { gongCalls: 2, hasSlack: true, hubspotContacts: 39 },
    notes:
      "Christopher Cote (also 'Head of Engineering') in HubSpot — another exec candidate. Wes Crozier referenced in Slack as doing design work. Needs more Gong presence to solidify role mapping.",
  },
  {
    name: "Schneider",
    champions: [
      {
        name: "Israel Sanchez",
        title: "Director, Digital Customer Experience",
        email: "israel.sanchez@se.com",
        confidence: "medium",
        rationale:
          "'Digital Customer Experience' scope suggests strategic mandate and cross-team influence. In HubSpot. Not yet in Gong calls — champion role not confirmed.",
      },
    ],
    enablers: [],
    execSponsors: [
      {
        name: "Abdulla Assaf",
        title: "Director of Engineering – PSS",
        email: "abdulla.assaf@se.com",
        confidence: "low",
        rationale:
          "Director of Engineering in HubSpot. More operationally relevant than Bruno. Could be the exec sponsor for a specific BU.",
      },
      {
        name: "Bruno Zerbib",
        title: "EVP & Chief Platform & Technology Officer",
        email: "bruno.zerbib@schneider-electric.com",
        confidence: "low",
        rationale:
          "EVP in HubSpot — very senior. Unlikely to be day-to-day exec sponsor but may be the ultimate authority.",
      },
    ],
    sources: { gongCalls: 1, hasSlack: true, hubspotContacts: 54 },
    notes:
      "Very active Slack (200 msgs) but only 1 Gong call. No enabler identified. Account team should validate who internally is driving the expansion and who among HubSpot contacts is the true sponsor.",
  },
  {
    name: "Roku",
    champions: [
      {
        name: "Steven Keng",
        title: "Senior Engineering Manager",
        email: "skeng@roku.com",
        confidence: "medium",
        rationale:
          "Eileen's manager. On Gong calls. Has managerial authority over the team engaging with Builder — backed the onsite visit decision.",
      },
    ],
    enablers: [
      {
        name: "Eileen Yu",
        title: "Internal Champion & Evangelizer",
        email: "eyu@roku.com",
        confidence: "high",
        rationale:
          "Slack: 'Eileen confirmed us coming onsite' and the team met with her to 'discuss mini roadshows and how to support their efforts internally to evangelize Builder.' Running internal roadshows = textbook enabler.",
      },
    ],
    execSponsors: [
      {
        name: "Daniel Issen",
        title: "Vice President, Platform & Cloud Engineering",
        email: "dissen@roku.com",
        confidence: "low",
        rationale:
          "VP Platform Engineering in HubSpot. Right seniority to be exec sponsor. Not yet in Gong calls.",
      },
      {
        name: "Margret Schmidt",
        title: "VP, User Experience",
        email: "mschmidt@roku.com",
        confidence: "low",
        rationale:
          "VP UX in HubSpot. Relevant mandate for Builder's design-to-code value prop. Secondary exec candidate.",
      },
    ],
    sources: { gongCalls: 7, hasSlack: true, hubspotContacts: 51 },
    notes:
      "Eileen is a strong enabler. Steven Keng is the champion candidate. Exec sponsor is the gap — need to activate Daniel Issen (VP Platform) or Margret Schmidt (VP UX).",
  },
  {
    name: "Rakuten",
    champions: [],
    enablers: [],
    execSponsors: [
      {
        name: "Armando Hernandez",
        title: "Senior Director of Engineering",
        email: "armando.hernandez@rakuten.com",
        confidence: "low",
        rationale:
          "Sr. Director Eng in HubSpot. Not in Gong calls. Relationship appears stuck on commercial friction.",
      },
      {
        name: "Lior Rozner",
        title: "Managing Director",
        email: "lior.rozner@rakuten.com",
        confidence: "low",
        rationale:
          "Managing Director in HubSpot. Higher seniority — could be the exec sponsor if activated.",
      },
    ],
    sources: { gongCalls: 3, hasSlack: true, hubspotContacts: 68 },
    notes:
      "Significant coverage gap. Relationship stuck on commercial issues (user cap disputes). Recommend activating Erin Robinson (Global Creative Director) or Lindsay Grant (Strategy Sr. Director) as potential champions or enablers.",
  },
  {
    name: "OCBC Bank",
    champions: [],
    enablers: [],
    execSponsors: [
      {
        name: "Ayyeswararao Vadlamudi",
        title: "Vice President",
        email: "ayyeswararao@ocbc.com",
        confidence: "low",
        rationale:
          "VP in HubSpot. Not engaged in Gong calls. Title lacks domain specificity.",
      },
      {
        name: "Charlie Xiang",
        title: "Lead Solution Architect",
        email: "charliexiang@ocbc.com",
        confidence: "low",
        rationale:
          "Lead SA in HubSpot. May bridge IC contacts (Vedant, Rohit) and leadership. Worth mapping into the org chart.",
      },
    ],
    sources: { gongCalls: 23, hasSlack: true, hubspotContacts: 53 },
    notes:
      "Despite 23 Gong calls, all visible contacts are IC-level (Vedant Sarawagi, Rohit Reddy, Mi Min). Critical gap: need to find who manages these ICs and elevate the relationship to Director/Head level.",
  },
  {
    name: "NTT Data",
    champions: [
      {
        name: "Javier Samper",
        title: "Expert Engineer",
        email: "javier.samper.arias@nttdata.com",
        confidence: "low",
        rationale:
          "On Gong calls Feb 2026. 'Expert Engineer' is IC-level — lacks the organizational power of a true champion.",
      },
    ],
    enablers: [
      {
        name: "Erin Mogg",
        title: "Sr. Director, User Experience",
        email: "erin.mogg@global.ntt",
        confidence: "medium",
        rationale:
          "Sr. Director UX — cross-team design reach. If she owns UX tooling decisions, she fits the enabler profile. In HubSpot, not in Gong calls.",
      },
      {
        name: "Ash Howell",
        title: "Senior Design Director",
        email: "ash.howell@nttdata.com",
        confidence: "low",
        rationale:
          "Senior Design Director in HubSpot. Similar scope to Erin. Secondary enabler candidate.",
      },
    ],
    execSponsors: [
      {
        name: "Mehul Shah",
        title: "Senior Director, Enterprise Services",
        email: "mehul.shah@nttdata.com",
        confidence: "low",
        rationale:
          "Sr. Director Enterprise Services in HubSpot. Not confirmed as engaged.",
      },
    ],
    sources: { gongCalls: 2, hasSlack: true, hubspotContacts: 63 },
    notes:
      "Low 90-day call count but Designer Training Session ran Feb 23 — a positive signal that training/enablement is happening. Note: NTT may also have a partner/reseller angle worth clarifying. Worth understanding the relationship model before investing in champion/enabler identification.",
  },
  {
    name: "Nationwide",
    champions: [
      {
        name: "Amanda Ludolph",
        title: "AVP, Emerging Capabilities & Competencies",
        email: "ludola2@nationwide.com",
        confidence: "medium",
        rationale:
          "'Emerging Capabilities' AVP — has exec backing and strategic mandate. Named in Slack kickoff notes. Has the authority to be a champion.",
      },
    ],
    enablers: [
      {
        name: "Brian Greene",
        title: "Director, UX Design Standards & Emerging Experiences",
        email: "brian.greene@nationwide.com",
        confidence: "high",
        rationale:
          "'UX Design Standards & Emerging Experiences' — owns the design system across teams. On Gong calls AND in HubSpot. Named in Slack kickoff. Bridges exec strategy to frontline design teams.",
      },
    ],
    execSponsors: [
      {
        name: "Amanda Ludolph",
        title: "AVP, Emerging Capabilities & Competencies",
        email: "ludola2@nationwide.com",
        confidence: "medium",
        sameAsOtherRole: true,
        rationale:
          "Also the champion candidate. AVP level. May need a higher exec to be the true sponsor with budget authority.",
      },
      {
        name: "Floris Keizer",
        title: "Director of Design",
        email: "keizerf@nationwide.com",
        confidence: "low",
        rationale: "Director of Design in HubSpot. Secondary exec candidate.",
      },
    ],
    sources: { gongCalls: 7, hasSlack: true, hubspotContacts: 54 },
    notes:
      "Brian Greene is a standout enabler. Amanda Ludolph plays champion and exec sponsor. Need to validate if there's a higher exec backing this initiative.",
  },
  {
    name: "J.D. Power",
    champions: [
      {
        name: "Michael Sanfir",
        title: "Internal Driver",
        email: "michael.sanfir@jdpa.com",
        confidence: "medium",
        rationale:
          "Referenced in Slack and Gong as key day-to-day contact. Champion role is stalling though — internal political changes are limiting his advocacy.",
      },
    ],
    enablers: [
      {
        name: "Steven Chan",
        title: "Unknown title",
        email: "steven.chan@jdpa.com",
        confidence: "low",
        rationale:
          "Works alongside Michael. On Gong calls. Title unknown. Secondary candidate for enabler.",
      },
      {
        name: "Jon Villalobos",
        title: "User Experience Manager",
        email: "jonathan.villalobos@jdpa.com",
        confidence: "low",
        rationale:
          "UX Manager on Mar 2026 Gong call. Could own Builder adoption within the UX team.",
      },
    ],
    execSponsors: [
      {
        name: "Angus MacDougall",
        title: "VP, New Product Development & AI Solutions",
        email: "angus.macdougall@jdpa.com",
        confidence: "medium",
        rationale:
          "'VP, New Product Dev & AI Solutions' — the AI mandate makes him directly relevant. In HubSpot. Should be activated to unblock the account.",
      },
      {
        name: "Hans Otten",
        title: "CTO",
        email: "hans.otten@jdpa.com",
        confidence: "low",
        rationale:
          "CTO in HubSpot. Highest seniority. May be too removed for day-to-day exec sponsorship but valuable to have engaged.",
      },
    ],
    sources: { gongCalls: 7, hasSlack: true, hubspotContacts: 37 },
    notes:
      "Engagement plateauing due to internal leadership/strategy changes. Activating Angus MacDougall (VP AI) or Hans Otten (CTO) is the recommended path to unblock.",
  },
  {
    name: "ClickUp",
    champions: [
      {
        name: "Josh Vogel",
        title: "Senior Product Manager, Growth & Acquisition",
        email: "jvogel@clickup.com",
        confidence: "medium",
        rationale:
          "Primary contact on Gong calls. Has personal stake (Builder fits Growth use cases). Slack flags churn risk — champion advocacy may be weakening.",
      },
    ],
    enablers: [],
    execSponsors: [
      {
        name: "Olga Osadcha",
        title: "Senior Director of Product – Growth",
        email: "olga@clickup.com",
        confidence: "low",
        rationale:
          "Josh's likely manager. Sr. Director in HubSpot. Not in Gong calls.",
      },
      {
        name: "Maggie Chan",
        title: "Senior Director, Product Design",
        email: "mchan@clickup.com",
        confidence: "low",
        rationale:
          "Sr. Director Product Design in HubSpot. Relevant for Builder's design-to-code value prop. Not in Gong calls.",
      },
    ],
    sources: { gongCalls: 2, hasSlack: true, hubspotContacts: 39 },
    notes:
      "Churn risk flagged in Slack. No enabler. Josh alone isn't enough — need higher-level engagement to stabilize. Justin Midyet (Director of Engineering) also in HubSpot.",
  },
  {
    name: "Caesars",
    champions: [
      {
        name: "Andrew Lacy",
        title: "Senior Director, Digital Products",
        email: "alacy1@caesars.com",
        confidence: "medium",
        rationale:
          "Sr. Director Digital Products — has digital product ownership and authority. Best title match for champion in HubSpot. Needs Gong validation.",
      },
    ],
    enablers: [
      {
        name: "Christopher Ferbend",
        title: "Digital Product – Sites & Screens Owner",
        email: "cferbend@caesars.com",
        confidence: "medium",
        rationale:
          "Owns 'Sites & Screens' — directly relevant to Builder use cases. A Fusion Hackathon in the Slack channel suggests someone is driving internal adoption, likely Christopher or his team.",
      },
    ],
    execSponsors: [],
    sources: { gongCalls: 2, hasSlack: true, hubspotContacts: 68 },
    notes:
      "Fusion Hackathon is a strong engagement signal. No exec sponsor identified. Tony Korkow (Sr. Director Strategic Sourcing) is in HubSpot but sourcing-focused. Joshua Piller and Sthefany Azevedo are the visible Gong contacts.",
  },
  {
    name: "Bayer",
    champions: [
      {
        name: "Luis Muniz",
        title: "Head of External Partnerships",
        email: "luis.muniz1@bayer.com",
        confidence: "medium",
        rationale:
          "'Head of External Partnerships' — manages vendor relationships, deal-oriented role. In HubSpot. Not yet visible in Gong calls.",
      },
    ],
    enablers: [
      {
        name: "Aude Degrivel",
        title: "Head of AI Solutions",
        email: "aude.degrivel@bayer.com",
        confidence: "high",
        rationale:
          "'Head of AI Solutions' appeared in Mar 2026 Gong call. Has the AI mandate, executive line-of-sight, and accountability for driving AI adoption across the organization. Ideal enabler profile.",
      },
    ],
    execSponsors: [
      {
        name: "Daria Yowe",
        title: "Principal Experience Lead",
        email: "daria.yowe@bayer.com",
        confidence: "low",
        rationale:
          "'Principal Experience Lead' in HubSpot — relevant but not clearly exec-level with budget authority.",
      },
    ],
    sources: { gongCalls: 9, hasSlack: true, hubspotContacts: 52 },
    notes:
      "Aude Degrivel is a standout enabler. Champion (Luis) and exec sponsor are weaker. Need VP/SVP level exec sponsor. Ben Hildebrand (Senior IT Architect) and Michael Ajibola (Principal Architect) also in HubSpot.",
  },
];
