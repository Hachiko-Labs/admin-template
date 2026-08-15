"use client";

import DottedMap from "dotted-map";
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  DollarSign,
  Euro,
  ExternalLink,
  Info,
  Landmark,
  MoreVertical,
  Search,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

const todayVolumeData = [
  { time: "12 AM", today: 12, estimate: null, yesterday: 18 },
  { time: "2 AM", today: 18, estimate: null, yesterday: 22 },
  { time: "4 AM", today: 24, estimate: null, yesterday: 28 },
  { time: "6 AM", today: 22, estimate: null, yesterday: 31 },
  { time: "8 AM", today: 34, estimate: null, yesterday: 30 },
  { time: "10 AM", today: 42, estimate: null, yesterday: 37 },
  { time: "Now", today: 39, estimate: 39, yesterday: 34 },
  { time: "2 PM", today: null, estimate: 48, yesterday: 41 },
  { time: "4 PM", today: null, estimate: 56, yesterday: 46 },
  { time: "6 PM", today: null, estimate: 52, yesterday: 54 },
  { time: "8 PM", today: null, estimate: 61, yesterday: 62 },
  { time: "11:59 PM", today: null, estimate: 73, yesterday: 78 },
];

const todayVolumeConfig = {
  today: {
    label: "Today",
    color: "var(--primary)",
  },
  estimate: {
    label: "Estimate",
    color: "var(--primary)",
  },
  yesterday: {
    label: "Yesterday",
    color:
      "color-mix(in oklch, var(--muted-foreground) 45%, var(--background))",
  },
} satisfies ChartConfig;

const grossVolumeData = [
  { day: "May 1", current: 52000, previous: 78000 },
  { day: "May 2", current: 104000, previous: 92000 },
  { day: "May 3", current: 148000, previous: 110000 },
  { day: "May 4", current: 106000, previous: 138000 },
  { day: "May 5", current: 136000, previous: 112000 },
  { day: "May 6", current: 72000, previous: 104000 },
  { day: "May 7", current: 118000, previous: 94000 },
  { day: "May 8", current: 126000, previous: 152000 },
  { day: "May 9", current: 96000, previous: 136000 },
  { day: "May 10", current: 52000, previous: 104000 },
  { day: "May 11", current: 144000, previous: 118000 },
  { day: "May 12", current: 56000, previous: 138000 },
  { day: "May 13", current: 68000, previous: 106000 },
  { day: "May 14", current: 72000, previous: 90000 },
  { day: "May 15", current: 106000, previous: 126000 },
  { day: "May 16", current: 132000, previous: 152000 },
  { day: "May 17", current: 158000, previous: 146000 },
  { day: "May 18", current: 128000, previous: 138000 },
  { day: "May 19", current: 100000, previous: 118000 },
  { day: "May 20", current: 46000, previous: 94000 },
  { day: "May 21", current: 52000, previous: 62000 },
  { day: "May 22", current: 42000, previous: 52000 },
  { day: "May 23", current: 84000, previous: 76000 },
  { day: "May 24", current: 148000, previous: 156000 },
  { day: "May 25", current: 142000, previous: 138000 },
  { day: "May 26", current: 100000, previous: 116000 },
  { day: "May 27", current: 56000, previous: 104000 },
  { day: "May 28", current: 122000, previous: 132000 },
  { day: "May 29", current: 148000, previous: 156000 },
  { day: "May 30", current: 122000, previous: 148000 },
  { day: "May 31", current: 86000, previous: 152000 },
];

const grossVolumeConfig = {
  current: {
    label: "May 1 - May 31",
    color: "var(--primary)",
  },
  previous: {
    label: "Apr 1 - Apr 30",
    color:
      "color-mix(in oklch, var(--muted-foreground) 22%, var(--background))",
  },
} satisfies ChartConfig;

const todayStats = [
  { label: "Gross volume", value: "$125,560.00", delta: "+12.8%" },
  { label: "Successful payments", value: "2,345", delta: "+8.3%" },
  { label: "New customers", value: "156", delta: "+3.1%" },
  { label: "Net volume from sales", value: "$122,312.80", delta: "+11.5%" },
];

const slidingInsights = [
  {
    label: "Volume pace",
    value: "+12.8%",
    detail: "Tracking above yesterday through 10 AM",
  },
  {
    label: "Payout window",
    value: "Tomorrow",
    detail: "$42.2K queued across 2 balances",
  },
  {
    label: "Auth quality",
    value: "98.4%",
    detail: "Approval rate holding above weekly average",
  },
  {
    label: "Risk watch",
    value: "4 open",
    detail: "1 dispute response due before close",
  },
];

const balances = [
  {
    currency: "USD",
    amount: "$32,124.52",
    share: "78%",
    icon: DollarSign,
  },
  {
    currency: "EUR",
    amount: "€9,280.74",
    share: "22%",
    icon: Euro,
  },
];

const recentPayments = [
  {
    initials: "JR",
    name: "Jenny Rosen",
    avatar: "/avatars/avatar-1.png",
    time: "Today, 9:41 AM",
    network: "VISA",
    card: "4242",
    status: "Succeeded",
  },
  {
    initials: "RF",
    name: "Robert Fox",
    avatar: "/avatars/avatar-2.png",
    time: "Today, 9:32 AM",
    network: "MC",
    card: "4444",
    status: "Succeeded",
  },
  {
    initials: "WW",
    name: "Wade Warren",
    avatar: "/avatars/avatar-3.png",
    time: "Today, 9:21 AM",
    network: "AMEX",
    card: "8431",
    status: "Succeeded",
  },
  {
    initials: "EH",
    name: "Esther Howard",
    avatar: "/avatars/avatar-4.png",
    time: "Today, 9:02 AM",
    network: "VISA",
    card: "4242",
    status: "Failed",
  },
  {
    initials: "CW",
    name: "Cameron Williamson",
    avatar: "/avatars/avatar-5.png",
    time: "Today, 8:47 AM",
    network: "MC",
    card: "5555",
    status: "Succeeded",
  },
];

const topCountries = [
  {
    code: "au",
    shortName: "Aus",
    name: "Australia",
    amount: "$12.8K",
    volume: "482 payments",
    share: 39,
    color: "var(--primary)",
    lat: -33.9,
    lng: 151.2,
  },
  {
    code: "us",
    shortName: "USA",
    name: "United States",
    amount: "$8.4K",
    volume: "316 payments",
    share: 26,
    color: "color-mix(in oklch, var(--primary) 82%, var(--background))",
    lat: 38.9,
    lng: -77,
  },
  {
    code: "gb",
    shortName: "UK",
    name: "United Kingdom",
    amount: "$5.9K",
    volume: "218 payments",
    share: 18,
    color: "color-mix(in oklch, var(--primary) 64%, var(--background))",
    lat: 51.5,
    lng: -0.1,
  },
  {
    code: "other",
    shortName: "Other",
    name: "Other countries",
    amount: "$5.6K",
    volume: "210 payments",
    share: 17,
    color: "color-mix(in oklch, var(--primary) 46%, var(--background))",
  },
];

const supplementalPaymentDots = [
  { code: "us", lat: 34.05, lng: -118.24, weight: 0.82 },
  { code: "us", lat: 40.71, lng: -74.01, weight: 0.74 },
  { code: "us", lat: 41.88, lng: -87.63, weight: 0.58 },
  { code: "gb", lat: 53.48, lng: -2.24, weight: 0.48 },
  { code: "gb", lat: 55.95, lng: -3.19, weight: 0.38 },
  { code: "au", lat: -37.81, lng: 144.96, weight: 0.66 },
  { code: "au", lat: -27.47, lng: 153.03, weight: 0.44 },
  { code: "other", lat: 48.85, lng: 2.35, weight: 0.46 },
  { code: "other", lat: 52.52, lng: 13.41, weight: 0.42 },
  { code: "other", lat: 25.2, lng: 55.27, weight: 0.5 },
  { code: "other", lat: 1.35, lng: 103.82, weight: 0.54 },
  { code: "other", lat: 35.68, lng: 139.69, weight: 0.5 },
  { code: "other", lat: 19.43, lng: -99.13, weight: 0.34 },
  { code: "other", lat: -23.55, lng: -46.63, weight: 0.36 },
  { code: "other", lat: -33.45, lng: -70.66, weight: 0.28 },
];

const mappedTopCountries = topCountries.filter(
  (
    country,
  ): country is (typeof topCountries)[number] & {
    lat: number;
    lng: number;
  } => "lat" in country && "lng" in country,
);
const countryMap = new DottedMap({ height: 58, grid: "diagonal" });
const mapBasePoints = countryMap.getPoints();
const countryPinPositions = mappedTopCountries.map((country) =>
  countryMap.addPin({
    lat: country.lat,
    lng: country.lng,
    svgOptions: { color: "transparent", radius: 0 },
  }),
);
const supplementalPaymentPinPositions = supplementalPaymentDots.map((dot) =>
  countryMap.addPin({
    lat: dot.lat,
    lng: dot.lng,
    svgOptions: { color: "transparent", radius: 0 },
  }),
);
const countryMapWidth =
  Math.max(
    ...mapBasePoints.map((point) => point.x),
    ...countryPinPositions.map((point) => point.x),
    ...supplementalPaymentPinPositions.map((point) => point.x),
  ) + 1.5;
const countryMapHeight =
  Math.max(
    ...mapBasePoints.map((point) => point.y),
    ...countryPinPositions.map((point) => point.y),
    ...supplementalPaymentPinPositions.map((point) => point.y),
  ) + 1.5;
const COUNTRY_SPOTLIGHT_RADIUS = 5;
const countrySpotlightMaps: Map<number, number>[] = countryPinPositions.map(
  (pin) => {
    const dotMap = new Map<number, number>();
    mapBasePoints.forEach((dot, dotIndex) => {
      const dx = dot.x - pin.x;
      const dy = dot.y - pin.y;
      const distSq = dx * dx + dy * dy;
      const radiusSq = COUNTRY_SPOTLIGHT_RADIUS * COUNTRY_SPOTLIGHT_RADIUS;
      if (distSq <= radiusSq) {
        const dist = Math.sqrt(distSq);
        const t = dist / COUNTRY_SPOTLIGHT_RADIUS;
        dotMap.set(dotIndex, 0.34 - t * (0.34 - 0.12));
      }
    });
    return dotMap;
  },
);

function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "border-border/80 bg-muted/35 text-card-foreground ring-border/80 rounded-2xl border p-1 shadow-none ring-1 outline-none",
        className,
      )}
    >
      {children}
    </section>
  );
}

function PanelBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-background/95 ring-border rounded-xl ring-1",
        className,
      )}
    >
      {children}
    </div>
  );
}

function PanelHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-12 items-center justify-between gap-2 px-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

function LinkButton({ children }: { children: React.ReactNode }) {
  return (
    <Button className="h-auto p-0 text-sm font-medium" variant="link">
      {children}
    </Button>
  );
}

function Header() {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-semibold tracking-normal">
          Welcome back, Alex
        </h1>
        <div className="relative mt-5 max-w-[540px]">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <div className="border-input bg-background text-muted-foreground flex h-10 items-center rounded-md border pr-3 pl-10 text-sm shadow-xs">
            <span className="min-w-0 flex-1 truncate">Search...</span>
            <span className="font-mono text-xs">⌘ K</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button className="h-9 rounded-md px-4" variant="outline">
          Create
          <ChevronDown className="size-4" />
        </Button>
        <Button
          className="text-muted-foreground hidden h-9 gap-2 md:inline-flex"
          variant="ghost"
        >
          <CircleHelp className="size-4" />
          Help
        </Button>
      </div>
    </header>
  );
}

function TodayPanel() {
  return (
    <Panel>
      <PanelHeader>
        <div className="flex items-center gap-2">
          <h2 className="text-base leading-none font-medium">Today</h2>
          <Info className="text-muted-foreground size-4" />
        </div>
        <div className="flex items-center gap-5 text-sm">
          <span className="flex items-center gap-2">
            <span className="bg-primary h-0.5 w-4 rounded-full" />
            Today
          </span>
          <span className="text-muted-foreground flex items-center gap-2">
            <span className="bg-muted-foreground/40 h-0.5 w-4 rounded-full" />
            Yesterday
          </span>
        </div>
      </PanelHeader>
      <PanelBody className="p-5">
        <div className="grid divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          {todayStats.map((stat) => (
            <div
              className="py-3 first:pt-0 last:pb-0 sm:px-4 sm:py-0 sm:first:pl-0"
              key={stat.label}
            >
              <p className="text-muted-foreground truncate text-[0.84rem] whitespace-nowrap">
                {stat.label}
              </p>
              <p className="mt-2 truncate text-xl font-medium tracking-normal whitespace-nowrap 2xl:text-2xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm font-medium whitespace-nowrap text-emerald-600 dark:text-emerald-400">
                {stat.delta}
              </p>
            </div>
          ))}
        </div>

        <div className="h-[176px] min-w-0">
          <ChartContainer config={todayVolumeConfig} className="h-full w-full">
            <AreaChart
              accessibilityLayer
              data={todayVolumeData}
              margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient
                  id="today-volume-fill"
                  x1="0"
                  x2="0"
                  y1="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--color-today)"
                    stopOpacity={0.14}
                  />
                  <stop
                    offset="90%"
                    stopColor="var(--color-today)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke="var(--border)"
                strokeDasharray="4 6"
                strokeOpacity={0.65}
                vertical={false}
              />
              <XAxis
                axisLine={false}
                dataKey="time"
                ticks={[
                  "12 AM",
                  "2 AM",
                  "4 AM",
                  "6 AM",
                  "8 AM",
                  "10 AM",
                  "Now",
                  "2 PM",
                  "4 PM",
                  "6 PM",
                  "11:59 PM",
                ]}
                tick={{ fontSize: 12 }}
                tickLine={false}
                tickMargin={10}
              />
              <YAxis domain={[0, 90]} hide />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                dataKey="yesterday"
                fill="transparent"
                isAnimationActive={false}
                stroke="var(--color-yesterday)"
                strokeDasharray="5 5"
                strokeWidth={1.75}
                type="monotone"
              />
              <Area
                dataKey="today"
                activeDot={{ r: 4 }}
                dot={{
                  fill: "var(--background)",
                  r: 3,
                  stroke: "var(--color-today)",
                  strokeWidth: 2,
                }}
                fill="url(#today-volume-fill)"
                isAnimationActive={false}
                stroke="var(--color-today)"
                strokeWidth={2}
                type="monotone"
              />
              <Area
                dataKey="estimate"
                activeDot={false}
                dot={false}
                fill="transparent"
                isAnimationActive={false}
                stroke="var(--color-estimate)"
                strokeDasharray="5 5"
                strokeWidth={2}
                type="monotone"
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </PanelBody>
    </Panel>
  );
}

function SlidingInsightsBanner() {
  const [activeInsight, setActiveInsight] = useState(0);
  const insight = slidingInsights[activeInsight];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveInsight((current) => (current + 1) % slidingInsights.length);
    }, 4200);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <Panel className="bg-background border-border/70 rounded-lg p-0 shadow-xs ring-0">
      <PanelBody className="overflow-hidden rounded-lg ring-0">
        <div className="flex min-h-14 items-center gap-4 px-4 py-3 max-md:flex-wrap">
          <div className="flex shrink-0 items-center gap-2">
            <span className="bg-muted text-foreground grid size-8 place-items-center rounded-md">
              <TrendingUp className="size-4" />
            </span>
            <span className="text-sm font-medium whitespace-nowrap">
              Signals
            </span>
          </div>

          <div className="relative min-w-0 flex-1 overflow-hidden border-l pl-4 max-md:min-w-full max-md:border-l-0 max-md:pl-0">
            <div
              className="animate-in fade-in-0 slide-in-from-right-4 min-w-0 duration-500"
              key={insight.label}
            >
              <div className="flex min-w-0 items-baseline gap-3">
                <span className="text-muted-foreground text-sm whitespace-nowrap">
                  {insight.label}
                </span>
                <span className="text-base leading-none font-semibold tracking-normal">
                  {insight.value}
                </span>
                <span className="text-muted-foreground min-w-0 truncate text-sm">
                  {insight.detail}
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <div className="flex items-center gap-1.5">
              {slidingInsights.map((item, index) => (
                <button
                  aria-label={`Show ${item.label} insight`}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    activeInsight === index
                      ? "bg-foreground w-5"
                      : "bg-muted-foreground/25 hover:bg-muted-foreground/50 w-1.5",
                  )}
                  key={item.label}
                  onClick={() => setActiveInsight(index)}
                  type="button"
                />
              ))}
            </div>
          </div>
        </div>
      </PanelBody>
    </Panel>
  );
}

function GrossVolumePanel() {
  return (
    <Panel>
      <PanelHeader>
        <h2 className="text-base leading-none font-medium">Gross volume</h2>
        <div className="flex items-center gap-2">
          <Button className="h-7 rounded-md px-2.5 text-xs" variant="ghost">
            This month
            <ChevronDown className="size-3.5" />
          </Button>
          <Button className="h-7 rounded-md px-2.5 text-xs" variant="ghost">
            Compare
            <ChevronDown className="size-3.5" />
          </Button>
          <Button className="h-7 rounded-md px-2.5 text-xs" variant="ghost">
            Daily
            <ChevronDown className="size-3.5" />
          </Button>
          <Button className="h-7 w-7 rounded-md" size="icon" variant="ghost">
            <MoreVertical className="size-4" />
          </Button>
        </div>
      </PanelHeader>
      <PanelBody className="p-5">
        <div className="border-b pb-5">
          <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
            <p className="text-primary text-3xl font-semibold tracking-normal">
              $3,528,198.72
            </p>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 pb-1">
              <p className="text-primary text-sm font-medium">+14.6%</p>
              <p className="text-muted-foreground text-sm">
                $3,077,692.08 last month
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 h-[250px] min-w-0">
          <ChartContainer config={grossVolumeConfig} className="h-full w-full">
            <BarChart
              accessibilityLayer
              barCategoryGap="34%"
              data={grossVolumeData}
              margin={{ top: 8, right: 0, bottom: 0, left: 0 }}
            >
              <CartesianGrid
                stroke="var(--border)"
                strokeDasharray="4 6"
                vertical={false}
              />
              <XAxis
                axisLine={false}
                dataKey="day"
                interval={6}
                tick={{ fontSize: 12 }}
                tickLine={false}
                tickMargin={10}
              />
              <YAxis
                axisLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${Number(value) / 1000}K`}
                tickLine={false}
                ticks={[0, 50000, 100000, 150000, 200000]}
                width={48}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                barSize={8}
                dataKey="previous"
                fill="var(--color-previous)"
                isAnimationActive={false}
                radius={[2, 2, 0, 0]}
              />
              <Bar
                barSize={8}
                dataKey="current"
                fill="var(--color-current)"
                isAnimationActive={false}
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </PanelBody>
      <div className="flex min-h-10 flex-wrap items-center justify-between gap-4 px-3 py-2">
        <div className="flex flex-wrap items-center gap-5 text-sm">
          <span className="flex items-center gap-2">
            <span className="bg-primary size-2 rounded-sm" />
            May 1 - May 31
          </span>
          <span className="text-muted-foreground flex items-center gap-2">
            <span className="bg-muted size-2 rounded-sm" />
            Apr 1 - Apr 30
          </span>
        </div>
        <div className="flex items-center gap-5">
          <LinkButton>View report</LinkButton>
          <LinkButton>View more</LinkButton>
        </div>
      </div>
    </Panel>
  );
}

function ProjectHealthSummary() {
  return (
    <section className="bg-muted/35 overflow-hidden rounded-[14px] border p-1">
      <div className="grid gap-1 md:grid-cols-3">
        <div className="bg-background flex min-h-24 flex-col justify-between rounded-[10px] border p-3.5 sm:p-4">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            Avg revenue
            <Info className="size-3.5" />
          </div>
          <div className="flex items-end justify-between gap-3">
            <p className="text-2xl font-semibold tracking-tight">$67.42</p>
          </div>
        </div>
        <div className="bg-background flex min-h-24 flex-col justify-between rounded-[10px] border p-3.5 sm:p-4">
          <p className="text-muted-foreground flex items-center gap-2 text-sm">
            <TrendingUp className="size-4" />
            MRR
          </p>
          <div className="flex items-end justify-between gap-3">
            <p className="text-2xl font-semibold tracking-tight">$84.2K</p>
          </div>
        </div>
        <div className="bg-background flex min-h-24 flex-col justify-between rounded-[10px] border p-3.5 sm:p-4">
          <p className="text-muted-foreground flex items-center gap-2 text-sm">
            <TrendingUp className="size-4" />
            ARR
          </p>
          <div className="flex items-end justify-between gap-3">
            <p className="text-2xl font-semibold tracking-tight">$1.01M</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function BalancePanel() {
  return (
    <Panel>
      <PanelHeader>
        <h2 className="text-base leading-none font-medium">Balance</h2>
        <Button className="h-auto p-0 text-sm font-medium" variant="link">
          View all
        </Button>
      </PanelHeader>
      <PanelBody>
        <div className="px-2 pt-4 pb-5">
          <div className="flex items-start justify-between gap-4 rounded-lg px-2 py-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Available to pay out</p>
                <Info className="text-muted-foreground size-4" />
              </div>
              <p className="mt-3 text-[2rem] leading-none font-semibold tracking-normal">
                $42,215.68
              </p>
            </div>
            <div className="text-muted-foreground bg-background ring-border grid size-14 shrink-0 place-items-center rounded-full ring-1">
              <Landmark className="size-6" />
            </div>
          </div>
          <div className="mx-2 mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 px-2 py-2 text-sm text-emerald-700 ring-1 ring-emerald-500/10 dark:text-emerald-300">
            <CalendarDays className="size-5 text-emerald-700/75 dark:text-emerald-300/75" />
            Next payout tomorrow
          </div>
        </div>

        <div className="text-foreground mt-2 mb-1 space-y-1 overflow-hidden border-t px-2 py-2">
          {balances.map((balance) => {
            const Icon = balance.icon;

            return (
              <div
                className="relative grid cursor-default grid-cols-[auto_minmax(0,1fr)] items-center gap-2 rounded-lg px-2 py-2 text-sm outline-hidden select-none"
                key={balance.currency}
              >
                <div className="grid size-9 place-items-center rounded-lg">
                  <Icon className="text-muted-foreground size-5 shrink-0" />
                </div>
                <div className="min-w-0">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{balance.currency}</p>
                    <p className="text-sm font-medium">{balance.amount}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-muted h-1.5 min-w-0 flex-1 overflow-hidden rounded-full">
                      <div
                        className="bg-foreground h-full rounded-full"
                        style={{ width: balance.share }}
                      />
                    </div>
                    <span className="text-muted-foreground ml-auto text-xs tracking-widest">
                      {balance.share}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-2 py-2">
          <Button
            className="h-10 w-full justify-center rounded-lg px-2 py-2 text-sm shadow-none"
            variant="outline"
          >
            View all balances
            <ArrowRight className="text-muted-foreground size-5" />
          </Button>
        </div>
      </PanelBody>
    </Panel>
  );
}

function CountryFlag({ code }: { code: string }) {
  if (code === "other") {
    return (
      <span
        aria-hidden="true"
        className="border-border/70 block h-5 w-8 shrink-0 overflow-hidden rounded-[4px] border bg-[repeating-linear-gradient(135deg,color-mix(in_oklch,var(--muted-foreground)_18%,var(--background))_0_4px,color-mix(in_oklch,var(--muted-foreground)_8%,var(--background))_4px_8px)] shadow-xs"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "border-border/70 relative block h-5 w-8 shrink-0 overflow-hidden rounded-[4px] border shadow-xs",
        code === "au" &&
          "bg-[#012169] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_76%_68%,#fff_0_10%,transparent_10.5%),radial-gradient(circle_at_62%_26%,#fff_0_8%,transparent_8.5%),radial-gradient(circle_at_80%_18%,#fff_0_6%,transparent_6.5%),radial-gradient(circle_at_67%_50%,#fff_0_5%,transparent_5.5%),linear-gradient(to_right,transparent_0_50%,#c8102e_50%_62%,transparent_62%),linear-gradient(to_bottom,transparent_0_38%,#c8102e_38%_50%,transparent_50%),linear-gradient(36deg,transparent_0_44%,#fff_44%_52%,transparent_52%),linear-gradient(144deg,transparent_0_44%,#fff_44%_52%,transparent_52%)] before:bg-[length:100%_100%] before:bg-no-repeat before:content-[''] after:absolute after:top-0 after:left-0 after:h-[52%] after:w-[54%] after:bg-[#012169] after:[background-image:linear-gradient(to_right,transparent_0_40%,#fff_40%_48%,#c8102e_48%_56%,#fff_56%_64%,transparent_64%),linear-gradient(to_bottom,transparent_0_34%,#fff_34%_42%,#c8102e_42%_58%,#fff_58%_66%,transparent_66%),linear-gradient(33deg,transparent_0_42%,#fff_42%_48%,#c8102e_48%_52%,#fff_52%_58%,transparent_58%),linear-gradient(147deg,transparent_0_42%,#fff_42%_48%,#c8102e_48%_52%,#fff_52%_58%,transparent_58%)] after:content-['']",
        code === "us" &&
          "bg-[repeating-linear-gradient(to_bottom,#b22234_0_7.69%,#fff_7.69%_15.38%)] before:absolute before:top-0 before:left-0 before:h-[54%] before:w-[45%] before:bg-[#3c3b6e] before:content-['']",
        code === "gb" &&
          "bg-[#012169] before:absolute before:inset-0 before:bg-[linear-gradient(26deg,transparent_0_42%,#fff_42%_48%,#c8102e_48%_52%,#fff_52%_58%,transparent_58%),linear-gradient(154deg,transparent_0_42%,#fff_42%_48%,#c8102e_48%_52%,#fff_52%_58%,transparent_58%),linear-gradient(to_right,transparent_0_38%,#fff_38%_44%,#c8102e_44%_56%,#fff_56%_62%,transparent_62%),linear-gradient(to_bottom,transparent_0_35%,#fff_35%_43%,#c8102e_43%_57%,#fff_57%_65%,transparent_65%)] before:content-['']",
        code === "fr" &&
          "bg-[linear-gradient(to_right,#002395_0_33%,#fff_33%_66%,#ed2939_66%_100%)]",
        code === "de" &&
          "bg-[linear-gradient(to_bottom,#000_0_33%,#dd0000_33%_66%,#ffce00_66%_100%)]",
      )}
    />
  );
}
function WorldMapGraphic({
  activeCountry,
  onActiveCountryChange,
}: {
  activeCountry: string | null;
  onActiveCountryChange: (country: string | null) => void;
}) {
  const activeIndex = mappedTopCountries.findIndex(
    (country) => country.code === activeCountry,
  );
  const getCountryColor = (code: string) =>
    topCountries.find((country) => country.code === code)?.color ??
    "var(--muted-foreground)";

  return (
    <div className="bg-muted/20 relative grid min-h-[240px] place-items-center overflow-hidden rounded-md">
      <svg
        aria-hidden="true"
        className="h-full w-full scale-[1.12] text-[color-mix(in_oklch,var(--muted-foreground)_58%,var(--background))] dark:text-[color-mix(in_oklch,var(--muted-foreground)_72%,var(--background))]"
        preserveAspectRatio="xMidYMid meet"
        viewBox={`0 0 ${countryMapWidth} ${countryMapHeight}`}
      >
        <defs>
          <style>{`
            @keyframes paymentMapMarkerPulse {
              0% { opacity: 0.9; transform: scale(1); }
              50% { opacity: 0.45; transform: scale(0.92); }
              100% { opacity: 0.9; transform: scale(1); }
            }
          `}</style>
        </defs>

        {mapBasePoints.map((point, index) => {
          let opacity = 0.42;
          if (activeIndex !== -1) {
            const boosted = countrySpotlightMaps[activeIndex].get(index);
            opacity = boosted !== undefined ? boosted + 0.08 : 0.42;
          }

          return (
            <circle
              cx={point.x}
              cy={point.y}
              fill="currentColor"
              key={index}
              opacity={opacity}
              r={0.4}
              style={{ transition: "opacity 220ms ease-out" }}
            />
          );
        })}

        {countryPinPositions.map((pin, index) => {
          const country = mappedTopCountries[index];
          const isActive = country.code === activeCountry;
          const isDimmed = activeCountry !== null && !isActive;
          const baseRadius = index === 0 ? 1.15 : 0.95 - index * 0.06;
          const markerFill = country.color;

          return (
            <g
              key={country.code}
              onMouseEnter={() => onActiveCountryChange(country.code)}
              onMouseLeave={() => onActiveCountryChange(null)}
              style={{
                animation:
                  activeCountry === null
                    ? `paymentMapMarkerPulse 3.2s ease-in-out ${index * 0.45}s infinite`
                    : "none",
                transformOrigin: `${pin.x}px ${pin.y}px`,
              }}
            >
              <circle
                cx={pin.x}
                cy={pin.y}
                fill={markerFill}
                fillOpacity={isDimmed ? 0 : isActive ? 0.28 : 0.16}
                r={isActive ? baseRadius * 4.1 : baseRadius * 3.2}
                stroke={markerFill}
                strokeOpacity={isDimmed ? 0 : isActive ? 0.5 : 0.28}
                strokeWidth={0.28}
                style={{ transition: "all 220ms ease-out" }}
              />
              <circle
                cx={pin.x}
                cy={pin.y}
                fill={markerFill}
                fillOpacity={isDimmed ? 0 : isActive ? 1 : 0.94}
                r={isActive ? baseRadius * 1.28 : baseRadius * 1.08}
                stroke="var(--background)"
                strokeOpacity={isDimmed ? 0 : 0.95}
                strokeWidth={0.42}
                style={{ transition: "all 220ms ease-out" }}
              />
            </g>
          );
        })}

        {supplementalPaymentPinPositions.map((pin, index) => {
          const dot = supplementalPaymentDots[index];
          const isActive = activeCountry === dot.code;
          const isDimmed = activeCountry !== null && !isActive;
          const dotColor = getCountryColor(dot.code);
          const radius = 0.46 + dot.weight * 0.38;

          return (
            <circle
              cx={pin.x}
              cy={pin.y}
              fill={dotColor}
              key={`${dot.code}-${dot.lat}-${dot.lng}`}
              onMouseEnter={() => onActiveCountryChange(dot.code)}
              onMouseLeave={() => onActiveCountryChange(null)}
              opacity={isDimmed ? 0 : isActive ? 0.95 : 0.62}
              r={isActive ? radius * 1.45 : radius}
              stroke="var(--background)"
              strokeOpacity={0.8}
              strokeWidth={0.24}
              style={{ transition: "all 220ms ease-out" }}
            />
          );
        })}
      </svg>
    </div>
  );
}

function TopCountriesPanel() {
  const [activeCountry, setActiveCountry] = useState<string | null>(null);

  return (
    <Panel>
      <PanelHeader>
        <h2 className="text-base leading-none font-medium">
          Top countries by volume
        </h2>
        <div className="flex items-center gap-4">
          <Button className="h-9 w-9 rounded-md" size="icon" variant="ghost">
            <ExternalLink className="size-4" />
            <span className="sr-only">Open country volume report</span>
          </Button>
        </div>
      </PanelHeader>
      <PanelBody className="p-3">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(220px,0.65fr)]">
          <WorldMapGraphic
            activeCountry={activeCountry}
            onActiveCountryChange={setActiveCountry}
          />

          <div className="divide-border/70 grid h-full grid-rows-4 divide-y">
            {topCountries.map((country) => (
              <div
                className={cn(
                  "flex min-h-0 items-center",
                  activeCountry === country.code && "border-primary/35",
                )}
                key={country.code}
              >
                <div className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5">
                  <CountryFlag code={country.code} />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold">
                      {country.name}
                    </p>
                    <p className="text-muted-foreground mt-0.5 truncate text-[11px]">
                      {country.volume}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold tabular-nums">
                      {country.amount}
                    </p>
                    <p className="text-muted-foreground text-[11px] tabular-nums">
                      {country.share}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PanelBody>
    </Panel>
  );
}

function StatusPill({ status }: { status: string }) {
  const failed = status === "Failed";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        failed
          ? "bg-destructive/10 text-destructive"
          : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
      )}
    >
      {status}
    </span>
  );
}

function RecentPaymentsPanel() {
  return (
    <Panel>
      <PanelHeader>
        <h2 className="text-base leading-none font-medium">Recent payments</h2>
        <LinkButton>View all</LinkButton>
      </PanelHeader>
      <PanelBody className="p-5">
        <div className="divide-y">
          {recentPayments.map((payment) => (
            <div
              className="grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-start gap-3 py-4"
              key={`${payment.name}-${payment.card}`}
            >
              <Avatar className="size-9">
                <AvatarImage alt={payment.name} src={payment.avatar} />
                <AvatarFallback className="text-xs font-semibold">
                  {payment.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 space-y-2">
                <p className="truncate text-sm font-medium">{payment.name}</p>
                <StatusPill status={payment.status} />
              </div>
              <div className="flex min-w-[7.75rem] flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <span className="border-border bg-background text-muted-foreground rounded border px-1.5 py-0.5 text-[0.65rem] font-semibold">
                    {payment.network}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    •••• {payment.card}
                  </span>
                </div>
                <p className="text-muted-foreground truncate text-xs">
                  {payment.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </PanelBody>
    </Panel>
  );
}

function DisputeResolutionPanel() {
  return (
    <Panel>
      <PanelHeader>
        <h2 className="min-w-0 truncate text-base leading-none font-medium">
          Dispute resolution
        </h2>
        <Button className="h-8 rounded-md px-3 text-sm" variant="ghost">
          Details
        </Button>
      </PanelHeader>
      <PanelBody className="p-4">
        <div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-muted-foreground text-xs">Resolution health</p>
              <p className="mt-1 text-2xl font-semibold tracking-normal">
                86<span className="text-muted-foreground text-base">/100</span>
              </p>
            </div>
          </div>
          <p className="text-muted-foreground mt-2 text-xs">
            4 open disputes, 1 urgent response due today.
          </p>

          <div className="mt-3 grid shrink-0 grid-cols-36 gap-1.5">
            {Array.from({ length: 36 }).map((_, index) => (
              <span
                className={cn(
                  "h-5 rounded-sm",
                  ![12, 27, 31, 34, 35].includes(index) && "bg-emerald-500",
                  [12, 27].includes(index) && "bg-amber-400",
                  index === 31 && "bg-rose-500",
                  index >= 34 && "bg-muted",
                )}
                key={index}
              />
            ))}
          </div>

          <div className="mt-3 grid grid-cols-3 gap-3 border-t pt-3">
            <div>
              <p className="text-muted-foreground text-xs">Coverage</p>
              <p className="mt-1 text-sm font-semibold">92%</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Win rate</p>
              <p className="mt-1 text-sm font-semibold">74%</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">At risk</p>
              <p className="mt-1 text-sm font-semibold">$3.2K</p>
            </div>
          </div>
        </div>
      </PanelBody>
    </Panel>
  );
}

export function PaymentProcessorDashboard2({
  className,
}: {
  className?: string;
}) {
  return (
    <main
      className={cn(
        "bg-background text-foreground flex min-h-0 flex-1 overflow-hidden [contain:layout_paint]",
        className,
      )}
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[1536px] min-w-0 flex-col gap-6 p-4 md:p-6">
          <Header />
          <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_400px] 2xl:grid-cols-[minmax(0,1fr)_430px]">
            <div className="flex min-w-0 flex-col gap-4">
              <TodayPanel />
              <ProjectHealthSummary />

              <GrossVolumePanel />
              <SlidingInsightsBanner />

              <TopCountriesPanel />
            </div>
            <div className="flex min-w-0 flex-col gap-4">
              <BalancePanel />
              <RecentPaymentsPanel />
              <DisputeResolutionPanel />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
