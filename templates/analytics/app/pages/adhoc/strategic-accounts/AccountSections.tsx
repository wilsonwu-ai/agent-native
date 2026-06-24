import { useState } from "react";
import {
  STRATEGIC_ACCOUNTS,
  type Contact as RecommendationContact,
} from "./data";
import { AccountCoverageModule } from "./AccountCoverageModule";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { getIdToken } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconUsers,
  IconDeviceFloppy,
  IconExternalLink,
  IconCalendar,
  IconMessageCircle,
  IconCircleCheck,
  IconClock,
  IconTrendingUp,
  IconAlertCircle,
  IconCircleX,
  IconActivity,
  IconPlayerPlay,
  IconBan,
  IconBug,
  IconTicket,
} from "@tabler/icons-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCompactCurrency } from "@/lib/utils";

interface AccountTeamProps {
  accountOwner?: string;
  csm?: string;
  ce?: string;
  engineer?: string;
  isLoading?: boolean;
}

export function AccountTeam({
  accountOwner,
  csm,
  ce,
  engineer,
  isLoading,
}: AccountTeamProps) {
  const teamMembers = [
    {
      role: "Account Executive",
      name: accountOwner,
      email: accountOwner
        ? `${accountOwner.toLowerCase().replace(/\s+/g, ".")}@builder.io`
        : undefined,
    },
    {
      role: "Customer Success Manager",
      name: csm,
      email: csm
        ? `${csm.toLowerCase().replace(/\s+/g, ".")}@builder.io`
        : undefined,
    },
    {
      role: "Customer Engineer",
      name: ce,
      email: ce
        ? `${ce.toLowerCase().replace(/\s+/g, ".")}@builder.io`
        : undefined,
    },
    {
      role: "Assigned Engineer",
      name: engineer,
      email: engineer
        ? `${engineer.toLowerCase().replace(/\s+/g, ".")}@builder.io`
        : undefined,
    },
  ].filter((member) => member.name);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <IconUsers className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Account Team</CardTitle>
        </div>
        <CardDescription>
          Builder team members supporting this account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : teamMembers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No team members assigned
          </p>
        ) : (
          <div className="space-y-3">
            {teamMembers.map((member, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg border border-border"
              >
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
                {member.email && (
                  <a
                    href={`mailto:${member.email}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {member.email}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface SlackChannelProps {
  accountName: string;
}

export function SlackChannel({ accountName }: SlackChannelProps) {
  const channelName = `customer-${accountName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const slackUrl = `https://builder-io.slack.com/archives/${channelName}`;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <IconMessageCircle className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Slack Channel</CardTitle>
        </div>
        <CardDescription>Dedicated customer channel</CardDescription>
      </CardHeader>
      <CardContent>
        <a
          href={slackUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-4 rounded-lg border border-border hover:bg-muted transition-colors"
        >
          <div className="flex-1">
            <p className="font-mono text-sm">#{channelName}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Internal discussion channel
            </p>
          </div>
          <IconExternalLink className="h-4 w-4 text-muted-foreground" />
        </a>
      </CardContent>
    </Card>
  );
}

interface ExpansionStrategyProps {
  accountName: string;
  companyId?: string;
}

export function ExpansionStrategy({
  accountName,
  companyId,
}: ExpansionStrategyProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["hubspot-expansion-thesis", companyId],
    queryFn: async () => {
      if (!companyId) return null;
      const token = await getIdToken();
      const res = await fetch(`/api/hubspot/companies/${companyId}`, {
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      });
      if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
      return res.json() as Promise<{
        expansion_thesis: string | null;
        name: string | null;
      }>;
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  });

  const expansionThesis = data?.expansion_thesis;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expansion Strategy</CardTitle>
        <CardDescription>Expansion thesis from HubSpot</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">
            Failed to load expansion thesis from HubSpot.
          </p>
        ) : !companyId ? (
          <p className="text-sm text-muted-foreground">
            No HubSpot company linked to this account.
          </p>
        ) : !expansionThesis ? (
          <p className="text-sm text-muted-foreground italic">
            No expansion thesis has been set in HubSpot for this account.
          </p>
        ) : (
          <p className="text-sm whitespace-pre-wrap leading-relaxed">
            {expansionThesis}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface Meeting {
  id: string;
  title: string;
  startTime: string;
  endTime?: string;
  status: "completed" | "scheduled";
  builderAttendees: string[];
  customerAttendees: string[];
  notes?: string;
}

interface MeetingsProps {
  meetings: Meeting[];
  isLoading?: boolean;
  accountName?: string;
}

function MeetingDetailDialog({
  meeting,
  accountName,
  open,
  onClose,
}: {
  meeting: Meeting | null;
  accountName: string;
  open: boolean;
  onClose: () => void;
}) {
  const { data: gongData, isLoading: gongLoading } = useQuery({
    queryKey: ["gong-match", meeting?.id],
    queryFn: async () => {
      if (!meeting) return null;
      const token = await getIdToken();
      const meetingDate = new Date(meeting.startTime);
      const from = new Date(
        meetingDate.getTime() - 2 * 24 * 60 * 60 * 1000,
      ).toISOString();
      const to = new Date(
        meetingDate.getTime() + 2 * 24 * 60 * 60 * 1000,
      ).toISOString();
      const res = await fetch(
        `/api/gong/calls?company=${encodeURIComponent(accountName)}&days=90`,
        {
          headers: { ...(token && { Authorization: `Bearer ${token}` }) },
        },
      );
      if (!res.ok) return null;
      const data = await res.json();
      const calls: any[] = data.calls || [];
      const fromMs = new Date(from).getTime();
      const toMs = new Date(to).getTime();
      const nearby = calls.filter((c) => {
        const t = new Date(c.started).getTime();
        return t >= fromMs && t <= toMs;
      });
      if (nearby.length === 0) return null;
      const match = nearby[0];
      const detailRes = await fetch(`/api/gong/calls/${match.id}/detail`, {
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      });
      return detailRes.ok ? detailRes.json() : null;
    },
    enabled: !!meeting && open,
    staleTime: 10 * 60 * 1000,
  });

  if (!meeting) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="pr-8">{meeting.title}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {new Date(meeting.startTime).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                Builder Team
              </p>
              {meeting.builderAttendees.length > 0 ? (
                meeting.builderAttendees.map((a, i) => (
                  <p key={i} className="text-sm">
                    {a}
                  </p>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">—</p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                Customer
              </p>
              {meeting.customerAttendees.length > 0 ? (
                meeting.customerAttendees.map((a, i) => (
                  <p key={i} className="text-sm">
                    {a}
                  </p>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">—</p>
              )}
            </div>
          </div>

          {meeting.notes && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Meeting Notes
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {meeting.notes}
              </p>
            </div>
          )}

          {gongLoading ? (
            <div className="space-y-2 pt-2 border-t border-border">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : gongData ? (
            <div className="pt-4 border-t border-border space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Gong Call Summary
                </p>
                <a
                  href={gongData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  View recording <IconExternalLink className="h-3 w-3" />
                </a>
              </div>
              {gongData.brief && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {gongData.brief}
                </p>
              )}
              {gongData.keyPoints?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold mb-2">
                    Key Points & Next Steps
                  </p>
                  <ul className="space-y-1.5">
                    {gongData.keyPoints.map((kp: string, i: number) => (
                      <li
                        key={i}
                        className="text-sm text-muted-foreground flex gap-2"
                      >
                        <span className="text-foreground shrink-0">•</span>
                        <span>{kp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : !meeting.notes ? (
            <p className="text-sm text-muted-foreground italic">
              No notes or call recording found for this meeting.
            </p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function Meetings({
  meetings = [],
  isLoading,
  accountName = "",
}: MeetingsProps) {
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const upcomingMeetings = meetings.filter((m) => m.status === "scheduled");
  const completedMeetings = meetings.filter((m) => m.status === "completed");

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconCalendar className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Meetings</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <MeetingDetailDialog
        meeting={selectedMeeting}
        accountName={accountName}
        open={!!selectedMeeting}
        onClose={() => setSelectedMeeting(null)}
      />
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconCalendar className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Meetings</CardTitle>
          </div>
          <CardDescription>
            External meetings with customer stakeholders from HubSpot
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {upcomingMeetings.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                Upcoming ({upcomingMeetings.length})
              </h3>
              <div className="space-y-2">
                {upcomingMeetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium">{meeting.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(meeting.startTime).toLocaleString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-blue-500/10 text-blue-700 border-blue-200"
                      >
                        Scheduled
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">
                          Builder Team
                        </p>
                        <p>{meeting.builderAttendees.join(", ") || "—"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Customer</p>
                        <p>{meeting.customerAttendees.join(", ") || "—"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {completedMeetings.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                Recent Completed ({completedMeetings.slice(0, 5).length})
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Meeting</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Builder Attendees</TableHead>
                    <TableHead>Customer Attendees</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedMeetings.slice(0, 5).map((meeting) => (
                    <TableRow
                      key={meeting.id}
                      className="cursor-pointer hover:bg-muted/60 transition-colors"
                      onClick={() => setSelectedMeeting(meeting)}
                    >
                      <TableCell className="font-medium">
                        <span className="hover:text-primary transition-colors">
                          {meeting.title}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(meeting.startTime).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {meeting.builderAttendees.slice(0, 2).join(", ")}
                        {meeting.builderAttendees.length > 2 &&
                          ` +${meeting.builderAttendees.length - 2}`}
                      </TableCell>
                      <TableCell className="text-sm">
                        {meeting.customerAttendees.slice(0, 2).join(", ")}
                        {meeting.customerAttendees.length > 2 &&
                          ` +${meeting.customerAttendees.length - 2}`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="text-xs text-muted-foreground mt-2">
                Click a row to view meeting notes and call summary
              </p>
            </div>
          )}

          {meetings.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No meetings found in HubSpot for this account
            </p>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export type DeploymentStatusType =
  | "onboarding"
  | "blocked"
  | "live-low"
  | "live-healthy";

interface TeamDeployment {
  id: string;
  teamName?: string;
  status: DeploymentStatusType;
  notes?: string;
}

interface DeploymentStatusProps {
  accountName: string;
}

export function DeploymentStatus({ accountName }: DeploymentStatusProps) {
  const statusConfig = {
    onboarding: {
      label: "Onboarding",
      defaultNotes:
        "Target onboarding complete date: [date]\nKey blockers: [list any issues]\nNext milestone: [describe]",
      icon: IconClock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-200",
    },
    blocked: {
      label: "Blocked",
      defaultNotes:
        "Blocker: [describe the issue]\nOwner: [who is addressing this]\nExpected resolution: [timeline]",
      icon: IconAlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-200",
    },
    "live-low": {
      label: "Live, low adoption",
      defaultNotes:
        "Current usage: [metrics]\nTarget usage: [goal]\nPlan to increase adoption: [actions]",
      icon: IconCircleX,
      color: "text-orange-600",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-200",
    },
    "live-healthy": {
      label: "Live, healthy adoption",
      defaultNotes:
        "Current metrics: [usage stats]\nGrowth trend: [up/stable/down]\nNext expansion opportunity: [describe]",
      icon: IconCircleCheck,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-200",
    },
  };

  const [teams, setTeams] = useState<TeamDeployment[]>(() => {
    const saved = localStorage.getItem(`deployment-status-${accountName}`);
    if (!saved) {
      return [
        {
          id: crypto.randomUUID(),
          status: "onboarding",
          notes: statusConfig["onboarding"].defaultNotes,
        },
      ];
    }

    try {
      const parsed = JSON.parse(saved);
      if (typeof parsed === "string") {
        const status = parsed as DeploymentStatusType;
        return [
          {
            id: crypto.randomUUID(),
            status,
            notes: statusConfig[status].defaultNotes,
          },
        ];
      }
      const loadedTeams = parsed.teams || [
        { id: crypto.randomUUID(), status: "onboarding" },
      ];
      return loadedTeams.map((team: TeamDeployment) => ({
        ...team,
        notes: team.notes || statusConfig[team.status].defaultNotes,
      }));
    } catch {
      const status = saved as DeploymentStatusType;
      return [
        {
          id: crypto.randomUUID(),
          status,
          notes: statusConfig[status].defaultNotes,
        },
      ];
    }
  });

  const saveTeams = (updatedTeams: TeamDeployment[]) => {
    setTeams(updatedTeams);
    localStorage.setItem(
      `deployment-status-${accountName}`,
      JSON.stringify({ teams: updatedTeams }),
    );
  };

  const handleUpdateTeam = (id: string, updates: Partial<TeamDeployment>) => {
    const updatedTeams = teams.map((t) => {
      if (t.id !== id) return t;
      const updated = { ...t, ...updates };
      if (updates.status && updates.status !== t.status && !updated.notes) {
        updated.notes = statusConfig[updates.status].defaultNotes;
      }
      return updated;
    });
    saveTeams(updatedTeams);
  };

  const handleAddTeam = () => {
    const newTeam: TeamDeployment = {
      id: crypto.randomUUID(),
      status: "onboarding",
      notes: statusConfig["onboarding"].defaultNotes,
    };
    saveTeams([...teams, newTeam]);
  };

  const handleDeleteTeam = (id: string) => {
    if (teams.length === 1) return;
    saveTeams(teams.filter((t) => t.id !== id));
  };

  const hasMultipleTeams = teams.length >= 2;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <IconActivity className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Deployment Status</CardTitle>
        </div>
        <CardDescription>
          Current deployment and adoption status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {teams.map((team, index) => {
          const currentConfig = statusConfig[team.status];
          const Icon = currentConfig.icon;

          return (
            <div key={team.id} className="space-y-3">
              {hasMultipleTeams && (
                <input
                  type="text"
                  value={team.teamName || ""}
                  onChange={(e) =>
                    handleUpdateTeam(team.id, { teamName: e.target.value })
                  }
                  className="w-full px-2 py-1 text-sm rounded border border-border bg-background"
                  placeholder="Team name..."
                />
              )}

              <Select
                value={team.status}
                onValueChange={(value: DeploymentStatusType) =>
                  handleUpdateTeam(team.id, { status: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <config.icon className={`h-4 w-4 ${config.color}`} />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div
                className={`p-4 rounded-lg border ${currentConfig.borderColor} ${currentConfig.bgColor} relative`}
              >
                <div className="flex items-start gap-3">
                  <Icon
                    className={`h-5 w-5 ${currentConfig.color} flex-shrink-0 mt-0.5`}
                  />
                  <div className="flex-1 space-y-2">
                    <p className={`font-medium ${currentConfig.color}`}>
                      {currentConfig.label}
                    </p>
                    <Textarea
                      value={team.notes || currentConfig.defaultNotes}
                      onChange={(e) =>
                        handleUpdateTeam(team.id, { notes: e.target.value })
                      }
                      className="text-sm min-h-[120px] resize-none bg-background/50"
                      rows={5}
                    />
                  </div>
                  {hasMultipleTeams && (
                    <Button
                      onClick={() => handleDeleteTeam(team.id)}
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-red-600 flex-shrink-0"
                    >
                      <IconCircleX className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {index < teams.length - 1 && (
                <div className="border-b border-border" />
              )}
            </div>
          );
        })}

        <Button
          onClick={handleAddTeam}
          size="sm"
          variant="outline"
          className="w-full text-xs"
        >
          + Add Team
        </Button>
      </CardContent>
    </Card>
  );
}

export interface Deal {
  deal_id: string;
  dealname?: string;
  amount: number;
  pipeline_label?: string;
  dealtype?: string;
  stage_name: string;
  close_date: string;
}

interface OpenDealsProps {
  deals: Deal[];
  isLoading?: boolean;
}

interface Contact {
  id: string;
  role:
    | "Champion"
    | "Enabler"
    | "Exec Sponsor"
    | "Economic Buyer"
    | "Influencer"
    | "Blocker";
  name: string;
  title: string;
  lastActivity: string;
  email?: string;
  hubspotId?: string;
}

interface RelationshipContactsProps {
  accountName: string;
}

interface HubSpotContact {
  id: string;
  properties: {
    email: string | null;
    firstname: string | null;
    lastname: string | null;
    jobtitle: string | null;
  };
}

function HubSpotIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M18.164 7.93V5.084a2.198 2.198 0 0 0 1.268-1.978V3.06A2.198 2.198 0 0 0 17.234.864h-.047a2.198 2.198 0 0 0-2.198 2.198v.047a2.198 2.198 0 0 0 1.268 1.978V7.93a6.232 6.232 0 0 0-2.963 1.303L5.19 3.48a2.44 2.44 0 1 0-1.08 1.403l8.001 5.671a6.23 6.23 0 0 0-.97 3.344 6.232 6.232 0 0 0 1.098 3.556l-2.434 2.434a1.956 1.956 0 1 0 1.176 1.176l2.434-2.434A6.24 6.24 0 1 0 18.164 7.93zm-.977 9.483a3.572 3.572 0 1 1 0-7.144 3.572 3.572 0 0 1 0 7.144z" />
    </svg>
  );
}

function HubSpotStatusCell({
  contact,
  onLink,
}: {
  contact: Contact;
  onLink: () => void;
}) {
  if (contact.hubspotId) {
    return (
      <div className="flex items-center justify-center">
        <span
          title="Linked to HubSpot"
          className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#FF7A59]/10 text-[#FF7A59] border border-[#FF7A59]/30"
        >
          <HubSpotIcon className="w-3.5 h-3.5 flex-shrink-0" />
          <IconCircleCheck className="w-3 h-3 flex-shrink-0" />
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center">
      <button
        onClick={onLink}
        title="Not linked to HubSpot — click to connect"
        className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-muted-foreground border border-border hover:border-[#FF7A59]/40 hover:text-[#FF7A59] hover:bg-[#FF7A59]/5 transition-colors"
      >
        <HubSpotIcon className="w-3.5 h-3.5 flex-shrink-0" />
        <IconExternalLink className="w-3 h-3 flex-shrink-0" />
      </button>
    </div>
  );
}

export function RelationshipContacts({
  accountName,
}: RelationshipContactsProps) {
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem(`relationship-contacts-${accountName}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [isAdding, setIsAdding] = useState(false);
  const [addMode, setAddMode] = useState<"hubspot" | "manual">("hubspot");
  const [searchQuery, setSearchQuery] = useState("");
  const [hubspotContacts, setHubspotContacts] = useState<HubSpotContact[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedHubSpotContact, setSelectedHubSpotContact] =
    useState<HubSpotContact | null>(null);
  const [linkingContactId, setLinkingContactId] = useState<string | null>(null);
  const [linkQuery, setLinkQuery] = useState("");
  const [linkHsContacts, setLinkHsContacts] = useState<HubSpotContact[]>([]);
  const [isLinkSearching, setIsLinkSearching] = useState(false);
  const [linkSearchError, setLinkSearchError] = useState<string | null>(null);
  const [newContact, setNewContact] = useState<Partial<Contact>>({
    role: "Champion",
    name: "",
    title: "",
    lastActivity: "",
  });

  const saveContacts = (updatedContacts: Contact[]) => {
    setContacts(updatedContacts);
    localStorage.setItem(
      `relationship-contacts-${accountName}`,
      JSON.stringify(updatedContacts),
    );
  };

  const searchHubSpotContacts = async () => {
    if (!accountName) return;
    setIsSearching(true);
    setSearchError(null);
    try {
      const response = await fetch(
        `/api/hubspot/contacts?company=${encodeURIComponent(accountName)}`,
      );
      const data = await response.json();
      if (!response.ok) {
        setSearchError(data.error || `Error: ${response.status}`);
        setHubspotContacts([]);
        return;
      }
      setHubspotContacts(
        (data.contacts || []).filter((c: any) => c && c.properties),
      );
    } catch (error) {
      setSearchError("Failed to fetch contacts from HubSpot");
      setHubspotContacts([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddFromHubSpot = () => {
    if (!selectedHubSpotContact) return;
    const { firstname, lastname, jobtitle, email } =
      selectedHubSpotContact.properties;
    const name = [firstname, lastname].filter(Boolean).join(" ") || "Unknown";
    const contact: Contact = {
      id: Date.now().toString(),
      role: newContact.role as Contact["role"],
      name,
      title: jobtitle || "No title",
      lastActivity: new Date().toISOString().split("T")[0],
      email: email || undefined,
      hubspotId: selectedHubSpotContact.id,
    };
    saveContacts([...contacts, contact]);
    setNewContact({ role: "Champion", name: "", title: "", lastActivity: "" });
    setSelectedHubSpotContact(null);
    setIsAdding(false);
    setSearchQuery("");
    setHubspotContacts([]);
  };

  const handleAddManual = () => {
    if (!newContact.name || !newContact.title) return;
    const contact: Contact = {
      id: Date.now().toString(),
      role: newContact.role as Contact["role"],
      name: newContact.name,
      title: newContact.title,
      lastActivity:
        newContact.lastActivity || new Date().toISOString().split("T")[0],
    };
    saveContacts([...contacts, contact]);
    setNewContact({ role: "Champion", name: "", title: "", lastActivity: "" });
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    saveContacts(contacts.filter((c) => c.id !== id));
  };

  const openLinkDialog = async (contactId: string) => {
    setLinkingContactId(contactId);
    setLinkQuery("");
    setLinkSearchError(null);
    setIsLinkSearching(true);
    try {
      const response = await fetch(
        `/api/hubspot/contacts?company=${encodeURIComponent(accountName)}`,
      );
      const data = await response.json();
      if (!response.ok) {
        setLinkSearchError(data.error || `Error: ${response.status}`);
        setLinkHsContacts([]);
      } else {
        setLinkHsContacts(
          (data.contacts || []).filter((c: any) => c && c.properties),
        );
      }
    } catch {
      setLinkSearchError("Failed to fetch HubSpot contacts");
      setLinkHsContacts([]);
    } finally {
      setIsLinkSearching(false);
    }
  };

  const handleLinkHubSpot = (hsContact: HubSpotContact) => {
    const { email } = hsContact.properties;
    saveContacts(
      contacts.map((c) =>
        c.id === linkingContactId
          ? { ...c, hubspotId: hsContact.id, email: email || c.email }
          : c,
      ),
    );
    setLinkingContactId(null);
  };

  const roleColors: Record<string, string> = {
    Champion: "bg-green-500/10 text-green-700 border-green-200",
    Enabler: "bg-teal-500/10 text-teal-700 border-teal-200",
    "Exec Sponsor": "bg-indigo-500/10 text-indigo-700 border-indigo-200",
    "Economic Buyer": "bg-blue-500/10 text-blue-700 border-blue-200",
    Influencer: "bg-purple-500/10 text-purple-700 border-purple-200",
    Blocker: "bg-red-500/10 text-red-700 border-red-200",
  };

  const coverageAccount = STRATEGIC_ACCOUNTS.find(
    (a) => a.name.toLowerCase() === accountName.toLowerCase(),
  );

  const titleByEmail = new Map(
    coverageAccount
      ? [
          ...coverageAccount.champions,
          ...coverageAccount.enablers,
          ...coverageAccount.execSponsors,
        ].map((c) => [c.email, c.title])
      : [],
  );

  const confirmedRoleToRecommendationRole: Record<string, string> = {
    Champion: "Champion",
    Enabler: "Enabler",
    "Exec Sponsor": "Exec Sponsor",
    Influencer: "Enabler",
    "Economic Buyer": "Exec Sponsor",
    Blocker: "",
  };

  const confirmedKeys = new Set(
    contacts
      .filter((c) => confirmedRoleToRecommendationRole[c.role])
      .map((c) => `${c.name}::${confirmedRoleToRecommendationRole[c.role]}`),
  );

  const handleConfirmRecommendation = (
    rec: RecommendationContact,
    roleName: string,
  ) => {
    if (confirmedKeys.has(`${rec.name}::${roleName}`)) return;
    const confirmed: Contact = {
      id: Date.now().toString(),
      role: roleName as Contact["role"],
      name: rec.name,
      title: rec.title,
      lastActivity: new Date().toISOString().split("T")[0],
      email: rec.email,
    };
    saveContacts([...contacts, confirmed]);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <IconUsers className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Key Relationships</CardTitle>
        </div>
        <CardDescription className="mt-1.5">
          Track champions, economic buyers, and influencers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Confirmed Coverage</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Contacts you've verified and are actively tracking
              </p>
            </div>
            {!isAdding && (
              <Button
                onClick={() => {
                  setIsAdding(true);
                  setAddMode("hubspot");
                  searchHubSpotContacts();
                }}
                size="sm"
                variant="outline"
              >
                Add Contact
              </Button>
            )}
          </div>

          {isAdding && (
            <div className="p-4 border border-border rounded-lg space-y-3 bg-muted/30">
              <div className="flex gap-2 mb-3">
                <Button
                  size="sm"
                  variant={addMode === "hubspot" ? "default" : "outline"}
                  onClick={() => {
                    setAddMode("hubspot");
                    if (hubspotContacts.length === 0) searchHubSpotContacts();
                  }}
                  className="text-xs"
                >
                  From HubSpot
                </Button>
                <Button
                  size="sm"
                  variant={addMode === "manual" ? "default" : "outline"}
                  onClick={() => setAddMode("manual")}
                  className="text-xs"
                >
                  Manual Entry
                </Button>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Role
                </label>
                <Select
                  value={newContact.role}
                  onValueChange={(value) =>
                    setNewContact({
                      ...newContact,
                      role: value as Contact["role"],
                    })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Champion">Champion</SelectItem>
                    <SelectItem value="Enabler">Enabler</SelectItem>
                    <SelectItem value="Exec Sponsor">Exec Sponsor</SelectItem>
                    <SelectItem value="Economic Buyer">
                      Economic Buyer
                    </SelectItem>
                    <SelectItem value="Influencer">Influencer</SelectItem>
                    <SelectItem value="Blocker">Blocker</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {addMode === "hubspot" ? (
                <>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Search Contacts
                    </label>
                    <div className="relative mt-1">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                        placeholder="Filter by name or title..."
                      />
                    </div>
                  </div>

                  {isSearching ? (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      Loading contacts...
                    </div>
                  ) : searchError ? (
                    <div className="text-sm text-red-600 text-center py-4 bg-red-50 rounded-md border border-red-200">
                      <p className="font-medium">Error loading contacts</p>
                      <p className="text-xs mt-1">{searchError}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 text-xs"
                        onClick={() => setAddMode("manual")}
                      >
                        Switch to Manual Entry
                      </Button>
                    </div>
                  ) : hubspotContacts.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      No contacts found in HubSpot for {accountName}
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 text-xs block mx-auto"
                        onClick={() => setAddMode("manual")}
                      >
                        Switch to Manual Entry
                      </Button>
                    </div>
                  ) : (
                    <div className="max-h-[200px] overflow-y-auto border border-border rounded-md">
                      {hubspotContacts
                        .filter((c) => c && c.properties)
                        .filter((c) => {
                          const name = [
                            c.properties.firstname,
                            c.properties.lastname,
                          ]
                            .filter(Boolean)
                            .join(" ");
                          const title = c.properties.jobtitle || "";
                          const query = searchQuery.toLowerCase();
                          return (
                            name.toLowerCase().includes(query) ||
                            title.toLowerCase().includes(query)
                          );
                        })
                        .map((contact) => {
                          const name =
                            [
                              contact.properties.firstname,
                              contact.properties.lastname,
                            ]
                              .filter(Boolean)
                              .join(" ") || "Unknown";
                          const isSelected =
                            selectedHubSpotContact?.id === contact.id;
                          return (
                            <button
                              key={contact.id}
                              onClick={() => setSelectedHubSpotContact(contact)}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors border-b border-border last:border-b-0 ${isSelected ? "bg-primary/10" : ""}`}
                            >
                              <div className="font-medium">{name}</div>
                              <div className="text-xs text-muted-foreground">
                                {contact.properties.jobtitle || "No title"} •{" "}
                                {contact.properties.email || "No email"}
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddFromHubSpot}
                      size="sm"
                      disabled={!selectedHubSpotContact}
                    >
                      Add Selected Contact
                    </Button>
                    <Button
                      onClick={() => {
                        setIsAdding(false);
                        setHubspotContacts([]);
                        setSearchQuery("");
                      }}
                      size="sm"
                      variant="ghost"
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        Name
                      </label>
                      <input
                        type="text"
                        value={newContact.name}
                        onChange={(e) =>
                          setNewContact({ ...newContact, name: e.target.value })
                        }
                        className="mt-1 w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        Title
                      </label>
                      <input
                        type="text"
                        value={newContact.title}
                        onChange={(e) =>
                          setNewContact({
                            ...newContact,
                            title: e.target.value,
                          })
                        }
                        className="mt-1 w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                        placeholder="VP of Engineering"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Last Activity (optional)
                    </label>
                    <input
                      type="date"
                      value={newContact.lastActivity}
                      onChange={(e) =>
                        setNewContact({
                          ...newContact,
                          lastActivity: e.target.value,
                        })
                      }
                      className="mt-1 w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddManual}
                      size="sm"
                      disabled={!newContact.name || !newContact.title}
                    >
                      Add Contact
                    </Button>
                    <Button
                      onClick={() => setIsAdding(false)}
                      size="sm"
                      variant="ghost"
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {contacts.length === 0 && !isAdding ? (
            <p className="text-sm text-muted-foreground text-center py-6 border border-dashed border-border rounded-lg">
              No contacts confirmed yet — add one above or promote from
              recommendations below
            </p>
          ) : contacts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="w-[80px] text-center">
                    HubSpot
                  </TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.values(
                  contacts.reduce<Record<string, Contact[]>>((groups, c) => {
                    const key = c.email || c.name;
                    (groups[key] ??= []).push(c);
                    return groups;
                  }, {}),
                ).map((group) => {
                  const rep = group[0];
                  const hsLinked = group.find((c) => c.hubspotId) ?? rep;
                  const latestActivity = group
                    .map((c) => c.lastActivity)
                    .filter(Boolean)
                    .sort()
                    .slice(-1)[0];
                  return (
                    <TableRow key={rep.email || rep.name}>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {group.map((c) => (
                            <span
                              key={c.id}
                              className={`inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded border text-xs font-medium ${roleColors[c.role] ?? "bg-muted text-muted-foreground border-border"}`}
                            >
                              {c.role}
                              <button
                                onClick={() => handleDelete(c.id)}
                                className="hover:text-red-600 transition-colors ml-0.5"
                                title={`Remove ${c.role} role`}
                              >
                                <IconCircleX className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{rep.name}</div>
                        {rep.email && (
                          <div className="text-xs text-muted-foreground">
                            {rep.email}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {rep.email
                          ? (titleByEmail.get(rep.email) ?? rep.title)
                          : rep.title}
                      </TableCell>
                      <TableCell className="text-center">
                        <HubSpotStatusCell
                          contact={hsLinked}
                          onLink={() => openLinkDialog(rep.id)}
                        />
                      </TableCell>
                      <TableCell>
                        {latestActivity
                          ? new Date(latestActivity).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )
                          : "—"}
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : null}

          <Dialog
            open={!!linkingContactId}
            onOpenChange={(open) => {
              if (!open) setLinkingContactId(null);
            }}
          >
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Link to HubSpot Contact</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Search for the matching HubSpot contact for{" "}
                  <span className="font-medium text-foreground">
                    {contacts.find((c) => c.id === linkingContactId)?.name}
                  </span>
                  .
                </p>
                <input
                  type="text"
                  value={linkQuery}
                  onChange={(e) => setLinkQuery(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                  placeholder="Filter by name, title, or email..."
                  autoFocus
                />
                {isLinkSearching ? (
                  <div className="text-sm text-muted-foreground text-center py-6">
                    <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                    Loading HubSpot contacts...
                  </div>
                ) : linkSearchError ? (
                  <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 rounded-md p-3">
                    {linkSearchError}
                  </div>
                ) : (
                  <div className="max-h-[280px] overflow-y-auto border border-border rounded-md divide-y divide-border">
                    {linkHsContacts
                      .filter((c) => {
                        const name = [
                          c.properties.firstname,
                          c.properties.lastname,
                        ]
                          .filter(Boolean)
                          .join(" ");
                        const q = linkQuery.toLowerCase();
                        return (
                          !q ||
                          name.toLowerCase().includes(q) ||
                          (c.properties.jobtitle || "")
                            .toLowerCase()
                            .includes(q) ||
                          (c.properties.email || "").toLowerCase().includes(q)
                        );
                      })
                      .map((c) => {
                        const name =
                          [c.properties.firstname, c.properties.lastname]
                            .filter(Boolean)
                            .join(" ") || "Unknown";
                        return (
                          <button
                            key={c.id}
                            onClick={() => handleLinkHubSpot(c)}
                            className="w-full text-left px-3 py-2.5 hover:bg-muted/50 transition-colors"
                          >
                            <div className="font-medium text-sm">{name}</div>
                            <div className="text-xs text-muted-foreground">
                              {c.properties.jobtitle || "No title"}
                              {c.properties.email && ` · ${c.properties.email}`}
                            </div>
                          </button>
                        );
                      })}
                    {linkHsContacts.length === 0 && !isLinkSearching && (
                      <div className="px-3 py-6 text-sm text-muted-foreground text-center">
                        No HubSpot contacts found for {accountName}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {coverageAccount && (
          <>
            <div className="border-t border-border" />
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold">
                  Coverage Recommendations
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  AI-identified contacts to potentially add to confirmed
                  coverage
                </p>
              </div>
              <AccountCoverageModule
                account={coverageAccount}
                onConfirm={handleConfirmRecommendation}
                confirmedKeys={confirmedKeys}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function OpenDeals({ deals = [], isLoading }: OpenDealsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconTrendingUp className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Open Deals</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalPipeline = deals.reduce(
    (sum, deal) => sum + (deal.amount || 0),
    0,
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <IconTrendingUp className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Open Deals</CardTitle>
            </div>
            <CardDescription className="mt-1.5">
              Active sales opportunities from HubSpot
            </CardDescription>
          </div>
          {deals.length > 0 && (
            <div className="text-right">
              <p className="text-2xl font-bold">
                {formatCompactCurrency(totalPipeline)}
              </p>
              <p className="text-sm text-muted-foreground">
                {deals.length} open {deals.length === 1 ? "deal" : "deals"}
              </p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {deals.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No open deals found for this account
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deal Name</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Deal Type</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Close Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deals.map((deal) => (
                <TableRow key={deal.deal_id}>
                  <TableCell className="font-medium">
                    {deal.dealname || `Deal ${deal.deal_id}`}
                  </TableCell>
                  <TableCell>{deal.pipeline_label || "—"}</TableCell>
                  <TableCell>
                    {deal.dealtype ? (
                      <Badge variant="outline">{deal.dealtype}</Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>{deal.stage_name || "—"}</TableCell>
                  <TableCell className="font-mono">
                    {deal.amount ? formatCompactCurrency(deal.amount) : "$0"}
                  </TableCell>
                  <TableCell>
                    {deal.close_date
                      ? new Date(deal.close_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

type ObjectiveStatus =
  | "Not Started"
  | "Started"
  | "On-Track"
  | "At-Risk"
  | "Blocked"
  | "Complete"
  | "Deprioritized";
type Quarter = "Q1" | "Q2" | "Q3" | "Q4";

interface Objective {
  id: string;
  text: string;
  status: ObjectiveStatus;
  nextSteps?: string;
}

interface QuarterlyObjectivesData {
  Q1: Objective[];
  Q2: Objective[];
  Q3: Objective[];
  Q4: Objective[];
}

interface QuarterlyObjectivesProps {
  accountName: string;
}

function getCurrentQuarter(): Quarter {
  const month = new Date().getMonth();
  if (month >= 0 && month <= 2) return "Q1";
  if (month >= 3 && month <= 5) return "Q2";
  if (month >= 6 && month <= 8) return "Q3";
  return "Q4";
}

export function QuarterlyObjectives({ accountName }: QuarterlyObjectivesProps) {
  const [objectives, setObjectives] = useState<QuarterlyObjectivesData>(() => {
    const saved = localStorage.getItem(`quarterly-objectives-${accountName}`);
    return saved ? JSON.parse(saved) : { Q1: [], Q2: [], Q3: [], Q4: [] };
  });
  const [selectedQuarter, setSelectedQuarter] =
    useState<Quarter>(getCurrentQuarter());
  const [addingToQuarter, setAddingToQuarter] = useState<Quarter | null>(null);
  const [newObjective, setNewObjective] = useState({
    text: "",
    status: "Not Started" as ObjectiveStatus,
    nextSteps: "",
  });

  const saveObjectives = (updatedObjectives: QuarterlyObjectivesData) => {
    setObjectives(updatedObjectives);
    localStorage.setItem(
      `quarterly-objectives-${accountName}`,
      JSON.stringify(updatedObjectives),
    );
  };

  const handleAdd = (quarter: Quarter) => {
    if (!newObjective.text.trim() || objectives[quarter].length >= 5) return;
    const objective: Objective = {
      id: Date.now().toString(),
      text: newObjective.text.trim(),
      status: newObjective.status,
      nextSteps: newObjective.nextSteps.trim() || undefined,
    };
    saveObjectives({
      ...objectives,
      [quarter]: [...objectives[quarter], objective],
    });
    setNewObjective({ text: "", status: "Not Started", nextSteps: "" });
    setAddingToQuarter(null);
  };

  const handleDelete = (quarter: Quarter, id: string) => {
    saveObjectives({
      ...objectives,
      [quarter]: objectives[quarter].filter((obj) => obj.id !== id),
    });
  };

  const handleStatusChange = (
    quarter: Quarter,
    id: string,
    newStatus: ObjectiveStatus,
  ) => {
    saveObjectives({
      ...objectives,
      [quarter]: objectives[quarter].map((obj) =>
        obj.id === id ? { ...obj, status: newStatus } : obj,
      ),
    });
  };

  const handleTextChange = (quarter: Quarter, id: string, newText: string) => {
    saveObjectives({
      ...objectives,
      [quarter]: objectives[quarter].map((obj) =>
        obj.id === id ? { ...obj, text: newText } : obj,
      ),
    });
  };

  const handleNextStepsChange = (
    quarter: Quarter,
    id: string,
    nextSteps: string,
  ) => {
    saveObjectives({
      ...objectives,
      [quarter]: objectives[quarter].map((obj) =>
        obj.id === id ? { ...obj, nextSteps } : obj,
      ),
    });
  };

  const statusConfig: Record<
    ObjectiveStatus,
    { icon: React.ReactNode; color: string; bgColor: string }
  > = {
    "Not Started": {
      icon: <IconClock className="h-4 w-4" />,
      color: "text-gray-700",
      bgColor: "bg-gray-500/10 border-gray-200",
    },
    Started: {
      icon: <IconPlayerPlay className="h-4 w-4" />,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10 border-blue-200",
    },
    "On-Track": {
      icon: <IconTrendingUp className="h-4 w-4" />,
      color: "text-green-600",
      bgColor: "bg-green-500/10 border-green-200",
    },
    "At-Risk": {
      icon: <IconAlertCircle className="h-4 w-4" />,
      color: "text-yellow-600",
      bgColor: "bg-yellow-500/10 border-yellow-200",
    },
    Blocked: {
      icon: <IconBan className="h-4 w-4" />,
      color: "text-red-600",
      bgColor: "bg-red-500/10 border-red-200",
    },
    Complete: {
      icon: <IconCircleCheck className="h-4 w-4" />,
      color: "text-green-700",
      bgColor: "bg-green-500/10 border-green-200",
    },
    Deprioritized: {
      icon: <IconCircleX className="h-4 w-4" />,
      color: "text-gray-400",
      bgColor: "bg-gray-400/10 border-gray-300",
    },
  };

  const renderQuarter = (quarter: Quarter) => {
    const quarterObjectives = objectives[quarter];
    const isAddingToThis = addingToQuarter === quarter;

    return (
      <div key={quarter} className="space-y-3">
        {!isAddingToThis && quarterObjectives.length < 5 && (
          <div className="flex justify-end">
            <Button
              onClick={() => setAddingToQuarter(quarter)}
              size="sm"
              variant="outline"
              className="h-8 text-xs"
            >
              + Add Objective
            </Button>
          </div>
        )}

        {isAddingToThis && (
          <div className="p-3 border border-border rounded-lg space-y-3 bg-muted/30">
            <div>
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Objective Description
              </label>
              <Textarea
                value={newObjective.text}
                onChange={(e) =>
                  setNewObjective((prev) => ({ ...prev, text: e.target.value }))
                }
                className="text-xs resize-none min-h-[50px] mt-1"
                placeholder="Enter objective..."
                rows={2}
                autoFocus
              />
            </div>

            <div>
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Status
              </label>
              <Select
                value={newObjective.status}
                onValueChange={(value) =>
                  setNewObjective((prev) => ({
                    ...prev,
                    status: value as ObjectiveStatus,
                  }))
                }
              >
                <SelectTrigger
                  className={`h-8 text-xs mt-1 ${statusConfig[newObjective.status].bgColor} ${statusConfig[newObjective.status].color} border`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(statusConfig).map((status) => (
                    <SelectItem key={status} value={status} className="text-xs">
                      <div className="flex items-center gap-2">
                        {statusConfig[status as ObjectiveStatus].icon}
                        {status}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Next Steps{" "}
                <span className="text-muted-foreground/60">(Optional)</span>
              </label>
              <Textarea
                value={newObjective.nextSteps}
                onChange={(e) =>
                  setNewObjective((prev) => ({
                    ...prev,
                    nextSteps: e.target.value,
                  }))
                }
                className="text-xs resize-none min-h-[40px] mt-1"
                placeholder="What are the immediate next steps?"
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleAdd(quarter)}
                size="sm"
                disabled={!newObjective.text.trim()}
              >
                Add Objective
              </Button>
              <Button
                onClick={() => {
                  setAddingToQuarter(null);
                  setNewObjective({
                    text: "",
                    status: "Not Started",
                    nextSteps: "",
                  });
                }}
                size="sm"
                variant="ghost"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {quarterObjectives.length === 0 && !isAddingToThis ? (
          <p className="text-xs text-muted-foreground text-center py-6 border border-dashed border-border rounded-lg">
            No objectives for {quarter}
          </p>
        ) : (
          <div className="space-y-2">
            {quarterObjectives.map((objective, index) => (
              <div
                key={objective.id}
                className="p-3 border border-border rounded-lg space-y-2 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary">
                    {index + 1}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                        Objective
                      </label>
                      <Textarea
                        value={objective.text}
                        onChange={(e) =>
                          handleTextChange(
                            quarter,
                            objective.id,
                            e.target.value,
                          )
                        }
                        className="text-xs resize-none min-h-[50px] mt-1"
                        rows={2}
                        placeholder="Enter objective description..."
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                          Status
                        </label>
                        <Select
                          value={objective.status}
                          onValueChange={(value) =>
                            handleStatusChange(
                              quarter,
                              objective.id,
                              value as ObjectiveStatus,
                            )
                          }
                        >
                          <SelectTrigger
                            className={`w-full text-xs ${statusConfig[objective.status].bgColor} ${statusConfig[objective.status].color} border h-8 mt-1`}
                          >
                            <div className="flex items-center gap-1.5">
                              {statusConfig[objective.status].icon}
                              <SelectValue />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(statusConfig).map((status) => (
                              <SelectItem
                                key={status}
                                value={status}
                                className="text-xs"
                              >
                                <div className="flex items-center gap-2">
                                  {statusConfig[status as ObjectiveStatus].icon}
                                  {status}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={() => handleDelete(quarter, objective.id)}
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-red-600 flex-shrink-0 mt-4"
                      >
                        <IconCircleX className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                        Next Steps
                      </label>
                      <Textarea
                        value={objective.nextSteps || ""}
                        onChange={(e) =>
                          handleNextStepsChange(
                            quarter,
                            objective.id,
                            e.target.value,
                          )
                        }
                        className="text-xs resize-none min-h-[50px] mt-1"
                        rows={2}
                        placeholder="Enter next steps..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <IconActivity className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Quarterly Objectives</CardTitle>
        </div>
        <CardDescription className="mt-1.5">
          Track progress on key account objectives for each quarter (max 5 per
          quarter)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Quarter:</label>
          <Select
            value={selectedQuarter}
            onValueChange={(v) => setSelectedQuarter(v as Quarter)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Q1">Q1 {new Date().getFullYear()}</SelectItem>
              <SelectItem value="Q2">Q2 {new Date().getFullYear()}</SelectItem>
              <SelectItem value="Q3">Q3 {new Date().getFullYear()}</SelectItem>
              <SelectItem value="Q4">Q4 {new Date().getFullYear()}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {renderQuarter(selectedQuarter)}
      </CardContent>
    </Card>
  );
}

interface JiraTicketsProps {
  accountName: string;
}

export function JiraTickets({ accountName }: JiraTicketsProps) {
  const { data: tickets, isLoading } = useQuery({
    queryKey: ["jira-tickets", accountName],
    queryFn: async () => {
      const jql = `text ~ "${accountName}" AND resolution = Unresolved ORDER BY updated DESC`;
      const token = await getIdToken();
      const response = await fetch(
        `/api/jira/search?${new URLSearchParams({ jql, maxResults: "10" })}`,
        {
          headers: { ...(token && { Authorization: `Bearer ${token}` }) },
        },
      );
      if (!response.ok) throw new Error("Failed to fetch Jira tickets");
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <IconBug className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Open Jira Tickets</CardTitle>
        </div>
        <CardDescription>
          Unresolved Jira issues related to this account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : !tickets?.issues || tickets.issues.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No open tickets found
          </p>
        ) : (
          <div className="space-y-3">
            {tickets.issues.map((issue: any) => (
              <div
                key={issue.key}
                className="p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://builderio.atlassian.net/browse/${issue.key}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-sm hover:underline inline-flex items-center gap-1"
                      >
                        {issue.key}
                        <IconExternalLink className="h-3 w-3" />
                      </a>
                      <Badge variant="outline" className="text-xs">
                        {issue.fields.status.name}
                      </Badge>
                      {issue.fields.priority && (
                        <Badge variant="outline" className="text-xs">
                          {issue.fields.priority.name}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {issue.fields.summary}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {issue.fields.assignee && (
                        <span>
                          Assignee: {issue.fields.assignee.displayName}
                        </span>
                      )}
                      {issue.fields.updated && (
                        <span>
                          Updated:{" "}
                          {new Date(issue.fields.updated).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface PylonTicketsProps {
  accountName: string;
}

export function PylonTickets({ accountName }: PylonTicketsProps) {
  const { data: tickets, isLoading } = useQuery({
    queryKey: ["pylon-tickets", accountName],
    queryFn: async () => {
      const token = await getIdToken();
      const headers = { ...(token && { Authorization: `Bearer ${token}` }) };

      const accountsResponse = await fetch(
        `/api/pylon/accounts?${new URLSearchParams({ query: accountName })}`,
        { headers },
      );
      if (!accountsResponse.ok)
        throw new Error("Failed to fetch Pylon accounts");
      const accountsData = await accountsResponse.json();
      const accounts = accountsData.accounts || accountsData.data || [];

      if (accounts.length === 0) return { issues: [] };

      const account = accounts[0];
      const issuesResponse = await fetch(
        `/api/pylon/issues?${new URLSearchParams({ account_id: account.id, state: "open" })}`,
        { headers },
      );
      if (!issuesResponse.ok) throw new Error("Failed to fetch Pylon tickets");
      return issuesResponse.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const issues = Array.isArray(tickets)
    ? tickets
    : tickets?.issues || tickets?.data || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <IconTicket className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Open Support Tickets</CardTitle>
        </div>
        <CardDescription>
          Active support tickets from Pylon for this account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : issues.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No open support tickets
          </p>
        ) : (
          <div className="space-y-3">
            {issues.slice(0, 10).map((issue: any) => (
              <div
                key={issue.id}
                className="p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">
                        {issue.title || issue.subject || "Untitled Issue"}
                      </p>
                      {issue.state && (
                        <Badge variant="outline" className="text-xs">
                          {issue.state}
                        </Badge>
                      )}
                      {issue.priority && (
                        <Badge variant="outline" className="text-xs">
                          {issue.priority}
                        </Badge>
                      )}
                    </div>
                    {issue.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {issue.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {issue.created_at && (
                        <span>
                          Created:{" "}
                          {new Date(issue.created_at).toLocaleDateString()}
                        </span>
                      )}
                      {issue.updated_at && (
                        <span>
                          Updated:{" "}
                          {new Date(issue.updated_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
