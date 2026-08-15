"use client";

import {
  CheckSquare2,
  Edit3,
  FileText,
  History,
  MessageSquareText,
  Plus,
  Send,
} from "lucide-react";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const invoiceMetrics = [
  { label: "Contract value", value: "$4,116.64", emphasis: true },
  { label: "Balance to collect", value: "$1,438.64" },
  { label: "Tax reserved", value: "$374.24" },
  { label: "Collection target", value: "06/10/2026" },
  { label: "Last receipt", value: "05/31/2026" },
  { label: "Aging window", value: "7 days" },
];

const payments = [
  {
    amount: "$1,490.00",
    date: "Paid on 27 May",
    title: "Processor match",
    detail: "Stripe settlement SB-4826",
    matched: true,
  },
  {
    amount: "$1,188.00",
    date: "Paid on 31 May",
    title: "Ops reconciliation",
    detail: "Bank transfer memo NS-4826",
    matched: false,
  },
];

const lineItems = [
  {
    item: "Elite lifetime workspace",
    detail: "Lifetime access to Shadcnblocks pro blocks and components",
    qty: "2",
    unit: "$399.00",
    tax: "10%",
    discount: "0%",
    amount: "$798.00",
  },
  {
    item: "Admin kit implementation",
    detail: "Dashboard shells, tables, charts, and payment processor views",
    qty: "4",
    unit: "$540.00",
    tax: "10%",
    discount: "5%",
    amount: "$2,052.00",
  },
  {
    item: "Figma kit handoff",
    detail: "Design-system files, block references, and product team notes",
    qty: "3",
    unit: "$330.00",
    tax: "10%",
    discount: "0%",
    amount: "$990.00",
  },
];

function OperationsPanel() {
  return (
    <section className="bg-background min-w-0 px-4 py-5 sm:px-6 xl:px-7">
      <div className="border-border flex gap-7 border-b">
        {[
          ["Summary", FileText, true],
          ["Timeline", History, false],
          ["Notes", MessageSquareText, false],
        ].map(([label, Icon, active]) => {
          const TabIcon = Icon as typeof FileText;

          return (
            <button
              className={cn(
                "flex h-9 items-center gap-2 border-b-2 px-1 text-xs font-semibold transition-colors",
                active
                  ? "border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground border-transparent",
              )}
              key={String(label)}
              type="button"
            >
              <TabIcon className="size-4 sm:hidden" />
              {String(label)}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3">
          {invoiceMetrics.map((metric) => (
            <div key={metric.label}>
              <dt className="text-muted-foreground text-xs">{metric.label}</dt>
              <dd
                className={cn(
                  "mt-2 text-[15px] font-semibold tracking-tight tabular-nums",
                  metric.emphasis && "text-primary",
                )}
              >
                {metric.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <LedgerSection actionLabel="Link receipt" title="Collections">
        <div className="divide-border border-border divide-y border-t">
          {payments.map((payment) => (
            <div
              className="grid grid-cols-[6.25rem_1px_minmax(0,1fr)] gap-4 py-4"
              key={`${payment.amount}-${payment.title}`}
            >
              <div>
                <p className="text-[13px] font-semibold tabular-nums">
                  {payment.amount}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {payment.date}
                </p>
              </div>
              <div className="bg-border my-1" />
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-[13px] font-semibold",
                    payment.matched &&
                      "text-[color-mix(in_oklch,var(--primary)_78%,var(--foreground))]",
                  )}
                >
                  {payment.title}
                </p>
                {payment.detail ? (
                  <p className="text-muted-foreground mt-1 text-[11px]">
                    {payment.detail}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </LedgerSection>

      <LedgerSection actionLabel="Add adjustment" title="Balance adjustments">
        <div className="border-border grid grid-cols-[minmax(0,1fr)_auto] gap-5 border-t py-4">
          <div>
            <p className="text-[13px] font-semibold">CM-SB-2026-014</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Issued on : 04/06/2026
            </p>
          </div>
          <p className="text-[13px] font-semibold tabular-nums">$97.60</p>
        </div>
      </LedgerSection>
    </section>
  );
}

function LedgerSection({
  title,
  children,
  actionLabel = "Add",
}: {
  title: string;
  children: React.ReactNode;
  actionLabel?: string;
}) {
  return (
    <section className="mt-10">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        <Button
          className="border-primary/45 text-primary hover:text-primary h-8 rounded-sm px-3 text-xs"
          size="sm"
          variant="outline"
        >
          <Plus className="size-4" />
          {actionLabel}
        </Button>
      </div>
      {children}
    </section>
  );
}

function InvoicePreview() {
  return (
    <aside className="mt-14 bg-[color-mix(in_oklch,var(--muted)_55%,var(--background))] px-4 pt-8 pb-6 sm:px-6 lg:px-8">
      <div className="bg-card text-card-foreground ring-border/80 mx-auto max-w-[45rem] rounded-lg p-6 shadow-[0_18px_45px_-22px_color-mix(in_oklch,var(--foreground)_28%,transparent)] ring-1">
        <div className="flex items-start justify-between gap-4">
          <div className="bg-primary text-primary-foreground grid size-9 place-items-center rounded-full">
            <Logo
              alt="Shadcnblocks"
              className="size-5 object-contain brightness-0 invert dark:invert-0"
              height={20}
              src="/logo-black.svg"
              width={20}
            />
          </div>
          <div className="text-right">
            <h2 className="text-muted-foreground text-xl font-semibold">
              Invoice
            </h2>
            <p className="mt-2 text-xs font-bold">Invoice No: SB-2026-084</p>
            <p className="text-muted-foreground text-[11px]">
              Date Issued : 27/05/2026
            </p>
            <p className="text-muted-foreground text-[11px]">
              Due Date : 27/06/2026
            </p>
            <p className="text-muted-foreground text-[11px]">Ref : NS-4826</p>
          </div>
        </div>

        <div className="mt-5">
          <h3 className="text-base font-semibold">Shadcnblocks.com</h3>
          <p className="mt-2 text-[11px] leading-4 font-semibold uppercase">
            Level 12, 45 Clarence Street
            <br />
            Sydney NSW 2000
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-8 text-[11px] leading-4">
          <PreviewAddress
            label="Customer"
            title="NORTHSTAR STUDIO"
            lines={[
              "VAT :AU 746128932",
              "18 Collins Street",
              "Melbourne VIC 3000",
            ]}
          />
          <PreviewAddress
            label="Deliver To"
            title="OLIVIA BENNETT"
            lines={[
              "Product Operations",
              "18 Collins Street",
              "Melbourne VIC 3000",
            ]}
          />
        </div>

        <div className="border-border mt-7 overflow-hidden rounded-sm border">
          <table className="w-full table-fixed text-left text-[10px]">
            <colgroup>
              <col className="w-[48%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
              <col className="w-[11%]" />
              <col className="w-[11%]" />
            </colgroup>
            <thead className="text-muted-foreground bg-[color-mix(in_oklch,var(--muted)_78%,var(--background))]">
              <tr>
                {["Workstream", "Seats", "Rate", "Tax", "Credit", "Total"].map(
                  (heading) => (
                    <th
                      className={cn(
                        "px-2 py-2 font-medium",
                        heading !== "Workstream" && "text-right",
                      )}
                      key={heading}
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-border/70 divide-y">
              {lineItems.map((item) => (
                <tr key={item.item}>
                  <td className="px-2 py-2.5 align-top">
                    <p className="font-bold tracking-wide">{item.item}</p>
                    <p className="text-muted-foreground mt-1 leading-[1.25] font-medium">
                      {item.detail}
                    </p>
                  </td>
                  <td className="px-2 py-2.5 text-right align-top font-semibold">
                    {item.qty}
                  </td>
                  <td className="px-2 py-2.5 text-right align-top font-semibold">
                    {item.unit}
                  </td>
                  <td className="px-2 py-2.5 text-right align-top font-semibold">
                    {item.tax}
                  </td>
                  <td className="px-2 py-2.5 text-right align-top font-semibold">
                    {item.discount}
                  </td>
                  <td className="px-2 py-2.5 text-right align-top font-semibold">
                    {item.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <dl className="mt-4 ml-auto w-52 space-y-1 text-right text-[11px] font-semibold">
          <PreviewTotal label="Subtotal" value="$3,840.00" />
          <PreviewTotal label="Courtesy credit" value="-$97.60" />
          <PreviewTotal label="Total VAT" value="$374.24" />
          <PreviewTotal label="Total" value="$4,116.64" />
          <PreviewTotal label="Paid" value="$2,678.00" />
          <PreviewTotal
            className="text-primary"
            label="Open Due"
            value="$1,438.64"
          />
        </dl>

        <div className="text-muted-foreground mt-14 flex items-start gap-2 text-[10px] leading-4">
          <p>
            Shadcnblocks.com, ABN : 74 612 893 204
            <br />
            VAT: AU 746 128 932, Activity Type: digital design systems
            <br />
            billing@shadcnblocks.com
          </p>
        </div>
      </div>
    </aside>
  );
}

function PreviewAddress({
  label,
  title,
  lines,
}: {
  label: string;
  title: string;
  lines: string[];
}) {
  return (
    <div className="min-w-0">
      <p className="text-primary font-semibold">{label}</p>
      <p className="mt-2 font-bold uppercase">{title}</p>
      {lines.map((line) => (
        <p
          className="text-muted-foreground font-semibold break-words uppercase"
          key={line}
        >
          {line}
        </p>
      ))}
    </div>
  );
}

function PreviewTotal({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("flex justify-between gap-3", className)}>
      <dt>{label} :</dt>
      <dd>{value}</dd>
    </div>
  );
}

export function PaymentProcessorInvoiceDetail2({
  className,
}: {
  className?: string;
}) {
  return (
    <main
      className={cn(
        "bg-background text-foreground h-full min-h-0 flex-1 overflow-y-auto overscroll-contain",
        className,
      )}
    >
      <header className="border-border/80 bg-background border-b px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="min-w-0">
              <nav className="text-muted-foreground flex items-center gap-2 text-xs/6">
                <span className="font-medium">Invoices</span>
                <span aria-hidden="true">/</span>
                <span className="text-foreground/80 font-medium">
                  #SB-2026-084
                </span>
              </nav>
              <div className="mt-1 flex min-w-0 flex-wrap items-center gap-3">
                <h1 className="truncate text-xl font-semibold tracking-tight">
                  Invoice #SB-2026-084
                </h1>
                <span className="rounded-full bg-[color-mix(in_oklch,var(--destructive)_10%,var(--background))] px-2.5 py-0.5 text-xs font-semibold text-[color-mix(in_oklch,var(--destructive)_82%,var(--foreground))] ring-1 ring-[color-mix(in_oklch,var(--destructive)_20%,transparent)] ring-inset">
                  Overdue
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button className="h-9 rounded-md" variant="outline">
              <CheckSquare2 className="size-4" />
              Mark as Paid
            </Button>
            <Button
              className="text-muted-foreground h-9 rounded-md"
              disabled
              variant="outline"
            >
              <Edit3 className="size-4" />
              Edit
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-5">
              <Send className="size-4" />
              Send
            </Button>
          </div>
        </div>
      </header>

      <div className="grid min-h-[calc(100dvh-5rem)] grid-cols-1 xl:grid-cols-[minmax(26rem,0.82fr)_minmax(34rem,1fr)] xl:gap-10 2xl:gap-14">
        <OperationsPanel />
        <InvoicePreview />
      </div>
    </main>
  );
}
