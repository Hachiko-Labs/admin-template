"use client";

import {
  CalendarIcon,
  Check,
  Download,
  FileText,
  HandCoins,
  Plus,
  ReceiptText,
  Trash2,
  UsersRound,
} from "lucide-react";
import dynamic from "next/dynamic";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import {
  currencySymbols,
  formatInvoiceMoney,
  type InvoiceDraft,
  type InvoiceItem,
  type InvoiceTotals,
} from "./create-invoice-3-shared";

const defaultInvoice: InvoiceDraft = {
  companyName: "Shadcnblocks.com",
  companyAddress: "Level 12, 45 Clarence Street\nSydney NSW 2000",
  companyEmail: "billing@shadcnblocks.com",
  clientName: "Olivia Bennett",
  clientAddress: "18 Collins Street\nMelbourne VIC 3000",
  clientEmail: "finance@northstar.studio",
  currency: "USD",
  invoiceNumber: "INV-0003",
  invoiceDate: "2026-06-17",
  dueDate: "2026-07-01",
  paymentTerms: "Payment due within 14 days by bank transfer.",
  taxRate: 10,
  notes:
    "Thank you for choosing Shadcnblocks. Please include the invoice number with your payment.",
  items: [
    {
      id: "item-1",
      name: "Elite lifetime workspace",
      description: "Lifetime access to Shadcnblocks pro blocks and components.",
      quantity: 1,
      unitPrice: 399,
    },
    {
      id: "item-2",
      name: "Template implementation pack",
      description:
        "Production-ready Next.js and Astro templates for launch pages.",
      quantity: 9,
      unitPrice: 79,
    },
    {
      id: "item-3",
      name: "Admin kit integration",
      description:
        "Dashboard layouts, application shells, tables, and chart blocks.",
      quantity: 1,
      unitPrice: 540,
    },
  ],
};

const PdfInvoicePreview = dynamic(
  () => import("./create-invoice-3-pdf").then((mod) => mod.PdfInvoicePreview),
  {
    ssr: false,
    loading: () => (
      <div className="bg-muted/30 flex min-h-[720px] items-center justify-center border-l">
        <div className="text-muted-foreground text-sm">
          Loading PDF viewer...
        </div>
      </div>
    ),
  },
);

const compactControlClass = "h-8 px-2.5 text-[13px] md:text-[13px]";
const compactTextareaClass = "min-h-16 px-2.5 py-2 text-[13px] md:text-[13px]";

const formatDate = (date: string) => {
  if (!date) return "";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
};

const parseInputDate = (date: string) => {
  if (!date) return undefined;

  const [year, month, day] = date.split("-").map(Number);

  if (!year || !month || !day) return undefined;

  return new Date(year, month - 1, day);
};

const toInputDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const getTotals = (invoice: InvoiceDraft): InvoiceTotals => {
  const subtotal = invoice.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );
  const tax = subtotal * (invoice.taxRate / 100);

  return { subtotal, tax, total: subtotal + tax };
};

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Label className="text-muted-foreground text-[11px] font-bold tracking-wide uppercase">
        {label}
      </Label>
      {children}
    </div>
  );
}

function DateInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const selectedDate = parseInputDate(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start gap-2 text-left font-normal",
            compactControlClass,
            !selectedDate && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="text-muted-foreground size-3.5" />
          <span className="tabular-nums">
            {selectedDate ? formatDate(value) : "Pick a date"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (!date) return;

            onChange(toInputDate(date));
            setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

function SectionHeading({
  className,
  icon: Icon,
  title,
  meta,
}: {
  className?: string;
  icon?: React.ElementType;
  title: string;
  meta?: string;
}) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3 pb-2", className)}>
      {Icon ? (
        <span className="border-border bg-background grid size-8 shrink-0 place-items-center rounded-md border">
          <Icon className="text-muted-foreground size-4" />
        </span>
      ) : null}
      <h2 className="text-foreground shrink-0 text-sm font-semibold">
        {title}
      </h2>
      <span className="border-border min-w-0 flex-1 border-t border-dashed" />
      {meta ? (
        <span className="text-muted-foreground shrink-0 text-[11px] font-semibold tracking-[0.12em] uppercase">
          {meta}
        </span>
      ) : null}
    </div>
  );
}

function EditorSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border-border/80 grid gap-4 pt-2", className)}>
      {children}
    </section>
  );
}

function InvoiceEditor({
  invoice,
  setInvoice,
  footerActions,
}: {
  invoice: InvoiceDraft;
  setInvoice: React.Dispatch<React.SetStateAction<InvoiceDraft>>;
  footerActions: React.ReactNode;
}) {
  const updateItem = (
    itemId: string,
    patch: Partial<Omit<InvoiceItem, "id">>,
  ) => {
    setInvoice((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === itemId ? { ...item, ...patch } : item,
      ),
    }));
  };

  return (
    <section className="flex min-h-0 flex-col border-r">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="grid gap-7 p-5 lg:p-7">
          <header className="border-border/80">
            <p className="text-muted-foreground text-[11px] font-bold tracking-[0.16em] uppercase">
              Create invoice
            </p>
            <div className="mt-1 flex flex-wrap items-end justify-between">
              <div>
                <h1 className="text-xl font-semibold tracking-tight">
                  Invoice draft
                </h1>
              </div>
              <p className="text-muted-foreground text-[13px]">
                {invoice.items.length} items in draft
              </p>
            </div>
          </header>

          <EditorSection>
            <SectionHeading icon={FileText} title="Invoice Details" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Invoice Number" className="text-xs">
                <Input
                  className={compactControlClass}
                  value={invoice.invoiceNumber}
                  onChange={(event) =>
                    setInvoice((current) => ({
                      ...current,
                      invoiceNumber: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="Currency">
                <Select
                  value={invoice.currency}
                  onValueChange={(currency) =>
                    setInvoice((current) => ({ ...current, currency }))
                  }
                >
                  <SelectTrigger className={compactControlClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(currencySymbols).map(([code, symbol]) => (
                      <SelectItem key={code} value={code}>
                        {code} {symbol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Invoice Date">
                <DateInput
                  value={invoice.invoiceDate}
                  onChange={(invoiceDate) =>
                    setInvoice((current) => ({ ...current, invoiceDate }))
                  }
                />
              </Field>
              <Field label="Due Date">
                <DateInput
                  value={invoice.dueDate}
                  onChange={(dueDate) =>
                    setInvoice((current) => ({ ...current, dueDate }))
                  }
                />
              </Field>
            </div>
          </EditorSection>

          <EditorSection>
            <SectionHeading icon={UsersRound} title="Sender & Client" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Company">
                <Input
                  className={compactControlClass}
                  value={invoice.companyName}
                  onChange={(event) =>
                    setInvoice((current) => ({
                      ...current,
                      companyName: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="Company Email">
                <Input
                  className={compactControlClass}
                  value={invoice.companyEmail}
                  onChange={(event) =>
                    setInvoice((current) => ({
                      ...current,
                      companyEmail: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="Company Address" className="sm:col-span-2">
                <Textarea
                  value={invoice.companyAddress}
                  onChange={(event) =>
                    setInvoice((current) => ({
                      ...current,
                      companyAddress: event.target.value,
                    }))
                  }
                  className={compactTextareaClass}
                />
              </Field>
              <Field label="Client">
                <Input
                  className={compactControlClass}
                  value={invoice.clientName}
                  onChange={(event) =>
                    setInvoice((current) => ({
                      ...current,
                      clientName: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="Client Email">
                <Input
                  className={compactControlClass}
                  value={invoice.clientEmail}
                  onChange={(event) =>
                    setInvoice((current) => ({
                      ...current,
                      clientEmail: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="Client Address" className="sm:col-span-2">
                <Textarea
                  value={invoice.clientAddress}
                  onChange={(event) =>
                    setInvoice((current) => ({
                      ...current,
                      clientAddress: event.target.value,
                    }))
                  }
                  className={compactTextareaClass}
                />
              </Field>
            </div>
          </EditorSection>

          <EditorSection>
            <SectionHeading
              icon={ReceiptText}
              title="Line Items"
              meta={`${invoice.items.length} items`}
            />

            <div className="grid gap-3">
              {invoice.items.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-muted/25 grid gap-3 rounded-lg border p-3 shadow-[0_10px_28px_-24px_color-mix(in_oklch,var(--foreground)_40%,transparent)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">
                        Item {index + 1}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {formatInvoiceMoney(
                          invoice.currency,
                          item.quantity * item.unitPrice,
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      aria-label="Remove item"
                      onClick={() =>
                        setInvoice((current) => ({
                          ...current,
                          items: current.items.filter(
                            (currentItem) => currentItem.id !== item.id,
                          ),
                        }))
                      }
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  <Field label="Name">
                    <Input
                      className={compactControlClass}
                      value={item.name}
                      onChange={(event) =>
                        updateItem(item.id, { name: event.target.value })
                      }
                    />
                  </Field>
                  <Field label="Description">
                    <Input
                      className={compactControlClass}
                      value={item.description}
                      onChange={(event) =>
                        updateItem(item.id, { description: event.target.value })
                      }
                    />
                  </Field>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Field label="Quantity">
                      <Input
                        type="number"
                        min="0"
                        className={compactControlClass}
                        value={item.quantity}
                        onChange={(event) =>
                          updateItem(item.id, {
                            quantity: Number(event.target.value),
                          })
                        }
                      />
                    </Field>
                    <Field label="Unit Price">
                      <Input
                        type="number"
                        min="0"
                        className={compactControlClass}
                        value={item.unitPrice}
                        onChange={(event) =>
                          updateItem(item.id, {
                            unitPrice: Number(event.target.value),
                          })
                        }
                      />
                    </Field>
                    <Field label="Amount">
                      <div className="bg-background flex h-8 items-center rounded-md border px-2.5 text-sm font-medium">
                        {formatInvoiceMoney(
                          invoice.currency,
                          item.quantity * item.unitPrice,
                        )}
                      </div>
                    </Field>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-primary h-10 w-full border-dashed text-sm font-semibold"
                onClick={() =>
                  setInvoice((current) => ({
                    ...current,
                    items: [
                      ...current.items,
                      {
                        id: uid(),
                        name: "Figma kit handoff",
                        description: "Component specs and implementation notes",
                        quantity: 1,
                        unitPrice: 330,
                      },
                    ],
                  }))
                }
              >
                <Plus className="size-4" />
                Add a New Item
              </Button>
            </div>
          </EditorSection>

          <EditorSection>
            <SectionHeading icon={HandCoins} title="Settlement" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Tax Rate">
                <Input
                  type="number"
                  min="0"
                  className={compactControlClass}
                  value={invoice.taxRate}
                  onChange={(event) =>
                    setInvoice((current) => ({
                      ...current,
                      taxRate: Number(event.target.value),
                    }))
                  }
                />
              </Field>
              <Field label="Payment Terms">
                <Input
                  className={compactControlClass}
                  value={invoice.paymentTerms}
                  onChange={(event) =>
                    setInvoice((current) => ({
                      ...current,
                      paymentTerms: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="Notes" className="sm:col-span-2">
                <Textarea
                  value={invoice.notes}
                  onChange={(event) =>
                    setInvoice((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  className={compactTextareaClass}
                />
              </Field>
            </div>
          </EditorSection>
        </div>
      </div>
      <footer className="bg-background shrink-0 border-t">
        <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-end lg:px-7">
          <div className="flex flex-wrap items-center gap-2">
            {footerActions}
          </div>
        </div>
      </footer>
    </section>
  );
}

type PreviewActionState = {
  fileName: string;
  isRendering: boolean;
  url: string | null;
};

export function PaymentProcessorCreateInvoice3() {
  const [invoice, setInvoice] = React.useState<InvoiceDraft>(defaultInvoice);
  const totals = React.useMemo(() => getTotals(invoice), [invoice]);
  const [previewAction, setPreviewAction] = React.useState<PreviewActionState>({
    fileName: `${defaultInvoice.invoiceNumber}.pdf`,
    isRendering: true,
    url: null,
  });
  const handlePreviewActionChange = React.useCallback(
    (nextPreviewAction: PreviewActionState) => {
      setPreviewAction(nextPreviewAction);
    },
    [],
  );

  return (
    <div className="bg-background relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="grid min-h-0 min-w-0 flex-1 xl:grid-cols-[minmax(440px,540px)_minmax(0,1fr)] 2xl:grid-cols-[minmax(500px,620px)_minmax(0,1fr)]">
        <InvoiceEditor
          invoice={invoice}
          setInvoice={setInvoice}
          footerActions={
            <>
              <Button
                className="h-9 rounded-md"
                type="button"
                variant="outline"
              >
                <Check className="size-4" />
                Save draft
              </Button>
              {previewAction.url ? (
                <Button asChild className="h-9 rounded-md">
                  <a href={previewAction.url} download={previewAction.fileName}>
                    <Download className="size-4" />
                    {previewAction.isRendering ? "Updating..." : "Download PDF"}
                  </a>
                </Button>
              ) : (
                <Button className="h-9 rounded-md" disabled>
                  <Download className="size-4" />
                  Preparing...
                </Button>
              )}
            </>
          }
        />
        <PdfInvoicePreview
          invoice={invoice}
          totals={totals}
          onPreviewActionChange={handlePreviewActionChange}
        />
      </div>
    </div>
  );
}
