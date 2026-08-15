"use client";

import {
  Banknote,
  Building2,
  CalendarDays,
  CircleCheck,
  CirclePlus,
  Copy,
  CreditCard,
  Ellipsis,
  FilePlus2,
  FileText,
  Globe,
  Landmark,
  type LucideIcon,
  Mail,
  MapPin,
  Pencil,
  Receipt,
  Send,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  UserRound,
  Users,
} from "lucide-react";
import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type ProfileTab = "details" | "contacts" | "notes";
type AccountTab = "invoices" | "activity" | "payment-methods" | "settings";
type InvoiceStatus = "paid" | "open" | "overdue" | "draft";

type DetailRow = {
  id: string;
  icon: LucideIcon;
  label: string;
  value: string;
};

type Contact = {
  id: string;
  name: string;
  initials: string;
  role: string;
  email: string;
  primary?: boolean;
};

type Note = {
  id: string;
  author: string;
  initials: string;
  timestamp: string;
  body: string;
};

type Invoice = {
  id: string;
  reference: string;
  description: string;
  amount: string;
  status: InvoiceStatus;
  timing: string;
};

type ActivityEntry = {
  id: string;
  icon: LucideIcon;
  title: string;
  detail: string;
  timestamp: string;
  tone: "positive" | "neutral" | "warning";
};

type PaymentMethod = {
  id: string;
  icon: LucideIcon;
  title: string;
  detail: string;
  meta: string;
  isDefault?: boolean;
};

type SettingToggle = {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
};

const client = {
  name: "Shadcnblocks.com",
  domain: "shadcnblocks.com",
  summary: [
    "Shadcnblocks.com uses the full catalogue across product, design, and engineering, with 240 named seats across four teams. The account moved from per-project purchases to a single annual agreement in March 2023.",
    "Billing runs on one consolidated invoice each quarter, settled by bank transfer against a purchase order. The finance team requires a PO reference on every invoice, so automatic card capture stays switched off.",
  ],
};

const detailRows: DetailRow[] = [
  {
    id: "legal-name",
    icon: Building2,
    label: "Legal name",
    value: "Shadcnblocks.com",
  },
  {
    id: "billing-email",
    icon: Mail,
    label: "Billing email",
    value: "billing@shadcnblocks.com",
  },
  {
    id: "website",
    icon: Globe,
    label: "Website",
    value: "shadcnblocks.com",
  },
  {
    id: "location",
    icon: MapPin,
    label: "Location",
    value: "Sydney, Australia",
  },
  {
    id: "customer-since",
    icon: CalendarDays,
    label: "Customer since",
    value: "March 2023",
  },
  {
    id: "account-manager",
    icon: UserRound,
    label: "Account manager",
    value: "Ingrid Sandoval",
  },
  {
    id: "tax-id",
    icon: Landmark,
    label: "Tax ID",
    value: "ABN 74 612 893 204",
  },
  {
    id: "payment-terms",
    icon: Receipt,
    label: "Payment terms",
    value: "Net 30",
  },
  {
    id: "seats",
    icon: Users,
    label: "Licensed seats",
    value: "240 across 4 teams",
  },
];

const contacts: Contact[] = [
  {
    id: "ingrid",
    name: "Ingrid Sandoval",
    initials: "IS",
    role: "Account manager · Shadcnblocks",
    email: "ingrid@shadcnblocks.com",
    primary: true,
  },
  {
    id: "maya",
    name: "Maya Patel",
    initials: "MP",
    role: "Head of Product",
    email: "maya@shadcnblocks.com",
  },
  {
    id: "sofia",
    name: "Sofia Martins",
    initials: "SM",
    role: "Finance lead",
    email: "billing@shadcnblocks.com",
  },
  {
    id: "alex",
    name: "Alex Chen",
    initials: "AC",
    role: "Procurement lead",
    email: "finance@shadcnblocks.com",
  },
];

const notes: Note[] = [
  {
    id: "note-1",
    author: "Ingrid Sandoval",
    initials: "IS",
    timestamp: "12 Jun 2026",
    body: "Renewal call booked for 4 Aug. The product team wants to fold the next workspace expansion into the same agreement, taking the account from 240 to roughly 310 seats.",
  },
  {
    id: "note-2",
    author: "Ingrid Sandoval",
    initials: "IS",
    timestamp: "28 Apr 2026",
    body: "Sofia confirmed every invoice needs the PO number in the reference field. Invoices without it get bounced back by the AP system and delay payment by a full cycle.",
  },
  {
    id: "note-3",
    author: "Daniel Okonkwo",
    initials: "DO",
    timestamp: "15 Feb 2026",
    body: "Credited INV-1994 after a duplicate charge on the Q1 seat expansion. Root cause was a retried webhook, since fixed.",
  },
];

const headlineStats = [
  { id: "lifetime", label: "Lifetime volume", value: "$2.41M" },
  { id: "on-time", label: "On-time rate", value: "96%" },
  { id: "days-to-pay", label: "Avg days to pay", value: "18 days" },
] as const;

// Tinted from --primary so the stack reads as one hue at three depths and
// stays legible in both themes.
const volumeSeries = [
  {
    key: "paid",
    label: "Paid",
    color: "var(--primary)",
  },
  {
    key: "open",
    label: "Open",
    color: "color-mix(in oklch, var(--primary) 55%, var(--background))",
  },
  {
    key: "overdue",
    label: "Overdue",
    color: "color-mix(in oklch, var(--primary) 28%, var(--background))",
  },
] as const;

const volumeChartConfig = {
  paid: { label: "Paid", color: volumeSeries[0].color },
  open: { label: "Open", color: volumeSeries[1].color },
  overdue: { label: "Overdue", color: volumeSeries[2].color },
} satisfies ChartConfig;

// The two overdue bars are INV-2074 and INV-2081, and the single open bar is
// INV-2068, so the chart and the invoice table below always agree.
const volumeByMonth = [
  { month: "Aug", open: 0, overdue: 0, paid: 62_000 },
  { month: "Sep", open: 0, overdue: 0, paid: 74_000 },
  { month: "Oct", open: 0, overdue: 0, paid: 88_000 },
  { month: "Nov", open: 0, overdue: 0, paid: 45_000 },
  { month: "Dec", open: 0, overdue: 0, paid: 96_000 },
  { month: "Jan", open: 0, overdue: 0, paid: 52_000 },
  { month: "Feb", open: 0, overdue: 0, paid: 88_000 },
  { month: "Mar", open: 0, overdue: 0, paid: 71_000 },
  { month: "Apr", open: 0, overdue: 0, paid: 42_000 },
  { month: "May", open: 0, overdue: 0, paid: 88_000 },
  { month: "Jun", open: 0, overdue: 88_000, paid: 96_000 },
  { month: "Jul", open: 18_000, overdue: 96_000, paid: 56_000 },
];

const seriesTotals = {
  open: volumeByMonth.reduce((sum, month) => sum + month.open, 0),
  overdue: volumeByMonth.reduce((sum, month) => sum + month.overdue, 0),
  paid: volumeByMonth.reduce((sum, month) => sum + month.paid, 0),
};

const billedTotal =
  seriesTotals.paid + seriesTotals.open + seriesTotals.overdue;

function formatCurrency(value: number) {
  return value >= 1_000_000
    ? `$${(value / 1_000_000).toFixed(2)}M`
    : `$${Math.round(value / 1_000)}K`;
}

const invoices: Invoice[] = [
  {
    id: "inv-2081",
    reference: "INV-2081",
    description: "Q3 workspace expansion · 40 seats",
    amount: "$96,000.00",
    status: "overdue",
    timing: "Due 12 days ago",
  },
  {
    id: "inv-2074",
    reference: "INV-2074",
    description: "Annual agreement · Q3 instalment",
    amount: "$88,000.00",
    status: "overdue",
    timing: "Due 4 days ago",
  },
  {
    id: "inv-2068",
    reference: "INV-2068",
    description: "Priority support retainer",
    amount: "$18,000.00",
    status: "open",
    timing: "Due in 16 days",
  },
  {
    id: "inv-2055",
    reference: "INV-2055",
    description: "Annual agreement · Q2 instalment",
    amount: "$88,000.00",
    status: "paid",
    timing: "Paid 14 May 2026",
  },
  {
    id: "inv-2041",
    reference: "INV-2041",
    description: "Custom component commission · design system",
    amount: "$42,500.00",
    status: "paid",
    timing: "Paid 2 Apr 2026",
  },
  {
    id: "inv-2029",
    reference: "INV-2029",
    description: "Annual agreement · Q1 instalment",
    amount: "$88,000.00",
    status: "paid",
    timing: "Paid 19 Feb 2026",
  },
  {
    id: "inv-2014",
    reference: "INV-2014",
    description: "Figma kit handoff · design system",
    amount: "$12,400.00",
    status: "paid",
    timing: "Paid 8 Jan 2026",
  },
  {
    id: "inv-2098",
    reference: "INV-2098",
    description: "Q4 workspace expansion · product team",
    amount: "$74,000.00",
    status: "draft",
    timing: "Not yet issued",
  },
];

const invoiceStatusMeta: Record<
  InvoiceStatus,
  { label: string; className: string }
> = {
  paid: {
    label: "Paid",
    className:
      "border-emerald-600/20 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
  open: {
    label: "Open",
    className:
      "border-blue-600/20 bg-blue-50 text-blue-700 dark:border-blue-400/20 dark:bg-blue-950/40 dark:text-blue-400",
  },
  overdue: {
    label: "Overdue",
    className:
      "border-destructive/20 bg-destructive/10 text-destructive dark:bg-destructive/15",
  },
  draft: {
    label: "Draft",
    className: "bg-muted text-muted-foreground border-transparent",
  },
};

const activity: ActivityEntry[] = [
  {
    id: "act-1",
    icon: TriangleAlert,
    title: "Invoice INV-2081 passed its due date",
    detail: "$96,000.00 · first reminder sent to billing@shadcnblocks.com",
    timestamp: "12 days ago",
    tone: "warning",
  },
  {
    id: "act-2",
    icon: FileText,
    title: "Invoice INV-2074 issued",
    detail: "$88,000.00 · Q3 instalment against PO SB-2026-114",
    timestamp: "18 days ago",
    tone: "neutral",
  },
  {
    id: "act-3",
    icon: Users,
    title: "Seat count increased to 240",
    detail: "40 seats added for the product platform team",
    timestamp: "24 days ago",
    tone: "neutral",
  },
  {
    id: "act-4",
    icon: CircleCheck,
    title: "Payment received for INV-2055",
    detail: "$88,000.00 · bank transfer, cleared in 11 days",
    timestamp: "14 May 2026",
    tone: "positive",
  },
  {
    id: "act-5",
    icon: ShieldCheck,
    title: "Annual agreement renewed",
    detail: "12-month term, 240 seats, Net 30 retained",
    timestamp: "2 Mar 2026",
    tone: "positive",
  },
  {
    id: "act-6",
    icon: CircleCheck,
    title: "Payment received for INV-2041",
    detail: "$42,500.00 · bank transfer, cleared in 9 days",
    timestamp: "2 Apr 2026",
    tone: "positive",
  },
];

const paymentMethods: PaymentMethod[] = [
  {
    id: "bank",
    icon: Landmark,
    title: "CommBank Business",
    detail: "Account ending 4471 · AUD settlement account",
    meta: "Used for every invoice since March 2023",
    isDefault: true,
  },
  {
    id: "card",
    icon: CreditCard,
    title: "Visa ending 6218",
    detail: "Expires 09/2028 · Sofia Martins",
    meta: "Backup only, never charged automatically",
  },
  {
    id: "transfer",
    icon: Banknote,
    title: "Wire transfer, AUD",
    detail: "Correspondent account for cross-border invoices",
    meta: "Last used 8 Jan 2026",
  },
];

const settingToggles: SettingToggle[] = [
  {
    id: "auto-charge",
    label: "Charge the default method automatically",
    description:
      "Off by design. The finance team pays manually against a purchase order.",
    enabled: false,
  },
  {
    id: "dunning",
    label: "Send dunning reminders",
    description: "Reminders at 3, 7, and 14 days past the due date.",
    enabled: true,
  },
  {
    id: "consolidated",
    label: "Consolidate into one quarterly invoice",
    description: "All seat and support charges roll into a single document.",
    enabled: true,
  },
  {
    id: "po-required",
    label: "Require a PO number on every invoice",
    description: "Invoices without a PO reference are rejected on receipt.",
    enabled: true,
  },
];

const activityToneClass: Record<ActivityEntry["tone"], string> = {
  positive:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
  neutral: "bg-muted text-muted-foreground",
  warning:
    "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
};

// Both panels reserve the same header height so their tab rows land on one
// line and the two bottom borders read as a single rule across the screen.
const panelHeaderHeight = "lg:h-72";

function TabBar<T extends string>({
  activeTab,
  onSelect,
  tabs,
}: {
  activeTab: T;
  onSelect: (tab: T) => void;
  tabs: { value: T; label: string; icon: LucideIcon }[];
}) {
  return (
    <div className="horizontal-scrollbar flex shrink-0 items-center gap-5 overflow-x-auto border-b px-5">
      {tabs.map((tab) => {
        const TabIcon = tab.icon;
        const isActive = activeTab === tab.value;

        return (
          <button
            aria-pressed={isActive}
            className={cn(
              "flex h-11 shrink-0 items-center gap-2 border-b-2 text-sm font-medium transition-colors",
              isActive
                ? "border-b-foreground text-foreground"
                : "text-muted-foreground hover:text-foreground border-b-transparent",
            )}
            key={tab.value}
            onClick={() => onSelect(tab.value)}
            type="button"
          >
            <TabIcon aria-hidden="true" className="size-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function DetailListRow({ row }: { row: DetailRow }) {
  const Icon = row.icon;

  return (
    <div className="group hover:bg-muted/40 relative flex items-center gap-3 rounded-md px-2 py-2 transition-colors">
      <Icon
        aria-hidden="true"
        className="text-muted-foreground size-4 shrink-0"
      />
      <p className="text-muted-foreground w-32 shrink-0 truncate text-sm">
        {row.label}
      </p>
      <p className="min-w-0 flex-1 truncate text-sm">{row.value}</p>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label={`Actions for ${row.label}`}
            // Overlaid rather than inline: reserving a slot for a button that
            // is invisible most of the time costs the value column 40px, which
            // is enough to truncate an ordinary billing address.
            className="bg-muted/40 absolute top-1/2 right-2 size-7 -translate-y-1/2 rounded-md opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
            size="icon"
            type="button"
            variant="ghost"
          >
            <Ellipsis aria-hidden="true" className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem
            onSelect={() => {
              void navigator.clipboard?.writeText(row.value);
            }}
          >
            <Copy aria-hidden="true" />
            Copy value
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Pencil aria-hidden="true" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Send aria-hidden="true" />
            Send via email
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            <Trash2 aria-hidden="true" />
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ProfilePanel() {
  const [activeTab, setActiveTab] = React.useState<ProfileTab>("details");

  return (
    <div className="flex min-h-0 flex-col border-b lg:border-r lg:border-b-0">
      <div
        className={cn(
          "flex shrink-0 flex-col border-b px-5 py-6",
          panelHeaderHeight,
        )}
      >
        <div className="bg-muted/40 grid size-14 place-items-center rounded-2xl border shadow-sm">
          <Logo
            alt="Shadcnblocks.com logo"
            className="h-8 w-auto dark:invert"
            height={37}
            src="/images/block/logos/shadcnblocks-logo.svg"
            width={32}
          />
        </div>

        <h1 className="mt-4 text-xl font-semibold tracking-tight">
          {client.name}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">{client.domain}</p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button className="h-8 rounded-md px-3 text-xs" type="button">
            <FilePlus2 aria-hidden="true" className="size-4" />
            New invoice
          </Button>
          <Button
            className="h-8 rounded-md px-3 text-xs"
            type="button"
            variant="outline"
          >
            <Mail aria-hidden="true" className="size-4" />
            Email
          </Button>
          <Button
            className="h-8 rounded-md px-3 text-xs"
            type="button"
            variant="outline"
          >
            <CirclePlus aria-hidden="true" className="size-4" />
            Add note
          </Button>
        </div>

        {/* Pinned to the bottom of the band. The header height is set by the
            taller chart panel next door, so without this the leftover space
            collects under the buttons as a gap. */}
        <dl className="mt-auto flex flex-wrap items-start gap-x-6 gap-y-3 pt-6">
          {headlineStats.map((stat) => (
            <div key={stat.id}>
              <dt className="text-muted-foreground text-xs">{stat.label}</dt>
              <dd className="mt-1 text-sm font-medium tabular-nums">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <TabBar
        activeTab={activeTab}
        onSelect={setActiveTab}
        tabs={[
          { value: "details", label: "Details", icon: FileText },
          { value: "contacts", label: "Contacts", icon: Users },
          { value: "notes", label: "Notes", icon: Pencil },
        ]}
      />

      <div className="vertical-scrollbar min-h-0 flex-1 overflow-y-auto">
        {activeTab === "details" ? (
          <>
            <div className="space-y-0.5 px-3 py-4">
              {detailRows.map((row) => (
                <DetailListRow key={row.id} row={row} />
              ))}
            </div>

            <div className="border-t px-5 py-5">
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Building2 aria-hidden="true" className="size-4" />
                About the account
              </div>
              <div className="mt-3 space-y-3">
                {client.summary.map((paragraph) => (
                  <p
                    className="text-sm leading-relaxed"
                    key={paragraph.slice(0, 24)}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </>
        ) : null}

        {activeTab === "contacts" ? (
          <div className="px-5 py-4">
            {contacts.map((contact) => (
              <div
                className="flex items-start gap-3 border-b py-3 last:border-b-0"
                key={contact.id}
              >
                <Avatar className="size-9 shrink-0 border">
                  <AvatarFallback className="text-xs font-medium">
                    {contact.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <p className="truncate text-sm font-medium">
                      {contact.name}
                    </p>
                    {contact.primary ? (
                      <Badge
                        className="h-5 shrink-0 rounded-full px-1.5 text-[10px] font-medium shadow-none"
                        variant="secondary"
                      >
                        Primary
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-muted-foreground mt-0.5 truncate text-xs">
                    {contact.role}
                  </p>
                  <p className="text-muted-foreground mt-1 truncate text-xs">
                    {contact.email}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {activeTab === "notes" ? (
          <div className="px-5 py-4">
            {notes.map((note) => (
              <div className="border-b py-4 last:border-b-0" key={note.id}>
                <div className="flex items-center gap-2">
                  <Avatar className="size-6 shrink-0 border">
                    <AvatarFallback className="text-[10px] font-medium">
                      {note.initials}
                    </AvatarFallback>
                  </Avatar>
                  <p className="truncate text-sm font-medium">{note.author}</p>
                  <span className="text-muted-foreground ml-auto shrink-0 text-xs">
                    {note.timestamp}
                  </span>
                </div>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {note.body}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function AccountPanel() {
  const [activeTab, setActiveTab] = React.useState<AccountTab>("invoices");
  const [toggles, setToggles] = React.useState<string[]>(
    settingToggles
      .filter((toggle) => toggle.enabled)
      .map((toggle) => toggle.id),
  );

  return (
    <div className="flex min-h-0 flex-col">
      <div
        className={cn(
          "flex shrink-0 flex-col border-b px-5 py-6",
          panelHeaderHeight,
        )}
      >
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <div>
            <p className="text-muted-foreground text-xs">
              Billed volume · last 12 months
            </p>
            <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
              {formatCurrency(billedTotal)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {volumeSeries.map((series) => (
              <div className="flex items-center gap-2" key={series.key}>
                <span
                  aria-hidden="true"
                  className="size-2 shrink-0 rounded-full"
                  style={{ background: series.color }}
                />
                <span className="text-muted-foreground text-xs">
                  {series.label}
                </span>
                <span className="text-xs font-medium tabular-nums">
                  {formatCurrency(seriesTotals[series.key])}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Below lg the panel is no longer height-constrained, so the chart
            needs an explicit height instead of filling the leftover band. */}
        <ChartContainer
          className="mt-4 aspect-auto h-40 w-full lg:h-auto lg:min-h-0 lg:flex-1"
          config={volumeChartConfig}
        >
          <BarChart
            barCategoryGap="30%"
            data={volumeByMonth}
            margin={{ bottom: 0, left: 0, right: 8, top: 4 }}
          >
            <CartesianGrid
              stroke="color-mix(in oklch, var(--border) 78%, transparent)"
              strokeDasharray="3 3"
              vertical={false}
            />
            <YAxis
              axisLine={false}
              domain={[0, 200000]}
              tickLine={false}
              tickFormatter={(value: number) =>
                value === 0 ? "0" : `${value / 1000}k`
              }
              ticks={[0, 100000, 200000]}
              width={44}
            />
            <XAxis
              axisLine={false}
              dataKey="month"
              tickLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              content={<ChartTooltipContent indicator="line" />}
              cursor={{ fill: "var(--muted)", opacity: 0.45 }}
            />
            {volumeSeries.map((series, index) => (
              <Bar
                dataKey={series.key}
                fill={`var(--color-${series.key})`}
                isAnimationActive={false}
                key={series.key}
                maxBarSize={28}
                radius={
                  index === volumeSeries.length - 1
                    ? [3, 3, 0, 0]
                    : [0, 0, 0, 0]
                }
                stackId="volume"
              />
            ))}
          </BarChart>
        </ChartContainer>
      </div>

      <TabBar
        activeTab={activeTab}
        onSelect={setActiveTab}
        tabs={[
          { value: "invoices", label: "Invoices", icon: Receipt },
          { value: "activity", label: "Activity", icon: CalendarDays },
          {
            value: "payment-methods",
            label: "Payment methods",
            icon: CreditCard,
          },
          { value: "settings", label: "Settings", icon: ShieldCheck },
        ]}
      />

      <div className="vertical-scrollbar min-h-0 flex-1 overflow-y-auto">
        {activeTab === "invoices" ? (
          <div className="px-5 py-5">
            <p className="text-muted-foreground text-sm">
              Total: {invoices.length} invoices
            </p>

            <div className="mt-3 grid gap-3 xl:grid-cols-2">
              {invoices.map((invoice) => {
                const status = invoiceStatusMeta[invoice.status];

                return (
                  <div
                    className="hover:bg-muted/40 rounded-xl border px-4 py-3 transition-colors"
                    key={invoice.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 truncate text-sm font-medium">
                        {invoice.reference}
                      </p>
                      <Badge
                        className={cn(
                          "h-5 shrink-0 rounded-full px-2 text-[11px] font-medium shadow-none",
                          status.className,
                        )}
                        variant="outline"
                      >
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-1 truncate text-xs">
                      {invoice.description}
                    </p>
                    <p className="text-muted-foreground mt-3 text-xs">
                      <span className="text-foreground font-medium tabular-nums">
                        {invoice.amount}
                      </span>{" "}
                      · {invoice.timing}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {activeTab === "activity" ? (
          <div className="px-5 py-5">
            {activity.map((entry) => {
              const EntryIcon = entry.icon;

              return (
                <div
                  className="flex items-start gap-3 border-b py-3 last:border-b-0"
                  key={entry.id}
                >
                  <span
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-full",
                      activityToneClass[entry.tone],
                    )}
                  >
                    <EntryIcon aria-hidden="true" className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {entry.title}
                    </p>
                    <p className="text-muted-foreground mt-0.5 truncate text-xs">
                      {entry.detail}
                    </p>
                  </div>
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {entry.timestamp}
                  </span>
                </div>
              );
            })}
          </div>
        ) : null}

        {activeTab === "payment-methods" ? (
          <div className="px-5 py-5">
            <div className="grid gap-3 xl:grid-cols-2">
              {paymentMethods.map((method) => {
                const MethodIcon = method.icon;

                return (
                  <div className="rounded-xl border px-4 py-3" key={method.id}>
                    <div className="flex items-start gap-3">
                      <span className="bg-muted text-muted-foreground grid size-9 shrink-0 place-items-center rounded-lg">
                        <MethodIcon aria-hidden="true" className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 items-center gap-2">
                          <p className="truncate text-sm font-medium">
                            {method.title}
                          </p>
                          {method.isDefault ? (
                            <Badge
                              className="h-5 shrink-0 rounded-full px-1.5 text-[10px] font-medium shadow-none"
                              variant="secondary"
                            >
                              Default
                            </Badge>
                          ) : null}
                        </div>
                        <p className="text-muted-foreground mt-0.5 truncate text-xs">
                          {method.detail}
                        </p>
                        <p className="text-muted-foreground mt-2 truncate text-xs">
                          {method.meta}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {activeTab === "settings" ? (
          <div className="px-5 py-5">
            {settingToggles.map((toggle) => {
              const isEnabled = toggles.includes(toggle.id);

              return (
                <div
                  className="flex items-start justify-between gap-4 border-b py-4 last:border-b-0"
                  key={toggle.id}
                >
                  <div className="min-w-0">
                    <label
                      className="cursor-pointer text-sm font-medium"
                      htmlFor={`toggle-${toggle.id}`}
                    >
                      {toggle.label}
                    </label>
                    <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                      {toggle.description}
                    </p>
                  </div>
                  <Switch
                    checked={isEnabled}
                    className="mt-0.5 shrink-0"
                    id={`toggle-${toggle.id}`}
                    onCheckedChange={() =>
                      setToggles((current) =>
                        isEnabled
                          ? current.filter((id) => id !== toggle.id)
                          : [...current, toggle.id],
                      )
                    }
                  />
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function PaymentProcessorEnterpriseClientDetail() {
  return (
    <main className="bg-background text-foreground flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="vertical-scrollbar grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:overflow-hidden xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <ProfilePanel />
        <AccountPanel />
      </div>
    </main>
  );
}
