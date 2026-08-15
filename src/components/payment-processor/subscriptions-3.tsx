"use client";

import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Radio,
  Search,
  X,
} from "lucide-react";
import * as React from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type SubscriptionState = "active" | "trialing" | "past_due" | "paused";

type SubscriptionRecord = {
  id: string;
  customer: string;
  email: string;
  plan: string;
  interval: "MONTHLY" | "YEARLY";
  state: SubscriptionState;
  amount: string;
  nextPayment: string;
  method: string;
  health: number;
};

const subscriptions: SubscriptionRecord[] = [
  {
    id: "sub_8qL2nV5xR0pH",
    customer: "Avery Stone",
    email: "avery.stone@northledger.io",
    plan: "PRO",
    interval: "MONTHLY",
    state: "active",
    amount: "$29.00",
    nextPayment: "JUN 30 09:24",
    method: "VISA •4928",
    health: 100,
  },
  {
    id: "sub_3vC9aT1mQ6rY",
    customer: "Juniper Labs",
    email: "billing@juniperlabs.dev",
    plan: "TEAM",
    interval: "YEARLY",
    state: "active",
    amount: "$348.00",
    nextPayment: "MAY 18 14:11",
    method: "ACH •7710",
    health: 100,
  },
  {
    id: "sub_9dN4kX7pB2tU",
    customer: "Maya Chen",
    email: "maya.chen@solstice.co",
    plan: "STUDIO",
    interval: "MONTHLY",
    state: "past_due",
    amount: "$79.00",
    nextPayment: "RETRY 16:48",
    method: "MC •1882",
    health: 42,
  },
  {
    id: "sub_1pG8wL0zK5nV",
    customer: "Drift Supply",
    email: "accounts@driftsupply.com",
    plan: "STARTER",
    interval: "MONTHLY",
    state: "trialing",
    amount: "$12.00",
    nextPayment: "TODAY 18:05",
    method: "AMEX •3007",
    health: 82,
  },
  {
    id: "sub_6hW2sA9qT4mN",
    customer: "Theo Ramirez",
    email: "theo.ramirez@fieldnote.app",
    plan: "AGENCY",
    interval: "YEARLY",
    state: "active",
    amount: "$1,188.00",
    nextPayment: "APR 04 11:36",
    method: "WIRE •8841",
    health: 96,
  },
  {
    id: "sub_5kR0pD8vL3xQ",
    customer: "Orbit Kitchen",
    email: "finance@orbitkitchen.co",
    plan: "COMPONENTS",
    interval: "MONTHLY",
    state: "paused",
    amount: "$19.00",
    nextPayment: "PAUSED",
    method: "VISA •7712",
    health: 66,
  },
  {
    id: "sub_2mJ6cV9nW1qL",
    customer: "Priya Nair",
    email: "priya.nair@evermint.in",
    plan: "PRO",
    interval: "MONTHLY",
    state: "active",
    amount: "$29.00",
    nextPayment: "JUN 22 19:17",
    method: "UPI •0418",
    health: 100,
  },
  {
    id: "sub_7tE1qK4xY9rC",
    customer: "Harbor Nine",
    email: "receipts@harbornine.com",
    plan: "PRO",
    interval: "MONTHLY",
    state: "active",
    amount: "$29.00",
    nextPayment: "JUN 14 12:40",
    method: "APPLE PAY",
    health: 92,
  },
  {
    id: "sub_0aF3yM8dV6hR",
    customer: "Nolan Pierce",
    email: "nolan@redwoodmetrics.ai",
    plan: "TEAM",
    interval: "YEARLY",
    state: "active",
    amount: "$348.00",
    nextPayment: "MAR 02 05:08",
    method: "VISA •2250",
    health: 88,
  },
];

const liveEvents = [
  {
    score: 100,
    plan: "PRO",
    time: "JUST NOW",
    customer: "Harbor Nine",
    detail: "$29.00 captured · Visa •7712",
    latency: "824ms",
    reference: "ch_8z1f",
  },
  {
    score: 100,
    plan: "TEAM",
    time: "12 SEC",
    customer: "Juniper Labs",
    detail: "$348.00 invoice paid · ACH",
    latency: "1.4s",
    reference: "in_4px2",
  },
  {
    score: 42,
    plan: "STUDIO",
    time: "31 SEC",
    customer: "Maya Chen",
    detail: "$79.00 failed · retry scheduled",
    latency: "692ms",
    reference: "pi_9dm4",
  },
  {
    score: 100,
    plan: "PRO",
    time: "1 MIN",
    customer: "Priya Nair",
    detail: "$29.00 mandate confirmed · UPI",
    latency: "1.1s",
    reference: "ch_2mj6",
  },
];

const metrics = [
  { label: "MRR", value: "$73,306", accent: "emerald" },
  { label: "ACTIVE SUBSCRIPTIONS", value: "2,698", accent: "sky" },
  { label: "RENEWALS / HOUR", value: "84", accent: "violet" },
  { label: "RECOVERED REVENUE", value: "$18,940", accent: "amber" },
  { label: "TRIAL CONVERSION", value: "68.2%", accent: "rose" },
] as const;

const stateLabel: Record<SubscriptionState, string> = {
  active: "ACTIVE",
  trialing: "TRIAL",
  past_due: "PAST DUE",
  paused: "PAUSED",
};

const squaredBadgeTone = {
  healthy:
    "border-emerald-600/20 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-900/30 dark:text-emerald-400",
  warning:
    "border-red-600/20 bg-red-50 text-red-700 dark:border-red-400/20 dark:bg-red-900/25 dark:text-red-400",
  trial:
    "border-sky-600/20 bg-sky-50 text-sky-700 dark:border-sky-400/20 dark:bg-sky-900/25 dark:text-sky-400",
  muted: "border-border bg-muted/40 text-muted-foreground",
} as const;

function Score({ value }: { value: number }) {
  const healthy = value >= 80;
  return (
    <span
      className={cn(
        "inline-flex min-w-16 justify-center border px-2 py-1 text-xs font-semibold tabular-nums",
        healthy ? squaredBadgeTone.healthy : squaredBadgeTone.warning,
      )}
    >
      {value}/100
    </span>
  );
}

export function PaymentProcessorSubscriptions3() {
  const [query, setQuery] = React.useState("");
  const [plan, setPlan] = React.useState("ALL PLANS");
  const [state, setState] = React.useState("ALL STATES");
  const [live, setLive] = React.useState(true);

  const filteredSubscriptions = React.useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return subscriptions.filter((subscription) => {
      const matchesQuery =
        !normalized ||
        subscription.customer.toLowerCase().includes(normalized) ||
        subscription.email.toLowerCase().includes(normalized) ||
        subscription.id.toLowerCase().includes(normalized);
      const matchesPlan = plan === "ALL PLANS" || subscription.plan === plan;
      const matchesState =
        state === "ALL STATES" || stateLabel[subscription.state] === state;
      return matchesQuery && matchesPlan && matchesState;
    });
  }, [plan, query, state]);

  return (
    <main className="bg-background text-foreground min-h-0 flex-1 overflow-auto">
      <div className="min-w-[1080px] font-mono">
        <section className="border-b">
          <nav className="bg-background border-b">
            <div className="flex min-w-full items-center gap-6 overflow-x-auto px-6">
              {["Overview", "Plans", "Subscribers", "Recovery"].map((item) => (
                <button
                  key={item}
                  className={cn(
                    "text-muted-foreground inline-flex h-12 shrink-0 items-center border-b-2 border-transparent text-sm font-semibold transition-colors",
                    item === "Subscribers"
                      ? "border-foreground text-foreground"
                      : "hover:text-foreground",
                  )}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
          </nav>

          <header className="bg-muted/20 flex items-center justify-between px-6 py-5">
            <div>
              <h1 className="text-foreground text-lg font-semibold tracking-tight">
                Subscriptions
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Monitor subscriber status, renewals, and billing recovery.
              </p>
            </div>
            <button
              className="text-muted-foreground flex items-center gap-2 text-xs"
              onClick={() => setLive((current) => !current)}
              type="button"
            >
              <span
                className={cn(
                  "size-2",
                  live ? "bg-emerald-500" : "bg-muted-foreground",
                )}
              />
              {live ? "LIVE" : "PAUSED"}
            </button>
          </header>
        </section>

        <section className="grid grid-cols-5 gap-3 px-6 pt-5">
          {metrics.map((metric) => (
            <article
              key={metric.label}
              className="border-border bg-muted/10 flex min-h-28 items-center justify-between border px-5"
            >
              <div>
                <div className="text-foreground/85 flex items-center gap-2 text-xs">
                  <span
                    className={cn(
                      "size-2",
                      metric.accent === "emerald" && "bg-emerald-400",
                      metric.accent === "sky" && "bg-sky-400",
                      metric.accent === "violet" && "bg-violet-400",
                      metric.accent === "amber" && "bg-amber-300",
                      metric.accent === "rose" && "bg-rose-400",
                    )}
                  />
                  {metric.label}
                </div>
                <p className="text-foreground mt-4 text-2xl tracking-tight tabular-nums">
                  {metric.value}
                </p>
              </div>
            </article>
          ))}
        </section>

        <div className="grid grid-cols-[minmax(0,1fr)_360px] gap-4 px-6 py-5">
          <section className="min-w-0">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-foreground text-base font-semibold">
                SUBSCRIBER ACCOUNTS
              </h1>
              <div className="flex items-center gap-2">
                <button
                  className="border-border text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground flex h-9 items-center gap-2 border px-4 text-xs"
                  type="button"
                >
                  <Download className="size-4" />
                  EXPORT
                </button>
                <button
                  className={cn(
                    "flex h-9 items-center gap-2 border px-4 text-xs",
                    live
                      ? "border-emerald-500/20 text-emerald-400"
                      : "border-border text-muted-foreground",
                  )}
                  onClick={() => setLive((current) => !current)}
                  type="button"
                >
                  <Radio className="size-4" />
                  LIVE FEED
                </button>
              </div>
            </div>

            <div className="border-border bg-muted/15 mb-4 flex flex-wrap items-end gap-3 border px-3 py-3">
              <label className="min-w-72 flex-1">
                <span className="text-muted-foreground mb-1.5 block text-[10px]">
                  SEARCH
                </span>
                <div className="relative min-w-0">
                  <Search className="text-muted-foreground/70 absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input
                    className="rounded-none pl-9 text-xs shadow-none"
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Customer, email, ID..."
                    value={query}
                  />
                </div>
              </label>
              <label className="w-40 min-w-0">
                <span className="text-muted-foreground mb-1.5 block text-[10px]">
                  PLAN
                </span>
                <Select onValueChange={setPlan} value={plan}>
                  <SelectTrigger className="rounded-none text-xs shadow-none">
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {[
                        "ALL PLANS",
                        "PRO",
                        "TEAM",
                        "STUDIO",
                        "STARTER",
                        "AGENCY",
                      ].map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </label>
              <label className="w-40 min-w-0">
                <span className="text-muted-foreground mb-1.5 block text-[10px]">
                  STATUS
                </span>
                <Select onValueChange={setState} value={state}>
                  <SelectTrigger className="rounded-none text-xs shadow-none">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {[
                        "ALL STATES",
                        "ACTIVE",
                        "TRIAL",
                        "PAST DUE",
                        "PAUSED",
                      ].map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </label>
            </div>

            <div className="border-border mt-4 overflow-hidden border">
              <table className="w-full table-fixed text-left text-xs">
                <thead className="border-border bg-muted/40 text-muted-foreground border-b">
                  <tr>
                    <th className="w-[11%] px-3 py-3 font-normal">HEALTH</th>
                    <th className="w-[24%] px-3 py-3 font-normal">CUSTOMER</th>
                    <th className="w-[11%] px-3 py-3 font-normal">PLAN</th>
                    <th className="w-[11%] px-3 py-3 font-normal">STATE</th>
                    <th className="w-[11%] px-3 py-3 font-normal">AMOUNT</th>
                    <th className="w-[14%] px-3 py-3 font-normal">
                      NEXT BILLING
                    </th>
                    <th className="w-[12%] px-3 py-3 font-normal">METHOD</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscriptions.map((subscription) => (
                    <tr
                      key={subscription.id}
                      className="border-border/60 hover:bg-muted/40 border-b transition-colors last:border-b-0"
                    >
                      <td className="px-3 py-4">
                        <Score value={subscription.health} />
                      </td>
                      <td className="px-3 py-4">
                        <p className="text-foreground truncate text-sm">
                          {subscription.customer}
                        </p>
                        <p className="text-muted-foreground/70 mt-1 truncate text-[10px]">
                          {subscription.email}
                        </p>
                      </td>
                      <td className="text-foreground/85 px-3 py-4">
                        {subscription.plan}
                        <span className="text-muted-foreground/70 mt-1 block text-[10px]">
                          {subscription.interval}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <span
                          className={cn(
                            "inline-flex border px-2 py-1 text-[10px]",
                            subscription.state === "active" &&
                              squaredBadgeTone.healthy,
                            subscription.state === "trialing" &&
                              squaredBadgeTone.trial,
                            subscription.state === "past_due" &&
                              squaredBadgeTone.warning,
                            subscription.state === "paused" &&
                              squaredBadgeTone.muted,
                          )}
                        >
                          {stateLabel[subscription.state]}
                        </span>
                      </td>
                      <td className="text-foreground px-3 py-4 tabular-nums">
                        {subscription.amount}
                      </td>
                      <td className="text-muted-foreground px-3 py-4">
                        {subscription.nextPayment}
                      </td>
                      <td className="text-muted-foreground px-3 py-4">
                        {subscription.method}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredSubscriptions.length === 0 ? (
                <div className="text-muted-foreground/70 grid h-40 place-items-center text-xs">
                  NO SUBSCRIPTIONS MATCH CURRENT FILTERS
                </div>
              ) : null}
            </div>

            <footer className="text-muted-foreground/70 mt-4 flex items-center justify-between text-xs">
              <span>
                SHOWING 1-{filteredSubscriptions.length} OF 2,746 SUBSCRIPTIONS
              </span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <button
                    aria-label="Previous page"
                    className="border-border grid size-8 place-items-center border"
                    type="button"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  {[1, 2, 3, 4, 5].map((page) => (
                    <button
                      key={page}
                      className={cn(
                        "size-8 border",
                        page === 1
                          ? "border-foreground/50 text-foreground"
                          : "border-border",
                      )}
                      type="button"
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    aria-label="Next page"
                    className="border-border grid size-8 place-items-center border"
                    type="button"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
                <span className="border-border border-l pl-3">
                  PAGE 1 / 230
                </span>
              </div>
            </footer>
          </section>

          <aside className="border-border bg-muted/15 border">
            <div className="border-border flex h-14 items-center justify-between border-b px-4">
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <span className="size-2 bg-emerald-600 dark:bg-emerald-400" />
                LIVE BILLING EVENTS
              </div>
              <Activity className="text-muted-foreground/70 size-4" />
            </div>
            <div className="space-y-3 p-3">
              {liveEvents.map((event) => (
                <article
                  key={event.reference}
                  className="border-border bg-background border p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Score value={event.score} />
                      <span className="text-muted-foreground text-xs">
                        {event.plan}
                      </span>
                    </div>
                    <div className="text-muted-foreground/70 flex items-center gap-3 text-[10px]">
                      {event.time}
                      <X className="size-3" />
                    </div>
                  </div>
                  <p className="text-foreground mt-5 truncate text-sm">
                    {event.customer}
                  </p>
                  <p className="text-muted-foreground mt-2 text-xs">
                    {event.detail}
                  </p>
                  <div className="text-muted-foreground/70 mt-3 flex items-center gap-4 text-[10px]">
                    <span className="flex items-center gap-1">
                      <Clock3 className="size-3" />
                      {event.latency}
                    </span>
                    <span># {event.reference}</span>
                  </div>
                  <button
                    className="border-border text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground mt-4 h-9 w-full border text-xs"
                    type="button"
                  >
                    VIEW EVENT DETAILS
                  </button>
                </article>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
