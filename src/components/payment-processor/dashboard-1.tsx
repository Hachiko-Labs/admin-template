"use client";

import {
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CreditCard,
  History,
  Plus,
  ShieldCheck,
  Wifi,
} from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";

import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const metricChartConfig = {
  value: {
    label: "Value",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

const grossVolumeTrend = [
  { label: "0", value: 210 },
  { label: "0", value: 210 },
  { label: "2K", value: 420 },
  { label: "2K", value: 420 },
  { label: "3K", value: 300 },
  { label: "3K", value: 300 },
  { label: "4K", value: 360 },
  { label: "4K", value: 360 },
  { label: "5K", value: 420 },
  { label: "5K", value: 420 },
  { label: "100", value: 300 },
  { label: "100", value: 300 },
  { label: "", value: 360 },
  { label: "", value: 420 },
];

const netRevenueTrend = [
  { label: "0", value: 360 },
  { label: "0", value: 330 },
  { label: "2K", value: 300 },
  { label: "2K", value: 300 },
  { label: "3K", value: 360 },
  { label: "3K", value: 360 },
  { label: "4K", value: 330 },
  { label: "4K", value: 330 },
  { label: "5K", value: 420 },
  { label: "5K", value: 420 },
  { label: "100", value: 360 },
  { label: "100", value: 330 },
];

const metricChartTicks = ["0", "2K", "3K", "4K", "5K", "100"];

const mixBase = "var(--background)";

const paymentVolumePalette = {
  income: "var(--primary)",
  expenses: `color-mix(in oklch, var(--primary) 72%, ${mixBase})`,
  scheduled: `color-mix(in oklch, var(--primary) 52%, ${mixBase})`,
  reserve: `color-mix(in oklch, var(--muted) 55%, ${mixBase})`,
};

const paymentVolumeData = [
  { month: "J", scheduled: 1800, expenses: 3600, income: 8400, reserve: 5200 },
  { month: "F", scheduled: 1800, expenses: 3600, income: 8400, reserve: 5200 },
  { month: "M", scheduled: 1800, expenses: 3600, income: 8400, reserve: 5200 },
  { month: "A", scheduled: 1800, expenses: 3600, income: 8400, reserve: 5200 },
  { month: "M", scheduled: 1800, expenses: 3600, income: 8400, reserve: 5200 },
  { month: "J", scheduled: 1800, expenses: 3600, income: 8400, reserve: 5200 },
  { month: "J", scheduled: 1800, expenses: 3600, income: 8400, reserve: 5200 },
  { month: "A", scheduled: 1800, expenses: 3600, income: 8400, reserve: 5200 },
  { month: "S", scheduled: 1800, expenses: 3600, income: 8400, reserve: 5200 },
  { month: "O", scheduled: 1800, expenses: 3600, income: 8400, reserve: 5200 },
  { month: "N", scheduled: 1800, expenses: 3600, income: 8400, reserve: 5200 },
  { month: "D", scheduled: 1800, expenses: 3600, income: 8400, reserve: 5200 },
];

const paymentVolumeChartConfig = {
  income: {
    label: "Cards",
    color: paymentVolumePalette.income,
  },
  expenses: {
    label: "Refunds",
    color: paymentVolumePalette.expenses,
  },
  scheduled: {
    label: "Wallets",
    color: paymentVolumePalette.scheduled,
  },
  reserve: {
    label: "Other",
    color: paymentVolumePalette.reserve,
  },
} satisfies ChartConfig;

const paymentVolumeStats = [
  {
    label: "Cards",
    value: "$142.8K",
    delta: "+11%",
    color: paymentVolumeChartConfig.income.color,
  },
  {
    label: "Wallets",
    value: "$41.2K",
    delta: "+7%",
    color: paymentVolumeChartConfig.scheduled.color,
  },
  {
    label: "Refunds",
    value: "$11.3K",
    delta: "-2%",
    color: paymentVolumeChartConfig.expenses.color,
    negative: true,
  },
];

const paymentMethodData = [
  { category: "Cards", value: 9800, fill: "var(--color-cards)" },
  { category: "Wallets", value: 7200, fill: "var(--color-wallets)" },
  { category: "Bank", value: 2600, fill: "var(--color-bank)" },
];

const paymentMethodChartConfig = {
  cards: {
    label: "Cards",
    color: "var(--primary)",
  },
  wallets: {
    label: "Wallets",
    color: `color-mix(in oklch, var(--primary) 72%, ${mixBase})`,
  },
  bank: {
    label: "Bank",
    color: `color-mix(in oklch, var(--primary) 52%, ${mixBase})`,
  },
} satisfies ChartConfig;

const cardTransactions = [
  {
    title: "Checkout payment",
    detail: "mara@northline.co via Visa",
    amount: "$2,840.00",
    date: "Oct 12",
    icon: CheckCircle2,
    tone: "bg-emerald-100 text-emerald-700",
  },
  {
    title: "Subscription renewal",
    detail: "Helio Supply via ACH debit",
    amount: "$8,120.50",
    date: "Oct 11",
    icon: CreditCard,
    tone: "bg-background text-blue-600",
  },
  {
    title: "Refund issued",
    detail: "Rune Atelier checkout reversal",
    amount: "-$429.18",
    date: "Oct 10",
    icon: History,
    tone: "bg-background text-muted-foreground",
  },
];

const cardProfiles = {
  personal: {
    tabLabel: "Personal",
    name: "Robert Austin",
    balance: "$14,237.86",
    avatar: "/avatars/ausrobdev-avatar.png",
    cardNumber: "•••• 1234",
    expiry: "06/27",
    limit: "$12,000.00",
    network: "personal",
  },
  corporate: {
    tabLabel: "Corporate",
    name: "Shadcnblocks",
    balance: "$21,384.72",
    cardNumber: "•••• 8492",
    expiry: "11/28",
    limit: "$18,500.00",
    network: "corporate",
  },
};

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
        "border-border/80 bg-card rounded-2xl border shadow-[0_1px_2px_rgba(15,23,42,0.05)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

function DeltaBadge({
  value,
  intent = "positive",
}: {
  value: string;
  intent?: "positive" | "negative";
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold",
        intent === "positive"
          ? "bg-emerald-100 text-emerald-700"
          : "bg-rose-100 text-rose-700",
      )}
    >
      {value}
    </span>
  );
}

function MoneyValue({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-[1.65rem] leading-none font-medium tracking-normal",
        className,
      )}
    >
      {children}
    </p>
  );
}

function SparkLine({ variant = "gross" }: { variant?: "gross" | "net" }) {
  const data = variant === "gross" ? grossVolumeTrend : netRevenueTrend;

  return (
    <div className="relative h-[76px] min-w-0 pb-3">
      <ChartContainer config={metricChartConfig} className="h-full w-full">
        <LineChart
          accessibilityLayer
          data={data}
          margin={{ top: 4, right: 0, bottom: 12, left: 0 }}
        >
          <CartesianGrid
            stroke="var(--border)"
            strokeDasharray="6 10"
            horizontal={false}
            vertical
          />
          <XAxis dataKey="label" hide />
          <YAxis hide domain={[180, 450]} />
          <Line
            dataKey="value"
            dot={false}
            isAnimationActive={false}
            stroke="var(--color-value)"
            strokeWidth={1.75}
            type="linear"
          />
        </LineChart>
      </ChartContainer>
      <div className="text-muted-foreground pointer-events-none absolute right-0 bottom-1 left-0 grid grid-cols-6 text-[0.7rem]">
        {metricChartTicks.map((tick) => (
          <span key={tick}>{tick}</span>
        ))}
      </div>
    </div>
  );
}

function TopMetricCards() {
  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:gap-6">
      <Panel className="h-[178px] p-5 pb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-muted-foreground text-[0.85rem]">Gross Volume</p>
            <div className="mt-2 flex flex-wrap items-center gap-2.5">
              <MoneyValue>$387,291.84</MoneyValue>
              <DeltaBadge value="+12%" />
            </div>
          </div>
        </div>
        <div className="mt-4 min-w-0">
          <SparkLine />
        </div>
      </Panel>

      <Panel className="h-[178px] p-5 pb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-muted-foreground text-[0.85rem]">Net Revenue</p>
            <div className="mt-2 flex flex-wrap items-center gap-2.5">
              <MoneyValue>$369,840.22</MoneyValue>
              <DeltaBadge value="+9%" />
            </div>
          </div>
        </div>
        <div className="mt-4 min-w-0">
          <SparkLine variant="net" />
        </div>
      </Panel>
    </div>
  );
}

function PaymentVolumeOverview() {
  return (
    <Panel className="h-[380px] p-4">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <BarChart3 className="text-muted-foreground shrink-0" />
            <h2 className="truncate text-lg font-semibold">Payment Volume</h2>
          </div>
          <div className="flex flex-wrap items-start justify-end gap-5">
            {paymentVolumeStats.map((stat) => (
              <PaymentVolumeStat key={stat.label} {...stat} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 h-[296px] min-w-0">
        <ChartContainer
          config={paymentVolumeChartConfig}
          className="h-full w-full"
        >
          <BarChart
            accessibilityLayer
            barCategoryGap="24%"
            barSize={30}
            data={paymentVolumeData}
            margin={{ top: 6, right: 0, bottom: 0, left: 0 }}
          >
            <CartesianGrid
              stroke="var(--border)"
              strokeDasharray="4 4"
              strokeOpacity={0.55}
              vertical={false}
            />
            <XAxis
              axisLine={false}
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              domain={[0, 20000]}
              tickFormatter={(value) =>
                value === 0 ? "0" : `${Number(value) / 1000}k`
              }
              tickLine={false}
              ticks={[0, 5000, 10000, 15000, 20000]}
              tick={{ fontSize: 12 }}
              width={46}
            />
            <ChartTooltip
              content={<ChartTooltipContent hideLabel />}
              cursor={{
                fill: "color-mix(in oklch, var(--muted) 45%, transparent)",
              }}
            />
            <Bar
              dataKey="scheduled"
              fill="var(--color-scheduled)"
              stackId="budget"
            />
            <Bar
              dataKey="expenses"
              fill="var(--color-expenses)"
              stackId="budget"
            />
            <Bar dataKey="income" fill="var(--color-income)" stackId="budget" />
            <Bar
              dataKey="reserve"
              fill="var(--color-reserve)"
              radius={[4, 4, 0, 0]}
              stackId="budget"
            />
          </BarChart>
        </ChartContainer>
      </div>
    </Panel>
  );
}

function PaymentVolumeStat({
  color,
  label,
  value,
  delta,
  negative,
}: {
  color: string;
  label: string;
  value: string;
  delta?: string;
  negative?: boolean;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <span
          className="size-2 rounded-full"
          style={{ backgroundColor: color }}
        />
        <p className="text-muted-foreground text-[0.7rem] font-medium tracking-wide uppercase">
          {label}
        </p>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold">{value}</p>
        {delta && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-semibold",
              negative
                ? "bg-rose-100 text-rose-700"
                : "bg-emerald-100 text-emerald-700",
            )}
          >
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}

function CreditScore() {
  return (
    <Panel className="flex h-[214px] flex-col p-4 pb-5">
      <div className="flex shrink-0 items-center justify-between gap-4 border-b pb-3">
        <div className="flex min-w-0 items-center gap-3">
          <ShieldCheck className="text-muted-foreground shrink-0" />
          <h2 className="truncate text-base font-semibold xl:text-lg">
            Dispute Health
          </h2>
        </div>
        <Button
          className="h-8 shrink-0 rounded-xl px-3 text-sm"
          variant="outline"
        >
          Details
        </Button>
      </div>
      <div className="mt-3 flex min-h-0 flex-1 items-start justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-base">
            Resolution health is{" "}
            <span className="text-foreground font-semibold">86/100</span>
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            4 open disputes, 1 urgent case, 92% response coverage.
          </p>
        </div>
        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-700">
          <CheckCircle2 className="size-5" />
        </div>
      </div>
      <div className="mt-auto grid shrink-0 grid-cols-36 gap-1.5">
        {Array.from({ length: 36 }).map((_, index) => (
          <span
            className={cn(
              "h-5 rounded-sm",
              index < 25 && "bg-emerald-500",
              index >= 25 && index < 31 && "bg-amber-400",
              index >= 31 && index < 34 && "bg-rose-500",
              index >= 34 && "bg-muted",
            )}
            key={index}
          />
        ))}
      </div>
    </Panel>
  );
}

function PaymentMethodMix() {
  return (
    <Panel className="h-[214px] p-4 pb-5">
      <div className="flex items-center justify-between gap-3 border-b pb-3">
        <div className="flex min-w-0 items-center gap-3">
          <BarChart3 className="text-muted-foreground shrink-0" />
          <h2 className="min-w-0 truncate text-base leading-tight font-semibold xl:text-lg">
            Payment Method Mix
          </h2>
        </div>
        <Button
          className="h-8 shrink-0 rounded-xl px-3 text-sm"
          variant="outline"
        >
          Weekly
          <ChevronDown />
        </Button>
      </div>
      <div className="mt-4 h-[126px] min-w-0">
        <ChartContainer
          config={paymentMethodChartConfig}
          className="h-full w-full"
        >
          <BarChart
            accessibilityLayer
            data={paymentMethodData}
            layout="vertical"
            margin={{ top: 0, right: 0, bottom: 8, left: 0 }}
          >
            <CartesianGrid
              horizontal={false}
              stroke="var(--border)"
              strokeDasharray="4 4"
            />
            <XAxis
              axisLine={false}
              domain={[0, 10000]}
              tickFormatter={(value) =>
                value === 0 ? "0" : `${Number(value) / 1000}K`
              }
              tickLine={false}
              ticks={[0, 2000, 4000, 6000, 8000, 10000]}
              type="number"
            />
            <YAxis
              axisLine={false}
              dataKey="category"
              tickLine={false}
              tick={{ fontSize: 12 }}
              type="category"
              width={64}
            />
            <ChartTooltip
              content={<ChartTooltipContent hideLabel />}
              cursor={{
                fill: "color-mix(in oklch, var(--muted) 45%, transparent)",
              }}
            />
            <Bar
              barSize={14}
              dataKey="value"
              isAnimationActive={false}
              radius={[4, 4, 4, 4]}
            />
          </BarChart>
        </ChartContainer>
      </div>
    </Panel>
  );
}

function DashboardIntro() {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar className="size-9 border">
          <AvatarImage
            alt="Robert Austin"
            src="/avatars/ausrobdev-avatar.png"
          />
          <AvatarFallback>RA</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold">Robert Austin</h1>
          <p className="text-muted-foreground truncate text-sm">
            Payment processor dashboard
          </p>
        </div>
      </div>
      <div className="hidden items-center gap-5 text-sm md:flex">
        <div>
          <span className="text-muted-foreground">Pending</span>{" "}
          <span className="font-semibold">$8,420.16</span>
        </div>
        <div>
          <span className="text-muted-foreground">Settled</span>{" "}
          <span className="font-semibold">$42,180.90</span>
        </div>
      </div>
    </div>
  );
}

function MyCards() {
  const [selectedCard, setSelectedCard] =
    useState<keyof typeof cardProfiles>("personal");
  const card = cardProfiles[selectedCard];

  return (
    <section className="flex min-h-full flex-col px-5 py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <CreditCard className="text-muted-foreground size-5" />
          <h2 className="text-lg font-semibold tracking-normal">My Cards</h2>
        </div>
        <Button className="h-9 rounded-xl px-3 text-sm" variant="outline">
          <Plus />
          Add Card
        </Button>
      </div>

      <Tabs
        className="mt-4"
        onValueChange={(value) =>
          setSelectedCard(value as keyof typeof cardProfiles)
        }
        value={selectedCard}
      >
        <TabsList className="grid h-10 w-full grid-cols-2 rounded-xl p-1">
          <TabsTrigger
            className="h-8 rounded-lg text-[0.85rem]"
            value="personal"
          >
            Personal
          </TabsTrigger>
          <TabsTrigger
            className="h-8 rounded-lg text-[0.85rem]"
            value="corporate"
          >
            Corporate
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="bg-card relative mt-4 h-[190px] overflow-hidden rounded-2xl border p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
        <div className="absolute top-0 right-0 h-full w-32 overflow-hidden opacity-60">
          <div className="absolute top-[-30px] right-[-46px] h-44 w-[5.5rem] rotate-[31deg] rounded-3xl border" />
          <div className="absolute top-28 right-[-62px] h-44 w-[5.5rem] rotate-[31deg] rounded-3xl border" />
        </div>
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {selectedCard === "personal" ? (
              <Avatar className="size-8 border">
                <AvatarImage
                  alt={card.name}
                  src={cardProfiles.personal.avatar}
                />
                <AvatarFallback>RA</AvatarFallback>
              </Avatar>
            ) : (
              <div className="bg-background grid size-8 place-items-center rounded-full border">
                <Logo
                  alt="Shadcnblocks"
                  className="size-[1.05rem] dark:invert"
                  height={17}
                  src="/images/block/logos/shadcnblocks-logo.svg"
                  width={17}
                />
              </div>
            )}
            <Wifi className="text-muted-foreground size-4 rotate-90" />
          </div>
          <span className="flex -space-x-1.5">
            <span className="size-6 rounded-full bg-red-500" />
            <span className="size-6 rounded-full bg-orange-400" />
          </span>
        </div>
        <div className="relative mt-11 flex items-end justify-between gap-4">
          <div>
            <p className="text-muted-foreground text-sm">{card.name}</p>
            <MoneyValue className="mt-2 text-[1.8rem]">
              {card.balance}
            </MoneyValue>
          </div>
          <span className="bg-background inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium">
            <CheckCircle2 className="size-3.5 text-emerald-600" />
            Active
          </span>
        </div>
      </div>

      <dl className="mt-4 grid gap-3 text-[0.92rem]">
        {[
          ["Card Number", card.cardNumber],
          ["Expiry Date", card.expiry],
          ["CVC", "•••"],
          ["Spending Limit", card.limit],
        ].map(([label, value]) => (
          <div className="flex items-center justify-between gap-4" key={label}>
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-semibold">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 grid grid-cols-3 gap-2.5">
        {["Unhide", "Adjust Limit", "More"].map((label) => (
          <Button
            className="h-9 rounded-xl px-2 text-[0.85rem]"
            key={label}
            variant="outline"
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="mt-5 flex min-h-0 flex-1 flex-col border-t pt-4">
        <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          Recent Payments
        </p>
        <div className="mt-4 flex flex-col gap-4">
          {cardTransactions.map((transaction) => {
            const Icon = transaction.icon;
            return (
              <div
                className="grid grid-cols-[2.5rem_1fr_auto_1rem] items-center gap-3"
                key={transaction.title}
              >
                <div
                  className={cn(
                    "grid size-10 place-items-center rounded-full border",
                    transaction.tone,
                  )}
                >
                  {typeof Icon === "string" ? (
                    <span className="text-xl font-bold">{Icon}</span>
                  ) : (
                    <Icon />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[0.85rem] font-semibold">
                    {transaction.title}
                  </p>
                  <p className="text-muted-foreground truncate text-sm">
                    {transaction.detail}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[0.85rem] font-semibold">
                    {transaction.amount}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {transaction.date}
                  </p>
                </div>
                <ChevronRight className="text-muted-foreground" />
              </div>
            );
          })}
        </div>
        <div className="mt-auto pt-5">
          <Button
            className="h-10 w-full rounded-xl text-[0.85rem]"
            variant="outline"
          >
            <History />
            See All Payments
          </Button>
        </div>
      </div>
    </section>
  );
}

export function PaymentProcessorDashboard1({
  className,
}: {
  className?: string;
}) {
  return (
    <main
      className={cn(
        "bg-background text-foreground flex min-h-0 flex-1 overflow-hidden",
        className,
      )}
    >
      <div className="flex min-h-0 w-full max-w-full flex-1 flex-col overflow-y-auto xl:flex-row xl:overflow-hidden">
        <div className="min-w-0 flex-1 xl:overflow-y-auto">
          <div className="mx-auto flex w-full max-w-[888px] min-w-0 flex-col gap-6 p-4 xl:p-6">
            <DashboardIntro />
            <TopMetricCards />
            <PaymentVolumeOverview />
            <div className="grid gap-4 lg:grid-cols-2 xl:gap-6">
              <CreditScore />
              <PaymentMethodMix />
            </div>
          </div>
        </div>

        <aside className="border-border bg-background min-w-0 shrink-0 overflow-y-auto border-t xl:w-[384px] xl:border-t-0 xl:border-l 2xl:w-[400px]">
          <MyCards />
        </aside>
      </div>
    </main>
  );
}
