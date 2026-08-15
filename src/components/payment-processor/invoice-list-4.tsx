"use client";

import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Mail,
  Plus,
  Printer,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react";
import * as React from "react";

import { Logo } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type InvoiceStatus = "paid" | "sent" | "overdue" | "draft" | "void";
type InvoiceFilter = "all" | "open" | "paid" | "attention";

type InvoiceLineItem = {
  description: string;
  detail: string;
  qty: string;
  rate: string;
  tax: string;
  amount: string;
};

type PaymentRecord = {
  id: string;
  date: string;
  reference: string;
  amount: string;
  method: string;
};

type InvoiceRecord = {
  id: string;
  invoiceNumber: string;
  title: string;
  customer: string;
  customerEmail: string;
  status: InvoiceStatus;
  issued: string;
  due: string;
  total: string;
  subtotal: string;
  tax: string;
  paid: string;
  amountDue: string;
  paymentMethod: string;
  poNumber: string;
  address: string;
  lineItems: InvoiceLineItem[];
  payments: PaymentRecord[];
};

const statusMeta: Record<
  InvoiceStatus,
  { label: string; className: string; dotClassName: string }
> = {
  paid: {
    label: "Paid",
    className:
      "border-emerald-600/20 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-900/30 dark:text-emerald-400",
    dotClassName: "bg-emerald-500",
  },
  sent: {
    label: "Sent",
    className:
      "border-blue-600/20 bg-blue-50 text-blue-700 dark:border-blue-400/20 dark:bg-blue-900/30 dark:text-blue-400",
    dotClassName: "bg-blue-500",
  },
  overdue: {
    label: "Overdue",
    className:
      "border-amber-600/20 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-900/30 dark:text-amber-400",
    dotClassName: "bg-amber-500",
  },
  draft: {
    label: "Draft",
    className:
      "border-zinc-300 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-300",
    dotClassName: "bg-zinc-400",
  },
  void: {
    label: "Void",
    className:
      "border-rose-600/20 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-900/30 dark:text-rose-400",
    dotClassName: "bg-rose-500",
  },
};

const filters: { value: InvoiceFilter; label: string }[] = [
  { value: "all", label: "All invoices" },
  { value: "open", label: "Open" },
  { value: "paid", label: "Paid" },
  { value: "attention", label: "Needs attention" },
];

const invoices: InvoiceRecord[] = [
  {
    id: "inv_7184",
    invoiceNumber: "INV-7184",
    title: "Pro blocks license",
    customer: "Northline Studio",
    customerEmail: "billing@northline.studio",
    status: "sent",
    issued: "Jun 14, 2026",
    due: "Jul 12, 2026",
    total: "$2,499.00",
    subtotal: "$2,271.82",
    tax: "$227.18",
    paid: "$0.00",
    amountDue: "$2,499.00",
    paymentMethod: "ACH debit",
    poNumber: "NL-4826",
    address: "311 Mercer Street, New York, NY 10012",
    lineItems: [
      {
        description: "Pro blocks license",
        detail: "Lifetime access for product billing teams",
        qty: "1",
        rate: "$1,680.00",
        tax: "10%",
        amount: "$1,680.00",
      },
      {
        description: "Private onboarding",
        detail: "Component mapping and team workspace setup",
        qty: "3",
        rate: "$264.00",
        tax: "10%",
        amount: "$792.00",
      },
      {
        description: "Receipt template pack",
        detail: "Hosted invoice and payment receipt templates",
        qty: "1",
        rate: "$27.00",
        tax: "10%",
        amount: "$27.00",
      },
    ],
    payments: [],
  },
  {
    id: "inv_7183",
    invoiceNumber: "INV-7183",
    title: "Admin kit integration",
    customer: "Vela Design Co.",
    customerEmail: "finance@veladesign.co",
    status: "paid",
    issued: "Jun 11, 2026",
    due: "Jun 28, 2026",
    total: "$8,400.00",
    subtotal: "$7,636.36",
    tax: "$763.64",
    paid: "$8,400.00",
    amountDue: "$0.00",
    paymentMethod: "Visa ending 4928",
    poNumber: "VD-2026-118",
    address: "88 Minna Street, San Francisco, CA 94105",
    lineItems: [
      {
        description: "Admin kit integration",
        detail: "Tables, charts, shells, and processor workflows",
        qty: "12",
        rate: "$540.00",
        tax: "10%",
        amount: "$6,480.00",
      },
      {
        description: "QA implementation pass",
        detail: "Responsive verification and invoice PDF tuning",
        qty: "4",
        rate: "$480.00",
        tax: "10%",
        amount: "$1,920.00",
      },
    ],
    payments: [
      {
        id: "PAY-428",
        date: "Jun 17, 2026",
        reference: "pay_39JF72K",
        amount: "$4,200.00",
        method: "Visa 4928",
      },
      {
        id: "PAY-431",
        date: "Jun 22, 2026",
        reference: "pay_39MG18P",
        amount: "$4,200.00",
        method: "Visa 4928",
      },
    ],
  },
  {
    id: "inv_7182",
    invoiceNumber: "INV-7182",
    title: "Template migration",
    customer: "Harborline Apps",
    customerEmail: "ap@harborline.app",
    status: "overdue",
    issued: "Jun 1, 2026",
    due: "Jun 12, 2026",
    total: "$3,180.00",
    subtotal: "$2,890.91",
    tax: "$289.09",
    paid: "$0.00",
    amountDue: "$3,180.00",
    paymentMethod: "Bank transfer",
    poNumber: "HA-7791",
    address: "42 Congress Avenue, Austin, TX 78701",
    lineItems: [
      {
        description: "Template migration",
        detail: "Move billing templates into processor workspace",
        qty: "6",
        rate: "$395.00",
        tax: "10%",
        amount: "$2,370.00",
      },
      {
        description: "Data cleanup",
        detail: "Normalize customer contacts and invoice metadata",
        qty: "3",
        rate: "$270.00",
        tax: "10%",
        amount: "$810.00",
      },
    ],
    payments: [],
  },
  {
    id: "inv_7181",
    invoiceNumber: "INV-7181",
    title: "Duplicate component order",
    customer: "Pollen Interface",
    customerEmail: "ops@polleninterface.com",
    status: "void",
    issued: "May 29, 2026",
    due: "Jun 8, 2026",
    total: "$899.00",
    subtotal: "$899.00",
    tax: "$0.00",
    paid: "$0.00",
    amountDue: "$0.00",
    paymentMethod: "Mastercard ending 1882",
    poNumber: "PI-094",
    address: "27 Wacker Drive, Chicago, IL 60606",
    lineItems: [
      {
        description: "Duplicate component order",
        detail: "Voided before capture after reconciliation review",
        qty: "1",
        rate: "$499.00",
        tax: "0%",
        amount: "$499.00",
      },
      {
        description: "Processor reversal review",
        detail: "Support review for duplicate checkout session",
        qty: "2",
        rate: "$200.00",
        tax: "0%",
        amount: "$400.00",
      },
    ],
    payments: [],
  },
  {
    id: "inv_7180",
    invoiceNumber: "INV-7180",
    title: "Figma kit handoff",
    customer: "Argent Labs",
    customerEmail: "billing@argentlabs.dev",
    status: "draft",
    issued: "May 27, 2026",
    due: "Jun 24, 2026",
    total: "$1,950.00",
    subtotal: "$1,772.73",
    tax: "$177.27",
    paid: "$0.00",
    amountDue: "$1,950.00",
    paymentMethod: "ACH debit",
    poNumber: "AL-3208",
    address: "149 Newbury Street, Boston, MA 02116",
    lineItems: [
      {
        description: "Figma kit handoff",
        detail: "Variables, examples, and annotated invoice blocks",
        qty: "2",
        rate: "$650.00",
        tax: "10%",
        amount: "$1,300.00",
      },
      {
        description: "Design QA notes",
        detail: "Annotated implementation review for product team",
        qty: "1",
        rate: "$410.00",
        tax: "10%",
        amount: "$410.00",
      },
      {
        description: "Token export",
        detail: "Color and spacing token package for engineers",
        qty: "1",
        rate: "$240.00",
        tax: "10%",
        amount: "$240.00",
      },
    ],
    payments: [],
  },
  {
    id: "inv_7179",
    invoiceNumber: "INV-7179",
    title: "Lifetime access bundle",
    customer: "Cedar UI Works",
    customerEmail: "receipts@cedarui.works",
    status: "paid",
    issued: "May 16, 2026",
    due: "Jun 3, 2026",
    total: "$6,800.00",
    subtotal: "$6,181.82",
    tax: "$618.18",
    paid: "$6,800.00",
    amountDue: "$0.00",
    paymentMethod: "Wire transfer",
    poNumber: "CUW-641",
    address: "612 Pearl Parkway, San Antonio, TX 78215",
    lineItems: [
      {
        description: "Lifetime access bundle",
        detail: "Workspace licensing for design systems and admin pages",
        qty: "6",
        rate: "$850.00",
        tax: "10%",
        amount: "$5,100.00",
      },
      {
        description: "Seat expansion",
        detail: "Additional seats for operations and support teams",
        qty: "2",
        rate: "$650.00",
        tax: "10%",
        amount: "$1,300.00",
      },
      {
        description: "Billing portal setup",
        detail: "Hosted customer portal and subscription receipt setup",
        qty: "1",
        rate: "$400.00",
        tax: "10%",
        amount: "$400.00",
      },
    ],
    payments: [
      {
        id: "PAY-419",
        date: "May 24, 2026",
        reference: "wire_11KD80A",
        amount: "$6,800.00",
        method: "Wire transfer",
      },
    ],
  },
  {
    id: "inv_7178",
    invoiceNumber: "INV-7178",
    title: "Private block request",
    customer: "North Pier Digital",
    customerEmail: "accounts@northpier.digital",
    status: "overdue",
    issued: "May 8, 2026",
    due: "May 25, 2026",
    total: "$2,750.00",
    subtotal: "$2,500.00",
    tax: "$250.00",
    paid: "$0.00",
    amountDue: "$2,750.00",
    paymentMethod: "ACH debit",
    poNumber: "NPD-710",
    address: "501 Boylston Street, Boston, MA 02116",
    lineItems: [
      {
        description: "Private block request",
        detail: "Custom processor reports and invoice aging states",
        qty: "3",
        rate: "$550.00",
        tax: "10%",
        amount: "$1,650.00",
      },
      {
        description: "Collections view",
        detail: "Overdue states and payment retry controls",
        qty: "2",
        rate: "$430.00",
        tax: "10%",
        amount: "$860.00",
      },
      {
        description: "Review session",
        detail: "Implementation review with operations leads",
        qty: "1",
        rate: "$240.00",
        tax: "10%",
        amount: "$240.00",
      },
    ],
    payments: [],
  },
  {
    id: "inv_7177",
    invoiceNumber: "INV-7177",
    title: "Payment portal polish",
    customer: "Rune Atelier",
    customerEmail: "studio@runeatelier.com",
    status: "sent",
    issued: "May 3, 2026",
    due: "Jun 20, 2026",
    total: "$4,120.00",
    subtotal: "$3,745.45",
    tax: "$374.55",
    paid: "$2,920.00",
    amountDue: "$1,200.00",
    paymentMethod: "Card on file",
    poNumber: "RA-2206",
    address: "18 King Street, Seattle, WA 98104",
    lineItems: [
      {
        description: "Payment portal polish",
        detail: "Hosted payment page layout and receipt states",
        qty: "4",
        rate: "$520.00",
        tax: "10%",
        amount: "$2,080.00",
      },
      {
        description: "Dunning email templates",
        detail: "Reminder copy, overdue states, and recovery emails",
        qty: "3",
        rate: "$420.00",
        tax: "10%",
        amount: "$1,260.00",
      },
      {
        description: "Partial payment setup",
        detail: "Split capture settings and payment method testing",
        qty: "2",
        rate: "$390.00",
        tax: "10%",
        amount: "$780.00",
      },
    ],
    payments: [
      {
        id: "PAY-412",
        date: "May 18, 2026",
        reference: "card_41QE20K",
        amount: "$2,920.00",
        method: "Card on file",
      },
    ],
  },
  {
    id: "inv_7176",
    invoiceNumber: "INV-7176",
    title: "Audit dashboard blocks",
    customer: "Prism Labs",
    customerEmail: "finance@prismlabs.dev",
    status: "paid",
    issued: "Apr 22, 2026",
    due: "May 14, 2026",
    total: "$5,400.00",
    subtotal: "$4,909.09",
    tax: "$490.91",
    paid: "$5,400.00",
    amountDue: "$0.00",
    paymentMethod: "Visa ending 2250",
    poNumber: "PL-5514",
    address: "702 Mission Street, San Francisco, CA 94103",
    lineItems: [
      {
        description: "Audit dashboard blocks",
        detail: "KPI cards, review queues, and exportable reports",
        qty: "5",
        rate: "$620.00",
        tax: "10%",
        amount: "$3,100.00",
      },
      {
        description: "Chart implementation",
        detail: "Trend charts, variance markers, and empty states",
        qty: "3",
        rate: "$540.00",
        tax: "10%",
        amount: "$1,620.00",
      },
      {
        description: "Reviewer permissions",
        detail: "Role-based panels and audit trail refinements",
        qty: "2",
        rate: "$340.00",
        tax: "10%",
        amount: "$680.00",
      },
    ],
    payments: [
      {
        id: "PAY-401",
        date: "May 9, 2026",
        reference: "card_19PK44Q",
        amount: "$5,400.00",
        method: "Visa 2250",
      },
    ],
  },
  {
    id: "inv_7175",
    invoiceNumber: "INV-7175",
    title: "Invoice PDF templates",
    customer: "Northstar Media",
    customerEmail: "billing@northstar.media",
    status: "overdue",
    issued: "Apr 18, 2026",
    due: "May 2, 2026",
    total: "$2,980.00",
    subtotal: "$2,709.09",
    tax: "$270.91",
    paid: "$0.00",
    amountDue: "$2,980.00",
    paymentMethod: "Bank transfer",
    poNumber: "NM-0502",
    address: "19 Market Street, Denver, CO 80202",
    lineItems: [
      {
        description: "Invoice PDF templates",
        detail: "Printable PDF variants for paid, overdue, and draft states",
        qty: "3",
        rate: "$520.00",
        tax: "10%",
        amount: "$1,560.00",
      },
      {
        description: "Receipt correction flow",
        detail: "Credit memo states and revised invoice messaging",
        qty: "2",
        rate: "$410.00",
        tax: "10%",
        amount: "$820.00",
      },
      {
        description: "Export QA",
        detail: "Browser, print, and email attachment verification",
        qty: "2",
        rate: "$300.00",
        tax: "10%",
        amount: "$600.00",
      },
    ],
    payments: [],
  },
];
function moneyToNumber(value: string) {
  return Number(value.replace(/[^0-9.-]+/g, ""));
}

function getListMask(scrollTop: number, maxScroll: number) {
  const topFadeOpacity = Math.max(0, Math.min(1, scrollTop / 60));
  const bottomFadeOpacity = Math.max(
    0,
    Math.min(1, (maxScroll - scrollTop) / 60),
  );

  return `linear-gradient(to bottom, rgba(0,0,0,${
    1 - topFadeOpacity
  }) 0%, rgba(0,0,0,1) 15%, rgba(0,0,0,1) 85%, rgba(0,0,0,${
    1 - bottomFadeOpacity
  }) 100%)`;
}

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const meta = statusMeta[status];

  return (
    <Badge
      className={cn(
        "h-6 gap-1.5 rounded-md px-2 text-[11px] font-medium shadow-none",
        meta.className,
      )}
      variant="outline"
    >
      <span className={cn("size-1.5 rounded-full", meta.dotClassName)} />
      {meta.label}
    </Badge>
  );
}

function InvoiceListRow({
  invoice,
  isActive,
  onSelect,
}: {
  invoice: InvoiceRecord;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className={cn(
        "group relative grid min-h-[4.75rem] w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b px-4 py-3 text-left transition-colors sm:px-5",
        "hover:bg-muted/25",
        isActive &&
          "bg-[linear-gradient(90deg,color-mix(in_oklch,var(--foreground)_5%,transparent),transparent_72%)]",
      )}
      onClick={onSelect}
      type="button"
    >
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-sm font-semibold tracking-[-0.01em]">
            {invoice.customer}
          </p>
          <span className="text-muted-foreground hidden text-xs sm:inline">
            {invoice.invoiceNumber}
          </span>
        </div>
        <div className="text-muted-foreground mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-5">
          <span className="truncate">{invoice.title}</span>
          <span aria-hidden="true">/</span>
          <span>{invoice.issued}</span>
          <span aria-hidden="true">/</span>
          <span className="font-medium tabular-nums">{invoice.total}</span>
        </div>
      </div>
      <div className="flex min-w-28 flex-col items-end gap-2">
        <StatusBadge status={invoice.status} />
        <p className="text-muted-foreground text-xs tabular-nums">
          Due {invoice.due}
        </p>
      </div>
    </button>
  );
}

function PreviewAddress({ label, lines }: { label: string; lines: string[] }) {
  return (
    <div className="min-w-0">
      <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
        {label}
      </p>
      <div className="mt-2 space-y-1 text-xs leading-5 font-medium">
        {lines.map((line) => (
          <p className="break-words" key={line}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

function TotalRow({
  className,
  label,
  value,
}: {
  className?: string;
  label: string;
  value: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

function InvoiceStatusStamp({ status }: { status: InvoiceStatus }) {
  const stampStyles: Record<InvoiceStatus, string> = {
    paid: "border-emerald-600/70 text-emerald-700 bg-emerald-50/70 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-400/60",
    sent: "border-blue-600/70 text-blue-700 bg-blue-50/70 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-400/60",
    overdue:
      "border-amber-600/80 text-amber-700 bg-amber-50/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-400/70",
    draft:
      "border-zinc-500/70 text-zinc-600 bg-zinc-100/70 dark:bg-zinc-900/60 dark:text-zinc-300 dark:border-zinc-500/70",
    void: "border-rose-600/75 text-rose-700 bg-rose-50/70 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-400/70",
  };

  return (
    <div
      className={cn(
        "pointer-events-none absolute top-24 right-6 hidden rotate-[-10deg] rounded-sm border-2 px-3 py-1 text-base font-black tracking-[0.18em] uppercase opacity-70 shadow-[0_8px_24px_-20px_currentColor] md:block",
        stampStyles[status],
      )}
    >
      {statusMeta[status].label}
    </div>
  );
}

function InvoicePreview({ invoice }: { invoice: InvoiceRecord }) {
  return (
    <section className="bg-[color-mix(in_oklch,var(--muted)_55%,var(--background))] p-4 sm:p-5 xl:p-6">
      <div className="bg-card text-card-foreground ring-border/80 relative mx-auto max-w-[44rem] overflow-hidden rounded-xl p-5 shadow-[0_18px_45px_-26px_color-mix(in_oklch,var(--foreground)_30%,transparent)] ring-1 sm:p-6 lg:p-7">
        <InvoiceStatusStamp status={invoice.status} />

        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase">
              Invoice
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">
              {invoice.invoiceNumber}
            </h3>
            <p className="text-muted-foreground mt-2 text-xs">
              Issued {invoice.issued} / Due {invoice.due}
            </p>
          </div>
          <div className="bg-primary text-primary-foreground grid size-10 shrink-0 place-items-center rounded-full">
            <Logo
              alt="Shadcnblocks"
              className="size-5 object-contain brightness-0 invert dark:invert-0"
              height={20}
              src="/logo-black.svg"
              width={20}
            />
          </div>
        </div>

        <div className="mt-8 grid gap-5 border-y py-5 sm:grid-cols-2">
          <PreviewAddress
            label="From"
            lines={[
              "Shadcnblocks.com",
              "Level 12, 45 Clarence Street",
              "Sydney NSW 2000",
            ]}
          />
          <PreviewAddress
            label="Bill to"
            lines={[invoice.customer, invoice.customerEmail, invoice.address]}
          />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border p-3">
            <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
              Method
            </p>
            <p className="mt-2 truncate text-sm font-semibold">
              {invoice.paymentMethod}
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
              Reference
            </p>
            <p className="mt-2 text-sm font-semibold tabular-nums">
              {invoice.poNumber}
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
              Due
            </p>
            <p className="mt-2 text-sm font-semibold tabular-nums">
              {invoice.amountDue}
            </p>
          </div>
        </div>

        <div className="mt-7">
          <div className="flex items-center gap-3">
            <p className="shrink-0 text-sm font-semibold">
              Work order {invoice.poNumber}
            </p>
            <span className="border-border min-w-0 flex-1 border-t border-dashed" />
          </div>

          <div className="mt-3 overflow-hidden rounded-lg border">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/55 text-muted-foreground">
                <tr>
                  <th className="w-10 px-3 py-2 font-medium">#</th>
                  <th className="px-3 py-2 font-medium">Description</th>
                  <th className="hidden w-16 px-3 py-2 text-right font-medium sm:table-cell">
                    Qty
                  </th>
                  <th className="hidden w-24 px-3 py-2 text-right font-medium md:table-cell">
                    Rate
                  </th>
                  <th className="w-28 px-3 py-2 text-right font-medium">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoice.lineItems.map((item, index) => (
                  <tr key={`${invoice.id}-${item.description}`}>
                    <td className="text-muted-foreground px-3 py-3 align-top tabular-nums">
                      {index + 1}
                    </td>
                    <td className="min-w-0 px-3 py-3 align-top">
                      <p className="truncate font-semibold">
                        {item.description}
                      </p>
                      <p className="text-muted-foreground mt-1 line-clamp-2 leading-4">
                        {item.detail}
                      </p>
                      <p className="text-muted-foreground mt-1 text-[11px] tabular-nums sm:hidden">
                        Qty {item.qty} / {item.rate} / Tax {item.tax}
                      </p>
                    </td>
                    <td className="hidden px-3 py-3 text-right align-top tabular-nums sm:table-cell">
                      {item.qty}
                    </td>
                    <td className="text-muted-foreground hidden px-3 py-3 text-right align-top tabular-nums md:table-cell">
                      {item.rate}
                    </td>
                    <td className="px-3 py-3 text-right align-top font-semibold tabular-nums">
                      {item.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <dl className="mt-5 ml-auto w-full max-w-xs space-y-2 text-sm">
          <TotalRow label="Subtotal" value={invoice.subtotal} />
          <TotalRow label="Tax" value={invoice.tax} />
          <TotalRow
            className="text-foreground border-t pt-3"
            label="Total"
            value={invoice.total}
          />
          <TotalRow label="Paid" value={invoice.paid} />
          <TotalRow
            className="text-primary"
            label="Amount due"
            value={invoice.amountDue}
          />
        </dl>

        <p className="text-muted-foreground mt-8 border-t pt-5 text-xs leading-5">
          For payment questions, receipt corrections, or remittance advice,
          contact billing@shadcnblocks.com.
        </p>
      </div>
    </section>
  );
}
function DetailPane({ invoice }: { invoice: InvoiceRecord }) {
  const actions = [
    { icon: Send, label: "Send invoice" },
    { icon: Printer, label: "Print invoice" },
    { icon: Mail, label: "Email customer" },
    { icon: Trash2, label: "Delete invoice", destructive: true },
  ];

  return (
    <aside className="bg-background flex min-h-0 flex-col overflow-hidden border-t lg:border-t-0 lg:border-l">
      <div className="flex items-center justify-between gap-4 border-b px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="text-sm font-semibold">Invoice Details</p>
          <p className="text-muted-foreground truncate text-xs">
            {invoice.invoiceNumber} for {invoice.customer}
          </p>
        </div>
        <div className="flex items-center rounded-md border">
          {actions.map(({ destructive, icon: ActionIcon, label }) => (
            <Button
              className={cn(
                "size-8 rounded-none border-r shadow-none first:rounded-l-md last:rounded-r-md last:border-r-0",
                destructive &&
                  "text-[color-mix(in_oklch,var(--destructive)_82%,var(--foreground))]",
              )}
              key={label}
              size="icon"
              type="button"
              variant="ghost"
            >
              <ActionIcon className="size-4" aria-hidden="true" />
              <span className="sr-only">{label}</span>
            </Button>
          ))}
        </div>
      </div>
      <div className="vertical-scrollbar min-h-0 flex-1 overflow-y-auto">
        <InvoicePreview invoice={invoice} />
      </div>
    </aside>
  );
}

export function PaymentProcessorInvoiceList4() {
  const [activeFilter, setActiveFilter] = React.useState<InvoiceFilter>("all");
  const [query, setQuery] = React.useState("");
  const [selectedInvoiceId, setSelectedInvoiceId] = React.useState(
    invoices[1].id,
  );
  const listScrollRef = React.useRef<HTMLDivElement>(null);
  const [listMaskImage, setListMaskImage] = React.useState(() =>
    getListMask(0, 0),
  );

  const filteredInvoices = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          invoice.invoiceNumber,
          invoice.title,
          invoice.customer,
          invoice.customerEmail,
          invoice.status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "open" &&
          moneyToNumber(invoice.amountDue) > 0 &&
          invoice.status !== "void") ||
        (activeFilter === "paid" && invoice.status === "paid") ||
        (activeFilter === "attention" &&
          ["overdue", "draft"].includes(invoice.status));

      return matchesQuery && matchesFilter;
    });
  }, [activeFilter, query]);

  const selectedInvoice =
    filteredInvoices.find((invoice) => invoice.id === selectedInvoiceId) ??
    filteredInvoices[0] ??
    invoices[0];

  React.useEffect(() => {
    if (!filteredInvoices.some((invoice) => invoice.id === selectedInvoiceId)) {
      setSelectedInvoiceId(filteredInvoices[0]?.id ?? invoices[0].id);
    }
  }, [filteredInvoices, selectedInvoiceId]);

  const updateListMask = React.useCallback(() => {
    const element = listScrollRef.current;

    if (!element) return;

    const maxScroll = Math.max(0, element.scrollHeight - element.clientHeight);
    setListMaskImage(getListMask(element.scrollTop, maxScroll));
  }, []);

  React.useEffect(() => {
    updateListMask();
  }, [filteredInvoices, updateListMask]);

  return (
    <main className="bg-background text-foreground flex min-h-0 flex-1 overflow-hidden">
      <section className="grid min-h-0 w-full flex-1 grid-cols-1 lg:grid-cols-[minmax(28rem,0.52fr)_minmax(0,1fr)] xl:grid-cols-[minmax(34rem,1fr)_minmax(0,50rem)] 2xl:grid-cols-[minmax(40rem,1fr)_minmax(0,52rem)]">
        <div className="flex min-h-[28rem] flex-col overflow-hidden">
          <header className="border-b px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-lg font-semibold tracking-tight">
                  Invoices
                </h1>
                <p className="text-muted-foreground text-sm">
                  Review, collect, and reconcile customer invoices.
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  className="h-9 rounded-md pr-9 pl-9"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search"
                  value={query}
                />
                {query ? (
                  <Button
                    aria-label="Clear search"
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
              <Button className="h-9 rounded-md" type="button">
                <Plus className="size-4" aria-hidden="true" />
                New invoice
              </Button>
            </div>
          </header>

          <div className="border-b px-4 sm:px-5">
            <div className="flex gap-6 overflow-x-auto">
              {filters.map((filter) => (
                <button
                  className={cn(
                    "relative h-11 shrink-0 border-b-2 px-1 text-sm font-medium transition-colors",
                    activeFilter === filter.value
                      ? "border-foreground text-foreground"
                      : "text-muted-foreground hover:text-foreground border-transparent",
                  )}
                  key={filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  type="button"
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div
            className="vertical-scrollbar min-h-0 flex-1 overflow-y-auto pb-3 [&>button:last-of-type]:border-b-0"
            onScroll={updateListMask}
            ref={listScrollRef}
            style={{
              maskImage: listMaskImage,
              WebkitMaskImage: listMaskImage,
            }}
          >
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((invoice) => (
                <InvoiceListRow
                  invoice={invoice}
                  isActive={selectedInvoice.id === invoice.id}
                  key={invoice.id}
                  onSelect={() => setSelectedInvoiceId(invoice.id)}
                />
              ))
            ) : (
              <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
                <div className="bg-muted grid size-12 place-items-center rounded-lg border">
                  <FileText className="text-muted-foreground size-5" />
                </div>
                <p className="mt-4 text-sm font-semibold">No invoices found</p>
                <p className="text-muted-foreground mt-1 max-w-72 text-sm">
                  Adjust search or status filters to bring invoices back into
                  the list.
                </p>
              </div>
            )}
          </div>

          <footer className="grid h-14 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t px-4 text-sm sm:px-5">
            <p className="text-muted-foreground truncate text-sm tabular-nums">
              1-{filteredInvoices.length} of {invoices.length}
            </p>

            <div className="flex min-w-0 items-center gap-2">
              <div className="flex items-center overflow-hidden rounded-md border">
                <Button
                  className="size-8 rounded-none border-r shadow-none"
                  disabled
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <ChevronLeft className="size-4" aria-hidden="true" />
                  <span className="sr-only">Previous page</span>
                </Button>
                <Button
                  className="size-8 rounded-none shadow-none"
                  disabled
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <ChevronRight className="size-4" aria-hidden="true" />
                  <span className="sr-only">Next page</span>
                </Button>
              </div>
            </div>
          </footer>
        </div>

        <DetailPane invoice={selectedInvoice} />
      </section>
    </main>
  );
}
