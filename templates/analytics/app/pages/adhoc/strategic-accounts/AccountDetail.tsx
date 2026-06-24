import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router";
import {
  IconArrowLeft,
  IconExternalLink,
  IconBuilding,
  IconUsers,
  IconTrendingUp,
  IconCurrencyDollar,
  IconCalendar,
  IconChevronDown,
  IconBolt,
  IconCalendarTime,
  IconChartBar,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useMetricsQuery } from "@/lib/query-metrics";
import { formatCompactCurrency, formatCompactNumber } from "@/lib/utils";
import { KpiChart } from "@/pages/adhoc/_shared/KpiChart";
import {
  getAccountDetailQuery,
  getAccountFusionTimeSeriesQuery,
  getAccountUsersQuery,
  getAccountUserPersonasQuery,
  getAccountCreditsTimeSeriesQuery,
  getAccountWeeklyActiveUsersQuery,
  getAccount30DayActiveUsersQuery,
  getAccountCreditUtilizationQuery,
} from "./queries";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AccountTeam,
  SlackChannel,
  ExpansionStrategy,
  Meetings,
  DeploymentStatus,
  OpenDeals,
  RelationshipContacts,
  QuarterlyObjectives,
  JiraTickets,
  PylonTickets,
} from "./AccountSections";
import { ImplBlockersModule } from "./ImplBlockersModule";
import { KeyUpdates } from "./KeyUpdates";
import { useMeetings } from "./useMeetings";
import { useDeals } from "./useDeals";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

function useUrlParam(
  key: string,
  defaultValue: string,
): [string, (v: string) => void] {
  const [value, setValue] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get(key) || defaultValue;
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (value === defaultValue) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const s = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${s ? `?${s}` : ""}`,
    );
  }, [value, key, defaultValue]);

  return [value, setValue];
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function get90DaysAgo(): string {
  const d = new Date();
  d.setDate(d.getDate() - 90);
  return d.toISOString().slice(0, 10);
}

const ACCOUNT_NAMES: Record<string, string> = {
  walmart: "Walmart",
  thales: "Thales",
  servicenow: "ServiceNow",
  "optum-uhg": "Optum/UHG",
  netflix: "Netflix",
  nasdaq: "Nasdaq",
  kpmg: "KPMG",
  intuit: "Intuit",
  deloitte: "Deloitte",
  "cbre-group": "CBRE Group",
  "anheuser-busch": "Anheuser-Busch",
  amazon: "Amazon",
  "western-union": "Western Union",
  "webmd-health": "WebMD Health",
  "swiss-re": "Swiss Re",
  schneider: "Schneider",
  roku: "Roku",
  rakuten: "Rakuten",
  "ocbc-bank": "OCBC Bank",
  "ntt-data": "NTT Data",
  nationwide: "Nationwide",
  "j-d-power": "J.D. Power",
  clickup: "ClickUp",
  caesars: "Caesars",
  bayer: "Bayer",
};

export default function AccountDetail() {
  const { accountSlug } = useParams<{ accountSlug: string }>();
  const accountName = accountSlug
    ? ACCOUNT_NAMES[accountSlug] || accountSlug
    : "";

  const [dateStart, setDateStart] = useUrlParam("from", get90DaysAgo());
  const [dateEnd, setDateEnd] = useUrlParam("to", getToday());
  const [isUserActivityOpen, setIsUserActivityOpen] = useState(false);

  const days = useMemo(() => {
    const start = new Date(dateStart);
    const end = new Date(dateEnd);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }, [dateStart, dateEnd]);

  const accountSql = useMemo(
    () => getAccountDetailQuery(accountName, dateStart, dateEnd),
    [accountName, dateStart, dateEnd],
  );
  const { data: accountData, isLoading: accountLoading } = useMetricsQuery(
    ["account-detail", accountName, dateStart, dateEnd],
    accountSql,
  );

  const creditsSql = useMemo(
    () => getAccountCreditsTimeSeriesQuery(accountName, dateStart, dateEnd),
    [accountName, dateStart, dateEnd],
  );
  const { data: creditsData, isLoading: creditsLoading } = useMetricsQuery(
    ["account-credits-ts", accountName, dateStart, dateEnd],
    creditsSql,
  );

  const weeklyUsersSql = useMemo(
    () => getAccountWeeklyActiveUsersQuery(accountName, dateStart, dateEnd),
    [accountName, dateStart, dateEnd],
  );
  const { data: weeklyUsersData, isLoading: weeklyUsersLoading } =
    useMetricsQuery(
      ["account-weekly-users-ts", accountName, dateStart, dateEnd],
      weeklyUsersSql,
    );

  const activeUsers30dSql = useMemo(
    () => getAccount30DayActiveUsersQuery(accountName),
    [accountName],
  );
  const { data: activeUsers30dData, isLoading: activeUsers30dLoading } =
    useMetricsQuery(
      ["account-active-users-30d", accountName],
      activeUsers30dSql,
    );

  const creditUtilizationSql = useMemo(
    () => getAccountCreditUtilizationQuery(accountName),
    [accountName],
  );
  const { data: creditUtilizationData, isLoading: creditUtilizationLoading } =
    useMetricsQuery(
      ["account-credit-utilization", accountName],
      creditUtilizationSql,
    );

  const usersSql = useMemo(
    () => getAccountUsersQuery(accountName, dateStart, dateEnd),
    [accountName, dateStart, dateEnd],
  );
  const { data: usersData, isLoading: usersLoading } = useMetricsQuery(
    ["account-users", accountName, dateStart, dateEnd],
    usersSql,
  );

  const personasSql = useMemo(
    () => getAccountUserPersonasQuery(accountName, dateStart, dateEnd),
    [accountName, dateStart, dateEnd],
  );
  const { data: personasData, isLoading: personasLoading } = useMetricsQuery(
    ["account-user-personas", accountName, dateStart, dateEnd],
    personasSql,
  );

  const account = accountData?.rows?.[0] as any;

  const { data: deals = [], isLoading: dealsLoading } = useDeals(
    account?.company_id ? String(account.company_id) : undefined,
  );

  const { data: meetings = [], isLoading: meetingsLoading } = useMeetings(
    account?.company_id ? String(account.company_id) : undefined,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link to="/adhoc/strategic-accounts">
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <IconArrowLeft className="h-4 w-4" />
            Back to Strategic Accounts
          </button>
        </Link>
        <Link to={`/adhoc/strategic-accounts/${accountSlug}/engagement`}>
          <Button variant="default" size="sm" className="gap-2">
            <IconChartBar className="h-4 w-4" />
            User Engagement Analysis
          </Button>
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <IconBuilding className="h-8 w-8 text-muted-foreground" />
            <h1 className="text-3xl font-bold tracking-tight">{accountName}</h1>
          </div>
          {account && (
            <p className="text-sm text-muted-foreground mt-2">
              {account.company_domain_name && (
                <a
                  href={`https://${account.company_domain_name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:underline"
                >
                  {String(account.company_domain_name)}
                  <IconExternalLink className="h-3 w-3" />
                </a>
              )}
              {account.customer_stage && ` • ${account.customer_stage}`}
              {account.company_owner_name &&
                ` • Owner: ${account.company_owner_name}`}
            </p>
          )}
        </div>

        {account?.company_domain_name && (
          <div className="flex-shrink-0 h-16 w-16 rounded-lg bg-white/10 border border-border flex items-center justify-center overflow-hidden">
            <img
              src={`https://logo.clearbit.com/${account.company_domain_name}`}
              alt={`${accountName} logo`}
              className="h-full w-full object-contain p-2"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = "none";
                const parent = target.parentElement;
                if (parent) {
                  parent.classList.add("bg-muted");
                  parent.innerHTML =
                    '<svg class="h-8 w-8 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>';
                }
              }}
            />
          </div>
        )}
      </div>

      <KeyUpdates
        accountName={accountName}
        companyId={account?.company_id ? String(account.company_id) : undefined}
      />

      <div className="rounded-lg border border-border p-3">
        <div className="flex items-center gap-2 mb-3">
          <IconCalendarTime className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Date Range</span>
          <span className="text-xs text-muted-foreground">
            — applies to Key Metrics, Fusion Activity, and User Activity
          </span>
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground font-medium">
              From
            </label>
            <DatePicker value={dateStart} onChange={setDateStart} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground font-medium">
              To
            </label>
            <DatePicker value={dateEnd} onChange={setDateEnd} />
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-base font-semibold text-muted-foreground">
            Key Metrics
          </h2>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted rounded px-1.5 py-0.5">
            <IconCalendarTime className="h-3 w-3" /> date filtered
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <IconCurrencyDollar className="h-4 w-4" />
                Current ARR
              </CardDescription>
              {accountLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <CardTitle className="text-2xl">
                  {formatCompactCurrency(
                    account?.current_enterprise_arr as number,
                  )}
                </CardTitle>
              )}
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <IconTrendingUp className="h-4 w-4" />
                Pipeline
              </CardDescription>
              {accountLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <CardTitle className="text-2xl">
                  {account?.total_pipeline
                    ? formatCompactCurrency(account.total_pipeline as number)
                    : "$0"}
                </CardTitle>
              )}
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <IconBolt className="h-4 w-4" />
                Credits Consumed
              </CardDescription>
              {creditUtilizationLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <CardTitle className="text-lg">
                      {formatCompactNumber(
                        creditUtilizationData?.rows?.[0]
                          ?.last_month_credits as number,
                      )}
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">
                      last mo
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <CardTitle className="text-lg">
                      {formatCompactNumber(
                        creditUtilizationData?.rows?.[0]?.mtd_credits as number,
                      )}
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">MTD</span>
                  </div>
                </div>
              )}
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <IconUsers className="h-4 w-4" />
                Builder Users
              </CardDescription>
              {accountLoading || activeUsers30dLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <CardTitle className="text-lg">
                      {Number(account?.builder_users) || 0}
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">total</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <CardTitle className="text-lg">
                      {Number(
                        activeUsers30dData?.rows?.[0]?.active_users_30d,
                      ) || 0}
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">
                      30d active
                    </span>
                  </div>
                </div>
              )}
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <IconCalendar className="h-4 w-4" />
                Next Renewal
              </CardDescription>
              {accountLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <CardTitle className="text-2xl">
                  {String(account?.upcoming_renewal_date || "N/A")}
                </CardTitle>
              )}
              {account?.hs_csm_sentiment === "At Risk" && (
                <Badge
                  variant="outline"
                  className="mt-2 bg-red-500/10 text-red-700 border-red-200"
                >
                  At Risk
                </Badge>
              )}
            </CardHeader>
          </Card>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold">Fusion Activity</h2>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted rounded px-1.5 py-0.5">
            <IconCalendarTime className="h-3 w-3" /> date filtered
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <KpiChart
            title="Credits Consumed"
            subtitle="AI credits used"
            rows={creditsData?.rows ?? []}
            dataKey="credits_consumed"
            chartType="bar"
            color="#18B4F4"
            isLoading={creditsLoading}
            error={creditsData?.error}
          />
          <KpiChart
            title="Weekly Active Users"
            subtitle="Unique Fusion users per week"
            rows={weeklyUsersData?.rows ?? []}
            dataKey="active_users"
            chartType="bar"
            color="#8b5cf6"
            isLoading={weeklyUsersLoading}
            error={weeklyUsersData?.error}
          />
        </div>
      </div>

      <DeploymentStatus accountName={accountName} />
      <ImplBlockersModule accountName={accountName} />
      <ExpansionStrategy
        accountName={accountName}
        companyId={account?.company_id ? String(account.company_id) : undefined}
      />
      <QuarterlyObjectives accountName={accountName} />

      <OpenDeals deals={deals} isLoading={dealsLoading} />
      <RelationshipContacts accountName={accountName} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AccountTeam
          accountOwner={
            account?.company_owner_name
              ? String(account.company_owner_name)
              : undefined
          }
          csm={
            account?.customer_success_manager
              ? String(account.customer_success_manager)
              : undefined
          }
          ce={
            account?.customer_engineer
              ? String(account.customer_engineer)
              : undefined
          }
          engineer={
            account?.assigned_engineer
              ? String(account.assigned_engineer)
              : undefined
          }
          isLoading={accountLoading}
        />
        <SlackChannel accountName={accountName} />
      </div>

      <Meetings
        meetings={meetings}
        isLoading={meetingsLoading}
        accountName={accountName}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <JiraTickets accountName={accountName} />
        <PylonTickets accountName={accountName} />
      </div>

      <Collapsible
        open={isUserActivityOpen}
        onOpenChange={setIsUserActivityOpen}
      >
        <Card>
          <CardHeader>
            <CollapsibleTrigger className="flex items-center justify-between w-full hover:opacity-80 transition-opacity">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">
                    User Activity ({dateStart} → {dateEnd})
                  </CardTitle>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                    <IconCalendarTime className="h-3 w-3" /> date filtered
                  </span>
                </div>
                <CardDescription className="mt-1.5">
                  Builder users from {accountName} with their Fusion activity
                </CardDescription>
              </div>
              <IconChevronDown
                className={`h-5 w-5 transition-transform ${isUserActivityOpen ? "transform rotate-180" : ""}`}
              />
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              {personasLoading ? (
                <Skeleton className="h-80 w-full" />
              ) : personasData?.rows && personasData.rows.length > 0 ? (
                <div>
                  <h3 className="text-sm font-semibold mb-4">User Personas</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={personasData.rows.map((row: any) => ({
                          name: row.persona,
                          value: Number(row.user_count),
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry: any) => `${entry.name}: ${entry.value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {personasData.rows.map((row: any, index: number) => {
                          const colors: Record<string, string> = {
                            "Developer/Engineering": "#3b82f6",
                            Design: "#ec4899",
                            Product: "#10b981",
                            Other: "#6b7280",
                          };
                          return (
                            <Cell
                              key={`cell-${index}`}
                              fill={colors[row.persona] || colors.Other}
                            />
                          );
                        })}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : null}

              {usersLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Lifecycle Stage</TableHead>
                      <TableHead className="text-right">
                        Fusion Messages
                      </TableHead>
                      <TableHead>First Activity</TableHead>
                      <TableHead>Last Activity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersData?.rows?.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center text-muted-foreground py-8"
                        >
                          No user activity found for this period
                        </TableCell>
                      </TableRow>
                    ) : (
                      usersData?.rows?.map((user: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">
                            {user.email}
                          </TableCell>
                          <TableCell>{user.name || "—"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {user.jobtitle || "—"}
                          </TableCell>
                          <TableCell>
                            {user.lifecycle_stage_name && (
                              <Badge variant="outline">
                                {user.lifecycle_stage_name}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {user.fusion_messages}
                          </TableCell>
                          <TableCell>{user.first_activity || "—"}</TableCell>
                          <TableCell>{user.last_activity || "—"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
