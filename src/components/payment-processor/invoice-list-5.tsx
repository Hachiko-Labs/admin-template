"use client";

import {
  Download,
  FileText,
  ListFilter,
  Plus,
  Repeat,
  Search,
  X,
} from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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

type InvoiceStatus =
  | "overdue"
  | "sent"
  | "active"
  | "draft"
  | "scheduled"
  | "paid";

type InvoiceRow = {
  id: string;
  customer: string;
  email: string;
  description: string;
  recurring: boolean;
  status: InvoiceStatus;
  amount: number;
  dueDate: string;
  invoiceNumber: string;
  invoiceDate: string;
};

type AmountFloor = 0 | 1000 | 1500 | 3000;

/** Fixed "today" so the relative due labels stay deterministic between renders. */
const referenceDate = Date.UTC(2026, 5, 19);

const pageSize = 10;

const statusMeta: Record<InvoiceStatus, { label: string; className: string }> =
  {
    overdue: {
      label: "Overdue",
      className:
        "border-rose-600/20 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-900/30 dark:text-rose-400",
    },
    sent: {
      label: "Sent",
      className:
        "border-blue-600/20 bg-blue-50 text-blue-700 dark:border-blue-400/20 dark:bg-blue-900/30 dark:text-blue-400",
    },
    active: {
      label: "Active",
      className:
        "border-emerald-600/20 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    draft: {
      label: "Draft",
      className:
        "border-zinc-300 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-300",
    },
    scheduled: {
      label: "Scheduled",
      className:
        "border-violet-600/20 bg-violet-50 text-violet-700 dark:border-violet-400/20 dark:bg-violet-900/30 dark:text-violet-400",
    },
    paid: {
      label: "Paid",
      className:
        "border-teal-600/20 bg-teal-50 text-teal-700 dark:border-teal-400/20 dark:bg-teal-900/30 dark:text-teal-400",
    },
  };

const statusOrder: InvoiceStatus[] = [
  "overdue",
  "sent",
  "active",
  "scheduled",
  "draft",
  "paid",
];

const amountFloors: { value: AmountFloor; label: string }[] = [
  { value: 0, label: "Any amount" },
  { value: 1000, label: "≥ $1,000" },
  { value: 1500, label: "≥ $1,500" },
  { value: 3000, label: "≥ $3,000" },
];

const invoices: InvoiceRow[] = [
  {
    id: "inv_0041",
    customer: "Northline Studio",
    email: "billing@northline.studio",
    description: "Agency plan renewal",
    recurring: true,
    status: "overdue",
    amount: 4800,
    dueDate: "2026-05-12",
    invoiceNumber: "INV-0041",
    invoiceDate: "2026-04-12",
  },
  {
    id: "inv_0038",
    customer: "Solberg & Reiss",
    email: "accounts@solbergreiss.com",
    description: "Template implementation pack",
    recurring: false,
    status: "overdue",
    amount: 3150,
    dueDate: "2026-05-20",
    invoiceNumber: "INV-0038",
    invoiceDate: "2026-04-20",
  },
  {
    id: "inv_0039",
    customer: "Veld & Co",
    email: "finance@veldco.com",
    description: "Admin dashboard kit",
    recurring: false,
    status: "overdue",
    amount: 1890,
    dueDate: "2026-05-25",
    invoiceNumber: "INV-0039",
    invoiceDate: "2026-04-25",
  },
  {
    id: "inv_0042",
    customer: "Halden Robotics",
    email: "ap@haldenrobotics.io",
    description: "Figma kit handoff",
    recurring: false,
    status: "overdue",
    amount: 640,
    dueDate: "2026-06-02",
    invoiceNumber: "INV-0042",
    invoiceDate: "2026-05-02",
  },
  {
    id: "inv_0034",
    customer: "Fernpath Collective",
    email: "billing@fernpath.co",
    description: "Marketing blocks license",
    recurring: false,
    status: "overdue",
    amount: 1450,
    dueDate: "2026-05-06",
    invoiceNumber: "INV-0034",
    invoiceDate: "2026-04-06",
  },
  {
    id: "inv_0043",
    customer: "Archway Infrastructure",
    email: "ap@archwaygroup.com",
    description: "Team seat expansion · 10 seats",
    recurring: true,
    status: "sent",
    amount: 2400,
    dueDate: "2026-06-15",
    invoiceNumber: "INV-0043",
    invoiceDate: "2026-05-15",
  },
  {
    id: "inv_0044",
    customer: "Ember Digital",
    email: "billing@emberdigital.co",
    description: "Marketing blocks license",
    recurring: false,
    status: "sent",
    amount: 1160,
    dueDate: "2026-06-17",
    invoiceNumber: "INV-0044",
    invoiceDate: "2026-05-18",
  },
  {
    id: "inv_0045",
    customer: "Crest Advisory",
    email: "ap@crestadvisory.co",
    description: "Lifetime access bundle",
    recurring: false,
    status: "sent",
    amount: 3400,
    dueDate: "2026-06-21",
    invoiceNumber: "INV-0045",
    invoiceDate: "2026-05-22",
  },
  {
    id: "inv_0051",
    customer: "Sablewood Interactive",
    email: "ap@sablewood.io",
    description: "Team seat expansion · 6 seats",
    recurring: false,
    status: "sent",
    amount: 1440,
    dueDate: "2026-07-10",
    invoiceNumber: "INV-0051",
    invoiceDate: "2026-06-12",
  },
  {
    id: "inv_0052",
    customer: "Peregrine Systems",
    email: "finance@peregrinesys.com",
    description: "Pro blocks license · 12 seats",
    recurring: false,
    status: "sent",
    amount: 3260,
    dueDate: "2026-07-13",
    invoiceNumber: "INV-0052",
    invoiceDate: "2026-06-13",
  },
  {
    id: "inv_0046",
    customer: "Kairos Ventures",
    email: "billing@kairosvs.com",
    description: "Priority support retainer",
    recurring: true,
    status: "active",
    amount: 1800,
    dueDate: "2026-06-24",
    invoiceNumber: "INV-0046",
    invoiceDate: "2026-06-01",
  },
  {
    id: "inv_0053",
    customer: "Orrery Design",
    email: "accounts@orrery.design",
    description: "Priority support retainer",
    recurring: true,
    status: "active",
    amount: 1800,
    dueDate: "2026-06-28",
    invoiceNumber: "INV-0053",
    invoiceDate: "2026-06-14",
  },
  {
    id: "inv_0054",
    customer: "Halcyon Commerce",
    email: "billing@halcyoncommerce.com",
    description: "Ecommerce blocks add-on",
    recurring: false,
    status: "active",
    amount: 1290,
    dueDate: "2026-07-01",
    invoiceNumber: "INV-0054",
    invoiceDate: "2026-06-15",
  },
  {
    id: "inv_0047",
    customer: "Verdant Studio",
    email: "hello@verdantstudio.io",
    description: "Ecommerce blocks add-on",
    recurring: false,
    status: "draft",
    amount: 890,
    dueDate: "2026-07-05",
    invoiceNumber: "INV-0047",
    invoiceDate: "2026-06-05",
  },
  {
    id: "inv_0049",
    customer: "Lumen Health",
    email: "finance@lumenhealth.org",
    description: "Custom block commission",
    recurring: false,
    status: "draft",
    amount: 2750,
    dueDate: "2026-07-12",
    invoiceNumber: "INV-0049",
    invoiceDate: "2026-06-08",
  },
  {
    id: "inv_0050",
    customer: "Tessellate Group",
    email: "ap@tessellate.group",
    description: "Figma kit handoff",
    recurring: false,
    status: "draft",
    amount: 340,
    dueDate: "2026-07-18",
    invoiceNumber: "INV-0050",
    invoiceDate: "2026-06-09",
  },
  {
    id: "inv_0048",
    customer: "Axiom Financial",
    email: "finance@axiomfin.com",
    description: "Pro blocks license · 25 seats",
    recurring: false,
    status: "scheduled",
    amount: 6800,
    dueDate: "2026-07-25",
    invoiceNumber: "INV-0048",
    invoiceDate: "2026-06-10",
  },
  {
    id: "inv_0055",
    customer: "Wexford Analytics",
    email: "ap@wexfordanalytics.com",
    description: "Custom block commission",
    recurring: false,
    status: "scheduled",
    amount: 4250,
    dueDate: "2026-08-01",
    invoiceNumber: "INV-0055",
    invoiceDate: "2026-06-16",
  },
  {
    id: "inv_0040",
    customer: "Dune Creative",
    email: "ar@dunecreative.com",
    description: "Template implementation pack",
    recurring: false,
    status: "paid",
    amount: 1490,
    dueDate: "2026-06-07",
    invoiceNumber: "INV-0040",
    invoiceDate: "2026-05-08",
  },
  {
    id: "inv_0037",
    customer: "Quarry Interface",
    email: "billing@quarryinterface.com",
    description: "Admin dashboard kit",
    recurring: false,
    status: "paid",
    amount: 2290,
    dueDate: "2026-05-30",
    invoiceNumber: "INV-0037",
    invoiceDate: "2026-04-30",
  },
  {
    id: "inv_0036",
    customer: "Beacon & Loom",
    email: "accounts@beaconloom.design",
    description: "Agency plan renewal",
    recurring: true,
    status: "paid",
    amount: 4800,
    dueDate: "2026-05-18",
    invoiceNumber: "INV-0036",
    invoiceDate: "2026-04-18",
  },
  {
    id: "inv_0035",
    customer: "Ridgeway Labs",
    email: "finance@ridgewaylabs.dev",
    description: "Team seat expansion · 4 seats",
    recurring: false,
    status: "paid",
    amount: 960,
    dueDate: "2026-05-09",
    invoiceNumber: "INV-0035",
    invoiceDate: "2026-04-09",
  },
  {
    id: "inv_0033",
    customer: "Meridian Type Co.",
    email: "billing@meridiantype.co",
    description: "Admin dashboard kit",
    recurring: false,
    status: "paid",
    amount: 1890,
    dueDate: "2026-05-02",
    invoiceNumber: "INV-0033",
    invoiceDate: "2026-04-02",
  },
  {
    id: "inv_0032",
    customer: "Alder & Vane",
    email: "finance@aldervane.studio",
    description: "Lifetime access bundle",
    recurring: false,
    status: "paid",
    amount: 3400,
    dueDate: "2026-04-27",
    invoiceNumber: "INV-0032",
    invoiceDate: "2026-03-28",
  },
];

function formatMoney(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatCompactMoney(value: number) {
  if (value < 1000) return `$${value}`;

  return `$${(value / 1000).toLocaleString("en-US", {
    maximumFractionDigits: 1,
  })}K`;
}

function formatDay(isoDate: string) {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function getRelativeDue(row: InvoiceRow) {
  if (row.status === "paid" || row.status === "draft") return null;

  const days = Math.round(
    (Date.parse(`${row.dueDate}T00:00:00Z`) - referenceDate) / 86_400_000,
  );

  if (days < 0) {
    return {
      label: `${Math.abs(days)}d ago`,
      className: "text-rose-600 dark:text-rose-400",
    };
  }

  if (days === 0) {
    return {
      label: "Due today",
      className: "text-amber-600 dark:text-amber-400",
    };
  }

  if (days <= 7) {
    return {
      label: `In ${days}d`,
      className: "text-amber-600 dark:text-amber-400",
    };
  }

  return null;
}

function SummaryCard({
  caption,
  label,
  tone,
  value,
}: {
  caption: string;
  label: string;
  tone?: "danger";
  value: string;
}) {
  return (
    <div className="rounded-xl border p-4 sm:p-5">
      <p className="text-muted-foreground text-sm font-medium">{label}</p>
      <p
        className={cn(
          "mt-3 text-3xl font-semibold tracking-tight tabular-nums",
          tone === "danger" && "text-rose-600 dark:text-rose-400",
        )}
      >
        {value}
      </p>
      <p className="text-muted-foreground mt-2 text-xs">{caption}</p>
    </div>
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
    <span className="bg-background inline-flex h-8 shrink-0 items-center gap-2 rounded-md border pr-1 pl-3 text-[13px] font-medium">
      {children}
      <Button
        className="text-muted-foreground hover:text-foreground size-6 rounded-sm"
        onClick={onClear}
        size="icon"
        type="button"
        variant="ghost"
      >
        <X className="size-3.5" aria-hidden="true" />
        <span className="sr-only">Clear filter</span>
      </Button>
    </span>
  );
}

function StatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <Badge
      className={cn(
        "h-6 rounded-md px-2 text-[11px] font-medium shadow-none",
        statusMeta[status].className,
      )}
      variant="outline"
    >
      {statusMeta[status].label}
    </Badge>
  );
}

export function PaymentProcessorInvoiceList5() {
  const [query, setQuery] = React.useState("");
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [amountFloor, setAmountFloor] = React.useState<AmountFloor>(1000);
  const [statusFilter, setStatusFilter] = React.useState<InvoiceStatus[]>([]);
  const [showAllChips, setShowAllChips] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [page, setPage] = React.useState(1);

  const summary = React.useMemo(() => {
    const outstanding = invoices.filter(
      (row) => row.status !== "paid" && row.status !== "draft",
    );
    const drafts = invoices.filter((row) => row.status === "draft");
    const overdue = invoices.filter((row) => row.status === "overdue");
    const paid = invoices.filter((row) => row.status === "paid");
    const sum = (rows: InvoiceRow[]) =>
      rows.reduce((total, row) => total + row.amount, 0);

    return {
      outstanding: { total: sum(outstanding), count: outstanding.length },
      drafts: drafts.length,
      overdue: { total: sum(overdue), count: overdue.length },
      paid: { total: sum(paid), count: paid.length },
    };
  }, []);

  const filteredRows = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return invoices.filter((row) => {
      const matchesQuery =
        !normalizedQuery ||
        [row.customer, row.email, row.description, row.invoiceNumber]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesAmount = row.amount >= amountFloor;
      const matchesStatus =
        statusFilter.length === 0 || statusFilter.includes(row.status);

      return matchesQuery && matchesAmount && matchesStatus;
    });
  }, [amountFloor, query, statusFilter]);

  const activeChips = React.useMemo(() => {
    const chips: { key: string; label: string; onClear: () => void }[] = [];

    if (amountFloor !== 0) {
      chips.push({
        key: "amount",
        label: `Amount ${amountFloors.find((floor) => floor.value === amountFloor)?.label ?? ""}`,
        onClear: () => setAmountFloor(0),
      });
    }

    for (const status of statusFilter) {
      chips.push({
        key: `status-${status}`,
        label: `Status ${statusMeta[status].label}`,
        onClear: () =>
          setStatusFilter((current) =>
            current.filter((value) => value !== status),
          ),
      });
    }

    return chips;
  }, [amountFloor, statusFilter]);

  const visibleChips = showAllChips ? activeChips : activeChips.slice(0, 2);
  const hiddenChipCount = activeChips.length - visibleChips.length;

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = filteredRows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  React.useEffect(() => {
    setPage(1);
  }, [amountFloor, query, statusFilter]);

  const selectedOnPage = pageRows.filter((row) => selectedIds.includes(row.id));
  const allSelected =
    pageRows.length > 0 && selectedOnPage.length === pageRows.length;

  const toggleAll = () => {
    const pageIds = pageRows.map((row) => row.id);

    setSelectedIds((current) =>
      allSelected
        ? current.filter((id) => !pageIds.includes(id))
        : [...new Set([...current, ...pageIds])],
    );
  };

  const toggleRow = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  };

  const toggleStatus = (status: InvoiceStatus) => {
    setStatusFilter((current) =>
      current.includes(status)
        ? current.filter((value) => value !== status)
        : [...current, status],
    );
  };

  return (
    <main className="bg-background text-foreground flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="vertical-scrollbar min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Invoicing
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Track licenses, seat expansions, and kit purchases across
                customers.
              </p>
            </div>
            <Button className="h-9 shrink-0 rounded-full" type="button">
              <Plus className="size-4" aria-hidden="true" />
              New invoice
            </Button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SummaryCard
              caption={`${summary.outstanding.count} invoices · ${summary.drafts} drafts`}
              label="Outstanding"
              value={formatCompactMoney(summary.outstanding.total)}
            />
            <SummaryCard
              caption={`${summary.overdue.count} invoices`}
              label="Overdue"
              tone="danger"
              value={formatCompactMoney(summary.overdue.total)}
            />
            <SummaryCard
              caption={`${summary.paid.count} invoices`}
              label="Paid"
              value={formatCompactMoney(summary.paid.total)}
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  className="h-8 shrink-0 rounded-md text-[13px] font-medium shadow-none"
                  type="button"
                  variant="outline"
                >
                  <ListFilter className="size-4" aria-hidden="true" />
                  Filters
                  {activeChips.length > 0 ? (
                    <span className="bg-muted text-foreground ml-1 grid size-5 place-items-center rounded text-[11px] font-semibold tabular-nums">
                      {activeChips.length}
                    </span>
                  ) : null}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-64 p-0">
                <div className="border-b p-3">
                  <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
                    Status
                  </p>
                  <div className="mt-2 space-y-2">
                    {statusOrder.map((status) => (
                      <div className="flex items-center gap-2" key={status}>
                        <Checkbox
                          checked={statusFilter.includes(status)}
                          id={`status-${status}`}
                          onCheckedChange={() => toggleStatus(status)}
                        />
                        <Label
                          className="text-sm font-normal"
                          htmlFor={`status-${status}`}
                        >
                          {statusMeta[status].label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
                    Amount
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-1.5">
                    {amountFloors.map((floor) => (
                      <Button
                        className={cn(
                          "h-8 rounded-md text-xs font-medium shadow-none",
                          amountFloor === floor.value &&
                            "border-foreground/25 bg-muted",
                        )}
                        key={floor.value}
                        onClick={() => setAmountFloor(floor.value)}
                        type="button"
                        variant="outline"
                      >
                        {floor.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {visibleChips.map((chip) => (
              <FilterChip key={chip.key} onClear={chip.onClear}>
                {chip.label}
              </FilterChip>
            ))}

            {hiddenChipCount > 0 || showAllChips ? (
              <Button
                className="text-muted-foreground hover:text-foreground h-8 shrink-0 rounded-md px-2 text-[13px] font-medium"
                onClick={() => setShowAllChips((current) => !current)}
                type="button"
                variant="ghost"
              >
                {showAllChips ? "Show less" : `+${hiddenChipCount} more`}
              </Button>
            ) : null}

            <div className="ml-auto flex shrink-0 items-center gap-2">
              {searchOpen ? (
                <div className="relative">
                  <Search
                    aria-hidden="true"
                    className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                  />
                  <Input
                    aria-label="Search invoices"
                    autoFocus
                    className="h-8 w-48 rounded-md pr-8 pl-9 text-[13px] shadow-none sm:w-60"
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search invoices"
                    type="search"
                    value={query}
                  />
                  <Button
                    className="absolute top-1/2 right-1 size-6 -translate-y-1/2 rounded-sm"
                    onClick={() => {
                      setQuery("");
                      setSearchOpen(false);
                    }}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <X className="size-3.5" aria-hidden="true" />
                    <span className="sr-only">Close search</span>
                  </Button>
                </div>
              ) : (
                <Button
                  className="size-8 rounded-md shadow-none"
                  onClick={() => setSearchOpen(true)}
                  size="icon"
                  type="button"
                  variant="outline"
                >
                  <Search className="size-4" aria-hidden="true" />
                  <span className="sr-only">Search invoices</span>
                </Button>
              )}
              <Button
                className="h-8 rounded-md text-[13px] font-medium shadow-none"
                type="button"
                variant="outline"
              >
                <Download className="size-4" aria-hidden="true" />
                Export all
              </Button>
            </div>
          </div>

          {selectedOnPage.length > 0 ? (
            <div className="bg-muted/40 mt-4 flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2">
              <p className="text-sm font-medium tabular-nums">
                {selectedOnPage.length} selected
              </p>
              <span className="text-muted-foreground text-sm tabular-nums">
                {formatMoney(
                  selectedOnPage.reduce((total, row) => total + row.amount, 0),
                )}
              </span>
              <div className="ml-auto flex items-center gap-2">
                <Button
                  className="h-8 rounded-md text-[13px] shadow-none"
                  type="button"
                  variant="outline"
                >
                  Send reminder
                </Button>
                <Button
                  className="h-8 rounded-md text-[13px]"
                  onClick={() => setSelectedIds([])}
                  type="button"
                  variant="ghost"
                >
                  Clear
                </Button>
              </div>
            </div>
          ) : null}

          <div className="mt-4 overflow-x-auto rounded-xl border">
            <Table className="min-w-[1080px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-11 w-12 px-4">
                    <Checkbox
                      aria-label="Select all invoices"
                      checked={
                        allSelected
                          ? true
                          : selectedOnPage.length > 0
                            ? "indeterminate"
                            : false
                      }
                      disabled={pageRows.length === 0}
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead className="text-muted-foreground h-11 min-w-[220px] px-3 text-sm font-medium">
                    Customer
                  </TableHead>
                  <TableHead className="text-muted-foreground h-11 min-w-[200px] px-3 text-sm font-medium">
                    Description
                  </TableHead>
                  <TableHead className="text-muted-foreground h-11 min-w-[120px] px-3 text-sm font-medium">
                    Status
                  </TableHead>
                  <TableHead className="text-muted-foreground h-11 min-w-[120px] px-3 text-right text-sm font-medium">
                    Amount
                  </TableHead>
                  <TableHead className="text-muted-foreground h-11 min-w-[120px] px-3 text-sm font-medium">
                    Due date
                  </TableHead>
                  <TableHead className="text-muted-foreground h-11 min-w-[120px] px-3 text-sm font-medium">
                    Invoice no.
                  </TableHead>
                  <TableHead className="text-muted-foreground h-11 min-w-[120px] px-3 text-sm font-medium">
                    Invoice date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.length > 0 ? (
                  pageRows.map((row) => {
                    const relativeDue = getRelativeDue(row);
                    const isSelected = selectedIds.includes(row.id);

                    return (
                      <TableRow
                        className={cn(
                          "hover:bg-muted/30",
                          isSelected && "bg-muted/40",
                        )}
                        key={row.id}
                      >
                        <TableCell className="w-12 px-4 py-3">
                          <Checkbox
                            aria-label={`Select ${row.invoiceNumber}`}
                            checked={isSelected}
                            onCheckedChange={() => toggleRow(row.id)}
                          />
                        </TableCell>
                        <TableCell className="min-w-0 px-3 py-3">
                          <p className="truncate text-sm font-medium">
                            {row.customer}
                          </p>
                          <p className="text-muted-foreground truncate text-xs">
                            {row.email}
                          </p>
                        </TableCell>
                        <TableCell className="min-w-0 px-3 py-3">
                          <div className="flex min-w-0 items-center gap-2">
                            {row.recurring ? (
                              <Repeat
                                aria-hidden="true"
                                className="text-muted-foreground size-3.5 shrink-0"
                              />
                            ) : null}
                            <span className="truncate text-sm">
                              {row.description}
                            </span>
                            {row.recurring ? (
                              <span className="sr-only">Recurring invoice</span>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="px-3 py-3">
                          <StatusBadge status={row.status} />
                        </TableCell>
                        <TableCell className="px-3 py-3 text-right text-sm font-medium tabular-nums">
                          {formatMoney(row.amount)}
                        </TableCell>
                        <TableCell className="px-3 py-3">
                          <p className="text-sm tabular-nums">
                            {formatDay(row.dueDate)}
                          </p>
                          {relativeDue ? (
                            <p
                              className={cn(
                                "text-xs tabular-nums",
                                relativeDue.className,
                              )}
                            >
                              {relativeDue.label}
                            </p>
                          ) : null}
                        </TableCell>
                        <TableCell className="text-muted-foreground px-3 py-3 text-sm tabular-nums">
                          {row.invoiceNumber}
                        </TableCell>
                        <TableCell className="text-muted-foreground px-3 py-3 text-sm tabular-nums">
                          {formatDay(row.invoiceDate)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow className="hover:bg-transparent">
                    <TableCell className="h-64 text-center" colSpan={8}>
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-muted grid size-12 place-items-center rounded-lg border">
                          <FileText className="text-muted-foreground size-5" />
                        </div>
                        <p className="mt-4 text-sm font-semibold">
                          No invoices match these filters
                        </p>
                        <p className="text-muted-foreground mt-1 max-w-72 text-sm">
                          Clear a filter chip or widen the amount range to bring
                          invoices back into the list.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground text-sm tabular-nums">
              Showing {pageRows.length} of {filteredRows.length} invoices
            </p>

            <Pagination className="mx-0 w-auto justify-start sm:justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    aria-disabled={currentPage === 1}
                    className={cn(
                      "h-8 text-[13px]",
                      currentPage === 1 &&
                        "text-muted-foreground pointer-events-none opacity-50",
                    )}
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      setPage((current) => Math.max(1, current - 1));
                    }}
                  />
                </PaginationItem>

                {Array.from({ length: pageCount }, (_, index) => index + 1).map(
                  (pageNumber) => (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        className="size-8 text-[13px] tabular-nums"
                        href="#"
                        isActive={pageNumber === currentPage}
                        onClick={(event) => {
                          event.preventDefault();
                          setPage(pageNumber);
                        }}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}

                <PaginationItem>
                  <PaginationNext
                    aria-disabled={currentPage === pageCount}
                    className={cn(
                      "h-8 text-[13px]",
                      currentPage === pageCount &&
                        "text-muted-foreground pointer-events-none opacity-50",
                    )}
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      setPage((current) => Math.min(pageCount, current + 1));
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </main>
  );
}
