"use client";

import "slot-text/style.css";

import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Paperclip,
  Pencil,
  Send,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SlotText } from "slot-text/react";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const invoiceItems = [
  {
    item: "Admin workspace license",
    units: "4",
    rate: "$399.00",
    amount: "$1,596.00",
  },
  {
    item: "Payment screens implementation",
    units: "8",
    rate: "$240.00",
    amount: "$1,920.00",
  },
  {
    item: "Design handoff and QA notes",
    units: "3",
    rate: "$315.00",
    amount: "$945.00",
  },
  {
    item: "Implementation support",
    units: "2",
    rate: "$380.00",
    amount: "$760.00",
  },
];

const fundingDetails = [
  {
    label: "Advance goes to",
    value: ["Shadcnblocks Treasury", "Account ending 7740"],
  },
  { label: "Payment terms", value: ["Due 30 days after issue"] },
  { label: "Advance offer", value: ["82% of eligible invoice value"] },
  { label: "Fees begin", value: ["Jun 18, 2026"] },
  { label: "Customer ref", value: ["NS-4826-PRO"] },
  {
    label: "Note",
    value: ["Advance against the signed Northstar Studio invoice."],
  },
];

const attachments = [
  {
    name: "Signed invoice - Northstar Studio.pdf",
    size: "3.29 MB",
  },
  {
    name: "Purchase order - NS-4826.pdf",
    size: "1.84 MB",
  },
];

function StatusPill() {
  return (
    <span className="inline-flex h-6 items-center gap-1.5 rounded-md border border-emerald-600/20 bg-emerald-50 px-2 text-[11px] font-medium text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-900/30 dark:text-emerald-400">
      <CheckCircle2 className="size-3.5" />
      Ready to request
    </span>
  );
}

function DetailBlock({
  label,
  value,
}: {
  label: string;
  value: string | string[];
}) {
  const lines = Array.isArray(value) ? value : [value];

  return (
    <div className="space-y-3 py-3">
      <dt>
        <AsideDivider label={label} />
      </dt>
      <dd className="text-muted-foreground space-y-1.5 text-[13px] leading-6 font-medium tracking-[0.01em]">
        {lines.map((line, index) => (
          <p
            className={cn(
              index === 0 && /[0-9]/.test(line)
                ? "text-foreground/70 tabular-nums"
                : undefined,
            )}
            key={line}
          >
            {line}
          </p>
        ))}
      </dd>
    </div>
  );
}

function AsideDivider({ label, meta }: { label: string; meta?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-foreground shrink-0 text-[11px] font-semibold tracking-[0.18em] uppercase">
        {label}
      </span>
      <span className="border-border min-w-0 flex-1 border-t border-dashed" />
      {meta ? (
        <span className="text-muted-foreground shrink-0 text-[11px] font-medium tracking-[0.12em] uppercase">
          {meta}
        </span>
      ) : null}
    </div>
  );
}

function DownloadInvoiceButton() {
  const [downloaded, setDownloaded] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  function downloadInvoice() {
    setDownloaded(true);

    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setDownloaded(false), 1800);
  }

  return (
    <Button
      aria-label={downloaded ? "Invoice downloaded" : "Download invoice"}
      className="text-primary hover:text-primary rounded-md"
      onClick={downloadInvoice}
      size="sm"
      type="button"
      variant="outline"
    >
      <Download className="size-4" />
      <SlotText text={downloaded ? "Downloaded" : "Download Invoice"} />
    </Button>
  );
}

function InvoiceDocument() {
  return (
    <section className="border-border/80 rounded-xl border bg-[color-mix(in_oklch,var(--muted)_55%,var(--background))] p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-foreground text-sm font-semibold">
            Invoice SB-2026-084
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            Northstar Studio, due Jun 26, 2026
          </p>
        </div>
        <DownloadInvoiceButton />
      </div>

      <div className="bg-card text-card-foreground ring-border/80 min-h-[42rem] rounded-xl p-5 shadow-[0_14px_42px_-30px_color-mix(in_oklch,var(--foreground)_30%,transparent)] ring-1 sm:p-6 lg:p-7">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h3 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Invoice
            </h3>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <span className="text-muted-foreground font-medium">
                Invoice no.
              </span>
              <span className="font-semibold">SB-2026-084</span>
            </div>
          </div>
          <div className="bg-primary text-primary-foreground grid size-9 shrink-0 place-items-center rounded-full">
            <Logo
              alt="Shadcnblocks"
              className="size-5 object-contain brightness-0 invert dark:invert-0"
              height={20}
              src="/logo-black.svg"
              width={20}
            />
          </div>
        </div>

        <div className="border-border mt-8 overflow-hidden rounded-lg border">
          <div className="grid md:grid-cols-2">
            <PreviewInfoBlock
              label="Customer"
              lines={["Northstar Studio", "accounts@northstar.studio"]}
            />
            <PreviewInfoBlock
              className="border-border border-t md:border-t-0 md:border-l"
              label="Payment due"
              lines={["Jun 26, 2026"]}
            />
          </div>
          <PreviewInfoBlock
            className="border-border border-t"
            label="Address"
            lines={["18 Collins Street, Melbourne VIC 3000, Australia"]}
          />
        </div>

        <div className="border-border mt-7 overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <thead className="bg-muted/55 text-foreground/70">
                <tr>
                  <th className="border-border border-r px-4 py-3 text-sm font-semibold">
                    Description
                  </th>
                  <th className="border-border w-20 border-r px-4 py-3 text-right text-sm font-semibold">
                    Qty
                  </th>
                  <th className="border-border w-28 border-r px-4 py-3 text-right text-sm font-semibold">
                    Rate
                  </th>
                  <th className="w-32 px-4 py-3 text-right text-sm font-semibold">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {invoiceItems.map((item) => (
                  <tr key={item.item}>
                    <td className="border-border border-r px-4 py-3 font-semibold">
                      {item.item}
                    </td>
                    <td className="border-border border-r px-4 py-3 text-right tabular-nums">
                      {item.units}
                    </td>
                    <td className="border-border border-r px-4 py-3 text-right tabular-nums">
                      {item.rate}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {item.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <dl className="w-full max-w-xs space-y-3 px-1 py-2 text-sm">
            <TotalRow label="Eligible subtotal" value="$5,221.00" />
            <TotalRow label="Service fee" value="$156.63" />
            <TotalRow label="Held in reserve" value="$939.78" />
            <TotalRow
              className="text-foreground pt-1 text-base font-semibold"
              label="Available today"
              value="$4,124.59"
            />
          </dl>
        </div>
      </div>
    </section>
  );
}

function PreviewInfoBlock({
  label,
  lines,
  className,
}: {
  label: string;
  lines: string[];
  className?: string;
}) {
  return (
    <div className={cn("p-5", className)}>
      <p className="text-muted-foreground font-medium">{label}</p>
      <div className="mt-2 space-y-1 text-sm font-semibold">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </div>
  );
}

function TotalRow({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

function FundingSidebar() {
  return (
    <aside className="space-y-7 xl:self-start">
      <section className="space-y-4">
        <AsideDivider label="Documents" meta={`${attachments.length} files`} />
        <div>
          {attachments.map((file) => (
            <div
              className="flex items-center justify-between gap-3 py-3 text-sm"
              key={file.name}
            >
              <div className="flex min-w-0 items-center gap-3">
                <Paperclip className="text-muted-foreground size-4 shrink-0" />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium">
                    {file.name}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {file.size}
                  </p>
                </div>
              </div>
              <Button
                className="text-[color-mix(in_oklch,var(--destructive)_82%,var(--foreground))] hover:text-[color-mix(in_oklch,var(--destructive)_90%,var(--foreground))]"
                size="icon"
                variant="ghost"
              >
                <Trash2 className="size-4" />
                <span className="sr-only">Remove {file.name}</span>
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <dl className="space-y-4">
          {fundingDetails.map((detail) => (
            <DetailBlock
              key={detail.label}
              label={detail.label}
              value={detail.value}
            />
          ))}
        </dl>
      </section>
    </aside>
  );
}

export function PaymentProcessorInvoiceDetail3({
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
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-3 text-sm">
            <Button
              className="text-muted-foreground hover:text-foreground h-8 px-0"
              variant="ghost"
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <span className="bg-border h-5 w-px" aria-hidden="true" />
            <span className="text-muted-foreground font-medium">
              Invoice advance
            </span>
            <span className="text-muted-foreground" aria-hidden="true">
              /
            </span>
            <span className="font-semibold">SB-2026-084</span>
            <StatusPill />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline">
              <Pencil className="size-4" />
              Edit
            </Button>
            <Button>
              <Send className="size-4" />
              Request advance
            </Button>
          </div>
        </div>

        <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <InvoiceDocument />
          <FundingSidebar />
        </div>
      </section>
    </main>
  );
}
