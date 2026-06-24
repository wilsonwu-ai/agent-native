import { useMemo } from "react";
import { useParams, Link } from "react-router";
import {
  IconArrowLeft,
  IconAlertCircle,
  IconUsers,
  IconMessageCircle,
  IconTrendingUp,
  IconClock,
  IconDownload,
} from "@tabler/icons-react";
import { useMetricsQuery } from "@/lib/query-metrics";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/dashboard/DataTable";
import { TimeSeriesChart } from "@/components/dashboard/TimeSeriesChart";
import {
  getAccountUserEngagementQuery,
  getAccountDailyActivityQuery,
} from "./queries";

const DAYS = 90;

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

interface UserActivity {
  user_email: string;
  total_events: number;
  chat_messages: number;
  code_applications: number;
  sessions: number;
  error_events: number;
  days_since_last_activity: number;
  days_active_span: number;
}

export default function EngagementAnalysis() {
  const { accountSlug } = useParams<{ accountSlug: string }>();
  const accountName = accountSlug
    ? ACCOUNT_NAMES[accountSlug] || accountSlug
    : "";

  const userActivitySql = useMemo(
    () => getAccountUserEngagementQuery(accountName, DAYS),
    [accountName],
  );
  const dailyActivitySql = useMemo(
    () => getAccountDailyActivityQuery(accountName, DAYS),
    [accountName],
  );

  const userActivity = useMetricsQuery(
    ["account-user-engagement", accountName, String(DAYS)],
    userActivitySql,
  );
  const dailyActivity = useMetricsQuery(
    ["account-daily-engagement", accountName, String(DAYS)],
    dailyActivitySql,
  );

  const insights = useMemo(() => {
    if (!userActivity.data?.rows) return null;
    const users = userActivity.data.rows as unknown as UserActivity[];
    const totalUsers = users.length;
    if (totalUsers === 0) return null;
    const activeLastWeek = users.filter(
      (u) => u.days_since_last_activity <= 7,
    ).length;
    const dormant = users.filter((u) => u.days_since_last_activity > 14).length;
    const powerUsers = users.filter((u) => u.chat_messages >= 20).length;
    const totalMessages = users.reduce(
      (sum, u) => sum + Number(u.chat_messages || 0),
      0,
    );
    const avgMessagesPerUser = totalMessages / totalUsers;
    return {
      totalUsers,
      activeLastWeek,
      dormant,
      powerUsers,
      totalMessages,
      avgMessagesPerUser,
      users,
    };
  }, [userActivity.data]);

  const segments = useMemo(() => {
    if (!insights) return null;
    return {
      powerUsers: insights.users.filter((u) => u.chat_messages >= 20),
      trialUsers: insights.users.filter(
        (u) => u.days_active_span <= 7 && u.chat_messages < 10,
      ),
      dormantUsers: insights.users.filter(
        (u) => u.days_since_last_activity > 14 && u.chat_messages > 0,
      ),
      recentlyActive: insights.users.filter(
        (u) => u.days_since_last_activity <= 7 && u.chat_messages < 20,
      ),
    };
  }, [insights]);

  const recommendations = useMemo(() => {
    if (!insights || !segments) return null;
    const dormantRate = insights.dormant / insights.totalUsers;
    const powerUserRate = insights.powerUsers / insights.totalUsers;
    const hasHighErrors =
      segments.dormantUsers.filter((u) => u.error_events > 0).length > 0;
    const avgMsgPerUser = insights.avgMessagesPerUser;
    return {
      thisWeek: [
        powerUserRate > 0.2
          ? `Contact top ${Math.min(5, segments.powerUsers.length)} power users for testimonials and success stories`
          : `Identify and nurture ${Math.min(3, segments.recentlyActive.length)} most active users to become champions`,
        dormantRate > 0.3
          ? `Priority: Re-engage ${insights.dormant} dormant users — ${(dormantRate * 100).toFixed(0)}% of user base at risk`
          : `Send advanced tips to ${segments.recentlyActive.length} recently active users`,
        hasHighErrors
          ? `Urgent: Contact ${segments.dormantUsers.filter((u) => u.error_events > 0).length} users experiencing errors`
          : `Schedule check-in with users showing decreased activity`,
        segments.trialUsers.length > 5
          ? `Onboard ${segments.trialUsers.length} new users with welcome email series`
          : `Send best practices guide to active users`,
      ],
      thisMonth: [
        avgMsgPerUser > 50
          ? `Host advanced workflows webinar — users averaging ${avgMsgPerUser.toFixed(0)} msgs show deep engagement`
          : `Create onboarding workshop to boost adoption`,
        powerUserRate > 0.15
          ? `Launch customer advisory board with ${segments.powerUsers.length} power users`
          : `Build use case library from active user workflows`,
        dormantRate > 0.4
          ? `Run re-activation campaign — focus on understanding blockers`
          : `Quarterly business review with stakeholders`,
        insights.totalUsers > 20
          ? `Identify department champions to drive org-wide adoption`
          : `Scale adoption to additional teams`,
      ],
      thisQuarter: [
        powerUserRate > 0.25
          ? `Feature ${accountName} in customer success story — strong power user base`
          : `Develop case study highlighting ROI and productivity gains`,
        insights.totalMessages > 1000
          ? `Executive briefing: ${insights.totalMessages.toLocaleString()} messages show strong adoption`
          : `Present usage metrics and expansion opportunities to leadership`,
        dormantRate < 0.3
          ? `Launch expansion campaign to additional departments`
          : `Implement churn prevention program before expanding`,
        avgMsgPerUser > 40
          ? `Invite top users to product roadmap preview and beta programs`
          : `Create certification program to drive deeper engagement`,
      ],
    };
  }, [insights, segments, accountName]);

  const isLoading = userActivity.isLoading || dailyActivity.isLoading;
  const hasError = userActivity.data?.error || dailyActivity.data?.error;

  const lastUpdated = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to={`/adhoc/strategic-accounts/${accountSlug}`}>
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <IconArrowLeft className="h-4 w-4" />
            Back to {accountName}
          </button>
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {accountName} — User Engagement Analysis & Recommendations
          </h1>
          <p className="text-muted-foreground mt-2">
            Analysis Period: Last {DAYS} days | Last Updated: {lastUpdated}
          </p>
        </div>
        <Button
          onClick={() => window.print()}
          variant="outline"
          className="print:hidden"
        >
          <IconDownload className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </div>

      {hasError && (
        <Alert variant="destructive">
          <IconAlertCircle className="h-4 w-4" />
          <AlertDescription>
            {userActivity.data?.error || dailyActivity.data?.error}
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : insights ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Active Users
              </CardTitle>
              <IconUsers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{insights.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {insights.activeLastWeek} active last 7 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Messages
              </CardTitle>
              <IconMessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {insights.totalMessages.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Avg {insights.avgMessagesPerUser.toFixed(1)} per user
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Power Users</CardTitle>
              <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{insights.powerUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                20+ messages sent
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Dormant Users
              </CardTitle>
              <IconClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{insights.dormant}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Inactive 14+ days
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Alert>
          <IconAlertCircle className="h-4 w-4" />
          <AlertDescription>
            No Fusion activity found for {accountName} in the last {DAYS} days.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TimeSeriesChart
          title="Daily Active Users"
          data={dailyActivity.data?.rows || []}
          xKey="date"
          yKey="active_users"
          color="#3b82f6"
          isLoading={dailyActivity.isLoading}
          error={dailyActivity.data?.error}
        />
        <TimeSeriesChart
          title="Daily Chat Messages"
          data={dailyActivity.data?.rows || []}
          xKey="date"
          yKey="chat_messages"
          color="#10b981"
          isLoading={dailyActivity.isLoading}
          error={dailyActivity.data?.error}
        />
      </div>

      {insights && (
        <Card className="border-blue-500/20 bg-blue-950/20">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              Activity Trends Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-card border">
                <h4 className="font-semibold mb-2 text-sm">
                  Engagement Distribution
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>Power Users (20+ messages):</span>
                    <span className="font-semibold">
                      {insights.powerUsers} users (
                      {(
                        (insights.powerUsers / insights.totalUsers) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Recently Active (last 7 days):</span>
                    <span className="font-semibold">
                      {insights.activeLastWeek} users (
                      {(
                        (insights.activeLastWeek / insights.totalUsers) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Dormant (14+ days inactive):</span>
                    <span className="font-semibold">
                      {insights.dormant} users (
                      {((insights.dormant / insights.totalUsers) * 100).toFixed(
                        1,
                      )}
                      %)
                    </span>
                  </li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-card border">
                <h4 className="font-semibold mb-2 text-sm">Usage Intensity</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>Average messages per user:</span>
                    <span className="font-semibold">
                      {insights.avgMessagesPerUser.toFixed(1)}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Total message volume:</span>
                    <span className="font-semibold">
                      {insights.totalMessages.toLocaleString()}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Daily active rate:</span>
                    <span className="font-semibold">
                      {(
                        (insights.activeLastWeek / insights.totalUsers) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {insights && recommendations && (
        <Card className="border-green-500/20 bg-green-950/20">
          <CardHeader>
            <CardTitle className="text-xl">
              Recommended Immediate Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-card border">
                <h4 className="font-semibold mb-3 text-sm">This Week</h4>
                <ul className="space-y-2 text-sm">
                  {recommendations.thisWeek.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">✓</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-card border">
                <h4 className="font-semibold mb-3 text-sm">This Month</h4>
                <ul className="space-y-2 text-sm">
                  {recommendations.thisMonth.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">→</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-card border">
                <h4 className="font-semibold mb-3 text-sm">This Quarter</h4>
                <ul className="space-y-2 text-sm">
                  {recommendations.thisQuarter.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-purple-400 mt-0.5">◆</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {segments && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">
            User Segmentation & Outreach Recommendations
          </h2>

          {segments.powerUsers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Power Users ({segments.powerUsers.length})
                </CardTitle>
                <CardDescription>
                  Sent <strong>20+ chat messages</strong> at any point in the
                  last {DAYS} days. These are your champions and advocates.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={
                    segments.powerUsers.slice(0, 15) as unknown as Record<
                      string,
                      unknown
                    >[]
                  }
                  columns={[
                    "user_email",
                    "chat_messages",
                    "code_applications",
                    "days_since_last_activity",
                  ]}
                />
              </CardContent>
            </Card>
          )}

          {segments.recentlyActive.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Recently Active Users ({segments.recentlyActive.length})
                </CardTitle>
                <CardDescription>
                  <strong>All users active in the last 7 days</strong> who have
                  sent fewer than 20 messages (Power Users excluded). Nurture
                  them to increase engagement.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={
                    segments.recentlyActive.slice(0, 15) as unknown as Record<
                      string,
                      unknown
                    >[]
                  }
                  columns={[
                    "user_email",
                    "chat_messages",
                    "sessions",
                    "days_since_last_activity",
                  ]}
                />
              </CardContent>
            </Card>
          )}

          {segments.dormantUsers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Dormant Users ({segments.dormantUsers.length})
                </CardTitle>
                <CardDescription>
                  Sent at least one message in the last {DAYS} days but have{" "}
                  <strong>not been active in 14+ days</strong>. Re-engagement
                  opportunity.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={
                    segments.dormantUsers.slice(0, 15) as unknown as Record<
                      string,
                      unknown
                    >[]
                  }
                  columns={[
                    "user_email",
                    "chat_messages",
                    "days_since_last_activity",
                    "error_events",
                  ]}
                />
              </CardContent>
            </Card>
          )}

          {segments.trialUsers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Trial / New Users ({segments.trialUsers.length})
                </CardTitle>
                <CardDescription>
                  First and last activity within a <strong>7-day window</strong>{" "}
                  AND fewer than 10 messages total. Early exploratory users.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={
                    segments.trialUsers.slice(0, 15) as unknown as Record<
                      string,
                      unknown
                    >[]
                  }
                  columns={[
                    "user_email",
                    "chat_messages",
                    "days_active_span",
                    "sessions",
                  ]}
                />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Active Users — Detailed View</CardTitle>
          <CardDescription>
            Complete user activity breakdown for the analysis period
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userActivity.isLoading ? (
            <Skeleton className="h-[400px] w-full" />
          ) : userActivity.data?.rows && userActivity.data.rows.length > 0 ? (
            <DataTable
              data={userActivity.data.rows as Record<string, unknown>[]}
              columns={[
                "user_email",
                "chat_messages",
                "code_applications",
                "sessions",
                "error_events",
                "days_since_last_activity",
                "total_events",
              ]}
            />
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              {userActivity.data?.error
                ? "Error loading data"
                : "No users found with activity in the selected period"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
