"use client";

import { ArrowDown, ArrowUp, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  type ApiRequest,
  copyText,
  formatCost,
  formatMs,
  formatTime,
  requestEvents,
  requestPayload,
  responsePayload,
} from "./request-data";
import { RequestStatus } from "./request-table";

function copy(value: string, message: string) {
  void copyText(value)
    .then(() => toast.success(message))
    .catch(() => toast.error("Could not access clipboard"));
}

export function RequestDetail({
  row,
  position,
  total,
  onClose,
  onNavigate,
}: {
  row: ApiRequest | null;
  position: number;
  total: number;
  onClose: () => void;
  onNavigate: (offset: number) => void;
}) {
  const timing = row
    ? [
        { label: "Gateway", duration: 24, color: "bg-primary/45" },
        {
          label:
            row.status === 200 ? "Time to first token" : "Provider response",
          duration: Math.max(0, (row.ttft || row.latency) - 24),
          color: "bg-primary/70",
        },
        {
          label: "Generation",
          duration: row.ttft ? row.latency - row.ttft : 0,
          color: "bg-primary",
        },
      ]
    : [];
  return (
    <Sheet
      open={!!row}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-[560px]">
        <SheetHeader className="shrink-0 gap-1 border-b px-5 py-4 pr-12 text-left">
          <SheetTitle className="text-sm">Request details</SheetTitle>
          <SheetDescription className="text-xs">
            Inspect a single request through your AI gateway.
          </SheetDescription>
        </SheetHeader>
        {row ? (
          <>
            <div className="flex shrink-0 items-center justify-between border-b px-5 py-2">
              <span className="text-muted-foreground font-mono text-[11px]">
                {row.id}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Copy request ID"
                  onClick={() => copy(row.id, "Request ID copied")}
                >
                  <Copy />
                </Button>
                <span className="text-muted-foreground mx-2 text-[10px]">
                  {position + 1} / {total}
                </span>
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Previous request"
                  disabled={position <= 0}
                  onClick={() => onNavigate(-1)}
                >
                  <ArrowUp />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Next request"
                  disabled={position >= total - 1}
                  onClick={() => onNavigate(1)}
                >
                  <ArrowDown />
                </Button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="flex flex-col gap-5 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <h2 className="font-mono text-base font-medium">
                        {row.model}
                      </h2>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {row.provider} ·{" "}
                      {new Date(row.timestamp).toISOString().slice(0, 10)} ·{" "}
                      {formatTime(row.timestamp)} UTC
                    </p>
                  </div>
                  <RequestStatus status={row.status} />
                </div>
                <div className="grid grid-cols-3 divide-x rounded-lg border py-3">
                  {[
                    ["Latency", formatMs(row.latency)],
                    [
                      "Tokens",
                      (row.input + row.output).toLocaleString("en-US"),
                    ],
                    ["Cost", formatCost(row.cost)],
                  ].map(([label, value]) => (
                    <div key={label} className="flex flex-col gap-1 px-4">
                      <span className="text-muted-foreground text-[10px]">
                        {label}
                      </span>
                      <span className="font-mono text-sm">{value}</span>
                    </div>
                  ))}
                </div>
                <dl className="grid grid-cols-[100px_minmax(0,1fr)] gap-x-4 gap-y-3 text-xs">
                  {[
                    ["Log source", row.source],
                    ["Endpoint", `POST ${row.endpoint}`],
                    ["Project", row.project],
                    ["Environment", row.environment],
                    ["API key", row.key],
                    ["Region", row.region],
                    ["Cache", row.cache],
                    [
                      "Input / output",
                      `${row.input.toLocaleString("en-US")} / ${row.output.toLocaleString("en-US")} tokens`,
                    ],
                  ].map(([label, value]) => (
                    <div key={label} className="contents">
                      <dt className="text-muted-foreground">{label}</dt>
                      <dd className="min-w-0 font-mono text-[11px] break-words">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
                <Separator />
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-medium">Request timing</h3>
                    <span className="text-muted-foreground font-mono text-[10px]">
                      {formatMs(row.latency)}
                    </span>
                  </div>
                  <div
                    className="flex h-3 gap-0.5 overflow-hidden rounded-sm"
                    aria-hidden="true"
                  >
                    {timing.map((phase) => (
                      <span
                        key={phase.label}
                        className={phase.color}
                        style={{
                          width: `${(phase.duration / row.latency) * 100}%`,
                        }}
                      />
                    ))}
                  </div>
                  {timing.map((phase) => (
                    <div
                      key={phase.label}
                      className="flex items-center justify-between text-[11px]"
                    >
                      <span className="text-muted-foreground flex items-center gap-2">
                        <span
                          className={`${phase.color} size-1.5 rounded-full`}
                        />
                        {phase.label}
                      </span>
                      <span className="font-mono">
                        {formatMs(phase.duration)}
                      </span>
                    </div>
                  ))}
                </div>
                {row.status !== 200 ? (
                  <div className="bg-destructive/5 border-destructive/20 flex flex-col gap-2 rounded-md border p-3">
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <Badge variant="destructive">{row.status}</Badge>
                      {row.status === 429
                        ? "Provider rate limit reached"
                        : "Upstream request failed"}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {row.status === 429
                        ? "The provider rejected this request before generation. A retry may be attempted after 2 seconds."
                        : "The provider returned an error before generating a response."}
                    </p>
                    <span className="text-muted-foreground text-[10px]">
                      Attempt 1 of 1 · No fallback configured · No completion
                      tokens billed
                    </span>
                  </div>
                ) : null}
              </div>
              <Tabs defaultValue="request" className="gap-0">
                <div className="px-5">
                  <TabsList className="w-full">
                    <TabsTrigger value="request">Request</TabsTrigger>
                    <TabsTrigger value="events">Events</TabsTrigger>
                    <TabsTrigger value="response">Response</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="events" className="space-y-3 px-5 py-4">
                  {requestEvents(row).map((event) => (
                    <div
                      key={event.event}
                      className="flex gap-3 rounded-md border p-3"
                    >
                      <span className="text-muted-foreground w-12 shrink-0 font-mono text-[10px]">
                        {event.offset} ms
                      </span>
                      <div>
                        <p className="font-mono text-[11px] break-all">
                          {event.event}
                        </p>
                        <p className="text-muted-foreground mt-1 text-xs">
                          {event.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </TabsContent>
                {(["request", "response"] as const).map((kind) => (
                  <TabsContent
                    key={kind}
                    value={kind}
                    className="px-5 pt-3 pb-5"
                  >
                    <div className="bg-muted/30 overflow-hidden rounded-lg border">
                      <div className="flex items-center justify-between border-b px-3 py-1.5">
                        <span className="text-muted-foreground font-mono text-[10px]">
                          {kind}.json
                        </span>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Copy ${kind} JSON`}
                          onClick={() =>
                            copy(
                              JSON.stringify(
                                kind === "request"
                                  ? requestPayload(row)
                                  : responsePayload(row),
                                null,
                                2,
                              ),
                              `${kind} JSON copied`,
                            )
                          }
                        >
                          <Copy />
                        </Button>
                      </div>
                      <pre className="overflow-x-auto p-3 font-mono text-[11px] leading-5">
                        <code>
                          {JSON.stringify(
                            kind === "request"
                              ? requestPayload(row)
                              : responsePayload(row),
                            null,
                            2,
                          )}
                        </code>
                      </pre>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
            <div className="flex shrink-0 items-center justify-between gap-2 border-t px-5 py-3">
              <span className="text-muted-foreground text-[10px]">
                Sample payload · Sensitive fields omitted
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  copy(
                    JSON.stringify(
                      {
                        ...row,
                        request: requestPayload(row),
                        response: responsePayload(row),
                      },
                      null,
                      2,
                    ),
                    "Full request copied",
                  )
                }
              >
                <ExternalLink data-icon="inline-start" />
                Copy record
              </Button>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
