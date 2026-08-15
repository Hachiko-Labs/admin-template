"use client";

import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  ListFilter,
  RefreshCcw,
  Repeat2,
  Search,
  XCircle,
} from "lucide-react";
import * as React from "react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  email: string;
  amount: string;
  type: TransactionType;
  method: string;
  status: TransactionStatus;
  date: string;
  dateTime: string;
};

const pageSize = 10;

const transactionStatuses: TransactionStatus[] = [
  "succeeded",
  "pending",
  "upcoming",
  "failed",
  "refunded",
];

const transactions: PaymentTransaction[] = [
  {
    id: "pay_ONfo2IcWuYXSl1Zu4DLj4",
    customer: "Mara Finch",
    email: "mara@northline.co",
    amount: "$2,840.00",
    type: "Checkout",
    method: "Visa ending 4928",
    status: "succeeded",
    date: "12 minutes ago",
    dateTime: "2026-05-29T09:18:00+05:30",
  },
  {
    id: "pay_ONfo13LR30lnWj5e1r6z4",
    customer: "Helio Supply",
    email: "billing@helio.supply",
    amount: "$8,120.50",
    type: "Invoice",
    method: "ACH debit",
    status: "pending",
    date: "34 minutes ago",
    dateTime: "2026-05-29T08:56:00+05:30",
  },
  {
    id: "pay_ONfg1nfxqqgDQjMF5AH4A",
    customer: "Rune Atelier",
    email: "ops@runeatelier.com",
    amount: "-$429.18",
    type: "Refund",
    method: "Mastercard ending 1882",
    status: "refunded",
    date: "1 hour ago",
    dateTime: "2026-05-29T08:12:00+05:30",
  },
  {
    id: "pay_ONffQWSDb7NSB5maNgwNa",
    customer: "Atlas Coffee",
    email: "finance@atlas.coffee",
    amount: "$1,204.90",
    type: "Subscription",
    method: "Apple Pay",
    status: "upcoming",
    date: "Tomorrow",
    dateTime: "2026-06-16T09:30:00+05:30",
  },
  {
    id: "pay_ONff4XaC6KNQ1ihjUB4Zp",
    customer: "Cedar Labs",
    email: "ap@cedarlabs.dev",
    amount: "$642.00",
    type: "Checkout",
    method: "Amex ending 3007",
    status: "failed",
    date: "3 hours ago",
    dateTime: "2026-05-29T06:21:00+05:30",
  },
  {
    id: "pay_ONfeuGoggVDl8o3X5mR4N",
    customer: "Northstar Media",
    email: "billing@northstar.media",
    amount: "$5,980.00",
    type: "Invoice",
    method: "Bank transfer",
    status: "succeeded",
    date: "4 hours ago",
    dateTime: "2026-05-29T05:19:00+05:30",
  },
  {
    id: "pay_ONfcVjlgA0p4SUeUypZTu",
    customer: "Sable Market",
    email: "pay@sable.market",
    amount: "$319.40",
    type: "Checkout",
    method: "Google Pay",
    status: "pending",
    date: "5 hours ago",
    dateTime: "2026-05-29T04:01:00+05:30",
  },
  {
    id: "pay_ONfcOVCpuLkOzXWzL5nSK",
    customer: "Verdant Systems",
    email: "receipts@verdant.systems",
    amount: "$11,240.00",
    type: "Subscription",
    method: "Visa ending 7712",
    status: "upcoming",
    date: "Jun 18",
    dateTime: "2026-06-18T10:00:00+05:30",
  },
  {
    id: "pay_ONfc7eMhOEoiY19Kgv6oq",
    customer: "Luma Studio",
    email: "billing@lumastudio.co",
    amount: "$67.21",
    type: "Subscription",
    method: "Card ending 1148",
    status: "succeeded",
    date: "Yesterday",
    dateTime: "2026-05-28T15:33:00+05:30",
  },
  {
    id: "pay_ONfc2dAHKfMQng8Vyg3L8",
    customer: "Orbit Works",
    email: "accounts@orbit.works",
    amount: "$6.72",
    type: "Subscription",
    method: "Card ending 6031",
    status: "succeeded",
    date: "Yesterday",
    dateTime: "2026-05-28T14:10:00+05:30",
  },
  {
    id: "pay_ONfbxWZ8Ac1mQFeuR74sP",
    customer: "Copper Hill",
    email: "payments@copperhill.com",
    amount: "$1,860.00",
    type: "Invoice",
    method: "ACH debit",
    status: "pending",
    date: "2 days ago",
    dateTime: "2026-05-27T19:25:00+05:30",
  },
  {
    id: "pay_ONfaP3xYCvR1N8sLqE02b",
    customer: "Fable Retail",
    email: "orders@fableretail.com",
    amount: "-$94.50",
    type: "Refund",
    method: "Visa ending 2250",
    status: "refunded",
    date: "3 days ago",
    dateTime: "2026-05-26T12:48:00+05:30",
  },
];

const statusMeta: Record<
  TransactionStatus,
  {
    label: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    className: string;
  }
> = {
  succeeded: {
    label: "Successful",
    icon: CheckCircle2,
    className:
      "border-emerald-600/20 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-400/20",
  },
  pending: {
    label: "Pending",
    icon: Clock3,
    className:
      "border-amber-600/20 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-400/20",
  },
  upcoming: {
    label: "Upcoming",
    icon: Clock3,
    className:
      "border-violet-600/20 bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-400/20",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    className:
      "border-rose-600/20 bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-400/20",
  },
  refunded: {
    label: "Refunded",
    icon: RefreshCcw,
    className:
      "border-sky-600/20 bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-400/20",
  },
};

function formatShortDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function TransactionSpreadsheetCell({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        "group-hover:bg-muted/60 h-11 border-r border-b px-4 align-middle text-sm text-zinc-700 transition-colors dark:text-zinc-300",
        className,
      )}
      {...props}
    >
      {props.children}
    </td>
  );
}

function StatusBadge({ status }: { status: TransactionStatus }) {
  const meta = statusMeta[status];
  const StatusIcon = meta.icon;

  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-md border px-2 text-[11px] font-medium",
        meta.className,
      )}
    >
      <StatusIcon className="size-3.5" aria-hidden="true" />
      <span>{meta.label}</span>
    </span>
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

export function PaymentProcessorTransactionsList2({
  className,
}: {
  className?: string;
}) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [query, setQuery] = React.useState("");
  const [selectedStatuses, setSelectedStatuses] = React.useState<
    TransactionStatus[]
  >([]);
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();

  const statusFilterLabel =
    selectedStatuses.length === 0
      ? "Status"
      : selectedStatuses.length === 1
        ? statusMeta[selectedStatuses[0]].label
        : `${selectedStatuses.length} statuses`;

  const dateFilterLabel =
    dateRange?.from && dateRange.to
      ? `${formatShortDate(dateRange.from)} - ${formatShortDate(dateRange.to)}`
      : dateRange?.from
        ? `From ${formatShortDate(dateRange.from)}`
        : "Date Range";

  const filteredTransactions = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const rangeStart = dateRange?.from;
    const rangeEnd = dateRange?.to;

    return transactions.filter((transaction) => {
      const searchableText = [
        transaction.id,
        transaction.customer,
        transaction.email,
        transaction.amount,
        transaction.type,
        transaction.method,
        transaction.status,
        transaction.date,
      ]
        .join(" ")
        .toLowerCase();
      const matchesQuery =
        normalizedQuery.length === 0 ||
        searchableText.includes(normalizedQuery);
      const matchesStatus =
        selectedStatuses.length === 0 ||
        selectedStatuses.includes(transaction.status);
      const createdDate = new Date(transaction.dateTime);
      const matchesDateStart = !rangeStart || createdDate >= rangeStart;
      const matchesDateEnd = !rangeEnd || createdDate <= rangeEnd;

      return (
        matchesQuery && matchesStatus && matchesDateStart && matchesDateEnd
      );
    });
  }, [dateRange, query, selectedStatuses]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [dateRange, query, selectedStatuses]);

  function toggleStatus(status: TransactionStatus) {
    setSelectedStatuses((currentStatuses) =>
      currentStatuses.includes(status)
        ? currentStatuses.filter((currentStatus) => currentStatus !== status)
        : [...currentStatuses, status],
    );
  }

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

  return (
    <main
      className={cn(
        "bg-background text-foreground flex min-h-0 flex-1 overflow-hidden",
        className,
      )}
    >
      <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto">
        <div className="flex w-full min-w-0 flex-col">
          <section className="min-w-0 flex-1 pt-6 pb-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                <div>
                  <h2 className="text-base font-semibold">Transactions</h2>
                  <p className="text-muted-foreground text-sm">
                    {filteredTransactions.length} transaction records
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <div className="relative">
                    <Search
                      className="text-muted-foreground absolute top-1/2 left-4 size-4 -translate-y-1/2"
                      aria-hidden="true"
                    />
                    <Input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      type="search"
                      placeholder="Search transaction, ID, email..."
                      aria-label="Search transactions"
                      className="border-border bg-muted/40 placeholder:text-muted-foreground h-9 w-full rounded-md pl-10 text-sm font-medium shadow-none sm:w-[260px]"
                    />
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-9 justify-between rounded-md px-3 text-sm font-medium shadow-none"
                      >
                        {statusFilterLabel}
                        <ListFilter className="size-4" aria-hidden="true" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-56 p-2">
                      <div className="text-muted-foreground px-2 pt-1 pb-2 text-xs font-medium">
                        Filter by transaction status
                      </div>
                      <div className="space-y-1">
                        {transactionStatuses.map((status) => (
                          <label
                            key={status}
                            className="hover:bg-muted flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm font-medium"
                          >
                            <Checkbox
                              checked={selectedStatuses.includes(status)}
                              onCheckedChange={() => toggleStatus(status)}
                              aria-label={`Filter ${statusMeta[status].label} transactions`}
                            />
                            <StatusBadge status={status} />
                          </label>
                        ))}
                      </div>
                      {selectedStatuses.length > 0 ? (
                        <Button
                          type="button"
                          variant="ghost"
                          className="mt-2 h-8 w-full justify-start px-2 text-xs"
                          onClick={() => setSelectedStatuses([])}
                        >
                          Clear status filter
                        </Button>
                      ) : null}
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-9 rounded-md px-3 text-sm font-medium shadow-none"
                      >
                        <CalendarDays className="size-4" aria-hidden="true" />
                        <span className="max-w-[220px] truncate">
                          {dateFilterLabel}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto p-0">
                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                      />
                      {dateRange?.from ? (
                        <div className="border-border border-t p-2">
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-8 w-full justify-start px-2 text-xs"
                            onClick={() => setDateRange(undefined)}
                          >
                            Clear date range
                          </Button>
                        </div>
                      ) : null}
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="horizontal-scrollbar vertical-scrollbar overflow-auto">
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
                    {paginatedTransactions.length > 0 ? (
                      paginatedTransactions.map((transaction) => (
                        <tr key={transaction.id} className="group">
                          <TransactionSpreadsheetCell className="bg-background group-hover:bg-muted z-10 pl-4 font-medium text-zinc-900 sm:sticky sm:left-0 sm:pl-6 lg:pl-8 dark:text-zinc-100">
                            {transaction.amount}
                          </TransactionSpreadsheetCell>
                          <TransactionSpreadsheetCell>
                            <StatusBadge status={transaction.status} />
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
                      ))
                    ) : (
                      <tr>
                        <TransactionSpreadsheetCell
                          className="h-32 border-r-0 text-center"
                          colSpan={8}
                        >
                          No transactions match the current filters.
                        </TransactionSpreadsheetCell>
                      </tr>
                    )}
                  </tbody>
                </table>
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
