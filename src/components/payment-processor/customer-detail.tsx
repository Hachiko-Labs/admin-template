"use client";

import { ChevronDown, Download, Mail, Search, Settings } from "lucide-react";
import type { ReactNode } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const planSummary = [
  { label: "Your plan", value: "Team Premium" },
  { label: "Total amount", value: "120.00 USD" },
  { label: "Cycle", value: "Monthly" },
  { label: "Next billing date", value: "Mon, 19 Jan 2027" },
  { label: "Members", value: "12 members" },
];

const customer = {
  name: "Northstar Supply Co.",
  email: "billing@northstarsupply.com",
  id: "cus_9Kx41L",
  accountType: "Business account",
  avatar: "/avatars/avatar-1.png",
  initials: "NS",
};

const paymentMethods = [
  {
    id: "pm_google_visa",
    provider: "G Pay",
    name: "Google/Visa",
    ending: "Ending 9862",
    role: "Default",
    expires: "12/2032",
    status: "Working",
  },
  {
    id: "pm_mastercard",
    provider: "MC",
    name: "Mastercard",
    ending: "Ending 7299",
    role: "Backup",
    expires: "02/2030",
    status: "Working",
  },
  {
    id: "pm_apple_jcb",
    provider: "Pay",
    name: "Apple/JCB",
    ending: "Ending 9834",
    role: "Backup",
    expires: "08/2033",
    status: "Working",
  },
];

const invoices = [
  {
    id: "SD862840-48",
    sent: "Sun, 20 Dec 2026",
    amount: "$120.00",
    plan: "Premium Monthly",
    status: "Paid",
    method: "Google/Visa ending 9862",
    billingPeriod: "Nov 20 - Dec 20, 2026",
  },
  {
    id: "SD862840-47",
    sent: "Sat, 20 Nov 2026",
    amount: "$120.00",
    plan: "Premium Monthly",
    status: "Paid",
    method: "Google/Visa ending 9862",
    billingPeriod: "Oct 20 - Nov 20, 2026",
  },
  {
    id: "SD862840-46",
    sent: "Fri, 19 Oct 2026",
    amount: "$140.00",
    plan: "Premium Monthly",
    status: "Paid",
    method: "Mastercard ending 7299",
    billingPeriod: "Sep 19 - Oct 19, 2026",
  },
  {
    id: "SD862840-45-1",
    sent: "Fri, 19 Oct 2026",
    amount: "$140.00",
    plan: "Premium Monthly",
    status: "Declined",
    method: "Apple/JCB ending 9834",
    billingPeriod: "Sep 19 - Oct 19, 2026",
  },
  {
    id: "SD862840-41",
    sent: "Mon, 20 Jun 2026",
    amount: "$140.00",
    plan: "Premium Monthly",
    status: "Paid",
    method: "Google/Visa ending 9862",
    billingPeriod: "May 20 - Jun 20, 2026",
  },
];

function StatusBadge({
  status,
  variant = "success",
}: {
  status: string;
  variant?: "success" | "muted" | "danger";
}) {
  const className = {
    success:
      "border-emerald-600/20 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-900/30 dark:text-emerald-400",
    muted: "border-border bg-muted text-muted-foreground dark:bg-muted/50",
    danger:
      "border-rose-600/20 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-900/30 dark:text-rose-400",
  }[variant];

  return (
    <Badge
      variant="outline"
      className={cn(
        "h-[18px] w-fit gap-1 justify-self-start rounded-md border px-1.5 text-[10px] leading-none shadow-none",
        className,
      )}
    >
      {variant !== "muted" ? (
        <span className="size-1 rounded-full bg-current" />
      ) : null}
      {status}
    </Badge>
  );
}

function SortLabel({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1">
      {children}
      <ChevronDown className="size-3.5" aria-hidden="true" />
    </span>
  );
}

function PaymentMethodMark({ label }: { label: string }) {
  return (
    <span className="bg-background flex h-8 w-12 items-center justify-center rounded-md text-[11px] font-semibold shadow-[0_0_0_1px_var(--border)]">
      {label}
    </span>
  );
}

export function PaymentProcessorCustomerDetail() {
  return (
    <main className="bg-background text-foreground flex min-h-0 flex-1 overflow-hidden">
      <div className="min-h-0 w-full flex-1 overflow-y-auto">
        <section className="px-6 py-12 lg:px-10">
          <div className="mx-auto flex max-w-6xl flex-col gap-10">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <Avatar className="size-11 border">
                  <AvatarImage src={customer.avatar} alt={customer.name} />
                  <AvatarFallback className="text-sm font-semibold">
                    {customer.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-semibold tracking-normal text-balance">
                      {customer.name}
                    </h1>
                    <StatusBadge status="Active" />
                  </div>
                  <div className="text-muted-foreground mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium">
                    <span>{customer.accountType}</span>
                    <span className="text-border hidden sm:inline">/</span>
                    <span className="inline-flex min-w-0 items-center gap-1.5">
                      <Mail className="size-3.5" aria-hidden="true" />
                      <span className="truncate">{customer.email}</span>
                    </span>
                    <span className="text-border hidden sm:inline">/</span>
                    <span className="tabular-nums">{customer.id}</span>
                  </div>
                </div>
              </div>
            </header>

            <Card className="bg-muted/35 dark:bg-card isolate rounded-lg border-0 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_0_0_1px_var(--border)]">
              <CardContent className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center">
                <div className="grid flex-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
                  {planSummary.map((item) => (
                    <div key={item.label}>
                      <p className="text-muted-foreground text-xs font-medium">
                        {item.label}
                      </p>
                      <p className="mt-2 text-base font-semibold tabular-nums">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
                <Button className="h-9 w-full lg:w-auto">Edit plan</Button>
              </CardContent>
            </Card>

            <section className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="pb-4">
                  <h2 className="text-lg font-semibold tracking-normal text-balance">
                    Payment methods
                  </h2>
                  <p className="text-muted-foreground mt-1.5 text-sm font-medium">
                    Your bills will be sent from the default card shown below.{" "}
                    <span className="text-foreground font-semibold">
                      Learn more.
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button className="h-9" variant="outline">
                    Add new card
                  </Button>
                </div>
              </div>

              <Card className="isolate overflow-hidden rounded-lg border-0 shadow-[0_0_0_1px_var(--border),0_8px_24px_rgba(0,0,0,0.04)]">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="px-5">
                        <SortLabel>Payment method</SortLabel>
                      </TableHead>
                      <TableHead>
                        <SortLabel>Ending</SortLabel>
                      </TableHead>
                      <TableHead>
                        <SortLabel>Role</SortLabel>
                      </TableHead>
                      <TableHead>
                        <SortLabel>Date expired</SortLabel>
                      </TableHead>
                      <TableHead>
                        <SortLabel>Status</SortLabel>
                      </TableHead>
                      <TableHead className="w-16" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentMethods.map((method) => (
                      <TableRow
                        key={method.id}
                        className="hover:bg-transparent"
                      >
                        <TableCell className="px-4 py-4">
                          <div className="flex items-center gap-4">
                            <PaymentMethodMark label={method.provider} />
                            <span className="font-medium">{method.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground font-medium tabular-nums">
                          {method.ending}
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            status={method.role}
                            variant={
                              method.role === "Default" ? "success" : "muted"
                            }
                          />
                        </TableCell>
                        <TableCell className="text-muted-foreground font-medium tabular-nums">
                          {method.expires}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={method.status} />
                        </TableCell>
                        <TableCell>
                          <Button
                            aria-label={`Manage ${method.name}`}
                            className="size-8"
                            size="icon"
                            variant="outline"
                          >
                            <Settings aria-hidden="true" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </section>

            <section className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <div className="pb-4">
                  <h2 className="text-lg font-semibold tracking-normal text-balance">
                    Invoices
                  </h2>
                  <p className="text-muted-foreground mt-1.5 text-sm font-medium">
                    Invoices are generated every 30 days and sent to your
                    default payment method.{" "}
                    <span className="text-foreground font-semibold">
                      Learn more.
                    </span>
                  </p>
                </div>
                <div className="flex w-full items-center gap-2">
                  <div className="relative min-w-0 flex-1">
                    <Search
                      className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
                      aria-hidden="true"
                    />
                    <Input
                      className="border-border bg-muted/35 h-9 w-full pl-9 text-sm font-medium shadow-none"
                      placeholder="Search invoices"
                      type="search"
                    />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger
                      className="border-border bg-muted/35 h-9 w-40 shrink-0 text-sm font-medium shadow-none"
                      aria-label="Filter invoices by status"
                    >
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Card className="isolate overflow-hidden rounded-lg border-0 shadow-[0_0_0_1px_var(--border),0_8px_24px_rgba(0,0,0,0.04)]">
                <div className="overflow-x-auto">
                  <div className="min-w-[820px]">
                    <div className="text-muted-foreground grid min-h-10 grid-cols-[minmax(150px,1.2fr)_minmax(150px,1fr)_110px_minmax(150px,1fr)_96px_32px] items-center gap-4 border-b px-4 text-sm font-medium">
                      <SortLabel>Invoice ID</SortLabel>
                      <SortLabel>Date sent</SortLabel>
                      <SortLabel>Amount</SortLabel>
                      <SortLabel>Plan</SortLabel>
                      <SortLabel>Status</SortLabel>
                      <span className="sr-only">Expand</span>
                    </div>
                    <Accordion type="single" collapsible>
                      {invoices.map((invoice) => (
                        <AccordionItem
                          key={invoice.id}
                          value={invoice.id}
                          className="border-border last:border-b-0"
                        >
                          <AccordionTrigger className="min-h-14 px-4 py-0 text-sm hover:no-underline active:scale-[0.995]">
                            <div className="grid flex-1 grid-cols-[minmax(150px,1.2fr)_minmax(150px,1fr)_110px_minmax(150px,1fr)_96px] items-center gap-4 pr-4 text-left">
                              <span className="text-muted-foreground font-medium tabular-nums">
                                {invoice.id}
                              </span>
                              <span className="text-muted-foreground font-medium tabular-nums">
                                {invoice.sent}
                              </span>
                              <span className="font-semibold tabular-nums">
                                {invoice.amount}
                              </span>
                              <span className="font-medium">
                                {invoice.plan}
                              </span>
                              <StatusBadge
                                status={invoice.status}
                                variant={
                                  invoice.status === "Paid"
                                    ? "success"
                                    : "danger"
                                }
                              />
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pt-1 pb-5">
                            <div className="flex flex-col gap-3">
                              <div className="bg-muted/35 dark:bg-card rounded-xl border px-4 py-3 text-sm shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                                {[
                                  ["Billing period", invoice.billingPeriod],
                                  ["Payment method", invoice.method],
                                  ["Customer", "Northstar Supply Co."],
                                ].map(([label, value], index) => (
                                  <div
                                    className={cn(
                                      "flex items-center justify-between gap-6 py-3 first:pt-0 last:pb-0",
                                      index > 0 && "border-t border-dashed",
                                    )}
                                    key={label}
                                  >
                                    <span className="text-muted-foreground font-medium">
                                      {label}
                                    </span>
                                    <span className="text-right font-medium tabular-nums">
                                      {value}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              <Button
                                className="h-10 self-end rounded-full px-5"
                                variant="default"
                              >
                                Download
                                <Download data-icon="inline-end" />
                              </Button>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </div>
              </Card>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
