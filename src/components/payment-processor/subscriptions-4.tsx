"use client";

import { CalendarDays, CircleHelp, Search } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Health = "healthy" | "watch" | "critical";

type HealthCard = {
  title: string;
  rows: [string, string][];
  metricLabel: string;
  metric: string;
  score: number;
  delta: string;
  deltaLabel: string;
  tone: Health;
};

type Product = {
  id: string;
  name: string;
  initials: string;
  productTone: string;
  type: "subscriptions" | "one-time";
  price: string;
  interval: string;
  customers: number;
  revenue: string;
  growth: string;
  health: Health;
};

const healthCards: HealthCard[] = [
  {
    title: "Active subscriptions",
    rows: [
      ["Active", "2,698"],
      ["MRR", "$73,306"],
    ],
    metricLabel: "Retention rate",
    metric: "96.8%",
    score: 92,
    delta: "+4.2%",
    deltaLabel: "vs last month",
    tone: "healthy",
  },
  {
    title: "Upcoming renewals",
    rows: [
      ["Due in 7 days", "384"],
      ["Renewal value", "$28,640"],
    ],
    metricLabel: "Expected success rate",
    metric: "91.4%",
    score: 78,
    delta: "-1.8%",
    deltaLabel: "vs last period",
    tone: "watch",
  },
  {
    title: "At-risk revenue",
    rows: [
      ["At-risk subscriptions", "67"],
      ["Revenue exposed", "$8,920"],
    ],
    metricLabel: "Recovery probability",
    metric: "42%",
    score: 42,
    delta: "+12.6%",
    deltaLabel: "vs last period",
    tone: "critical",
  },
];

const products: Product[] = [
  {
    id: "pro-monthly",
    name: "Pro Monthly",
    initials: "PM",
    productTone: "bg-emerald-500 text-white",
    type: "subscriptions",
    price: "$29",
    interval: "Monthly",
    customers: 842,
    revenue: "$24,418",
    growth: "+12.8%",
    health: "healthy",
  },
  {
    id: "team-yearly",
    name: "Team Yearly",
    initials: "TY",
    productTone: "bg-sky-500 text-white",
    type: "subscriptions",
    price: "$348",
    interval: "Yearly",
    customers: 316,
    revenue: "$9,164",
    growth: "+8.6%",
    health: "healthy",
  },
  {
    id: "studio-monthly",
    name: "Studio Monthly",
    initials: "SM",
    productTone: "bg-violet-500 text-white",
    type: "subscriptions",
    price: "$79",
    interval: "Monthly",
    customers: 184,
    revenue: "$14,536",
    growth: "+5.2%",
    health: "watch",
  },
  {
    id: "starter-monthly",
    name: "Starter Monthly",
    initials: "ST",
    productTone: "bg-amber-500 text-white",
    type: "subscriptions",
    price: "$12",
    interval: "Monthly",
    customers: 1264,
    revenue: "$15,168",
    growth: "+18.4%",
    health: "healthy",
  },
  {
    id: "agency-yearly",
    name: "Agency Yearly",
    initials: "AY",
    productTone: "bg-rose-500 text-white",
    type: "subscriptions",
    price: "$1,188",
    interval: "Yearly",
    customers: 92,
    revenue: "$9,108",
    growth: "+3.1%",
    health: "watch",
  },
  {
    id: "components-monthly",
    name: "Components Monthly",
    initials: "CM",
    productTone: "bg-zinc-500 text-white",
    type: "subscriptions",
    price: "$19",
    interval: "Monthly",
    customers: 48,
    revenue: "$912",
    growth: "-6.7%",
    health: "critical",
  },
  {
    id: "scale-monthly",
    name: "Scale Monthly",
    initials: "SC",
    productTone: "bg-cyan-500 text-white",
    type: "subscriptions",
    price: "$149",
    interval: "Monthly",
    customers: 138,
    revenue: "$20,562",
    growth: "+9.9%",
    health: "healthy",
  },
  {
    id: "starter-yearly",
    name: "Starter Yearly",
    initials: "SY",
    productTone: "bg-lime-600 text-white",
    type: "subscriptions",
    price: "$120",
    interval: "Yearly",
    customers: 428,
    revenue: "$4,280",
    growth: "+6.4%",
    health: "healthy",
  },
  {
    id: "pro-yearly",
    name: "Pro Yearly",
    initials: "PY",
    productTone: "bg-indigo-500 text-white",
    type: "subscriptions",
    price: "$290",
    interval: "Yearly",
    customers: 256,
    revenue: "$6,187",
    growth: "+10.3%",
    health: "healthy",
  },
  {
    id: "enterprise-monthly",
    name: "Enterprise Monthly",
    initials: "EM",
    productTone: "bg-fuchsia-500 text-white",
    type: "subscriptions",
    price: "$399",
    interval: "Monthly",
    customers: 36,
    revenue: "$14,364",
    growth: "+4.7%",
    health: "watch",
  },
  {
    id: "admin-kit",
    name: "Admin Kit",
    initials: "AK",
    productTone: "bg-blue-600 text-white",
    type: "one-time",
    price: "$249",
    interval: "One-time",
    customers: 486,
    revenue: "$121,014",
    growth: "+14.2%",
    health: "healthy",
  },
  {
    id: "template-pack",
    name: "Template Implementation Pack",
    initials: "TP",
    productTone: "bg-orange-600 text-white",
    type: "one-time",
    price: "$149",
    interval: "One-time",
    customers: 214,
    revenue: "$31,886",
    growth: "+7.8%",
    health: "healthy",
  },
  {
    id: "figma-kit",
    name: "Figma Kit",
    initials: "FK",
    productTone: "bg-pink-500 text-white",
    type: "one-time",
    price: "$89",
    interval: "One-time",
    customers: 168,
    revenue: "$14,952",
    growth: "-2.4%",
    health: "watch",
  },
];

const healthMeta: Record<
  Health,
  { label: string; dot: string; bar: string; badge: string }
> = {
  healthy: {
    label: "Healthy",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
    badge:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
  },
  watch: {
    label: "Watch",
    dot: "bg-amber-500",
    bar: "bg-amber-500",
    badge:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
  },
  critical: {
    label: "Critical",
    dot: "bg-red-500",
    bar: "bg-red-500",
    badge:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
  },
};

function ProductTypeControl() {
  return (
    <div
      aria-label="Product type"
      className="bg-muted/70 inline-flex h-10 w-fit items-center rounded-lg border p-1"
      role="tablist"
    >
      {["All products", "Subscriptions", "One-time"].map((item) => {
        const selected = item === "Subscriptions";

        return (
          <button
            key={item}
            aria-disabled={!selected}
            aria-selected={selected}
            className={cn(
              "text-muted-foreground focus-visible:ring-ring h-8 rounded-md px-3 text-sm font-medium capitalize transition-colors focus-visible:ring-2 focus-visible:outline-none",
              selected && "bg-background text-foreground border shadow-sm",
              !selected && "cursor-default",
            )}
            disabled={!selected}
            role="tab"
            type="button"
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}

function SegmentedHealthBar({ score, tone }: { score: number; tone: Health }) {
  const activeSegments = Math.round(score / 2.5);

  return (
    <div
      aria-label={`${score}% health score`}
      className="flex h-4 items-center gap-1 overflow-hidden"
      role="img"
    >
      {Array.from({ length: 40 }, (_, index) => (
        <span
          key={index}
          className={cn(
            "h-4 w-0.5 shrink-0 rounded-full sm:w-1",
            index < activeSegments
              ? healthMeta[tone].bar
              : "bg-muted-foreground/15",
          )}
        />
      ))}
    </div>
  );
}

function SubscriptionHealthCard({ card }: { card: HealthCard }) {
  return (
    <article className="bg-background min-w-0 border-b p-4 last:border-b-0 md:border-r md:border-b-0 md:last:border-r-0">
      <div className="flex items-center justify-between gap-3 border-b pb-3">
        <h3 className="truncate text-sm font-semibold sm:text-base">
          {card.title}
        </h3>
        <CircleHelp
          aria-hidden="true"
          className="text-muted-foreground size-4 shrink-0"
        />
      </div>

      <dl className="space-y-1.5 border-b py-3 text-sm">
        {card.rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground truncate">{label}</dt>
            <dd className="shrink-0 font-medium tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="pt-3">
        <div className="mb-2 flex items-center justify-between gap-4 text-sm">
          <span className="text-muted-foreground truncate">
            {card.metricLabel}
          </span>
          <span className="shrink-0 font-medium tabular-nums">
            {card.metric}
          </span>
        </div>
        <SegmentedHealthBar score={card.score} tone={card.tone} />
        <div className="mt-3 flex items-center justify-between gap-3 text-sm">
          <span
            className={cn(
              "font-medium tabular-nums",
              card.tone === "healthy" && "text-emerald-600",
              card.tone === "watch" && "text-amber-600",
              card.tone === "critical" && "text-red-600",
            )}
          >
            {card.delta}
          </span>
          <span className="text-muted-foreground truncate">
            {card.deltaLabel}
          </span>
        </div>
      </div>
    </article>
  );
}

function HealthBadge({ health }: { health: Health }) {
  const meta = healthMeta[health];

  return (
    <Badge
      className={cn(
        "h-6 rounded-md px-2.5 text-xs font-medium shadow-none",
        meta.badge,
      )}
      variant="outline"
    >
      {meta.label}
    </Badge>
  );
}

export function PaymentProcessorSubscriptions4({
  className,
}: {
  className?: string;
}) {
  const [query, setQuery] = React.useState("");

  const filteredProducts = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesQuery =
        !normalizedQuery ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.interval.toLowerCase().includes(normalizedQuery);
      return matchesQuery && product.type === "subscriptions";
    });
  }, [query]);

  return (
    <main
      className={cn(
        "bg-background text-foreground min-h-0 flex-1 overflow-auto",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <ProductTypeControl />
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <CalendarDays aria-hidden="true" className="size-4" />
              <time dateTime="2026-06-15T10:00:00+05:30">
                Mon, Jun 15, 2026 · 10:00 AM IST
              </time>
            </div>
          </div>
        </header>

        <section className="overflow-hidden rounded-lg border">
          <div className="bg-muted/45 flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-base font-semibold">Subscription health</h1>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Portfolio performance across recurring products
              </p>
            </div>
            <div
              aria-label="Health status legend"
              className="flex flex-wrap items-center gap-4 text-sm"
            >
              {(Object.keys(healthMeta) as Health[]).map((health) => (
                <span key={health} className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "size-2 rounded-full",
                      healthMeta[health].dot,
                    )}
                  />
                  <span
                    className={cn(
                      health === "healthy" && "text-emerald-600",
                      health === "watch" && "text-amber-600",
                      health === "critical" && "text-red-600",
                    )}
                  >
                    {healthMeta[health].label}
                  </span>
                </span>
              ))}
            </div>
          </div>
          <div className="grid md:grid-cols-3">
            {healthCards.map((card) => (
              <SubscriptionHealthCard key={card.title} card={card} />
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border">
          <div className="bg-muted/45 flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold">Subscriptions</h2>
              <Badge
                className="size-6 justify-center rounded-full p-0 text-xs tabular-nums"
                variant="secondary"
              >
                {filteredProducts.length}
              </Badge>
            </div>
            <div className="relative w-full sm:w-56">
              <Search
                aria-hidden="true"
                className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
              />
              <Input
                aria-label="Search subscriptions"
                className="h-8 pl-8 text-sm"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search subscriptions…"
                value={query}
              />
            </div>
          </div>

          <div className="horizontal-scrollbar overflow-x-auto">
            <table className="w-full min-w-[1120px] border-separate border-spacing-0 text-sm">
              <thead>
                <tr className="text-muted-foreground bg-muted/20 text-left">
                  {[
                    "Subscription",
                    "Type",
                    "Price",
                    "Billing interval",
                    "Customers",
                    "Revenue",
                    "Growth",
                    "Health",
                  ].map((label) => (
                    <th
                      key={label}
                      className="h-10 border-r border-b px-4 font-medium last:border-r-0"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="h-14 border-r border-b px-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "grid size-7 shrink-0 place-items-center rounded-full text-[10px] font-semibold",
                            product.productTone,
                          )}
                        >
                          {product.initials}
                        </span>
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="border-r border-b px-4 capitalize">
                      {product.type}
                    </td>
                    <td className="border-r border-b px-4 font-medium tabular-nums">
                      {product.price}
                    </td>
                    <td className="border-r border-b px-4">
                      {product.interval}
                    </td>
                    <td className="border-r border-b px-4 tabular-nums">
                      {product.customers.toLocaleString()}
                    </td>
                    <td className="border-r border-b px-4 font-medium tabular-nums">
                      {product.revenue}
                    </td>
                    <td
                      className={cn(
                        "border-r border-b px-4 font-medium tabular-nums",
                        product.growth.startsWith("-")
                          ? "text-red-600"
                          : "text-emerald-600",
                      )}
                    >
                      {product.growth}
                    </td>
                    <td className="border-b px-4">
                      <HealthBadge health={product.health} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-muted-foreground grid h-40 place-items-center text-sm">
              No subscriptions match these filters.
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
