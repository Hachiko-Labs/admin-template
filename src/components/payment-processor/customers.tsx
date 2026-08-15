"use client";

import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ListFilter,
  MoreHorizontal,
  Search,
  XCircle,
} from "lucide-react";
import * as React from "react";
import type { DateRange } from "react-day-picker";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

type PaymentCustomer = {
  id: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  createdAt: string;
  createdAtDateTime: string;
  status: "Active" | "Review" | "Blocked";
  avatar: string;
  avatarClassName: string;
};

const pageSize = 10;

type CustomerStatus = PaymentCustomer["status"];

const customerStatuses: CustomerStatus[] = ["Active", "Review", "Blocked"];

const customers: PaymentCustomer[] = [
  {
    id: "cus_Q8mL2vN4aZp9XwR6tKcE1",
    name: "Avery Stone",
    initials: "AS",
    email: "avery.stone@northledger.io",
    phone: "+1 415 782 0914",
    createdAt: "23 May, 4:18 pm",
    createdAtDateTime: "2026-05-23T16:18:00Z",
    status: "Active",
    avatar: "/avatars/avatar-1.png",
    avatarClassName: "bg-blue-100 text-blue-600 dark:bg-blue-950/50",
  },
  {
    id: "cus_Z3xH7bR1qTn5MpL9sVdC0",
    name: "Juniper Labs",
    initials: "JL",
    email: "billing@juniperlabs.dev",
    phone: "-",
    createdAt: "21 May, 11:02 am",
    createdAtDateTime: "2026-05-21T11:02:00Z",
    status: "Review",
    avatar: "/avatars/avatar-2.png",
    avatarClassName: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50",
  },
  {
    id: "cus_M7pQ1fC8yLw4DkS2nAaR5",
    name: "Maya Chen",
    initials: "MC",
    email: "maya.chen@solstice.co",
    phone: "+44 20 7946 0188",
    createdAt: "17 May, 8:44 pm",
    createdAtDateTime: "2026-05-17T20:44:00Z",
    status: "Active",
    avatar: "/avatars/avatar-3.png",
    avatarClassName: "bg-violet-100 text-violet-600 dark:bg-violet-950/50",
  },
  {
    id: "cus_B2rT6nY9gVq3LsE0hPwK8",
    name: "Drift Supply",
    initials: "DS",
    email: "accounts@driftsupply.com",
    phone: "-",
    createdAt: "13 May, 1:29 pm",
    createdAtDateTime: "2026-05-13T13:29:00Z",
    status: "Blocked",
    avatar: "/avatars/avatar-4.png",
    avatarClassName: "bg-amber-100 text-amber-700 dark:bg-amber-950/50",
  },
  {
    id: "cus_K9dW4sF2aJm8QpX7cRnL3",
    name: "Theo Ramirez",
    initials: "TR",
    email: "theo.ramirez@fieldnote.app",
    phone: "+61 2 8015 4420",
    createdAt: "9 May, 6:57 am",
    createdAtDateTime: "2026-05-09T06:57:00Z",
    status: "Active",
    avatar: "/avatars/avatar-5.png",
    avatarClassName: "bg-rose-100 text-rose-600 dark:bg-rose-950/50",
  },
  {
    id: "cus_R4cV0mN8uBd6TzQ1xLfP9",
    name: "Orbit Kitchen",
    initials: "OK",
    email: "finance@orbitkitchen.co",
    phone: "-",
    createdAt: "4 May, 9:35 pm",
    createdAtDateTime: "2026-05-04T21:35:00Z",
    status: "Review",
    avatar: "/avatars/avatar-6.png",
    avatarClassName: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/50",
  },
  {
    id: "cus_Y1hL5qE7sGp2VnD8kTbM4",
    name: "Priya Nair",
    initials: "PN",
    email: "priya.nair@evermint.in",
    phone: "+91 98765 20418",
    createdAt: "30 Apr, 2:10 pm",
    createdAtDateTime: "2026-04-30T14:10:00Z",
    status: "Active",
    avatar: "/avatars/avatar-bw-1.png",
    avatarClassName: "bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-950/50",
  },
  {
    id: "cus_D6nA3xK0pWs9JqR2vHcF5",
    name: "Harbor Nine",
    initials: "HN",
    email: "receipts@harbornine.com",
    phone: "-",
    createdAt: "22 Apr, 12:07 am",
    createdAtDateTime: "2026-04-22T00:07:00Z",
    status: "Review",
    avatar: "/avatars/avatar-bw-2.png",
    avatarClassName: "bg-lime-100 text-lime-700 dark:bg-lime-950/50",
  },
  {
    id: "cus_T0vP8mC3zQr6NxL1aYdS7",
    name: "Nolan Pierce",
    initials: "NP",
    email: "nolan@redwoodmetrics.ai",
    phone: "+1 646 330 8821",
    createdAt: "18 Apr, 7:41 pm",
    createdAtDateTime: "2026-04-18T19:41:00Z",
    status: "Active",
    avatar: "/avatars/avatar-bw-3.png",
    avatarClassName: "bg-pink-100 text-pink-600 dark:bg-pink-950/50",
  },
  {
    id: "cus_L5sJ2uB9fVx4CpN8qWmE0",
    name: "Cobalt Press",
    initials: "CP",
    email: "ops@cobaltpress.studio",
    phone: "-",
    createdAt: "11 Apr, 10:22 am",
    createdAtDateTime: "2026-04-11T10:22:00Z",
    status: "Blocked",
    avatar: "/avatars/avatar-bw-4.png",
    avatarClassName: "bg-sky-100 text-sky-700 dark:bg-sky-950/50",
  },
  {
    id: "cus_P7qN1wD4yMk8HsZ0rVcT6",
    name: "Elena Frost",
    initials: "EF",
    email: "elena.frost@grainpath.com",
    phone: "+49 30 5683 7712",
    createdAt: "3 Apr, 5:03 pm",
    createdAtDateTime: "2026-04-03T17:03:00Z",
    status: "Active",
    avatar: "/avatars/avatar-black-1.png",
    avatarClassName: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50",
  },
  {
    id: "cus_A2eR9kV6cLm1XqT5pBdH3",
    name: "Moss & Vale",
    initials: "MV",
    email: "payables@mossandvale.co",
    phone: "-",
    createdAt: "28 Mar, 3:16 am",
    createdAtDateTime: "2026-03-28T03:16:00Z",
    status: "Review",
    avatar: "/avatars/avatar-black-2.png",
    avatarClassName: "bg-orange-100 text-orange-700 dark:bg-orange-950/50",
  },
];

const statusMeta: Record<
  CustomerStatus,
  {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    className: string;
  }
> = {
  Active: {
    icon: CheckCircle2,
    className:
      "border-emerald-600/20 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-400/20",
  },
  Review: {
    icon: Clock3,
    className:
      "border-amber-600/20 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-400/20",
  },
  Blocked: {
    icon: XCircle,
    className:
      "border-rose-600/20 bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-400/20",
  },
};

function formatShortDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: CustomerStatus }) {
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
      <span>{status}</span>
    </span>
  );
}

function CustomerSpreadsheetCell({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        "group-hover:bg-muted/60 h-14 border-r border-b px-4 align-middle text-sm text-zinc-700 transition-colors dark:text-zinc-300",
        className,
      )}
      {...props}
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

function CustomerIdentity({ customer }: { customer: PaymentCustomer }) {
  return (
    <div className="flex min-w-max items-center gap-3">
      <Avatar className="border-border bg-muted size-8 border">
        <AvatarImage src={customer.avatar} alt={customer.name} />
        <AvatarFallback
          className={cn("text-xs font-semibold", customer.avatarClassName)}
        >
          {customer.initials}
        </AvatarFallback>
      </Avatar>
      <span className="text-foreground text-sm font-medium whitespace-nowrap">
        {customer.name}
      </span>
    </div>
  );
}

export function PaymentProcessorCustomers({
  className,
}: {
  className?: string;
}) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [query, setQuery] = React.useState("");
  const [selectedStatuses, setSelectedStatuses] = React.useState<
    CustomerStatus[]
  >([]);
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();

  const statusFilterLabel =
    selectedStatuses.length === 0
      ? "Status"
      : selectedStatuses.length === 1
        ? selectedStatuses[0]
        : `${selectedStatuses.length} statuses`;

  const dateFilterLabel =
    dateRange?.from && dateRange.to
      ? `${formatShortDate(dateRange.from)} - ${formatShortDate(dateRange.to)}`
      : dateRange?.from
        ? `From ${formatShortDate(dateRange.from)}`
        : "Date Range";

  const filteredCustomers = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const rangeStart = dateRange?.from;
    const rangeEnd = dateRange?.to;

    return customers.filter((customer) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          customer.name,
          customer.id,
          customer.email,
          customer.phone,
          customer.status,
          customer.createdAt,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesStatus =
        selectedStatuses.length === 0 ||
        selectedStatuses.includes(customer.status);

      const createdDate = new Date(customer.createdAtDateTime);
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

  function toggleStatus(status: CustomerStatus) {
    setSelectedStatuses((currentStatuses) =>
      currentStatuses.includes(status)
        ? currentStatuses.filter((currentStatus) => currentStatus !== status)
        : [...currentStatuses, status],
    );
  }

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCustomers.length / pageSize),
  );
  const paginatedCustomers = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;

    return filteredCustomers.slice(start, start + pageSize);
  }, [currentPage, filteredCustomers]);
  const paginationStart =
    filteredCustomers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const paginationEnd = Math.min(
    currentPage * pageSize,
    filteredCustomers.length,
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
                  <h2 className="text-base font-semibold">Customers</h2>
                  <p className="text-muted-foreground text-sm">
                    {filteredCustomers.length} customer records
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
                      placeholder="Search customer, ID, email..."
                      aria-label="Search customers"
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
                        Filter by customer status
                      </div>
                      <div className="space-y-1">
                        {customerStatuses.map((status) => (
                          <label
                            key={status}
                            className="hover:bg-muted flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm font-medium"
                          >
                            <Checkbox
                              checked={selectedStatuses.includes(status)}
                              onCheckedChange={() => toggleStatus(status)}
                              aria-label={`Filter ${status} customers`}
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
                <table className="bg-background w-full min-w-[1180px] border-separate border-spacing-0">
                  <thead className="sticky top-0 z-20">
                    <tr>
                      {[
                        ["Customer Name", "min-w-[360px]"],
                        ["Customer Id", "min-w-80"],
                        ["Email", "min-w-80"],
                        ["Status", "min-w-40"],
                        ["Phone Number", "min-w-52"],
                        ["Created At (UTC)", "min-w-56 border-r-0"],
                      ].map(([label, width], index) => (
                        <th
                          key={label}
                          className={cn(
                            "bg-muted/40 text-muted-foreground sticky top-0 z-20 h-10 border-y border-r px-4 text-left text-sm font-medium backdrop-blur",
                            index === 0 &&
                              "z-30 pl-4 sm:left-0 sm:pl-6 lg:pl-8",
                            width,
                          )}
                        >
                          <span className="flex items-center justify-between gap-4">
                            <span className="truncate">{label}</span>
                            <HeaderMenuButton label={label} />
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedCustomers.length > 0 ? (
                      paginatedCustomers.map((customer) => (
                        <tr key={customer.id} className="group">
                          <CustomerSpreadsheetCell className="bg-background group-hover:bg-muted z-10 pl-4 sm:sticky sm:left-0 sm:pl-6 lg:pl-8">
                            <CustomerIdentity customer={customer} />
                          </CustomerSpreadsheetCell>
                          <CustomerSpreadsheetCell>
                            <span className="text-foreground font-medium whitespace-nowrap">
                              {customer.id}
                            </span>
                          </CustomerSpreadsheetCell>
                          <CustomerSpreadsheetCell>
                            <span className="whitespace-nowrap">
                              {customer.email}
                            </span>
                          </CustomerSpreadsheetCell>
                          <CustomerSpreadsheetCell>
                            <StatusBadge status={customer.status} />
                          </CustomerSpreadsheetCell>
                          <CustomerSpreadsheetCell>
                            <span className="text-foreground">
                              {customer.phone}
                            </span>
                          </CustomerSpreadsheetCell>
                          <CustomerSpreadsheetCell className="border-r-0">
                            <time
                              className="text-foreground whitespace-nowrap"
                              dateTime={customer.createdAtDateTime}
                            >
                              {customer.createdAt}
                            </time>
                          </CustomerSpreadsheetCell>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <CustomerSpreadsheetCell
                          className="h-32 border-r-0 text-center"
                          colSpan={6}
                        >
                          No customers match the current filters.
                        </CustomerSpreadsheetCell>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                <p className="text-muted-foreground text-sm">
                  Showing {paginationStart}-{paginationEnd} of{" "}
                  {filteredCustomers.length} customers
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
