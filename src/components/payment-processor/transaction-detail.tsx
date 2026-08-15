"use client";

import {
  AlertTriangle,
  ArrowLeft,
  Banknote,
  CheckCircle2,
  Copy,
  Download,
  EllipsisVertical,
  FileText,
  Fingerprint,
  Mail,
  MessageSquareText,
  RefreshCcw,
  ShieldCheck,
  SquarePen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const transaction = {
  id: "txn_R8M42QH91L6C",
  paymentId: "pay_ONfo13LR30lnWj5e1r6z4",
  amount: "$8,120.50",
  net: "$7,936.87",
  fee: "$183.63",
  status: "Pending review",
  risk: "Manual verification required",
  customer: "Helio Supply",
  email: "billing@helio.supply",
  method: "ACH debit",
  processor: "Adyen",
  source: "Hosted checkout",
  currency: "USD",
  created: "May 29, 2026, 08:56 IST",
  settlement: "Expected Jun 02, 2026",
  account: "Operating balance",
  descriptor: "HELIO-SUPPLY-0429",
  statementId: "STMT-8462-HS",
  invoice: "INV-20486",
  route: "North America / ACH",
  location: "Austin, TX",
  ip: "198.51.100.42",
};

const transactionFields = [
  { label: "Transaction ID", value: transaction.id },
  { label: "Amount", value: transaction.amount },
  { label: "Customer", value: transaction.customer },
  { label: "Payment method", value: transaction.method },
  { label: "Processor", value: transaction.processor },
  { label: "Source", value: transaction.source },
  { label: "Currency", value: transaction.currency },
  { label: "Created", value: transaction.created },
  { label: "Settlement", value: transaction.settlement },
  { label: "Ledger account", value: transaction.account },
  { label: "Descriptor", value: transaction.descriptor },
  { label: "Statement ID", value: transaction.statementId },
];

const processorFields = [
  { label: "Merchant route", value: transaction.route },
  { label: "Invoice", value: transaction.invoice },
  { label: "Customer email", value: transaction.email },
  { label: "Capture mode", value: "Automatic after bank confirmation" },
  { label: "Verification", value: "Micro-deposit fallback enabled" },
  { label: "Location", value: transaction.location },
  { label: "IP address", value: transaction.ip },
  { label: "Webhook delivery", value: "2 delivered, 1 retry scheduled" },
];

const documents = [
  {
    name: "bank-authorization.pdf",
    meta: "Uploaded May 29, 2026 at 09:04",
  },
  {
    name: "risk-review-note.txt",
    meta: "Added by Priya Shah at 09:18",
  },
  {
    name: "invoice-20486.pdf",
    meta: "Generated from billing workspace",
  },
];

const history = [
  {
    date: "May 29",
    time: "09:22",
    tone: "warning",
    title: "Review window opened",
    detail:
      "ACH velocity threshold requested a second approval before capture.",
    actor: "Risk engine",
  },
  {
    date: "May 29",
    time: "09:18",
    tone: "neutral",
    title: "Internal note added",
    detail: "Finance confirmed the purchase order and matching invoice total.",
    actor: "Priya Shah",
  },
  {
    date: "May 29",
    time: "09:03",
    tone: "success",
    title: "Bank account verified",
    detail: "Account ownership passed through processor verification.",
    actor: "Adyen",
  },
  {
    date: "May 29",
    time: "08:56",
    tone: "neutral",
    title: "Transaction created",
    detail: "Hosted checkout submitted an ACH debit for Helio Supply.",
    actor: "Checkout",
  },
];

function StatusBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-md border border-amber-500/25 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
      <span className="size-2 rounded-full bg-amber-500" />
      {transaction.status}
    </span>
  );
}

function DetailSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="py-7 first:pt-0">
      <div className="mb-6 flex items-center gap-4">
        <h2 className="text-foreground shrink-0 text-xl font-semibold tracking-tight">
          {title}
        </h2>
        <div className="bg-border h-px min-w-8 flex-1" />
      </div>
      {children}
    </section>
  );
}

function FieldGrid({
  fields,
  columns = "lg:grid-cols-4",
}: {
  fields: { label: string; value: string }[];
  columns?: string;
}) {
  return (
    <dl
      className={cn("grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2", columns)}
    >
      {fields.map((field) => (
        <div key={field.label}>
          <dt className="text-muted-foreground text-[13px] leading-none font-medium">
            {field.label}
          </dt>
          <dd className="text-foreground mt-2 min-w-0 text-sm font-medium">
            {field.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function DocumentList() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {documents.map((document) => (
        <div
          className="border-border bg-background flex min-w-0 items-center gap-3 rounded-md border p-3"
          key={document.name}
        >
          <div className="bg-muted grid size-10 shrink-0 place-items-center rounded-md">
            <FileText className="text-muted-foreground size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{document.name}</p>
            <p className="text-muted-foreground truncate text-xs">
              {document.meta}
            </p>
          </div>
          <Button className="size-8 shrink-0" size="icon" variant="ghost">
            <EllipsisVertical className="size-4" />
            <span className="sr-only">Document actions</span>
          </Button>
        </div>
      ))}
    </div>
  );
}

function SummaryPanel() {
  return (
    <aside className="lg:sticky lg:top-6">
      <div className="border-border bg-card text-card-foreground overflow-hidden rounded-md border">
        <div className="p-6">
          <div>
            <div className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-300">
              <span className="size-2 rounded-full bg-amber-500" />
              {transaction.status}
            </div>
            <p className="mt-2 text-3xl font-semibold tracking-tight">
              {transaction.amount}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-md p-3">
              <p className="text-muted-foreground text-xs font-medium">
                Processor fee
              </p>
              <p className="mt-1 text-sm font-semibold">{transaction.fee}</p>
            </div>
            <div className="bg-muted/50 rounded-md p-3">
              <p className="text-muted-foreground text-xs font-medium">
                Net after fees
              </p>
              <p className="mt-1 text-sm font-semibold">{transaction.net}</p>
            </div>
          </div>

          <div className="border-border mt-6 border-t pt-5">
            <div className="flex items-start gap-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-md bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                <AlertTriangle className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{transaction.risk}</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Confirm authorization before release. Capture is paused until
                  the review outcome is logged.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-border grid grid-cols-2 border-t">
          <Button className="h-12 rounded-none" variant="ghost">
            <Copy className="size-4" />
            Copy ID
          </Button>
          <Button className="h-12 rounded-none border-l" variant="ghost">
            <Download className="size-4" />
            Receipt
          </Button>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-2">
        <Button className="h-10 flex-1 rounded-md" variant="outline">
          <Mail className="size-4" />
          Email customer
        </Button>
      </div>
    </aside>
  );
}

function HistoryTimeline() {
  return (
    <ol className="space-y-0">
      {history.map((item, index) => (
        <li
          className="grid grid-cols-[5rem_2rem_minmax(0,1fr)] gap-4"
          key={item.title}
        >
          <div className="pt-0.5 text-sm">
            <p className="font-medium">{item.date}</p>
            <p className="text-muted-foreground">{item.time}</p>
          </div>
          <div className="relative flex justify-center">
            {index < history.length - 1 ? (
              <span className="bg-border absolute top-7 bottom-0 w-px" />
            ) : null}
            <span
              className={cn(
                "bg-background relative z-10 mt-1 size-3 rounded-full border-2",
                item.tone === "warning" && "border-amber-500 bg-amber-500",
                item.tone === "success" && "border-emerald-500 bg-emerald-500",
                item.tone === "neutral" && "border-border",
              )}
            />
          </div>
          <div className="pb-7">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p className="text-sm font-semibold">{item.title}</p>
              <span className="text-muted-foreground text-sm">
                by {item.actor}
              </span>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">{item.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function PaymentProcessorTransactionDetail({
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
      <header className="border-border bg-muted/30 border-b">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Button className="mb-6 h-8 gap-2 px-0" variant="link">
            <ArrowLeft className="size-4" />
            Back to transactions
          </Button>

          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <StatusBadge />
                <span className="text-muted-foreground inline-flex items-center gap-1.5 text-sm font-medium">
                  <Fingerprint className="size-4" />
                  {transaction.paymentId}
                </span>
              </div>
              <div className="flex min-w-0 flex-wrap items-center gap-3">
                <h1 className="text-3xl font-semibold tracking-tight">
                  Transaction {transaction.id}
                </h1>
                <Button
                  className="size-9 rounded-md"
                  size="icon"
                  variant="outline"
                >
                  <SquarePen className="size-4" />
                  <span className="sr-only">Edit transaction</span>
                </Button>
              </div>
              <p className="text-muted-foreground mt-3 max-w-2xl text-sm">
                Review payment evidence, processor routing, and audit changes
                before releasing the capture hold.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Button className="h-9 rounded-md">
                <CheckCircle2 className="size-4" />
                Approve
              </Button>
              <Button className="h-9 rounded-md" variant="outline">
                <RefreshCcw className="size-4" />
                Refund
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="size-10 rounded-md"
                    size="icon"
                    variant="outline"
                  >
                    <EllipsisVertical className="size-4" />
                    <span className="sr-only">More actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Copy payment link</DropdownMenuItem>
                  <DropdownMenuItem>Export event log</DropdownMenuItem>
                  <DropdownMenuItem>Open processor record</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-10 sm:px-6 lg:px-8 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0">
          <div className="mb-4 rounded-sm border border-amber-500/25 bg-amber-50/80 p-4 text-amber-950 dark:bg-amber-500/10 dark:text-amber-100">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-300" />
              <p className="text-sm leading-6">
                This ACH debit is inside a manual review window because the
                customer exceeded the new-account velocity limit. Confirm the
                invoice, authorization file, and bank ownership before approval.
              </p>
            </div>
          </div>

          <DetailSection title="Transaction Details">
            <FieldGrid fields={transactionFields} />
            <div className="mt-8">
              <p className="text-muted-foreground mb-3 text-[13px] leading-none font-medium">
                Supporting documents
              </p>
              <DocumentList />
            </div>
          </DetailSection>

          <DetailSection title="Processor Context">
            <FieldGrid fields={processorFields} columns="xl:grid-cols-3" />
          </DetailSection>

          <DetailSection title="Operational Notes">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: ShieldCheck,
                  title: "Risk posture",
                  detail: "Low dispute history, elevated transaction size.",
                },
                {
                  icon: Banknote,
                  title: "Funds movement",
                  detail: "Debit is authorized but settlement has not started.",
                },
                {
                  icon: MessageSquareText,
                  title: "Customer thread",
                  detail: "Billing contact confirmed the invoice by email.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    className="border-border rounded-md border p-4"
                    key={item.title}
                  >
                    <Icon className="text-muted-foreground size-5" />
                    <h3 className="mt-4 text-sm font-semibold">{item.title}</h3>
                    <p className="text-muted-foreground mt-2 text-sm">
                      {item.detail}
                    </p>
                  </div>
                );
              })}
            </div>
          </DetailSection>

          <DetailSection title="History">
            <HistoryTimeline />
          </DetailSection>
        </div>

        <SummaryPanel />
      </div>
    </main>
  );
}
