"use client";

import { ChevronDown, MoreHorizontal, Plus } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

type InvoiceStatus = "due" | "paid" | "overdue" | "canceled" | "draft";

type InvoiceRow = {
  id: string;
  title: string;
  customer: string;
  status: InvoiceStatus;
  statusText: string;
  amount: string;
};

const chartData = [
  { month: "Jan", paid: 74000, open: 24000, overdue: 6000 },
  { month: "Feb", paid: 91000, open: 38000, overdue: 9000 },
  { month: "Mar", paid: 36000, open: 56000, overdue: 13000 },
  { month: "Apr", paid: 82000, open: 19000, overdue: 5000 },
  { month: "May", paid: 118000, open: 31000, overdue: 7000 },
  { month: "Jun", paid: 68000, open: 44000, overdue: 11000 },
];

const mixBase = "var(--background)";

const palette = {
  primary: `color-mix(in oklch, var(--primary) 96%, ${mixBase})`,
  secondary: {
    light: `color-mix(in oklch, var(--primary) 28%, ${mixBase})`,
    dark: `color-mix(in oklch, var(--primary) 48%, ${mixBase})`,
  },
  tertiary: {
    light: `color-mix(in oklch, var(--primary) 18%, ${mixBase})`,
    dark: `color-mix(in oklch, var(--primary) 28%, ${mixBase})`,
  },
} as const;

const chartConfig = {
  paid: {
    label: "Paid",
    color: palette.primary,
  },
  open: {
    label: "Open",
    theme: palette.secondary,
  },
  overdue: {
    label: "Overdue",
    theme: palette.tertiary,
  },
} satisfies ChartConfig;

const chartLegend = [
  { label: "Paid", color: palette.primary },
  { label: "Open", color: palette.secondary.light },
  { label: "Overdue", color: palette.tertiary.light },
] as const;

const thisMonthInvoices: InvoiceRow[] = [
  {
    id: "INV-7184",
    title: "Pro blocks license",
    customer: "Northline Studio",
    status: "due",
    statusText: "Due Aug 12",
    amount: "$2,499.00",
  },
  {
    id: "INV-7183",
    title: "Admin kit integration",
    customer: "Vela Design Co.",
    status: "paid",
    statusText: "Settled Jul 28",
    amount: "$8,400.00",
  },
  {
    id: "INV-7182",
    title: "Template migration",
    customer: "Harborline Apps",
    status: "overdue",
    statusText: "6 days past due",
    amount: "$3,180.00",
  },
  {
    id: "INV-7181",
    title: "Duplicate component order",
    customer: "Pollen Interface",
    status: "canceled",
    statusText: "Voided Jul 19",
    amount: "$899.00",
  },
  {
    id: "INV-7180",
    title: "Figma kit handoff",
    customer: "Argent Labs",
    status: "draft",
    statusText: "Draft saved",
    amount: "$1,950.00",
  },
];

const previousInvoices: InvoiceRow[] = [
  {
    id: "INV-7179",
    title: "Lifetime access bundle",
    customer: "Cedar UI Works",
    status: "paid",
    statusText: "Settled Jun 30",
    amount: "$6,800.00",
  },
  {
    id: "INV-7178",
    title: "Private block request",
    customer: "North Pier Digital",
    status: "overdue",
    statusText: "14 days past due",
    amount: "$2,750.00",
  },
];

const statusClassName: Record<InvoiceStatus, string> = {
  due: "text-foreground",
  paid: "text-emerald-600 dark:text-emerald-400",
  overdue: "text-orange-600 dark:text-orange-400",
  canceled: "text-muted-foreground",
  draft: "text-violet-600 dark:text-violet-400",
};

function MetricPair() {
  return (
    <div className="grid gap-8 md:grid-cols-[210px_1px_1fr] md:items-center">
      <div>
        <div className="flex items-baseline gap-4">
          <div className="text-foreground text-xl font-semibold tracking-tight">
            $5,679
          </div>
          <div className="text-muted-foreground text-sm font-semibold">
            Open this month
          </div>
        </div>
      </div>

      <div className="bg-border hidden h-6 md:block" />

      <div>
        <div className="flex items-baseline gap-4">
          <div className="text-foreground text-xl font-semibold tracking-tight">
            $24,478
          </div>
          <div className="text-muted-foreground text-sm font-semibold">
            Total invoiced
          </div>
        </div>
      </div>
    </div>
  );
}

function InvoiceRowItem({ invoice }: { invoice: InvoiceRow }) {
  return (
    <div className="border-border grid min-h-14 grid-cols-1 items-center gap-2 border-b py-3 text-sm last:border-b-0 md:grid-cols-[1.2fr_1fr_150px_130px_32px]">
      <div className="min-w-0">
        <div className="text-foreground font-semibold">{invoice.title}</div>
        <div className="text-muted-foreground mt-0.5 text-xs font-medium">
          {invoice.id}
        </div>
      </div>
      <div className="text-muted-foreground font-medium">
        {invoice.customer}
      </div>
      <div className={cn("font-semibold", statusClassName[invoice.status])}>
        {invoice.statusText}
      </div>
      <div className="text-foreground font-semibold md:text-right">
        {invoice.amount}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:bg-muted hover:text-foreground size-8 justify-self-start rounded-md md:justify-self-end"
      >
        <span className="sr-only">Invoice actions</span>
        <MoreHorizontal className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}

export function PaymentProcessorInvoiceList() {
  return (
    <main className="bg-background text-foreground flex min-h-0 flex-1 overflow-hidden">
      <div className="min-h-0 w-full flex-1 overflow-y-auto">
        <section className="mx-auto w-full max-w-7xl min-w-0 px-6 py-7 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-5">
              <h1 className="text-foreground text-[26px] leading-8 font-semibold tracking-tight">
                Invoice Overview
              </h1>
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground hover:bg-muted hover:text-foreground h-8 gap-2 px-2 text-sm font-medium"
              >
                Last 6 months
                <ChevronDown className="size-4" aria-hidden="true" />
              </Button>
            </div>

            <MetricPair />
          </div>

          <div className="bg-card ring-border mt-7 overflow-hidden rounded-xl px-4 pt-4 pb-4 ring-1 sm:px-5">
            <div className="overflow-x-auto">
              <ChartContainer
                config={chartConfig}
                className="aspect-auto h-[248px] w-[620px] sm:w-full"
              >
                <BarChart
                  data={chartData}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                  barCategoryGap="34%"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="color-mix(in oklch, var(--border) 78%, transparent)"
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 160000]}
                    width={44}
                    ticks={[0, 30000, 60000, 90000, 120000, 150000]}
                    tickFormatter={(value) =>
                      value === 0 ? "0" : `${value / 1000}k`
                    }
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                  />
                  <ChartTooltip
                    cursor={{ fill: "var(--muted)", opacity: 0.45 }}
                    content={
                      <ChartTooltipContent
                        indicator="line"
                        labelClassName="text-foreground"
                      />
                    }
                  />
                  <Bar
                    dataKey="paid"
                    stackId="invoice"
                    fill="var(--color-paid)"
                    isAnimationActive={false}
                    maxBarSize={56}
                    radius={[0, 0, 3, 3]}
                  />
                  <Bar
                    dataKey="open"
                    stackId="invoice"
                    fill="var(--color-open)"
                    isAnimationActive={false}
                    maxBarSize={56}
                    radius={0}
                  />
                  <Bar
                    dataKey="overdue"
                    stackId="invoice"
                    fill="var(--color-overdue)"
                    isAnimationActive={false}
                    maxBarSize={56}
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              {chartLegend.map((item) => (
                <div
                  key={item.label}
                  className="text-muted-foreground flex items-center gap-2 text-xs font-medium"
                >
                  <span
                    className="size-2.5 rounded-sm"
                    style={{
                      backgroundColor: item.color,
                    }}
                  />
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
              <h2 className="text-foreground text-xl font-semibold tracking-tight">
                This month
              </h2>
              <span className="text-muted-foreground text-sm font-medium">
                Unpaid invoices
              </span>
              <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                $5,679
              </span>
              <span className="text-muted-foreground text-sm font-medium">
                Draft value
              </span>
              <span className="text-foreground text-sm font-semibold">
                $1,950
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-8 rounded-md px-3 text-sm font-semibold shadow-none"
            >
              <Plus className="size-4" aria-hidden="true" />
              New Invoice
            </Button>
          </div>

          <div className="mt-7">
            {thisMonthInvoices.map((invoice) => (
              <InvoiceRowItem key={invoice.id} invoice={invoice} />
            ))}
          </div>

          <div className="mt-7 flex flex-wrap items-baseline gap-x-5 gap-y-2">
            <h2 className="text-foreground text-xl font-semibold tracking-tight">
              Previous
            </h2>
            <span className="text-muted-foreground text-sm font-medium">
              Open invoices
            </span>
            <span className="text-foreground text-sm font-semibold">
              $2,750
            </span>
          </div>
          <div className="mt-4">
            {previousInvoices.map((invoice) => (
              <InvoiceRowItem key={invoice.id} invoice={invoice} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
