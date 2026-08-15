"use client";

import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Columns3,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "paused"
  | "cancelled";

type PaymentSubscription = {
  productName: string;
  customerEmail: string;
  status: SubscriptionStatus;
  nextBillingAmount: string;
  subscriptionId: string;
  nextBillingDate: string;
  nextBillingDateTime?: string;
  quantity: number;
  startDate: string;
  startDateTime: string;
};

const pageSize = 10;
const statusOptions: SubscriptionStatus[] = [
  "active",
  "trialing",
  "past_due",
  "paused",
  "cancelled",
];

type BillingWindow = "all" | "upcoming" | "attention" | "ended";
type SubscriptionColumnKey =
  | "productName"
  | "customerEmail"
  | "status"
  | "nextBillingAmount"
  | "subscriptionId"
  | "nextBillingDate"
  | "quantity"
  | "startDate";

const billingWindowLabels: Record<BillingWindow, string> = {
  all: "All billing windows",
  upcoming: "Upcoming renewals",
  attention: "Needs attention",
  ended: "Paused or cancelled",
};

const subscriptionColumns: {
  key: SubscriptionColumnKey;
  label: string;
  className: string;
  pinned?: boolean;
}[] = [
  {
    key: "productName",
    label: "Product Name",
    className: "min-w-[360px]",
    pinned: true,
  },
  { key: "customerEmail", label: "Customer Email", className: "min-w-80" },
  { key: "status", label: "Status", className: "min-w-52" },
  {
    key: "nextBillingAmount",
    label: "Next Billing Amount (excl. tax)",
    className: "min-w-72",
  },
  { key: "subscriptionId", label: "Subscription ID", className: "min-w-96" },
  { key: "nextBillingDate", label: "Next Billing Date", className: "min-w-56" },
  { key: "quantity", label: "Quantity", className: "min-w-40" },
  { key: "startDate", label: "Start Date", className: "min-w-56 border-r-0" },
];

const subscriptions: PaymentSubscription[] = [
  {
    productName: "Shadcnblocks Pro Monthly",
    customerEmail: "avery.stone@northledger.io",
    status: "active",
    nextBillingAmount: "$29.00",
    subscriptionId: "sub_SB8qL2nV5xR0pHcK7dMzA",
    nextBillingDate: "30 Jun, 9:24 am",
    nextBillingDateTime: "2026-06-30T09:24:00Z",
    quantity: 3,
    startDate: "30 May, 9:24 am",
    startDateTime: "2026-05-30T09:24:00Z",
  },
  {
    productName: "Shadcnblocks Team Yearly",
    customerEmail: "billing@juniperlabs.dev",
    status: "active",
    nextBillingAmount: "$348.00",
    subscriptionId: "sub_SB3vC9aT1mQ6rYpE4wJnL",
    nextBillingDate: "18 May, 2:11 pm",
    nextBillingDateTime: "2027-05-18T14:11:00Z",
    quantity: 8,
    startDate: "18 May, 2:11 pm",
    startDateTime: "2026-05-18T14:11:00Z",
  },
  {
    productName: "Shadcnblocks Studio Monthly",
    customerEmail: "maya.chen@solstice.co",
    status: "past_due",
    nextBillingAmount: "$79.00",
    subscriptionId: "sub_SB9dN4kX7pB2tUaR5cFqV",
    nextBillingDate: "-",
    quantity: 5,
    startDate: "12 May, 6:48 pm",
    startDateTime: "2026-05-12T18:48:00Z",
  },
  {
    productName: "Shadcnblocks Starter Monthly",
    customerEmail: "accounts@driftsupply.com",
    status: "trialing",
    nextBillingAmount: "$12.00",
    subscriptionId: "sub_SB1pG8wL0zK5nVdC2eHsM",
    nextBillingDate: "11 Jun, 8:05 am",
    nextBillingDateTime: "2026-06-11T08:05:00Z",
    quantity: 1,
    startDate: "28 May, 8:05 am",
    startDateTime: "2026-05-28T08:05:00Z",
  },
  {
    productName: "Shadcnblocks Agency Yearly",
    customerEmail: "theo.ramirez@fieldnote.app",
    status: "active",
    nextBillingAmount: "$1,188.00",
    subscriptionId: "sub_SB6hW2sA9qT4mNfP7yDxK",
    nextBillingDate: "4 Apr, 11:36 am",
    nextBillingDateTime: "2027-04-04T11:36:00Z",
    quantity: 12,
    startDate: "4 Apr, 11:36 am",
    startDateTime: "2026-04-04T11:36:00Z",
  },
  {
    productName: "Shadcnblocks Components Monthly",
    customerEmail: "finance@orbitkitchen.co",
    status: "paused",
    nextBillingAmount: "$19.00",
    subscriptionId: "sub_SB5kR0pD8vL3xQnC6aMzY",
    nextBillingDate: "-",
    quantity: 2,
    startDate: "27 Mar, 4:52 pm",
    startDateTime: "2026-03-27T16:52:00Z",
  },
  {
    productName: "Shadcnblocks Admin Kit Monthly",
    customerEmail: "priya.nair@evermint.in",
    status: "active",
    nextBillingAmount: "$49.00",
    subscriptionId: "sub_SB2mJ6cV9nW1qLpT8eAhF",
    nextBillingDate: "22 Jun, 7:17 pm",
    nextBillingDateTime: "2026-06-22T19:17:00Z",
    quantity: 4,
    startDate: "22 May, 7:17 pm",
    startDateTime: "2026-05-22T19:17:00Z",
  },
  {
    productName: "Shadcnblocks Enterprise Monthly",
    customerEmail: "receipts@harbornine.com",
    status: "active",
    nextBillingAmount: "$249.00",
    subscriptionId: "sub_SB7tE1qK4xY9rCpN0dLsB",
    nextBillingDate: "14 Jun, 12:40 pm",
    nextBillingDateTime: "2026-06-14T12:40:00Z",
    quantity: 15,
    startDate: "14 May, 12:40 pm",
    startDateTime: "2026-05-14T12:40:00Z",
  },
  {
    productName: "Shadcnblocks Templates Yearly",
    customerEmail: "nolan@redwoodmetrics.ai",
    status: "cancelled",
    nextBillingAmount: "$228.00",
    subscriptionId: "sub_SB0aF3yM8dV6hRwP2nQxJ",
    nextBillingDate: "-",
    quantity: 6,
    startDate: "2 Mar, 5:08 am",
    startDateTime: "2026-03-02T05:08:00Z",
  },
  {
    productName: "Shadcnblocks Blocks Monthly",
    customerEmail: "ops@cobaltpress.studio",
    status: "past_due",
    nextBillingAmount: "$39.00",
    subscriptionId: "sub_SB4nZ7xC1qH8pTdL5sVwR",
    nextBillingDate: "-",
    quantity: 3,
    startDate: "17 Feb, 10:33 pm",
    startDateTime: "2026-02-17T22:33:00Z",
  },
  {
    productName: "Shadcnblocks Docs Monthly",
    customerEmail: "elena.frost@grainpath.com",
    status: "active",
    nextBillingAmount: "$9.00",
    subscriptionId: "sub_SB9wL5eA2rK7mQpD0xNhT",
    nextBillingDate: "8 Jun, 3:58 pm",
    nextBillingDateTime: "2026-06-08T15:58:00Z",
    quantity: 1,
    startDate: "8 May, 3:58 pm",
    startDateTime: "2026-05-08T15:58:00Z",
  },
  {
    productName: "Shadcnblocks Lifetime Support",
    customerEmail: "payables@mossandvale.co",
    status: "paused",
    nextBillingAmount: "$99.00",
    subscriptionId: "sub_SB1cP6uT4mX9vBnE8qLzH",
    nextBillingDate: "-",
    quantity: 2,
    startDate: "31 Jan, 1:19 pm",
    startDateTime: "2026-01-31T13:19:00Z",
  },
];

const statusMeta: Record<
  SubscriptionStatus,
  {
    label: string;
    className: string;
  }
> = {
  active: {
    label: "Active",
    className:
      "border-emerald-600/20 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  trialing: {
    label: "Trialing",
    className:
      "border-sky-600/20 bg-sky-50 text-sky-700 dark:border-sky-400/20 dark:bg-sky-900/30 dark:text-sky-400",
  },
  past_due: {
    label: "Past due",
    className:
      "border-amber-600/20 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-900/30 dark:text-amber-400",
  },
  paused: {
    label: "Paused",
    className:
      "border-zinc-300 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-300",
  },
  cancelled: {
    label: "Cancelled",
    className:
      "border-rose-600/20 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-900/30 dark:text-rose-400",
  },
};

function SubscriptionSpreadsheetCell(props: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td
      className={cn(
        "group-hover:bg-muted/60 h-14 border-r border-b px-4 align-middle text-sm text-zinc-700 transition-colors dark:text-zinc-300",
        props.className,
      )}
    >
      {props.children}
    </td>
  );
}

function HeaderMenuButton({ label }: { label: string }) {
  return (
    <Button
      aria-label={`Column options for ${label}`}
      className="text-muted-foreground size-7 shrink-0 shadow-none"
      size="icon"
      type="button"
      variant="ghost"
    >
      <MoreHorizontal className="size-4" aria-hidden="true" />
    </Button>
  );
}

function SubscriptionStatusBadge({ status }: { status: SubscriptionStatus }) {
  const meta = statusMeta[status];

  return (
    <Badge
      className={cn(
        "h-7 rounded-md px-2.5 text-xs font-medium shadow-none hover:bg-inherit",
        meta.className,
      )}
      variant="outline"
    >
      {meta.label}
    </Badge>
  );
}

export function PaymentProcessorSubscriptions({
  className,
}: {
  className?: string;
}) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [query, setQuery] = React.useState("");
  const [billingWindow, setBillingWindow] =
    React.useState<BillingWindow>("all");
  const [visibleStatuses, setVisibleStatuses] =
    React.useState<SubscriptionStatus[]>(statusOptions);
  const [visibleColumns, setVisibleColumns] = React.useState<
    SubscriptionColumnKey[]
  >(subscriptionColumns.map((column) => column.key));

  const filteredSubscriptions = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return subscriptions.filter((subscription) => {
      const matchesQuery =
        !normalizedQuery ||
        subscription.productName.toLowerCase().includes(normalizedQuery) ||
        subscription.customerEmail.toLowerCase().includes(normalizedQuery) ||
        subscription.subscriptionId.toLowerCase().includes(normalizedQuery);
      const matchesStatus = visibleStatuses.includes(subscription.status);
      const matchesBillingWindow =
        billingWindow === "all" ||
        (billingWindow === "upcoming" &&
          Boolean(subscription.nextBillingDateTime)) ||
        (billingWindow === "attention" &&
          ["past_due", "trialing"].includes(subscription.status)) ||
        (billingWindow === "ended" &&
          ["paused", "cancelled"].includes(subscription.status));

      return matchesQuery && matchesStatus && matchesBillingWindow;
    });
  }, [billingWindow, query, visibleStatuses]);
  const visibleColumnSet = React.useMemo(
    () => new Set(visibleColumns),
    [visibleColumns],
  );
  const activeFilterCount =
    (query.trim() ? 1 : 0) +
    (billingWindow !== "all" ? 1 : 0) +
    (visibleStatuses.length !== statusOptions.length ? 1 : 0);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredSubscriptions.length / pageSize),
  );
  const paginatedSubscriptions = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;

    return filteredSubscriptions.slice(start, start + pageSize);
  }, [currentPage, filteredSubscriptions]);
  const paginationStart =
    filteredSubscriptions.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const paginationEnd = Math.min(
    currentPage * pageSize,
    filteredSubscriptions.length,
  );

  React.useEffect(() => {
    setCurrentPage(1);
  }, [billingWindow, query, visibleStatuses]);

  React.useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  function toggleStatus(status: SubscriptionStatus) {
    setVisibleStatuses((current) =>
      current.includes(status)
        ? current.filter((item) => item !== status)
        : [...current, status],
    );
  }

  function toggleColumn(columnKey: SubscriptionColumnKey) {
    const column = subscriptionColumns.find((item) => item.key === columnKey);

    if (column?.pinned) {
      return;
    }

    setVisibleColumns((current) =>
      current.includes(columnKey)
        ? current.filter((item) => item !== columnKey)
        : [...current, columnKey],
    );
  }

  function clearFilters() {
    setQuery("");
    setBillingWindow("all");
    setVisibleStatuses(statusOptions);
  }

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
                  <h2 className="text-base font-semibold">Subscriptions</h2>
                  <p className="text-muted-foreground text-sm">
                    {subscriptions.length} customer subscriptions for
                    shadcnblocks.com products
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:min-w-[520px] sm:flex-row sm:items-center sm:justify-end">
                  <div className="relative min-w-0 flex-1 sm:max-w-72">
                    <Search
                      className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
                      aria-hidden="true"
                    />
                    <Input
                      aria-label="Search subscriptions"
                      className="h-9 pr-8 pl-9"
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search subscriptions..."
                      value={query}
                    />
                    {query ? (
                      <Button
                        aria-label="Clear subscription search"
                        className="absolute top-1/2 right-1 size-7 -translate-y-1/2"
                        onClick={() => setQuery("")}
                        size="icon"
                        type="button"
                        variant="ghost"
                      >
                        <X className="size-3.5" aria-hidden="true" />
                      </Button>
                    ) : null}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        className={cn(
                          "h-9 justify-between gap-2",
                          activeFilterCount > 0 && "border-primary/60",
                        )}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <SlidersHorizontal
                          className="size-4"
                          aria-hidden="true"
                        />
                        Filters
                        {activeFilterCount > 0 ? (
                          <Badge className="ml-1 h-5 rounded-md px-1.5 text-[10px]">
                            {activeFilterCount}
                          </Badge>
                        ) : null}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                      <DropdownMenuLabel>Status</DropdownMenuLabel>
                      {statusOptions.map((status) => (
                        <DropdownMenuCheckboxItem
                          key={status}
                          checked={visibleStatuses.includes(status)}
                          onCheckedChange={() => toggleStatus(status)}
                        >
                          {statusMeta[status].label}
                        </DropdownMenuCheckboxItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Billing window</DropdownMenuLabel>
                      {(
                        Object.keys(billingWindowLabels) as BillingWindow[]
                      ).map((window) => (
                        <DropdownMenuCheckboxItem
                          key={window}
                          checked={billingWindow === window}
                          onCheckedChange={() => setBillingWindow(window)}
                        >
                          <CalendarClock
                            className="text-muted-foreground mr-2 size-3.5"
                            aria-hidden="true"
                          />
                          {billingWindowLabels[window]}
                        </DropdownMenuCheckboxItem>
                      ))}
                      {activeFilterCount > 0 ? (
                        <>
                          <DropdownMenuSeparator />
                          <Button
                            className="h-8 w-full justify-start px-2 text-xs"
                            onClick={clearFilters}
                            size="sm"
                            type="button"
                            variant="ghost"
                          >
                            <X className="size-3.5" aria-hidden="true" />
                            Clear filters
                          </Button>
                        </>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        className="h-9 gap-2"
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <Columns3 className="size-4" aria-hidden="true" />
                        Columns
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
                      {subscriptionColumns.map((column) => (
                        <DropdownMenuCheckboxItem
                          key={column.key}
                          checked={visibleColumns.includes(column.key)}
                          disabled={column.pinned}
                          onCheckedChange={() => toggleColumn(column.key)}
                        >
                          {column.label}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {activeFilterCount > 0 ? (
                <div className="flex flex-wrap items-center gap-2 px-4 sm:px-6 lg:px-8">
                  <span className="text-muted-foreground text-xs">
                    Filters:
                  </span>
                  {query ? (
                    <Badge className="gap-1.5 rounded-md" variant="secondary">
                      Search: {query}
                      <button
                        aria-label="Clear subscription search filter"
                        className="hover:text-foreground"
                        onClick={() => setQuery("")}
                        type="button"
                      >
                        <X className="size-3" aria-hidden="true" />
                      </button>
                    </Badge>
                  ) : null}
                  {visibleStatuses.length !== statusOptions.length ? (
                    <Badge className="gap-1.5 rounded-md" variant="secondary">
                      {visibleStatuses.length} statuses
                      <button
                        aria-label="Reset status filters"
                        className="hover:text-foreground"
                        onClick={() => setVisibleStatuses(statusOptions)}
                        type="button"
                      >
                        <X className="size-3" aria-hidden="true" />
                      </button>
                    </Badge>
                  ) : null}
                  {billingWindow !== "all" ? (
                    <Badge className="gap-1.5 rounded-md" variant="secondary">
                      {billingWindowLabels[billingWindow]}
                      <button
                        aria-label="Clear billing window filter"
                        className="hover:text-foreground"
                        onClick={() => setBillingWindow("all")}
                        type="button"
                      >
                        <X className="size-3" aria-hidden="true" />
                      </button>
                    </Badge>
                  ) : null}
                  <Button
                    className="h-7 px-2 text-xs"
                    onClick={clearFilters}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    Clear all
                  </Button>
                </div>
              ) : null}

              <div className="horizontal-scrollbar vertical-scrollbar overflow-auto">
                <table className="bg-background w-full min-w-[1660px] border-separate border-spacing-0">
                  <thead className="sticky top-0 z-20">
                    <tr>
                      {subscriptionColumns
                        .filter((column) => visibleColumnSet.has(column.key))
                        .map((column, index) => (
                          <th
                            key={column.key}
                            className={cn(
                              "bg-muted/40 text-muted-foreground sticky top-0 z-20 h-10 border-y border-r px-4 text-left text-sm font-medium backdrop-blur",
                              index === 0 &&
                                "z-30 pl-4 sm:left-0 sm:pl-6 lg:pl-8",
                              column.className,
                            )}
                          >
                            <span className="flex items-center justify-between gap-4">
                              <span className="truncate">{column.label}</span>
                              <HeaderMenuButton label={column.label} />
                            </span>
                          </th>
                        ))}
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedSubscriptions.map((subscription) => (
                      <tr key={subscription.subscriptionId} className="group">
                        {visibleColumnSet.has("productName") ? (
                          <SubscriptionSpreadsheetCell className="bg-background group-hover:bg-muted z-10 pl-4 sm:sticky sm:left-0 sm:pl-6 lg:pl-8">
                            <span className="text-foreground block max-w-[280px] truncate font-medium">
                              {subscription.productName}
                            </span>
                          </SubscriptionSpreadsheetCell>
                        ) : null}
                        {visibleColumnSet.has("customerEmail") ? (
                          <SubscriptionSpreadsheetCell>
                            <span className="decoration-muted-foreground/40 whitespace-nowrap underline decoration-dotted underline-offset-4">
                              {subscription.customerEmail}
                            </span>
                          </SubscriptionSpreadsheetCell>
                        ) : null}
                        {visibleColumnSet.has("status") ? (
                          <SubscriptionSpreadsheetCell>
                            <SubscriptionStatusBadge
                              status={subscription.status}
                            />
                          </SubscriptionSpreadsheetCell>
                        ) : null}
                        {visibleColumnSet.has("nextBillingAmount") ? (
                          <SubscriptionSpreadsheetCell>
                            <span className="text-foreground font-medium whitespace-nowrap">
                              {subscription.nextBillingAmount}
                            </span>
                          </SubscriptionSpreadsheetCell>
                        ) : null}
                        {visibleColumnSet.has("subscriptionId") ? (
                          <SubscriptionSpreadsheetCell>
                            <span className="text-foreground font-medium whitespace-nowrap">
                              {subscription.subscriptionId}
                            </span>
                          </SubscriptionSpreadsheetCell>
                        ) : null}
                        {visibleColumnSet.has("nextBillingDate") ? (
                          <SubscriptionSpreadsheetCell>
                            {subscription.nextBillingDateTime ? (
                              <time
                                className="text-foreground whitespace-nowrap"
                                dateTime={subscription.nextBillingDateTime}
                              >
                                {subscription.nextBillingDate}
                              </time>
                            ) : (
                              <span className="text-foreground">
                                {subscription.nextBillingDate}
                              </span>
                            )}
                          </SubscriptionSpreadsheetCell>
                        ) : null}
                        {visibleColumnSet.has("quantity") ? (
                          <SubscriptionSpreadsheetCell>
                            <span className="text-foreground">
                              {subscription.quantity}
                            </span>
                          </SubscriptionSpreadsheetCell>
                        ) : null}
                        {visibleColumnSet.has("startDate") ? (
                          <SubscriptionSpreadsheetCell className="border-r-0">
                            <time
                              className="text-foreground whitespace-nowrap"
                              dateTime={subscription.startDateTime}
                            >
                              {subscription.startDate}
                            </time>
                          </SubscriptionSpreadsheetCell>
                        ) : null}
                      </tr>
                    ))}
                    {paginatedSubscriptions.length === 0 ? (
                      <tr>
                        <td
                          className="text-muted-foreground h-32 border-b px-6 text-center text-sm"
                          colSpan={visibleColumns.length}
                        >
                          No subscriptions match the selected filters.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                <p className="text-muted-foreground text-sm">
                  Showing {paginationStart}-{paginationEnd} of{" "}
                  {filteredSubscriptions.length} subscriptions
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
