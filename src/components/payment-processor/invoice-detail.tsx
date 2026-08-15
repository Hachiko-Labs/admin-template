"use client";

import {
  Check,
  CheckCircle2,
  Download,
  EllipsisVertical,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
} from "lucide-react";

import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const invoice = {
  subTotal: "$1,980.00",
  tax: "$198.00",
  total: "$2,178.00",
  items: [
    {
      id: 1,
      title: "Elite lifetime workspace",
      description: "Lifetime access to Shadcnblocks pro blocks and components.",
      hours: "1.0",
      rate: "$399.00",
      price: "$399.00",
    },
    {
      id: 2,
      title: "Template implementation pack",
      description:
        "Production-ready Next.js and Astro templates for launch pages.",
      hours: "9.0",
      rate: "$79.00",
      price: "$711.00",
    },
    {
      id: 3,
      title: "Admin kit integration",
      description:
        "Dashboard layouts, application shells, tables, and chart blocks.",
      hours: "1.0",
      rate: "$540.00",
      price: "$540.00",
    },
    {
      id: 4,
      title: "Figma kit handoff",
      description:
        "Design-system assets and block references for product teams.",
      hours: "1.0",
      rate: "$330.00",
      price: "$330.00",
    },
  ],
};

type ActivityBase = {
  id: number;
  action: string;
  date: string;
  dateTime: string;
  detail: string;
  time: string;
};

type UserActivity = ActivityBase & {
  kind: "user";
  person: {
    name: string;
    initials: string;
    avatar: string;
  };
};

type SystemActivity = ActivityBase & {
  kind: "system";
};

type PaymentActivity = ActivityBase & {
  kind: "payment";
};

type ActivityItem = UserActivity | SystemActivity | PaymentActivity;

const activity: ActivityItem[] = [
  {
    id: 1,
    kind: "user",
    action: "created invoice draft",
    detail: "Invoice #00011 opened for Northstar Studio.",
    time: "10:32",
    person: {
      name: "Maya Patel",
      initials: "MP",
      avatar: "/avatars/avatar-1.png",
    },
    date: "7d ago",
    dateTime: "2023-01-23T10:32",
  },
  {
    id: 2,
    kind: "user",
    action: "added purchase order",
    detail: "Purchase order NS-4826 attached to the invoice.",
    time: "11:03",
    person: {
      name: "Rohan Mehta",
      initials: "RM",
      avatar: "/avatars/avatar-4.png",
    },
    date: "6d ago",
    dateTime: "2023-01-23T11:03",
  },
  {
    id: 3,
    kind: "system",
    action: "sent invoice email to the billing contact",
    detail: "Delivered to accounts@northstar.studio.",
    time: "11:24",
    date: "6d ago",
    dateTime: "2023-01-23T11:24",
  },
  {
    id: 4,
    kind: "user",
    action: "viewed hosted invoice",
    detail: "Hosted invoice opened from the secure payment link.",
    time: "15:56",
    person: {
      name: "Olivia Bennett",
      initials: "OB",
      avatar: "/avatars/avatar-5.png",
    },
    date: "3d ago",
    dateTime: "2023-01-23T15:56",
  },
  {
    id: 5,
    kind: "user",
    action: "downloaded receipt",
    detail: "Receipt PDF downloaded after settlement.",
    time: "09:12",
    person: {
      name: "Olivia Bennett",
      initials: "OB",
      avatar: "/avatars/avatar-5.png",
    },
    date: "2d ago",
    dateTime: "2023-01-24T09:12",
  },
  {
    id: 6,
    kind: "payment",
    action: "card payment settled",
    detail: "$2,178.00 captured via Mastercard 4242.",
    time: "09:20",
    date: "1d ago",
    dateTime: "2023-01-24T09:20",
  },
];

function InvoiceHero() {
  return (
    <header className="border-border bg-background border-b">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
          <nav className="text-muted-foreground flex items-center gap-x-2 text-sm/6">
            <a className="hover:text-foreground/80 font-medium" href="#">
              Invoices
            </a>
            <span aria-hidden="true">/</span>
            <span className="text-foreground/80 font-medium">#00011</span>
          </nav>

          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
              <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
                Invoice #00011
              </h1>
              <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700 ring-1 ring-green-600/15 ring-inset dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20">
                Paid
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
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
                    id="invoice-actions-trigger"
                    className="h-9 w-9 rounded-md"
                    size="icon"
                    variant="outline"
                  >
                    <span className="sr-only">More actions</span>
                    <EllipsisVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                  <DropdownMenuItem>Copy URL</DropdownMenuItem>
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button className="h-9 rounded-md">
                <Check className="size-4" />
                Mark as Paid
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function InvoiceSummary() {
  return (
    <div className="lg:col-start-3 lg:row-end-1">
      <div className="bg-card text-card-foreground ring-border overflow-hidden rounded-lg shadow-sm ring-1">
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-foreground text-sm/6 font-semibold">
                Settlement
              </h2>
              <p className="text-muted-foreground mt-1 text-xs/5">
                Paid in full through card settlement.
              </p>
            </div>
            <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-600/15 ring-inset dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20">
              Paid
            </span>
          </div>

          <dl className="mt-6 space-y-3 text-sm/6">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="text-foreground font-medium">
                {invoice.subTotal}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">VAT (10%)</dt>
              <dd className="text-foreground font-medium">{invoice.tax}</dd>
            </div>
            <div className="border-border flex items-center justify-between gap-4 border-t pt-4">
              <dt className="text-foreground font-semibold">Total</dt>
              <dd className="text-foreground text-xl font-semibold">
                {invoice.total}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Amount paid</dt>
              <dd className="text-foreground font-medium">{invoice.total}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-green-50/70 px-6 py-4 dark:bg-emerald-500/10">
          <div className="flex items-center justify-between gap-4">
            <span className="text-foreground text-sm font-semibold">
              Amount due
            </span>
            <span className="text-lg font-semibold text-green-700 dark:text-emerald-300">
              $0.00
            </span>
          </div>
        </div>

        <div className="border-border border-t p-6">
          <h3 className="text-foreground text-sm/6 font-semibold">
            Payment details
          </h3>
          <dl className="mt-4 space-y-3 text-sm/6">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Method</dt>
              <dd className="text-foreground flex items-center gap-2 font-medium">
                <span className="relative inline-flex h-4 w-7">
                  <span className="absolute top-0 left-0 size-4 rounded-full bg-red-500" />
                  <span className="absolute top-0 right-0 size-4 rounded-full bg-amber-400 mix-blend-multiply dark:mix-blend-normal" />
                </span>
                Mastercard 4242
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Paid on</dt>
              <dd className="text-foreground font-medium">Jan 23, 2023</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Transaction ID</dt>
              <dd className="text-foreground font-mono text-xs font-semibold">
                pay_0Nc5kjuZkSNfHONs
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Invoice ID</dt>
              <dd className="text-foreground font-mono text-xs font-semibold">
                inv_0Nc5kjurtpiq4Ak7
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Currency</dt>
              <dd className="text-foreground font-semibold">USD</dd>
            </div>
          </dl>
        </div>

        <div className="border-border border-t p-6">
          <Button
            asChild
            className="group shadow-primary/10 h-10 w-full rounded-md font-semibold shadow-sm"
          >
            <a href="#">
              <span className="bg-background/15 group-hover:bg-background/20 grid size-5 place-items-center rounded transition">
                <Download className="size-3.5" />
              </span>
              Download receipt
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

function InvoiceDocument() {
  return (
    <div className="bg-card text-card-foreground ring-border relative -mx-4 overflow-hidden px-3 py-5 shadow-sm ring-1 sm:mx-0 sm:rounded-lg sm:px-5 sm:pb-8 lg:col-span-2 lg:row-span-2 lg:row-end-2 xl:px-8 xl:pt-8 xl:pb-10">
      <div className="bg-foreground -mx-3 -mt-5 h-1.5 sm:-mx-5 xl:-mx-8 xl:-mt-8" />

      <div className="mt-3 pr-16 sm:mt-5 xl:mt-8">
        <div>
          <h2 className="text-foreground text-lg font-semibold tracking-tight">
            Shadcnblocks.com
          </h2>
          <div className="text-muted-foreground mt-3 space-y-1.5 text-xs/5">
            <p className="flex items-center gap-2">
              <MapPin className="text-muted-foreground/70 size-3.5" />
              Level 12, 45 Clarence Street, Sydney NSW 2000
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              <p className="flex items-center gap-2">
                <Mail className="text-muted-foreground/70 size-3.5" />
                billing@shadcnblocks.com
              </p>
              <p className="flex items-center gap-2">
                <Phone className="text-muted-foreground/70 size-3.5" />
                +61 2 7908 4420
              </p>
            </div>
            <p>
              <span className="text-foreground font-semibold">ABN:</span> 74 612
              893 204{" "}
              <span className="text-foreground ml-4 font-semibold">VAT:</span>{" "}
              AU 746 128 932
            </p>
          </div>
        </div>

        <Logo
          alt="Shadcnblocks"
          className="absolute top-14 right-5 hidden size-12 object-contain sm:block xl:top-16 xl:right-8 dark:hidden"
          height={48}
          src="/logo-black.svg"
          width={48}
        />
        <Logo
          alt="Shadcnblocks"
          className="absolute top-14 right-5 hidden size-12 object-contain xl:top-16 xl:right-8 dark:sm:block"
          height={48}
          src="/logo-white.svg"
          width={48}
        />
      </div>

      <div className="mt-7 grid grid-cols-1 gap-7 lg:grid-cols-2">
        <section className="border-border border-t pt-5">
          <div className="bg-muted text-foreground inline-flex px-2.5 py-1 text-xs font-semibold">
            Billed to
          </div>
          <div className="mt-5 text-xs/5">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="text-foreground text-base font-semibold">
                Olivia Bennett
              </h3>
              {/* <p className="font-medium text-foreground">Northstar Studio</p> */}
            </div>
            <p className="text-muted-foreground mt-2 flex items-center gap-2">
              <MapPin className="text-muted-foreground/70 size-3.5" />
              18 Collins Street, Melbourne VIC 3000
            </p>
            <div className="text-muted-foreground mt-2 flex flex-wrap gap-x-5 gap-y-1.5">
              <p className="flex items-center gap-2">
                <Mail className="text-muted-foreground/70 size-3.5" />
                accounts@northstar.studio
              </p>
            </div>
          </div>
        </section>

        <section className="border-border border-t pt-5">
          <div className="mt-5 flex items-start justify-between gap-6">
            <div>
              <p className="text-foreground text-lg font-semibold tracking-tight">
                INV-00011
              </p>
            </div>
            <p className="text-foreground text-2xl font-semibold tracking-tight">
              {invoice.total}
            </p>
          </div>
          <dl className="mt-8 grid grid-cols-1 gap-5 text-xs/5 sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">Invoice date</dt>
              <dd className="text-foreground mt-1 font-medium">
                <time dateTime="2023-01-23">Jan 23, 2023</time>
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Due date</dt>
              <dd className="text-foreground mt-1 font-medium">
                <time dateTime="2023-01-31">Jan 31, 2023</time>
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">PO number</dt>
              <dd className="text-foreground mt-1 font-medium">NS-4826</dd>
            </div>
          </dl>
        </section>
      </div>

      <table className="mt-16 w-full text-left text-sm/6 whitespace-nowrap">
        <colgroup>
          <col className="w-full" />
          <col />
          <col />
          <col />
        </colgroup>
        <thead className="border-border text-foreground border-b">
          <tr>
            <th className="px-0 py-3 font-semibold" scope="col">
              Description
            </th>
            <th
              className="hidden py-3 pr-0 pl-8 text-right font-semibold sm:table-cell"
              scope="col"
            >
              Qty
            </th>
            <th
              className="hidden py-3 pr-0 pl-8 text-right font-semibold sm:table-cell"
              scope="col"
            >
              Rate
            </th>
            <th className="py-3 pr-0 pl-8 text-right font-semibold" scope="col">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item) => (
            <tr className="border-border/60 border-b" key={item.id}>
              <td className="max-w-0 px-0 py-5 align-top">
                <div className="text-foreground truncate font-medium">
                  {item.title}
                </div>
                <div className="text-muted-foreground truncate">
                  {item.description}
                </div>
              </td>
              <td className="text-foreground/80 hidden py-5 pr-0 pl-8 text-right align-top tabular-nums sm:table-cell">
                {item.hours}
              </td>
              <td className="text-foreground/80 hidden py-5 pr-0 pl-8 text-right align-top tabular-nums sm:table-cell">
                {item.rate}
              </td>
              <td className="text-foreground/80 py-5 pr-0 pl-8 text-right align-top tabular-nums">
                {item.price}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th
              className="text-foreground/80 px-0 pt-6 pb-0 font-normal sm:hidden"
              scope="row"
            >
              Subtotal
            </th>
            <th
              className="text-foreground/80 hidden px-0 pt-6 pb-0 text-right font-normal sm:table-cell"
              colSpan={3}
              scope="row"
            >
              Subtotal
            </th>
            <td className="text-foreground pt-6 pr-0 pb-0 pl-8 text-right tabular-nums">
              {invoice.subTotal}
            </td>
          </tr>
          <tr>
            <th
              className="text-foreground/80 pt-4 font-normal sm:hidden"
              scope="row"
            >
              Tax
            </th>
            <th
              className="text-foreground/80 hidden pt-4 text-right font-normal sm:table-cell"
              colSpan={3}
              scope="row"
            >
              Tax
            </th>
            <td className="text-foreground pt-4 pr-0 pb-0 pl-8 text-right tabular-nums">
              {invoice.tax}
            </td>
          </tr>
          <tr>
            <th
              className="text-foreground pt-4 font-semibold sm:hidden"
              scope="row"
            >
              Total
            </th>
            <th
              className="text-foreground hidden pt-4 text-right font-semibold sm:table-cell"
              colSpan={3}
              scope="row"
            >
              Total
            </th>
            <td className="text-foreground pt-4 pr-0 pb-0 pl-8 text-right font-semibold tabular-nums">
              {invoice.total}
            </td>
          </tr>
        </tfoot>
      </table>

      <p className="text-muted-foreground mt-24 text-xs/5">
        For billing questions, license transfers, or receipt corrections,
        contact billing@shadcnblocks.com.
      </p>

      <div className="border-border text-muted-foreground mt-6 border-t pt-6 text-xs/5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Logo
              alt="Shadcnblocks"
              className="size-5 object-contain"
              height={20}
              width={20}
            />
            <span className="text-foreground font-semibold">
              Shadcnblocks.com
            </span>
          </div>
          <p>© 2026 Shadcnblocks.com. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

function ActivityFeed() {
  return (
    <div className="lg:col-start-3">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-foreground text-sm/6 font-semibold tracking-tight">
          Activity
        </h2>
        <span className="text-muted-foreground text-xs/5 font-medium">
          Invoice summary
        </span>
      </div>
      <ul className="mt-5 space-y-0" role="list">
        {activity.map((activityItem, activityItemIdx) => (
          <li
            className="grid grid-cols-[3.25rem_1.75rem_minmax(0,1fr)] gap-x-3"
            key={activityItem.id}
          >
            <time
              className="text-muted-foreground pt-0.5 text-xs/5 font-medium"
              dateTime={activityItem.dateTime}
            >
              {activityItem.date}
            </time>

            <div className="relative flex justify-center">
              {activityItemIdx < activity.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="bg-border absolute top-7 bottom-0 w-px"
                />
              ) : null}
              <div
                className={cn(
                  "bg-background relative z-10 grid size-7 place-items-center rounded-full",
                  activityItem.kind === "payment"
                    ? "text-foreground ring-foreground ring-2"
                    : activityItem.kind === "system"
                      ? "text-muted-foreground ring-border ring-1"
                      : "",
                )}
              >
                {activityItem.kind === "payment" ? (
                  <CheckCircle2 className="size-4.5" />
                ) : activityItem.kind === "system" ? (
                  <ShieldCheck className="size-3.5" />
                ) : (
                  <Avatar className="bg-muted size-7 border">
                    <AvatarImage
                      alt={activityItem.person.name}
                      src={activityItem.person.avatar}
                    />
                    <AvatarFallback className="text-[10px] font-semibold">
                      {activityItem.person.initials}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>

            <div className="min-w-0 pb-5">
              <p className="text-foreground min-w-0 text-xs/5">
                {activityItem.kind === "user" ? (
                  <>
                    <span className="font-semibold">
                      {activityItem.person.name}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      {activityItem.action}.
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">
                    {activityItem.action}.
                  </span>
                )}
              </p>
              <p className="text-muted-foreground mt-1 truncate text-xs/5">
                {activityItem.detail}
              </p>
              {activityItem.kind === "payment" ? (
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700 ring-1 ring-green-600/15 ring-inset dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20">
                  <CheckCircle2 className="size-3.5" />
                  Paid in full
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PaymentProcessorInvoiceDetail({
  className,
}: {
  className?: string;
}) {
  return (
    <main
      className={cn(
        "bg-background text-foreground min-h-0 flex-1 overflow-y-auto",
        className,
      )}
    >
      <div className="relative min-h-full">
        <main>
          <InvoiceHero />
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-2xl grid-cols-1 grid-rows-1 items-start gap-x-8 gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
              <InvoiceSummary />
              <InvoiceDocument />
              <ActivityFeed />
            </div>
          </div>
        </main>
      </div>
    </main>
  );
}
