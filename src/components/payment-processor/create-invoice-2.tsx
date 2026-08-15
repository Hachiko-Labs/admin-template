"use client";

import { closestCenter, DndContext, type DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CalendarIcon,
  Check,
  ChevronLeft,
  Download,
  EllipsisVertical,
  GripVertical,
  Plus,
  Send,
  Trash2,
} from "lucide-react";
import * as React from "react";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type InvoiceItem = {
  id: string;
  name: string;
  quantity: number;
  rate: number;
};

type InvoiceDraft = {
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  issuedDate: string;
  dueDate: string;
  project: string;
  paymentReference: string;
  paymentTerms: string;
  taxRate: number;
  currency: CurrencyCode;
  items: InvoiceItem[];
  notes: string[];
};

const editorTabs = [
  { label: "Invoice Details", value: "details" },
  { label: "Setup", value: "setup" },
] as const;

type EditorTab = (typeof editorTabs)[number]["value"];

const clients = [
  { name: "Olivia Bennett", email: "accounts@northstar.studio" },
  { name: "Maya Patel", email: "billing@northstar.studio" },
  { name: "Rohan Mehta", email: "ops@northstar.studio" },
] as const;

const projects = [
  "Northstar Studio workspace rollout",
  "Payment screens implementation",
  "Admin kit integration",
] as const;

const currencies = [
  {
    label: "United States Dollar (USD) $",
    value: "USD",
    symbol: "$",
  },
  {
    label: "Euro (EUR) €",
    value: "EUR",
    symbol: "€",
  },
  {
    label: "Indian Rupee (INR) ₹",
    value: "INR",
    symbol: "₹",
  },
] as const;

type CurrencyCode = (typeof currencies)[number]["value"];

const serviceCatalog = [
  {
    name: "Admin workspace license",
    description: "Seats for the Shadcnblocks admin workspace",
    rate: 399,
  },
  {
    name: "Payment screens implementation",
    description: "Invoice, subscription, and payment processor UI screens",
    rate: 240,
  },
  {
    name: "Design handoff and QA notes",
    description: "Design-system files, implementation notes, and QA pass",
    rate: 315,
  },
  {
    name: "Implementation support",
    description: "Post-handoff engineering support and billing workflow polish",
    rate: 380,
  },
  {
    name: "Figma kit handoff",
    description: "Design-system assets and block references for product teams",
    rate: 330,
  },
  {
    name: "Template implementation pack",
    description: "Production-ready Next.js and Astro templates",
    rate: 79,
  },
] as const;

const initialInvoice: InvoiceDraft = {
  invoiceNumber: "2026-084",
  clientName: "Olivia Bennett",
  clientEmail: "accounts@northstar.studio",
  issuedDate: "2026-05-27",
  dueDate: "2026-06-26",
  project: "Northstar Studio workspace rollout",
  paymentReference: "NS-4826-PRO",
  paymentTerms: "Payment is due 30 days after issue.",
  taxRate: 0,
  currency: "USD",
  items: [
    { id: "item-1", name: "Admin workspace license", quantity: 4, rate: 399 },
    {
      id: "item-2",
      name: "Payment screens implementation",
      quantity: 8,
      rate: 240,
    },
    {
      id: "item-3",
      name: "Design handoff and QA notes",
      quantity: 3,
      rate: 315,
    },
    { id: "item-4", name: "Implementation support", quantity: 2, rate: 380 },
  ],
  notes: ["Include the payment reference with the payment memo."],
};

const getServiceDetail = (name: string) =>
  serviceCatalog.find((service) => service.name === name);

const formatDate = (date: string) => {
  if (!date) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
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

const getCurrency = (currency: CurrencyCode) =>
  currencies.find((entry) => entry.value === currency) ?? currencies[0];

const money = (value: number, currency: CurrencyCode, compact = false) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: compact ? 0 : 2,
  });

  return formatter.format(compact ? Math.round(value) : value);
};

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

function DateInput({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const selectedDate = parseInputDate(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn(
            "h-10 w-full justify-start gap-2 text-left font-normal",
            !selectedDate && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="size-4" />
          {selectedDate ? formatDate(value) : "Pick a date"}
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

function InvoiceEditor({
  invoice,
  setInvoice,
}: {
  invoice: InvoiceDraft;
  setInvoice: React.Dispatch<React.SetStateAction<InvoiceDraft>>;
}) {
  const [activeTab, setActiveTab] = React.useState<EditorTab>("details");
  const total = invoice.items.reduce(
    (sum, item) => sum + item.quantity * item.rate,
    0,
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setInvoice((current) => {
      const oldIndex = current.items.findIndex((item) => item.id === active.id);
      const newIndex = current.items.findIndex((item) => item.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return current;

      return {
        ...current,
        items: arrayMove(current.items, oldIndex, newIndex),
      };
    });
  };

  return (
    <section className="bg-background min-h-0 overflow-y-auto pb-28 sm:pb-24">
      <div className="border-b">
        <div className="flex items-center justify-between gap-3 px-5 lg:px-8">
          <nav
            aria-label="Invoice editor sections"
            className="flex min-w-0 items-center gap-6 overflow-x-auto"
          >
            {editorTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "text-muted-foreground inline-flex h-12 shrink-0 items-center border-b-2 border-transparent text-sm font-semibold transition-colors",
                  activeTab === tab.value
                    ? "border-foreground text-foreground"
                    : "hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {activeTab === "details" ? (
        <div className="flex flex-col gap-7 px-5 py-6 lg:px-8">
          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold tracking-tight">
              Invoice details
            </h2>

            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="invoice-client">
                  Bill to (Client)
                </FieldLabel>
                <Select
                  value={invoice.clientEmail}
                  onValueChange={(clientEmail) => {
                    const client = clients.find(
                      (entry) => entry.email === clientEmail,
                    );

                    if (!client) return;

                    setInvoice((current) => ({
                      ...current,
                      clientEmail,
                      clientName: client.name,
                    }));
                  }}
                >
                  <SelectTrigger id="invoice-client" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {clients.map((client) => (
                        <SelectItem key={client.email} value={client.email}>
                          {client.name} · {client.email}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <FieldGroup className="gap-4 md:grid md:grid-cols-3">
                <Field>
                  <FieldLabel htmlFor="invoice-number">
                    Invoice number
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupAddon align="inline-start">
                      <InputGroupText>SB-</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      id="invoice-number"
                      value={invoice.invoiceNumber}
                      onChange={(event) =>
                        setInvoice((current) => ({
                          ...current,
                          invoiceNumber: event.target.value,
                        }))
                      }
                    />
                  </InputGroup>
                </Field>
                <Field>
                  <FieldLabel htmlFor="invoice-issued-date">
                    Issued date
                  </FieldLabel>
                  <DateInput
                    id="invoice-issued-date"
                    value={invoice.issuedDate}
                    onChange={(issuedDate) =>
                      setInvoice((current) => ({ ...current, issuedDate }))
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="invoice-due-date">Due date</FieldLabel>
                  <DateInput
                    id="invoice-due-date"
                    value={invoice.dueDate}
                    onChange={(dueDate) =>
                      setInvoice((current) => ({ ...current, dueDate }))
                    }
                  />
                </Field>
              </FieldGroup>

              <Field>
                <FieldLabel htmlFor="invoice-project">Project</FieldLabel>
                <Select
                  value={invoice.project}
                  onValueChange={(project) =>
                    setInvoice((current) => ({ ...current, project }))
                  }
                >
                  <SelectTrigger id="invoice-project">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {projects.map((project) => (
                        <SelectItem key={project} value={project}>
                          {project}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
          </section>

          <Separator />

          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold tracking-tight">
              Invoice Items
            </h2>

            <Field>
              <FieldLabel htmlFor="invoice-currency">Currency</FieldLabel>
              <Select
                value={invoice.currency}
                onValueChange={(currency) =>
                  setInvoice((current) => ({
                    ...current,
                    currency: currency as CurrencyCode,
                  }))
                }
              >
                <SelectTrigger id="invoice-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Items</FieldLabel>
              <div className="overflow-hidden rounded-xl border">
                <div className="text-muted-foreground grid grid-cols-[32px_minmax(120px,1.4fr)_56px_88px_84px_36px] items-center gap-2 border-b px-3 py-2.5 text-sm font-semibold">
                  <div />
                  <div>Item Name</div>
                  <div className="text-center">Qty</div>
                  <div>Rate</div>
                  <div className="text-right">Total</div>
                  <div />
                </div>

                <DndContext
                  id="create-invoice-2-items"
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={invoice.items.map((item) => item.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="divide-y">
                      {invoice.items.map((item) => (
                        <SortableInvoiceItemRow
                          key={item.id}
                          currency={invoice.currency}
                          item={item}
                          setInvoice={setInvoice}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                <div className="border-t p-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="text-primary h-10 w-full border-dashed font-semibold"
                    onClick={() =>
                      setInvoice((current) => ({
                        ...current,
                        items: [
                          ...current.items,
                          {
                            id: uid(),
                            name: "Figma kit handoff",
                            quantity: 1,
                            rate: 330,
                          },
                        ],
                      }))
                    }
                  >
                    <Plus className="size-4" />
                    Add a New Item
                  </Button>
                </div>
              </div>
            </Field>

            <div className="text-muted-foreground flex justify-end text-sm">
              Draft total:{" "}
              <span className="text-foreground ml-2 font-semibold tabular-nums">
                {money(total, invoice.currency)}
              </span>
            </div>
          </section>
        </div>
      ) : (
        <div className="flex flex-col gap-7 px-5 py-6 lg:px-8">
          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold tracking-tight">Setup</h2>

            <FieldGroup className="gap-4">
              <FieldGroup className="gap-4 md:grid md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="invoice-payment-reference">
                    Payment reference
                  </FieldLabel>
                  <Input
                    id="invoice-payment-reference"
                    value={invoice.paymentReference}
                    onChange={(event) =>
                      setInvoice((current) => ({
                        ...current,
                        paymentReference: event.target.value,
                      }))
                    }
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="invoice-tax-rate">Tax rate</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id="invoice-tax-rate"
                      min="0"
                      step="0.1"
                      type="number"
                      value={invoice.taxRate}
                      onChange={(event) =>
                        setInvoice((current) => ({
                          ...current,
                          taxRate: Number(event.target.value),
                        }))
                      }
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupText>%</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                </Field>
              </FieldGroup>

              <Field>
                <FieldLabel htmlFor="invoice-payment-terms">
                  Payment terms
                </FieldLabel>
                <Textarea
                  id="invoice-payment-terms"
                  className="min-h-24"
                  value={invoice.paymentTerms}
                  onChange={(event) =>
                    setInvoice((current) => ({
                      ...current,
                      paymentTerms: event.target.value,
                    }))
                  }
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="invoice-notes">Notes</FieldLabel>
                <Textarea
                  id="invoice-notes"
                  className="min-h-32"
                  value={invoice.notes.join("\n")}
                  onChange={(event) =>
                    setInvoice((current) => ({
                      ...current,
                      notes: event.target.value
                        .split("\n")
                        .map((note) => note.trim())
                        .filter(Boolean),
                    }))
                  }
                />
              </Field>
            </FieldGroup>
          </section>
        </div>
      )}
    </section>
  );
}

function SortableInvoiceItemRow({
  currency,
  item,
  setInvoice,
}: {
  currency: CurrencyCode;
  item: InvoiceItem;
  setInvoice: React.Dispatch<React.SetStateAction<InvoiceDraft>>;
}) {
  const selectedCurrency = getCurrency(currency);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "grid grid-cols-[32px_minmax(120px,1.4fr)_56px_88px_84px_36px] items-center gap-2 px-3 py-2.5",
        isDragging && "bg-background relative z-10 opacity-70 shadow-sm",
      )}
    >
      <button
        type="button"
        className="text-muted-foreground hover:bg-muted grid size-8 cursor-grab place-items-center rounded-md active:cursor-grabbing"
        aria-label="Reorder item"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>

      <Select
        value={item.name}
        onValueChange={(name) => {
          setInvoice((current) => {
            const items = [...current.items];
            const itemIndex = items.findIndex((entry) => entry.id === item.id);
            const service = getServiceDetail(name);

            if (itemIndex === -1) return current;

            items[itemIndex] = {
              ...items[itemIndex],
              name,
              rate: service?.rate ?? items[itemIndex].rate,
            };
            return { ...current, items };
          });
        }}
      >
        <SelectTrigger aria-label="Item name" className="min-w-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {serviceCatalog.map((option) => (
              <SelectItem key={option.name} value={option.name}>
                {option.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Input
        aria-label="Quantity"
        type="number"
        min="0"
        value={item.quantity}
        onChange={(event) => {
          setInvoice((current) => {
            const items = [...current.items];
            const itemIndex = items.findIndex((entry) => entry.id === item.id);

            if (itemIndex === -1) return current;

            items[itemIndex] = {
              ...items[itemIndex],
              quantity: Number(event.target.value),
            };
            return { ...current, items };
          });
        }}
        className="px-2 text-center"
      />

      <InputGroup className="min-w-0">
        <InputGroupAddon align="inline-start">
          <InputGroupText>{selectedCurrency.symbol}</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput
          aria-label="Rate"
          type="number"
          min="0"
          value={item.rate}
          onChange={(event) => {
            setInvoice((current) => {
              const items = [...current.items];
              const itemIndex = items.findIndex(
                (entry) => entry.id === item.id,
              );

              if (itemIndex === -1) return current;

              items[itemIndex] = {
                ...items[itemIndex],
                rate: Number(event.target.value),
              };
              return { ...current, items };
            });
          }}
          className="px-1.5"
        />
      </InputGroup>

      <div className="min-w-0 text-right text-sm font-semibold tabular-nums">
        {money(item.quantity * item.rate, currency)}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground size-8 justify-self-end"
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
  );
}

function InvoicePreview2({ invoice }: { invoice: InvoiceDraft }) {
  const total = invoice.items.reduce(
    (sum, item) => sum + item.quantity * item.rate,
    0,
  );
  const taxTotal = total * (invoice.taxRate / 100);
  const totalDue = total + taxTotal;

  return (
    <aside className="bg-muted/35 min-h-0 overflow-y-auto border-l pb-28 sm:pb-24">
      <article className="mx-auto flex min-h-full max-w-[900px] flex-col px-8 py-9">
        <header className="pb-7">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">Invoice</h2>
              <div className="mt-4 grid gap-1 text-sm">
                <p>
                  <span className="text-muted-foreground font-medium">
                    Invoice no.
                  </span>{" "}
                  <span className="font-semibold">
                    SB-{invoice.invoiceNumber}
                  </span>
                </p>
                <p className="text-muted-foreground">
                  Ref:{" "}
                  <span className="text-foreground font-medium">
                    {invoice.paymentReference || "—"}
                  </span>
                </p>
              </div>
            </div>
            <div className="bg-primary text-primary-foreground grid size-12 shrink-0 place-items-center rounded-full">
              <Logo
                alt="Shadcnblocks"
                className="size-6 object-contain brightness-0 invert dark:invert-0"
                height={24}
                src="/logo-black.svg"
                width={24}
              />
            </div>
          </div>
        </header>

        <section className="grid gap-8 py-7 md:grid-cols-2">
          <div>
            <p className="text-muted-foreground mb-2 text-sm font-semibold">
              Billed by:
            </p>
            <h3 className="text-base font-semibold">Shadcnblocks.com</h3>
            <p className="text-muted-foreground mt-1.5 text-sm">
              billing@shadcnblocks.com
            </p>
            <p className="text-muted-foreground mt-3 max-w-52 text-sm leading-6">
              Level 12, 45 Clarence Street, Sydney NSW 2000
            </p>
          </div>

          <div>
            <p className="text-muted-foreground mb-2 text-sm font-semibold">
              Billed to:
            </p>
            <h3 className="text-base font-semibold">Northstar Studio</h3>
            <p className="text-muted-foreground mt-1.5 text-sm">
              {invoice.clientName} · {invoice.clientEmail}
            </p>
            <p className="text-muted-foreground mt-3 max-w-60 text-sm leading-6">
              18 Collins Street, Melbourne VIC 3000, Australia
            </p>
          </div>
        </section>

        <section className="py-6">
          <div className="bg-background overflow-hidden rounded-lg border">
            <table className="w-full table-fixed text-left text-sm">
              <colgroup>
                <col className="w-full" />
                <col className="w-16" />
                <col className="w-24" />
                <col className="w-28" />
              </colgroup>
              <thead className="bg-muted/55 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Service</th>
                  <th className="px-3 py-3 text-center font-semibold">Qty</th>
                  <th className="px-3 py-3 text-right font-semibold">Rate</th>
                  <th className="px-4 py-3 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoice.items.map((item) => {
                  const service = getServiceDetail(item.name);

                  return (
                    <tr key={item.id}>
                      <td className="px-4 py-4 align-top">
                        <p className="font-semibold">
                          {item.name || "Untitled service"}
                        </p>
                        <p className="text-muted-foreground mt-1.5 line-clamp-2 text-xs leading-5">
                          {service?.description ?? "Custom billing line item"}
                        </p>
                      </td>
                      <td className="px-3 py-4 text-center align-top font-semibold tabular-nums">
                        {item.quantity}
                      </td>
                      <td className="px-3 py-4 text-right align-top font-semibold tabular-nums">
                        {money(item.rate, invoice.currency)}
                      </td>
                      <td className="px-4 py-4 text-right align-top font-semibold tabular-nums">
                        {money(item.quantity * item.rate, invoice.currency)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex justify-end">
            <dl className="w-full max-w-xs space-y-3 rounded-lg px-4 py-4 text-sm">
              <PreviewTotal
                label="Subtotal"
                value={money(total, invoice.currency, true)}
              />
              <PreviewTotal
                label="Tax reserved"
                value={money(taxTotal, invoice.currency)}
              />
              <PreviewTotal
                className="border-t pt-3 text-base font-semibold"
                label="Total due"
                value={money(totalDue, invoice.currency, true)}
              />
            </dl>
          </div>
        </section>

        <footer className="mt-auto pt-16">
          <h3 className="text-muted-foreground mb-3 font-semibold">
            Payment terms
          </h3>
          <p className="text-muted-foreground mb-6 text-sm leading-6">
            {invoice.paymentTerms}
          </p>

          <h3 className="text-muted-foreground mb-3 font-semibold">Notes</h3>
          <ul className="text-muted-foreground list-disc space-y-2 pl-5 text-sm">
            {invoice.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </footer>
      </article>
    </aside>
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
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

function InvoiceActionIsland() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-20 flex justify-center px-3 sm:bottom-5">
      <div className="bg-background/95 pointer-events-auto flex w-full max-w-[min(100%,46rem)] items-center justify-between gap-2 rounded-full border p-1.5 shadow-[0_18px_45px_-24px_rgba(15,23,42,0.45)] backdrop-blur-md sm:w-auto sm:justify-center">
        <Button
          type="button"
          variant="ghost"
          className="h-10 flex-1 rounded-full px-3 text-sm sm:flex-none sm:px-4"
        >
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline">Back </span>
          <span className="sm:hidden">Back</span>
        </Button>

        <div className="bg-border h-6 w-px" aria-hidden="true" />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-10 shrink-0 rounded-full"
          aria-label="Send invoice"
        >
          <Send className="size-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-10 shrink-0 rounded-full"
          aria-label="Download invoice PDF"
        >
          <Download className="size-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-10 shrink-0 rounded-full"
              aria-label="More invoice actions"
            >
              <EllipsisVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-44">
            <DropdownMenuItem>Duplicate invoice</DropdownMenuItem>
            <DropdownMenuItem>Reset draft</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          type="button"
          className="h-10 flex-1 rounded-full px-4 text-sm font-semibold sm:flex-none"
        >
          <Check className="size-4" />
          Submit
        </Button>
      </div>
    </div>
  );
}

export function PaymentProcessorCreateInvoice2() {
  const [invoice, setInvoice] = React.useState<InvoiceDraft>(initialInvoice);

  return (
    <div className="bg-background relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="grid min-h-0 flex-1 lg:grid-cols-2">
        <InvoiceEditor invoice={invoice} setInvoice={setInvoice} />
        <InvoicePreview2 invoice={invoice} />
      </div>
      <InvoiceActionIsland />
    </div>
  );
}
