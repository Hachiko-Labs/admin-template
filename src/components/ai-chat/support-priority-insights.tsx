"use client";

import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const cases = [
  {
    account: "Helio Freight",
    id: "CS-4827",
    issue: "Duplicate invoices after plan migration",
    risk: "Critical",
    score: 92,
  },
  {
    account: "Northline Labs",
    id: "CS-4819",
    issue: "EU exports omit tax registration IDs",
    risk: "Critical",
    score: 87,
  },
  {
    account: "Morrow Health",
    id: "CS-4798",
    issue: "Audit log delivery is delayed",
    risk: "High",
    score: 81,
  },
] as const;

const comparisonData = [
  { day: "7d", helio: 72, northline: 66 },
  { day: "6d", helio: 76, northline: 69 },
  { day: "5d", helio: 74, northline: 73 },
  { day: "4d", helio: 81, northline: 78 },
  { day: "3d", helio: 85, northline: 82 },
  { day: "2d", helio: 89, northline: 84 },
  { day: "Now", helio: 92, northline: 87 },
];

const backlogData = [
  { day: "Mon", open: 193 },
  { day: "Tue", open: 191 },
  { day: "Wed", open: 189 },
  { day: "Thu", open: 188 },
  { day: "Fri", open: 187 },
  { day: "Sat", open: 188 },
  { day: "Now", open: 184 },
];

const chartInitialDimension = { width: 560, height: 166 };

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{
    color?: string;
    name?: string;
    value?: number | string;
  }>;
}) {
  if (!active || !payload?.length) return null;

  return (
    <span className="support-chart-tooltip">
      {payload.map((item) => (
        <span key={item.name} className="support-chart-tooltip-item">
          <span
            className="support-chart-tooltip-dot"
            style={{ background: item.color }}
          />
          {item.value}
        </span>
      ))}
    </span>
  );
}

function CasePressureCard() {
  return (
    <div className="bg-background min-h-[278px] rounded-lg p-3 shadow-[0_0_0_1px_var(--border),0_1px_2px_oklch(0_0_0/0.04)]">
      <div className="grid grid-cols-2 gap-4">
        {cases.slice(0, 2).map((item, index) => (
          <div key={item.id} className="min-w-0">
            <span className="text-muted-foreground flex items-center gap-1.5 truncate text-[11px]">
              <span
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  index === 0 ? "bg-red-500" : "bg-amber-500",
                )}
              />
              {item.account}
            </span>
            <span className="mt-0.5 block font-mono text-lg font-semibold tabular-nums">
              {item.score}
            </span>
            <span className="text-muted-foreground block truncate text-[10px]">
              {item.id} · {item.risk}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-muted/40 mt-2 overflow-hidden rounded-md shadow-[0_0_0_1px_var(--border)]">
        <div className="text-muted-foreground flex items-center justify-between border-b px-2.5 py-1.5 text-[10px]">
          <span>Risk pressure</span>
          <span>Last 7 days</span>
        </div>
        <div className="support-chart-stage h-[166px] px-1 pt-2">
          <ResponsiveContainer
            width="100%"
            height="100%"
            initialDimension={chartInitialDimension}
          >
            <LineChart
              data={comparisonData}
              margin={{ top: 8, right: 5, bottom: 3, left: 5 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="var(--border)"
                strokeDasharray="3 4"
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                tickMargin={8}
              />
              <YAxis hide domain={[60, 100]} />
              <Tooltip
                cursor={{ stroke: "var(--border)" }}
                content={<ChartTooltip />}
              />
              <Line
                type="monotone"
                dataKey="helio"
                name="Helio Freight"
                stroke="#ef4444"
                strokeWidth={2.25}
                dot={false}
                activeDot={{ r: 3, strokeWidth: 0 }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="northline"
                name="Northline Labs"
                stroke="#f59e0b"
                strokeWidth={2.25}
                dot={false}
                activeDot={{ r: 3, strokeWidth: 0 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function BacklogSpikeCard() {
  return (
    <div className="bg-background min-h-[278px] rounded-lg p-3 shadow-[0_0_0_1px_var(--border),0_1px_2px_oklch(0_0_0/0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-xs font-medium">Monday intake spike</span>
          <span className="text-muted-foreground mt-0.5 block text-[11px]">
            Backlog is recovering, not cleared
          </span>
        </div>
        <span className="font-mono text-lg font-semibold tabular-nums">
          193
        </span>
      </div>

      <div className="bg-muted/40 mt-3 overflow-hidden rounded-md shadow-[0_0_0_1px_var(--border)]">
        <div className="text-muted-foreground flex items-center justify-between border-b px-2.5 py-1.5 text-[10px]">
          <span>193 peak</span>
          <span>7-day recovery</span>
        </div>
        <div className="support-chart-stage h-[166px] px-1 pt-2">
          <ResponsiveContainer
            width="100%"
            height="100%"
            initialDimension={chartInitialDimension}
          >
            <LineChart
              data={backlogData}
              margin={{ top: 8, right: 5, bottom: 3, left: 5 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="var(--border)"
                strokeDasharray="3 4"
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                tickMargin={8}
              />
              <YAxis hide domain={[180, 196]} />
              <Tooltip
                cursor={{ stroke: "var(--border)" }}
                content={<ChartTooltip />}
              />
              <Line
                type="monotone"
                dataKey="open"
                name="Open backlog"
                stroke="#ef4444"
                strokeWidth={2.25}
                dot={false}
                activeDot={{ r: 3, strokeWidth: 0 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-mono text-lg font-semibold tabular-nums">
          184 open
        </span>
        <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400">
          −4 today
        </span>
      </div>
    </div>
  );
}

function AssignmentCard({
  owner,
  setOwner,
  target,
  setTarget,
  assigned,
  setAssigned,
}: {
  owner: string;
  setOwner: (value: string) => void;
  target: string;
  setTarget: (value: string) => void;
  assigned: boolean;
  setAssigned: (value: boolean) => void;
}) {
  if (assigned) {
    const ownerLabel = owner === "amina" ? "Amina's pod" : "Platform support";

    return (
      <div className="bg-background flex min-h-[278px] flex-col rounded-lg border p-3 shadow-xs">
        <div className="flex flex-1 flex-col items-start justify-center py-6">
          <span className="flex size-8 items-center justify-center rounded-md bg-emerald-600 text-white">
            <Check aria-hidden="true" className="size-4" />
          </span>
          <p className="mt-4 text-sm font-semibold">3 urgent cases assigned</p>
          <p className="text-muted-foreground mt-1 text-xs leading-5">
            {ownerLabel} owns the response by{" "}
            {target === "today" ? "5:00 PM today" : "10:00 AM tomorrow"}.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setAssigned(false)}
        >
          Edit assignment
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-[278px] rounded-lg border p-3 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-medium">Urgent ownership</span>
          <span className="text-muted-foreground mt-0.5 block text-[11px]">
            Three cases selected
          </span>
        </div>
        <span className="font-mono text-lg font-semibold tabular-nums">3</span>
      </div>

      <div className="mt-3 flex h-7 overflow-hidden rounded-md border p-0.5">
        <span
          className="flex-[2] rounded-[3px] bg-red-500"
          title="2 critical cases"
        />
        <span
          className="ml-0.5 flex-1 rounded-[3px] bg-amber-500"
          title="1 high-risk case"
        />
      </div>
      <div className="text-muted-foreground mt-1.5 flex items-center gap-3 text-[10px]">
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-red-500" />2 critical
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-amber-500" />1 high
        </span>
      </div>

      <div className="mt-3 space-y-2">
        <Select value={owner} onValueChange={setOwner}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Choose owner" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="amina">Amina&apos;s pod</SelectItem>
              <SelectItem value="platform">Platform support</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select value={target} onValueChange={setTarget}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="today">Today, 5:00 PM</SelectItem>
              <SelectItem value="tomorrow">Tomorrow, 10:00 AM</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <Button
        type="button"
        size="sm"
        className="mt-3 w-full"
        disabled={!owner}
        onClick={() => setAssigned(true)}
      >
        Assign 3 cases
      </Button>
    </div>
  );
}

const pages = [
  {
    prose: (
      <>
        <strong className="text-foreground font-medium">Helio Freight</strong>{" "}
        now ranks first at{" "}
        <span className="font-mono text-red-700 dark:text-red-400">92</span>{" "}
        after pressure rose all week.
      </>
    ),
    action: "How did the backlog change?",
    Card: CasePressureCard,
  },
  {
    prose: (
      <>
        The backlog peaked at{" "}
        <strong className="text-foreground font-medium">193 on Monday</strong>{" "}
        and has recovered to 184.
      </>
    ),
    action: "Who should own the urgent cases?",
    Card: BacklogSpikeCard,
  },
  {
    prose: (
      <>
        Three urgent cases still need one accountable owner and a response
        target.
      </>
    ),
    action: null,
    Card: AssignmentCard,
  },
] as const;

export function SupportPriorityInsights() {
  const [page, setPage] = React.useState(0);
  const [owner, setOwner] = React.useState("");
  const [target, setTarget] = React.useState("today");
  const [assigned, setAssigned] = React.useState(false);

  const current = pages[page];
  const move = (direction: -1 | 1) => {
    setPage((value) => (value + direction + pages.length) % pages.length);
  };

  return (
    <div
      data-support-insights
      className="min-h-[408px] w-full max-w-[22rem]"
      aria-label="Support insights"
    >
      <div className="flex items-center justify-between">
        <span className="flex items-baseline gap-1.5">
          <span className="text-[13px] font-semibold">Insights</span>
          <span className="text-muted-foreground text-[13px] tabular-nums">
            {pages.length}
          </span>
        </span>
        <span className="flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Previous insight"
            onClick={() => move(-1)}
          >
            <ChevronLeft aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Next insight"
            onClick={() => move(1)}
          >
            <ChevronRight aria-hidden="true" />
          </Button>
        </span>
      </div>

      <div aria-live="polite">
        <p className="text-muted-foreground mt-1.5 text-[12.5px] leading-relaxed">
          {current.prose}
        </p>
        <div className="mt-2">
          <current.Card
            owner={owner}
            setOwner={setOwner}
            target={target}
            setTarget={setTarget}
            assigned={assigned}
            setAssigned={setAssigned}
          />
        </div>
        {current.action ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="bg-background hover:bg-muted mt-2 rounded-full px-3 shadow-[0_0_0_1px_var(--border),0_1px_2px_oklch(0_0_0/0.04)]"
            onClick={() => move(1)}
          >
            {current.action}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
