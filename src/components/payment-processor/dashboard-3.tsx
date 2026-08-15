"use client";

import {
  Activity,
  ArrowRight,
  Bug,
  CircleAlert,
  CreditCard,
  Flag,
  Funnel,
  Gauge,
  MousePointerClick,
  ReceiptText,
  RefreshCcw,
  Send,
  ShieldCheck,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  Funnel as FunnelRecharts,
  FunnelChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type RevenueMetric = "total" | "net";

const mixBase = "var(--background)";
const paymentChartPalette = {
  primary: "var(--primary)",
  mutedStrong:
    "color-mix(in oklch, var(--muted-foreground) 62%, var(--background))",
  muted: "color-mix(in oklch, var(--muted-foreground) 38%, var(--background))",
  mutedSoft:
    "color-mix(in oklch, var(--muted-foreground) 20%, var(--background))",
  refund: "color-mix(in oklch, var(--destructive) 72%, var(--background))",
  refundSoft: "color-mix(in oklch, var(--destructive) 42%, var(--background))",
  primaryStrong: `color-mix(in oklch, var(--primary) 84%, ${mixBase})`,
  primaryMid: `color-mix(in oklch, var(--primary) 64%, ${mixBase})`,
} as const;

const revenueTrendChartConfig = {
  closed: {
    label: "Payments per day",
    color: paymentChartPalette.primary,
  },
  refunded: {
    label: "Refunds per day",
    color: paymentChartPalette.refund,
  },
  revenue: {
    label: "Revenue trend",
    color: paymentChartPalette.mutedStrong,
  },
};

const chartGridColor = "var(--border)";
const chartTickColor = "var(--muted-foreground)";
const chartTooltipCursor = "color-mix(in oklch, var(--muted) 42%, transparent)";

const revenueTrendKpis = [
  {
    label: "Processed volume",
    value: "$482.0K",
    delta: "+24.64%",
  },
  {
    label: "Successful payments",
    value: "3,887",
    delta: "+18.32%",
  },
  {
    label: "Revenue yield",
    value: "2.31%",
  },
  {
    label: "Refund rate",
    value: "3.82%",
  },
  {
    label: "Avg payment",
    value: "$124.00",
  },
];

const revenueSeries: Record<
  RevenueMetric,
  {
    label: string;
    total: number;
    previous: number;
    data: Array<{ month: string; amount: number; lastYearAmount: number }>;
  }
> = {
  total: {
    label: "Total Revenue",
    total: 11135.04,
    previous: 7669,
    data: [
      { month: "Jul", amount: 620, lastYearAmount: 840 },
      { month: "Aug", amount: 3560, lastYearAmount: 80 },
      { month: "Sep", amount: 4050, lastYearAmount: 0 },
      { month: "Oct", amount: 1250, lastYearAmount: 0 },
      { month: "Nov", amount: 170, lastYearAmount: 650 },
      { month: "Dec", amount: 560, lastYearAmount: 0 },
      { month: "Jan", amount: 240, lastYearAmount: 300 },
      { month: "Feb", amount: 520, lastYearAmount: 1080 },
      { month: "Mar", amount: 90, lastYearAmount: 1900 },
      { month: "Apr", amount: 55, lastYearAmount: 1500 },
      { month: "May", amount: 0, lastYearAmount: 170 },
      { month: "Jun", amount: 35, lastYearAmount: 670 },
      { month: "Jul", amount: 90, lastYearAmount: 620 },
    ],
  },
  net: {
    label: "Net Revenue",
    total: 9464.78,
    previous: 6518,
    data: [
      { month: "Jul", amount: 528, lastYearAmount: 714 },
      { month: "Aug", amount: 3026, lastYearAmount: 68 },
      { month: "Sep", amount: 3443, lastYearAmount: 0 },
      { month: "Oct", amount: 1063, lastYearAmount: 0 },
      { month: "Nov", amount: 145, lastYearAmount: 553 },
      { month: "Dec", amount: 476, lastYearAmount: 0 },
      { month: "Jan", amount: 204, lastYearAmount: 255 },
      { month: "Feb", amount: 442, lastYearAmount: 918 },
      { month: "Mar", amount: 77, lastYearAmount: 1615 },
      { month: "Apr", amount: 47, lastYearAmount: 1275 },
      { month: "May", amount: 0, lastYearAmount: 145 },
      { month: "Jun", amount: 30, lastYearAmount: 570 },
      { month: "Jul", amount: 77, lastYearAmount: 527 },
    ],
  },
};

const quickActions = [
  {
    label: "Create payment link",
    icon: CreditCard,
  },
  {
    label: "Send invoice",
    icon: Send,
  },
  {
    label: "Review disputes",
    icon: ShieldCheck,
  },
  {
    label: "Issue refund",
    icon: RefreshCcw,
  },
  {
    label: "Export receipts",
    icon: ReceiptText,
  },
] as const;

function RevenueCard() {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(0);
  const [metric, setMetric] = useState<RevenueMetric>("total");

  useEffect(() => {
    const element = chartRef.current;
    if (!element) return;

    const updateWidth = () => setChartWidth(element.clientWidth);
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const selectedRevenue = revenueSeries[metric];
  const chartData = selectedRevenue.data;
  const currentTotal = selectedRevenue.total;
  const previousTotal = selectedRevenue.previous;
  const yAxisMax = metric === "total" ? 6000 : 5000;
  const yAxisTicks =
    metric === "total"
      ? [0, 1500, 3000, 4500, 6000]
      : [0, 1250, 2500, 3750, 5000];

  return (
    <div className="bg-background relative flex flex-col">
      <div className="mb-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <Select
            value={metric}
            onValueChange={(value) => setMetric(value as RevenueMetric)}
          >
            <SelectTrigger className="text-foreground h-auto w-40 border-0 bg-transparent p-0 font-mono text-lg font-medium shadow-none focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start" className="font-mono">
              <SelectItem value="total">Total Revenue</SelectItem>
              <SelectItem value="net">Net Revenue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <p className="font-mono text-3xl font-normal">
              {currentTotal.toLocaleString("en-US", {
                currency: "USD",
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
                style: "currency",
              })}
            </p>
            <p className="text-muted-foreground font-mono text-xs">
              vs{" "}
              {previousTotal.toLocaleString("en-US", {
                currency: "USD",
                maximumFractionDigits: 0,
                style: "currency",
              })}{" "}
              last period
            </p>
          </div>
          <div
            aria-label="Revenue chart legend"
            className="text-muted-foreground flex items-center gap-4 font-mono text-xs"
            role="list"
          >
            <span className="flex items-center gap-2" role="listitem">
              <span
                aria-hidden="true"
                className="size-2 shrink-0"
                style={{ backgroundColor: paymentChartPalette.primary }}
              />
              Current period
            </span>
            <span className="flex items-center gap-2" role="listitem">
              <span
                aria-hidden="true"
                className="size-2 shrink-0"
                style={{ backgroundColor: paymentChartPalette.mutedSoft }}
              />
              Previous period
            </span>
          </div>
        </div>

        <div className="border-border mt-5 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-dashed pt-4 md:grid-cols-5">
          {revenueTrendKpis.map((kpi) => (
            <div className="min-w-0" key={kpi.label}>
              <div className="flex items-center gap-2">
                <p className="text-muted-foreground truncate font-mono text-xs">
                  {kpi.label}
                </p>
                <span className="bg-muted text-muted-foreground grid size-4 shrink-0 place-items-center rounded-full font-mono text-[10px]">
                  i
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p className="text-foreground font-mono text-base font-semibold">
                  {kpi.value}
                </p>
                {kpi.delta && (
                  <p className="font-mono text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    {kpi.delta}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-80 min-w-0" ref={chartRef}>
        {chartWidth > 0 && (
          <ComposedChart
            data={chartData}
            height={320}
            margin={{ top: 6, right: 6, left: -18, bottom: 6 }}
            width={chartWidth}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={chartGridColor}
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: chartTickColor,
                fontFamily: "var(--font-mono)",
                fontSize: 10,
              }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              domain={[0, yAxisMax]}
              ticks={yAxisTicks}
              tick={{
                fill: chartTickColor,
                fontFamily: "var(--font-mono)",
                fontSize: 10,
              }}
            />
            <Tooltip
              cursor={{ fill: chartTooltipCursor }}
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 0,
                color: "var(--popover-foreground)",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
              }}
            />
            <Bar
              dataKey="lastYearAmount"
              fill={paymentChartPalette.mutedSoft}
              isAnimationActive={false}
              maxBarSize={14}
            />
            <Bar
              dataKey="amount"
              fill={revenueTrendChartConfig.closed.color}
              isAnimationActive={false}
              maxBarSize={14}
            />
          </ComposedChart>
        )}
      </div>
    </div>
  );
}

function BentoCard({
  title,
  description,
  icon: Icon,
  children,
  className,
  contentClassName,
  href,
}: {
  title: string;
  description?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  href?: string;
}) {
  return (
    <motion.div
      className={cn(
        "group border-border bg-card relative overflow-hidden border backdrop-blur-xl duration-500",
        className,
      )}
      initial={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      viewport={{ once: true }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <div className="relative z-20 px-6 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-secondary/40 ring-border flex size-8 items-center justify-center ring-1">
              <Icon className="text-muted-foreground size-4" />
            </div>
            <div className="flex flex-col gap-0.5">
              <h3 className="text-foreground font-mono text-sm font-medium">
                {title}
              </h3>
              {description && (
                <p className="text-muted-foreground font-mono text-xs">
                  {description}
                </p>
              )}
            </div>
          </div>
          {href && (
            <Link
              aria-label={`Learn more about ${title}`}
              className="border-border/50 bg-card text-muted-foreground hover:border-border hover:text-foreground z-30 flex size-10 shrink-0 items-center justify-center rounded border shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-300"
              href={href}
            >
              <ArrowRight className="size-5" />
            </Link>
          )}
        </div>
      </div>
      <div className={cn("relative z-10 p-6 pt-0", contentClassName)}>
        {children}
      </div>
    </motion.div>
  );
}

function FunnelsFeature() {
  const data = [
    {
      value: 100,
      name: "Checkout",
      fill: "var(--primary)",
      stroke: "var(--primary)",
    },
    {
      value: 65,
      name: "Card Added",
      fill: "color-mix(in oklch, var(--muted-foreground) 72%, var(--background))",
      stroke:
        "color-mix(in oklch, var(--muted-foreground) 72%, var(--background))",
    },
    {
      value: 45,
      name: "3DS Auth",
      fill: "color-mix(in oklch, var(--muted-foreground) 48%, var(--background))",
      stroke:
        "color-mix(in oklch, var(--muted-foreground) 48%, var(--background))",
    },
    {
      value: 25,
      name: "Paid",
      fill: "color-mix(in oklch, var(--muted-foreground) 32%, var(--background))",
      stroke:
        "color-mix(in oklch, var(--muted-foreground) 32%, var(--background))",
    },
  ];

  return (
    <div className="flex w-full min-w-0 flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div className="space-y-1">
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="text-foreground font-mono text-3xl font-medium tracking-tighter"
            initial={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            25.0%
          </motion.div>
          <div className="text-muted-foreground font-mono text-xs font-medium tracking-widest uppercase">
            Paid Conversion
          </div>
        </div>
        <Badge
          className="bg-emerald-500/10 font-mono text-emerald-700 dark:text-emerald-300"
          variant="secondary"
        >
          +3.1%
        </Badge>
      </div>
      <div className="h-[240px] w-full">
        <div
          className="h-full w-full"
          style={{
            maskImage:
              "linear-gradient(to bottom, black 20%, rgba(0,0,0,0.78) 78%, transparent 100%)",
          }}
        >
          <ResponsiveContainer
            height="100%"
            initialDimension={{ height: 240, width: 1 }}
            minHeight={1}
            minWidth={1}
            width="100%"
          >
            <FunnelChart>
              <Tooltip
                contentStyle={{
                  borderRadius: "4px",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--popover)",
                  backdropFilter: "blur(8px)",
                  fontSize: "12px",
                  color: "var(--popover-foreground)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                  fontFamily: "var(--font-mono)",
                }}
                cursor={{ fill: "transparent" }}
                itemStyle={{ color: "var(--popover-foreground)" }}
              />
              <FunnelRecharts
                data={data}
                dataKey="value"
                isAnimationActive
                lastShapeType="rectangle"
              />
            </FunnelChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {data.map((stage) => (
          <div
            className="border-border bg-secondary/20 flex min-w-0 items-center gap-3 border px-3 py-2"
            key={stage.name}
          >
            <div
              className="h-9 w-1.5 shrink-0"
              style={{ backgroundColor: stage.fill }}
            />
            <div className="min-w-0">
              <div className="text-muted-foreground truncate font-mono text-[10px] font-medium">
                {stage.name}
              </div>
              <div className="text-foreground mt-0.5 font-mono text-sm font-semibold">
                {stage.value}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LiveVolumeDot({
  cx,
  cy,
  value,
}: {
  cx?: number;
  cy?: number;
  value?: number;
}) {
  if (typeof cx !== "number" || typeof cy !== "number") {
    return null;
  }

  return (
    <g>
      <line
        stroke="var(--foreground)"
        strokeDasharray="4 6"
        strokeOpacity={0.24}
        strokeWidth={1}
        x1={0}
        x2={cx}
        y1={cy}
        y2={cy}
      />
      <circle
        cx={cx}
        cy={cy}
        fill="var(--background)"
        opacity={0.85}
        r={14}
        stroke="var(--primary)"
        strokeOpacity={0.18}
        strokeWidth={7}
      />
      <circle
        cx={cx}
        cy={cy}
        fill="var(--primary)"
        r={4.5}
        stroke="var(--background)"
        strokeWidth={2}
      />
      <rect
        fill="var(--popover)"
        height={24}
        rx={4}
        stroke="var(--border)"
        width={66}
        x={cx - 86}
        y={cy - 12}
      />
      <text
        dominantBaseline="middle"
        fill="var(--popover-foreground)"
        fontFamily="var(--font-mono)"
        fontSize={11}
        fontWeight={700}
        textAnchor="middle"
        x={cx - 53}
        y={cy}
      >
        ${value?.toFixed(1)}K
      </text>
    </g>
  );
}

function RealTimeFeature() {
  const [data, setData] = useState([
    { value: 42 },
    { value: 58 },
    { value: 51 },
    { value: 63 },
    { value: 49 },
    { value: 76 },
    { value: 71 },
    { value: 88 },
    { value: 81 },
    { value: 94 },
    { value: 89 },
    { value: 102 },
  ]);
  const [liveVolume, setLiveVolume] = useState(18.6);

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const nextValue = 40 + Math.random() * 50;
        const next = [...prev.slice(1), { value: nextValue }];

        setLiveVolume(Number((12 + nextValue * 0.16).toFixed(1)));

        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex h-full flex-col">
      <div className="mt-auto h-[180px] w-full">
        <ResponsiveContainer
          height="100%"
          initialDimension={{ height: 180, width: 1 }}
          minHeight={1}
          minWidth={1}
          width="100%"
        >
          <AreaChart
            data={data}
            margin={{ top: 22, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRealTime" x1="0" x2="0" y1="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--primary)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor="var(--primary)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <Area
              activeDot={false}
              animationDuration={1000}
              dataKey="value"
              dot={(props) => {
                if (props.index !== data.length - 1) {
                  return <g />;
                }

                return <LiveVolumeDot {...props} value={liveVolume} />;
              }}
              fill="url(#colorRealTime)"
              isAnimationActive
              stroke="var(--primary)"
              strokeWidth={2}
              style={{
                filter: "drop-shadow(0 0 5px var(--primary))",
              }}
              type="monotone"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function RecentPaymentsFeature() {
  const [payments, setPayments] = useState([
    {
      id: "1",
      avatar: "/avatars/avatar-1.png",
      method: "Visa 4242",
      initials: "LK",
      name: "Leonard Kim",
      status: "Succeeded",
      time: "12s ago",
      amount: "$248.00",
    },
    {
      id: "2",
      avatar: "/avatars/avatar-2.png",
      method: "Mastercard 1881",
      initials: "AS",
      name: "Avery Stone",
      status: "Pending",
      time: "1m ago",
      amount: "$89.20",
    },
    {
      id: "3",
      avatar: "/avatars/avatar-3.png",
      method: "Amex 0005",
      initials: "MN",
      name: "Mika Nakamura",
      status: "Succeeded",
      time: "2m ago",
      amount: "$1,240.00",
    },
    {
      id: "4",
      avatar: "/avatars/avatar-4.png",
      method: "SEPA debit",
      initials: "EW",
      name: "Emilia Weber",
      status: "Processing",
      time: "4m ago",
      amount: "$560.00",
    },
    {
      id: "5",
      avatar: "/avatars/avatar-5.png",
      method: "Visa 9012",
      initials: "CL",
      name: "Camille Laurent",
      status: "Failed",
      time: "5m ago",
      amount: "$32.10",
    },
    {
      id: "6",
      avatar: "/avatars/avatar-6.png",
      method: "Interac",
      initials: "NO",
      name: "Noah Osei",
      status: "Succeeded",
      time: "7m ago",
      amount: "$410.00",
    },
    {
      id: "7",
      avatar: "/avatars/avatar-bw-1.png",
      method: "Apple Pay",
      initials: "IB",
      name: "Isla Bennett",
      status: "Succeeded",
      time: "9m ago",
      amount: "$74.50",
    },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPayments((prev) => {
        const [first, ...rest] = prev;
        return [
          ...rest,
          { ...first, time: "12s ago", id: Math.random().toString() },
        ];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative max-h-[460px] overflow-y-auto pr-2"
      style={{
        maskImage:
          "linear-gradient(to bottom, transparent 0%, black 6%, black 92%, transparent 100%)",
        scrollbarColor: "var(--border) transparent",
      }}
    >
      <div className="space-y-2">
        <AnimatePresence initial={false} mode="popLayout">
          {payments.map((payment) => (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="group border-border/50 bg-secondary/20 flex items-center justify-between border p-2 text-sm"
              exit={{ y: -60 }}
              initial={{ opacity: 0, y: 60 }}
              key={payment.id}
              layout
              transition={{
                layout: { duration: 0.4, ease: "easeInOut" },
                y: { duration: 0.4, ease: "easeOut" },
              }}
            >
              <div className="flex items-center gap-3.5">
                <Avatar className="border-border bg-muted size-10 shrink-0 border">
                  <AvatarImage alt={payment.name} src={payment.avatar} />
                  <AvatarFallback className="font-mono text-xs">
                    {payment.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1">
                  <span className="text-accent-foreground group-hover:text-foreground font-mono text-xs font-medium">
                    {payment.amount}
                  </span>
                  <span className="text-muted-foreground font-mono text-xs">
                    {payment.method} - {payment.status}
                  </span>
                </div>
              </div>
              <span className="text-muted-foreground shrink-0 pl-3 text-right font-mono text-xs">
                {payment.time}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ErrorTrackingFeature() {
  const failureTrend = [40, 70, 30, 80, 50, 90, 60, 40, 65, 85, 45, 75];
  const failureStats = [
    { label: "Declined", value: "18" },
    { label: "Recovered", value: "11" },
    { label: "Retrying", value: "9" },
  ];

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="border-border bg-secondary/20 relative overflow-hidden border p-4 transition-all">
        <div className="flex items-start gap-3">
          <div className="bg-destructive/10 rounded-md p-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              <CircleAlert className="text-destructive size-4 shrink-0" />
            </motion.div>
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-accent-foreground truncate font-mono text-[11px] font-medium">
                payment_intent.payment_failed
              </p>
              <Badge variant="destructive">
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  className="font-mono text-[10px]"
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                  DECLINED
                </motion.span>
              </Badge>
            </div>
            <p className="border-border bg-background/50 text-muted-foreground rounded border p-1.5 font-mono text-[10px]">
              card_declined - insufficient_funds
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col">
        <div className="text-muted-foreground flex justify-between px-1 font-mono text-[10px] font-medium tracking-widest uppercase">
          <span>Last 24 hours</span>
          <span>38 Failed</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {failureStats.map((stat) => (
            <div
              className="border-border/50 bg-secondary/20 min-w-0 border px-2 py-1.5"
              key={stat.label}
            >
              <div className="text-muted-foreground truncate font-mono text-[9px] font-medium tracking-widest uppercase">
                {stat.label}
              </div>
              <div className="text-foreground mt-0.5 font-mono text-xs font-semibold">
                {stat.value}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex h-12 items-end gap-1">
          {failureTrend.map((h, i) => (
            <motion.div
              className={cn(
                "flex-1 rounded-t-[1px] duration-300",
                h >= 80
                  ? "bg-destructive"
                  : "bg-accent-foreground/45 hover:bg-accent-foreground/65",
              )}
              key={`bar-${h}-${i}`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function FeatureFlagsFeature() {
  const flags = [
    {
      name: "Apple Pay",
      enabled: true,
      env: "wallet",
      icon: CreditCard,
      status: "Enabled",
    },
    {
      name: "ACH Debit",
      enabled: true,
      env: "bank",
      icon: ShieldCheck,
      status: "Enabled",
    },
    {
      name: "3DS Enforcement",
      enabled: false,
      env: "risk",
      icon: ShieldCheck,
      status: "Monitoring",
    },
    {
      name: "Auto-retry Invoices",
      enabled: true,
      env: "billing",
      icon: RefreshCcw,
      status: "Enabled",
    },
  ];

  return (
    <div
      className="max-h-[230px] space-y-2 overflow-y-auto pr-2"
      style={{
        maskImage: "linear-gradient(to bottom, black 90%, transparent 100%)",
        scrollbarColor: "var(--border) transparent",
      }}
    >
      {flags.map((flag) => {
        const Icon = flag.icon;

        return (
          <div
            className="group border-border/50 bg-secondary/20 flex items-center justify-between gap-3 border p-3 transition-all"
            key={flag.name}
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div
                className={cn(
                  "border-border bg-background grid size-9 shrink-0 place-items-center rounded-md border",
                  flag.enabled
                    ? "text-foreground shadow-[0_0_14px_color-mix(in_oklch,var(--foreground)_16%,transparent)]"
                    : "text-muted-foreground/60",
                )}
              >
                <Icon className="size-4" />
              </div>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-accent-foreground group-hover:text-foreground truncate font-mono text-xs font-medium">
                  {flag.name}
                </span>
                <span className="text-muted-foreground font-mono text-[9px] font-medium tracking-widest uppercase">
                  {flag.env} - {flag.status}
                </span>
              </div>
            </div>
            <Switch
              checked={flag.enabled}
              className={cn(!flag.enabled && "opacity-35")}
              disabled
            />
          </div>
        );
      })}
    </div>
  );
}

const WEB_VITALS_METRICS = [
  { label: "AUTH", value: "98.7%", score: 99 },
  { label: "API", value: "142ms", score: 96 },
  { label: "HOOKS", value: "99.9%", score: 100 },
] as const;

function WebVitalsFeature() {
  return (
    <div className="grid h-[150px] grid-cols-3 gap-3">
      {WEB_VITALS_METRICS.map((m) => (
        <div
          className="border-border flex h-full flex-col items-center justify-between gap-2 border border-b-0 bg-[repeating-linear-gradient(135deg,var(--muted)_0,var(--muted)_1px,transparent_1px,transparent_8px)] p-3"
          key={m.label}
        >
          <div className="relative flex size-14 items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
              <title>Score indicator</title>
              <circle
                className="stroke-secondary"
                cx="18"
                cy="18"
                fill="none"
                r="16"
                strokeWidth="2.5"
              />
              <circle
                className="stroke-success"
                cx="18"
                cy="18"
                fill="none"
                pathLength="100"
                r="16"
                strokeDasharray="100"
                strokeDashoffset={100 - m.score}
                strokeLinecap="round"
                strokeWidth="2.5"
                style={{ opacity: 0.5 }}
              />
              <circle
                className="stroke-success"
                cx="18"
                cy="18"
                fill="none"
                pathLength="100"
                r="16"
                strokeDasharray="100"
                strokeDashoffset={100 - m.score}
                strokeLinecap="round"
                strokeWidth="2.5"
              />
            </svg>
            <span className="text-foreground absolute font-mono text-sm font-medium">
              {m.score}
            </span>
          </div>
          <div className="space-y-0.5 text-center">
            <div className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
              {m.label}
            </div>
            <div className="text-foreground font-mono text-xs font-medium opacity-90">
              {m.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CustomEventsFeature() {
  const [events, setEvents] = useState([
    {
      name: "payment.succeeded",
      detail: "Visa 4242 - $248.00",
      count: "15.8k",
      tone: "success",
      icon: CreditCard,
      id: "1",
    },
    {
      name: "invoice.paid",
      detail: "INV-2048 settled",
      count: "8.9k",
      tone: "success",
      icon: ReceiptText,
      id: "2",
    },
    {
      name: "charge.refunded",
      detail: "Partial refund issued",
      count: "1.2k",
      tone: "neutral",
      icon: RefreshCcw,
      id: "3",
    },
    {
      name: "dispute.created",
      detail: "Needs evidence",
      count: "38",
      tone: "warning",
      icon: ShieldCheck,
      id: "4",
    },
    {
      name: "payout.sent",
      detail: "Bank transfer queued",
      count: "246",
      tone: "neutral",
      icon: Send,
      id: "5",
    },
    {
      name: "payment.failed",
      detail: "card_declined",
      count: "0.9k",
      tone: "danger",
      icon: CircleAlert,
      id: "6",
    },
    {
      name: "mandate.updated",
      detail: "ACH authorization",
      count: "418",
      tone: "neutral",
      icon: ShieldCheck,
      id: "7",
    },
    {
      name: "webhook.delivered",
      detail: "200 OK - 142ms",
      count: "32k",
      tone: "success",
      icon: Activity,
      id: "8",
    },
    {
      name: "refund.created",
      detail: "$74.50 returned",
      count: "620",
      tone: "neutral",
      icon: RefreshCcw,
      id: "9",
    },
    {
      name: "subscription.renewed",
      detail: "Monthly plan",
      count: "4.1k",
      tone: "success",
      icon: ReceiptText,
      id: "10",
    },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setEvents((prev) => {
        const [first, ...rest] = prev;
        const newCount = `${(Math.random() * 20).toFixed(1)}k`;
        return [
          ...rest,
          { ...first, count: newCount, id: Math.random().toString() },
        ];
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative max-h-[230px] overflow-y-auto pr-2"
      style={{
        maskImage:
          "linear-gradient(to bottom, transparent 0%, black 6%, black 90%, transparent 100%)",
        scrollbarColor: "var(--border) transparent",
      }}
    >
      <div className="space-y-2">
        <AnimatePresence initial={false} mode="popLayout">
          {events.map((event) => {
            const Icon = event.icon;

            return (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="border-border/50 bg-secondary/20 flex items-center justify-between gap-3 border p-2 text-xs"
                exit={{ y: -60 }}
                initial={{ opacity: 0, y: 60 }}
                key={event.id}
                layout
                transition={{
                  layout: { duration: 0.4, ease: "easeInOut" },
                  y: { duration: 0.4, ease: "easeOut" },
                }}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={cn(
                      "border-border bg-background grid size-9 shrink-0 place-items-center rounded-md border",
                      event.tone === "success" &&
                        "text-emerald-600 dark:text-emerald-400",
                      event.tone === "warning" &&
                        "text-amber-600 dark:text-amber-400",
                      event.tone === "danger" && "text-destructive",
                      event.tone === "neutral" && "text-muted-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-accent-foreground truncate font-mono text-xs font-medium">
                      {event.name}
                    </div>
                    <div className="text-muted-foreground mt-0.5 truncate font-mono text-[10px]">
                      {event.detail}
                    </div>
                  </div>
                </div>
                <Badge
                  className={cn(
                    "shrink-0 font-mono",
                    event.tone === "success" &&
                      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                    event.tone === "warning" &&
                      "bg-amber-500/10 text-amber-700 dark:text-amber-300",
                    event.tone === "danger" &&
                      "bg-destructive/10 text-destructive",
                  )}
                  variant="secondary"
                >
                  {event.count}
                </Badge>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

function PaymentInsightsBento() {
  return (
    <div className="grid h-full w-full grid-cols-1 gap-4 p-1 md:grid-cols-12">
      <BentoCard
        className="h-full md:col-span-4 md:row-span-2"
        description="Track checkout to paid"
        icon={Funnel}
        title="Payment Funnel"
      >
        <FunnelsFeature />
      </BentoCard>

      <BentoCard
        className="h-full md:col-span-4 md:row-span-1"
        contentClassName="px-0 pb-0"
        description="Watch processed volume now"
        icon={Activity}
        title="Live Volume"
      >
        <RealTimeFeature />
      </BentoCard>

      <BentoCard
        className="h-full md:col-span-4 md:row-span-2"
        description="Latest authorization activity"
        icon={Users}
        title="Recent Payments"
      >
        <RecentPaymentsFeature />
      </BentoCard>

      <BentoCard
        className="h-full md:col-span-4 md:row-span-1"
        contentClassName="pb-0"
        description="Monitor processor reliability"
        icon={Gauge}
        title="Processor Health"
      >
        <WebVitalsFeature />
      </BentoCard>

      <BentoCard
        className="h-full md:col-span-4 md:row-span-1"
        description="Track processor event flow"
        icon={MousePointerClick}
        title="Payment Events"
      >
        <CustomEventsFeature />
      </BentoCard>

      <BentoCard
        className="h-full md:col-span-4 md:row-span-1"
        contentClassName="pb-0"
        description="Card declines and webhook errors"
        icon={Bug}
        title="Payment Failures"
      >
        <ErrorTrackingFeature />
      </BentoCard>

      <BentoCard
        className="h-full md:col-span-4 md:row-span-1"
        description="Manage payment method rollout"
        icon={Flag}
        title="Payment Controls"
      >
        <FeatureFlagsFeature />
      </BentoCard>
    </div>
  );
}

function QuickActions() {
  return (
    <section
      aria-label="Payment quick actions"
      className="border-border/70 bg-background/80 flex flex-wrap items-center gap-2 border-y py-5"
    >
      <div className="grid w-full min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              className="border-border bg-card text-foreground hover:border-foreground/30 hover:bg-accent hover:text-accent-foreground inline-flex h-10 w-full items-center justify-center gap-2 rounded-none border px-4 font-mono text-xs font-bold transition-colors"
              key={action.label}
              type="button"
            >
              <Icon className="size-3.5" />
              {action.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function PaymentProcessorDashboard3({
  className,
}: {
  className?: string;
}) {
  return (
    <main
      className={cn(
        "bg-background text-foreground min-h-0 flex-1 overflow-y-auto",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-[1536px] min-w-0 flex-col gap-4 p-4 md:p-6">
        <RevenueCard />
        <QuickActions />
        <PaymentInsightsBento />
      </div>
    </main>
  );
}
