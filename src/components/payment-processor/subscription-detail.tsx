"use client";

import {
  BadgeCheck,
  Banknote,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Download,
  Edit3,
  Ellipsis,
  PackageCheck,
  Pause,
  ReceiptText,
  RefreshCcw,
  TicketPercent,
} from "lucide-react";
import { type CSSProperties, type ReactNode, useMemo, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const subscription = {
  id: "sub_SB8qL2nV5xR0pHcK7dMzA",
  name: "Shadcnblocks Pro Monthly",
  status: "Active",
  productId: "prod_shadcnblocks_pro",
  priceId: "price_pro_monthly_29",
  price: "$29.00",
  quantity: "3 seats",
  billingCycle: "Monthly",
  collectionMethod: "Automatic charge",
  started: "May 30, 2026",
  currentPeriod: "Jun 30 - Jul 30, 2026",
  nextInvoice: "Jun 30, 2026 at 9:24 AM",
  mrr: "$87.00",
  lifetimeValue: "$406.00",
  renewalRate: "96.8%",
};

const overviewFields = [
  { label: "Subscription ID", value: subscription.id, icon: ReceiptText },
  { label: "Product ID", value: subscription.productId, icon: PackageCheck },
  { label: "Price ID", value: subscription.priceId, icon: Banknote },
  { label: "Status", value: subscription.status, icon: BadgeCheck },
  {
    label: "Billing cycle",
    value: subscription.billingCycle,
    icon: RefreshCcw,
  },
  {
    label: "Collection",
    value: subscription.collectionMethod,
    icon: CreditCard,
  },
  {
    label: "Current period",
    value: subscription.currentPeriod,
    icon: CalendarClock,
  },
  { label: "Started", value: subscription.started, icon: CheckCircle2 },
];

const subscriptionMetrics = [
  {
    label: "Total collected",
    value: subscription.lifetimeValue,
    icon: Banknote,
    detail: "successful charges",
  },
  {
    label: "Successful payments",
    value: "6",
    icon: CheckCircle2,
    detail: "of 10 transactions",
  },
  {
    label: "Subscribers",
    value: "8",
    icon: BadgeCheck,
    detail: "5 active",
  },
];

const subscribers = [
  {
    name: "Avery Stone",
    initials: "AS",
    avatar: "/avatars/avatar-1.png",
    email: "avery.stone@northledger.io",
    id: "subr_9Lx4A2",
    status: "Active",
    startDate: "May 30, 2026",
  },
  {
    name: "Mira Valdez",
    initials: "MV",
    avatar: "/avatars/avatar-3.png",
    email: "mira.valdez@northledger.io",
    id: "subr_7Qn8R1",
    status: "Active",
    startDate: "Jun 02, 2026",
  },
  {
    name: "Jon Bell",
    initials: "JB",
    avatar: "/avatars/avatar-5.png",
    email: "jon.bell@northledger.io",
    id: "subr_3Kp2M9",
    status: "Invited",
    startDate: "Jun 14, 2026",
  },
  {
    name: "Nia Kapoor",
    initials: "NK",
    avatar: "/avatars/avatar-2.png",
    email: "nia.kapoor@northledger.io",
    id: "subr_6Vt8H4",
    status: "Active",
    startDate: "Jun 18, 2026",
  },
  {
    name: "Owen Clarke",
    initials: "OC",
    avatar: "/avatars/avatar-4.png",
    email: "owen.clarke@northledger.io",
    id: "subr_2Re7B6",
    status: "Paused",
    startDate: "May 31, 2026",
  },
  {
    name: "Lena Ortiz",
    initials: "LO",
    avatar: "/avatars/avatar-6.png",
    email: "lena.ortiz@northledger.io",
    id: "subr_8Yd1N5",
    status: "Active",
    startDate: "Jun 09, 2026",
  },
  {
    name: "Theo Grant",
    initials: "TG",
    avatar: "/avatars/avatar-black-2.png",
    email: "theo.grant@northledger.io",
    id: "subr_4Mc9P3",
    status: "Canceled",
    startDate: "May 30, 2026",
  },
  {
    name: "Iris Chen",
    initials: "IC",
    avatar: "/avatars/avatar-black-5.png",
    email: "iris.chen@northledger.io",
    id: "subr_5Xw6T8",
    status: "Active",
    startDate: "Jun 21, 2026",
  },
];

const transactions = [
  {
    id: "txn_8z1fQ4",
    status: "Succeeded",
    amount: "$87.00",
    method: "Visa ending 4928",
    date: "May 30, 2026",
  },
  {
    id: "txn_7mx2Pa",
    status: "Posted",
    amount: "-$9.67",
    method: "Balance adjustment",
    date: "Jun 14, 2026",
  },
  {
    id: "txn_7k91Ld",
    status: "Succeeded",
    amount: "$87.00",
    method: "Visa ending 4928",
    date: "Apr 30, 2026",
  },
  {
    id: "txn_6Fb8Rc",
    status: "Succeeded",
    amount: "$29.00",
    method: "Visa ending 4928",
    date: "Jun 21, 2026",
  },
  {
    id: "txn_5An3Yk",
    status: "Failed",
    amount: "$29.00",
    method: "Visa ending 4928",
    date: "Jun 20, 2026",
  },
  {
    id: "txn_4Pw7Qe",
    status: "Succeeded",
    amount: "$87.00",
    method: "Visa ending 4928",
    date: "Mar 30, 2026",
  },
  {
    id: "txn_3Hm2Ls",
    status: "Refunded",
    amount: "-$29.00",
    method: "Visa ending 4928",
    date: "Mar 18, 2026",
  },
  {
    id: "txn_2Dk9Vb",
    status: "Succeeded",
    amount: "$58.00",
    method: "Mastercard ending 1844",
    date: "Feb 28, 2026",
  },
  {
    id: "txn_1Jr6Tx",
    status: "Succeeded",
    amount: "$58.00",
    method: "Mastercard ending 1844",
    date: "Jan 30, 2026",
  },
  {
    id: "txn_0Zc4Na",
    status: "Posted",
    amount: "-$14.50",
    method: "Promotional credit",
    date: "Jan 12, 2026",
  },
];

const discounts = [
  {
    code: "PRO-LAUNCH-25",
    status: "Active",
    value: "25% off",
    appliesTo: "Recurring invoice total",
    expires: "Jul 30, 2026",
  },
  {
    code: "SEAT-CREDIT-JUN",
    status: "Redeemed",
    value: "$9.67 credit",
    appliesTo: "Seat proration",
    expires: "Jun 14, 2026",
  },
];

const calendarMonths = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const calendarWeekdays = ["S", "M", "T", "W", "T", "F", "S"];
const mixBase = "var(--background)";
const heatmapPalette = [
  {
    backgroundColor: `color-mix(in oklch, var(--muted) 42%, ${mixBase})`,
    borderColor: `color-mix(in oklch, var(--border) 70%, ${mixBase})`,
  },
  {
    backgroundColor: `color-mix(in oklch, var(--primary) 18%, ${mixBase})`,
    borderColor: `color-mix(in oklch, var(--primary) 25%, ${mixBase})`,
  },
  {
    backgroundColor: `color-mix(in oklch, var(--primary) 38%, ${mixBase})`,
    borderColor: `color-mix(in oklch, var(--primary) 45%, ${mixBase})`,
  },
  {
    backgroundColor: "var(--primary)",
    borderColor: `color-mix(in oklch, var(--primary) 85%, ${mixBase})`,
  },
] satisfies CSSProperties[];

function getActivityLevel(monthIndex: number, dayIndex: number) {
  if (monthIndex > 6) {
    return 0;
  }

  const seed =
    (monthIndex + 3) * 92837111 +
    (dayIndex + 17) * 689287499 +
    ((monthIndex + dayIndex) % 5) * 19349663;
  const noise = Math.abs(Math.sin(seed) * 10000) % 1;
  const burst = [1, 8, 13, 19, 26].includes(dayIndex);
  const density = [0.58, 0.5, 0.54, 0.56, 0.52, 0.45, 0.38][monthIndex];

  if (noise > 0.965 || (burst && noise > 0.82)) {
    return 3;
  }

  if (noise > 0.82 || (burst && noise > 0.66)) {
    return 2;
  }

  if (noise < density && noise > 0.28) {
    return 1;
  }

  return 0;
}

const calendarCells = Array.from({ length: 12 }, (_, monthIndex) =>
  Array.from({ length: 28 }, (_, dayIndex) =>
    getActivityLevel(monthIndex, dayIndex),
  ),
);

const transactionPageSize = 5;
const subscriberPageSize = 4;

function TableStatusBadge({ status }: { status: string }) {
  const tone =
    status === "Active" || status === "Paid" || status === "Succeeded"
      ? "border-emerald-600/20 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-900/30 dark:text-emerald-400"
      : status === "Upcoming" || status === "Invited"
        ? "border-sky-600/20 bg-sky-50 text-sky-700 dark:border-sky-400/20 dark:bg-sky-900/30 dark:text-sky-400"
        : status === "Redeemed" || status === "Posted"
          ? "border-zinc-300 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-300"
          : "border-amber-600/20 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-900/30 dark:text-amber-400";

  return (
    <Badge
      variant="outline"
      className={cn("h-5 rounded-md px-1.5 text-[11px] shadow-none", tone)}
    >
      {status}
    </Badge>
  );
}

function DetailSection({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h2 className="text-[15px] font-semibold">{title}</h2>
          <span className="border-border min-w-0 flex-1 border-t border-dashed" />
        </div>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
      <div className="overflow-hidden rounded-md border">{children}</div>
    </section>
  );
}

function TablePagination({
  currentPage,
  pageSize,
  setCurrentPage,
  totalItems,
}: {
  currentPage: number;
  pageSize: number;
  setCurrentPage: (page: number) => void;
  totalItems: number;
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(totalItems, currentPage * pageSize);

  return (
    <footer className="flex h-12 items-center justify-between gap-3 border-t px-4 text-sm">
      <p className="text-muted-foreground tabular-nums">
        {start}-{end} of {totalItems}
      </p>
      <div className="flex items-center overflow-hidden rounded-md border">
        <Button
          className="size-8 rounded-none border-r shadow-none"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          size="icon"
          type="button"
          variant="ghost"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          <span className="sr-only">Previous page</span>
        </Button>
        <Button
          className="size-8 rounded-none shadow-none"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          size="icon"
          type="button"
          variant="ghost"
        >
          <ChevronRight className="size-4" aria-hidden="true" />
          <span className="sr-only">Next page</span>
        </Button>
      </div>
    </footer>
  );
}

function SubscriptionMetricsSection() {
  return (
    <Card className="bg-muted/15 rounded-lg p-1 shadow-none">
      <CardContent className="p-0">
        <div className="grid gap-1 md:grid-cols-3">
          {subscriptionMetrics.map((metric) => {
            const Icon = metric.icon;

            return (
              <div
                key={metric.label}
                className="bg-background rounded-md border px-4 py-3"
              >
                <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
                  <Icon className="size-4" />
                  {metric.label}
                </div>
                <p className="mt-5 text-2xl font-semibold tracking-tight">
                  {metric.value}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function RenewalHeatmap() {
  return (
    <section className="w-full max-w-[300px]">
      <div className="border-border flex items-center justify-between gap-4 border-b border-dashed pb-3">
        <h2 className="text-sm font-semibold">Activity</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground h-7 px-1.5 text-sm font-medium"
            >
              2026
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-28">
            <DropdownMenuItem>2026</DropdownMenuItem>
            <DropdownMenuItem>2025</DropdownMenuItem>
            <DropdownMenuItem>2024</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="mt-3 grid grid-cols-[2.25rem_minmax(0,1fr)] items-center gap-3 py-2">
        <span />
        <div className="grid grid-cols-7 gap-1.5">
          {calendarWeekdays.map((weekday, index) => (
            <span
              key={`${weekday}-${index}`}
              className="text-muted-foreground text-center text-xs font-medium"
            >
              {weekday}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        {calendarMonths.map((month, monthIndex) => (
          <div
            key={month}
            className="grid grid-cols-[2.25rem_minmax(0,1fr)] items-center gap-3"
          >
            <span className="text-muted-foreground text-xs">{month}</span>
            <div className="grid grid-cols-7 gap-2">
              {calendarCells[monthIndex].map((value, dayIndex) => (
                <span
                  key={`${month}-${dayIndex}`}
                  className="h-2.5 rounded-[3px] border shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
                  style={heatmapPalette[value]}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PaymentProcessorSubscriptionDetail() {
  const [transactionPage, setTransactionPage] = useState(1);
  const [subscriberPage, setSubscriberPage] = useState(1);
  const visibleTransactions = useMemo(
    () =>
      transactions.slice(
        (transactionPage - 1) * transactionPageSize,
        transactionPage * transactionPageSize,
      ),
    [transactionPage],
  );
  const visibleSubscribers = useMemo(
    () =>
      subscribers.slice(
        (subscriberPage - 1) * subscriberPageSize,
        subscriberPage * subscriberPageSize,
      ),
    [subscriberPage],
  );

  return (
    <main className="bg-background text-foreground flex min-h-0 flex-1 overflow-hidden">
      <div className="min-h-0 w-full flex-1 overflow-y-auto">
        <section className="mx-auto flex w-full max-w-7xl flex-col gap-7 px-6 py-7 md:px-8">
          <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-col gap-4">
              <div className="flex min-w-0 flex-wrap items-center gap-3">
                <h1 className="truncate text-2xl leading-tight font-semibold tracking-tight">
                  {subscription.name}
                </h1>
                <Badge
                  variant="outline"
                  className="h-6 rounded-md border-emerald-600/20 bg-emerald-50 px-2 text-xs font-medium text-emerald-700 shadow-none dark:border-emerald-400/20 dark:bg-emerald-900/30 dark:text-emerald-400"
                >
                  {subscription.status}
                </Badge>
              </div>
              <div className="text-muted-foreground flex max-w-full flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <div className="flex min-w-0 items-center gap-2">
                  <PackageCheck className="size-4 shrink-0" />
                  <span className="text-foreground truncate font-medium">
                    Product subscription
                  </span>
                </div>
                <Separator
                  orientation="vertical"
                  className="hidden h-5 sm:block"
                />
                <div className="flex min-w-0 items-center gap-2">
                  <Banknote className="size-4 shrink-0" />
                  <span>Amount:</span>
                  <span className="text-foreground font-medium">
                    {subscription.price}
                  </span>
                </div>
                <Separator
                  orientation="vertical"
                  className="hidden h-5 sm:block"
                />
                <div className="flex min-w-0 items-center gap-2">
                  <RefreshCcw className="size-4 shrink-0" />
                  <span>Cycle:</span>
                  <span className="text-foreground font-medium">
                    {subscription.billingCycle}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 gap-1.5 px-3">
                <Pause className="size-3.5" />
                Pause
              </Button>
              <Button variant="default" size="sm" className="h-8 gap-1.5 px-3">
                <Edit3 className="size-3.5" />
                Edit
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    aria-label="More subscription actions"
                  >
                    <Ellipsis />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>Copy subscription ID</DropdownMenuItem>
                  <DropdownMenuItem>View product object</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Cancel subscription</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <Separator />

          <dl className="grid gap-x-20 gap-y-4 text-sm md:grid-cols-2">
            {overviewFields.map((field) => {
              const Icon = field.icon;

              return (
                <div
                  key={field.label}
                  className="grid grid-cols-[9.5rem_minmax(0,1fr)] items-start gap-4"
                >
                  <dt className="text-muted-foreground flex items-center gap-3 font-medium">
                    <Icon className="size-4" />
                    {field.label}
                  </dt>
                  <dd className="min-w-0 truncate font-medium">
                    {field.value}
                  </dd>
                </div>
              );
            })}
          </dl>

          <Separator />

          <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start 2xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="flex flex-col gap-6">
              <SubscriptionMetricsSection />

              <DetailSection
                title="Transactions"
                description="Money movement and adjustments generated by the subscription."
              >
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/25 hover:bg-muted/25">
                      <TableHead className="w-[140px] px-4">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment ID</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                      <TableHead className="w-10">
                        <span className="sr-only">Download</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="px-4 py-3 font-medium tabular-nums">
                          {transaction.amount}
                        </TableCell>
                        <TableCell className="py-3">
                          <TableStatusBadge status={transaction.status} />
                        </TableCell>
                        <TableCell className="py-3">
                          <span className="block truncate font-medium tabular-nums">
                            {transaction.id}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground py-3">
                          {transaction.method}
                        </TableCell>
                        <TableCell className="text-muted-foreground py-3 text-right">
                          {transaction.date}
                        </TableCell>
                        <TableCell className="py-3 pr-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-md"
                          >
                            <Download />
                            <span className="sr-only">
                              Download {transaction.id}
                            </span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  currentPage={transactionPage}
                  pageSize={transactionPageSize}
                  setCurrentPage={setTransactionPage}
                  totalItems={transactions.length}
                />
              </DetailSection>

              <DetailSection
                title="Subscribers"
                description="Seats currently attached to this subscription."
              >
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/25 hover:bg-muted/25">
                      <TableHead>Subscriber</TableHead>
                      <TableHead>Subscriber ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Start date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleSubscribers.map((subscriber) => (
                      <TableRow key={subscriber.email}>
                        <TableCell>
                          <div className="flex min-w-0 items-center gap-3">
                            <Avatar className="size-8 border">
                              <AvatarImage
                                src={subscriber.avatar}
                                alt={subscriber.name}
                              />
                              <AvatarFallback className="text-xs font-semibold">
                                {subscriber.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate font-medium">
                                {subscriber.name}
                              </p>
                              <p className="text-muted-foreground truncate text-xs">
                                {subscriber.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium tabular-nums">
                          {subscriber.id}
                        </TableCell>
                        <TableCell>
                          <TableStatusBadge status={subscriber.status} />
                        </TableCell>
                        <TableCell className="text-muted-foreground text-right">
                          {subscriber.startDate}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  currentPage={subscriberPage}
                  pageSize={subscriberPageSize}
                  setCurrentPage={setSubscriberPage}
                  totalItems={subscribers.length}
                />
              </DetailSection>

              <DetailSection
                title="Discounts"
                description="Coupons, credits, and reductions applied to renewals."
              >
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/25 hover:bg-muted/25">
                      <TableHead>Discount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Applies to</TableHead>
                      <TableHead className="text-right">Ends</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {discounts.map((discount) => (
                      <TableRow key={discount.code}>
                        <TableCell>
                          <div className="flex min-w-0 items-center gap-2">
                            <TicketPercent className="text-muted-foreground size-4 shrink-0" />
                            <span className="truncate font-medium">
                              {discount.code}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <TableStatusBadge status={discount.status} />
                        </TableCell>
                        <TableCell>{discount.value}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {discount.appliesTo}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-right">
                          {discount.expires}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </DetailSection>
            </div>

            <aside className="xl:flex xl:justify-end">
              <RenewalHeatmap />
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
