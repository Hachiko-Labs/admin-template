"use client";

import {
  ArrowDownCircle,
  ArrowDownRight,
  ArrowUpCircle,
  ArrowUpRight,
  BadgeDollarSign,
  CalendarDays,
  CheckCircle2,
  Landmark,
  Link2,
  Megaphone,
  MoreHorizontal,
  Newspaper,
  ReceiptText,
  RefreshCcw,
  RotateCcw,
  ShieldCheck,
  WalletCards,
  Wifi,
} from "lucide-react";
import dynamic from "next/dynamic";
import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const PaymentRegionsMap = dynamic(
  () =>
    import("@/components/payment-processor/payment-regions-map").then(
      (mod) => mod.PaymentRegionsMap,
    ),
  { ssr: false },
);

const metricCards = [
  {
    label: "Gross Volume",
    value: "$125,560",
    icon: BadgeDollarSign,
    color: "text-sky-600",
  },
  {
    label: "Net Revenue",
    value: "$122,313",
    icon: Landmark,
    color: "text-violet-600",
  },
  {
    label: "Successful Payments",
    value: "2,345",
    icon: CheckCircle2,
    color: "text-orange-600",
  },
  {
    label: "Pending Payouts",
    value: "$42,200",
    icon: WalletCards,
    color: "text-emerald-600",
  },
];

const quickActions = [
  { label: "Payment Link", icon: Link2 },
  { label: "Quick Payout", icon: RotateCcw },
  { label: "New Invoice", icon: ReceiptText },
];

const changelogCards = [
  {
    eyebrow: "Risk Engine",
    title: "Reserve Rules Preview",
    description:
      "Model reserve holds before they go live with processor, country, and dispute-rate conditions in one review flow.",
    tagClass:
      "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300",
    dotClass: "bg-blue-500",
    cta: "Review rules",
  },
  {
    eyebrow: "Settlement",
    title: "Faster Payout Windows",
    description:
      "Eligible merchants can now move card settlements into an earlier payout batch when risk checks clear before noon.",
    tagClass:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    dotClass: "bg-emerald-500",
    cta: "View batches",
  },
  {
    eyebrow: "Checkout",
    title: "Local Wallet Routing",
    description:
      "Checkout now recommends regional wallets for returning customers based on approval rate and fee performance.",
    tagClass:
      "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300",
    dotClass: "bg-violet-500",
    cta: "Tune routing",
  },
];

const statuses = {
  Captured:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  Settling:
    "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  Payout:
    "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  Refunded: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  Review: "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

type RecentActivityStatus = keyof typeof statuses;

type RecentActivityTransaction = {
  id: number;
  reference: string;
  href: string;
  amount: string;
  fee?: string;
  status: RecentActivityStatus;
  account: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const days: Array<{
  date: string;
  dateTime: string;
  transactions: RecentActivityTransaction[];
}> = [
  {
    date: "Live queue",
    dateTime: "2026-06-07T20:20:00+05:30",
    transactions: [
      {
        id: 1,
        reference: "evt_q8N4L2",
        href: "#",
        amount: "$9,842.16 USD",
        fee: "$286.42 fee",
        status: "Captured",
        account: "Vanta Manufacturing",
        description: "Stripe · Visa ending 4928",
        icon: ArrowUpCircle,
      },
      {
        id: 2,
        reference: "po_7MpxH91",
        href: "#",
        amount: "$18,406.72 USD",
        status: "Payout",
        account: "Kite Harbor",
        description: "Adyen · ACH settlement",
        icon: ArrowDownCircle,
      },
      {
        id: 3,
        reference: "rf_4Tbk30C",
        href: "#",
        amount: "-$716.88 USD",
        fee: "$21.51 reversal",
        status: "Refunded",
        account: "Signal Grove",
        description: "Braintree · Mastercard ending 1882",
        icon: RefreshCcw,
      },
    ],
  },
  {
    date: "Earlier today",
    dateTime: "2026-06-07T14:10:00+05:30",
    transactions: [
      {
        id: 4,
        reference: "set_2Kqv86D",
        href: "#",
        amount: "$31,284.90 USD",
        fee: "$912.36 processor fees",
        status: "Settling",
        account: "Marble Finch",
        description: "Razorpay · UPI batch",
        icon: Landmark,
      },
      {
        id: 5,
        reference: "risk_9CwT52",
        href: "#",
        amount: "$1,208.40 USD",
        status: "Review",
        account: "Axiom Dental",
        description: "Stripe Radar · elevated dispute risk",
        icon: ShieldCheck,
      },
    ],
  },
];

function Panel({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"section">) {
  return (
    <section
      className={cn(
        "border-border/70 bg-card rounded-xl border shadow-[0_18px_50px_rgba(15,23,42,0.06)]",
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}

function Header() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-muted-foreground text-sm">Payment workspace</p>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button
          aria-label="Calendar"
          className="size-10 rounded-lg shadow-none"
          size="icon"
          variant="outline"
        >
          <CalendarDays />
        </Button>
        <Button
          aria-label="More actions"
          className="size-10 rounded-lg shadow-none"
          size="icon"
          variant="outline"
        >
          <MoreHorizontal />
        </Button>
      </div>
    </header>
  );
}

function MetricGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metricCards.map((metric) => {
        const Icon = metric.icon;
        return (
          <Panel className="min-h-[118px] p-4" key={metric.label}>
            <div className="flex h-full flex-col justify-between gap-5">
              <Icon className={cn("size-4", metric.color)} />
              <div>
                <p className="text-muted-foreground text-xs">{metric.label}</p>
                <p className="mt-1 text-lg font-semibold tracking-tight">
                  {metric.value}
                </p>
              </div>
            </div>
          </Panel>
        );
      })}
    </div>
  );
}

function LaunchBanner() {
  return (
    <Panel className="relative overflow-hidden p-4">
      <div className="relative grid min-w-0 items-center gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="flex min-w-0 items-center gap-3 pl-2">
          <Avatar className="size-11 border shadow-sm">
            <AvatarImage
              alt="Robert Austin"
              src="/avatars/ausrobdev-avatar.png"
            />
            <AvatarFallback>RA</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold tracking-tight">
              Hello, Robert
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Some quick actions for you.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 lg:justify-self-end">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                className="bg-background/80 h-10 rounded-lg px-3 text-xs whitespace-nowrap shadow-none"
                key={action.label}
                variant="outline"
              >
                <Icon data-icon="inline-start" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}

function CreditCardPanel() {
  return (
    <div className="bg-card relative h-[190px] overflow-hidden rounded-xl border p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
      <div className="absolute top-0 right-0 h-full w-32 overflow-hidden opacity-60">
        <div className="absolute top-[-30px] right-[-46px] h-44 w-[5.5rem] rotate-[31deg] rounded-xl border" />
        <div className="absolute top-28 right-[-62px] h-44 w-[5.5rem] rotate-[31deg] rounded-xl border" />
      </div>
      <div className="relative flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-8 border">
            <AvatarImage
              alt="Robert Austin"
              src="/avatars/ausrobdev-avatar.png"
            />
            <AvatarFallback>RA</AvatarFallback>
          </Avatar>
          <Wifi className="text-muted-foreground size-4 rotate-90" />
        </div>
        <span className="flex -space-x-1.5">
          <span className="size-6 rounded-full bg-red-500" />
          <span className="size-6 rounded-full bg-orange-400" />
        </span>
      </div>
      <div className="relative mt-11 flex items-end justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm">Robert Austin</p>
          <p className="mt-2 text-[1.8rem] leading-none font-semibold tracking-tight">
            $14,237.86
          </p>
        </div>
        <span className="bg-background inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium">
          <CheckCircle2 className="size-3.5 text-emerald-600" />
          Active
        </span>
      </div>
    </div>
  );
}

function ActivityOverview() {
  const paymentMix = [
    {
      label: "Cards",
      value: "58%",
      segmentClass:
        "basis-[58%] border-l-2 border-emerald-500 bg-emerald-50 dark:border-emerald-400/70 dark:bg-emerald-500/15",
      markerClass:
        "border-emerald-500 bg-emerald-50 dark:border-emerald-400/80 dark:bg-emerald-500/20",
      volume: "$72.8K",
      change: "+4.1",
    },
    {
      label: "Wallets",
      value: "19%",
      segmentClass:
        "basis-[19%] border-l-2 border-cyan-500 bg-cyan-50 dark:border-cyan-400/70 dark:bg-cyan-500/15",
      markerClass:
        "border-cyan-500 bg-cyan-50 dark:border-cyan-400/80 dark:bg-cyan-500/20",
      volume: "$23.9K",
      change: "+6.4",
    },
    {
      label: "Bank",
      value: "13%",
      segmentClass:
        "basis-[13%] border-l-2 border-indigo-500 bg-indigo-50 dark:border-indigo-400/70 dark:bg-indigo-500/15",
      markerClass:
        "border-indigo-500 bg-indigo-50 dark:border-indigo-400/80 dark:bg-indigo-500/20",
      volume: "$16.3K",
      change: "-1.5",
    },
    {
      label: "Refunds",
      value: "7%",
      segmentClass:
        "basis-[7%] border-l-2 border-amber-500 bg-amber-50 dark:border-amber-300/70 dark:bg-amber-400/14",
      markerClass:
        "border-amber-500 bg-amber-50 dark:border-amber-300/80 dark:bg-amber-400/20",
      volume: "$8.8K",
      change: "+2.8",
    },
    {
      label: "Disputes",
      value: "3%",
      segmentClass:
        "basis-[3%] border-l-2 border-rose-500 bg-rose-50 dark:border-rose-400/70 dark:bg-rose-500/15",
      markerClass:
        "border-rose-500 bg-rose-50 dark:border-rose-400/80 dark:bg-rose-500/20",
      volume: "$3.7K",
      change: "-2.5",
    },
  ];
  const [activeSegment, setActiveSegment] = React.useState<
    (typeof paymentMix)[number] | null
  >(null);
  const tooltipSegment = activeSegment ?? paymentMix[0];
  const [tooltipX, setTooltipX] = React.useState(0);
  const barRef = React.useRef<HTMLDivElement>(null);

  function moveTooltip(
    event: React.MouseEvent<HTMLButtonElement>,
    segment: (typeof paymentMix)[number],
  ) {
    const bounds = barRef.current?.getBoundingClientRect();

    if (!bounds) return;

    setActiveSegment(segment);
    setTooltipX(event.clientX - bounds.left);
  }

  return (
    <Panel className="p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Payment Mix</h2>
        <Button
          className="text-muted-foreground h-8 rounded-lg px-2 text-xs"
          size="sm"
          variant="ghost"
        >
          View all
        </Button>
      </div>

      <div className="relative mt-7">
        <div
          className={cn(
            "bg-foreground text-background pointer-events-none absolute -top-7 z-10 flex h-5 -translate-x-1/2 items-center gap-1.5 px-2 text-[0.65rem] font-medium whitespace-nowrap shadow-[0_8px_20px_rgba(15,23,42,0.14)] transition-opacity duration-150",
            activeSegment
              ? "translate-y-0 opacity-100"
              : "translate-y-1 opacity-0",
          )}
          style={{ left: tooltipX }}
        >
          <span>{tooltipSegment.label}</span>
          <span className="opacity-65">{tooltipSegment.value}</span>
        </div>
        <div className="bg-muted/70 flex h-[46px] overflow-hidden" ref={barRef}>
          {paymentMix.map((segment) => (
            <button
              aria-label={`${segment.label}: ${segment.value} share, ${segment.volume} volume, ${segment.change} change`}
              className={cn(
                "focus-visible:outline-ring min-w-1 cursor-default transition-[filter] duration-150 hover:brightness-95 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2",
                segment.segmentClass,
              )}
              key={segment.label}
              onBlur={() => setActiveSegment(null)}
              onFocus={() => setActiveSegment(segment)}
              onMouseEnter={(event) => moveTooltip(event, segment)}
              onMouseLeave={() => setActiveSegment(null)}
              onMouseMove={(event) => moveTooltip(event, segment)}
              type="button"
            />
          ))}
        </div>
      </div>

      <div className="mt-5">
        <div className="text-muted-foreground grid grid-cols-[minmax(0,1fr)_4.5rem_3.5rem_4.25rem] gap-3 text-[0.68rem] font-semibold tracking-[0.16em] uppercase">
          <span>Method</span>
          <span className="text-right">Volume</span>
          <span className="text-right">Share</span>
          <span className="text-right">Change</span>
        </div>
        <div className="mt-3 flex flex-col gap-3">
          {paymentMix.map((segment) => {
            const negative = segment.change.startsWith("-");
            const TrendIcon = negative ? ArrowDownRight : ArrowUpRight;

            return (
              <div
                className="grid grid-cols-[minmax(0,1fr)_4.5rem_3.5rem_4.25rem] items-center gap-3 text-sm"
                key={segment.label}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className={cn(
                      "block h-2.5 w-2.5 shrink-0 rounded-full border-2",
                      segment.markerClass,
                    )}
                  />
                  <span className="truncate font-medium">{segment.label}</span>
                </div>
                <span className="text-right font-medium">{segment.volume}</span>
                <span className="text-muted-foreground text-right">
                  {segment.value}
                </span>
                <span
                  className={cn(
                    "flex items-center justify-end gap-1 font-medium",
                    negative
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-emerald-600 dark:text-emerald-400",
                  )}
                >
                  <TrendIcon className="size-3.5" />
                  {segment.change}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}

function ChangelogCarousel() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);

  React.useEffect(() => {
    if (isPaused) return;

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % changelogCards.length);
    }, 4200);

    return () => window.clearInterval(intervalId);
  }, [isPaused]);

  return (
    <Panel
      className="overflow-hidden p-5"
      onBlur={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="bg-background flex size-8 shrink-0 items-center justify-center rounded-lg border">
            <Megaphone className="size-4" />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold tracking-tight">
              What&apos;s New?
            </h2>
          </div>
        </div>
        <div className="my-auto flex shrink-0 gap-1.5">
          {changelogCards.map((card, index) => (
            <button
              aria-label={`Show update ${index + 1}: ${card.title}`}
              aria-pressed={activeIndex === index}
              className={cn(
                "bg-muted-foreground/25 h-1.5 rounded-full transition-all duration-200",
                activeIndex === index
                  ? "bg-foreground w-5"
                  : "hover:bg-muted-foreground/45 w-1.5",
              )}
              key={card.title}
              onClick={() => setActiveIndex(index)}
              type="button"
            />
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {changelogCards.map((card) => (
            <article
              className="bg-background/70 min-w-full rounded-lg border p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
              key={card.title}
            >
              <Badge
                className={cn("gap-1.5 shadow-none", card.tagClass)}
                variant="outline"
              >
                <Newspaper className="size-3.5" />
                {card.eyebrow}
              </Badge>
              <h3 className="mt-5 text-base font-semibold tracking-tight">
                {card.title}
              </h3>
              <p className="text-muted-foreground mt-2 min-h-[5.25rem] text-sm leading-6">
                {card.description}
              </p>
              <div className="mt-5 flex items-center justify-between gap-3">
                <Button
                  className="h-8 rounded-lg px-3 text-xs shadow-none"
                  size="sm"
                  variant={card.cta === "Review rules" ? "secondary" : "link"}
                >
                  {card.cta}
                </Button>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {String(activeIndex + 1).padStart(2, "0")} /{" "}
                  {String(changelogCards.length).padStart(2, "0")}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function ProfileRail() {
  return (
    <aside className="flex min-w-0 flex-col gap-4">
      <CreditCardPanel />
      <ActivityOverview />
      <ChangelogCarousel />
    </aside>
  );
}

function RecentActivityTable() {
  return (
    <section className="border-border/70 bg-card overflow-hidden rounded-xl border shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <div className="border-border/70 border-b px-5 py-4">
        <h2 className="text-base font-semibold tracking-tight">
          Recent activity
        </h2>
      </div>
      <div className="px-5 pb-2">
        <Table>
          <TableHeader className="sr-only">
            <TableRow>
              <TableHead>Amount</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>More details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {days.map((day) => (
              <React.Fragment key={day.dateTime}>
                <TableRow className="border-0 hover:bg-transparent">
                  <TableCell
                    className="text-muted-foreground px-0 pt-4 pb-2 text-xs font-medium tracking-wide uppercase"
                    colSpan={3}
                  >
                    <time dateTime={day.dateTime}>{day.date}</time>
                  </TableCell>
                </TableRow>
                {day.transactions.map((transaction) => (
                  <TableRow
                    className="hover:bg-muted/35 border-border/60"
                    key={transaction.id}
                  >
                    <TableCell className="px-0 py-4 pr-6">
                      <div className="flex gap-4">
                        <transaction.icon
                          aria-hidden="true"
                          className="text-muted-foreground mt-0.5 hidden size-5 flex-none sm:block"
                        />
                        <div className="min-w-0 flex-auto">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="text-foreground text-sm font-medium">
                              {transaction.amount}
                            </div>
                            <Badge
                              className={cn(
                                "shadow-none",
                                statuses[transaction.status],
                              )}
                              variant="outline"
                            >
                              {transaction.status}
                            </Badge>
                          </div>
                          {transaction.fee ? (
                            <div className="text-muted-foreground mt-1 text-xs">
                              {transaction.fee}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden px-0 py-4 pr-6 sm:table-cell">
                      <div className="text-foreground text-sm font-medium">
                        {transaction.account}
                      </div>
                      <div className="text-muted-foreground mt-1 text-xs">
                        {transaction.description}
                      </div>
                    </TableCell>
                    <TableCell className="px-0 py-4 text-right">
                      <div className="flex justify-end">
                        <a
                          className="text-primary text-sm font-semibold hover:underline"
                          href={transaction.href}
                        >
                          View detail
                          <span className="sr-only">
                            , reference {transaction.reference},{" "}
                            {transaction.account}
                          </span>
                        </a>
                      </div>
                      <div className="text-muted-foreground mt-1 text-xs">
                        Ref{" "}
                        <span className="text-foreground font-mono">
                          {transaction.reference}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

export function PaymentProcessorDashboard4({
  className,
}: {
  className?: string;
}) {
  return (
    <main
      className={cn(
        "bg-muted/40 text-foreground min-h-0 flex-1 overflow-y-auto",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-[1280px] min-w-0 flex-col gap-5 p-4 md:p-6">
        <Header />
        <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
          <div className="flex min-w-0 flex-col gap-4">
            <MetricGrid />
            <LaunchBanner />
            <PaymentRegionsMap />
            <RecentActivityTable />
          </div>
          <ProfileRail />
        </div>
      </div>
    </main>
  );
}
