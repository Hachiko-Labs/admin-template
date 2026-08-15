"use client";

import {
  BadgeCheck,
  CalendarClock,
  CreditCard,
  Download,
  Ellipsis,
  FileText,
  Landmark,
  Mail,
  Pencil,
  ReceiptText,
  UserRound,
} from "lucide-react";
import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const customer = {
  name: "Northstar Supply Co.",
  email: "billing@northstarsupply.com",
  id: "cus_9Kx41L",
  accountType: "Business account",
  avatar: "/avatars/avatar-1.png",
  initials: "NS",
  owner: "Priya Menon",
  phone: "+1 (312) 847-1928",
  location: "Chicago, IL",
  taxId: "US 84-3927710",
};

const subscriptionInvoiceGroups = [
  {
    id: "SUB-1042",
    name: "Monthly retainer",
    status: "Active",
    cadence: "Monthly",
    amount: "$2,400.00",
    renews: "Renews Jul 06",
    method: "ACH ending 7781",
    invoices: [
      {
        id: "INV-20486",
        description: "June retainer",
        status: "Open",
        amount: "$18,420.00",
        due: "Jul 19, 2026",
        method: "Visa ending 4242",
      },
      {
        id: "INV-20041",
        description: "May retainer",
        status: "Paid",
        amount: "$24,000.00",
        due: "Jun 19, 2026",
        method: "ACH ending 7781",
      },
      {
        id: "INV-19890",
        description: "April retainer",
        status: "Paid",
        amount: "$7,600.00",
        due: "May 19, 2026",
        method: "Mastercard ending 1881",
      },
    ],
  },
  {
    id: "SUB-1038",
    name: "Product design sprint",
    status: "Active",
    cadence: "Monthly",
    amount: "$480.00",
    renews: "Renews Jul 12",
    method: "Visa ending 4242",
    invoices: [
      {
        id: "INV-20342",
        description: "Sprint invoice",
        status: "Open",
        amount: "$12,900.00",
        due: "Jul 12, 2026",
        method: "ACH ending 7781",
      },
      {
        id: "INV-20198",
        description: "Sprint overage",
        status: "Overdue",
        amount: "$9,480.00",
        due: "Jun 28, 2026",
        method: "Visa ending 4242",
      },
    ],
  },
  {
    id: "SUB-0974",
    name: "Brand identity system",
    status: "Active",
    cadence: "Monthly",
    amount: "$190.00",
    renews: "Renews Jul 18",
    method: "Mastercard ending 1881",
    invoices: [
      {
        id: "INV-19972",
        description: "Identity system payment",
        status: "Paid",
        amount: "$190.00",
        due: "Jun 18, 2026",
        method: "Mastercard ending 1881",
      },
      {
        id: "INV-19726",
        description: "Identity system deposit",
        status: "Paid",
        amount: "$190.00",
        due: "May 18, 2026",
        method: "Mastercard ending 1881",
      },
    ],
  },
];

type RailSection = {
  title: string;
  rows: Array<{
    label: string;
    value: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  }>;
};

const railSections: RailSection[] = [
  {
    title: "Customer profile",
    rows: [
      { label: "Identifier", icon: ReceiptText, value: customer.id },
      { label: "Status", icon: BadgeCheck, value: "Active customer" },
      { label: "Risk", icon: CalendarClock, value: "Clear" },
      { label: "Owner", icon: UserRound, value: customer.owner },
      { label: "Created", icon: CalendarClock, value: "Jun 02, 2026" },
    ],
  },
  {
    title: "Payment methods",
    rows: [
      { label: "Default", icon: CreditCard, value: "Visa ending 4242" },
      { label: "Backup", icon: Landmark, value: "ACH ending 7781" },
      { label: "Review", icon: CreditCard, value: "Mastercard ending 1881" },
    ],
  },
  {
    title: "Billing contacts",
    rows: [
      { label: "Finance", icon: Mail, value: customer.email },
      { label: "Reminders", icon: UserRound, value: customer.phone },
    ],
  },
  {
    title: "Company",
    rows: [
      { label: "Name", icon: Landmark, value: customer.name },
      { label: "Location", icon: CalendarClock, value: customer.location },
      { label: "Tax ID", icon: ReceiptText, value: customer.taxId },
    ],
  },
];

function StatusBadge({ status }: { status: string }) {
  const className =
    status === "Open"
      ? "border-teal-600/20 bg-teal-50 text-teal-800 dark:border-teal-400/20 dark:bg-teal-900/30 dark:text-teal-300"
      : status === "Overdue"
        ? "border-rose-600/20 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-900/30 dark:text-rose-300"
        : status === "Active"
          ? "border-emerald-600/20 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-900/30 dark:text-emerald-300"
          : "border-sky-600/20 bg-sky-50 text-sky-700 dark:border-sky-400/20 dark:bg-sky-900/30 dark:text-sky-300";

  return (
    <Badge
      variant="outline"
      className={cn("rounded-md border shadow-none", className)}
    >
      {status}
    </Badge>
  );
}

function DetailRailSection({ title, rows }: RailSection) {
  return (
    <section className="flex flex-col gap-5">
      <h3 className="text-[14px] font-semibold tracking-normal">{title}</h3>
      <dl className="flex flex-col gap-3.5">
        {rows.map((row) => {
          const Icon = row.icon;

          return (
            <div
              key={`${title}-${row.label}`}
              className="grid grid-cols-[8rem_minmax(0,1fr)] items-center gap-4 text-[13px] leading-6"
            >
              <dt className="text-muted-foreground font-medium">{row.label}</dt>
              <dd className="text-foreground/90 flex min-w-0 items-center gap-3 font-medium">
                <Icon className="text-muted-foreground size-4 shrink-0" />
                <span className="truncate">{row.value}</span>
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}

function SubscriptionInvoiceTable({
  subscription,
  showDivider,
}: {
  subscription: (typeof subscriptionInvoiceGroups)[number];
  showDivider?: boolean;
}) {
  return (
    <section className="flex flex-col gap-4">
      {showDivider ? <Separator className="mt-2 mb-5" /> : null}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h2 className="truncate text-base font-semibold tracking-tight">
              {subscription.name}
            </h2>
            <StatusBadge status={subscription.status} />
          </div>
          <p className="text-muted-foreground mt-1 truncate text-sm">
            {subscription.cadence} · {subscription.amount}
          </p>
        </div>
        <span className="text-muted-foreground shrink-0 text-sm">
          {subscription.renews}
        </span>
      </div>

      <div className="overflow-hidden rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-[150px] px-4">Invoice</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Due</TableHead>
                <TableHead className="w-10">
                  <span className="sr-only">Download</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscription.invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <FileText className="text-muted-foreground size-4 shrink-0" />
                      <span className="font-medium tabular-nums">
                        {invoice.id}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="py-3">
                    <StatusBadge status={invoice.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground py-3">
                    {invoice.method}
                  </TableCell>
                  <TableCell className="py-3 text-right font-medium tabular-nums">
                    {invoice.amount}
                  </TableCell>
                  <TableCell className="text-muted-foreground py-3 text-right">
                    {invoice.due}
                  </TableCell>
                  <TableCell className="py-3 pr-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-md"
                    >
                      <Download />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}

export function PaymentProcessorCustomerDetail2() {
  return (
    <main className="bg-background text-foreground flex min-h-0 flex-1 overflow-hidden">
      <div className="min-h-0 w-full flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-7xl flex-col px-6 py-7 md:px-8">
          <section className="flex flex-col gap-6 border-b pb-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <Avatar className="size-12 border">
                  <AvatarImage src={customer.avatar} alt={customer.name} />
                  <AvatarFallback className="font-semibold">
                    {customer.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <h1 className="truncate text-2xl font-semibold tracking-tight">
                      {customer.name}
                    </h1>
                    <StatusBadge status={"Active"} />
                  </div>
                  <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-2 text-sm">
                    <span>3 active subscriptions</span>
                    <span>·</span>
                    <span>$30.8K open balance</span>
                    <span>·</span>
                    <span>Next renewal Jul 06</span>
                    <span>·</span>
                    <span>Risk clear</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" className="h-8 rounded-md px-3">
                  <Pencil />
                  Edit
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8 rounded-md"
                    >
                      <Ellipsis />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem>Send statement</DropdownMenuItem>
                    <DropdownMenuItem>Export customer</DropdownMenuItem>
                    <DropdownMenuItem>Pause billing</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </section>

          <div className="grid gap-10 pt-7 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start 2xl:grid-cols-[minmax(0,1fr)_360px]">
            <section className="flex min-w-0 flex-col gap-9">
              {subscriptionInvoiceGroups.map((subscription, index) => (
                <SubscriptionInvoiceTable
                  key={subscription.id}
                  subscription={subscription}
                  showDivider={index > 0}
                />
              ))}
            </section>

            <aside className="hidden min-h-[calc(100vh-8rem)] flex-col gap-7 xl:flex">
              <div className="flex flex-col gap-7">
                {railSections.map((section, index) => (
                  <React.Fragment key={section.title}>
                    <DetailRailSection
                      title={section.title}
                      rows={section.rows}
                    />
                    {index < railSections.length - 1 ? <Separator /> : null}
                  </React.Fragment>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
