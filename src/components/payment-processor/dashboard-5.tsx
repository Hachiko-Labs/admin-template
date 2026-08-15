"use client";

import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BadgeDollarSign,
  BanknoteArrowUp,
  BrainCircuit,
  CircleGauge,
  CreditCard,
  FileText,
  Fingerprint,
  RadioTower,
  RefreshCw,
  ShieldCheck,
  Timer,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";
import { JetBrains_Mono } from "next/font/google";
import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  RadialBar,
  RadialBarChart,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PaymentRoutingGlobe } from "@/components/payment-processor/payment-routing-globe";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mixBase = "var(--background)";

const palette = {
  primary: "var(--primary)",
  secondary: {
    light: `color-mix(in oklch, var(--primary) 74%, ${mixBase})`,
    dark: `color-mix(in oklch, var(--primary) 84%, ${mixBase})`,
  },
  tertiary: {
    light: `color-mix(in oklch, var(--primary) 56%, ${mixBase})`,
    dark: `color-mix(in oklch, var(--primary) 68%, ${mixBase})`,
  },
  quaternary: {
    light: `color-mix(in oklch, var(--primary) 38%, ${mixBase})`,
    dark: `color-mix(in oklch, var(--primary) 52%, ${mixBase})`,
  },
  danger: {
    light: `color-mix(in oklch, var(--destructive) 86%, ${mixBase})`,
    dark: `color-mix(in oklch, var(--destructive) 74%, ${mixBase})`,
  },
};

const chartConfig = {
  volume: { label: "Volume", color: palette.primary },
  authorized: { label: "Authorized", theme: palette.secondary },
  risk: { label: "Risk", theme: palette.danger },
  latency: { label: "Latency", theme: palette.tertiary },
  payout: { label: "Payout", theme: palette.quaternary },
} satisfies ChartConfig;

const paymentPulse = [
  { time: "00:00", volume: 142, authorized: 132, risk: 8, latency: 88 },
  { time: "02:00", volume: 156, authorized: 146, risk: 10, latency: 92 },
  { time: "04:00", volume: 149, authorized: 139, risk: 9, latency: 84 },
  { time: "06:00", volume: 184, authorized: 171, risk: 12, latency: 96 },
  { time: "08:00", volume: 226, authorized: 213, risk: 15, latency: 101 },
  { time: "10:00", volume: 318, authorized: 301, risk: 18, latency: 113 },
  { time: "12:00", volume: 386, authorized: 366, risk: 21, latency: 119 },
  { time: "14:00", volume: 421, authorized: 397, risk: 19, latency: 108 },
  { time: "16:00", volume: 398, authorized: 374, risk: 23, latency: 124 },
  { time: "18:00", volume: 472, authorized: 451, risk: 22, latency: 116 },
  { time: "20:00", volume: 536, authorized: 511, risk: 20, latency: 107 },
  { time: "22:00", volume: 508, authorized: 486, risk: 18, latency: 99 },
];

const recentClientPayments = [
  {
    client: "Northstar Clinics",
    initials: "NC",
    avatar: "/avatars/avatar-1.png",
    amount: "$9,842",
    detail: "Visa · Stripe",
    status: "Paid",
    time: "12 sec ago",
  },
  {
    client: "Atlas Freight",
    initials: "AF",
    avatar: "/avatars/avatar-2.png",
    amount: "$18,320",
    detail: "ACH · Column",
    status: "Settling",
    time: "38 sec ago",
  },
  {
    client: "Mori Labs",
    initials: "ML",
    avatar: "/avatars/avatar-3.png",
    amount: "$4,680",
    detail: "Mastercard · Adyen",
    status: "Paid",
    time: "1 min ago",
  },
  {
    client: "Kite Commerce",
    initials: "KC",
    avatar: "/avatars/avatar-4.png",
    amount: "$12,460",
    detail: "UPI · Razorpay",
    status: "Paid",
    time: "2 min ago",
  },
  {
    client: "Orbit Travel",
    initials: "OT",
    avatar: "/avatars/avatar-5.png",
    amount: "$7,240",
    detail: "Visa · Stripe",
    status: "Review",
    time: "3 min ago",
  },
];

const userEngagementMesh = [
  { name: "Activated", value: 92, fill: "var(--color-volume)" },
  { name: "Returning", value: 86, fill: "var(--color-authorized)" },
  { name: "Power users", value: 74, fill: "var(--color-payout)" },
  { name: "Winback", value: 61, fill: "var(--color-latency)" },
];

const paymentMethodPerformance = [
  {
    method: "Cards",
    provider: "Visa, Mastercard, Amex",
    status: "Healthy",
    successRate: 97.8,
    confirmation: "96ms",
    volume: "$428.6K processed",
  },
  {
    method: "Bank transfers",
    provider: "ACH payments",
    status: "Slower today",
    successRate: 96.4,
    confirmation: "3.8h",
    volume: "$186.2K processed",
  },
  {
    method: "UPI",
    provider: "India instant payments",
    status: "Needs attention",
    successRate: 91.2,
    confirmation: "118ms",
    volume: "$92.4K processed",
  },
  {
    method: "Digital wallets",
    provider: "Apple Pay, Google Pay",
    status: "Healthy",
    successRate: 96.9,
    confirmation: "104ms",
    volume: "$54.8K processed",
  },
];

const paymentMethodInsights = [
  {
    label: "Recovery opportunity",
    value: "$5.8K",
    detail:
      "UPI success is 5.9 points below the other payment methods. Reaching today's average could recover this much in daily sales.",
    metricLabel: "UPI success",
    metricValue: "91.2%",
    icon: TrendingUp,
  },
  {
    label: "Collection quality",
    value: "96.7%",
    detail:
      "Across all payment methods, nearly 97 of every 100 attempted payments completed successfully today.",
    metricLabel: "Processed",
    metricValue: "$762K",
    icon: ShieldCheck,
  },
  {
    label: "Transfer delay",
    value: "3.8h",
    detail:
      "Bank transfers are confirming more slowly than usual. Card and wallet payments remain near-instant.",
    metricLabel: "ACH volume",
    metricValue: "$186K",
    icon: BanknoteArrowUp,
  },
];

const retentionMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

const userRetentionMatrix = [
  { cohort: "Jan", users: 0, values: [0, 0, 0, 0, 0, 0] },
  { cohort: "Feb", users: 2, values: [null, 100, 100, 100, 100, 100] },
  { cohort: "Mar", users: 5, values: [null, null, 100, 100, 100, 100] },
  { cohort: "Apr", users: 2, values: [null, null, null, 100, 100, 100] },
  { cohort: "May", users: 0, values: [null, null, null, null, 0, 0] },
  { cohort: "Jun", users: 0, values: [null, null, null, null, null, 0] },
];

const retentionLegend = [
  {
    label: "80%+",
    style: {
      backgroundColor: `color-mix(in oklch, var(--primary) 18%, ${mixBase})`,
      borderColor: `color-mix(in oklch, var(--primary) 34%, transparent)`,
    },
  },
  {
    label: "60-79%",
    style: {
      backgroundColor: `color-mix(in oklch, var(--primary) 12%, ${mixBase})`,
      borderColor: `color-mix(in oklch, var(--primary) 26%, transparent)`,
    },
  },
  {
    label: "40-59%",
    style: {
      backgroundColor: `color-mix(in oklch, var(--primary) 8%, ${mixBase})`,
      borderColor: `color-mix(in oklch, var(--primary) 20%, transparent)`,
    },
  },
  {
    label: "Below 40%",
    style: {
      backgroundColor: `color-mix(in oklch, var(--primary) 5%, ${mixBase})`,
      borderColor: `color-mix(in oklch, var(--primary) 16%, transparent)`,
    },
  },
];

const getRetentionCellTone = (value: number | null) => {
  if (value === null) {
    return {
      className: "text-muted-foreground",
      style: {
        backgroundColor: `color-mix(in oklch, var(--muted) 42%, transparent)`,
      },
    };
  }

  if (value >= 80) {
    return {
      className: "text-primary",
      style: {
        backgroundColor: `color-mix(in oklch, var(--primary) 18%, ${mixBase})`,
      },
    };
  }

  if (value >= 60) {
    return {
      className: "text-primary",
      style: {
        backgroundColor: `color-mix(in oklch, var(--primary) 12%, ${mixBase})`,
      },
    };
  }

  if (value >= 40) {
    return {
      className: "text-primary",
      style: {
        backgroundColor: `color-mix(in oklch, var(--primary) 8%, ${mixBase})`,
      },
    };
  }

  return {
    className: "text-muted-foreground",
    style: {
      backgroundColor: `color-mix(in oklch, var(--primary) 5%, ${mixBase})`,
    },
  };
};

const missionStats = [
  {
    label: "MRR",
    value: "$284K",
    delta: "+11.6%",
    icon: BadgeDollarSign,
    tone: "text-primary",
  },
  {
    label: "Auth rate",
    value: "97.4%",
    delta: "+2.1%",
    icon: ShieldCheck,
    tone: "text-primary",
  },
  {
    label: "Risk exposure",
    value: "$42.7K",
    delta: "-6.3%",
    icon: Fingerprint,
    tone: "text-destructive",
  },
  {
    label: "ARR",
    value: "$3.41M",
    delta: "+13.2%",
    icon: WalletCards,
    tone: "text-primary",
  },
];

const commandActions = [
  { label: "Subscriptions", icon: RefreshCw },
  { label: "Invoices", icon: FileText },
  { label: "Users", icon: Users },
  { label: "Payouts", icon: WalletCards },
];

const overviewDetails = [
  { label: "Window", value: "Last 24 hours" },
  { label: "Active users", value: "1,234" },
  { label: "New signups", value: "56" },
  { label: "Subscriptions", value: "1,284 active" },
  { label: "Payout queue", value: "$318K" },
  { label: "Retention", value: "88%" },
  { label: "Invoices", value: "$42.7K open" },
  { label: "Avg. order", value: "$85" },
];

function SciFiCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "group/card border-border/70 bg-card/80 relative overflow-hidden border backdrop-blur",
        className,
      )}
    >
      {children}
      <div className="pointer-events-none absolute inset-0">
        <Corner className="top-0 left-0" />
        <Corner className="top-0 right-0 -scale-x-100" />
        <Corner className="bottom-0 left-0 -scale-y-100" />
        <Corner className="right-0 bottom-0 -scale-100" />
      </div>
    </section>
  );
}

function Corner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute size-3 opacity-45 transition-opacity duration-300 group-hover/card:animate-[cornerGlitch_0.6s_ease-in-out] group-hover/card:opacity-100",
        className,
      )}
    >
      <span className="bg-primary/70 absolute top-0 left-0.5 h-0.5 w-2.5" />
      <span className="bg-primary/70 absolute top-0 left-0 h-2.5 w-0.5" />
    </div>
  );
}

function Chip({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "border-border/70 bg-muted/60 text-muted-foreground inline-flex items-center gap-1 border px-2.5 py-1 font-mono text-[10px] tracking-[0.16em] uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
}

function SectionHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-muted-foreground font-mono text-[10px] tracking-[0.22em] uppercase">
          {eyebrow}
        </p>
        <h2 className="text-foreground mt-2 text-base font-semibold">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

function CommandHeader() {
  return (
    <SciFiCard className="p-4 lg:p-5">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <h1 className="text-foreground text-2xl font-medium tracking-tight text-balance">
              Payments Overview
            </h1>
            <Chip className="border-primary/25 text-primary">
              <RadioTower className="size-3 text-green-600 dark:text-green-400" />
              Live Mode
            </Chip>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:flex xl:justify-end">
            {commandActions.map((action) => (
              <button
                className="group/action border-border/70 bg-muted/60 hover:border-primary/35 hover:bg-primary/10 focus-visible:ring-ring text-foreground inline-flex h-9 items-center justify-center gap-2 border px-3 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
                key={action.label}
                type="button"
              >
                <action.icon className="text-muted-foreground group-hover/action:text-primary size-3.5 transition-colors" />
                {action.label}
              </button>
            ))}
          </div>
        </div>

        <div className="border-border/70 grid gap-4 border-t pt-5 xl:grid-cols-[minmax(0,520px)_1fr]">
          <div className="border-border/70 bg-muted/40 grid gap-4 border p-4 sm:grid-cols-[150px_1fr]">
            <div className="flex items-center justify-center">
              <div
                className="relative flex size-32 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(var(--primary) 0deg 306deg, color-mix(in oklch, var(--muted-foreground) 22%, transparent) 306deg 360deg)`,
                }}
              >
                <div className="bg-card flex size-24 items-center justify-center rounded-full">
                  <span
                    className={cn(
                      "text-foreground text-2xl font-semibold tabular-nums",
                      mono.className,
                    )}
                  >
                    85%
                  </span>
                </div>
              </div>
            </div>

            <div className="flex min-w-0 flex-col justify-center">
              <p className="text-foreground text-base font-semibold">
                Payment health
              </p>
              <p className="text-muted-foreground mt-1 max-w-sm text-sm leading-5">
                Payouts are above baseline while open invoices remain contained.
              </p>

              <div className="border-border/70 mt-5 grid grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <p className="text-muted-foreground text-xs">Gross volume</p>
                  <p
                    className={cn(
                      "text-foreground mt-1 text-lg font-semibold tabular-nums",
                      mono.className,
                    )}
                  >
                    $1.84M
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Payout trend</p>
                  <p
                    className={cn(
                      "text-primary mt-1 text-lg font-semibold tabular-nums",
                      mono.className,
                    )}
                  >
                    +8.9%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-x-8 gap-y-5 py-1 sm:grid-cols-2 lg:grid-cols-4">
            {overviewDetails.map((item) => (
              <div key={item.label}>
                <p className="text-muted-foreground text-xs font-semibold">
                  {item.label}
                </p>
                <p
                  className={cn(
                    "text-foreground mt-1 text-sm font-medium tabular-nums",
                    mono.className,
                  )}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SciFiCard>
  );
}

function MetricCard({
  label,
  value,
  delta,
  icon: Icon,
  tone,
}: (typeof missionStats)[number]) {
  const isPositive = delta.startsWith("+");

  return (
    <SciFiCard className="min-h-[150px] p-4 transition-transform duration-300 hover:-translate-y-0.5">
      <div className="flex h-full flex-col justify-between gap-8">
        <div className="flex items-center justify-between gap-3">
          <span
            className={cn(
              "border-border/70 bg-muted/60 flex size-10 items-center justify-center border",
              tone,
            )}
          >
            <Icon className="size-5" />
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 font-mono text-xs",
              isPositive ? "text-primary" : "text-destructive",
            )}
          >
            {isPositive ? (
              <ArrowUpRight className="size-3.5" />
            ) : (
              <ArrowDownRight className="size-3.5" />
            )}
            {delta}
          </span>
        </div>
        <div>
          <p className="text-muted-foreground font-mono text-[10px] tracking-[0.22em] uppercase">
            {label}
          </p>
          <p
            className={cn(
              "text-foreground mt-2 text-2xl font-semibold tabular-nums",
              mono.className,
            )}
          >
            {value}
          </p>
        </div>
      </div>
    </SciFiCard>
  );
}

function VolumePanel() {
  return (
    <SciFiCard className="p-4 lg:col-span-12 lg:p-5">
      <SectionHeader
        action={
          <Chip className="border-primary/20 text-primary hidden sm:inline-flex">
            <Activity className="size-3" />
            Live today
          </Chip>
        }
        eyebrow="Signal 01"
        title="Payments processed today"
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="ml-auto flex flex-wrap items-center gap-4 text-xs">
          <span className="text-muted-foreground inline-flex items-center gap-2">
            <span className="bg-primary size-2 rounded-full" />
            Payment attempts
          </span>
          <span className="text-muted-foreground inline-flex items-center gap-2">
            <span className="border-primary size-2 rounded-full border" />
            Successful payments
          </span>
        </div>
      </div>

      <ChartContainer className="mt-5 h-[300px] w-full" config={chartConfig}>
        <AreaChart data={paymentPulse} margin={{ left: 0, right: 8, top: 8 }}>
          <defs>
            <linearGradient id="processorGlow" x1="0" x2="0" y1="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--color-volume)"
                stopOpacity={0.36}
              />
              <stop
                offset="100%"
                stopColor="var(--color-volume)"
                stopOpacity={0.02}
              />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis
            axisLine={false}
            dataKey="time"
            minTickGap={28}
            tickLine={false}
            tickMargin={12}
          />
          <YAxis
            axisLine={false}
            tickFormatter={(value) => `$${value}K`}
            tickLine={false}
            width={52}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;

              return (
                <div className="border-border/70 bg-popover/95 text-foreground min-w-48 border px-3 py-2 text-xs shadow-xl">
                  <p className="text-muted-foreground font-mono">At {label}</p>
                  {payload.map((item) => (
                    <div
                      className="mt-2 flex items-center justify-between gap-5"
                      key={String(item.dataKey)}
                    >
                      <span>{String(item.name)}</span>
                      <span className="font-semibold tabular-nums">
                        ${Number(item.value).toLocaleString()}K
                      </span>
                    </div>
                  ))}
                </div>
              );
            }}
          />
          <ReferenceLine stroke="var(--border)" strokeDasharray="3 5" y={420} />
          <Area
            dataKey="volume"
            fill="url(#processorGlow)"
            name="Payment attempts"
            stroke="var(--color-volume)"
            strokeWidth={2}
            type="monotone"
          />
          <Line
            dataKey="authorized"
            dot={false}
            name="Successful payments"
            stroke="var(--color-authorized)"
            strokeDasharray="5 5"
            strokeWidth={2}
            type="monotone"
          />
        </AreaChart>
      </ChartContainer>

      <div className="border-border/70 mt-5 border-t pt-4">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-foreground text-sm font-semibold">
              Recent client payments
            </p>
          </div>
          <Chip>{recentClientPayments.length} live</Chip>
        </div>

        <div className="group/marquee relative overflow-hidden">
          <div className="from-card pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-linear-to-r to-transparent" />
          <div className="from-card pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-linear-to-l to-transparent" />
          <div className="client-payments-marquee flex w-max gap-3">
            {[0, 1].map((setIndex) => (
              <div
                aria-hidden={setIndex === 1}
                className="flex gap-3"
                key={setIndex}
              >
                {recentClientPayments.map((payment) => (
                  <div
                    className="border-border/70 bg-muted/40 flex w-[270px] shrink-0 items-center gap-3 border p-3"
                    key={`${setIndex}-${payment.client}`}
                  >
                    <Avatar className="border-border/70 size-10 rounded-sm border">
                      <AvatarImage
                        alt={`${payment.client} contact`}
                        src={payment.avatar}
                      />
                      <AvatarFallback className="bg-background text-foreground rounded-sm text-xs">
                        {payment.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-foreground truncate text-sm font-medium">
                          {payment.client}
                        </p>
                        <p className="text-foreground shrink-0 font-mono text-sm font-semibold tabular-nums">
                          {payment.amount}
                        </p>
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-3">
                        <p className="text-muted-foreground truncate text-xs">
                          {payment.detail}
                        </p>
                        <p className="text-muted-foreground shrink-0 text-[10px]">
                          {payment.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes clientPaymentsMarquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(calc(-50% - 0.375rem));
          }
        }

        .client-payments-marquee {
          animation: clientPaymentsMarquee 32s linear infinite;
        }

        .group\\/marquee:hover .client-payments-marquee {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .client-payments-marquee {
            animation: none;
          }
        }
      `}</style>
    </SciFiCard>
  );
}

function UserEngagementMeshPanel() {
  return (
    <SciFiCard className="p-4 lg:col-span-4 lg:p-5">
      <SectionHeader eyebrow="Signal 06" title="User engagement mesh" />
      <ChartContainer className="mt-5 h-[205px]" config={chartConfig}>
        <RadialBarChart
          barSize={10}
          cx="50%"
          cy="50%"
          data={userEngagementMesh}
          endAngle={-270}
          innerRadius={34}
          outerRadius={92}
          startAngle={90}
        >
          <RadialBar background cornerRadius={4} dataKey="value" />
        </RadialBarChart>
      </ChartContainer>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {userEngagementMesh.map((segment) => (
          <div
            className="border-border/70 bg-muted/50 border p-2"
            key={segment.name}
          >
            <p className="text-muted-foreground text-xs">{segment.name}</p>
            <p
              className={cn(
                "text-foreground mt-1 font-mono text-sm font-semibold",
                mono.className,
              )}
            >
              {segment.value}% active
            </p>
          </div>
        ))}
      </div>
    </SciFiCard>
  );
}

function RailMatrix() {
  const [activeInsight, setActiveInsight] = React.useState(0);
  const insight = paymentMethodInsights[activeInsight];

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveInsight(
        (current) => (current + 1) % paymentMethodInsights.length,
      );
    }, 4600);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <SciFiCard className="flex h-full flex-col p-4 lg:col-span-8 lg:p-5">
      <SectionHeader
        action={
          <Chip>
            <CreditCard className="size-3" /> 4 methods
          </Chip>
        }
        eyebrow="Signal 03"
        title="Payment method performance"
      />

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {paymentMethodPerformance.map((method) => (
          <div
            className="border-border/70 bg-muted/50 hover:bg-muted/70 border p-4 transition-colors duration-300"
            key={method.method}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p
                  className={cn(
                    "text-foreground font-mono text-sm font-semibold",
                    mono.className,
                  )}
                >
                  {method.method}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {method.provider}
                </p>
              </div>
              <Chip
                className={cn(
                  method.status === "Healthy" &&
                    "border-primary/20 text-primary",
                  method.status === "Slower today" &&
                    "border-primary/20 text-primary",
                  method.status === "Needs attention" &&
                    "border-destructive/25 text-destructive",
                )}
              >
                {method.status}
              </Chip>
            </div>
            <div className="mt-5 flex items-end justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="text-muted-foreground mb-2 flex justify-between text-xs">
                  <span>Payment success</span>
                  <span>{method.successRate}%</span>
                </div>
                <div className="border-border/70 bg-muted h-2 border">
                  <div
                    className="bg-primary h-full"
                    style={{
                      background: `linear-gradient(90deg, ${palette.primary}, ${palette.secondary.light})`,
                      width: `${method.successRate}%`,
                    }}
                  />
                </div>
              </div>
              <div className="text-right">
                <p
                  className={cn(
                    "text-foreground font-mono text-lg font-semibold tabular-nums",
                    mono.className,
                  )}
                >
                  {method.confirmation}
                </p>
                <p className="text-muted-foreground text-xs">{method.volume}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-border/70 mt-5 border-t pt-5">
        <div className="border-primary/25 bg-primary/[0.045] relative overflow-hidden border">
          <div className="bg-primary absolute inset-y-0 left-0 w-0.5" />
          <div className="flex min-h-16 items-center gap-3 px-4 py-3">
            <span className="border-primary/20 bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center border">
              <insight.icon className="size-4" />
            </span>

            <div className="min-w-0 flex-1 overflow-hidden">
              <div
                className="animate-in fade-in-0 slide-in-from-right-4 duration-500"
                key={insight.label}
              >
                <div className="flex min-w-0 items-baseline gap-3">
                  <p className="text-primary font-mono text-[10px] tracking-[0.18em] uppercase">
                    Insight
                  </p>
                  <p className="text-foreground shrink-0 text-sm font-semibold">
                    {insight.label}
                  </p>
                  <p className="text-primary shrink-0 font-mono text-base font-semibold">
                    {insight.value}
                  </p>
                  <p className="text-muted-foreground min-w-0 truncate text-xs">
                    {insight.detail}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-primary/15 hidden shrink-0 border-l pl-4 text-right lg:block">
              <p className="text-muted-foreground font-mono text-[10px] tracking-[0.16em] uppercase">
                {insight.metricLabel}
              </p>
              <p className="text-foreground mt-0.5 font-mono text-base font-semibold">
                {insight.metricValue}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-end gap-1.5 pr-1">
          {paymentMethodInsights.map((item, index) => (
            <button
              aria-label={`Show ${item.label} insight`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                activeInsight === index
                  ? "bg-primary w-5"
                  : "bg-primary/20 hover:bg-primary/45 w-1.5",
              )}
              key={item.label}
              onClick={() => setActiveInsight(index)}
              type="button"
            />
          ))}
        </div>
      </div>
    </SciFiCard>
  );
}

function UserRetentionPanel() {
  return (
    <SciFiCard className="p-4 lg:col-span-8 lg:p-5">
      <SectionHeader
        action={
          <Chip className="border-primary/20 text-primary">
            <BrainCircuit className="size-3" /> Cohort model
          </Chip>
        }
        eyebrow="Signal 07"
        title="User retention matrix"
      />

      <div className="mt-5 overflow-x-auto">
        <div className="min-w-[860px]">
          <div className="border-border/70 text-muted-foreground grid grid-cols-[140px_96px_repeat(6,minmax(82px,1fr))] border-b pb-3 text-xs font-semibold">
            <div className="px-3">Signup cohort</div>
            <div className="px-3">New users</div>
            {retentionMonths.map((month) => (
              <div className="px-3 text-center" key={month}>
                {month}
              </div>
            ))}
          </div>

          <div className="divide-border/70 divide-y">
            {userRetentionMatrix.map((row) => (
              <div
                className="grid grid-cols-[140px_96px_repeat(6,minmax(82px,1fr))] text-sm"
                key={row.cohort}
              >
                <div className="text-muted-foreground flex h-12 items-center px-3 font-semibold">
                  {row.cohort}
                </div>
                <div className="text-muted-foreground flex h-12 items-center px-3 tabular-nums">
                  {row.users}
                </div>
                {row.values.map((value, index) => {
                  const tone = getRetentionCellTone(value);

                  return (
                    <div
                      className={cn(
                        "flex h-12 items-center justify-center font-semibold tabular-nums",
                        tone.className,
                      )}
                      key={`${row.cohort}-${retentionMonths[index]}`}
                      style={tone.style}
                    >
                      {value === null ? "-" : `${value}%`}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
        <span>Monthly retention:</span>
        {retentionLegend.map((item) => (
          <span className="inline-flex items-center gap-2" key={item.label}>
            <span className="size-3 border" style={item.style} />
            {item.label}
          </span>
        ))}
      </div>
    </SciFiCard>
  );
}

function TelemetryStrip() {
  const telemetry = [
    {
      label: "Payments / min",
      value: "1,284",
      icon: CreditCard,
    },
    {
      label: "Approval rate",
      value: "97.4%",
      icon: ShieldCheck,
    },
    {
      label: "Avg. auth time",
      value: "108ms",
      icon: Timer,
    },
    {
      label: "Next settlement",
      value: "$318.4K",
      icon: CircleGauge,
    },
  ];

  return (
    <SciFiCard className="lg:col-span-12">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4">
        {telemetry.map((item, index) => (
          <div
            className={cn(
              "flex min-w-0 items-center gap-3 px-4 py-4 sm:px-5",
              index > 0 && "border-border/70 border-t sm:border-t-0",
              index % 2 === 1 && "sm:border-border/70 sm:border-l",
              index === 2 && "lg:border-border/70 sm:border-l-0 lg:border-l",
            )}
            key={item.label}
          >
            <span className="border-border/70 text-muted-foreground flex size-9 shrink-0 items-center justify-center border">
              <item.icon className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-muted-foreground truncate text-[11px] tracking-[0.12em] uppercase">
                {item.label}
              </p>
              <p
                className={cn(
                  "text-foreground mt-1 font-mono text-base leading-none font-semibold tabular-nums",
                  mono.className,
                )}
              >
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </SciFiCard>
  );
}

export function PaymentProcessorDashboard5({
  className,
}: {
  className?: string;
}) {
  return (
    <main
      className={cn(
        "bg-muted/40 text-foreground relative min-h-0 flex-1 overflow-y-auto",

        mono.className,
        className,
      )}
    >
      <div className="relative mx-auto flex w-full max-w-[1560px] flex-col gap-4 p-3 sm:p-4 lg:p-6">
        <CommandHeader />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {missionStats.map((stat) => (
            <MetricCard key={stat.label} {...stat} />
          ))}
        </div>

        <VolumePanel />

        <div className="grid gap-4 lg:grid-cols-12">
          <RailMatrix />
          <PaymentRoutingGlobe />
          <TelemetryStrip />
          <UserEngagementMeshPanel />
          <UserRetentionPanel />
        </div>
      </div>
    </main>
  );
}
