"use client";

import {
  ArrowDownToLine,
  ArrowUpRight,
  CreditCard,
  Plus,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { downloadFile, money } from "./platform-data";
import { NoResults, PlatformPage, PlatformSelect } from "./platform-ui";

type Method = {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  name: string;
  primary: boolean;
};
type Invoice = {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: "Paid" | "Draft";
  method: string;
  items: { name: string; amount: number }[];
};
const initialMethods: Method[] = [
  {
    id: "visa",
    brand: "Visa",
    last4: "4242",
    expiry: "12/2028",
    name: "Studio operations",
    primary: true,
  },
  {
    id: "mastercard",
    brand: "Mastercard",
    last4: "4444",
    expiry: "08/2029",
    name: "Backup card",
    primary: false,
  },
];
const initialInvoices: Invoice[] = [
  {
    id: "INV-2026-09",
    date: "2026-09-11",
    description: "September usage · in progress",
    amount: 273.94,
    status: "Draft",
    method: "Prepaid balance",
    items: [
      { name: "OpenAI requests", amount: 78.67 },
      { name: "Anthropic requests", amount: 167.8 },
      { name: "Google requests", amount: 27.47 },
    ],
  },
  {
    id: "RCPT-2026-09",
    date: "2026-09-01",
    description: "Prepaid credit purchase",
    amount: 500,
    status: "Paid",
    method: "Visa •••• 4242",
    items: [{ name: "Workspace credits", amount: 500 }],
  },
  {
    id: "INV-2026-08",
    date: "2026-08-31",
    description: "August usage",
    amount: 241.2,
    status: "Paid",
    method: "Prepaid balance",
    items: [
      { name: "Model requests", amount: 219.4 },
      { name: "File search & storage", amount: 21.8 },
    ],
  },
  {
    id: "INV-2026-07",
    date: "2026-07-31",
    description: "July usage",
    amount: 198.65,
    status: "Paid",
    method: "Prepaid balance",
    items: [
      { name: "Model requests", amount: 181.15 },
      { name: "File search & storage", amount: 17.5 },
    ],
  },
];
export function BillingScreen() {
  const [tab, setTab] = useState("overview");
  const [balance, setBalance] = useState(226.06);
  const [methods, setMethods] = useState(initialMethods);
  const [invoices, setInvoices] = useState(initialInvoices);
  const [month, setMonth] = useState("all");
  const [autoRecharge, setAutoRecharge] = useState(true);
  const [contact, setContact] = useState("billing@example.com");
  const [draftContact, setDraftContact] = useState(contact);
  const [dialog, setDialogValue] = useState<
    "credits" | "method" | "contact" | null
  >(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  function setDialog(value: "credits" | "method" | "contact" | null) {
    if (value !== null) setDialogValue(value);
    setDialogOpen(value !== null);
  }
  const [amount, setAmount] = useState("100");
  const [brand, setBrand] = useState("Visa");
  const [last4, setLast4] = useState("4242");
  const [cardName, setCardName] = useState("");
  const [remove, setRemove] = useState<Method | null>(null);
  const [detail, setDetail] = useState<Invoice | null>(null);
  const primary = methods.find((method) => method.primary);
  const filtered = invoices.filter(
    (invoice) => month === "all" || invoice.date.startsWith(month),
  );
  function exportInvoice(invoice: Invoice) {
    downloadFile(
      `${invoice.id}.csv`,
      [
        "description,amount_usd",
        ...invoice.items.map(
          (item) => `${item.name},${item.amount.toFixed(2)}`,
        ),
        `Total,${invoice.amount.toFixed(2)}`,
      ].join("\n"),
      "text/csv;charset=utf-8",
    );
  }
  return (
    <PlatformPage
      title="Billing"
      description="Workspace credits, payment methods, and monthly statements."
      onReset={() => {
        setTab("overview");
        setBalance(226.06);
        setMethods(initialMethods);
        setInvoices(initialInvoices);
        setMonth("all");
        setAutoRecharge(true);
        setContact("billing@example.com");
      }}
      actions={
        <Button variant="outline" size="sm" asChild>
          <Link href="/ai-chat/credit-usage">
            View usage
            <ArrowUpRight data-icon="inline-end" />
          </Link>
        </Button>
      }
    >
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList aria-label="Billing sections">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="methods">Payment methods</TabsTrigger>
          <TabsTrigger value="history">Billing history</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <Card>
              <CardHeader>
                <div className="mb-2 flex items-center justify-between">
                  <Wallet className="text-muted-foreground size-5" />
                  <Badge variant="outline">Prepaid</Badge>
                </div>
                <CardTitle>Available credits</CardTitle>
                <CardDescription>
                  Usage is deducted from this balance as it occurs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-semibold tracking-tight tabular-nums">
                  {money(balance)}
                </p>
                <p className="text-muted-foreground mt-2 text-sm">
                  $273.94 used in the current billing period.
                </p>
                <Separator className="my-6" />
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground text-xs">
                      Current period
                    </dt>
                    <dd className="mt-1">Sep 1 – 30, 2026</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-xs">
                      Next statement
                    </dt>
                    <dd className="mt-1">Oct 1, 2026</dd>
                  </div>
                </dl>
              </CardContent>
              <CardFooter className="flex-wrap gap-2">
                <Button
                  onClick={() => {
                    setAmount("100");
                    setDialog("credits");
                  }}
                >
                  <Plus data-icon="inline-start" />
                  Add demo credits
                </Button>
                <Button variant="outline" onClick={() => setTab("history")}>
                  View statements
                </Button>
              </CardFooter>
            </Card>
            <div className="flex flex-col gap-5">
              <Card>
                <CardHeader>
                  <CardTitle>Automatic recharge</CardTitle>
                  <CardDescription>
                    Keep a planning buffer for ongoing work.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FieldGroup>
                    <Field orientation="horizontal">
                      <div className="flex-1">
                        <FieldLabel htmlFor="billing-auto">
                          Recharge when below $50
                        </FieldLabel>
                        <FieldDescription>
                          Add $100 using the default demo payment method.
                        </FieldDescription>
                      </div>
                      <Switch
                        id="billing-auto"
                        checked={autoRecharge}
                        disabled={!primary}
                        onCheckedChange={(checked) => {
                          setAutoRecharge(checked);
                          toast.success("Recharge preference updated");
                        }}
                      />
                    </Field>
                  </FieldGroup>
                  <p className="text-muted-foreground mt-3 text-xs">
                    This preference is illustrative; no charges are scheduled.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Billing details</CardTitle>
                  <CardDescription>Shadcnblocks Studio</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CreditCard className="text-muted-foreground size-4" />
                    {primary
                      ? `${primary.brand} •••• ${primary.last4}`
                      : "No default payment method"}
                  </div>
                  <p className="text-muted-foreground">{contact}</p>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTab("methods")}
                  >
                    Manage cards
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDraftContact(contact);
                      setDialog("contact");
                    }}
                  >
                    Edit contact
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="methods" className="mt-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Payment methods</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  All cards shown here are fictional demo records.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setCardName("");
                  setLast4("4242");
                  setBrand("Visa");
                  setDialog("method");
                }}
              >
                <Plus data-icon="inline-start" />
                Add demo card
              </Button>
            </div>
            <div className="divide-y rounded-lg border">
              {methods.length ? (
                methods.map((method) => (
                  <div
                    className="flex flex-wrap items-center gap-4 p-5"
                    key={method.id}
                  >
                    <div className="bg-muted grid h-10 w-16 place-items-center rounded-md border text-[11px] font-semibold">
                      {method.brand}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">
                          {method.brand} ending in {method.last4}
                        </p>
                        {method.primary ? (
                          <Badge variant="secondary">Default</Badge>
                        ) : null}
                      </div>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {method.name} · Expires {method.expiry}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={method.primary}
                      onClick={() => {
                        setMethods((items) =>
                          items.map((card) => ({
                            ...card,
                            primary: card.id === method.id,
                          })),
                        );
                        toast.success("Default payment method updated");
                      }}
                    >
                      Make default
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRemove(method)}
                    >
                      Remove
                    </Button>
                  </div>
                ))
              ) : (
                <NoResults
                  title="No payment methods"
                  description="Add a demo card to try credit purchases."
                />
              )}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="history" className="mt-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Billing history</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Statements and credit receipts for this workspace.
                </p>
              </div>
              <PlatformSelect
                label="Billing month"
                value={month}
                onChange={setMonth}
                options={[
                  { value: "all", label: "All months" },
                  { value: "2026-09", label: "September 2026" },
                  { value: "2026-08", label: "August 2026" },
                  { value: "2026-07", label: "July 2026" },
                ]}
              />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Statement</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <button
                        onClick={() => setDetail(invoice)}
                        className="text-left hover:underline"
                      >
                        <p className="font-medium">{invoice.id}</p>
                        <p className="text-muted-foreground mt-1 text-xs">
                          {invoice.description}
                        </p>
                      </button>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {invoice.date}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          invoice.status === "Paid" ? "secondary" : "outline"
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {money(invoice.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDetail(invoice)}
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Download ${invoice.id}`}
                        onClick={() => exportInvoice(invoice)}
                      >
                        <ArrowDownToLine />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog === "credits"
                ? "Add demo credits"
                : dialog === "method"
                  ? "Add a demo payment method"
                  : "Billing contact"}
            </DialogTitle>
            <DialogDescription>
              {dialog === "credits"
                ? "This updates the demo ledger. No payment will be processed."
                : dialog === "method"
                  ? "Use fictional card details only. No card number or security code is collected."
                  : "Update the contact shown on this workspace’s billing page."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (dialog === "credits") {
                if (!primary) return;
                const value = Number(amount);
                setBalance((n) => Math.round((n + value) * 100) / 100);
                setInvoices((items) => [
                  {
                    id: `RCPT-DEMO-${(globalThis.crypto?.randomUUID?.().slice(0, 6) ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`).toUpperCase()}`,
                    date: "2026-09-11",
                    description: "Demo credit purchase",
                    amount: value,
                    status: "Paid",
                    method: `${primary.brand} •••• ${primary.last4}`,
                    items: [{ name: "Workspace credits", amount: value }],
                  },
                  ...items,
                ]);
                toast.success(`${money(value)} demo credits added`);
              } else if (dialog === "method") {
                if (!cardName.trim()) return;
                setMethods((items) => [
                  ...items,
                  {
                    id:
                      globalThis.crypto?.randomUUID?.() ??
                      `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
                    brand,
                    last4,
                    name: cardName.trim(),
                    expiry: "12/2028",
                    primary: items.length === 0,
                  },
                ]);
                toast.success("Demo card added");
              } else {
                setContact(draftContact.trim());
                toast.success("Billing contact saved");
              }
              setDialog(null);
            }}
          >
            <FieldGroup>
              {dialog === "credits" ? (
                <>
                  <Field>
                    <FieldLabel htmlFor="billing-credit-amount">
                      Amount (USD)
                    </FieldLabel>
                    <Input
                      id="billing-credit-amount"
                      type="number"
                      min={10}
                      max={10000}
                      step={10}
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </Field>
                  <p className="text-muted-foreground text-sm">
                    {primary
                      ? `Demo method: ${primary.brand} •••• ${primary.last4}`
                      : "Add a payment method before adding credits."}
                  </p>
                </>
              ) : dialog === "method" ? (
                <>
                  <Field>
                    <FieldLabel htmlFor="billing-card-name">
                      Card label
                    </FieldLabel>
                    <Input
                      id="billing-card-name"
                      required
                      maxLength={60}
                      placeholder="e.g. Team expenses"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Brand</FieldLabel>
                      <PlatformSelect
                        label="Card brand"
                        value={brand}
                        onChange={setBrand}
                        options={["Visa", "Mastercard", "Amex"]}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="billing-last-four">
                        Demo last four
                      </FieldLabel>
                      <Input
                        id="billing-last-four"
                        inputMode="numeric"
                        pattern="[0-9]{4}"
                        maxLength={4}
                        required
                        value={last4}
                        onChange={(e) =>
                          setLast4(e.target.value.replace(/\D/g, ""))
                        }
                      />
                    </Field>
                  </div>
                  <FieldDescription>
                    Demo expiration: December 2028.
                  </FieldDescription>
                </>
              ) : (
                <Field>
                  <FieldLabel htmlFor="billing-contact">
                    Contact email
                  </FieldLabel>
                  <Input
                    id="billing-contact"
                    type="email"
                    required
                    value={draftContact}
                    onChange={(e) => setDraftContact(e.target.value)}
                  />
                </Field>
              )}
            </FieldGroup>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialog(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={dialog === "credits" && !primary}>
                {dialog === "credits" ? "Add demo credits" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!remove}
        onOpenChange={(open) => {
          if (!open) setRemove(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Remove {remove?.brand} ending in {remove?.last4}?
            </DialogTitle>
            <DialogDescription>
              {remove?.primary
                ? "The next available card will become the default. Recharge is disabled if no cards remain."
                : "This removes the card from the demo workspace."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemove(null)}>
              Keep card
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                const remaining = methods.filter(
                  (card) => card.id !== remove?.id,
                );
                if (!remaining.some((card) => card.primary) && remaining[0])
                  remaining[0] = { ...remaining[0], primary: true };
                setMethods(remaining);
                if (!remaining.length) setAutoRecharge(false);
                setRemove(null);
                toast.success("Demo card removed");
              }}
            >
              Remove card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Sheet
        open={!!detail}
        onOpenChange={(open) => {
          if (!open) setDetail(null);
        }}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{detail?.id}</SheetTitle>
            <SheetDescription>{detail?.description}</SheetDescription>
          </SheetHeader>
          {detail ? (
            <div className="flex flex-col gap-6 px-4 pb-6">
              <div className="flex items-center justify-between">
                <Badge variant="outline">{detail.status}</Badge>
                <span className="text-muted-foreground text-xs">
                  {detail.date}
                </span>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Total (USD)</p>
                <p className="mt-1 text-3xl font-semibold tabular-nums">
                  {money(detail.amount)}
                </p>
              </div>
              <Separator />
              <dl className="flex flex-col gap-4 text-sm">
                {detail.items.map((item) => (
                  <div className="flex justify-between gap-4" key={item.name}>
                    <dt className="text-muted-foreground">{item.name}</dt>
                    <dd className="font-mono text-xs">{money(item.amount)}</dd>
                  </div>
                ))}
              </dl>
              <Separator />
              <p className="text-muted-foreground text-xs">
                {detail.status === "Draft"
                  ? "In-progress statement. Usage has already been deducted from prepaid credits."
                  : `Settled using ${detail.method}.`}
              </p>
              <Button variant="outline" onClick={() => exportInvoice(detail)}>
                <ArrowDownToLine data-icon="inline-start" />
                Download statement CSV
              </Button>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </PlatformPage>
  );
}
