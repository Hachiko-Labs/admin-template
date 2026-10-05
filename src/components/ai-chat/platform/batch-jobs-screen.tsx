"use client";

import {
  AlertTriangle,
  ChevronDown,
  Download,
  FileJson,
  Layers3,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Search,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AiWorkspaceShell } from "@/components/ai-chat/ai-workspace-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { NoResults, PlatformSelect } from "./platform-ui";

type BatchStatus = "Queued" | "Running" | "Completed" | "Failed" | "Cancelled";
type SegmentState =
  | "Queued"
  | "Cancelled"
  | "Processing"
  | "Retrying"
  | "Failed";
type Batch = {
  id: string;
  name: string;
  workload: string;
  model: string;
  status: BatchStatus;
  total: number;
  completed: number;
  failed: number;
  created: string;
  started: string;
  error?: string;
};
type Segment = {
  left: number;
  width: number;
  state: SegmentState;
  detail: string;
};
type ShardState = "Completed" | "Processing" | "Retrying" | "Failed" | "Queued";

const batchSeed: Batch[] = [
  {
    id: "batch_demo_8a2f",
    name: "Feedback classification",
    workload: "Customer intelligence",
    model: "GPT-4.1",
    status: "Running",
    total: 12000,
    completed: 9400,
    failed: 12,
    created: "Today, 09:42",
    started: "Today, 09:44",
  },
  {
    id: "batch_demo_4c9e",
    name: "September product summaries",
    workload: "Catalog enrichment",
    model: "GPT-4.1 mini",
    status: "Completed",
    total: 2500,
    completed: 2480,
    failed: 20,
    created: "Today, 08:16",
    started: "Today, 08:18",
  },
  {
    id: "batch_demo_2b7d",
    name: "Knowledge base tags",
    workload: "Catalog enrichment",
    model: "GPT-4.1 mini",
    status: "Completed",
    total: 840,
    completed: 840,
    failed: 0,
    created: "Yesterday, 16:25",
    started: "Yesterday, 16:28",
  },
  {
    id: "batch_demo_6f3a",
    name: "Legacy import validation",
    workload: "Data migration",
    model: "GPT-4.1",
    status: "Failed",
    total: 400,
    completed: 0,
    failed: 0,
    created: "Yesterday, 14:08",
    started: "Not started",
    error:
      "Input validation stopped at line 18 because custom_id legacy-017 was duplicated.",
  },
];

const patterns: Segment[][] = [
  [
    {
      left: 2,
      width: 15,
      state: "Processing",
      detail: "1,820 requests processed",
    },
    {
      left: 20,
      width: 13,
      state: "Processing",
      detail: "1,574 requests processed",
    },
    {
      left: 36,
      width: 18,
      state: "Processing",
      detail: "2,430 requests processed",
    },
    {
      left: 58,
      width: 30,
      state: "Processing",
      detail: "Processing current request group",
    },
  ],
  [
    {
      left: 5,
      width: 18,
      state: "Processing",
      detail: "1,940 requests processed",
    },
    {
      left: 26,
      width: 14,
      state: "Processing",
      detail: "1,711 requests processed",
    },
    { left: 43, width: 12, state: "Retrying", detail: "12 requests retried" },
    {
      left: 58,
      width: 26,
      state: "Processing",
      detail: "2,682 requests processed",
    },
    { left: 88, width: 9, state: "Processing", detail: "Processing now" },
  ],
  [
    {
      left: 1,
      width: 21,
      state: "Processing",
      detail: "2,226 requests processed",
    },
    { left: 25, width: 8, state: "Queued", detail: "Waiting for capacity" },
    {
      left: 36,
      width: 17,
      state: "Processing",
      detail: "1,886 requests processed",
    },
    { left: 57, width: 9, state: "Failed", detail: "6 requests failed" },
    {
      left: 69,
      width: 25,
      state: "Processing",
      detail: "2,201 requests processed",
    },
  ],
  [
    {
      left: 4,
      width: 10,
      state: "Processing",
      detail: "962 requests processed",
    },
    {
      left: 17,
      width: 18,
      state: "Processing",
      detail: "1,704 requests processed",
    },
    {
      left: 38,
      width: 22,
      state: "Processing",
      detail: "2,090 requests processed",
    },
    { left: 64, width: 6, state: "Retrying", detail: "4 requests retried" },
    { left: 73, width: 24, state: "Processing", detail: "Processing now" },
  ],
];

const times = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00"];

function segmentTone(state: SegmentState) {
  if (state === "Processing") return "bg-emerald-500";
  if (state === "Failed") return "bg-destructive";
  if (state === "Retrying") return "bg-chart-4";
  return "bg-muted-foreground/35";
}

function TimelineGrid() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 grid grid-cols-6"
    >
      {times.map((time, index) => (
        <span
          key={time}
          className={cn(index < times.length - 1 && "border-r")}
        />
      ))}
    </div>
  );
}

function TimelineTrack({
  batch,
  shard,
  segments,
  simulationRunning,
  animationDelay,
}: {
  batch: Batch;
  shard: number;
  segments: Segment[];
  simulationRunning: boolean;
  animationDelay: number;
}) {
  return (
    <div className="relative min-h-12">
      <TimelineGrid />
      <div
        className="batch-timeline-reveal absolute inset-x-3 top-1/2 h-6 -translate-y-1/2"
        style={{
          animationDelay: `${animationDelay}s`,
          animationPlayState: simulationRunning ? "running" : "paused",
        }}
      >
        {segments.map((segment, index) => (
          <Popover key={segment.left + "-" + segment.width}>
            <PopoverTrigger asChild>
              <button
                aria-label={
                  batch.name + ", shard " + shard + ", " + segment.state
                }
                className={cn(
                  "absolute top-1/2 h-2.5 -translate-y-1/2 rounded-full transition-all hover:h-3.5",
                  segmentTone(segment.state),
                )}
                style={{
                  left: String(segment.left) + "%",
                  width: String(segment.width) + "%",
                }}
              />
            </PopoverTrigger>
            <PopoverContent className="w-72">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">Shard {shard}</p>
                <Badge variant="outline">
                  <span
                    className={cn(
                      "mr-1.5 size-1.5 rounded-full",
                      segmentTone(segment.state),
                    )}
                  />
                  {segment.state}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1 text-xs">{batch.name}</p>
              <div className="mt-4 grid grid-cols-2 gap-4 border-t pt-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Activity</p>
                  <p className="mt-1 font-medium">{segment.detail}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="mt-1 font-medium">{6 + index * 4} min</p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        ))}
      </div>
    </div>
  );
}

function ProcessingTimeline({
  batches,
  onSelect,
  simulationRunning,
}: {
  batches: Batch[];
  onSelect: (id: string) => void;
  simulationRunning: boolean;
}) {
  return (
    <div className="min-w-[1040px] border-b">
      <div className="bg-background sticky top-0 z-30 grid grid-cols-[370px_minmax(660px,1fr)] border-b">
        <div className="bg-background text-muted-foreground sticky left-0 z-40 grid grid-cols-[1fr_86px] items-end border-r px-5 py-3 text-xs">
          <span>Batch / processing shard</span>
          <span className="text-right">Progress</span>
        </div>
        <div className="grid grid-cols-6">
          {times.map((time, index) => (
            <div
              key={time}
              className={cn(
                "grid grid-rows-[14px_20px] gap-1 px-3 py-3",
                index < times.length - 1 && "border-r",
              )}
            >
              <p className="text-muted-foreground text-[10px]">
                {index === 0 ? "Sep 13" : "\u00a0"}
              </p>
              <p className="text-muted-foreground self-end text-xs">{time}</p>
            </div>
          ))}
        </div>
      </div>
      {batches.map((batch, batchIndex) => {
        const progress = Math.round(
          ((batch.completed + batch.failed) / batch.total) * 100,
        );
        return (
          <div key={batch.id} className="border-b last:border-b-0">
            <div className="bg-muted/15 grid min-h-14 grid-cols-[370px_minmax(660px,1fr)]">
              <button
                onClick={() => onSelect(batch.id)}
                className="bg-background hover:bg-muted/30 sticky left-0 z-20 flex min-w-0 items-center gap-3 border-r px-5 text-left"
              >
                <ChevronDown className="text-muted-foreground size-4" />
                <span className="bg-muted flex size-7 shrink-0 items-center justify-center rounded-md">
                  <Layers3 className="size-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {batch.name}
                  </span>
                  <span className="text-muted-foreground block truncate text-[11px]">
                    {batch.workload} · {batch.model}
                  </span>
                </span>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {progress}%
                </span>
              </button>
              <div className="relative">
                <TimelineGrid />
                {batchIndex === 0 ? (
                  <div
                    aria-hidden="true"
                    className="batch-timeline-cursor absolute top-0 left-[3%] z-10 opacity-0"
                    style={{
                      animationPlayState: simulationRunning
                        ? "running"
                        : "paused",
                      height: batches.length * 248,
                    }}
                  >
                    <span className="bg-foreground/55 absolute top-0 left-0 h-full w-px" />
                    <span className="bg-foreground/70 absolute top-1 left-0 size-1.5 -translate-x-1/2 rounded-full" />
                  </div>
                ) : null}
              </div>
            </div>
            {patterns.map((segments, shardIndex) => (
              <div
                key={shardIndex}
                className="grid min-h-12 grid-cols-[370px_minmax(660px,1fr)]"
              >
                <div className="bg-background sticky left-0 z-20 grid grid-cols-[1fr_86px] items-center border-r px-5">
                  <div className="relative flex h-full items-center gap-2 pl-[72px]">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "border-muted-foreground/25 absolute top-0 left-12 w-4 border-l",
                        shardIndex === patterns.length - 1
                          ? "h-1/2 rounded-bl-lg border-b"
                          : "h-full",
                      )}
                    />
                    {shardIndex < patterns.length - 1 ? (
                      <span
                        aria-hidden="true"
                        className="border-muted-foreground/25 absolute top-1/2 left-12 w-4 border-t"
                      />
                    ) : null}
                    <span className="text-sm">Shard {shardIndex + 1}</span>
                    <span className="text-muted-foreground text-xs">
                      {Math.ceil(batch.total / 4).toLocaleString("en-US")} req
                    </span>
                  </div>
                  <span className="text-muted-foreground text-right text-xs">
                    {batch.status === "Completed"
                      ? 100
                      : batch.status === "Failed"
                        ? 0
                        : Math.max(0, progress - shardIndex * 3)}
                    %
                  </span>
                </div>
                <TimelineTrack
                  batch={batch}
                  shard={shardIndex + 1}
                  simulationRunning={simulationRunning}
                  animationDelay={batchIndex * 0.22 + shardIndex * 0.08}
                  segments={
                    batch.status === "Queued" || batch.status === "Cancelled"
                      ? [
                          {
                            left: 4,
                            width: 90,
                            state: batch.status,
                            detail:
                              batch.status === "Queued"
                                ? "Waiting to start"
                                : "Batch cancelled",
                          },
                        ]
                      : batch.status === "Failed"
                        ? [
                            {
                              left: 4,
                              width: 10,
                              state: "Failed",
                              detail: "Input validation failed",
                            },
                          ]
                        : batch.status === "Completed"
                          ? segments.map((segment) => ({
                              ...segment,
                              state: "Processing" as const,
                            }))
                          : segments
                  }
                />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function getShardState(batch: Batch, shardIndex: number): ShardState {
  if (batch.status === "Completed") return "Completed";
  if (batch.status === "Failed") return shardIndex === 0 ? "Failed" : "Queued";
  if (batch.status === "Queued") return "Queued";
  if (batch.status === "Cancelled") return "Failed";
  return ["Completed", "Processing", "Retrying", "Queued"][
    shardIndex
  ] as ShardState;
}

function BatchShardChip({
  batch,
  shardIndex,
}: {
  batch: Batch;
  shardIndex: number;
}) {
  const state = getShardState(batch, shardIndex);
  return (
    <span
      className="bg-muted/35 inline-flex h-7 overflow-hidden rounded-md border"
      title={`Shard ${shardIndex + 1}: ${state}`}
    >
      <span className="text-muted-foreground flex items-center border-r px-2 text-[11px] tabular-nums">
        {String(shardIndex + 1).padStart(2, "0")}
      </span>
      <span className="flex w-7 items-center justify-center">
        <span
          className={cn(
            "size-3 rounded-full border-2",
            state === "Completed" && "border-emerald-500 bg-emerald-500",
            state === "Processing" &&
              "animate-pulse border-blue-500 border-t-transparent motion-reduce:animate-none",
            state === "Retrying" &&
              "border-chart-4 border-dashed border-r-transparent",
            state === "Failed" && "border-destructive bg-destructive",
            state === "Queued" &&
              "border-muted-foreground/45 border-dashed bg-transparent",
          )}
        />
      </span>
    </span>
  );
}

function RequestActivity({ batch }: { batch: Batch }) {
  const processed = batch.completed + batch.failed;
  const progress = Math.round((processed / batch.total) * 100);
  const filled = Math.round((progress / 100) * 8);

  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1">
        {Array.from({ length: 8 }).map((_, index) => (
          <span
            key={index}
            className={cn(
              "h-3 w-1.5 rounded-[2px]",
              index < filled ? "bg-emerald-500" : "bg-muted-foreground/20",
              batch.failed > 0 && index === Math.max(0, filled - 1)
                ? "bg-destructive"
                : null,
            )}
          />
        ))}
        <span className="text-foreground ml-1 text-xs font-medium tabular-nums">
          {progress}%
        </span>
      </div>
      <p className="text-muted-foreground mt-1 truncate text-[10px] tabular-nums">
        {batch.error
          ? "Input blocked"
          : batch.failed
            ? `${batch.completed.toLocaleString("en-US")} done · ${batch.failed.toLocaleString("en-US")} failed`
            : `${processed.toLocaleString("en-US")} of ${batch.total.toLocaleString("en-US")} complete`}
      </p>
    </div>
  );
}

function BatchOperationsList({
  batches,
  expandedId,
  onToggle,
}: {
  batches: Batch[];
  expandedId: string | null;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="border-b">
      <div className="bg-muted/15 text-muted-foreground sticky top-0 z-10 hidden grid-cols-[minmax(180px,1.4fr)_minmax(160px,1fr)_minmax(160px,1fr)_24px] items-center gap-6 border-b px-4 py-2.5 text-[11px] md:grid lg:gap-10">
        <span>Batch workload</span>
        <span>Shard health</span>
        <span className="md:pl-8 lg:pl-14 xl:pl-20">Request activity</span>
        <span className="sr-only">Expand</span>
      </div>
      {batches.map((batch) => {
        const expanded = expandedId === batch.id;
        return (
          <div key={batch.id} className="border-b last:border-b-0">
            <div className="hover:bg-muted/15 grid min-h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 transition-colors md:grid-cols-[minmax(180px,1.4fr)_minmax(160px,1fr)_minmax(160px,1fr)_24px] md:gap-6 lg:gap-10">
              <button
                onClick={() => onToggle(batch.id)}
                className="flex min-w-0 items-center gap-3 text-left"
              >
                <span className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-lg">
                  <Layers3 className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">
                    {batch.name}
                  </span>
                  <span className="text-muted-foreground mt-0.5 block truncate text-[11px]">
                    {batch.workload} · {batch.model}
                  </span>
                </span>
              </button>

              <div className="hidden items-center gap-1.5 md:flex">
                {Array.from({ length: 4 }).map((_, shardIndex) => (
                  <BatchShardChip
                    key={shardIndex}
                    batch={batch}
                    shardIndex={shardIndex}
                  />
                ))}
              </div>

              <div className="hidden md:block md:pl-8 lg:pl-14 xl:pl-20">
                <RequestActivity batch={batch} />
              </div>

              <button
                type="button"
                aria-label={`${expanded ? "Collapse" : "Expand"} ${batch.name}`}
                aria-expanded={expanded}
                onClick={() => onToggle(batch.id)}
                className="text-muted-foreground hover:text-foreground flex size-6 items-center justify-center rounded-md"
              >
                <ChevronDown
                  className={cn(
                    "size-4 transition-transform",
                    expanded && "rotate-180",
                  )}
                />
              </button>
            </div>

            {expanded ? (
              <div className="bg-muted/10 text-muted-foreground flex flex-wrap items-center gap-x-6 gap-y-2 border-t px-4 py-3 text-[11px]">
                <span className="font-mono">{batch.id}</span>
                <span>Created {batch.created}</span>
                <span>Started {batch.started}</span>
                <span className="text-foreground flex items-center gap-1.5 font-medium">
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      batch.failed || batch.error
                        ? "bg-destructive"
                        : "bg-emerald-500",
                    )}
                  />
                  {batch.error
                    ? "Input validation blocked"
                    : batch.failed
                      ? `${batch.failed.toLocaleString("en-US")} failed requests`
                      : "No failed requests"}
                </span>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function BatchJobsScreen() {
  const [batches, setBatches] = useState(batchSeed);
  const [view, setView] = useState<"batches" | "timeline">("timeline");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All batches");
  const [createOpen, setCreateOpen] = useState(false);
  const [simulationRunning, setSimulationRunning] = useState(true);
  const [simulationCycle, setSimulationCycle] = useState(0);
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null);
  const [newName, setNewName] = useState("Customer feedback review");
  const visible = batches.filter(
    (batch) =>
      (status === "All batches" || batch.status === status) &&
      (batch.name + " " + batch.id + " " + batch.workload)
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  function showBatch(id: string) {
    setStatus("All batches");
    setExpandedBatchId(id);
    setView("batches");
  }

  function reset() {
    setBatches(batchSeed);
    setView("timeline");
    setSearch("");
    setStatus("All batches");
    setExpandedBatchId(null);
    setSimulationRunning(true);
    setSimulationCycle((cycle) => cycle + 1);
  }

  function createBatch() {
    const id = "batch_demo_" + Date.now().toString(36);
    const batch: Batch = {
      id,
      name: newName.trim(),
      workload: "Customer intelligence",
      model: "GPT-4.1",
      status: "Queued",
      total: 6000,
      completed: 0,
      failed: 0,
      created: "Just now",
      started: "Not started",
    };
    setBatches((items) => [batch, ...items]);
    setCreateOpen(false);
    showBatch(id);
    toast.success("Demo batch queued");
  }

  return (
    <AiWorkspaceShell
      headerTitle="Batch jobs"
      hideNavigationSidebar
      headerActions={
        <>
          <Badge variant="outline">Demo workspace</Badge>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Reset demo"
            onClick={reset}
          >
            <RotateCcw />
          </Button>
        </>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex h-full min-h-0 w-full flex-col lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
          <aside className="shrink-0 border-b px-3 py-2 lg:h-full lg:overflow-hidden lg:border-r lg:border-b-0 lg:px-6 lg:py-6">
            <h1 className="hidden px-2 text-lg font-semibold tracking-tight lg:block">
              Batch jobs
            </h1>
            <nav
              className="grid grid-cols-2 gap-1 sm:flex lg:mt-4 lg:grid lg:grid-cols-1 lg:gap-0.5"
              aria-label="Batch job views"
            >
              <button
                onClick={() => {
                  setStatus("All batches");
                  setExpandedBatchId(null);
                  setView("batches");
                }}
                className={cn(
                  "flex h-9 w-full shrink-0 items-center gap-2.5 rounded-md px-3 text-left text-[13px] whitespace-nowrap transition-colors outline-none focus-visible:ring-0 sm:w-auto lg:w-full",
                  view === "batches" && status === "All batches"
                    ? "bg-muted/80 text-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <FileJson className="size-4 shrink-0" />
                <span className="truncate">Batches</span>
              </button>
              <button
                onClick={() => setView("timeline")}
                className={cn(
                  "flex h-9 w-full shrink-0 items-center gap-2.5 rounded-md px-3 text-left text-[13px] whitespace-nowrap transition-colors outline-none focus-visible:ring-0 sm:w-auto lg:w-full",
                  view === "timeline"
                    ? "bg-muted/80 text-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <Layers3 className="size-4 shrink-0" />
                <span className="truncate">Processing timeline</span>
              </button>
              <button
                onClick={() => {
                  setStatus("Failed");
                  setExpandedBatchId(null);
                  setView("batches");
                }}
                className={cn(
                  "flex h-9 w-full shrink-0 items-center gap-2.5 rounded-md px-3 text-left text-[13px] whitespace-nowrap transition-colors outline-none focus-visible:ring-0 sm:w-auto lg:w-full",
                  view === "batches" && status === "Failed"
                    ? "bg-muted/80 text-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <AlertTriangle className="size-4 shrink-0" />
                <span className="truncate">Failed batches</span>
              </button>
              <button
                onClick={() => {
                  setStatus("Completed");
                  setExpandedBatchId(null);
                  setView("batches");
                }}
                className={cn(
                  "flex h-9 w-full shrink-0 items-center gap-2.5 rounded-md px-3 text-left text-[13px] whitespace-nowrap transition-colors outline-none focus-visible:ring-0 sm:w-auto lg:w-full",
                  view === "batches" && status === "Completed"
                    ? "bg-muted/80 text-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <Download className="size-4 shrink-0" />
                <span className="truncate">Outputs</span>
              </button>
            </nav>
          </aside>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            {view === "timeline" ? (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <div className="bg-background z-10 shrink-0 px-5 py-4 sm:px-8">
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold tracking-tight">
                      Processing timeline
                    </h2>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      Batch → shard activity across the current processing
                      window.
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="text-muted-foreground text-xs">
                      Current processing window
                    </span>
                    <Button
                      variant={simulationRunning ? "outline" : "default"}
                      size="sm"
                      className="ml-auto"
                      aria-pressed={simulationRunning}
                      onClick={() =>
                        setSimulationRunning((running) => !running)
                      }
                    >
                      {simulationRunning ? <Pause /> : <Play />}
                      {simulationRunning ? "Pause" : "Resume"}
                    </Button>
                  </div>
                </div>
                <div className="min-h-0 flex-1 overflow-auto border-t">
                  <ProcessingTimeline
                    key={simulationCycle}
                    batches={batches}
                    onSelect={showBatch}
                    simulationRunning={simulationRunning}
                  />
                  <div className="flex flex-wrap items-center gap-5 px-5 py-4 text-xs sm:px-8">
                    {[
                      ["Processing", "bg-emerald-500"],
                      ["Queued", "bg-muted-foreground/35"],
                      ["Retrying", "bg-chart-4"],
                      ["Failed", "bg-destructive"],
                    ].map(([label, tone]) => (
                      <span
                        key={label}
                        className="text-muted-foreground flex items-center gap-1.5"
                      >
                        <span className={cn("size-2 rounded-full", tone)} />
                        {label}
                      </span>
                    ))}
                    <span className="text-muted-foreground ml-auto">
                      Select a batch or interval to inspect it.
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <div className="bg-background z-10 shrink-0 px-5 py-4 sm:px-8">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight">
                        {status === "Failed"
                          ? "Failed batches"
                          : status === "Completed"
                            ? "Outputs"
                            : "Batches"}
                      </h2>
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        Inspect workload state, request progress, and generated
                        output.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setNewName("Customer feedback review");
                        setCreateOpen(true);
                      }}
                    >
                      <Plus />
                      Create batch
                    </Button>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <div className="relative min-w-48 flex-1 sm:max-w-80">
                      <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" />
                      <Input
                        aria-label="Search batches"
                        placeholder="Search batches, workloads, or IDs…"
                        className="pl-9"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                      />
                    </div>
                    <PlatformSelect
                      label="Batch status"
                      value={status}
                      onChange={setStatus}
                      options={[
                        "All batches",
                        "Queued",
                        "Running",
                        "Completed",
                        "Failed",
                        "Cancelled",
                      ]}
                    />
                  </div>
                </div>
                <div className="min-h-0 flex-1 overflow-auto border-t">
                  {visible.length ? (
                    <BatchOperationsList
                      batches={visible}
                      expandedId={expandedBatchId}
                      onToggle={(id) =>
                        setExpandedBatchId((current) =>
                          current === id ? null : id,
                        )
                      }
                    />
                  ) : (
                    <div className="px-5 py-5 sm:px-8">
                      <NoResults
                        onClear={() => {
                          setSearch("");
                          setStatus("All batches");
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a batch job</DialogTitle>
              <DialogDescription>
                Add a scripted workload to the processing queue.
              </DialogDescription>
            </DialogHeader>
            <label htmlFor="new-batch-name" className="text-sm font-medium">
              Batch name
            </label>
            <Input
              id="new-batch-name"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button disabled={!newName.trim()} onClick={createBatch}>
                Create batch
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <style jsx global>{`
          @keyframes batchTimelineReveal {
            0% {
              clip-path: inset(0 100% 0 0);
              opacity: 0.25;
            }
            8% {
              opacity: 1;
            }
            76%,
            92% {
              clip-path: inset(0 0 0 0);
              opacity: 1;
            }
            100% {
              clip-path: inset(0 0 0 0);
              opacity: 0;
            }
          }

          @keyframes batchTimelineCursor {
            0% {
              left: 3%;
              opacity: 0;
            }
            4% {
              opacity: 1;
            }
            76%,
            92% {
              left: 97%;
              opacity: 1;
            }
            100% {
              left: 97%;
              opacity: 0;
            }
          }

          .batch-timeline-reveal {
            animation: batchTimelineReveal 8s linear infinite both;
            will-change: clip-path, opacity;
          }

          .batch-timeline-cursor {
            animation: batchTimelineCursor 8s linear infinite both;
            will-change: left, opacity;
          }

          @media (prefers-reduced-motion: reduce) {
            .batch-timeline-reveal {
              animation: none;
              clip-path: none;
              opacity: 1;
            }

            .batch-timeline-cursor {
              animation: none;
              left: 72%;
              opacity: 1;
            }
          }
        `}</style>
      </div>
    </AiWorkspaceShell>
  );
}
