"use client";

import "@xyflow/react/dist/style.css";

import {
  Background,
  Controls,
  type Edge,
  Handle,
  MarkerType,
  type Node,
  type NodeProps,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import {
  Activity,
  ArrowDown,
  ArrowDownRight,
  ArrowUp,
  ArrowUpRight,
  ChevronRight,
  CircleCheckBig,
  CreditCard,
  Fingerprint,
  Gauge,
  Info,
  Network,
  Pencil,
  Plus,
  ShieldCheck,
  ShieldX,
  Split,
  SquareArrowOutUpRight,
} from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type RangeKey = "24h" | "7d" | "30d";

type Health = "healthy" | "degraded";

type ExceptionAction = "blocked" | "challenged" | "rerouted" | "retried";

type Metric = {
  id: string;
  label: string;
  /** Tooltip behind the info affordance next to the label. */
  hint: string;
  value: string;
  unit: string;
  icon: typeof Activity;
  /**
   * Metrics with a goal show attainment against it. `blocked` deliberately has
   * none — there is no sensible number of fraud blocks to aim for — so it falls
   * back to a period-over-period trend the way the other three cannot.
   */
  goal?: {
    /** The goal itself, shown at the end of the bar. */
    value: string;
    /** Attainment 0-100, already resolved so the bar never does the maths. */
    progress: number;
    met: boolean;
  };
  trend?: { delta: string; favourable: boolean };
};

const ranges: { value: RangeKey; label: string }[] = [
  { label: "Last 24 hours", value: "24h" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
];

// Authorization rate and latency are the traffic-weighted roll-up of the three
// acquirers below, so the cards and the topology never disagree:
// 0.62 x 95.8 + 0.27 x 94.1 + 0.11 x 88.4 = 94.5%
// 0.62 x 380 + 0.27 x 402 + 0.11 x 910 = 444ms
const metricsByRange: Record<RangeKey, Metric[]> = {
  "24h": [
    {
      goal: { met: false, progress: 86, value: "150k" },
      hint: "Payment intents accepted at the ingress endpoint.",
      icon: CreditCard,
      id: "routed",
      label: "Payments routed",
      unit: "k",
      value: "128.4",
    },
    {
      goal: { met: true, progress: 100, value: "94%" },
      hint: "Share of routed payments the acquirer approved.",
      icon: ShieldCheck,
      id: "auth-rate",
      label: "Authorization rate",
      unit: "%",
      value: "94.5",
    },
    {
      goal: { met: false, progress: 90, value: "400ms" },
      hint: "Traffic-weighted time to an acquirer decision.",
      icon: Gauge,
      id: "latency",
      label: "Avg auth latency",
      unit: "ms",
      value: "444",
    },
    {
      hint: "Stopped by risk rules before reaching an acquirer.",
      icon: ShieldX,
      id: "blocked",
      label: "Blocked by rules",
      trend: { delta: "+6.1%", favourable: false },
      unit: "k",
      value: "3.1",
    },
  ],
  "7d": [
    {
      goal: { met: false, progress: 85, value: "1.05M" },
      hint: "Payment intents accepted at the ingress endpoint.",
      icon: CreditCard,
      id: "routed",
      label: "Payments routed",
      unit: "k",
      value: "892.6",
    },
    {
      goal: { met: true, progress: 100, value: "94%" },
      hint: "Share of routed payments the acquirer approved.",
      icon: ShieldCheck,
      id: "auth-rate",
      label: "Authorization rate",
      unit: "%",
      value: "94.9",
    },
    {
      goal: { met: false, progress: 95, value: "400ms" },
      hint: "Traffic-weighted time to an acquirer decision.",
      icon: Gauge,
      id: "latency",
      label: "Avg auth latency",
      unit: "ms",
      value: "421",
    },
    {
      hint: "Stopped by risk rules before reaching an acquirer.",
      icon: ShieldX,
      id: "blocked",
      label: "Blocked by rules",
      trend: { delta: "+2.4%", favourable: false },
      unit: "k",
      value: "20.4",
    },
  ],
  "30d": [
    {
      goal: { met: false, progress: 83, value: "4.5M" },
      hint: "Payment intents accepted at the ingress endpoint.",
      icon: CreditCard,
      id: "routed",
      label: "Payments routed",
      unit: "M",
      value: "3.74",
    },
    {
      goal: { met: true, progress: 100, value: "94%" },
      hint: "Share of routed payments the acquirer approved.",
      icon: ShieldCheck,
      id: "auth-rate",
      label: "Authorization rate",
      unit: "%",
      value: "95.2",
    },
    {
      goal: { met: true, progress: 98, value: "400ms" },
      hint: "Traffic-weighted time to an acquirer decision.",
      icon: Gauge,
      id: "latency",
      label: "Avg auth latency",
      unit: "ms",
      value: "408",
    },
    {
      hint: "Stopped by risk rules before reaching an acquirer.",
      icon: ShieldX,
      id: "blocked",
      label: "Blocked by rules",
      trend: { delta: "-3.8%", favourable: true },
      unit: "k",
      value: "84.9",
    },
  ],
};

const healthMeta: Record<
  Health,
  { label: string; dot: string; badge: string }
> = {
  degraded: {
    badge:
      "border-amber-600/20 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-900/30 dark:text-amber-400",
    dot: "bg-amber-500",
    label: "Degraded",
  },
  healthy: {
    badge:
      "border-emerald-600/20 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-900/30 dark:text-emerald-400",
    dot: "bg-emerald-500",
    label: "Healthy",
  },
};

/**
 * Card networks read as a ticker rather than as more cards: they are a
 * reference row you scan, not headline numbers. Volumes sum to the 125.3k the
 * router forwards, so the strip agrees with the topology underneath it.
 */
const networkTicker = [
  {
    authRate: "95.4%",
    delta: "+0.6%",
    name: "Visa",
    up: true,
    volume: "58.9k",
  },
  {
    authRate: "94.8%",
    delta: "+0.3%",
    name: "Mastercard",
    up: true,
    volume: "41.2k",
  },
  {
    authRate: "91.2%",
    delta: "-1.4%",
    name: "Amex",
    up: false,
    volume: "13.6k",
  },
  {
    authRate: "89.7%",
    delta: "-0.8%",
    name: "Discover",
    up: false,
    volume: "7.1k",
  },
  {
    authRate: "93.1%",
    delta: "+0.2%",
    name: "UnionPay",
    up: true,
    volume: "4.5k",
  },
];

const topologyUpdated = "Jul 21 / 10:03 AM";

const nodeWidth = 232;

type RouteKind = "ingress" | "gate" | "router" | "acquirer" | "terminal";

type RouteStep = {
  id: string;
  kind: RouteKind;
  title: string;
  icon: typeof Activity;
  x: number;
  y: number;
  hasTarget: boolean;
  hasSource: boolean;
  health?: Health;
  rows: { label: string; value: string }[];
};

const stepTileClass: Record<RouteKind, string> = {
  acquirer: "bg-muted text-foreground ring-border",
  gate: "bg-amber-50 text-amber-600 ring-amber-600/20 dark:bg-amber-950/50 dark:text-amber-400 dark:ring-amber-400/20",
  ingress: "bg-primary/10 text-primary ring-primary/20",
  router: "bg-primary/10 text-primary ring-primary/20",
  terminal:
    "bg-emerald-50 text-emerald-600 ring-emerald-600/20 dark:bg-emerald-950/50 dark:text-emerald-400 dark:ring-emerald-400/20",
};

/**
 * Laid out on a fixed grid rather than an auto-layout pass: the shape of the
 * fan-out is the point of the panel, so it should not reflow when a consumer
 * renames an acquirer.
 *
 * The volumes reconcile down the whole graph. 128.4k intents arrive, the risk
 * gate blocks 3.1k, the router splits the surviving 125.3k as 62 / 27 / 11,
 * and each acquirer's own auth rate leaves 74.4k + 31.8k + 12.2k = 118.4k
 * authorized.
 */
const routeSteps: RouteStep[] = [
  {
    hasSource: true,
    hasTarget: false,
    icon: CreditCard,
    id: "intake",
    kind: "ingress",
    rows: [
      { label: "Endpoint", value: "/v1/payment_intents" },
      { label: "Intents", value: "128.4k" },
    ],
    title: "Payment intake",
    x: 0,
    y: 0,
  },
  {
    hasSource: true,
    hasTarget: true,
    icon: ShieldCheck,
    id: "risk",
    kind: "gate",
    rows: [
      { label: "Checks", value: "AVS · 3DS · Fraud" },
      { label: "Blocked", value: "3.1k" },
    ],
    title: "Risk gate",
    x: 0,
    y: 172,
  },
  {
    hasSource: false,
    hasTarget: true,
    icon: ShieldX,
    id: "blocked",
    kind: "gate",
    rows: [{ label: "Rules hit", value: "3.1k" }],
    title: "Blocked",
    x: -280,
    y: 172,
  },
  {
    hasSource: true,
    hasTarget: true,
    icon: Split,
    id: "router",
    kind: "router",
    rows: [
      { label: "Profile", value: "Global card" },
      { label: "Routed", value: "125.3k" },
    ],
    title: "Dynamic router",
    x: 0,
    y: 344,
  },
  {
    hasSource: true,
    hasTarget: true,
    health: "healthy",
    icon: Network,
    id: "stripe",
    kind: "acquirer",
    rows: [
      { label: "Traffic", value: "62% · 77.7k" },
      { label: "Auth rate", value: "95.8%" },
      { label: "Avg latency", value: "380ms" },
      { label: "Authorized", value: "74.4k" },
    ],
    title: "Stripe",
    x: -280,
    y: 516,
  },
  {
    hasSource: true,
    hasTarget: true,
    health: "healthy",
    icon: Network,
    id: "adyen",
    kind: "acquirer",
    rows: [
      { label: "Traffic", value: "27% · 33.8k" },
      { label: "Auth rate", value: "94.1%" },
      { label: "Avg latency", value: "402ms" },
      { label: "Authorized", value: "31.8k" },
    ],
    title: "Adyen",
    x: 0,
    y: 516,
  },
  {
    hasSource: true,
    hasTarget: true,
    health: "degraded",
    icon: Network,
    id: "checkout",
    kind: "acquirer",
    rows: [
      { label: "Traffic", value: "11% · 13.8k" },
      { label: "Auth rate", value: "88.4%" },
      { label: "Avg latency", value: "910ms" },
      { label: "Authorized", value: "12.2k" },
    ],
    title: "Checkout.com",
    x: 280,
    y: 516,
  },
  {
    hasSource: false,
    hasTarget: true,
    icon: CircleCheckBig,
    id: "authorized",
    kind: "terminal",
    rows: [{ label: "Captured", value: "118.4k" }],
    title: "Authorized",
    x: 0,
    y: 732,
  },
];

// Unlabelled: the numbers live in the nodes. As edge labels they sat at the
// midpoint of short vertical segments and collided with the node borders.
const routeLinks: { from: string; to: string }[] = [
  { from: "intake", to: "risk" },
  { from: "risk", to: "blocked" },
  { from: "risk", to: "router" },
  { from: "router", to: "stripe" },
  { from: "router", to: "adyen" },
  { from: "router", to: "checkout" },
  { from: "stripe", to: "authorized" },
  { from: "adyen", to: "authorized" },
  { from: "checkout", to: "authorized" },
];

const routeEdgeColor = "var(--muted-foreground)";

const actionMeta: Record<ExceptionAction, { label: string; badge: string }> = {
  blocked: {
    badge:
      "border-rose-600/20 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-900/30 dark:text-rose-400",
    label: "Blocked",
  },
  challenged: {
    badge:
      "border-amber-600/20 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-900/30 dark:text-amber-400",
    label: "Challenged",
  },
  rerouted: {
    badge:
      "border-sky-600/20 bg-sky-50 text-sky-700 dark:border-sky-400/20 dark:bg-sky-900/30 dark:text-sky-400",
    label: "Rerouted",
  },
  retried: {
    badge:
      "border-zinc-300 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-300",
    label: "Retried",
  },
};

// Card numbers and API keys are stored truncated, so the detail column shows
// exactly what the risk log holds and nothing more.
const exceptions: {
  id: string;
  time: string;
  payment: string;
  rule: string;
  detail: string;
  action: ExceptionAction;
}[] = [
  {
    action: "blocked",
    detail: "6 attempts in 9 min · card ••••4242",
    id: "exc-1",
    payment: "pay_3k9wq2",
    rule: "Velocity: attempts per card",
    time: "10:42:18",
  },
  {
    action: "blocked",
    detail: "device fingerprint reused ×14",
    id: "exc-2",
    payment: "pay_8mzx41",
    rule: "Fraud score 0.91 > 0.85",
    time: "10:37:04",
  },
  {
    action: "challenged",
    detail: "SW1A 1AA ≠ SW1A 2AB",
    id: "exc-3",
    payment: "pay_1qd07b",
    rule: "AVS postal mismatch",
    time: "10:15:52",
  },
  {
    action: "challenged",
    detail: "€1,240.00 · exemption denied",
    id: "exc-4",
    payment: "pay_7vbn55",
    rule: "3DS required (EU SCA)",
    time: "09:58:30",
  },
  {
    action: "rerouted",
    detail: "Checkout.com 5,204ms → Stripe",
    id: "exc-5",
    payment: "pay_0hk22a",
    rule: "Issuer timeout (> 5000ms)",
    time: "09:30:11",
  },
  {
    action: "retried",
    detail: "insufficient_funds · retry in 4h",
    id: "exc-6",
    payment: "pay_4pl9c3",
    rule: "Soft decline scheduler",
    time: "09:12:47",
  },
  {
    action: "blocked",
    detail: "412 req/min on sk_live_••••8f2c",
    id: "exc-7",
    payment: "pay_9tz61m",
    rule: "Rate limit exceeded",
    time: "08:45:09",
  },
  {
    action: "retried",
    detail: "challenge timeout · 120s",
    id: "exc-8",
    payment: "pay_2ncw84",
    rule: "3DS challenge abandoned",
    time: "08:20:33",
  },
];

const exceptionFilters: { value: "all" | ExceptionAction; label: string }[] = [
  { label: "All", value: "all" },
  { label: "Blocked", value: "blocked" },
  { label: "Challenged", value: "challenged" },
  { label: "Rerouted", value: "rerouted" },
  { label: "Retried", value: "retried" },
];

const ingressRows = [
  { label: "Endpoint", tag: "POST", value: "/v1/payment_intents" },
  { label: "Auth protocol", value: "Secret key + HMAC (strict)" },
  { label: "Idempotency", value: "Required · 24h window" },
  { label: "Rate limit", tag: "400", value: "req/min per key" },
];

const preAuthChecks = [
  {
    icon: CreditCard,
    rows: [
      { label: "Mode", value: "FULL" },
      { label: "On fail", value: "CHALLENGE" },
    ],
    title: "AVS / CVV",
  },
  {
    icon: ShieldCheck,
    rows: [
      { label: "Trigger", value: "RISK" },
      { label: "Version", value: "2.2" },
    ],
    title: "3D Secure",
  },
  {
    icon: Fingerprint,
    rows: [
      { label: "Threshold", value: "0.85" },
      { label: "Action", value: "BLOCK" },
    ],
    title: "Fraud score",
  },
];

// The three rules are what produce the 62 / 27 / 11 traffic split next door.
const routingRules = [
  {
    conditions: [
      { field: "currency", operator: "==", values: ["EUR", "GBP"] },
      { field: "amount", operator: ">", values: ["500.00"] },
    ],
    fallback: "Stripe",
    id: "01",
    priority: "High",
    priorityClass:
      "border-rose-600/20 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-900/30 dark:text-rose-400",
    retries: "2",
    route: "Adyen",
  },
  {
    conditions: [{ field: "card_brand", operator: "==", values: ["Amex"] }],
    fallback: "Adyen",
    id: "02",
    priority: "Medium",
    priorityClass:
      "border-amber-600/20 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-900/30 dark:text-amber-400",
    retries: "1",
    route: "Stripe",
  },
  {
    // No conditions: this is the catch-all every unmatched payment falls to.
    conditions: [],
    fallback: "Checkout.com",
    id: "03",
    priority: "Low",
    priorityClass:
      "border-zinc-300 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-300",
    retries: "3",
    route: "Stripe",
  },
];

function Panel({
  action,
  children,
  className,
  icon: Icon,
  title,
}: {
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  icon: typeof Activity;
  title: string;
}) {
  return (
    <section
      className={cn(
        "bg-card flex min-w-0 flex-col rounded-lg border",
        className,
      )}
    >
      <header className="flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5">
        <h2 className="flex items-center gap-2 text-sm font-medium">
          <Icon className="text-muted-foreground size-4 shrink-0" />
          {title}
        </h2>
        {action}
      </header>
      {children}
    </section>
  );
}

/** Mono chip used for every configured value in the routing profile. */
function ConfigValue({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-muted text-foreground rounded-sm border px-2 py-0.5 font-mono text-xs">
      {children}
    </span>
  );
}

function MetricCards({ range }: { range: RangeKey }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metricsByRange[range].map((metric) => {
        const Icon = metric.icon;
        const TrendIcon = metric.trend?.delta.startsWith("-")
          ? ArrowDownRight
          : ArrowUpRight;

        return (
          <div
            className="bg-card flex min-w-0 flex-col rounded-lg border"
            key={metric.id}
          >
            <div className="flex items-center justify-between gap-2 px-4 pt-3.5">
              <div className="flex min-w-0 items-center gap-1.5">
                <p className="truncate text-sm font-medium">{metric.label}</p>
                <Tooltip>
                  <TooltipTrigger
                    aria-label={`About ${metric.label}`}
                    className="text-muted-foreground hover:text-foreground shrink-0 transition-colors"
                  >
                    <Info className="size-3.5" />
                  </TooltipTrigger>
                  <TooltipContent>{metric.hint}</TooltipContent>
                </Tooltip>
              </div>
              <Icon className="text-muted-foreground size-4 shrink-0" />
            </div>

            <div className="px-4 py-3">
              <p className="text-3xl font-semibold tracking-tight tabular-nums">
                {metric.value}
                <span className="text-muted-foreground ml-1 text-base font-normal">
                  {metric.unit}
                </span>
              </p>
            </div>

            {/* The footer band is the same height whether it holds a goal or a
                trend, so the four cards stay on one baseline. The goal chip
                lives here rather than beside the headline: next to the number
                it competed with it, and down here it sits with the bar that
                actually measures against it. */}
            <div className="mt-auto flex min-h-11 flex-wrap items-center gap-x-3 gap-y-2 border-t px-4 py-2.5">
              {metric.goal ? (
                <>
                  <span
                    aria-hidden
                    className="bg-muted h-1.5 min-w-10 flex-1 overflow-hidden rounded-full"
                  >
                    <span
                      className={cn(
                        "block h-full rounded-full",
                        metric.goal.met ? "bg-emerald-500" : "bg-foreground",
                      )}
                      style={{ width: `${metric.goal.progress}%` }}
                    />
                  </span>
                  {/* The bar carries the attainment, so the number beside it
                      is the goal itself rather than a percentage restating
                      what the bar already shows. */}
                  <span
                    className={cn(
                      "shrink-0 text-xs font-medium tabular-nums",
                      metric.goal.met &&
                        "text-emerald-600 dark:text-emerald-400",
                    )}
                  >
                    {metric.goal.value}
                  </span>
                </>
              ) : (
                <span
                  className={cn(
                    "flex items-center gap-1 text-xs font-medium tabular-nums",
                    metric.trend?.favourable
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400",
                  )}
                >
                  <TrendIcon className="size-3.5 shrink-0" />
                  {metric.trend?.delta}
                  <span className="text-muted-foreground font-normal">
                    vs previous
                  </span>
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function NetworkTicker() {
  return (
    // `divide-x`/`divide-y` cannot draw this: they skip only the first child
    // overall, not the first of each row, so every wrapped item gains a stray
    // edge that doubles against the container border. Each cell instead owns a
    // top and left border, and the grid is pulled a pixel up and left so the
    // outermost ones tuck under the container's own border.
    <div className="bg-card overflow-hidden rounded-lg border">
      <div className="-mt-px -ml-px grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {networkTicker.map((network) => (
          <div
            className="flex min-w-0 items-center gap-3 border-t border-l px-4 py-3"
            key={network.name}
          >
            <span
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-md ring-1 ring-inset",
                network.up
                  ? "bg-emerald-50 text-emerald-600 ring-emerald-600/20 dark:bg-emerald-950/50 dark:text-emerald-400 dark:ring-emerald-400/20"
                  : "bg-rose-50 text-rose-600 ring-rose-600/20 dark:bg-rose-950/50 dark:text-rose-400 dark:ring-rose-400/20",
              )}
            >
              {network.up ? (
                <ArrowUp className="size-4" />
              ) : (
                <ArrowDown className="size-4" />
              )}
            </span>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{network.name}</p>
              <p className="flex flex-wrap items-baseline gap-x-2 text-xs">
                <span className="text-muted-foreground tabular-nums">
                  {network.volume} · {network.authRate}
                </span>
                <span
                  className={cn(
                    "font-medium tabular-nums",
                    network.up
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400",
                  )}
                >
                  {network.delta}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type RouteNodeData = Record<string, unknown> & { step: RouteStep };

type RouteNodeType = Node<RouteNodeData, "routeStep">;

function RouteStepNode({ data }: NodeProps<RouteNodeType>) {
  const { step } = data;
  const Icon = step.icon;
  const health = step.health ? healthMeta[step.health] : null;

  return (
    <div className="bg-background hover:border-foreground/20 w-full rounded-xl border shadow-sm transition-colors">
      {step.hasTarget ? (
        <Handle
          className="!size-2.5 !border-0 !bg-transparent !opacity-0"
          position={Position.Top}
          type="target"
        />
      ) : null}

      <div className="flex min-w-0 items-center gap-2.5 border-b px-3 py-2.5">
        <span
          className={cn(
            "grid size-7 shrink-0 place-items-center rounded-md ring-1 ring-inset",
            stepTileClass[step.kind],
          )}
        >
          <Icon aria-hidden="true" className="size-4" />
        </span>
        <p className="min-w-0 flex-1 truncate text-sm font-semibold">
          {step.title}
        </p>
        {health ? (
          <span
            className={cn("size-2 shrink-0 rounded-full", health.dot)}
            title={health.label}
          />
        ) : null}
      </div>

      <dl className="flex flex-col gap-1.5 px-3 py-2.5">
        {step.rows.map((row) => (
          <div
            className="flex items-center justify-between gap-3"
            key={row.label}
          >
            <dt className="text-muted-foreground truncate text-xs">
              {row.label}
            </dt>
            <dd className="shrink-0 font-mono text-xs tabular-nums">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      {step.hasSource ? (
        <Handle
          className="!size-2.5 !border-0 !bg-transparent !opacity-0"
          position={Position.Bottom}
          type="source"
        />
      ) : null}
    </div>
  );
}

const nodeTypes = { routeStep: RouteStepNode };

function AcquirerTopology() {
  const { resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const initialNodes = React.useMemo<RouteNodeType[]>(
    () =>
      routeSteps.map((step) => ({
        data: { step },
        id: step.id,
        position: { x: step.x, y: step.y },
        style: { width: nodeWidth },
        type: "routeStep" as const,
      })),
    [],
  );

  const initialEdges = React.useMemo<Edge[]>(
    () =>
      routeLinks.map((link) => ({
        id: `${link.from}-${link.to}`,
        markerEnd: { color: routeEdgeColor, type: MarkerType.ArrowClosed },
        source: link.from,
        style: { stroke: routeEdgeColor, strokeWidth: 1.5 },
        target: link.to,
        type: "smoothstep",
      })),
    [],
  );

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const backgroundDotColor =
    resolvedTheme === "dark"
      ? "color-mix(in oklab, var(--muted-foreground) 52%, transparent)"
      : "color-mix(in oklab, var(--muted-foreground) 32%, transparent)";

  return (
    <Panel
      action={
        <span className="text-muted-foreground text-xs">
          Last 24 hours · updated {topologyUpdated}
        </span>
      }
      icon={Network}
      title="Acquirer traffic & health"
    >
      {/* The graph needs its own height: React Flow measures its container, and
          the panel is only as tall as its content. fitView scales to whichever
          axis binds first, and this graph is taller than it is wide — so height
          is what decides how large the nodes actually render. */}
      <div className="h-[34rem] w-full overflow-hidden rounded-b-lg xl:h-[46rem]">
        {isMounted ? (
          <ReactFlow
            className="!bg-background [&_.react-flow__controls]:!bg-background [&_.react-flow__controls-button]:!border-border [&_.react-flow__controls-button]:!bg-background [&_.react-flow__controls-button]:!text-foreground [&_.react-flow__attribution]:hidden [&_.react-flow__controls]:!flex [&_.react-flow__controls]:!flex-row [&_.react-flow__controls]:!overflow-hidden [&_.react-flow__controls]:!rounded-md [&_.react-flow__controls]:!border [&_.react-flow__controls]:!shadow-sm [&_.react-flow__controls-button]:!size-8 [&_.react-flow__panel]:!m-3"
            colorMode={resolvedTheme === "dark" ? "dark" : "light"}
            edges={edges}
            fitView
            fitViewOptions={{ padding: "6%" }}
            maxZoom={1}
            minZoom={0.2}
            nodes={nodes}
            nodesConnectable={false}
            nodeTypes={nodeTypes}
            onEdgesChange={onEdgesChange}
            onNodesChange={onNodesChange}
            panOnDrag
            // A wheel over the canvas must scroll the page, not zoom the graph.
            // Left on, scrolling past this panel silently rescales the topology
            // and it ends up clipped. Zooming stays available via Controls.
            preventScrolling={false}
            proOptions={{ hideAttribution: true }}
            zoomOnDoubleClick={false}
            zoomOnScroll={false}
          >
            <Background color={backgroundDotColor} gap={16} size={1.5} />
            {/* fitView runs once on mount. A ResizeObserver-driven refit was
                tried here and repeatedly refit to a wrong zoom on unrelated
                reflows, so resizing instead leaves the graph where it is — the
                Controls include a fit-to-view button to recover. */}
            <Controls position="top-left" showInteractive={false} />
          </ReactFlow>
        ) : (
          <div className="grid size-full place-items-center">
            <p className="text-muted-foreground text-xs">Loading topology...</p>
          </div>
        )}
      </div>
    </Panel>
  );
}

function ExceptionsPanel() {
  const [filter, setFilter] =
    React.useState<(typeof exceptionFilters)[number]["value"]>("all");

  const visible =
    filter === "all"
      ? exceptions
      : exceptions.filter((exception) => exception.action === filter);

  return (
    <Panel icon={ShieldX} title="Risk & decline exceptions">
      <div className="horizontal-scrollbar flex shrink-0 items-center gap-1 overflow-x-auto border-b px-4 py-2">
        {exceptionFilters.map((option) => {
          const count =
            option.value === "all"
              ? exceptions.length
              : exceptions.filter(
                  (exception) => exception.action === option.value,
                ).length;

          return (
            <button
              className={cn(
                "shrink-0 rounded-sm px-2.5 py-1 text-xs font-medium transition-colors",
                filter === option.value
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              key={option.value}
              onClick={() => setFilter(option.value)}
              type="button"
            >
              {option.label}
              <span className="ml-1.5 tabular-nums opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="horizontal-scrollbar overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[104px]">Time</TableHead>
              <TableHead className="w-[132px]">Payment</TableHead>
              <TableHead>Rule</TableHead>
              <TableHead>Detail</TableHead>
              <TableHead className="w-[120px] text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((exception) => (
              <TableRow key={exception.id}>
                <TableCell className="text-muted-foreground font-mono text-xs tabular-nums">
                  {exception.time}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {exception.payment}
                </TableCell>
                <TableCell className="text-sm">{exception.rule}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {exception.detail}
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={cn(
                      "inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium",
                      actionMeta[exception.action].badge,
                    )}
                  >
                    {actionMeta[exception.action].label}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Panel>
  );
}

function ConfigSection({
  children,
  index,
  title,
}: {
  children: React.ReactNode;
  index: string;
  title: string;
}) {
  return (
    <section className="flex min-w-0 flex-col gap-3">
      <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {index}. {title}
      </h3>
      {children}
    </section>
  );
}

function RoutingProfile() {
  return (
    <Panel
      action={
        <Button size="sm" variant="outline">
          <Pencil className="size-3.5" />
          Edit profile
        </Button>
      }
      className="min-h-0"
      icon={Activity}
      title="Active routing profile"
    >
      <div className="vertical-scrollbar flex min-w-0 flex-col gap-6 overflow-y-auto p-4">
        <ConfigSection index="1" title="Ingress (entry point)">
          <dl className="bg-muted/30 divide-y rounded-md border">
            {ingressRows.map((row) => (
              <div
                className="flex items-center justify-between gap-3 px-3 py-2.5"
                key={row.label}
              >
                <dt className="text-muted-foreground truncate text-sm">
                  {row.label}
                </dt>
                <dd className="flex shrink-0 items-center gap-2">
                  <span className="font-mono text-xs">{row.value}</span>
                  {row.tag ? <ConfigValue>{row.tag}</ConfigValue> : null}
                </dd>
              </div>
            ))}
          </dl>
        </ConfigSection>

        <ConfigSection index="2" title="Pre-authorization (risk checks)">
          {/* Stacked, not three across: the rail is roughly 350px wide, so
              three columns leave ~70px for a title and "Fraud score" clips.
              Full width also lets each label sit beside its value again. */}
          <div className="grid grid-cols-1 gap-3">
            {preAuthChecks.map((check) => {
              const Icon = check.icon;

              return (
                <div
                  className="bg-muted/30 min-w-0 rounded-md border"
                  key={check.title}
                >
                  <div className="flex items-center gap-2 border-b px-3 py-2">
                    <Icon className="text-muted-foreground size-3.5 shrink-0" />
                    <p className="truncate text-sm font-medium">
                      {check.title}
                    </p>
                  </div>
                  <dl className="flex flex-col gap-2 px-3 py-2.5">
                    {check.rows.map((row) => (
                      <div
                        className="flex items-center justify-between gap-3"
                        key={row.label}
                      >
                        <dt className="text-muted-foreground truncate text-xs">
                          {row.label}
                        </dt>
                        <dd className="shrink-0">
                          <ConfigValue>{row.value}</ConfigValue>
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              );
            })}
          </div>
        </ConfigSection>

        <ConfigSection index="3" title="Dynamic router (decision matrix)">
          <div className="flex flex-col gap-3">
            {routingRules.map((rule) => (
              <div className="min-w-0 rounded-md border" key={rule.id}>
                <div className="bg-muted/30 flex items-center justify-between gap-2 border-b px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Rule {rule.id}</span>
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                        rule.priorityClass,
                      )}
                    >
                      {rule.priority}
                    </span>
                  </div>
                  <SquareArrowOutUpRight className="text-muted-foreground size-3.5 shrink-0" />
                </div>

                <div className="flex flex-col gap-2.5 px-3 py-3">
                  <div className="bg-muted/30 flex flex-wrap items-center gap-1.5 rounded-sm border px-2.5 py-2 font-mono text-xs">
                    <span className="text-muted-foreground">
                      {rule.conditions.length === 0 ? "ELSE" : "IF"}
                    </span>
                    {rule.conditions.length === 0 ? (
                      <ConfigValue>any unmatched payment</ConfigValue>
                    ) : null}
                    {rule.conditions.map((condition, index) => (
                      <React.Fragment key={condition.field}>
                        {index > 0 ? (
                          <span className="text-muted-foreground">AND</span>
                        ) : null}
                        <ConfigValue>{condition.field}</ConfigValue>
                        <span className="text-muted-foreground">
                          {condition.operator}
                        </span>
                        {condition.values.map((value) => (
                          <ConfigValue key={value}>{value}</ConfigValue>
                        ))}
                      </React.Fragment>
                    ))}
                  </div>

                  <dl className="flex flex-col gap-2">
                    {[
                      { label: "Route to", value: rule.route },
                      { label: "Retries", value: rule.retries },
                      { label: "Fallback", value: rule.fallback },
                    ].map((row) => (
                      <div
                        className="flex items-center justify-between gap-3"
                        key={row.label}
                      >
                        <dt className="text-muted-foreground truncate text-sm">
                          {row.label}
                        </dt>
                        <dd className="shrink-0">
                          <ConfigValue>{row.value}</ConfigValue>
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            ))}
          </div>
        </ConfigSection>
      </div>
    </Panel>
  );
}

export function PaymentProcessorDashboard6({
  className,
}: {
  className?: string;
}) {
  const [range, setRange] = React.useState<RangeKey>("24h");

  return (
    <main
      className={cn(
        "bg-background text-foreground min-h-0 flex-1 overflow-y-auto",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-[1536px] min-w-0 flex-col gap-4 p-4 md:p-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="text-muted-foreground truncate text-sm">
              Routing profiles
            </span>
            <ChevronRight className="text-muted-foreground size-4 shrink-0" />
            <h1 className="truncate text-lg font-semibold tracking-tight">
              Global card acceptance
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Select
              onValueChange={(value) => setRange(value as RangeKey)}
              value={range}
            >
              <SelectTrigger className="h-8 w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ranges.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm">
              <Plus className="size-4" />
              New rule
            </Button>
          </div>
        </header>

        <MetricCards range={range} />
        <NetworkTicker />

        <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-12">
          <div className="flex min-w-0 flex-col gap-4 xl:col-span-8">
            <AcquirerTopology />
            <ExceptionsPanel />
          </div>
          <div className="flex min-w-0 flex-col xl:col-span-4">
            <RoutingProfile />
          </div>
        </div>
      </div>
    </main>
  );
}
