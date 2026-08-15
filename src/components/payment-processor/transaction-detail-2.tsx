"use client";

import "slot-text/style.css";

import {
  ArrowLeft,
  Bookmark,
  CalendarDays,
  Check,
  ChevronDown,
  Copy,
  FileJson2,
  Globe,
  HelpCircle,
  Landmark,
  MapPin,
  Monitor,
  Phone,
  Search,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SlotText } from "slot-text/react";

import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const payment = {
  id: "7842196085530904",
  parentId: "PNT-445918730162",
  amount: "$149.00",
  time: "14:18",
  date: "18 Sep 2026",
  type: "Refund",
  method: "Credit Card",
  status: "Approved",
  fee: "$0.00",
  networkId: "NID-7C92M4K",
  card: "Visa ending in 4242",
  source: "SDK",
};

const transactionFacts = [
  { label: "Type", value: payment.type, badge: "bg-amber-100 text-amber-800" },
  {
    label: "Method",
    value: payment.method,
    badge: "bg-muted text-foreground",
  },
  {
    label: "Status",
    value: payment.status,
    badge: "bg-emerald-100 text-emerald-800",
  },
  { label: "Refund amount", value: payment.amount },
  { label: "Convenience fee", value: payment.fee },
  { label: "TXID", value: payment.id },
  { label: "Network ID", value: payment.networkId },
  { label: "Card", value: payment.card },
  {
    label: "Source",
    value: payment.source,
    badge: "bg-muted text-foreground",
  },
];

const parties = [
  {
    title: "From",
    name: "Shadcnblocks.com",
    email: "billing@shadcnblocks.com",
    initials: "SB",
    avatar: null,
    address: "Level 12, 45 Clarence Street, Sydney NSW 2000",
    phone: "+61 2 7908 4420",
    ip: "192.0.2.44",
    lastTransaction: "Sep 17, 2026",
    bankLabel: "Payment partner",
    bank: "Stripe",
    extraLabel: "Website",
    extra: "shadcnblocks.com",
    verifiedLabel: "Product",
    verified: "Pro lifetime access",
  },
  {
    title: "To",
    name: "Olivia Bennett",
    email: "olivia.bennett@icloud.com",
    initials: "OB",
    avatar: "/avatars/avatar-2.png",
    address: "18 Collins Street, Melbourne VIC 3000",
    phone: "+61 3 9010 4382",
    ip: "198.51.100.42",
    lastTransaction: "Sep 14, 2026",
    bankLabel: "Card issuer",
    bank: "Visa ending in 4242",
    extraLabel: "KYC status",
    extra: "Confirmed",
    verifiedLabel: "Refund policy",
    verified: "Eligible",
  },
];

const tabs = ["Emails", "Notes", "Timeline", "Developers", "Postback", "Rules"];
const developerTabs = [
  "Transaction Details",
  "Authorization",
  "Gateway Process",
  "Refund Process",
  "Postback Process",
];

const developerPayload = `{
  "txn": "7842196085530904",
  "parent_txn": "PNT-445918730162",
  "kind": "refund",
  "status": "approved",
  "amount": {
    "value": 149.00,
    "currency": "USD"
  },
  "processor": {
    "gateway": "stripe-us",
    "trace_id": "gw_9f42c18a6d",
    "latency_ms": 384
  },
  "recipient": {
    "id": "cus_6GV4PZ0",
    "risk_score": 18,
    "kyc": "confirmed"
  },
  "webhooks": [
    "refund.created",
    "refund.approved",
    "ledger.balance.updated"
  ]
}`;

function BadgeValue({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-5 items-center rounded-md px-1.5 text-xs font-semibold",
        className,
      )}
    >
      {children}
    </span>
  );
}

async function writeToClipboard(text: string) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function AnimatedCopyButton({
  className,
  text,
  variant = "ghost",
}: {
  className?: string;
  text: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  const copy = async () => {
    try {
      await writeToClipboard(text);
      setCopied(true);
    } catch {
      return;
    }

    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Button
      aria-label={copied ? "Copied to clipboard" : "Copy to clipboard"}
      className={cn("gap-1.5", className)}
      onClick={copy}
      type="button"
      variant={variant}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      <SlotText text={copied ? "Copied" : "Copy"} />
    </Button>
  );
}

function TransactionOverview() {
  return (
    <section className="bg-card overflow-hidden rounded-lg border shadow-sm">
      <div className="flex flex-col gap-3 border-b p-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="bg-primary text-primary-foreground grid size-11 shrink-0 place-items-center rounded-md">
            <Logo
              alt="Shadcnblocks"
              className="size-6 object-contain brightness-0 invert dark:invert-0"
              height={24}
              src="/logo-black.svg"
              width={24}
            />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-3xl font-semibold tracking-tight">
                {payment.amount}
              </p>
              <BadgeValue className="bg-muted text-foreground">
                {payment.method}
              </BadgeValue>
              <BadgeValue className="bg-emerald-100 text-emerald-800">
                {payment.status}
              </BadgeValue>
            </div>
            <p className="text-muted-foreground mt-1 text-xs font-medium">
              {payment.time} - {payment.date}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button className="size-8 rounded-md" size="icon" variant="outline">
            <Bookmark className="size-4" />
            <span className="sr-only">Bookmark transaction</span>
          </Button>
          <Button className="h-8 rounded-md px-3 text-xs" variant="outline">
            More Actions
            <ChevronDown className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid items-stretch gap-4 p-4 xl:grid-cols-[0.95fr_1fr_1fr]">
        <section className="flex h-full flex-col">
          <h2 className="text-muted-foreground mb-3 text-base font-semibold">
            Transaction details
          </h2>
          <dl className="bg-muted/60 flex flex-1 flex-col justify-center rounded-md p-3">
            {transactionFacts.map((fact) => (
              <div
                className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-2 py-1.5"
                key={fact.label}
              >
                <dt className="text-muted-foreground flex items-center gap-1 text-[13px]">
                  {fact.label}
                  {["Method", "Network ID"].includes(fact.label) ? (
                    <HelpCircle className="size-3.5" />
                  ) : null}
                </dt>
                <dd
                  className="min-w-0 truncate text-[13px] font-semibold"
                  title={fact.value}
                >
                  {fact.badge ? (
                    <BadgeValue className={fact.badge}>{fact.value}</BadgeValue>
                  ) : (
                    fact.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {parties.map((party) => (
          <PartyCard key={party.title} party={party} />
        ))}
      </div>
    </section>
  );
}

function PartyCard({ party }: { party: (typeof parties)[number] }) {
  return (
    <section className="flex h-full flex-col">
      <h2 className="text-muted-foreground mb-3 text-base font-semibold">
        {party.title}
      </h2>
      <div className="flex flex-1 flex-col rounded-md border p-3">
        <div className="flex min-w-0 items-center gap-3 border-b pb-3">
          {party.title === "From" ? (
            <div className="bg-muted text-foreground grid size-10 shrink-0 place-items-center rounded-md border">
              <Logo className="size-5 object-contain" height={20} width={20} />
            </div>
          ) : (
            <Avatar className="size-10 shrink-0 rounded-md border">
              <AvatarImage
                alt={party.name}
                className="object-cover"
                src={party.avatar ?? undefined}
              />
              <AvatarFallback className="rounded-md text-xs font-bold">
                {party.initials}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold">{party.name}</p>
            <a
              className="text-foreground/80 hover:text-foreground block truncate text-[13px] font-medium underline-offset-4 transition-colors hover:underline"
              href={`mailto:${party.email}`}
            >
              {party.email}
            </a>
          </div>
        </div>

        <div className="bg-muted/60 my-3 space-y-2 rounded-md p-3 text-[13px]">
          <InfoLine icon={MapPin}>{party.address}</InfoLine>
          <InfoLine icon={Phone}>{party.phone}</InfoLine>
          <InfoLine icon={Monitor}>{party.ip}</InfoLine>
        </div>

        <dl className="mt-auto space-y-2.5 text-[13px]">
          <Row
            icon={CalendarDays}
            label="Last transaction"
            value={party.lastTransaction}
          />
          <Row icon={Landmark} label={party.bankLabel} value={party.bank} />
          <Row
            icon={party.extra.includes(".com") ? Globe : UserCheck}
            label={party.extraLabel}
            value={
              party.extra.includes(".com") ? (
                <a
                  className="text-foreground/80 hover:text-foreground inline-flex items-center gap-1 underline-offset-4 transition-colors hover:underline"
                  href={`https://${party.extra}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  {party.extra}
                </a>
              ) : (
                <BadgeValue className="bg-emerald-100 text-emerald-800">
                  {party.extra}
                </BadgeValue>
              )
            }
          />
          <Row
            icon={ShieldCheck}
            label={party.verifiedLabel}
            value={party.verified}
          />
        </dl>
      </div>
    </section>
  );
}

function InfoLine({
  children,
  icon: Icon,
}: {
  children: React.ReactNode;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}) {
  return (
    <p className="flex items-center gap-3 font-medium">
      <Icon className="text-muted-foreground size-4 shrink-0" />
      <span className="min-w-0 truncate">{children}</span>
    </p>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] items-center gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="flex min-w-0 items-center gap-2 font-semibold">
        {Icon ? (
          <span className="bg-muted text-muted-foreground grid size-5 shrink-0 place-items-center rounded-full">
            <Icon className="size-3.5" />
          </span>
        ) : null}
        <span className="min-w-0 truncate">{value}</span>
      </dd>
    </div>
  );
}

function DeveloperPanel() {
  return (
    <section className="bg-card overflow-hidden rounded-lg border shadow-sm">
      <div className="flex min-w-0 gap-6 overflow-x-auto border-b px-4">
        {tabs.map((tab) => (
          <button
            className={cn(
              "text-muted-foreground h-12 shrink-0 border-b-2 border-transparent text-[13px] font-semibold",
              tab === "Developers" && "text-foreground border-emerald-500",
            )}
            key={tab}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="p-4">
        <div className="overflow-hidden rounded-lg bg-zinc-950 text-zinc-100">
          <div className="border-b border-white/10 p-3">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-500" />
              <input
                className="h-9 w-full rounded-md border border-white/10 bg-zinc-900 pl-10 text-[13px] transition outline-none focus:border-emerald-500"
                placeholder="Search transaction payload"
                type="search"
              />
            </div>
            <div className="mt-4 flex min-w-0 gap-6 overflow-x-auto">
              {developerTabs.map((tab) => (
                <button
                  className={cn(
                    "h-9 shrink-0 border-b-2 border-transparent text-[13px] font-semibold text-zinc-500",
                    tab === "Transaction Details" &&
                      "border-emerald-400 text-emerald-400",
                  )}
                  key={tab}
                  type="button"
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_16rem]">
            <pre className="horizontal-scrollbar overflow-auto p-4 text-xs leading-6 text-zinc-300">
              <code>{developerPayload}</code>
            </pre>
            <aside className="border-t border-white/10 p-4 xl:border-t-0 xl:border-l">
              <div className="flex items-center gap-3">
                <FileJson2 className="size-5 text-emerald-400" />
                <h3 className="text-sm font-semibold">Payload checks</h3>
              </div>
              <div className="mt-4 space-y-2.5">
                {["Schema validated", "Postback signed", "Ledger synced"].map(
                  (item) => (
                    <div
                      className="flex items-center gap-2 text-[13px]"
                      key={item}
                    >
                      <span className="grid size-5 place-items-center rounded-full bg-emerald-500/15 text-emerald-300">
                        <Check className="size-3.5" />
                      </span>
                      {item}
                    </div>
                  ),
                )}
              </div>
              <AnimatedCopyButton
                className="mt-5 h-8 w-full rounded-md text-xs"
                text={developerPayload}
                variant="secondary"
              />
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PaymentProcessorTransactionDetail2({
  className,
}: {
  className?: string;
}) {
  return (
    <main
      className={cn(
        "bg-muted/30 text-foreground h-full min-h-0 flex-1 overflow-y-auto overscroll-contain",
        className,
      )}
    >
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex min-w-0 items-center gap-3">
          <Button
            className="bg-background size-9 rounded-md"
            size="icon"
            variant="outline"
          >
            <ArrowLeft className="size-4" />
            <span className="sr-only">Back</span>
          </Button>
          <div className="min-w-0">
            <p className="text-muted-foreground text-sm font-medium">
              Transactions
            </p>
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="truncate text-xl font-semibold tracking-tight">
                {payment.id}
              </h1>
              <AnimatedCopyButton
                className="text-muted-foreground h-7 shrink-0 rounded-md px-2 text-xs"
                text={payment.id}
              />
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <TransactionOverview />
          <DeveloperPanel />
        </div>
      </div>
    </main>
  );
}
