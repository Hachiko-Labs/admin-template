"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  RefreshCcw,
  Repeat2,
  Search,
  XCircle,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type TransactionStatus =
  | "succeeded"
  | "pending"
  | "upcoming"
  | "failed"
  | "refunded";
type TransactionType = "Checkout" | "Invoice" | "Subscription" | "Refund";

type PaymentTransaction = {
  id: string;
  customer: string;
  initials: string;
  email: string;
  amount: string;
  type: TransactionType;
  method: string;
  status: TransactionStatus;
  processor: string;
  date: string;
  dateTime: string;
};

const transactionTabs = [
  { label: "All", title: "Latest Transactions", value: "all" },
  { label: "Successful", title: "Successful Transactions", value: "succeeded" },
  { label: "Pending", title: "Pending Transactions", value: "pending" },
  { label: "Upcoming", title: "Upcoming Transactions", value: "upcoming" },
  { label: "Refunded", title: "Refunded Transactions", value: "refunded" },
  { label: "Failed", title: "Failed Transactions", value: "failed" },
] as const;

type TransactionTab = (typeof transactionTabs)[number]["value"];

const stats = [
  {
    label: "Payments",
    value: "$387,291.84",
    delta: "+12.4%",
    trend: "up",
  },
  {
    label: "Refunds",
    value: "$11,320.68",
    delta: "-2.4%",
    trend: "down",
  },
  {
    label: "Disputes",
    value: "$3,418.90",
    delta: "+$642.00",
    trend: "negative",
  },
] as const;

const transactions: PaymentTransaction[] = [
  {
    id: "pay_ONfo2IcWuYXSl1Zu4DLj4",
    customer: "Mara Finch",
    initials: "MF",
    email: "mara@northline.co",
    amount: "$2,840.00",
    type: "Checkout",
    method: "Visa ending 4928",
    status: "succeeded",
    processor: "Stripe",
    date: "12 minutes ago",
    dateTime: "2026-05-29T09:18:00+05:30",
  },
  {
    id: "pay_ONfo13LR30lnWj5e1r6z4",
    customer: "Helio Supply",
    initials: "HS",
    email: "billing@helio.supply",
    amount: "$8,120.50",
    type: "Invoice",
    method: "ACH debit",
    status: "pending",
    processor: "Adyen",
    date: "34 minutes ago",
    dateTime: "2026-05-29T08:56:00+05:30",
  },
  {
    id: "pay_ONfg1nfxqqgDQjMF5AH4A",
    customer: "Rune Atelier",
    initials: "RA",
    email: "ops@runeatelier.com",
    amount: "-$429.18",
    type: "Refund",
    method: "Mastercard ending 1882",
    status: "refunded",
    processor: "Stripe",
    date: "1 hour ago",
    dateTime: "2026-05-29T08:12:00+05:30",
  },
  {
    id: "pay_ONffQWSDb7NSB5maNgwNa",
    customer: "Atlas Coffee",
    initials: "AC",
    email: "finance@atlas.coffee",
    amount: "$1,204.90",
    type: "Subscription",
    method: "Apple Pay",
    status: "upcoming",
    processor: "Braintree",
    date: "Tomorrow",
    dateTime: "2026-06-16T09:30:00+05:30",
  },
  {
    id: "pay_ONff4XaC6KNQ1ihjUB4Zp",
    customer: "Cedar Labs",
    initials: "CL",
    email: "ap@cedarlabs.dev",
    amount: "$642.00",
    type: "Checkout",
    method: "Amex ending 3007",
    status: "failed",
    processor: "Stripe",
    date: "3 hours ago",
    dateTime: "2026-05-29T06:21:00+05:30",
  },
  {
    id: "pay_ONfeuGoggVDl8o3X5mR4N",
    customer: "Northstar Media",
    initials: "NM",
    email: "billing@northstar.media",
    amount: "$5,980.00",
    type: "Invoice",
    method: "Bank transfer",
    status: "succeeded",
    processor: "Adyen",
    date: "4 hours ago",
    dateTime: "2026-05-29T05:19:00+05:30",
  },
  {
    id: "pay_ONfcVjlgA0p4SUeUypZTu",
    customer: "Sable Market",
    initials: "SM",
    email: "pay@sable.market",
    amount: "$319.40",
    type: "Checkout",
    method: "Google Pay",
    status: "pending",
    processor: "Stripe",
    date: "5 hours ago",
    dateTime: "2026-05-29T04:01:00+05:30",
  },
  {
    id: "pay_ONfcOVCpuLkOzXWzL5nSK",
    customer: "Verdant Systems",
    initials: "VS",
    email: "receipts@verdant.systems",
    amount: "$11,240.00",
    type: "Subscription",
    method: "Visa ending 7712",
    status: "upcoming",
    processor: "Braintree",
    date: "Jun 18",
    dateTime: "2026-06-18T10:00:00+05:30",
  },
  {
    id: "pay_ONfc7eMhOEoiY19Kgv6oq",
    customer: "Luma Studio",
    initials: "LS",
    email: "billing@lumastudio.co",
    amount: "$67.21",
    type: "Subscription",
    method: "Card ending 1148",
    status: "succeeded",
    processor: "Stripe",
    date: "Yesterday",
    dateTime: "2026-05-28T15:33:00+05:30",
  },
  {
    id: "pay_ONfc2dAHKfMQng8Vyg3L8",
    customer: "Orbit Works",
    initials: "OW",
    email: "accounts@orbit.works",
    amount: "$6.72",
    type: "Subscription",
    method: "Card ending 6031",
    status: "succeeded",
    processor: "Stripe",
    date: "Yesterday",
    dateTime: "2026-05-28T14:10:00+05:30",
  },
  {
    id: "pay_ONfbxWZ8Ac1mQFeuR74sP",
    customer: "Copper Hill",
    initials: "CH",
    email: "payments@copperhill.com",
    amount: "$1,860.00",
    type: "Invoice",
    method: "ACH debit",
    status: "pending",
    processor: "Adyen",
    date: "2 days ago",
    dateTime: "2026-05-27T19:25:00+05:30",
  },
  {
    id: "pay_ONfbKVq9eM7BzT5gJ1xUa",
    customer: "Prism Labs",
    initials: "PL",
    email: "finance@prismlabs.dev",
    amount: "$249.00",
    type: "Checkout",
    method: "UPI",
    status: "succeeded",
    processor: "Razorpay",
    date: "2 days ago",
    dateTime: "2026-05-27T16:12:00+05:30",
  },
  {
    id: "pay_ONfaP3xYCvR1N8sLqE02b",
    customer: "Fable Retail",
    initials: "FR",
    email: "orders@fableretail.com",
    amount: "-$94.50",
    type: "Refund",
    method: "Visa ending 2250",
    status: "refunded",
    processor: "Stripe",
    date: "3 days ago",
    dateTime: "2026-05-26T12:48:00+05:30",
  },
  {
    id: "pay_ONfZtB0pL4Hca9RkW8QmN",
    customer: "Harbor Analytics",
    initials: "HA",
    email: "ap@harboranalytics.io",
    amount: "$4,520.00",
    type: "Invoice",
    method: "Bank transfer",
    status: "succeeded",
    processor: "Braintree",
    date: "3 days ago",
    dateTime: "2026-05-26T09:17:00+05:30",
  },
  {
    id: "pay_ONfYx79LsDaN42qVc6hRe",
    customer: "Metric Foundry",
    initials: "MF",
    email: "receipts@metricfoundry.com",
    amount: "$780.30",
    type: "Checkout",
    method: "Mastercard ending 6204",
    status: "failed",
    processor: "Stripe",
    date: "4 days ago",
    dateTime: "2026-05-25T21:04:00+05:30",
  },
  {
    id: "pay_ONfXgD5KR0vLmJ93TnH2c",
    customer: "Clearpath AI",
    initials: "CA",
    email: "billing@clearpath.ai",
    amount: "$2,190.00",
    type: "Subscription",
    method: "Amex ending 9091",
    status: "succeeded",
    processor: "Adyen",
    date: "4 days ago",
    dateTime: "2026-05-25T18:40:00+05:30",
  },
  {
    id: "pay_ONfWq64JePV8rGxABs3uD",
    customer: "Beacon Foods",
    initials: "BF",
    email: "payments@beaconfoods.co",
    amount: "$536.80",
    type: "Checkout",
    method: "Google Pay",
    status: "succeeded",
    processor: "Stripe",
    date: "5 days ago",
    dateTime: "2026-05-24T13:55:00+05:30",
  },
  {
    id: "pay_ONfVdJY0T3pCw8zM1EbQa",
    customer: "Novel Systems",
    initials: "NS",
    email: "billing@novelsystems.com",
    amount: "$3,760.10",
    type: "Invoice",
    method: "ACH debit",
    status: "pending",
    processor: "Braintree",
    date: "6 days ago",
    dateTime: "2026-05-23T10:21:00+05:30",
  },
  {
    id: "pay_ONfUK2mHs5Aa9YpQvL6iN",
    customer: "Summit Care",
    initials: "SC",
    email: "invoices@summitcare.org",
    amount: "$1,048.00",
    type: "Subscription",
    method: "Visa ending 4105",
    status: "succeeded",
    processor: "Stripe",
    date: "1 week ago",
    dateTime: "2026-05-22T15:11:00+05:30",
  },
  {
    id: "pay_ONfTqW4zRe8Yc6JpB0MnL",
    customer: "Aster Finance",
    initials: "AF",
    email: "ops@asterfinance.com",
    amount: "-$312.00",
    type: "Refund",
    method: "Card ending 7719",
    status: "refunded",
    processor: "Stripe",
    date: "1 week ago",
    dateTime: "2026-05-21T17:36:00+05:30",
  },
];

const pageSize = 10;

const statusMeta: Record<
  TransactionStatus,
  {
    label: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    className: string;
    dotClassName: string;
  }
> = {
  succeeded: {
    label: "Successful",
    icon: CheckCircle2,
    className:
      "border-emerald-600/20 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-400/20",
    dotClassName: "bg-emerald-600 dark:bg-emerald-400",
  },
  pending: {
    label: "Pending",
    icon: Clock3,
    className:
      "border-amber-600/20 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-400/20",
    dotClassName: "bg-amber-600 dark:bg-amber-400",
  },
  upcoming: {
    label: "Upcoming",
    icon: Clock3,
    className:
      "border-violet-600/20 bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-400/20",
    dotClassName: "bg-violet-600 dark:bg-violet-400",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    className:
      "border-rose-600/20 bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-400/20",
    dotClassName: "bg-rose-600 dark:bg-rose-400",
  },
  refunded: {
    label: "Refunded",
    icon: RefreshCcw,
    className:
      "border-sky-600/20 bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-400/20",
    dotClassName: "bg-sky-600 dark:bg-sky-400",
  },
};

function TransactionSpreadsheetCell(props: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td
      className={cn(
        "group-hover:bg-muted/60 h-11 border-r border-b px-4 align-middle text-sm text-zinc-700 transition-colors dark:text-zinc-300",
        props.className,
      )}
    >
      {props.children}
    </td>
  );
}

function PaymentIdText({ id }: { id: string }) {
  return (
    <code className="bg-muted text-foreground rounded-md border px-2 py-1 font-mono text-[12px] font-medium">
      {id}
    </code>
  );
}

function PaymentMethodCell({ method }: { method: string }) {
  const [label, ...details] = method.split(" ");
  const rawDetail = details.join(" ");
  const isCard = /^ending\b/i.test(rawDetail);

  if (!isCard) {
    return (
      <div className="flex min-w-max items-baseline gap-2 whitespace-nowrap">
        <span className="text-foreground text-sm font-semibold">{method}</span>
      </div>
    );
  }

  const detail = rawDetail.replace(/^ending\s+/i, "**** ");

  return (
    <div className="flex min-w-max items-baseline gap-2 whitespace-nowrap">
      <span className="text-foreground text-sm font-semibold uppercase">
        {label}
      </span>
      {detail ? (
        <span className="text-muted-foreground text-xs capitalize">
          {detail}
        </span>
      ) : null}
    </div>
  );
}

function PricingTypeBadge({ type }: { type: TransactionType }) {
  const isSubscription = type === "Subscription";
  const Icon = isSubscription ? Repeat2 : CreditCard;

  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs font-semibold",
        isSubscription
          ? "border-primary/25 bg-primary/10 text-primary"
          : "border-zinc-300 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-300",
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {isSubscription ? "Subscription" : "One-time"}
    </span>
  );
}

export function PaymentProcessorTransactions({
  className,
}: {
  className?: string;
}) {
  const [activeTab, setActiveTab] = React.useState<TransactionTab>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);

  const filteredTransactions = React.useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesTab =
        activeTab === "all" || transaction.status === activeTab;
      const searchableText = [
        transaction.id,
        transaction.customer,
        transaction.email,
        transaction.amount,
        transaction.type,
        transaction.method,
        transaction.status,
        transaction.processor,
        transaction.date,
      ]
        .join(" ")
        .toLowerCase();
      const matchesSearch =
        normalizedQuery.length === 0 ||
        searchableText.includes(normalizedQuery);

      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchQuery]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTransactions.length / pageSize),
  );
  const paginatedTransactions = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;

    return filteredTransactions.slice(start, start + pageSize);
  }, [currentPage, filteredTransactions]);
  const paginationStart =
    filteredTransactions.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const paginationEnd = Math.min(
    currentPage * pageSize,
    filteredTransactions.length,
  );

  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  React.useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const tableTitle =
    transactionTabs.find((tab) => tab.value === activeTab)?.title ??
    "Latest Transactions";

  return (
    <main
      className={cn(
        "bg-background text-foreground flex min-h-0 flex-1 overflow-hidden",
        className,
      )}
    >
      <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto">
        <div className="flex w-full min-w-0 flex-col">
          <section className="border-b">
            <div className="bg-muted/30 relative isolate overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-full left-1/2 -z-10 -mt-14 aspect-[1154/678] w-[82rem] -translate-x-1/2 transform-gpu opacity-55 blur-3xl"
              >
                <div
                  className="size-full"
                  style={{
                    background:
                      "linear-gradient(to bottom right, color-mix(in oklch, var(--primary) 18%, var(--background)), color-mix(in oklch, var(--primary) 28%, var(--muted)))",
                    clipPath:
                      "polygon(100% 38.5%, 82.6% 100%, 60.2% 37.7%, 52.4% 32.1%, 47.5% 41.8%, 45.2% 65.6%, 27.5% 23.4%, 0.1% 35.3%, 17.9% 0%, 27.7% 23.4%, 76.2% 2.5%, 74.2% 56%, 100% 38.5%)",
                  }}
                />
              </div>

              <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="flex flex-wrap items-center gap-x-3 text-lg leading-7 font-semibold">
                    Transactions
                  </h2>
                  <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
                    Track payment activity, refunds, disputes, and processor
                    outcomes in one place.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex rounded-full bg-emerald-100 p-1 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                    <span className="size-2 rounded-full bg-current" />
                  </span>
                  <h2 className="flex flex-wrap items-center gap-x-3 text-sm leading-7">
                    <span className="font-semibold">Live Mode</span>
                  </h2>
                </div>
              </div>
            </div>

            <div className="bg-muted/30 relative grid grid-cols-1 overflow-hidden sm:grid-cols-3">
              {stats.map((stat, index) => {
                const isNegative = stat.trend === "negative";
                const TrendIcon =
                  stat.trend === "down" ? ArrowDownRight : ArrowUpRight;

                return (
                  <div
                    className={cn(
                      "relative border-t px-4 py-7 sm:px-6 lg:px-8",
                      index > 0 && "sm:border-l",
                    )}
                    key={stat.label}
                  >
                    <p className="text-muted-foreground text-sm font-medium">
                      {stat.label}
                    </p>
                    <div className="mt-6 flex items-baseline gap-3">
                      <p className="text-foreground text-4xl font-semibold tracking-normal">
                        {stat.value}
                      </p>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-xs font-semibold",
                          isNegative ? "text-rose-600" : "text-emerald-600",
                        )}
                      >
                        <TrendIcon className="size-3.5" aria-hidden="true" />
                        {stat.delta}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
          <nav className="bg-background border-b">
            <div className="flex min-w-full items-center gap-6 overflow-x-auto px-4 sm:px-6 lg:px-8">
              {transactionTabs.map((tab) => (
                <button
                  className={cn(
                    "text-muted-foreground inline-flex h-12 shrink-0 items-center border-b-2 border-transparent text-sm font-semibold transition-colors",
                    activeTab === tab.value
                      ? "border-foreground text-foreground"
                      : "hover:text-foreground",
                  )}
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  type="button"
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>

          <section className="min-w-0 flex-1 py-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                <div>
                  <h2 className="text-base font-semibold">{tableTitle}</h2>
                  <p className="text-muted-foreground text-sm">
                    {filteredTransactions.length} matching transactions
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="relative">
                    <Search
                      className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                      aria-hidden="true"
                    />
                    <Input
                      className="h-9 w-full pl-9 sm:w-72"
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search transactions"
                      type="search"
                      value={searchQuery}
                    />
                  </div>
                </div>
              </div>

              <div className="horizontal-scrollbar vertical-scrollbar overflow-auto">
                {filteredTransactions.length === 0 ? (
                  <div className="bg-background flex min-h-[220px] items-center justify-center border-b px-6 py-10">
                    <p className="text-muted-foreground text-sm">
                      No transactions found.
                    </p>
                  </div>
                ) : (
                  <table className="bg-background w-full min-w-[1340px] border-separate border-spacing-0">
                    <thead className="sticky top-0 z-20">
                      <tr>
                        {[
                          ["Amount", "min-w-52"],
                          ["Status", "min-w-40"],
                          ["Payment ID", "min-w-72"],
                          ["Payment Method", "min-w-60"],
                          ["Pricing Type", "min-w-48"],
                          ["Customer Email", "min-w-72"],
                          ["Date (UTC)", "min-w-48"],
                          ["Refund", "min-w-48 border-r-0"],
                        ].map(([label, width], index) => (
                          <th
                            key={label}
                            className={cn(
                              "bg-muted/40 text-foreground sticky top-0 z-20 h-12 border-y border-r px-4 text-left text-[13px] font-semibold backdrop-blur",
                              index === 0 &&
                                "z-30 pl-4 sm:left-0 sm:pl-6 lg:pl-8",
                              width,
                            )}
                          >
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedTransactions.map((transaction) => {
                        const meta = statusMeta[transaction.status];
                        const StatusIcon = meta.icon;

                        return (
                          <tr key={transaction.id} className="group">
                            <TransactionSpreadsheetCell className="bg-background group-hover:bg-muted z-10 pl-4 font-medium text-zinc-900 sm:sticky sm:left-0 sm:pl-6 lg:pl-8 dark:text-zinc-100">
                              {transaction.amount}
                            </TransactionSpreadsheetCell>
                            <TransactionSpreadsheetCell>
                              <span
                                className={cn(
                                  "inline-flex h-6 items-center gap-1.5 rounded-md border px-2 text-[11px] font-medium",
                                  meta.className,
                                )}
                              >
                                <StatusIcon
                                  className="size-3.5"
                                  aria-hidden="true"
                                />
                                <span>{meta.label}</span>
                              </span>
                            </TransactionSpreadsheetCell>
                            <TransactionSpreadsheetCell>
                              <PaymentIdText id={transaction.id} />
                            </TransactionSpreadsheetCell>
                            <TransactionSpreadsheetCell>
                              <PaymentMethodCell method={transaction.method} />
                            </TransactionSpreadsheetCell>
                            <TransactionSpreadsheetCell>
                              <PricingTypeBadge type={transaction.type} />
                            </TransactionSpreadsheetCell>
                            <TransactionSpreadsheetCell>
                              <span className="decoration-muted-foreground/40 underline decoration-dotted underline-offset-4">
                                {transaction.email}
                              </span>
                            </TransactionSpreadsheetCell>
                            <TransactionSpreadsheetCell>
                              <time dateTime={transaction.dateTime}>
                                {transaction.date}
                              </time>
                            </TransactionSpreadsheetCell>
                            <TransactionSpreadsheetCell className="border-r-0">
                              <Button
                                className="h-7 rounded-md px-2.5 text-[12px] font-medium shadow-none"
                                variant="secondary"
                              >
                                Initiate Refund
                              </Button>
                            </TransactionSpreadsheetCell>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="flex flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                <p className="text-muted-foreground text-sm">
                  Showing {paginationStart}-{paginationEnd} of{" "}
                  {filteredTransactions.length} transactions
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    className="h-8 gap-1"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <ChevronLeft className="size-4" aria-hidden="true" />
                    Previous
                  </Button>
                  <span className="text-muted-foreground min-w-16 text-center text-sm">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    className="h-8 gap-1"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    Next
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
