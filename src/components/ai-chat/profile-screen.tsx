"use client";

import { addDays, formatISO, parseISO } from "date-fns";
import {
  ArrowUpRight,
  Blocks,
  Bot,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Code2,
  Edit3,
  MonitorUp,
  PanelsTopLeft,
  RotateCcw,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { AiWorkspaceShell } from "@/components/ai-chat/ai-workspace-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  ContributionGraph,
  ContributionGraphBlock,
  ContributionGraphCalendar,
  ContributionGraphFooter,
  ContributionGraphLegend,
  ContributionGraphTotalCount,
} from "@/components/ui/contribution-graph";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ActivityMode = "Daily" | "Weekly" | "Cumulative";

type Profile = {
  name: string;
  handle: string;
  role: string;
  bio: string;
};

const defaultProfile: Profile = {
  name: "Robert Austin",
  handle: "ausrobdev",
  role: "Product engineer",
  bio: "Designing and shipping AI workflows, agent systems, and production interfaces.",
};

const profileStats = [
  { value: "25.7B", label: "Lifetime tokens" },
  { value: "2.4B", label: "Peak tokens" },
  { value: "25h 29m", label: "Longest session" },
  { value: "10 days", label: "Current streak" },
  { value: "16 days", label: "Longest streak" },
];

const insights = [
  ["Fast mode", "42%"],
  ["Most used reasoning", "High · 80%"],
  ["Skills explored", "41"],
  ["Total skills used", "1,631"],
  ["Total chats", "1,562"],
] as const;

const tools = [
  { icon: Blocks, name: "$shadcnblocks", count: "333 runs" },
  { icon: PanelsTopLeft, name: "$design-taste-frontend", count: "250 runs" },
  { icon: Cloud, name: "$cloudflare", count: "169 runs" },
  { icon: MonitorUp, name: "@browser", count: "135 runs" },
  { icon: Code2, name: "$react-best-practices", count: "109 runs" },
];

const periods = ["October", "November", "December", "January"];

const agentActivity = [
  34, 62, 51, 4, 51, 12, 4, 4, 4, 42, 4, 72, 36, 22, 4, 22, 59, 39, 4, 4, 46,
  13, 22, 45, 38, 31, 12, 55, 43, 18,
];

const tokenActivity = [
  58, 46, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 54, 7, 2, 0, 8, 0, 0, 78, 91, 85,
  57, 13, 3, 35, 48, 68, 56,
];

const agentChartData = agentActivity.map((runs, index) => ({
  day: index + 1,
  runs: runs < 8 ? 0 : Math.round(runs / 2),
}));

const tokenChartData = tokenActivity.map((tokens, index) => ({
  day: index + 1,
  tokens: Math.round(tokens * 0.82 + 4),
}));

const agentChartConfig = {
  runs: { label: "Agent runs", color: "#10b981" },
} satisfies ChartConfig;

const tokenChartConfig = {
  tokens: { label: "Tokens", color: "#10b981" },
} satisfies ChartConfig;

const contributionTones = [
  'data-[level="0"]:fill-muted',
  'data-[level="1"]:fill-emerald-500/20',
  'data-[level="2"]:fill-emerald-500/40',
  'data-[level="3"]:fill-emerald-500/60',
  'data-[level="4"]:fill-emerald-500/80',
  'data-[level="5"]:fill-emerald-500',
];

function getActivityLevel(index: number, mode: ActivityMode) {
  const week = Math.floor(index / 7);
  const day = index % 7;
  const recentLift = week > 38 ? 2 : week > 28 ? 1 : 0;
  const modeLift = mode === "Weekly" ? 1 : mode === "Cumulative" ? 2 : 0;
  const quiet = (week * 3 + day * 5) % 13 < 4;

  if (week < 30 && quiet) return 0;
  return Math.min(
    5,
    ((week * 7 + day * 3 + (week % 5)) % 4) + recentLift + modeLift,
  );
}

function ActivityHeatmap({ mode }: { mode: ActivityMode }) {
  const activities = useMemo(() => {
    const start = parseISO("2025-10-01");
    const multiplier = mode === "Daily" ? 4 : mode === "Weekly" ? 14 : 28;

    return Array.from({ length: 365 }, (_, index) => {
      const level = getActivityLevel(index, mode);
      return {
        date: formatISO(addDays(start, index), { representation: "date" }),
        count: level * multiplier,
        level,
      };
    });
  }, [mode]);

  return (
    <ContributionGraph
      data={activities}
      blockSize={10}
      blockMargin={4}
      blockRadius={2.5}
      maxLevel={5}
      className="w-full"
      labels={{ totalCount: "{{count}} activities in this profile year" }}
    >
      <ContributionGraphCalendar className="pb-1">
        {({ activity, dayIndex, weekIndex }) => (
          <g>
            <title>{`${activity.date}: ${activity.count} activities`}</title>
            <ContributionGraphBlock
              activity={activity}
              dayIndex={dayIndex}
              weekIndex={weekIndex}
              className={cn("transition-colors", ...contributionTones)}
            />
          </g>
        )}
      </ContributionGraphCalendar>
      <ContributionGraphFooter className="text-[10px]">
        <ContributionGraphTotalCount />
        <ContributionGraphLegend />
      </ContributionGraphFooter>
    </ContributionGraph>
  );
}

function ChartFrame({
  title,
  value,
  change,
  detail,
  actions,
  children,
}: {
  title: string;
  value: string;
  change?: string;
  detail: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-muted/25 overflow-hidden rounded-xl border px-5 py-5 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
            {title}
          </p>
          <div className="mt-1 flex items-center gap-3">
            <p className="text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">
              {value}
            </p>
            {change ? (
              <Badge className="border-emerald-500/15 bg-emerald-500/10 text-emerald-700 shadow-none dark:text-emerald-300">
                {change}
              </Badge>
            ) : null}
          </div>
          <p className="text-muted-foreground mt-1 text-xs">{detail}</p>
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

function AgentChart({ period }: { period: string }) {
  return (
    <div className="mt-5">
      <ChartContainer
        config={agentChartConfig}
        className="aspect-auto h-[210px] w-full"
      >
        <BarChart
          accessibilityLayer
          data={agentChartData.map((item, index) => ({
            ...item,
            runs:
              period === "December"
                ? item.runs
                : Math.round(
                    agentChartData[
                      (index + periods.indexOf(period) * 5) %
                        agentChartData.length
                    ].runs *
                      (0.7 + periods.indexOf(period) * 0.15),
                  ),
          }))}
          margin={{ top: 8, right: 4, bottom: 0, left: 0 }}
        >
          <CartesianGrid
            vertical={false}
            stroke="var(--border)"
            strokeDasharray="3 5"
            strokeOpacity={0.75}
          />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tickMargin={10}
            ticks={[1, 8, 15, 22, 30]}
            tickFormatter={(value) =>
              value === 1 ? `1 ${period.slice(0, 3)}` : String(value)
            }
          />
          <YAxis axisLine={false} tickLine={false} width={32} tickCount={4} />
          <ChartTooltip
            cursor={{ fill: "var(--muted)", opacity: 0.45 }}
            content={
              <ChartTooltipContent
                indicator="line"
                labelFormatter={(value) =>
                  `${period.slice(0, 3)} ${String(value)}`
                }
              />
            }
          />
          <Bar
            dataKey="runs"
            fill="var(--color-runs)"
            radius={[4, 4, 0, 0]}
            maxBarSize={12}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}

function TokensChart() {
  return (
    <div className="mt-5">
      <ChartContainer
        config={tokenChartConfig}
        className="aspect-auto h-[210px] w-full"
      >
        <AreaChart
          accessibilityLayer
          data={tokenChartData}
          margin={{ top: 8, right: 4, bottom: 0, left: -10 }}
        >
          <defs>
            <linearGradient id="profile-token-fill" x1="0" x2="0" y1="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--color-tokens)"
                stopOpacity={0.3}
              />
              <stop
                offset="92%"
                stopColor="var(--color-tokens)"
                stopOpacity={0.02}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="var(--border)"
            strokeDasharray="3 5"
            strokeOpacity={0.75}
          />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tickMargin={10}
            ticks={[1, 8, 15, 22, 31]}
            tickFormatter={(value) =>
              value === 1 ? "Jun 14" : value === 31 ? "Today" : `+${value - 1}d`
            }
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            width={42}
            tickFormatter={(value) => `${value}M`}
          />
          <ChartTooltip
            cursor={{ stroke: "var(--border)", strokeDasharray: "3 4" }}
            content={
              <ChartTooltipContent
                indicator="line"
                formatter={(value) => (
                  <div className="flex min-w-32 items-center justify-between gap-4">
                    <span className="text-muted-foreground">Tokens</span>
                    <span className="font-mono font-medium tabular-nums">
                      {Number(value).toFixed(1)}M
                    </span>
                  </div>
                )}
              />
            }
          />
          <Area
            dataKey="tokens"
            type="monotone"
            fill="url(#profile-token-fill)"
            stroke="var(--color-tokens)"
            strokeWidth={2.25}
            activeDot={{ r: 4, strokeWidth: 2, fill: "var(--background)" }}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}

export function ProfileScreen() {
  const [profile, setProfile] = useState(defaultProfile);
  const [draft, setDraft] = useState(defaultProfile);
  const [editOpen, setEditOpen] = useState(false);
  const [activityMode, setActivityMode] = useState<ActivityMode>("Daily");
  const [periodIndex, setPeriodIndex] = useState(2);

  const initials = profile.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function reset() {
    setProfile(defaultProfile);
    setDraft(defaultProfile);
    setActivityMode("Daily");
    setPeriodIndex(2);
    toast.success("Profile demo reset");
  }

  async function shareProfile() {
    const url = `${window.location.origin}/ai-chat/profile`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Profile link copied");
    } catch {
      toast.info("Profile link ready", { description: url });
    }
  }

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = {
      name: draft.name.trim(),
      handle: draft.handle.replace(/^@/, "").trim(),
      role: draft.role.trim(),
      bio: draft.bio.trim(),
    };
    if (!next.name || !next.handle) {
      toast.error("Enter a name and a handle after @.");
      return;
    }
    setProfile(next);
    setDraft(next);
    setEditOpen(false);
    toast.success("Profile updated");
  }

  return (
    <AiWorkspaceShell
      headerTitle="Profile"
      hideNavigationSidebar
      headerActions={
        <>
          <Badge variant="outline">Personal profile</Badge>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Reset profile demo"
            onClick={reset}
          >
            <RotateCcw />
          </Button>
        </>
      }
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
          <section className="relative border-b pb-9 sm:pb-11">
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={shareProfile}>
                <Share2 />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDraft(profile);
                  setEditOpen(true);
                }}
              >
                <Edit3 />
                Edit profile
              </Button>
            </div>

            <div className="mx-auto -mt-1 flex max-w-2xl flex-col items-center text-center sm:-mt-3">
              <Avatar className="border-background size-20 border-4 shadow-sm sm:size-24">
                <AvatarImage
                  src="/avatars/ausrobdev-avatar.png"
                  alt={profile.name}
                />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-medium sm:text-3xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                {profile.name}
              </h1>
              <div className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                <span>@{profile.handle}</span>
                <span aria-hidden="true">·</span>
                <Badge
                  variant="outline"
                  className="h-5 px-1.5 text-[10px] uppercase"
                >
                  Pro
                </Badge>
              </div>
              <p className="text-muted-foreground mt-3 max-w-xl text-sm leading-6">
                {profile.bio}
              </p>
              <p className="mt-2 text-xs font-medium">{profile.role}</p>
            </div>
          </section>

          <dl className="grid grid-cols-2 border-b sm:grid-cols-5">
            {profileStats.map((stat, index) => (
              <div
                key={stat.label}
                className={cn(
                  "border-b px-3 py-5 text-center sm:border-r sm:border-b-0",
                  index % 2 === 0 && "border-r sm:border-r",
                  index === profileStats.length - 1 &&
                    "col-span-2 border-r-0 border-b-0 sm:col-span-1 sm:border-r-0",
                )}
              >
                <dd className="text-lg font-medium tracking-tight tabular-nums">
                  {stat.value}
                </dd>
                <dt className="text-muted-foreground mt-1 text-xs">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>

          <section className="border-b py-8">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">Token activity</h2>
                <p className="text-muted-foreground mt-1 text-xs">
                  A year of conversations, tools, and agent runs.
                </p>
              </div>
              <div
                className="bg-muted/60 flex rounded-lg p-1"
                aria-label="Activity interval"
              >
                {(["Daily", "Weekly", "Cumulative"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    aria-pressed={activityMode === mode}
                    onClick={() => setActivityMode(mode)}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-xs transition-colors",
                      activityMode === mode
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
            <ActivityHeatmap mode={activityMode} />
          </section>

          <section className="grid gap-10 border-b py-8 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="text-sm font-semibold">Activity insights</h2>
              <dl className="mt-5 space-y-3.5">
                {insights.map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-6 text-sm"
                  >
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="font-medium tabular-nums">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div>
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-sm font-semibold">Most used tools</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/ai-chat/skill-library">
                    Browse skills
                    <ArrowUpRight />
                  </Link>
                </Button>
              </div>
              <ul className="mt-3 divide-y">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <li
                      key={tool.name}
                      className="flex items-center gap-3 py-2.5 text-sm"
                    >
                      <span className="bg-muted flex size-7 items-center justify-center rounded-md">
                        <Icon className="size-3.5" />
                      </span>
                      <span className="min-w-0 flex-1 truncate font-medium">
                        {tool.name}
                      </span>
                      <span className="text-muted-foreground text-xs tabular-nums">
                        {tool.count}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>

          <div className="grid gap-5 border-b py-8 lg:grid-cols-2">
            <ChartFrame
              title="Agents"
              value="32 agents"
              detail="1,042 runs across active agents"
              change="+12%"
              actions={
                <div className="bg-background flex items-center rounded-lg border p-1 shadow-sm">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Previous month"
                    onClick={() =>
                      setPeriodIndex((index) => Math.max(0, index - 1))
                    }
                    disabled={periodIndex === 0}
                  >
                    <ChevronLeft />
                  </Button>
                  <span className="min-w-24 text-center text-sm font-medium">
                    {periods[periodIndex]}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Next month"
                    onClick={() =>
                      setPeriodIndex((index) =>
                        Math.min(periods.length - 1, index + 1),
                      )
                    }
                    disabled={periodIndex === periods.length - 1}
                  >
                    <ChevronRight />
                  </Button>
                </div>
              }
            >
              <AgentChart period={periods[periodIndex]} />
            </ChartFrame>

            <ChartFrame
              title="Tokens"
              value="667.7M tokens"
              change="+9.4%"
              detail="Input and output tokens over 31 days"
            >
              <TokensChart />
            </ChartFrame>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 py-8">
            <div className="flex items-center gap-3">
              <span className="bg-muted flex size-9 items-center justify-center rounded-lg">
                <Bot className="size-4" />
              </span>
              <div>
                <p className="text-sm font-medium">Agent activity</p>
                <p className="text-muted-foreground text-xs">
                  Review the runs behind these profile totals.
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/ai-chat/agent-activity">
                View activity
                <ArrowUpRight />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit profile</SheetTitle>
            <SheetDescription>
              Update the identity shown across your AI workspace.
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={saveProfile} className="flex min-h-0 flex-1 flex-col">
            <div className="space-y-5 overflow-y-auto px-4 py-5">
              <label className="block space-y-2 text-sm font-medium">
                Display name
                <Input
                  value={draft.name}
                  onChange={(event) =>
                    setDraft({ ...draft, name: event.target.value })
                  }
                  required
                  maxLength={60}
                />
              </label>
              <label className="block space-y-2 text-sm font-medium">
                Handle
                <Input
                  value={draft.handle}
                  onChange={(event) =>
                    setDraft({ ...draft, handle: event.target.value })
                  }
                  required
                  maxLength={40}
                />
              </label>
              <label className="block space-y-2 text-sm font-medium">
                Role
                <Input
                  value={draft.role}
                  onChange={(event) =>
                    setDraft({ ...draft, role: event.target.value })
                  }
                  maxLength={60}
                />
              </label>
              <label className="block space-y-2 text-sm font-medium">
                Bio
                <Textarea
                  value={draft.bio}
                  onChange={(event) =>
                    setDraft({ ...draft, bio: event.target.value })
                  }
                  rows={5}
                  maxLength={180}
                  className="resize-none"
                />
              </label>
            </div>
            <SheetFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save changes</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </AiWorkspaceShell>
  );
}
