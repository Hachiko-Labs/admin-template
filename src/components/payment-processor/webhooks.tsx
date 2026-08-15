"use client";

import {
  Activity,
  ArrowUpRight,
  Building2,
  CircleAlert,
  CircleCheck,
  FileJson,
  KeyRound,
  Link2,
  ListFilter,
  LoaderCircle,
  Pause,
  Plus,
  Power,
  RefreshCw,
  ShieldCheck,
  Webhook,
  X,
} from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EndpointHealth = "healthy" | "degraded" | "failing" | "paused";
type EndpointMode = "live" | "test";
type ListTab = "endpoints" | "deliveries" | "event-types";

type Endpoint = {
  id: string;
  url: string;
  host: string;
  owner: string;
  team: string;
  description: string;
  events: string[];
  health: EndpointHealth;
  mode: EndpointMode;
  state: string;
  lastEventId: string;
  lastEventType: string;
  lastAttempt: string;
  successRate: number;
  checksPassing: number;
  checksTotal: number;
  lastResponse: string;
  secretId: string;
};

type Delivery = {
  id: string;
  eventType: string;
  endpointHost: string;
  status: "delivered" | "retrying" | "failed";
  responseCode: string;
  attempt: string;
  latency: string;
  sentAt: string;
};

type EventType = {
  id: string;
  name: string;
  description: string;
  endpoints: number;
  volume: string;
  failureRate: string;
};

type ActivityEntry = {
  id: string;
  title: string;
  timestamp: string;
  tone: "success" | "muted";
  tag?: string;
  body?: string;
  attachment?: { name: string; size: string };
};

const healthMeta: Record<
  EndpointHealth,
  { label: string; dot: string; badge: string }
> = {
  healthy: {
    label: "Healthy",
    dot: "bg-emerald-500",
    badge:
      "border-emerald-600/20 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  degraded: {
    label: "Degraded",
    dot: "bg-amber-500",
    badge:
      "border-amber-600/20 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-900/30 dark:text-amber-400",
  },
  failing: {
    label: "Failing",
    dot: "bg-rose-500",
    badge:
      "border-rose-600/20 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-900/30 dark:text-rose-400",
  },
  paused: {
    label: "Paused",
    dot: "bg-zinc-400",
    badge:
      "border-zinc-300 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-300",
  },
};

const deliveryMeta: Record<
  Delivery["status"],
  { label: string; badge: string }
> = {
  delivered: {
    label: "Delivered",
    badge:
      "border-emerald-600/20 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  retrying: {
    label: "Retrying",
    badge:
      "border-amber-600/20 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-900/30 dark:text-amber-400",
  },
  failed: {
    label: "Failed",
    badge:
      "border-rose-600/20 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-900/30 dark:text-rose-400",
  },
};

const listTabs: { value: ListTab; label: string; icon: typeof Webhook }[] = [
  { value: "endpoints", label: "Endpoints", icon: Webhook },
  { value: "deliveries", label: "Deliveries", icon: Activity },
  { value: "event-types", label: "Event types", icon: FileJson },
];

const recommendedActions = [
  "Review failures",
  "Widen retries",
  "Rotate secrets",
];

const stabilityMeters = [
  { label: "Retry backlog", score: 35 },
  { label: "Latency volatility", score: 63 },
  { label: "Signature failures", score: 17 },
];

const lifecycleStages = [
  { label: "Queued", value: 1284, tone: "bg-primary" },
  { label: "Sending", value: 842, tone: "bg-primary/80" },
  { label: "Delivered", value: 9412, tone: "bg-primary/60" },
  { label: "Retrying", value: 121, tone: "bg-primary/40" },
  { label: "Failed", value: 32, tone: "bg-primary/20" },
];

const endpoints: Endpoint[] = [
  {
    id: "we_8241",
    url: "https://api.northline.studio/hooks/billing",
    host: "api.northline.studio",
    owner: "Priya Raman",
    team: "Northline Studio",
    description:
      "Receives invoice and subscription lifecycle events for the billing service.",
    events: ["invoice.paid", "invoice.payment_failed", "customer.updated"],
    health: "healthy",
    mode: "live",
    state: "Enabled",
    lastEventId: "evt_8241",
    lastEventType: "invoice.paid",
    lastAttempt: "2h ago",
    successRate: 99.4,
    checksPassing: 6,
    checksTotal: 6,
    lastResponse: "200 OK",
    secretId: "whsec_9f2b…4c71",
  },
  {
    id: "we_8236",
    url: "https://hooks.veldco.com/payments",
    host: "hooks.veldco.com",
    owner: "Marcus Feld",
    team: "Veld & Co",
    description:
      "Fans payment events into the internal ledger and revenue reporting jobs.",
    events: ["charge.succeeded", "charge.refunded", "payout.paid"],
    health: "degraded",
    mode: "live",
    state: "Retrying",
    lastEventId: "evt_8236",
    lastEventType: "charge.refunded",
    lastAttempt: "18m ago",
    successRate: 94.1,
    checksPassing: 4,
    checksTotal: 6,
    lastResponse: "504 Gateway Timeout",
    secretId: "whsec_31ad…8e02",
  },
  {
    id: "we_8229",
    url: "https://ops.kairosvs.com/api/webhooks/stripe",
    host: "ops.kairosvs.com",
    owner: "Dana Whitmore",
    team: "Kairos Ventures",
    description:
      "Syncs subscription state into the customer success workspace.",
    events: [
      "subscription.created",
      "subscription.updated",
      "subscription.deleted",
      "invoice.upcoming",
    ],
    health: "failing",
    mode: "live",
    state: "Failing",
    lastEventId: "evt_8229",
    lastEventType: "subscription.updated",
    lastAttempt: "6m ago",
    successRate: 61.8,
    checksPassing: 2,
    checksTotal: 6,
    lastResponse: "401 Unauthorized",
    secretId: "whsec_77c4…12ff",
  },
  {
    id: "we_8214",
    url: "https://staging.emberdigital.co/hooks/test",
    host: "staging.emberdigital.co",
    owner: "Jules Okafor",
    team: "Ember Digital",
    description: "Sandbox endpoint used for replaying events during QA runs.",
    events: ["invoice.created", "checkout.session.completed"],
    health: "healthy",
    mode: "test",
    state: "Enabled",
    lastEventId: "evt_8214",
    lastEventType: "checkout.session.completed",
    lastAttempt: "1d ago",
    successRate: 98.7,
    checksPassing: 5,
    checksTotal: 6,
    lastResponse: "200 OK",
    secretId: "whsec_5b09…aa38",
  },
  {
    id: "we_8190",
    url: "https://ledger.quarryinterface.com/inbound",
    host: "ledger.quarryinterface.com",
    owner: "Sam Ortega",
    team: "Quarry Interface",
    description: "Archives raw event payloads for the reconciliation pipeline.",
    events: ["payout.paid", "payout.failed", "balance.available"],
    health: "paused",
    mode: "live",
    state: "Paused",
    lastEventId: "evt_8190",
    lastEventType: "payout.paid",
    lastAttempt: "3d ago",
    successRate: 97.2,
    checksPassing: 3,
    checksTotal: 6,
    lastResponse: "—",
    secretId: "whsec_2e6d…90b5",
  },
];

const deliveries: Delivery[] = [
  {
    id: "evt_8241",
    eventType: "invoice.paid",
    endpointHost: "api.northline.studio",
    status: "delivered",
    responseCode: "200",
    attempt: "Attempt 1",
    latency: "184 ms",
    sentAt: "2h ago",
  },
  {
    id: "evt_8236",
    eventType: "charge.refunded",
    endpointHost: "hooks.veldco.com",
    status: "retrying",
    responseCode: "504",
    attempt: "Attempt 3 of 6",
    latency: "30.0 s",
    sentAt: "18m ago",
  },
  {
    id: "evt_8229",
    eventType: "subscription.updated",
    endpointHost: "ops.kairosvs.com",
    status: "failed",
    responseCode: "401",
    attempt: "Attempt 6 of 6",
    latency: "92 ms",
    sentAt: "6m ago",
  },
  {
    id: "evt_8221",
    eventType: "payout.paid",
    endpointHost: "ledger.quarryinterface.com",
    status: "delivered",
    responseCode: "202",
    attempt: "Attempt 1",
    latency: "311 ms",
    sentAt: "5h ago",
  },
  {
    id: "evt_8214",
    eventType: "checkout.session.completed",
    endpointHost: "staging.emberdigital.co",
    status: "delivered",
    responseCode: "200",
    attempt: "Attempt 2 of 6",
    latency: "402 ms",
    sentAt: "1d ago",
  },
];

const eventTypes: EventType[] = [
  {
    id: "invoice.paid",
    name: "invoice.paid",
    description: "Emitted when an invoice is fully collected.",
    endpoints: 4,
    volume: "3,182 / 24h",
    failureRate: "0.4%",
  },
  {
    id: "charge.refunded",
    name: "charge.refunded",
    description: "Emitted when a charge is refunded in part or in full.",
    endpoints: 3,
    volume: "412 / 24h",
    failureRate: "5.8%",
  },
  {
    id: "subscription.updated",
    name: "subscription.updated",
    description: "Emitted when a plan, quantity, or seat count changes.",
    endpoints: 5,
    volume: "1,904 / 24h",
    failureRate: "12.1%",
  },
  {
    id: "payout.paid",
    name: "payout.paid",
    description: "Emitted when a payout lands in the connected bank account.",
    endpoints: 2,
    volume: "96 / 24h",
    failureRate: "0.0%",
  },
];

const activityByEndpoint: Record<string, ActivityEntry[]> = {
  we_8241: [
    {
      id: "act-1",
      title: "Delivery succeeded for invoice.paid",
      timestamp: "now",
      tone: "success",
      body: '{ "id": "evt_8241", "type": "invoice.paid", "livemode": true }',
    },
    {
      id: "act-2",
      title: "Signature verified with whsec_9f2b…4c71",
      timestamp: "2h",
      tone: "muted",
    },
    {
      id: "act-3",
      title: "Event payload queued",
      timestamp: "1d",
      tone: "muted",
      tag: "Replay",
      attachment: { name: "invoice-paid-payload.json", size: "4KB" },
    },
    {
      id: "act-4",
      title: "Endpoint created by Priya Raman",
      timestamp: "12d",
      tone: "muted",
    },
  ],
  we_8236: [
    {
      id: "act-1",
      title: "Attempt 3 timed out after 30s",
      timestamp: "18m",
      tone: "muted",
      body: "504 Gateway Timeout — no response body received",
    },
    {
      id: "act-2",
      title: "Retry scheduled for 14:20 UTC",
      timestamp: "18m",
      tone: "muted",
      tag: "Retry",
    },
    {
      id: "act-3",
      title: "Delivery succeeded for payout.paid",
      timestamp: "5h",
      tone: "success",
    },
  ],
  we_8229: [
    {
      id: "act-1",
      title: "Attempt 6 rejected — signature mismatch",
      timestamp: "6m",
      tone: "muted",
      body: "401 Unauthorized — signing secret rotated without redeploy",
    },
    {
      id: "act-2",
      title: "Retry budget exhausted",
      timestamp: "6m",
      tone: "muted",
      tag: "Failed",
    },
    {
      id: "act-3",
      title: "Signing secret rotated by Dana Whitmore",
      timestamp: "2d",
      tone: "muted",
    },
  ],
  we_8214: [
    {
      id: "act-1",
      title: "Delivery succeeded for checkout.session.completed",
      timestamp: "1d",
      tone: "success",
      body: '{ "id": "evt_8214", "livemode": false }',
    },
    {
      id: "act-2",
      title: "Test event replayed from dashboard",
      timestamp: "1d",
      tone: "muted",
      tag: "Replay",
    },
  ],
  we_8190: [
    {
      id: "act-1",
      title: "Endpoint paused by Sam Ortega",
      timestamp: "3d",
      tone: "muted",
    },
    {
      id: "act-2",
      title: "Delivery succeeded for payout.paid",
      timestamp: "3d",
      tone: "success",
    },
  ],
};

const deliveryIntegrity = {
  baseline: 96.4,
  target: 99.5,
  current: 97.2,
};

function SegmentedRateBar({ value }: { value: number }) {
  const totalTicks = 34;
  const activeTicks = Math.round((value / 100) * totalTicks);

  return (
    <div
      aria-label={`${value}% of deliveries succeeded`}
      className="flex items-center gap-[3px]"
      role="img"
    >
      {Array.from({ length: totalTicks }, (_, index) => (
        <span
          className={cn(
            "h-4 w-1 rounded-full",
            index < activeTicks ? "bg-emerald-500" : "bg-muted-foreground/20",
          )}
          key={index}
        />
      ))}
    </div>
  );
}

function MeterDots({ score }: { score: number }) {
  const filled = Math.max(1, Math.round(score / 20));

  return (
    <div
      aria-label={`${score} out of 100`}
      className="flex items-center gap-1"
      role="img"
    >
      {Array.from({ length: 5 }, (_, index) => (
        <span
          className={cn(
            "h-2.5 w-3 rounded-[3px]",
            index < filled ? "bg-primary" : "bg-muted-foreground/20",
          )}
          key={index}
        />
      ))}
    </div>
  );
}

function StatCard({
  children,
  icon: Icon,
  title,
}: {
  children: React.ReactNode;
  icon: typeof Webhook;
  title: string;
}) {
  return (
    <div className="flex flex-col rounded-xl border">
      <div className="flex items-center gap-2 px-4 pt-3 pb-2">
        <Icon aria-hidden="true" className="text-muted-foreground size-4" />
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <div className="flex flex-1 flex-col justify-center px-4 pb-3">
        {children}
      </div>
    </div>
  );
}

function FilterChip({
  label,
  onClear,
  value,
}: {
  label: string;
  onClear: () => void;
  value: string;
}) {
  return (
    <span className="bg-background inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border pr-1 pl-3 text-[13px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
      <Button
        className="text-muted-foreground hover:text-foreground size-6 rounded-sm"
        onClick={onClear}
        size="icon"
        type="button"
        variant="ghost"
      >
        <X aria-hidden="true" className="size-3.5" />
        <span className="sr-only">Clear {label} filter</span>
      </Button>
    </span>
  );
}

function EndpointRow({
  endpoint,
  isActive,
  onSelect,
}: {
  endpoint: Endpoint;
  isActive: boolean;
  onSelect: () => void;
}) {
  const meta = healthMeta[endpoint.health];
  const visibleEvents = endpoint.events.slice(0, 2);
  const extraEvents = endpoint.events.length - visibleEvents.length;

  return (
    <button
      className={cn(
        "grid w-full grid-cols-[minmax(0,1fr)_auto] items-start gap-4 border-b px-4 py-4 text-left transition-colors last:border-b-0",
        "hover:bg-muted/30",
        isActive && "bg-muted/40",
      )}
      onClick={onSelect}
      type="button"
    >
      <div className="min-w-0">
        <p className="truncate font-mono text-sm font-medium">
          {endpoint.host}
        </p>
        <p className="text-muted-foreground mt-1.5 flex min-w-0 items-center gap-1.5 text-xs">
          <Building2 aria-hidden="true" className="size-3.5 shrink-0" />
          <span className="truncate">{endpoint.team}</span>
        </p>
        <p className="text-muted-foreground mt-1 flex min-w-0 items-center gap-1.5 text-xs">
          <Activity aria-hidden="true" className="size-3.5 shrink-0" />
          <span className="truncate font-mono">
            {visibleEvents.join(", ")}
            {extraEvents > 0 ? ` +${extraEvents}` : ""}
          </span>
        </p>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-2 text-xs">
          <span className={cn("size-2 rounded-full", meta.dot)} />
          <span className="font-medium">{meta.label}</span>
          <span className="text-muted-foreground" aria-hidden="true">
            ·
          </span>
          <span className="text-muted-foreground inline-flex items-center gap-0.5 font-mono underline underline-offset-2">
            {endpoint.lastEventId}
            <ArrowUpRight aria-hidden="true" className="size-3" />
          </span>
          <span className="text-muted-foreground" aria-hidden="true">
            ·
          </span>
          <span className="text-muted-foreground whitespace-nowrap">
            {endpoint.lastAttempt}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge
            className="h-5 rounded-md px-1.5 text-[11px] font-medium capitalize shadow-none"
            variant="secondary"
          >
            {endpoint.mode}
          </Badge>
          <Badge
            className={cn(
              "h-5 rounded-md px-1.5 text-[11px] font-medium shadow-none",
              meta.badge,
            )}
            variant="outline"
          >
            {endpoint.state}
          </Badge>
        </div>
      </div>
    </button>
  );
}

function DeliveryRow({ delivery }: { delivery: Delivery }) {
  const meta = deliveryMeta[delivery.status];

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 border-b px-4 py-4 last:border-b-0">
      <div className="min-w-0">
        <p className="truncate font-mono text-sm font-medium">
          {delivery.eventType}
        </p>
        <p className="text-muted-foreground mt-1.5 flex min-w-0 items-center gap-1.5 text-xs">
          <Link2 aria-hidden="true" className="size-3.5 shrink-0" />
          <span className="truncate font-mono">{delivery.endpointHost}</span>
        </p>
        <p className="text-muted-foreground mt-1 font-mono text-xs">
          {delivery.id}
        </p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <Badge
          className={cn(
            "h-5 rounded-md px-1.5 text-[11px] font-medium shadow-none",
            meta.badge,
          )}
          variant="outline"
        >
          {meta.label}
        </Badge>
        <p className="text-muted-foreground text-xs tabular-nums">
          HTTP {delivery.responseCode} · {delivery.latency}
        </p>
        <p className="text-muted-foreground text-xs">
          {delivery.attempt} · {delivery.sentAt}
        </p>
      </div>
    </div>
  );
}

function EventTypeRow({ eventType }: { eventType: EventType }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 border-b px-4 py-4 last:border-b-0">
      <div className="min-w-0">
        <p className="truncate font-mono text-sm font-medium">
          {eventType.name}
        </p>
        <p className="text-muted-foreground mt-1.5 text-xs">
          {eventType.description}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <p className="text-xs font-medium tabular-nums">{eventType.volume}</p>
        <p className="text-muted-foreground text-xs tabular-nums">
          {eventType.endpoints} endpoints
        </p>
        <p className="text-muted-foreground text-xs tabular-nums">
          {eventType.failureRate} failing
        </p>
      </div>
    </div>
  );
}

function DetailRow({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div className="grid grid-cols-[8rem_minmax(0,1fr)] items-center gap-3">
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className="min-w-0 text-sm">{children}</dd>
    </div>
  );
}

function ActivityItem({ entry }: { entry: ActivityEntry }) {
  return (
    <li className="relative pb-6 pl-7 last:pb-0">
      <span
        aria-hidden="true"
        className="bg-border absolute top-5 bottom-0 left-[7px] w-px last:hidden"
      />
      {entry.tone === "success" ? (
        <CircleCheck
          aria-hidden="true"
          className="absolute top-0.5 left-0 size-4 text-emerald-600 dark:text-emerald-400"
        />
      ) : (
        <CircleCheck
          aria-hidden="true"
          className="text-muted-foreground/50 absolute top-0.5 left-0 size-4"
        />
      )}

      <div className="flex flex-wrap items-center gap-2">
        {entry.tag ? (
          <Badge
            className="h-5 rounded-md px-1.5 text-[11px] font-medium shadow-none"
            variant="secondary"
          >
            {entry.tag}
          </Badge>
        ) : null}
        <p className="text-sm">{entry.title}</p>
        <span className="text-muted-foreground text-xs">{entry.timestamp}</span>
      </div>

      {entry.body ? (
        <div className="bg-muted/40 mt-2 overflow-x-auto rounded-lg border px-3 py-2">
          <code className="text-muted-foreground text-xs whitespace-pre">
            {entry.body}
          </code>
        </div>
      ) : null}

      {entry.attachment ? (
        <div className="mt-2 flex items-center gap-3 rounded-lg border p-2.5">
          <div className="bg-muted grid size-9 shrink-0 place-items-center rounded-md border">
            <FileJson
              aria-hidden="true"
              className="text-muted-foreground size-4"
            />
          </div>
          <div className="min-w-0">
            <p className="truncate font-mono text-xs font-medium">
              {entry.attachment.name}
            </p>
            <p className="text-muted-foreground text-xs">
              {entry.attachment.size}
            </p>
          </div>
        </div>
      ) : null}
    </li>
  );
}

function EndpointDetail({
  endpoint,
  onClose,
}: {
  endpoint: Endpoint;
  onClose: () => void;
}) {
  const meta = healthMeta[endpoint.health];
  const entries = activityByEndpoint[endpoint.id] ?? [];

  return (
    <aside className="bg-background flex min-h-0 flex-col overflow-hidden border-t lg:border-t-0 lg:border-l">
      <div className="flex items-center justify-between gap-4 border-b px-5 py-4">
        <p className="text-sm font-semibold">Endpoint Detail</p>
        <Button
          className="text-muted-foreground hover:text-foreground size-7"
          onClick={onClose}
          size="icon"
          type="button"
          variant="ghost"
        >
          <X aria-hidden="true" className="size-4" />
          <span className="sr-only">Close endpoint detail</span>
        </Button>
      </div>

      <div className="vertical-scrollbar min-h-0 flex-1 overflow-y-auto">
        <div className="border-b px-5 py-5">
          <div className="flex items-start gap-3">
            <div className="bg-muted grid size-11 shrink-0 place-items-center rounded-lg border">
              <Webhook aria-hidden="true" className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-mono text-base font-semibold">
                {endpoint.host}
              </p>
              <p className="text-muted-foreground truncate text-sm">
                {endpoint.team} · {endpoint.mode === "live" ? "Live" : "Test"}{" "}
                mode
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="bg-muted/50 inline-flex min-w-0 items-center gap-1.5 rounded-md border px-2 py-1 text-xs">
              <Link2
                aria-hidden="true"
                className="text-muted-foreground size-3.5 shrink-0"
              />
              <span className="truncate font-mono">{endpoint.url}</span>
            </span>
            <span className="bg-muted/50 inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs">
              <KeyRound
                aria-hidden="true"
                className="text-muted-foreground size-3.5 shrink-0"
              />
              <span className="font-mono">{endpoint.secretId}</span>
            </span>
          </div>

          <div className="bg-muted/40 mt-4 rounded-lg border p-3">
            <p className="text-sm font-medium">Description</p>
            <p className="text-muted-foreground mt-1 text-sm leading-5">
              {endpoint.description}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <Button
              className="h-9 rounded-md text-[13px] shadow-none"
              type="button"
              variant="outline"
            >
              <Pause aria-hidden="true" className="size-3.5" />
              Pause
            </Button>
            <Button
              className="h-9 rounded-md text-[13px] shadow-none"
              type="button"
              variant="outline"
            >
              <Power aria-hidden="true" className="size-3.5" />
              Disable
            </Button>
            <Button
              className="h-9 rounded-md text-[13px] shadow-none"
              type="button"
              variant="outline"
            >
              <RefreshCw aria-hidden="true" className="size-3.5" />
              Rotate
            </Button>
          </div>
        </div>

        <dl className="space-y-3 border-b px-5 py-5">
          <DetailRow label="Owner">
            <span className="flex min-w-0 items-center gap-2">
              <span className="bg-muted grid size-6 shrink-0 place-items-center rounded-full border text-[10px] font-semibold">
                {endpoint.owner
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </span>
              <span className="truncate">{endpoint.owner}</span>
            </span>
          </DetailRow>
          <DetailRow label="Status">
            <Badge
              className={cn(
                "h-6 rounded-md px-2 text-[11px] font-medium shadow-none",
                meta.badge,
              )}
              variant="outline"
            >
              {endpoint.state}
            </Badge>
          </DetailRow>
          <DetailRow label="Mode">
            <Badge
              className="h-6 rounded-md px-2 text-[11px] font-medium capitalize shadow-none"
              variant="secondary"
            >
              {endpoint.mode}
            </Badge>
          </DetailRow>
          <DetailRow label="Health checks">
            <span className="flex items-center gap-2">
              <LoaderCircle
                aria-hidden="true"
                className="text-muted-foreground size-3.5"
              />
              {endpoint.checksPassing} of {endpoint.checksTotal} checks passing
            </span>
          </DetailRow>
          <DetailRow label="Success rate">
            <span className="tabular-nums">{endpoint.successRate}%</span>
          </DetailRow>
          <DetailRow label="Last event">
            <span className="min-w-0 truncate font-mono">
              {endpoint.lastEventType}
            </span>
          </DetailRow>
          <DetailRow label="Last response">
            <span className="font-mono">{endpoint.lastResponse}</span>
          </DetailRow>
        </dl>

        <div className="px-5 py-5">
          <p className="text-sm font-semibold">Activity</p>
          <ul className="mt-4">
            {entries.map((entry) => (
              <ActivityItem entry={entry} key={entry.id} />
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}

export function PaymentProcessorWebhooks() {
  const [activeTab, setActiveTab] = React.useState<ListTab>("endpoints");
  const [selectedEndpointId, setSelectedEndpointId] = React.useState(
    endpoints[0].id,
  );
  const [detailOpen, setDetailOpen] = React.useState(true);
  const [modeFilter, setModeFilter] = React.useState<EndpointMode | null>(
    "live",
  );

  const visibleEndpoints = React.useMemo(
    () =>
      endpoints.filter(
        (endpoint) => !modeFilter || endpoint.mode === modeFilter,
      ),
    [modeFilter],
  );

  const selectedEndpoint =
    visibleEndpoints.find((endpoint) => endpoint.id === selectedEndpointId) ??
    visibleEndpoints[0] ??
    endpoints[0];

  const lifecycleTotal = lifecycleStages.reduce(
    (total, stage) => total + stage.value,
    0,
  );

  return (
    <main className="bg-background text-foreground flex min-h-0 flex-1 overflow-hidden">
      <section
        className={cn(
          "grid min-h-0 w-full flex-1 grid-cols-1",
          detailOpen &&
            "lg:grid-cols-[minmax(0,1fr)_minmax(22rem,24rem)] xl:grid-cols-[minmax(0,1fr)_minmax(24rem,26rem)]",
        )}
      >
        <div className="vertical-scrollbar min-h-0 overflow-y-auto">
          <div className="px-5 py-6 lg:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl font-semibold tracking-tight">
                  Webhooks
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                  Monitor endpoint health, delivery attempts, and retries.
                </p>
              </div>
              <Button className="h-9 shrink-0 rounded-md" type="button">
                <Plus aria-hidden="true" className="size-4" />
                Add endpoint
              </Button>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <StatCard icon={ShieldCheck} title="Delivery Integrity">
                <div className="flex items-baseline justify-between gap-3 text-xs">
                  <span className="text-muted-foreground">
                    Baseline{" "}
                    <span className="text-foreground font-medium tabular-nums">
                      {deliveryIntegrity.baseline}%
                    </span>
                  </span>
                  <span className="text-muted-foreground">
                    Target{" "}
                    <span className="text-foreground font-medium tabular-nums">
                      {deliveryIntegrity.target}%
                    </span>
                  </span>
                </div>

                <div className="mt-2">
                  <SegmentedRateBar value={deliveryIntegrity.current} />
                </div>

                <p className="mt-2 text-sm">
                  <span className="font-medium tabular-nums">
                    {deliveryIntegrity.current}%
                  </span>{" "}
                  <span className="text-muted-foreground">
                    delivered on first attempt
                  </span>
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t pt-3">
                  <CircleAlert
                    aria-hidden="true"
                    className="size-3.5 shrink-0 text-amber-500"
                  />
                  <span className="text-muted-foreground mr-1 text-xs">
                    Recommended
                  </span>
                  {recommendedActions.map((action) => (
                    <Button
                      className="h-7 rounded-full px-2.5 text-xs font-medium shadow-none"
                      key={action}
                      type="button"
                      variant="outline"
                    >
                      {action}
                    </Button>
                  ))}
                </div>
              </StatCard>

              <StatCard icon={Activity} title="Endpoint Health">
                <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
                  Events delivered · 24h
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <p className="text-2xl font-semibold tracking-tight tabular-nums">
                    11,691
                  </p>
                  <Badge
                    className="h-5 rounded-full border-emerald-600/20 bg-emerald-50 px-1.5 text-[11px] font-medium text-emerald-700 shadow-none dark:border-emerald-400/20 dark:bg-emerald-900/30 dark:text-emerald-400"
                    variant="outline"
                  >
                    +2.8%
                  </Badge>
                </div>

                <dl className="mt-3 space-y-2 border-t pt-3">
                  {stabilityMeters.map((meter) => (
                    <div
                      className="flex items-center justify-between gap-3"
                      key={meter.label}
                    >
                      <dt className="text-sm">{meter.label}</dt>
                      <dd className="flex items-center gap-3">
                        <MeterDots score={meter.score} />
                        <span className="text-muted-foreground w-14 text-right text-xs tabular-nums">
                          {meter.score}/100
                        </span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </StatCard>
            </div>

            <div className="mt-6 border-b">
              <div className="flex gap-6 overflow-x-auto">
                {listTabs.map((tab) => (
                  <button
                    className={cn(
                      "flex h-11 shrink-0 items-center gap-2 border-b-2 px-1 text-sm font-medium transition-colors",
                      activeTab === tab.value
                        ? "border-primary text-primary"
                        : "text-muted-foreground hover:text-foreground border-transparent",
                    )}
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    type="button"
                  >
                    <tab.icon aria-hidden="true" className="size-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold">Pipeline</p>
              <div className="mt-3 rounded-xl border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <LoaderCircle
                      aria-hidden="true"
                      className="text-muted-foreground size-4"
                    />
                    Delivery lifecycle
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Jun 1 – Jun 19, 2026
                  </p>
                </div>

                <div className="mt-4 flex gap-1.5">
                  {lifecycleStages.map((stage) => (
                    <span
                      className={cn("h-1.5 rounded-full", stage.tone)}
                      key={stage.label}
                      style={{
                        width: `${(stage.value / lifecycleTotal) * 100}%`,
                        minWidth: "6%",
                      }}
                    />
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                  {lifecycleStages.map((stage) => (
                    <div
                      className="flex items-center gap-2 text-sm"
                      key={stage.label}
                    >
                      <span className="text-muted-foreground">
                        {stage.label}
                      </span>
                      <span className="font-medium tabular-nums">
                        {stage.value.toLocaleString("en-US")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold">
                {listTabs.find((tab) => tab.value === activeTab)?.label}
              </p>

              {activeTab === "endpoints" ? (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Button
                    className="h-8 rounded-md text-[13px] font-medium shadow-none"
                    type="button"
                    variant="outline"
                  >
                    <ListFilter aria-hidden="true" className="size-4" />
                    Add filter
                  </Button>
                  {modeFilter ? (
                    <FilterChip
                      label="Mode is"
                      onClear={() => setModeFilter(null)}
                      value={modeFilter === "live" ? "Live" : "Test"}
                    />
                  ) : null}
                </div>
              ) : null}

              <div className="mt-3 overflow-hidden rounded-xl border">
                {activeTab === "endpoints" ? (
                  visibleEndpoints.length > 0 ? (
                    visibleEndpoints.map((endpoint) => (
                      <EndpointRow
                        endpoint={endpoint}
                        isActive={
                          detailOpen && selectedEndpoint.id === endpoint.id
                        }
                        key={endpoint.id}
                        onSelect={() => {
                          setSelectedEndpointId(endpoint.id);
                          setDetailOpen(true);
                        }}
                      />
                    ))
                  ) : (
                    <div className="flex min-h-48 flex-col items-center justify-center px-6 text-center">
                      <div className="bg-muted grid size-12 place-items-center rounded-lg border">
                        <Webhook className="text-muted-foreground size-5" />
                      </div>
                      <p className="mt-4 text-sm font-semibold">
                        No endpoints in this mode
                      </p>
                      <p className="text-muted-foreground mt-1 max-w-72 text-sm">
                        Clear the mode filter to see every registered endpoint.
                      </p>
                    </div>
                  )
                ) : null}

                {activeTab === "deliveries"
                  ? deliveries.map((delivery) => (
                      <DeliveryRow delivery={delivery} key={delivery.id} />
                    ))
                  : null}

                {activeTab === "event-types"
                  ? eventTypes.map((eventType) => (
                      <EventTypeRow eventType={eventType} key={eventType.id} />
                    ))
                  : null}
              </div>
            </div>
          </div>
        </div>

        {detailOpen ? (
          <EndpointDetail
            endpoint={selectedEndpoint}
            onClose={() => setDetailOpen(false)}
          />
        ) : null}
      </section>
    </main>
  );
}
