"use client";

import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  FileText,
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

type InvoiceStatus = "paid" | "sent" | "overdue" | "draft" | "void";
type InvoiceWindow = "all" | "due_soon" | "needs_attention" | "closed";

type InvoiceRow = {
  id: string;
  invoiceNumber: string;
  title: string;
  customer: string;
  email: string;
  status: InvoiceStatus;
  total: string;
  amountDue: string;
  paymentMethod: string;
  dueDate: string;
  dueDateTime: string;
  issuedDate: string;
  issuedDateTime: string;
};

const pageSize = 10;

const statusOptions: InvoiceStatus[] = [
  "paid",
  "sent",
  "overdue",
  "draft",
  "void",
];

const invoiceWindowLabels: Record<InvoiceWindow, string> = {
  all: "All invoice windows",
  due_soon: "Due next 30 days",
  needs_attention: "Needs attention",
  closed: "Paid or void",
};

const invoices: InvoiceRow[] = [
  {
    id: "inv_7184",
    invoiceNumber: "INV-7184",
    title: "Pro blocks license",
    customer: "Northline Studio",
    email: "billing@northline.studio",
    status: "sent",
    total: "$2,499.00",
    amountDue: "$2,499.00",
    paymentMethod: "ACH debit",
    dueDate: "12 Jul, 10:00 am",
    dueDateTime: "2026-07-12T10:00:00Z",
    issuedDate: "14 Jun, 9:15 am",
    issuedDateTime: "2026-06-14T09:15:00Z",
  },
  {
    id: "inv_7183",
    invoiceNumber: "INV-7183",
    title: "Admin kit integration",
    customer: "Vela Design Co.",
    email: "finance@veladesign.co",
    status: "paid",
    total: "$8,400.00",
    amountDue: "$0.00",
    paymentMethod: "Visa ending 4928",
    dueDate: "28 Jun, 4:00 pm",
    dueDateTime: "2026-06-28T16:00:00Z",
    issuedDate: "11 Jun, 11:32 am",
    issuedDateTime: "2026-06-11T11:32:00Z",
  },
  {
    id: "inv_7182",
    invoiceNumber: "INV-7182",
    title: "Template migration",
    customer: "Harborline Apps",
    email: "ap@harborline.app",
    status: "overdue",
    total: "$3,180.00",
    amountDue: "$3,180.00",
    paymentMethod: "Bank transfer",
    dueDate: "12 Jun, 2:30 pm",
    dueDateTime: "2026-06-12T14:30:00Z",
    issuedDate: "1 Jun, 8:05 am",
    issuedDateTime: "2026-06-01T08:05:00Z",
  },
  {
    id: "inv_7181",
    invoiceNumber: "INV-7181",
    title: "Duplicate component order",
    customer: "Pollen Interface",
    email: "ops@polleninterface.com",
    status: "void",
    total: "$899.00",
    amountDue: "$0.00",
    paymentMethod: "Mastercard ending 1882",
    dueDate: "8 Jun, 5:00 pm",
    dueDateTime: "2026-06-08T17:00:00Z",
    issuedDate: "29 May, 1:48 pm",
    issuedDateTime: "2026-05-29T13:48:00Z",
  },
  {
    id: "inv_7180",
    invoiceNumber: "INV-7180",
    title: "Figma kit handoff",
    customer: "Argent Labs",
    email: "billing@argentlabs.dev",
    status: "draft",
    total: "$1,950.00",
    amountDue: "$1,950.00",
    paymentMethod: "ACH debit",
    dueDate: "24 Jun, 12:00 pm",
    dueDateTime: "2026-06-24T12:00:00Z",
    issuedDate: "27 May, 10:20 am",
    issuedDateTime: "2026-05-27T10:20:00Z",
  },
  {
    id: "inv_7179",
    invoiceNumber: "INV-7179",
    title: "Lifetime access bundle",
    customer: "Cedar UI Works",
    email: "receipts@cedarui.works",
    status: "paid",
    total: "$6,800.00",
    amountDue: "$0.00",
    paymentMethod: "Wire transfer",
    dueDate: "3 Jun, 9:30 am",
    dueDateTime: "2026-06-03T09:30:00Z",
    issuedDate: "16 May, 3:16 pm",
    issuedDateTime: "2026-05-16T15:16:00Z",
  },
  {
    id: "inv_7178",
    invoiceNumber: "INV-7178",
    title: "Private block request",
    customer: "North Pier Digital",
    email: "accounts@northpier.digital",
    status: "overdue",
    total: "$2,750.00",
    amountDue: "$2,750.00",
    paymentMethod: "ACH debit",
    dueDate: "25 May, 6:45 pm",
    dueDateTime: "2026-05-25T18:45:00Z",
    issuedDate: "8 May, 9:10 am",
    issuedDateTime: "2026-05-08T09:10:00Z",
  },
  {
    id: "inv_7177",
    invoiceNumber: "INV-7177",
    title: "Payment portal polish",
    customer: "Rune Atelier",
    email: "studio@runeatelier.com",
    status: "sent",
    total: "$4,120.00",
    amountDue: "$1,200.00",
    paymentMethod: "Card on file",
    dueDate: "20 Jun, 11:15 am",
    dueDateTime: "2026-06-20T11:15:00Z",
    issuedDate: "3 May, 4:42 pm",
    issuedDateTime: "2026-05-03T16:42:00Z",
  },
  {
    id: "inv_7176",
    invoiceNumber: "INV-7176",
    title: "Audit dashboard blocks",
    customer: "Prism Labs",
    email: "finance@prismlabs.dev",
    status: "paid",
    total: "$5,400.00",
    amountDue: "$0.00",
    paymentMethod: "Visa ending 2250",
    dueDate: "14 May, 1:30 pm",
    dueDateTime: "2026-05-14T13:30:00Z",
    issuedDate: "22 Apr, 7:36 am",
    issuedDateTime: "2026-04-22T07:36:00Z",
  },
  {
    id: "inv_7175",
    invoiceNumber: "INV-7175",
    title: "Invoice PDF templates",
    customer: "Northstar Media",
    email: "billing@northstar.media",
    status: "overdue",
    total: "$2,980.00",
    amountDue: "$2,980.00",
    paymentMethod: "Bank transfer",
    dueDate: "2 May, 10:00 am",
    dueDateTime: "2026-05-02T10:00:00Z",
    issuedDate: "18 Apr, 9:24 am",
    issuedDateTime: "2026-04-18T09:24:00Z",
  },
  {
    id: "inv_7174",
    invoiceNumber: "INV-7174",
    title: "Checkout settings pass",
    customer: "Copper Hill",
    email: "payments@copperhill.com",
    status: "paid",
    total: "$1,860.00",
    amountDue: "$0.00",
    paymentMethod: "ACH debit",
    dueDate: "29 Apr, 3:30 pm",
    dueDateTime: "2026-04-29T15:30:00Z",
    issuedDate: "11 Apr, 4:52 pm",
    issuedDateTime: "2026-04-11T16:52:00Z",
  },
  {
    id: "inv_7173",
    invoiceNumber: "INV-7173",
    title: "Merchant profile setup",
    customer: "Sable Market",
    email: "pay@sable.market",
    status: "draft",
    total: "$3,420.00",
    amountDue: "$3,420.00",
    paymentMethod: "Google Pay",
    dueDate: "26 Apr, 8:05 am",
    dueDateTime: "2026-04-26T08:05:00Z",
    issuedDate: "5 Apr, 8:05 am",
    issuedDateTime: "2026-04-05T08:05:00Z",
  },
];

const statusMeta: Record<
  InvoiceStatus,
  {
    label: string;
    className: string;
  }
> = {
  paid: {
    label: "Paid",
    className:
      "border-emerald-600/20 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  sent: {
    label: "Sent",
    className:
      "border-blue-600/20 bg-blue-50 text-blue-700 dark:border-blue-400/20 dark:bg-blue-900/30 dark:text-blue-400",
  },
  overdue: {
    label: "Overdue",
    className:
      "border-amber-600/20 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-900/30 dark:text-amber-400",
  },
  draft: {
    label: "Draft",
    className:
      "border-zinc-300 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-300",
  },
  void: {
    label: "Void",
    className:
      "border-rose-600/20 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-900/30 dark:text-rose-400",
  },
};

function parseMoney(value: string) {
  return Number(value.replace(/[^0-9.-]+/g, ""));
}

function InvoiceSpreadsheetCell({
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

function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
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

export function PaymentProcessorInvoiceList3() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [query, setQuery] = React.useState("");
  const [invoiceWindow, setInvoiceWindow] =
    React.useState<InvoiceWindow>("all");
  const [visibleStatuses, setVisibleStatuses] =
    React.useState<InvoiceStatus[]>(statusOptions);

  const filteredInvoices = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const now = new Date("2026-06-18T00:00:00Z").getTime();
    const nextThirtyDays = new Date("2026-07-18T23:59:59Z").getTime();

    return invoices.filter((invoice) => {
      const dueTime = new Date(invoice.dueDateTime).getTime();
      const matchesQuery =
        !normalizedQuery ||
        invoice.invoiceNumber.toLowerCase().includes(normalizedQuery) ||
        invoice.title.toLowerCase().includes(normalizedQuery) ||
        invoice.customer.toLowerCase().includes(normalizedQuery) ||
        invoice.email.toLowerCase().includes(normalizedQuery);
      const matchesStatus = visibleStatuses.includes(invoice.status);
      const matchesWindow =
        invoiceWindow === "all" ||
        (invoiceWindow === "due_soon" &&
          parseMoney(invoice.amountDue) > 0 &&
          dueTime >= now &&
          dueTime <= nextThirtyDays) ||
        (invoiceWindow === "needs_attention" &&
          ["overdue", "draft"].includes(invoice.status)) ||
        (invoiceWindow === "closed" &&
          ["paid", "void"].includes(invoice.status));

      return matchesQuery && matchesStatus && matchesWindow;
    });
  }, [invoiceWindow, query, visibleStatuses]);

  const activeFilterCount =
    (query.trim() ? 1 : 0) +
    (invoiceWindow !== "all" ? 1 : 0) +
    (visibleStatuses.length !== statusOptions.length ? 1 : 0);
  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / pageSize));
  const paginatedInvoices = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;

    return filteredInvoices.slice(start, start + pageSize);
  }, [currentPage, filteredInvoices]);
  const paginationStart =
    filteredInvoices.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const paginationEnd = Math.min(
    currentPage * pageSize,
    filteredInvoices.length,
  );

  React.useEffect(() => {
    setCurrentPage(1);
  }, [invoiceWindow, query, visibleStatuses]);

  React.useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  function toggleStatus(status: InvoiceStatus) {
    setVisibleStatuses((current) =>
      current.includes(status)
        ? current.filter((item) => item !== status)
        : [...current, status],
    );
  }

  function clearFilters() {
    setQuery("");
    setInvoiceWindow("all");
    setVisibleStatuses(statusOptions);
  }

  return (
    <main className="bg-background text-foreground flex min-h-0 flex-1 overflow-hidden">
      <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto">
        <section className="min-w-0 flex-1 pt-6 pb-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
              <div>
                <h1 className="text-base font-semibold">Invoices</h1>
                <p className="text-muted-foreground text-sm">
                  {invoices.length} customer invoices across open, paid, and
                  draft states
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:min-w-[520px] sm:flex-row sm:items-center sm:justify-end">
                <div className="relative min-w-0 flex-1 sm:max-w-72">
                  <Search
                    className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
                    aria-hidden="true"
                  />
                  <Input
                    aria-label="Search invoices"
                    className="h-9 pr-8 pl-9"
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search invoices..."
                    value={query}
                  />
                  {query ? (
                    <Button
                      aria-label="Clear invoice search"
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
                    <DropdownMenuLabel>Invoice window</DropdownMenuLabel>
                    {(Object.keys(invoiceWindowLabels) as InvoiceWindow[]).map(
                      (window) => (
                        <DropdownMenuCheckboxItem
                          key={window}
                          checked={invoiceWindow === window}
                          onCheckedChange={() => setInvoiceWindow(window)}
                        >
                          <CalendarClock
                            className="text-muted-foreground mr-2 size-3.5"
                            aria-hidden="true"
                          />
                          {invoiceWindowLabels[window]}
                        </DropdownMenuCheckboxItem>
                      ),
                    )}
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
              </div>
            </div>

            {activeFilterCount > 0 ? (
              <div className="flex flex-wrap items-center gap-2 px-4 sm:px-6 lg:px-8">
                <span className="text-muted-foreground text-xs">Filters:</span>
                {query ? (
                  <Badge className="gap-1.5 rounded-md" variant="secondary">
                    Search: {query}
                    <button
                      aria-label="Clear invoice search filter"
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
                {invoiceWindow !== "all" ? (
                  <Badge className="gap-1.5 rounded-md" variant="secondary">
                    {invoiceWindowLabels[invoiceWindow]}
                    <button
                      aria-label="Clear invoice window filter"
                      className="hover:text-foreground"
                      onClick={() => setInvoiceWindow("all")}
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
              <table className="bg-background w-full min-w-[1180px] border-separate border-spacing-0">
                <thead className="sticky top-0 z-20">
                  <tr>
                    {[
                      ["Invoice", "min-w-[360px]"],
                      ["Customer", "min-w-80"],
                      ["Email", "min-w-80"],
                      ["Status", "min-w-40"],
                      ["Amount Due", "min-w-52"],
                      ["Due Date", "min-w-56 border-r-0"],
                    ].map(([label, width], index) => (
                      <th
                        key={label}
                        className={cn(
                          "bg-muted/40 text-muted-foreground sticky top-0 z-20 h-10 border-y border-r px-4 text-left text-sm font-medium backdrop-blur",
                          index === 0 && "z-30 pl-4 sm:left-0 sm:pl-6 lg:pl-8",
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
                  {paginatedInvoices.length > 0 ? (
                    paginatedInvoices.map((invoice) => (
                      <tr key={invoice.id} className="group">
                        <InvoiceSpreadsheetCell className="bg-background group-hover:bg-muted z-10 pl-4 sm:sticky sm:left-0 sm:pl-6 lg:pl-8">
                          <div className="flex min-w-max items-center gap-3">
                            <span className="bg-muted text-muted-foreground grid size-8 shrink-0 place-items-center rounded-md border">
                              <FileText className="size-4" aria-hidden="true" />
                            </span>
                            <span className="min-w-0">
                              <span className="text-foreground block max-w-[260px] truncate text-sm font-medium">
                                {invoice.invoiceNumber}
                              </span>
                              <span className="text-muted-foreground block max-w-[260px] truncate text-xs">
                                {invoice.title}
                              </span>
                            </span>
                          </div>
                        </InvoiceSpreadsheetCell>
                        <InvoiceSpreadsheetCell>
                          <span className="text-foreground font-medium whitespace-nowrap">
                            {invoice.customer}
                          </span>
                        </InvoiceSpreadsheetCell>
                        <InvoiceSpreadsheetCell>
                          <span className="whitespace-nowrap">
                            {invoice.email}
                          </span>
                        </InvoiceSpreadsheetCell>
                        <InvoiceSpreadsheetCell>
                          <InvoiceStatusBadge status={invoice.status} />
                        </InvoiceSpreadsheetCell>
                        <InvoiceSpreadsheetCell>
                          <span className="text-foreground font-medium">
                            {invoice.amountDue}
                          </span>
                        </InvoiceSpreadsheetCell>
                        <InvoiceSpreadsheetCell className="border-r-0">
                          <time
                            className="text-foreground whitespace-nowrap"
                            dateTime={invoice.dueDateTime}
                          >
                            {invoice.dueDate}
                          </time>
                        </InvoiceSpreadsheetCell>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <InvoiceSpreadsheetCell
                        className="h-32 border-r-0 text-center"
                        colSpan={6}
                      >
                        No invoices match the current filters.
                      </InvoiceSpreadsheetCell>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
              <p className="text-muted-foreground text-sm">
                Showing {paginationStart}-{paginationEnd} of{" "}
                {filteredInvoices.length} invoices
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
    </main>
  );
}
