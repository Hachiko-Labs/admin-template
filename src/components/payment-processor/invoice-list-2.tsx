"use client";

import {
  AlertTriangle,
  Check,
  ChevronDown,
  Clock3,
  Download,
  ListFilter,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Send,
  X,
  XCircle,
} from "lucide-react";
import * as React from "react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { cn } from "@/lib/utils";

type InvoiceStatus = "Paid" | "Sent" | "Overdue" | "Draft" | "Void";
type SortOrder = "due-desc" | "due-asc" | "amount-desc" | "amount-asc";

type InvoiceKpi = {
  id: string;
  label: string;
  value: string;
  suffix?: string;
};

type InvoiceRow = {
  id: string;
  invoiceNumber: string;
  title: string;
  customer: string;
  email: string;
  total: number;
  amountDue: number;
  issued: string;
  due: string;
  method: string;
  paidDays?: number;
  status: InvoiceStatus;
};

const invoiceStatuses: InvoiceStatus[] = [
  "Paid",
  "Sent",
  "Overdue",
  "Draft",
  "Void",
];

const invoiceRows: InvoiceRow[] = [
  {
    id: "inv_7184",
    invoiceNumber: "INV-7184",
    title: "Pro blocks license",
    customer: "Northline Studio",
    email: "billing@northline.studio",
    total: 2499,
    amountDue: 2499,
    issued: "06/14/2026",
    due: "07/12/2026",
    method: "ACH debit",
    status: "Sent",
  },
  {
    id: "inv_7183",
    invoiceNumber: "INV-7183",
    title: "Admin kit integration",
    customer: "Vela Design Co.",
    email: "finance@veladesign.co",
    total: 8400,
    amountDue: 0,
    issued: "06/11/2026",
    due: "06/28/2026",
    method: "Visa ending 4928",
    paidDays: 11,
    status: "Paid",
  },
  {
    id: "inv_7182",
    invoiceNumber: "INV-7182",
    title: "Template migration",
    customer: "Harborline Apps",
    email: "ap@harborline.app",
    total: 3180,
    amountDue: 3180,
    issued: "06/01/2026",
    due: "06/12/2026",
    method: "Bank transfer",
    status: "Overdue",
  },
  {
    id: "inv_7181",
    invoiceNumber: "INV-7181",
    title: "Duplicate component order",
    customer: "Pollen Interface",
    email: "ops@polleninterface.com",
    total: 899,
    amountDue: 0,
    issued: "05/29/2026",
    due: "06/08/2026",
    method: "Mastercard ending 1882",
    status: "Void",
  },
  {
    id: "inv_7180",
    invoiceNumber: "INV-7180",
    title: "Figma kit handoff",
    customer: "Argent Labs",
    email: "billing@argentlabs.dev",
    total: 1950,
    amountDue: 1950,
    issued: "05/27/2026",
    due: "06/24/2026",
    method: "ACH debit",
    status: "Draft",
  },
  {
    id: "inv_7179",
    invoiceNumber: "INV-7179",
    title: "Lifetime access bundle",
    customer: "Cedar UI Works",
    email: "receipts@cedarui.works",
    total: 6800,
    amountDue: 0,
    issued: "05/16/2026",
    due: "06/03/2026",
    method: "Wire transfer",
    paidDays: 8,
    status: "Paid",
  },
  {
    id: "inv_7178",
    invoiceNumber: "INV-7178",
    title: "Private block request",
    customer: "North Pier Digital",
    email: "accounts@northpier.digital",
    total: 2750,
    amountDue: 2750,
    issued: "05/08/2026",
    due: "05/25/2026",
    method: "ACH debit",
    status: "Overdue",
  },
  {
    id: "inv_7177",
    invoiceNumber: "INV-7177",
    title: "Payment portal polish",
    customer: "Rune Atelier",
    email: "studio@runeatelier.com",
    total: 4120,
    amountDue: 1200,
    issued: "05/03/2026",
    due: "06/20/2026",
    method: "Card on file",
    status: "Sent",
  },
  {
    id: "inv_7176",
    invoiceNumber: "INV-7176",
    title: "Audit dashboard blocks",
    customer: "Prism Labs",
    email: "finance@prismlabs.dev",
    total: 5400,
    amountDue: 0,
    issued: "04/22/2026",
    due: "05/14/2026",
    method: "Visa ending 2250",
    paidDays: 13,
    status: "Paid",
  },
  {
    id: "inv_7175",
    invoiceNumber: "INV-7175",
    title: "Invoice PDF templates",
    customer: "Northstar Media",
    email: "billing@northstar.media",
    total: 2980,
    amountDue: 2980,
    issued: "04/18/2026",
    due: "05/02/2026",
    method: "Bank transfer",
    status: "Overdue",
  },
  {
    id: "inv_7174",
    invoiceNumber: "INV-7174",
    title: "Checkout settings pass",
    customer: "Copper Hill",
    email: "payments@copperhill.com",
    total: 1860,
    amountDue: 0,
    issued: "04/11/2026",
    due: "04/29/2026",
    method: "ACH debit",
    paidDays: 6,
    status: "Paid",
  },
  {
    id: "inv_7173",
    invoiceNumber: "INV-7173",
    title: "Merchant profile setup",
    customer: "Sable Market",
    email: "pay@sable.market",
    total: 3420,
    amountDue: 3420,
    issued: "04/05/2026",
    due: "04/26/2026",
    method: "Google Pay",
    status: "Draft",
  },
  {
    id: "inv_7172",
    invoiceNumber: "INV-7172",
    title: "Subscription recovery flow",
    customer: "Verdant Systems",
    email: "receipts@verdant.systems",
    total: 11240,
    amountDue: 11240,
    issued: "03/25/2026",
    due: "06/30/2026",
    method: "Visa ending 7712",
    status: "Sent",
  },
  {
    id: "inv_7171",
    invoiceNumber: "INV-7171",
    title: "Usage billing prototype",
    customer: "Orbit Works",
    email: "accounts@orbit.works",
    total: 4720,
    amountDue: 0,
    issued: "03/20/2026",
    due: "04/05/2026",
    method: "Card ending 6031",
    paidDays: 10,
    status: "Paid",
  },
  {
    id: "inv_7170",
    invoiceNumber: "INV-7170",
    title: "Customer import cleanup",
    customer: "Luma Studio",
    email: "billing@lumastudio.co",
    total: 2640,
    amountDue: 2640,
    issued: "03/12/2026",
    due: "03/28/2026",
    method: "Card ending 1148",
    status: "Overdue",
  },
];

const sortLabels: Record<SortOrder, string> = {
  "due-desc": "Newest due date",
  "due-asc": "Oldest due date",
  "amount-desc": "Highest total",
  "amount-asc": "Lowest total",
};

const pageShellClassName =
  "mx-auto w-full max-w-[1500px] px-5 sm:px-8 xl:px-10";
const compactControlClass = "h-8 px-2.5 text-[13px] md:text-[13px]";

const statusMeta: Record<
  InvoiceStatus,
  {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    className: string;
  }
> = {
  Paid: {
    icon: Check,
    className:
      "border-emerald-600/20 bg-background text-emerald-700 dark:text-emerald-400",
  },
  Sent: {
    icon: Send,
    className:
      "border-blue-600/20 bg-background text-blue-700 dark:text-blue-400",
  },
  Overdue: {
    icon: AlertTriangle,
    className: "border-red-600/20 bg-background text-red-700 dark:text-red-400",
  },
  Draft: {
    icon: Clock3,
    className:
      "border-zinc-500/30 bg-background text-zinc-700 dark:text-zinc-300",
  },
  Void: {
    icon: XCircle,
    className: "border-muted-foreground/20 bg-background text-muted-foreground",
  },
};

function parseInvoiceDate(value: string) {
  const [month, day, year] = value.split("/").map(Number);

  return new Date(year, month - 1, day);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
    style: "currency",
  }).format(value);
}

function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 1,
    notation: "compact",
    style: "currency",
  }).format(value);
}

function formatShortDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatInvoiceDate(value: string) {
  return formatShortDate(parseInvoiceDate(value));
}

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const meta = statusMeta[status];
  const StatusIcon = meta.icon;

  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-md border px-2 text-xs font-medium",
        meta.className,
      )}
    >
      <StatusIcon className="size-3.5" aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
}

function FilterChip({
  children,
  onClear,
}: {
  children: React.ReactNode;
  onClear: () => void;
}) {
  return (
    <span className="border-border text-foreground inline-flex h-8 items-center gap-2 rounded-md border border-dashed bg-transparent px-2.5 text-[13px] font-medium">
      {children}
      <button
        type="button"
        onClick={onClear}
        className="text-muted-foreground hover:text-foreground"
      >
        <span className="sr-only">Clear filter</span>
        <X className="size-3.5" aria-hidden="true" />
      </button>
    </span>
  );
}

export function PaymentProcessorInvoiceList2() {
  const [query, setQuery] = React.useState("");
  const [selectedStatuses, setSelectedStatuses] = React.useState<
    InvoiceStatus[]
  >([]);
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [minimumTotal, setMinimumTotal] = React.useState<number | undefined>();
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("due-desc");
  const [pageSize, setPageSize] = React.useState(10);
  const [currentPage, setCurrentPage] = React.useState(1);

  const invoiceKpis = React.useMemo<InvoiceKpi[]>(() => {
    const today = new Date(2026, 5, 18);
    const nextThirtyDays = new Date(2026, 6, 18);
    const overdue = invoiceRows
      .filter((row) => row.status === "Overdue")
      .reduce((total, row) => total + row.amountDue, 0);
    const dueSoon = invoiceRows
      .filter((row) => {
        const dueDate = parseInvoiceDate(row.due);

        return (
          row.amountDue > 0 && dueDate >= today && dueDate <= nextThirtyDays
        );
      })
      .reduce((total, row) => total + row.amountDue, 0);
    const paidDurations = invoiceRows
      .map((row) => row.paidDays)
      .filter((value): value is number => typeof value === "number");
    const averagePaidDays = Math.round(
      paidDurations.reduce((total, days) => total + days, 0) /
        paidDurations.length,
    );
    const payout = invoiceRows
      .filter((row) => row.status === "Paid")
      .reduce((total, row) => total + row.total, 0);

    return [
      {
        id: "overdue",
        label: "Past-due balance",
        value: formatCompactCurrency(overdue),
      },
      {
        id: "due-soon",
        label: "Due in next 30 days",
        value: formatCompactCurrency(dueSoon),
      },
      {
        id: "avg-paid",
        label: "Average time to pay",
        value: String(averagePaidDays),
        suffix: " days",
      },
      {
        id: "payout",
        label: "Settled invoice volume",
        value: formatCompactCurrency(payout),
      },
    ];
  }, []);

  const statusFilterLabel =
    selectedStatuses.length === 0
      ? "Filter"
      : selectedStatuses.length === 1
        ? selectedStatuses[0]
        : `Filter ${selectedStatuses.length}`;

  const dateFilterLabel =
    dateRange?.from && dateRange.to
      ? `${formatShortDate(dateRange.from)} - ${formatShortDate(dateRange.to)}`
      : dateRange?.from
        ? `From ${formatShortDate(dateRange.from)}`
        : "Due date";

  const filteredRows = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const rangeStart = dateRange?.from;
    const rangeEnd = dateRange?.to;

    return invoiceRows
      .filter((row) => {
        const matchesQuery =
          !normalizedQuery ||
          [
            row.invoiceNumber,
            row.title,
            row.customer,
            row.email,
            row.method,
            row.status,
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);

        const matchesStatus =
          selectedStatuses.length === 0 ||
          selectedStatuses.includes(row.status);
        const matchesMinimum =
          minimumTotal === undefined || row.total >= minimumTotal;

        const dueDate = parseInvoiceDate(row.due);
        const matchesDateStart = !rangeStart || dueDate >= rangeStart;
        const matchesDateEnd = !rangeEnd || dueDate <= rangeEnd;

        return (
          matchesQuery &&
          matchesStatus &&
          matchesMinimum &&
          matchesDateStart &&
          matchesDateEnd
        );
      })
      .sort((first, second) => {
        if (sortOrder === "amount-desc") {
          return second.total - first.total;
        }

        if (sortOrder === "amount-asc") {
          return first.total - second.total;
        }

        const firstDue = parseInvoiceDate(first.due).getTime();
        const secondDue = parseInvoiceDate(second.due).getTime();

        return sortOrder === "due-asc"
          ? firstDue - secondDue
          : secondDue - firstDue;
      });
  }, [dateRange, minimumTotal, query, selectedStatuses, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const pageStart =
    filteredRows.length === 0 ? 0 : (currentPage - 1) * pageSize;
  const pageEnd = Math.min(pageStart + pageSize, filteredRows.length);
  const paginatedRows = filteredRows.slice(pageStart, pageEnd);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [dateRange, minimumTotal, pageSize, query, selectedStatuses, sortOrder]);

  React.useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  function toggleStatus(status: InvoiceStatus) {
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
          <div className="border-border border-b">
            <div
              className={cn(
                pageShellClassName,
                "flex flex-col items-center py-8 text-center",
              )}
            >
              <div className="text-muted-foreground text-[11px] font-bold tracking-[0.16em] uppercase">
                Payment Processor <span className="mx-3">/</span>
                <span className="text-foreground">Invoices</span>
              </div>

              <h1 className="text-foreground mt-5 text-xl leading-7 font-semibold tracking-tight">
                Invoices
              </h1>
              <div className="text-muted-foreground mt-2 inline-flex items-center gap-2 text-[13px] font-medium">
                Updated few seconds ago
                <RefreshCw className="size-3.5" aria-hidden="true" />
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  className={cn("rounded-md", compactControlClass)}
                >
                  <Plus className="size-4" aria-hidden="true" />
                  Create Invoice
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className={cn("rounded-md shadow-none", compactControlClass)}
                >
                  <Download className="size-4" aria-hidden="true" />
                  Export CSV
                </Button>
              </div>
            </div>
          </div>

          <div className="border-border border-b">
            <div
              className={cn(
                pageShellClassName,
                "grid grid-cols-2 divide-x-0 divide-y px-0 md:grid-cols-4 md:divide-x md:divide-y-0",
              )}
            >
              {invoiceKpis.map((kpi) => (
                <div key={kpi.id} className="px-4 py-5 text-center xl:py-6">
                  <div className="text-muted-foreground text-[13px] font-medium">
                    {kpi.label}
                  </div>
                  <div className="text-foreground mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                    {kpi.value}
                    {kpi.suffix ? (
                      <span className="text-muted-foreground text-base font-medium">
                        {kpi.suffix}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={cn(pageShellClassName, "py-6")}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "justify-between rounded-md font-medium shadow-none",
                        compactControlClass,
                      )}
                    >
                      <ListFilter className="size-4" aria-hidden="true" />
                      {statusFilterLabel}
                      {selectedStatuses.length > 0 ? (
                        <span className="bg-muted text-muted-foreground inline-flex size-5 items-center justify-center rounded-full text-xs">
                          {selectedStatuses.length}
                        </span>
                      ) : null}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-56 p-2">
                    <div className="text-muted-foreground px-2 pt-1 pb-2 text-[11px] font-bold tracking-wide uppercase">
                      Invoice status
                    </div>
                    <div className="space-y-1">
                      {invoiceStatuses.map((status) => (
                        <label
                          key={status}
                          className="hover:bg-muted flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm font-medium"
                        >
                          <Checkbox
                            checked={selectedStatuses.includes(status)}
                            onCheckedChange={() => toggleStatus(status)}
                            aria-label={`Filter ${status} invoices`}
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

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "justify-between rounded-md font-medium shadow-none",
                        compactControlClass,
                      )}
                    >
                      {sortLabels[sortOrder]}
                      <ChevronDown className="size-4" aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuRadioGroup
                      value={sortOrder}
                      onValueChange={(value) =>
                        setSortOrder(value as SortOrder)
                      }
                    >
                      {Object.entries(sortLabels).map(([value, label]) => (
                        <DropdownMenuRadioItem key={value} value={value}>
                          {label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "justify-between rounded-md font-medium shadow-none",
                        compactControlClass,
                      )}
                    >
                      Total
                      <ChevronDown className="size-4" aria-hidden="true" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-60 p-3">
                    <div className="text-muted-foreground text-[11px] font-bold tracking-wide uppercase">
                      Minimum invoice total
                    </div>
                    <Input
                      value={minimumTotal ?? ""}
                      onChange={(event) => {
                        const value = event.target.valueAsNumber;
                        setMinimumTotal(
                          Number.isNaN(value) ? undefined : value,
                        );
                      }}
                      className={cn("mt-2", compactControlClass)}
                      min={0}
                      placeholder="Any total"
                      type="number"
                    />
                    {minimumTotal !== undefined ? (
                      <Button
                        type="button"
                        variant="ghost"
                        className="mt-2 h-8 w-full justify-start px-2 text-xs"
                        onClick={() => setMinimumTotal(undefined)}
                      >
                        Clear total filter
                      </Button>
                    ) : null}
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "justify-between rounded-md font-medium shadow-none",
                        compactControlClass,
                      )}
                    >
                      Date
                      <ChevronDown className="size-4" aria-hidden="true" />
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
                          Clear date filter
                        </Button>
                      </div>
                    ) : null}
                  </PopoverContent>
                </Popover>

                {minimumTotal !== undefined ? (
                  <FilterChip onClear={() => setMinimumTotal(undefined)}>
                    Total: {formatCurrency(minimumTotal)}+
                  </FilterChip>
                ) : null}
                {dateRange?.from ? (
                  <FilterChip onClear={() => setDateRange(undefined)}>
                    Date: {dateFilterLabel}
                  </FilterChip>
                ) : null}
              </div>

              <div className="relative">
                <Search
                  className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
                  aria-hidden="true"
                />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  type="search"
                  placeholder="Search"
                  aria-label="Search invoices"
                  className="border-border bg-background placeholder:text-muted-foreground h-8 w-full rounded-md pr-2.5 pl-9 text-[13px] font-medium shadow-none sm:w-[240px]"
                />
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <Table className="min-w-[1120px]">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-muted-foreground h-10 min-w-[220px] px-3 text-sm font-medium">
                      Invoice
                    </TableHead>
                    <TableHead className="text-muted-foreground h-10 min-w-[220px] px-3 text-sm font-medium">
                      Customer
                    </TableHead>
                    <TableHead className="text-muted-foreground h-10 min-w-[130px] px-3 text-sm font-medium">
                      Total
                    </TableHead>
                    <TableHead className="text-muted-foreground h-10 min-w-[120px] px-3 text-sm font-medium">
                      Status
                    </TableHead>
                    <TableHead className="text-muted-foreground h-10 min-w-[130px] px-3 text-sm font-medium">
                      Amount Due
                    </TableHead>
                    <TableHead className="text-muted-foreground h-10 min-w-[130px] px-3 text-sm font-medium">
                      Due Date
                    </TableHead>
                    <TableHead className="h-10 w-10 px-4">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRows.length > 0 ? (
                    paginatedRows.map((row) => (
                      <TableRow
                        key={row.id}
                        className="hover:bg-muted/30 border-b"
                      >
                        <TableCell className="text-foreground px-3 py-2.5 text-sm font-medium">
                          {row.invoiceNumber}
                          <div className="text-muted-foreground text-xs font-normal">
                            {row.title}
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground px-3 py-2.5 text-sm font-medium">
                          {row.customer}
                          <div className="text-muted-foreground text-xs font-normal">
                            {row.email}
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground px-3 py-2.5 text-sm font-medium">
                          {formatCurrency(row.total)}
                        </TableCell>
                        <TableCell className="px-3 py-2.5">
                          <StatusBadge status={row.status} />
                        </TableCell>
                        <TableCell className="text-foreground px-3 py-2.5 text-sm font-medium">
                          {formatCurrency(row.amountDue)}
                        </TableCell>
                        <TableCell className="text-foreground px-3 py-2.5 text-sm font-medium">
                          {formatInvoiceDate(row.due)}
                        </TableCell>
                        <TableCell className="w-10 px-4 py-2.5 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-foreground hover:bg-muted size-8 rounded-md"
                          >
                            <span className="sr-only">
                              Actions for {row.invoiceNumber}
                            </span>
                            <MoreHorizontal
                              className="size-4"
                              aria-hidden="true"
                            />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow className="hover:bg-transparent">
                      <TableCell
                        colSpan={7}
                        className="text-muted-foreground h-32 text-center text-sm font-medium"
                      >
                        No invoices match the current filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-foreground text-[13px] font-medium">
                Showing {pageStart + (filteredRows.length > 0 ? 1 : 0)} to{" "}
                {pageEnd} of {filteredRows.length} results
              </div>

              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "rounded-md font-medium shadow-none",
                        compactControlClass,
                      )}
                    >
                      {pageSize} per page
                      <ChevronDown className="size-4" aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36">
                    {[5, 10, 15].map((size) => (
                      <DropdownMenuItem
                        key={size}
                        onClick={() => setPageSize(size)}
                      >
                        {size} per page
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setPageSize(invoiceRows.length)}
                    >
                      Show all
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  type="button"
                  variant="outline"
                  disabled={currentPage === 1}
                  className={cn(
                    "rounded-md font-medium shadow-none",
                    compactControlClass,
                  )}
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={currentPage === totalPages}
                  className={cn(
                    "rounded-md font-medium shadow-none",
                    compactControlClass,
                  )}
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
