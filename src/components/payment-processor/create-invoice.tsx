"use client";

import {
  BookMarked,
  Calendar,
  Check,
  Download,
  EllipsisVertical,
  FileSignature,
  ImagePlus,
  Mail,
  Maximize2,
  Minus,
  Phone,
  Plus,
  ReceiptText,
  Send,
  Trash2,
} from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type TextField = {
  id: string;
  label: string;
  value: string;
};

type BillingField = {
  id: string;
  label: string;
  value: number;
  type: "fixed" | "percentage";
};

type InvoiceItem = {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

type InvoiceMode = "light" | "dark";

type InvoiceDraft = {
  logo?: string;
  signature?: string;
  companyName: string;
  companyAddress: string;
  companyFields: TextField[];
  clientName: string;
  clientAddress: string;
  clientFields: TextField[];
  currency: string;
  prefix: string;
  serialNumber: string;
  invoiceDate: string;
  dueDate: string;
  paymentTerms: string;
  themeMode: InvoiceMode;
  baseColor: string;
  billingDetails: BillingField[];
  items: InvoiceItem[];
  terms: string;
  paymentInformation: TextField[];
};

const currencySymbols: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  CAD: "$",
  AUD: "$",
  SGD: "$",
};

const defaultThemeColor = "#000000";
const today = "2026-05-27";
const widePreviewZoom = 0.86;
const defaultLogo = "/logo-black.svg";
const accordionTriggerClassName =
  "bg-muted/35 hover:bg-muted/55 data-[state=open]:bg-muted/65 data-[state=open]:text-primary data-[state=open]:[&>svg]:text-primary px-5 py-4 text-base font-semibold hover:no-underline lg:px-8";
const accordionContentClassName =
  "bg-background flex flex-col gap-2 border-t p-5 lg:px-8";
const defaultSignature = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="520" height="180" viewBox="0 0 520 180">
  <rect width="520" height="180" fill="none"/>
  <g transform="translate(30 102) rotate(-5)">
    <text
      x="0"
      y="0"
      fill="none"
      stroke="#171717"
      stroke-width="1.15"
      stroke-linejoin="round"
      font-family="Snell Roundhand, Zapfino, Apple Chancery, Bickham Script Pro, cursive"
      font-size="74"
      font-style="italic"
      font-weight="400"
      letter-spacing="-5"
    >
      Robert Austin
    </text>
    <text
      x="0"
      y="0"
      fill="#171717"
      fill-opacity=".18"
      font-family="Snell Roundhand, Zapfino, Apple Chancery, Bickham Script Pro, cursive"
      font-size="74"
      font-style="italic"
      font-weight="400"
      letter-spacing="-5"
    >
      Robert Austin
    </text>
    <path
      d="M42 28 C120 6, 216 16, 330 19 C395 21, 434 12, 470 26"
      fill="none"
      stroke="#171717"
      stroke-width="1.2"
      stroke-linecap="round"
      opacity=".7"
    />
    <path
      d="M18 -13 C58 -42, 108 -54, 138 -38 C166 -23, 137 4, 82 10"
      fill="none"
      stroke="#171717"
      stroke-width="1"
      stroke-linecap="round"
      opacity=".45"
    />
  </g>
</svg>
`)}`;

const defaultInvoice: InvoiceDraft = {
  logo: defaultLogo,
  signature: defaultSignature,
  companyName: "Shadcnblocks.com",
  companyAddress: "Level 12, 45 Clarence Street, Sydney NSW 2000",
  companyFields: [
    { id: "email", label: "Email", value: "billing@shadcnblocks.com" },
  ],
  clientName: "Olivia Bennett",
  clientAddress: "18 Collins Street, Melbourne VIC 3000",
  clientFields: [{ id: "phone", label: "Phone", value: "+61 2 7908 4420" }],
  currency: "USD",
  prefix: "Invoice #",
  serialNumber: "0001",
  invoiceDate: today,
  dueDate: "2026-06-10",
  paymentTerms: "Due within 14 days",
  themeMode: "light",
  baseColor: defaultThemeColor,
  billingDetails: [{ id: "tax", label: "Tax", value: 10, type: "percentage" }],
  items: [
    {
      id: "item-1",
      name: "Product strategy sprint",
      description: "Discovery, roadmap, and delivery planning",
      quantity: 1,
      unitPrice: 2400,
    },
    {
      id: "item-2",
      name: "Interface design system",
      description: "Invoice-ready components and handoff polish",
      quantity: 2,
      unitPrice: 850,
    },
  ],
  terms:
    "Payment is due upon receipt. Late payments may be subject to a 1.5% monthly service charge.",
  paymentInformation: [
    { id: "bank", label: "Bank", value: "Mercury" },
    { id: "account", label: "Account", value: "**** 4829" },
  ],
};

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const formatDate = (date: string) => {
  if (!date) return "—";
  const parsed = new Date(`${date}T00:00:00`);
  return new Intl.DateTimeFormat("en-GB").format(parsed);
};

function rgbToHex(value: string) {
  const rgbMatch = value.match(
    /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i,
  );
  const srgbMatch = value.match(
    /color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/i,
  );
  const match = rgbMatch ?? srgbMatch;
  if (!match) return null;
  const multiplier = srgbMatch ? 255 : 1;

  return `#${[match[1], match[2], match[3]]
    .map((channel) =>
      Math.round(
        Math.max(0, Math.min(255, Number.parseFloat(channel) * multiplier)),
      )
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

function getCurrentThemePrimaryColor() {
  if (typeof window === "undefined") return defaultThemeColor;

  const probe = document.createElement("span");
  probe.style.color = "color-mix(in srgb, var(--primary) 100%, transparent)";
  probe.style.position = "fixed";
  probe.style.pointerEvents = "none";
  probe.style.visibility = "hidden";
  document.body.appendChild(probe);

  const color = window.getComputedStyle(probe).color;
  probe.remove();

  return rgbToHex(color) ?? defaultThemeColor;
}

function getResponsivePreviewZoom() {
  if (typeof window === "undefined") return 1;
  return window.matchMedia("(min-width: 1536px)").matches ? widePreviewZoom : 1;
}

const toMoney = (currency: string, value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);

function getTotals(invoice: InvoiceDraft) {
  const subtotal = invoice.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );
  const billingRows = invoice.billingDetails.map((field) => {
    const amount =
      field.type === "percentage"
        ? subtotal * (field.value / 100)
        : field.value;

    return { ...field, amount };
  });
  const total =
    subtotal + billingRows.reduce((sum, row) => sum + row.amount, 0);

  return { subtotal, billingRows, total };
}

function FieldGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", className)}>{children}</div>
  );
}

function FormControl({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
        {label}
      </Label>
      {children}
      {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
    </div>
  );
}

function ImageDropzone({
  id,
  label,
  type,
  value,
  onChange,
  icon: Icon,
}: {
  id: string;
  label: string;
  type: string;
  value?: string;
  onChange: (value?: string) => void;
  icon: typeof ImagePlus;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
        {label}
      </Label>
      <label
        htmlFor={id}
        className="border-border/80 bg-background hover:bg-muted/35 flex min-h-20 cursor-pointer items-center gap-3 rounded-lg border border-dashed p-3 transition-colors"
      >
        <span className="bg-muted text-muted-foreground grid size-12 shrink-0 place-items-center rounded-md">
          {value ? (
            <img
              src={value}
              alt=""
              className="max-h-9 max-w-9 object-contain"
            />
          ) : (
            <Icon className="size-5" />
          )}
        </span>
        <span className="min-w-0 flex-1 text-left">
          <span className="block truncate text-sm font-medium">
            {value ? "Image selected" : "Choose asset"}
          </span>
          <span className="text-muted-foreground mt-0.5 block text-xs">
            {type === "logo"
              ? "Logo used on invoice previews"
              : "Robert Austin signature shown below totals"}
          </span>
        </span>
        <span className="bg-muted/70 text-muted-foreground rounded-md px-2.5 py-1 text-xs font-medium">
          {value ? "Replace" : "Browse"}
        </span>
      </label>
      <input
        id={id}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => onChange(String(reader.result));
          reader.readAsDataURL(file);
        }}
      />
      {value ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive h-8 w-full justify-center border-dashed px-3 text-xs"
          onClick={() => onChange(undefined)}
        >
          Remove image
        </Button>
      ) : null}
    </div>
  );
}
function TextFieldsEditor({
  fields,
  addLabel,
  onChange,
}: {
  fields: TextField[];
  addLabel: string;
  onChange: (fields: TextField[]) => void;
}) {
  return (
    <div className="space-y-2">
      {fields.map((field, index) => (
        <div key={field.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <Input
            value={field.label}
            placeholder="Label"
            onChange={(event) => {
              const next = [...fields];
              next[index] = { ...field, label: event.target.value };
              onChange(next);
            }}
          />
          <Input
            value={field.value}
            placeholder="Value"
            onChange={(event) => {
              const next = [...fields];
              next[index] = { ...field, value: event.target.value };
              onChange(next);
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() =>
              onChange(fields.filter((item) => item.id !== field.id))
            }
            aria-label="Remove field"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        className="w-full border-dashed"
        onClick={() =>
          onChange([...fields, { id: uid(), label: "", value: "" }])
        }
      >
        <Plus className="size-4" />
        {addLabel}
      </Button>
    </div>
  );
}

function InvoiceItemsEditor({
  invoice,
  setInvoice,
}: {
  invoice: InvoiceDraft;
  setInvoice: React.Dispatch<React.SetStateAction<InvoiceDraft>>;
}) {
  return (
    <div className="space-y-4">
      {invoice.items.map((item, index) => (
        <div
          key={item.id}
          className="bg-muted/20 rounded-lg border p-4 shadow-xs"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Item {index + 1}</p>
              <p className="text-muted-foreground text-xs tabular-nums">
                {toMoney(invoice.currency, item.quantity * item.unitPrice)}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() =>
                setInvoice((current) => ({
                  ...current,
                  items: current.items.filter((entry) => entry.id !== item.id),
                }))
              }
              aria-label="Remove item"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>

          <div className="grid gap-4">
            <FormControl label="Name">
              <Input
                value={item.name}
                placeholder="Item name"
                onChange={(event) => {
                  const nextItems = [...invoice.items];
                  nextItems[index] = { ...item, name: event.target.value };
                  setInvoice((current) => ({ ...current, items: nextItems }));
                }}
              />
            </FormControl>

            <FormControl label="Description">
              <Textarea
                value={item.description}
                placeholder="Item description"
                className="min-h-20"
                onChange={(event) => {
                  const nextItems = [...invoice.items];
                  nextItems[index] = {
                    ...item,
                    description: event.target.value,
                  };
                  setInvoice((current) => ({ ...current, items: nextItems }));
                }}
              />
            </FormControl>

            <FieldGroup>
              <FormControl label="Quantity">
                <Input
                  type="number"
                  min="0"
                  value={item.quantity}
                  onChange={(event) => {
                    const nextItems = [...invoice.items];
                    nextItems[index] = {
                      ...item,
                      quantity: Number(event.target.value),
                    };
                    setInvoice((current) => ({ ...current, items: nextItems }));
                  }}
                />
              </FormControl>
              <FormControl label="Unit Price">
                <Input
                  type="number"
                  min="0"
                  value={item.unitPrice}
                  onChange={(event) => {
                    const nextItems = [...invoice.items];
                    nextItems[index] = {
                      ...item,
                      unitPrice: Number(event.target.value),
                    };
                    setInvoice((current) => ({ ...current, items: nextItems }));
                  }}
                />
              </FormControl>
            </FieldGroup>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        className="w-full border-dashed"
        onClick={() =>
          setInvoice((current) => ({
            ...current,
            items: [
              ...current.items,
              {
                id: uid(),
                name: "New invoice item",
                description: "",
                quantity: 1,
                unitPrice: 1,
              },
            ],
          }))
        }
      >
        <Plus className="size-4" />
        Add Item
      </Button>
    </div>
  );
}

function BillingDetailsEditor({
  invoice,
  setInvoice,
}: {
  invoice: InvoiceDraft;
  setInvoice: React.Dispatch<React.SetStateAction<InvoiceDraft>>;
}) {
  return (
    <div className="space-y-2">
      {invoice.billingDetails.map((field, index) => (
        <div
          key={field.id}
          className="grid grid-cols-[1fr_100px_130px_auto] gap-2"
        >
          <Input
            value={field.label}
            placeholder="Tax, discount, fee"
            onChange={(event) => {
              const next = [...invoice.billingDetails];
              next[index] = { ...field, label: event.target.value };
              setInvoice((current) => ({ ...current, billingDetails: next }));
            }}
          />
          <Input
            type="number"
            value={field.value}
            onChange={(event) => {
              const next = [...invoice.billingDetails];
              next[index] = { ...field, value: Number(event.target.value) };
              setInvoice((current) => ({ ...current, billingDetails: next }));
            }}
          />
          <Select
            value={field.type}
            onValueChange={(value: BillingField["type"]) => {
              const next = [...invoice.billingDetails];
              next[index] = { ...field, type: value };
              setInvoice((current) => ({ ...current, billingDetails: next }));
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="fixed">Fixed</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() =>
              setInvoice((current) => ({
                ...current,
                billingDetails: current.billingDetails.filter(
                  (entry) => entry.id !== field.id,
                ),
              }))
            }
            aria-label="Remove billing detail"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        className="w-full border-dashed"
        onClick={() =>
          setInvoice((current) => ({
            ...current,
            billingDetails: [
              ...current.billingDetails,
              { id: uid(), label: "Adjustment", value: 0, type: "fixed" },
            ],
          }))
        }
      >
        <Plus className="size-4" />
        Add New Field
      </Button>
    </div>
  );
}

function InvoicePreview({ invoice }: { invoice: InvoiceDraft }) {
  const { subtotal, billingRows, total } = getTotals(invoice);
  const accent = invoice.baseColor || defaultThemeColor;
  const isDark = invoice.themeMode === "dark";
  const displayLogo =
    invoice.logo || (isDark ? "/logo-white.svg" : "/logo-black.svg");
  const billedByFields = invoice.companyFields.filter(
    (field) => !isPhoneField(field),
  );
  const billedToFields = [
    ...invoice.clientFields,
    ...invoice.companyFields.filter(isPhoneField),
  ];
  const [zoom, setZoom] = React.useState(1);
  const hasEditedZoom = React.useRef(false);

  React.useEffect(() => {
    const media = window.matchMedia("(min-width: 1536px)");
    const syncZoom = () => {
      if (!hasEditedZoom.current) setZoom(media.matches ? widePreviewZoom : 1);
    };

    syncZoom();
    media.addEventListener("change", syncZoom);

    return () => media.removeEventListener("change", syncZoom);
  }, []);

  const changeZoom = (amount: number) => {
    hasEditedZoom.current = true;
    setZoom((current) => Math.min(1.25, Math.max(0.65, current + amount)));
  };

  const resetZoom = () => {
    hasEditedZoom.current = false;
    setZoom(getResponsivePreviewZoom());
  };

  return (
    <div
      className="bg-muted/45 relative h-full overflow-auto border-l"
      style={{
        backgroundImage:
          "radial-gradient(circle, color-mix(in oklch, var(--muted-foreground) 24%, transparent) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      <div className="bg-background absolute top-3 right-4 z-10 flex overflow-hidden rounded-md border shadow-sm">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 rounded-none"
          onClick={() => changeZoom(-0.08)}
          aria-label="Zoom out"
        >
          <Minus className="size-4" />
        </Button>
        <button
          type="button"
          className="border-x px-2.5 text-xs font-semibold tabular-nums"
          onClick={resetZoom}
          aria-label="Reset preview zoom"
        >
          {Math.round(zoom * 100)}%
        </button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 rounded-none"
          onClick={() => changeZoom(0.08)}
          aria-label="Zoom in"
        >
          <Plus className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 rounded-none border-l"
          onClick={resetZoom}
          aria-label="Fit preview"
        >
          <Maximize2 className="size-4" />
        </Button>
      </div>

      <div className="flex min-h-full justify-center p-6 pt-14 xl:p-10 xl:pt-16 2xl:p-16 2xl:pt-18">
        <div
          className="w-full max-w-[980px] transition-transform duration-200 ease-out 2xl:max-w-[860px]"
          style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
        >
          <article
            className={cn(
              "min-h-[860px] w-full overflow-hidden rounded-lg border shadow-sm transition-colors",
              isDark
                ? "border-zinc-800 bg-zinc-950 text-white"
                : "bg-white text-zinc-950",
            )}
          >
            <div className="h-1.5" style={{ backgroundColor: accent }} />

            <div className="p-8 xl:p-12">
              <header className="mb-12">
                <div className="flex items-start justify-between gap-8">
                  <h2 className="min-w-0 text-2xl font-semibold tracking-tight xl:text-3xl">
                    {invoice.prefix}
                    {invoice.serialNumber}
                  </h2>
                  <div className="pt-1">
                    <img
                      src={displayLogo}
                      alt="Shadcnblocks"
                      className="max-h-14 max-w-24 object-contain"
                    />
                  </div>
                </div>
                <dl className="mt-7 grid gap-x-10 gap-y-5 text-xs sm:grid-cols-2 xl:grid-cols-4">
                  <MetaItem
                    label="Issue Date"
                    value={formatDate(invoice.invoiceDate)}
                    dark={isDark}
                  />
                  <MetaItem
                    label="Currency"
                    value={invoice.currency}
                    dark={isDark}
                  />
                  <MetaItem
                    label="Due Date"
                    value={invoice.dueDate ? formatDate(invoice.dueDate) : "—"}
                    dark={isDark}
                  />
                  <MetaItem
                    label="Serial Number"
                    value={invoice.serialNumber}
                    dark={isDark}
                  />
                </dl>
              </header>

              <section className="mb-14 grid gap-8 sm:grid-cols-2">
                <PartyBlock
                  title="Billed By"
                  name={invoice.companyName}
                  address={invoice.companyAddress}
                  fields={billedByFields}
                  accent={accent}
                  dark={isDark}
                />
                <PartyBlock
                  title="Billed To"
                  name={invoice.clientName}
                  address={invoice.clientAddress}
                  fields={billedToFields}
                  accent={accent}
                  dark={isDark}
                />
              </section>

              <section>
                <table className="w-full table-fixed text-left text-sm">
                  <colgroup>
                    <col className="w-full" />
                    <col className="w-16" />
                    <col className="w-28" />
                    <col className="w-32" />
                  </colgroup>
                  <thead
                    className={cn(
                      "border-b",
                      isDark ? "border-zinc-800" : "border-zinc-200",
                    )}
                  >
                    <tr>
                      <th className="px-0 py-3 font-semibold">Description</th>
                      <th className="py-3 pl-6 text-right font-semibold">
                        Qty
                      </th>
                      <th className="py-3 pl-6 text-right font-semibold">
                        Rate
                      </th>
                      <th className="py-3 pl-6 text-right font-semibold">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className={cn(
                            "py-16 text-center text-sm",
                            isDark ? "text-zinc-500" : "text-zinc-400",
                          )}
                        >
                          Add an item to populate the invoice table.
                        </td>
                      </tr>
                    ) : (
                      invoice.items.map((item) => (
                        <tr
                          key={item.id}
                          className={cn(
                            "border-b text-sm",
                            isDark ? "border-zinc-800" : "border-zinc-100",
                          )}
                        >
                          <td className="max-w-0 px-0 py-5 align-top">
                            <p className="truncate font-medium">
                              {item.name || "Untitled item"}
                            </p>
                            {item.description ? (
                              <p
                                className={cn(
                                  "mt-1 truncate text-xs",
                                  isDark ? "text-zinc-500" : "text-zinc-400",
                                )}
                              >
                                {item.description}
                              </p>
                            ) : null}
                          </td>
                          <td className="py-5 pl-6 text-right align-top tabular-nums">
                            {item.quantity}
                          </td>
                          <td className="py-5 pl-6 text-right align-top tabular-nums">
                            {toMoney(invoice.currency, item.unitPrice)}
                          </td>
                          <td className="py-5 pl-6 text-right align-top font-medium tabular-nums">
                            {toMoney(
                              invoice.currency,
                              item.quantity * item.unitPrice,
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th className="pt-7 text-right font-normal" colSpan={3}>
                        Subtotal
                      </th>
                      <td className="pt-7 pl-6 text-right tabular-nums">
                        {toMoney(invoice.currency, subtotal)}
                      </td>
                    </tr>
                    {billingRows.map((row) => (
                      <tr key={row.id}>
                        <th className="pt-4 text-right font-normal" colSpan={3}>
                          {row.label || "Adjustment"}
                          {row.type === "percentage" ? ` (${row.value}%)` : ""}
                        </th>
                        <td className="pt-4 pl-6 text-right tabular-nums">
                          {toMoney(invoice.currency, row.amount)}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <th
                        className="pt-5 text-right text-base font-semibold"
                        colSpan={3}
                      >
                        Total
                      </th>
                      <td
                        className="pt-5 pl-6 text-right text-xl font-semibold tabular-nums"
                        style={{ color: accent }}
                      >
                        {toMoney(invoice.currency, total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </section>

              <footer
                className={cn(
                  "mt-16 space-y-5 text-[11px]/5",
                  isDark ? "text-zinc-400" : "text-zinc-500",
                )}
              >
                <div className="grid items-start gap-x-10 gap-y-4 sm:grid-cols-[minmax(0,1fr)_auto]">
                  {invoice.paymentInformation.length > 0 ? (
                    <div>
                      {/* <FooterLabel>Payment details</FooterLabel> */}
                      <dl className="grid grid-cols-[72px_1fr] gap-x-4 gap-y-1">
                        {invoice.paymentInformation.map((field) => (
                          <React.Fragment key={field.id}>
                            <dt>{field.label}</dt>
                            <dd
                              className={cn(
                                "font-medium",
                                isDark ? "text-zinc-300" : "text-zinc-700",
                              )}
                            >
                              {field.value}
                            </dd>
                          </React.Fragment>
                        ))}
                      </dl>
                    </div>
                  ) : null}
                  {invoice.signature ? (
                    <img
                      src={invoice.signature}
                      alt="Robert Austin signature"
                      className="max-h-14 max-w-40 justify-self-end object-contain"
                    />
                  ) : (
                    <div aria-hidden="true" className="hidden sm:block" />
                  )}
                </div>
                {invoice.terms ? (
                  <div
                    className={cn(
                      "border-t pt-4",
                      isDark ? "border-zinc-800" : "border-zinc-200",
                    )}
                  >
                    <FooterBlock title="Terms" value={invoice.terms} />
                  </div>
                ) : null}
              </footer>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

function MetaItem({
  label,
  value,
  dark,
}: {
  label: string;
  value: string;
  dark: boolean;
}) {
  return (
    <div>
      <dt className="font-semibold">{label}</dt>
      <dd
        className={cn(
          "mt-1.5 tabular-nums",
          dark ? "text-zinc-400" : "text-zinc-500",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function isPhoneField(field: TextField) {
  return field.label.toLowerCase().includes("phone");
}

function PartyBlock({
  title,
  name,
  address,
  fields,
  accent,
  dark,
}: {
  title: string;
  name: string;
  address: string;
  fields: TextField[];
  accent: string;
  dark: boolean;
}) {
  return (
    <div
      className={cn(
        "border-t pt-5",
        dark ? "border-zinc-800" : "border-zinc-200",
      )}
    >
      <p
        className={cn(
          "mb-5 inline-flex px-2.5 py-1 text-xs font-semibold",
          dark ? "bg-zinc-900" : "bg-zinc-100",
        )}
        style={{ color: accent }}
      >
        {title}
      </p>
      <p className="text-base font-semibold">{name || "Name"}</p>
      <p
        className={cn(
          "mt-2 truncate text-xs leading-5",
          dark ? "text-zinc-400" : "text-zinc-500",
        )}
      >
        {address || "Address"}
      </p>
      {fields.length > 0 ? (
        <dl
          className={cn(
            "mt-4 grid gap-2 text-xs",
            dark ? "text-zinc-400" : "text-zinc-500",
          )}
        >
          {fields.map((field) => (
            <div key={field.id} className="flex min-w-0 items-center gap-2">
              <dt className="sr-only">{field.label}</dt>
              <dd className="flex min-w-0 items-center gap-2">
                <FieldIcon
                  label={field.label}
                  className="size-3.5 shrink-0 opacity-70"
                />
                <span className="truncate">{field.value}</span>
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}

function FieldIcon({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  if (label.toLowerCase().includes("phone")) {
    return <Phone className={className} />;
  }

  return <Mail className={className} />;
}

function FooterBlock({ value }: { title: string; value: string }) {
  if (!value) return null;

  return (
    <div>
      {/* <FooterLabel>{title}</FooterLabel> */}
      <p>{value}</p>
    </div>
  );
}

function CreateInvoiceHero() {
  return (
    <header className="border-border bg-background border-b">
      <div className="grid gap-4 px-5 py-4 lg:grid-cols-[minmax(390px,480px)_minmax(0,1fr)] lg:items-center lg:gap-0 lg:px-0">
        <div className="min-w-0 lg:px-8">
          <nav className="text-muted-foreground flex items-center gap-x-2 text-xs/5">
            <a className="hover:text-foreground/80 font-medium" href="#">
              Invoices
            </a>
            <span aria-hidden="true">/</span>
            <span className="text-foreground/80 font-medium">New</span>
          </nav>

          <h1 className="text-foreground mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
            Create invoice
          </h1>
        </div>

        <div className="flex flex-wrap items-center justify-start gap-3 lg:justify-end lg:px-8">
          <Button className="h-9 rounded-md" variant="outline">
            <Send className="size-4" />
            Send
          </Button>
          <Button className="h-9 rounded-md" variant="outline">
            <Download className="size-4" />
            Download PDF
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                id="create-invoice-actions-trigger"
                className="h-9 w-9 rounded-md"
                size="icon"
                variant="outline"
              >
                <span className="sr-only">More actions</span>
                <EllipsisVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem>Reset draft</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button className="h-9 rounded-md">
            <Check className="size-4" />
            Save draft
          </Button>
        </div>
      </div>
    </header>
  );
}

export function PaymentProcessorCreateInvoice() {
  const { resolvedTheme } = useTheme();
  const [invoice, setInvoice] = React.useState<InvoiceDraft>(defaultInvoice);
  const hasEditedThemeMode = React.useRef(false);
  const hasEditedThemeColor = React.useRef(false);

  React.useEffect(() => {
    if (hasEditedThemeMode.current) return;
    if (resolvedTheme !== "light" && resolvedTheme !== "dark") return;

    setInvoice((current) =>
      current.themeMode === resolvedTheme
        ? current
        : { ...current, themeMode: resolvedTheme },
    );
  }, [resolvedTheme]);

  React.useLayoutEffect(() => {
    let observedPresetStyle: Element | null = null;
    const observer = new MutationObserver(syncThemeColor);

    function syncThemeColor() {
      if (hasEditedThemeColor.current) return;

      const presetStyle = document.getElementById("theme-preset-style");
      if (presetStyle && presetStyle !== observedPresetStyle) {
        observer.observe(presetStyle, { childList: true });
        observedPresetStyle = presetStyle;
      }

      const baseColor = getCurrentThemePrimaryColor();
      setInvoice((current) =>
        current.baseColor === baseColor ? current : { ...current, baseColor },
      );
    }

    syncThemeColor();

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });
    observer.observe(document.head, { childList: true });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-background flex min-h-0 flex-1 flex-col">
      <CreateInvoiceHero />
      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(390px,480px)_minmax(0,1fr)]">
        <section className="min-h-0 overflow-y-auto">
          <Tabs defaultValue="invoice" className="flex min-h-full flex-col">
            <div className="border-b px-5 py-3 lg:px-8">
              <TabsList className="bg-muted/60 grid h-10 w-full grid-cols-2 items-stretch rounded-md border p-1">
                <TabsTrigger
                  value="defaults"
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:border-border text-muted-foreground h-full gap-2 rounded-[4px] border border-transparent py-0 text-sm font-semibold data-[state=active]:shadow-xs"
                >
                  <BookMarked className="size-4" />
                  Defaults
                </TabsTrigger>
                <TabsTrigger
                  value="invoice"
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:border-border text-muted-foreground h-full gap-2 rounded-[4px] border border-transparent py-0 text-sm font-semibold data-[state=active]:shadow-xs"
                >
                  <ReceiptText className="size-4" />
                  Invoice
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="defaults" className="m-0">
              <Accordion
                type="single"
                collapsible
                defaultValue="appearance"
                className="w-full divide-y border-b"
              >
                <AccordionItem value="appearance">
                  <AccordionTrigger className={accordionTriggerClassName}>
                    Appearance
                  </AccordionTrigger>
                  <AccordionContent className={accordionContentClassName}>
                    <FieldGroup>
                      <FormControl label="Mode">
                        <Select
                          value={invoice.themeMode}
                          onValueChange={(themeMode: InvoiceMode) => {
                            hasEditedThemeMode.current = true;
                            setInvoice((current) => ({
                              ...current,
                              themeMode,
                            }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormControl label="Theme Color">
                        <Input
                          type="color"
                          value={invoice.baseColor}
                          onChange={(event) => {
                            hasEditedThemeColor.current = true;
                            setInvoice((current) => ({
                              ...current,
                              baseColor: event.target.value,
                            }));
                          }}
                          className="h-9 p-1"
                        />
                      </FormControl>
                    </FieldGroup>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="company-details">
                  <AccordionTrigger className={accordionTriggerClassName}>
                    Company Details
                  </AccordionTrigger>
                  <AccordionContent className={accordionContentClassName}>
                    <div className="grid gap-3">
                      <ImageDropzone
                        id="invoice-logo"
                        label="Company Logo"
                        type="logo"
                        value={invoice.logo}
                        onChange={(logo) =>
                          setInvoice((current) => ({ ...current, logo }))
                        }
                        icon={ImagePlus}
                      />
                      <ImageDropzone
                        id="invoice-signature"
                        label="Company Signature"
                        type="signature"
                        value={invoice.signature}
                        onChange={(signature) =>
                          setInvoice((current) => ({ ...current, signature }))
                        }
                        icon={FileSignature}
                      />
                    </div>
                    <FormControl
                      label="Company Name"
                      hint="Name of your company"
                    >
                      <Input
                        value={invoice.companyName}
                        onChange={(event) =>
                          setInvoice((current) => ({
                            ...current,
                            companyName: event.target.value,
                          }))
                        }
                      />
                    </FormControl>
                    <FormControl label="Company Address">
                      <Textarea
                        value={invoice.companyAddress}
                        onChange={(event) =>
                          setInvoice((current) => ({
                            ...current,
                            companyAddress: event.target.value,
                          }))
                        }
                        className="min-h-24"
                      />
                    </FormControl>
                    <FormControl label="Company Fields">
                      <TextFieldsEditor
                        fields={invoice.companyFields}
                        addLabel="Add New Field"
                        onChange={(companyFields) =>
                          setInvoice((current) => ({
                            ...current,
                            companyFields,
                          }))
                        }
                      />
                    </FormControl>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="invoice-defaults">
                  <AccordionTrigger className={accordionTriggerClassName}>
                    Invoice Defaults
                  </AccordionTrigger>
                  <AccordionContent className={accordionContentClassName}>
                    <FieldGroup>
                      <FormControl label="Currency">
                        <Select
                          value={invoice.currency}
                          onValueChange={(currency) =>
                            setInvoice((current) => ({ ...current, currency }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(currencySymbols).map(
                              ([code, symbol]) => (
                                <SelectItem key={code} value={code}>
                                  {code} {symbol}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormControl label="Invoice Prefix">
                        <Input
                          value={invoice.prefix}
                          onChange={(event) =>
                            setInvoice((current) => ({
                              ...current,
                              prefix: event.target.value,
                            }))
                          }
                        />
                      </FormControl>
                    </FieldGroup>
                    <FormControl label="Billing Details">
                      <BillingDetailsEditor
                        invoice={invoice}
                        setInvoice={setInvoice}
                      />
                    </FormControl>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="payment-defaults">
                  <AccordionTrigger className={accordionTriggerClassName}>
                    Payment & Terms
                  </AccordionTrigger>
                  <AccordionContent className={accordionContentClassName}>
                    <FormControl label="Terms">
                      <Textarea
                        value={invoice.terms}
                        onChange={(event) =>
                          setInvoice((current) => ({
                            ...current,
                            terms: event.target.value,
                          }))
                        }
                        className="min-h-24"
                      />
                    </FormControl>
                    <FormControl label="Payment Information">
                      <TextFieldsEditor
                        fields={invoice.paymentInformation}
                        addLabel="Add Payment Field"
                        onChange={(paymentInformation) =>
                          setInvoice((current) => ({
                            ...current,
                            paymentInformation,
                          }))
                        }
                      />
                    </FormControl>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>

            <TabsContent value="invoice" className="m-0">
              <Accordion
                type="single"
                collapsible
                defaultValue="client-details"
                className="w-full divide-y border-b"
              >
                <AccordionItem value="client-details">
                  <AccordionTrigger className={accordionTriggerClassName}>
                    Client Details
                  </AccordionTrigger>
                  <AccordionContent className={accordionContentClassName}>
                    <FormControl label="Client Name">
                      <Input
                        value={invoice.clientName}
                        onChange={(event) =>
                          setInvoice((current) => ({
                            ...current,
                            clientName: event.target.value,
                          }))
                        }
                      />
                    </FormControl>
                    <FormControl label="Client Address">
                      <Textarea
                        value={invoice.clientAddress}
                        onChange={(event) =>
                          setInvoice((current) => ({
                            ...current,
                            clientAddress: event.target.value,
                          }))
                        }
                        className="min-h-24"
                      />
                    </FormControl>
                    <FormControl label="Client Fields">
                      <TextFieldsEditor
                        fields={invoice.clientFields}
                        addLabel="Add New Field"
                        onChange={(clientFields) =>
                          setInvoice((current) => ({
                            ...current,
                            clientFields,
                          }))
                        }
                      />
                    </FormControl>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="invoice-meta">
                  <AccordionTrigger className={accordionTriggerClassName}>
                    Invoice Info
                  </AccordionTrigger>
                  <AccordionContent className={accordionContentClassName}>
                    <FormControl label="Serial Number">
                      <Input
                        value={invoice.serialNumber}
                        onChange={(event) =>
                          setInvoice((current) => ({
                            ...current,
                            serialNumber: event.target.value,
                          }))
                        }
                      />
                    </FormControl>
                    <FieldGroup>
                      <FormControl label="Invoice Date">
                        <div className="relative">
                          <Calendar className="text-muted-foreground pointer-events-none absolute top-2.5 left-3 size-4" />
                          <Input
                            type="date"
                            value={invoice.invoiceDate}
                            onChange={(event) =>
                              setInvoice((current) => ({
                                ...current,
                                invoiceDate: event.target.value,
                              }))
                            }
                            className="pl-9"
                          />
                        </div>
                      </FormControl>
                      <FormControl label="Due Date">
                        <div className="relative">
                          <Calendar className="text-muted-foreground pointer-events-none absolute top-2.5 left-3 size-4" />
                          <Input
                            type="date"
                            value={invoice.dueDate}
                            onChange={(event) =>
                              setInvoice((current) => ({
                                ...current,
                                dueDate: event.target.value,
                              }))
                            }
                            className="pl-9"
                          />
                        </div>
                      </FormControl>
                    </FieldGroup>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="invoice-items">
                  <AccordionTrigger className={accordionTriggerClassName}>
                    Invoice Items
                  </AccordionTrigger>
                  <AccordionContent className={accordionContentClassName}>
                    <InvoiceItemsEditor
                      invoice={invoice}
                      setInvoice={setInvoice}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>
          </Tabs>
        </section>

        <InvoicePreview invoice={invoice} />
      </div>
    </div>
  );
}
