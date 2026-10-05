"use client";

import { Check, Copy } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

import {
  type ApiRequest,
  copyText,
  formatCost,
  formatMs,
  statusLabel,
} from "./request-data";

function CopyValue({
  value,
  label,
  className,
}: {
  value: string;
  label: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      title={copied ? "Copied" : "Copy value"}
      className={className}
      onClick={(event) => {
        event.stopPropagation();
        void copyText(value)
          .then(() => {
            setCopied(true);
            toast.success("Copied to clipboard");
            clearTimeout(timer.current);
            timer.current = setTimeout(() => setCopied(false), 1200);
          })
          .catch(() => toast.error("Could not access clipboard"));
      }}
    >
      {copied ? <Check /> : <Copy />}
    </Button>
  );
}
export function cellText(row: ApiRequest, column: string): string {
  if (column === "timestamp") return new Date(row.timestamp).toISOString();
  if (column === "tokens") return String(row.input + row.output);
  if (column === "timing")
    return JSON.stringify(
      {
        gateway_ms: 24,
        first_response_ms: Math.max(0, (row.ttft || row.latency) - 24),
        generation_ms: row.ttft ? row.latency - row.ttft : 0,
        total_ms: row.latency,
      },
      null,
      2,
    );
  const value = new Map<string, string | number>([
    ["id", row.id],
    ["source", row.source],
    ["provider", row.provider],
    ["model", row.model],
    ["project", row.project],
    ["environment", row.environment],
    ["status", row.status],
    ["latency", row.latency],
    ["ttft", row.ttft],
    ["input", row.input],
    ["output", row.output],
    ["cost", row.cost],
    ["cache", row.cache],
    ["endpoint", row.endpoint],
    ["key", row.key],
    ["region", row.region],
  ]).get(column);
  return String(value ?? "");
}
function DetailRows({ entries }: { entries: [string, string][] }) {
  return (
    <dl className="flex flex-col gap-1">
      {entries.map(([label, value]) => (
        <div
          key={label}
          className="group/info flex items-center justify-between gap-4 py-0.5"
        >
          <dt className="text-muted-foreground shrink-0 text-xs">{label}</dt>
          <dd className="flex min-w-0 items-center gap-1">
            <span className="text-right font-mono text-xs break-all">
              {value}
            </span>
            <CopyValue
              value={value}
              label={`Copy ${label}`}
              className="shrink-0 opacity-30 group-hover/info:opacity-100 focus-visible:opacity-100"
            />
          </dd>
        </div>
      ))}
    </dl>
  );
}
function CellInformation({
  row,
  column,
  openedAt,
}: {
  row: ApiRequest;
  column: string;
  openedAt: number;
}) {
  if (["timing", "latency", "ttft"].includes(column)) {
    const first = Math.max(24, row.ttft || row.latency);
    const phases = [
      { label: "Gateway", duration: 24, tone: 46 },
      {
        label: row.ttft ? "First token" : "Provider response",
        duration: first - 24,
        tone: 70,
      },
      { label: "Generation", duration: row.latency - first, tone: 100 },
    ];
    return (
      <div className="flex flex-col gap-2.5">
        <div className="flex h-3 overflow-hidden rounded-sm">
          {phases.map((phase) => (
            <span
              key={phase.label}
              style={{
                width: `${(phase.duration / row.latency) * 100}%`,
                background: `color-mix(in oklch, var(--primary) ${phase.tone}%, var(--background))`,
              }}
            />
          ))}
        </div>
        {phases.map((phase) => (
          <div
            key={phase.label}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-4 text-xs"
          >
            <span className="flex items-center gap-2">
              <span
                className="size-2 rounded-sm"
                style={{
                  background: `color-mix(in oklch, var(--primary) ${phase.tone}%, var(--background))`,
                }}
              />
              {phase.label}
            </span>
            <span className="text-muted-foreground font-mono">
              {((phase.duration / row.latency) * 100).toFixed(1)}%
            </span>
            <span className="font-mono">{formatMs(phase.duration)}</span>
          </div>
        ))}
        <div className="mt-1 border-t pt-1">
          <DetailRows entries={[["Total", `${row.latency} ms`]]} />
        </div>
      </div>
    );
  }
  let entries: [string, string][];
  switch (column) {
    case "timestamp": {
      const date = new Date(row.timestamp);
      const minutes = Math.round((row.timestamp - openedAt) / 60000);
      const relative = new Intl.RelativeTimeFormat("en", {
        numeric: "auto",
      }).format(
        Math.abs(minutes) >= 60 ? Math.round(minutes / 60) : minutes,
        Math.abs(minutes) >= 60 ? "hour" : "minute",
      );
      entries = [
        ["UTC", date.toISOString()],
        [
          `Local (${Intl.DateTimeFormat().resolvedOptions().timeZone})`,
          date.toLocaleString("en-GB", { hour12: false }),
        ],
        ["Unix (ms)", String(row.timestamp)],
        ["Relative", relative],
      ];
      break;
    }
    case "id":
      entries = [
        ["Request ID", row.id],
        ["Project", row.project],
        ["Environment", row.environment],
      ];
      break;
    case "model":
    case "provider":
      entries = [
        ["Model", row.model],
        ["Provider", row.provider],
        ["Cache", row.cache],
      ];
      break;
    case "status":
      entries = [
        ["HTTP status", String(row.status)],
        ["Meaning", statusLabel(row.status)],
        ["Retry", row.status === 200 ? "Not needed" : "After 2 seconds"],
      ];
      break;
    case "endpoint":
      entries = [
        ["Method", "POST"],
        ["Endpoint", row.endpoint],
        ["API key", row.key],
      ];
      break;
    case "tokens":
      entries = [
        ["Input", row.input.toLocaleString("en-US")],
        ["Output", row.output.toLocaleString("en-US")],
        ["Total", (row.input + row.output).toLocaleString("en-US")],
      ];
      break;
    case "cost":
      entries = [
        ["Sample cost", formatCost(row.cost)],
        ["Input tokens", String(row.input)],
        ["Output tokens", String(row.output)],
      ];
      break;
    default:
      entries = [[column, cellText(row, column)]];
  }
  return <DetailRows entries={entries} />;
}
export function RequestCell({
  row,
  column,
  label,
  children,
}: {
  row: ApiRequest;
  column: string;
  label: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(0);
  return (
    <HoverCard
      open={open}
      onOpenChange={(value) => {
        if (value) setOpenedAt(Date.now());
        setOpen(value);
      }}
      openDelay={120}
      closeDelay={150}
    >
      <HoverCardTrigger asChild>
        <div
          tabIndex={0}
          aria-label={`${label} details for ${row.id}`}
          className="group/cell focus-visible:ring-ring relative min-w-0 outline-none focus-visible:ring-1"
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
          }}
        >
          <div className={cn("min-w-0", column === "id" && "pr-6")}>
            {children}
          </div>
          <CopyValue
            value={cellText(row, column)}
            label={`Copy ${label} for ${row.id}`}
            className={cn(
              "bg-background absolute top-1/2 right-0 -translate-y-1/2 shadow-sm",
              column !== "id" &&
                "opacity-0 group-focus-within/cell:opacity-100 group-hover/cell:opacity-100",
            )}
          />
        </div>
      </HoverCardTrigger>
      <HoverCardContent
        side="bottom"
        align="start"
        sideOffset={8}
        collisionPadding={12}
        className="w-max max-w-[min(420px,calc(100vw-24px))] min-w-64 p-3"
        role="dialog"
        aria-label={`${label} cell information`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="text-muted-foreground mb-2 text-[10px] font-medium tracking-wide uppercase">
          {label}
        </div>
        {open ? (
          <CellInformation row={row} column={column} openedAt={openedAt} />
        ) : null}
      </HoverCardContent>
    </HoverCard>
  );
}
