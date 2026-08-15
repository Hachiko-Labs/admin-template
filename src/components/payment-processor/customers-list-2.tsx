"use client";

import {
  ArrowUpRight,
  BadgeDollarSign,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  ListFilter,
  ReceiptText,
  Search,
  ShieldAlert,
  Users,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type CustomerListTab = "overview" | "directory" | "risk";

type CustomerListMetric = {
  id: string;
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
};

type CustomerListRow = {
  id: string;
  customer: string;
  email: string;
  customerId: string;
  accountType: string;
  spend: string;
  paymentMethod: string;
  lastPayment: string;
  status: "Active" | "Review" | "Blocked";
};

type CustomerStatus = CustomerListRow["status"];

const customerStatuses: CustomerStatus[] = ["Active", "Review", "Blocked"];

const customerListMetrics: CustomerListMetric[] = [
  {
    id: "customers",
    label: "Active Customers",
    value: "8,214",
    icon: Users,
  },
  {
    id: "volume",
    label: "Processed Volume",
    value: "$1.28M",
    icon: BadgeDollarSign,
  },
  {
    id: "invoices",
    label: "Open Invoices",
    value: "$84.2K",
    icon: ReceiptText,
  },
  {
    id: "risk",
    label: "Needs Review",
    value: "12",
    icon: ShieldAlert,
  },
];

const customerListRows: CustomerListRow[] = [
  {
    id: "cus_9Kx41L",
    customer: "Northstar Supply Co.",
    email: "billing@northstarsupply.com",
    customerId: "cus_9Kx41L",
    accountType: "Business account",
    spend: "$128,420",
    paymentMethod: "Visa ending 4242",
    lastPayment: "06/12/2026",
    status: "Active",
  },
  {
    id: "cus_8Vn20P",
    customer: "Aster Labs",
    email: "finance@asterlabs.io",
    customerId: "cus_8Vn20P",
    accountType: "Startup account",
    spend: "$84,750",
    paymentMethod: "ACH verified",
    lastPayment: "06/10/2026",
    status: "Review",
  },
  {
    id: "cus_7Qs88B",
    customer: "Meridian Health",
    email: "ap@meridianhealth.com",
    customerId: "cus_7Qs88B",
    accountType: "Enterprise account",
    spend: "$210,300",
    paymentMethod: "Amex ending 3005",
    lastPayment: "06/09/2026",
    status: "Active",
  },
  {
    id: "cus_6Bd19Q",
    customer: "Rivergate Studios",
    email: "ops@rivergate.studio",
    customerId: "cus_6Bd19Q",
    accountType: "Creator account",
    spend: "$32,180",
    paymentMethod: "Mastercard ending 1881",
    lastPayment: "06/07/2026",
    status: "Blocked",
  },
  {
    id: "cus_5Zp62T",
    customer: "Kite Retail Group",
    email: "payments@kiteretail.com",
    customerId: "cus_5Zp62T",
    accountType: "Business account",
    spend: "$96,040",
    paymentMethod: "ACH verified",
    lastPayment: "06/04/2026",
    status: "Active",
  },
  {
    id: "cus_4Ta73R",
    customer: "Bluebird Events",
    email: "accounts@bluebirdevents.co",
    customerId: "cus_4Ta73R",
    accountType: "Seasonal account",
    spend: "$58,600",
    paymentMethod: "Visa ending 9021",
    lastPayment: "06/01/2026",
    status: "Review",
  },
  {
    id: "cus_3Lm44D",
    customer: "Prairie Foods",
    email: "ar@prairiefoods.com",
    customerId: "cus_3Lm44D",
    accountType: "Marketplace seller",
    spend: "$141,980",
    paymentMethod: "Mastercard ending 6409",
    lastPayment: "05/29/2026",
    status: "Active",
  },
  {
    id: "cus_2Er35N",
    customer: "Nomad Robotics",
    email: "billing@nomadrobotics.ai",
    customerId: "cus_2Er35N",
    accountType: "Enterprise account",
    spend: "$301,220",
    paymentMethod: "Wire enabled",
    lastPayment: "05/27/2026",
    status: "Active",
  },
  {
    id: "cus_1Cb90W",
    customer: "Harbor Fleet",
    email: "payables@harborfleet.com",
    customerId: "cus_1Cb90W",
    accountType: "Business account",
    spend: "$73,450",
    paymentMethod: "Visa ending 1155",
    lastPayment: "05/24/2026",
    status: "Review",
  },
  {
    id: "cus_0Aj27K",
    customer: "Luma Learning",
    email: "admin@lumalearning.org",
    customerId: "cus_0Aj27K",
    accountType: "Nonprofit account",
    spend: "$45,760",
    paymentMethod: "ACH verified",
    lastPayment: "05/21/2026",
    status: "Active",
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

function parseCustomerDate(value: string) {
  const [month, day, year] = value.split("/").map(Number);
  return new Date(year, month - 1, day);
}

function formatShortDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function MetricIconFrame({ icon: Icon }: { icon: CustomerListMetric["icon"] }) {
  return (
    <div className="bg-muted flex size-11 shrink-0 items-center justify-center rounded-[10px] border p-[3px]">
      <div className="bg-background flex size-full items-center justify-center rounded-md border">
        <Icon className="text-foreground size-[18px]" strokeWidth={1.8} />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: CustomerListRow["status"] }) {
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

export function PaymentProcessorCustomersList2() {
  const [tab, setTab] = React.useState<CustomerListTab>("overview");
  const [query, setQuery] = React.useState("");
  const [selectedStatuses, setSelectedStatuses] = React.useState<
    CustomerStatus[]
  >([]);
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();

  const statusFilterLabel =
    selectedStatuses.length === 0
      ? " Status"
      : selectedStatuses.length === 1
        ? selectedStatuses[0]
        : `${selectedStatuses.length} statuses`;

  const dateFilterLabel =
    dateRange?.from && dateRange.to
      ? `${formatShortDate(dateRange.from)} - ${formatShortDate(dateRange.to)}`
      : dateRange?.from
        ? `From ${formatShortDate(dateRange.from)}`
        : "Date Range";

  const filteredRows = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const rangeStart = dateRange?.from;
    const rangeEnd = dateRange?.to;

    return customerListRows.filter((row) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          row.customer,
          row.email,
          row.customerId,
          row.accountType,
          row.spend,
          row.paymentMethod,
          row.status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesStatus =
        selectedStatuses.length === 0 || selectedStatuses.includes(row.status);

      const paymentDate = parseCustomerDate(row.lastPayment);
      const matchesDateStart = !rangeStart || paymentDate >= rangeStart;
      const matchesDateEnd = !rangeEnd || paymentDate <= rangeEnd;

      return (
        matchesQuery && matchesStatus && matchesDateStart && matchesDateEnd
      );
    });
  }, [dateRange, query, selectedStatuses]);

  function toggleStatus(status: CustomerStatus) {
    setSelectedStatuses((currentStatuses) =>
      currentStatuses.includes(status)
        ? currentStatuses.filter((currentStatus) => currentStatus !== status)
        : [...currentStatuses, status],
    );
  }

  return (
    <main className="bg-background text-foreground flex min-h-0 flex-1 overflow-hidden">
      <div className="min-h-0 w-full flex-1 overflow-y-auto">
        <section className="bg-background">
          <div className="border-border border-b px-4 pt-8 pb-4 sm:px-6 lg:px-8">
            <div>
              <h1 className="text-foreground text-[22px] leading-7 font-semibold tracking-normal">
                Customers
              </h1>
              <p className="text-muted-foreground mt-1.5 text-sm leading-5 font-medium">
                Monitor customer payment methods, processing volume, and risk
                status.
              </p>
            </div>

            <div className="mt-8 mb-4 grid gap-5 md:grid-cols-2 xl:grid-cols-4 xl:gap-10">
              {customerListMetrics.map((metric) => (
                <div key={metric.id} className="flex items-center gap-3">
                  <MetricIconFrame icon={metric.icon} />
                  <div className="min-w-0">
                    <div className="text-foreground text-lg leading-none font-semibold tracking-normal">
                      {metric.value}
                    </div>
                    <div className="text-muted-foreground mt-1.5 text-sm leading-none font-medium">
                      {metric.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-border border-b">
            <Tabs
              value={tab}
              onValueChange={(value) => setTab(value as CustomerListTab)}
            >
              <TabsList className="h-11 gap-0 rounded-none bg-transparent px-4 py-0 sm:px-6 lg:px-8">
                <TabsTrigger
                  value="overview"
                  className="text-muted-foreground data-[state=active]:border-foreground data-[state=active]:text-foreground h-full rounded-none border-b-2 border-transparent px-4 text-sm font-semibold shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  All Customers
                </TabsTrigger>
                <TabsTrigger
                  value="directory"
                  className="text-muted-foreground data-[state=active]:border-foreground data-[state=active]:text-foreground h-full rounded-none border-b-2 border-transparent px-4 text-sm font-semibold shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Payment Methods
                </TabsTrigger>
                <TabsTrigger
                  value="risk"
                  className="text-muted-foreground data-[state=active]:border-foreground data-[state=active]:text-foreground h-full rounded-none border-b-2 border-transparent px-4 text-sm font-semibold shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Risk & KYC
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="p-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
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
                    placeholder="Search customer, ID, method..."
                    aria-label="Search customer"
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
                      Filter by risk status
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

              <div className="flex items-center gap-4">
                {/* <Button
                  type="button"
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground h-9 px-0 text-sm font-medium hover:bg-transparent"
                >
                  Log customer note
                </Button> */}
                <Button
                  type="button"
                  // className="h-9 rounded-md px-3 text-sm font-medium"
                >
                  <Download className="size-4" aria-hidden="true" />
                  Export
                </Button>
              </div>
            </div>

            <div className="border-border mt-4 overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="text-foreground h-9 px-4 text-sm font-semibold">
                      Customer
                    </TableHead>
                    <TableHead className="text-foreground h-9 px-4 text-sm font-semibold">
                      Account
                    </TableHead>
                    <TableHead className="text-foreground h-9 px-4 text-sm font-semibold">
                      Lifetime Spend
                    </TableHead>
                    <TableHead className="text-foreground h-9 px-4 text-sm font-semibold">
                      Last Payment
                    </TableHead>
                    <TableHead className="text-foreground h-9 px-4 text-sm font-semibold">
                      Risk Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRows.length > 0 ? (
                    filteredRows.map((row) => (
                      <TableRow
                        key={row.id}
                        className="group hover:bg-transparent"
                      >
                        <TableCell className="min-w-[240px] px-4 py-2">
                          <div className="flex items-start gap-3">
                            <div>
                              <div className="text-foreground text-sm leading-5 font-semibold">
                                {row.customer}
                              </div>
                              <div className="text-muted-foreground text-sm leading-4 font-medium">
                                {row.email}
                              </div>
                            </div>
                            <ArrowUpRight
                              className="mt-0.5 size-3.5 shrink-0 text-red-500 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
                              strokeWidth={2.3}
                              aria-hidden="true"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[240px] px-4 py-2">
                          <div className="text-foreground text-sm leading-5 font-semibold">
                            {row.customerId}
                          </div>
                          <div className="text-muted-foreground text-sm leading-4 font-medium">
                            {row.accountType}
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[150px] px-4 py-2">
                          <div className="text-foreground text-sm leading-5 font-semibold">
                            {row.spend}
                          </div>
                          <div className="text-muted-foreground text-sm leading-4 font-medium">
                            {row.paymentMethod}
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground min-w-[140px] px-4 py-2 text-sm font-semibold">
                          {row.lastPayment}
                        </TableCell>
                        <TableCell className="min-w-[130px] px-4 py-2">
                          <StatusBadge status={row.status} />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow className="hover:bg-transparent">
                      <TableCell
                        colSpan={5}
                        className="text-muted-foreground h-32 text-center text-sm font-medium"
                      >
                        No customers match the current filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
