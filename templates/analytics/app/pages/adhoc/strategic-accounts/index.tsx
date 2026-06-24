import { useState } from "react";
import { Link } from "react-router";
import {
  IconBuilding,
  IconTrendingUp,
  IconAlertCircle,
  IconCircleCheck,
  IconClock,
  IconExternalLink,
} from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMetricsQuery } from "@/lib/query-metrics";
import { getAccountsOverviewQuery, getFusionUsageQuery } from "./queries";

const STRATEGIC_ACCOUNTS = [
  "Walmart",
  "Thales",
  "ServiceNow",
  "Optum/UHG",
  "Netflix",
  "Nasdaq",
  "KPMG",
  "Intuit",
  "Deloitte",
  "CBRE Group",
  "Anheuser-Busch",
  "Amazon",
  "Western Union",
  "WebMD Health",
  "Swiss Re",
  "Schneider",
  "Roku",
  "Rakuten",
  "OCBC Bank",
  "NTT Data",
  "Nationwide",
  "J.D. Power",
  "ClickUp",
  "Caesars",
  "Bayer",
];

type DeploymentStatus =
  | "onboarding"
  | "blocked"
  | "live_low"
  | "live_healthy"
  | "unknown";
type ExpansionStrategy =
  | "top_down"
  | "team_by_team"
  | "adoption_led"
  | "unknown";

function getDeploymentBadge(status: DeploymentStatus) {
  const variants = {
    onboarding: {
      color: "bg-blue-500/10 text-blue-700 border-blue-200",
      icon: IconClock,
      label: "Onboarding",
    },
    blocked: {
      color: "bg-red-500/10 text-red-700 border-red-200",
      icon: IconAlertCircle,
      label: "Blocked",
    },
    live_low: {
      color: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
      icon: IconTrendingUp,
      label: "Live, Low Adoption",
    },
    live_healthy: {
      color: "bg-green-500/10 text-green-700 border-green-200",
      icon: IconCircleCheck,
      label: "Live, Healthy",
    },
    unknown: {
      color: "bg-gray-500/10 text-gray-700 border-gray-200",
      icon: IconAlertCircle,
      label: "Unknown",
    },
  };
  const variant = variants[status];
  const Icon = variant.icon;
  return (
    <Badge
      variant="outline"
      className={`${variant.color} flex items-center gap-1`}
    >
      <Icon className="h-3 w-3" />
      {variant.label}
    </Badge>
  );
}

function getStrategyBadge(strategy: ExpansionStrategy) {
  const variants = {
    top_down: {
      color: "bg-purple-500/10 text-purple-700 border-purple-200",
      label: "Top-Down / ELA",
    },
    team_by_team: {
      color: "bg-orange-500/10 text-orange-700 border-orange-200",
      label: "Team by Team",
    },
    adoption_led: {
      color: "bg-cyan-500/10 text-cyan-700 border-cyan-200",
      label: "Adoption-Led",
    },
    unknown: {
      color: "bg-gray-500/10 text-gray-700 border-gray-200",
      label: "Not Set",
    },
  };
  const variant = variants[strategy];
  return (
    <Badge variant="outline" className={variant.color}>
      {variant.label}
    </Badge>
  );
}

interface AccountCardProps {
  name: string;
  deploymentStatus?: DeploymentStatus;
  strategy?: ExpansionStrategy;
  fusionUsers?: number;
  fusionMessages?: number;
  currentARR?: number;
  renewalDate?: string;
  renewalStatus?: "on_track" | "at_risk";
  openDeals?: number;
  openDealsValue?: number;
}

function AccountCard({
  name,
  deploymentStatus = "unknown",
  strategy = "unknown",
  fusionUsers = 0,
  fusionMessages = 0,
  currentARR,
  renewalDate,
  renewalStatus,
  openDeals = 0,
  openDealsValue = 0,
}: AccountCardProps) {
  const accountSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <Link to={`/adhoc/strategic-accounts/${accountSlug}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <IconBuilding className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">{name}</CardTitle>
            </div>
            <IconExternalLink className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardDescription className="flex flex-wrap gap-2 mt-2">
            {getDeploymentBadge(deploymentStatus)}
            {getStrategyBadge(strategy)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Fusion (90d)</span>
            <div className="font-medium">
              {fusionUsers > 0 ? (
                <span>
                  {fusionUsers} users · {fusionMessages} msgs
                </span>
              ) : (
                <span className="text-muted-foreground">No usage</span>
              )}
            </div>
          </div>

          {currentARR !== undefined && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Current ARR</span>
              <span className="font-medium">
                ${(currentARR / 1000).toFixed(0)}K
              </span>
            </div>
          )}

          {openDeals > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Open Deals</span>
              <span className="font-medium">
                {openDeals} · ${(openDealsValue / 1000).toFixed(0)}K
              </span>
            </div>
          )}

          {renewalDate && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Renewal</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{renewalDate}</span>
                {renewalStatus === "at_risk" && (
                  <Badge
                    variant="outline"
                    className="bg-red-500/10 text-red-700 border-red-200 text-xs"
                  >
                    At Risk
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function LoadingCard() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex gap-2 mt-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-32" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
    </Card>
  );
}

export default function StrategicAccountsOverview() {
  const [dateRange] = useState({ days: 90 });

  const { data: accountsData, isLoading } = useMetricsQuery(
    ["strategic-accounts-overview", String(dateRange.days)],
    getAccountsOverviewQuery(STRATEGIC_ACCOUNTS, dateRange.days),
  );

  const { data: fusionData, isLoading: fusionLoading } = useMetricsQuery(
    ["strategic-accounts-fusion", String(dateRange.days)],
    getFusionUsageQuery(STRATEGIC_ACCOUNTS, dateRange.days),
  );

  const accountDataMap = new Map(
    accountsData?.rows?.map((row: any) => [row.company_name, row]) || [],
  );

  const fusionDataMap = new Map(
    fusionData?.rows?.map((row: any) => [row.company_name, row]) || [],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Strategic Accounts
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of {STRATEGIC_ACCOUNTS.length} focus accounts tracked per the
          Focus Account Rhythm framework
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Accounts</CardDescription>
            <CardTitle className="text-3xl">
              {STRATEGIC_ACCOUNTS.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Fusion Users (90d)</CardDescription>
            {fusionLoading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <CardTitle className="text-3xl">
                {fusionData?.rows?.reduce(
                  (sum: number, row: any) => sum + (row.unique_users || 0),
                  0,
                ) || 0}
              </CardTitle>
            )}
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Accounts with Fusion Usage</CardDescription>
            {fusionLoading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <CardTitle className="text-3xl">
                {fusionData?.rows?.filter((row: any) => row.unique_users > 0)
                  .length || 0}
              </CardTitle>
            )}
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>
              Total Open Qualified Pipeline (FY27)
            </CardDescription>
            {isLoading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <CardTitle className="text-3xl">
                $
                {Math.round(
                  accountsData?.rows?.reduce(
                    (sum: number, row: any) =>
                      sum + (Number(row.total_pipeline) || 0),
                    0,
                  ) || 0,
                ).toLocaleString()}
              </CardTitle>
            )}
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading || fusionLoading
          ? Array.from({ length: 6 }).map((_, i) => <LoadingCard key={i} />)
          : STRATEGIC_ACCOUNTS.map((accountName) => {
              const hubspotData = accountDataMap.get(accountName);
              const fusionUsage = fusionDataMap.get(accountName);

              return (
                <AccountCard
                  key={accountName}
                  name={accountName}
                  deploymentStatus={
                    hubspotData?.deployment_status as DeploymentStatus
                  }
                  strategy={
                    hubspotData?.expansion_strategy as ExpansionStrategy
                  }
                  fusionUsers={fusionUsage?.unique_users}
                  fusionMessages={fusionUsage?.total_messages}
                  currentARR={hubspotData?.current_arr}
                  renewalDate={hubspotData?.renewal_date}
                  renewalStatus={hubspotData?.renewal_status}
                  openDeals={hubspotData?.open_deals_count}
                  openDealsValue={hubspotData?.open_deals_value}
                />
              );
            })}
      </div>
    </div>
  );
}
