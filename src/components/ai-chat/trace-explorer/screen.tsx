"use client";

import {
  ArrowDownToLine,
  Bot,
  Braces,
  CalendarDays,
  Check,
  ChevronDown,
  Columns3,
  Layers,
  ListFilter,
  Maximize2,
  MessageSquare,
  Radio,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { AiWorkspaceShell } from "@/components/ai-chat/ai-workspace-shell";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { type Span, spansFor, type Trace, traces, volume } from "./data";
import s from "./explorer.module.css";

function SpanIcon({ kind }: { kind: Span["kind"] }) {
  const Icon =
    kind === "model"
      ? MessageSquare
      : kind === "agent"
        ? Layers
        : kind === "tool"
          ? Bot
          : Braces;
  return (
    <span className={s.type}>
      <Icon size={13} />
    </span>
  );
}
function download(trace: Trace) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify({ trace, spans: spansFor(trace) }, null, 2)], {
      type: "application/json",
    }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = `trace-${trace.id}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function TraceExplorer() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All statuses");
  const [range, setRange] = useState("14 days");
  const [selected, setSelected] = useState<Trace | null>(traces[0]);
  const [live, setLive] = useState(false);
  const [added, setAdded] = useState(0);
  const [refreshed, setRefreshed] = useState(false);
  const [columns, setColumns] = useState([
    "Run ID",
    "Task",
    "Request",
    "Outcome",
    "Started",
  ]);
  const [width, setWidth] = useState(460);
  const [expanded, setExpanded] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const run = new URLSearchParams(window.location.search).get("run");
    const match = traces.find((trace) => trace.id === run);
    if (match) setSelected(match);
  }, []);
  useEffect(() => {
    if (!live) return;
    const timer = setInterval(() => setAdded((n) => Math.min(n + 1, 6)), 6000);
    return () => clearInterval(timer);
  }, [live]);
  useEffect(() => {
    if (!refreshed) return;
    const timer = setTimeout(() => setRefreshed(false), 1600);
    return () => clearTimeout(timer);
  }, [refreshed]);
  const all = [
    ...Array.from({ length: added }, (_, i) => ({
      ...traces[i],
      id: `live-${i}-${traces[i].id}`,
      time: `Sep 18, 15:0${i}`,
    })).reverse(),
    ...traces,
  ];
  const rows = all.filter(
    (t) =>
      (filter === "All statuses" ||
        (filter === "Errors" ? t.error : !t.error)) &&
      `${t.name} ${t.input} ${t.id} ${t.agent}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (range !== "Today" || t.time.startsWith("Sep 18")),
  );
  const chartData = (range === "Today" ? volume.slice(-4) : volume).map(
    (v) => ({
      success: filter === "Errors" ? 0 : v.success,
      error: filter === "Success" ? 0 : v.error,
    }),
  );
  const activeHover = hover !== null && hover < chartData.length ? hover : null;
  function choose(t: Trace) {
    setSelected(t);
    setExpanded(false);
  }
  return (
    <AiWorkspaceShell hideNavigationSidebar headerTitle="Agent traces">
      <div ref={root} className={s.screen}>
        <section
          className={s.main}
          aria-label="Trace explorer"
          style={expanded && selected ? { display: "none" } : undefined}
        >
          <div className={s.header}>
            <h1>Executions</h1>
            <span className="text-muted-foreground ml-auto text-xs">
              Customer operations
            </span>
          </div>
          <div className={s.controls}>
            <Popover>
              <PopoverTrigger asChild>
                <button className={s.control}>
                  <ListFilter />
                  {filter === "All statuses" ? "Add filter" : filter}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-52 p-2" align="start">
                <p className="px-2 py-1 text-xs font-medium">
                  Execution status
                </p>
                {["All statuses", "Success", "Errors"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className="hover:bg-muted flex w-full items-center justify-between rounded px-2 py-2 text-xs"
                  >
                    {f}
                    {filter === f && <Check size={12} />}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <button className={s.control}>
                  <Columns3 />
                  Columns
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-3" align="start">
                <p className="mb-2 text-xs font-medium">Visible columns</p>
                {["Run ID", "Task", "Request", "Outcome", "Started"].map(
                  (c) => (
                    <label
                      key={c}
                      className="flex items-center gap-2 py-2 text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={columns.includes(c)}
                        disabled={c === "Task"}
                        onChange={() =>
                          setColumns(
                            columns.includes(c)
                              ? columns.filter((x) => x !== c)
                              : [
                                  "Run ID",
                                  "Task",
                                  "Request",
                                  "Outcome",
                                  "Started",
                                ].filter(
                                  (column) =>
                                    column === c || columns.includes(column),
                                ),
                          )
                        }
                      />
                      {c}
                    </label>
                  ),
                )}
              </PopoverContent>
            </Popover>
            <select
              className={s.control}
              aria-label="Saved view"
              onChange={(e) => setFilter(e.target.value)}
              value={filter}
            >
              <option value="All statuses">Default view</option>
              <option value="Errors">Failed executions</option>
              <option value="Success">Successful executions</option>
            </select>
            <label className={s.control}>
              <CalendarDays />
              <select
                aria-label="Time range"
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="bg-transparent outline-none"
              >
                <option>14 days</option>
                <option>Today</option>
              </select>
            </label>
            <button className={s.control} onClick={() => setRefreshed(true)}>
              <RefreshCw />
              {refreshed ? "Up to date" : "Refresh"}
            </button>
            <button
              className={s.control}
              aria-pressed={live}
              onClick={() => setLive(!live)}
            >
              <span
                className={cn(
                  "relative h-3.5 w-6 rounded-full",
                  live ? "bg-success" : "bg-muted-foreground/30",
                )}
              >
                <span
                  className={cn(
                    "bg-background absolute top-0.5 size-2.5 rounded-full transition-transform",
                    live ? "left-3" : "left-0.5",
                  )}
                />
              </span>
              Realtime
            </button>
          </div>
          <label className={s.search}>
            <Search size={13} />
            <input
              aria-label="Search traces"
              placeholder="Search tasks, agents, or run IDs…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button aria-label="Clear search" onClick={() => setQuery("")}>
                <X size={12} />
              </button>
            )}
          </label>
          <div className={s.chart} onMouseLeave={() => setHover(null)}>
            <div className={s.plot}>
              <div className={s.axis}>
                {[20, 15, 10, 5, 0].map((n) => (
                  <span key={n}>{n}</span>
                ))}
              </div>
              {chartData.map((v, i) => (
                <button
                  key={i}
                  className={s.bar}
                  style={{
                    height: `${Math.max(1, ((v.success + v.error) / 20) * 100)}%`,
                  }}
                  aria-label={`Filter by ${v.error ? "error" : "success"} status. ${v.success} successes, ${v.error} errors`}
                  onMouseEnter={() => setHover(i)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  onClick={() => {
                    setRange("14 days");
                    setFilter(v.error ? "Errors" : "Success");
                  }}
                >
                  <span
                    style={{
                      height: `${(v.success / (v.success + v.error || 1)) * 100}%`,
                      background: "var(--trace-success)",
                    }}
                  />
                  <span
                    style={{
                      height: `${(v.error / (v.success + v.error || 1)) * 100}%`,
                      background: "var(--destructive)",
                    }}
                  />
                </button>
              ))}
            </div>
            <div className={s.dates}>
              {(range === "Today"
                ? ["00:00", "06:00", "12:00", "18:00"]
                : [
                    "Sep 06",
                    "Sep 07",
                    "Sep 09",
                    "Sep 11",
                    "Sep 13",
                    "Sep 15",
                    "Sep 18",
                  ]
              ).map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
            <div className={s.legend}>
              <span>
                Total:{" "}
                {chartData.reduce((n, v) => n + v.success + v.error, 0) + added}
              </span>
              <span className="ml-auto">
                <i
                  className={s.dot}
                  style={{ background: "var(--trace-success)" }}
                />
                success
              </span>
              <span>
                <i
                  className={s.dot}
                  style={{ background: "var(--destructive)" }}
                />
                error
              </span>
            </div>
            {activeHover !== null && (
              <div className={s.tooltip}>
                <strong className="font-medium">
                  Sep {range === "Today" ? 18 : 6 + Math.floor(activeHover / 4)}{" "}
                  at {(activeHover % 4) * 6}
                  :00
                </strong>
                <div>
                  <i
                    className={s.dot}
                    style={{ background: "var(--trace-success)" }}
                  />
                  success{" "}
                  <span className="float-right pl-5">
                    {chartData[activeHover].success}
                  </span>
                </div>
                <div>
                  <i
                    className={s.dot}
                    style={{ background: "var(--destructive)" }}
                  />
                  error{" "}
                  <span className="float-right">
                    {chartData[activeHover].error}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th style={{ width: 23 }} />
                  <>
                    {columns.map((c) => (
                      <th
                        key={c}
                        style={{
                          width:
                            c === "Run ID"
                              ? 100
                              : c === "Task"
                                ? 190
                                : c === "Started"
                                  ? 105
                                  : undefined,
                        }}
                      >
                        {c}
                      </th>
                    ))}
                  </>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr
                    key={t.id}
                    data-selected={selected?.id === t.id}
                    onClick={() => choose(t)}
                  >
                    <td>
                      <span
                        className={s.status}
                        style={
                          t.error
                            ? { background: "var(--destructive)" }
                            : t.run.status !== "completed"
                              ? { background: "var(--muted-foreground)" }
                              : undefined
                        }
                      />
                    </td>
                    {columns.map((c) => (
                      <td key={c}>
                        {c === "Task" ? (
                          <button onClick={() => choose(t)}>
                            <SpanIcon kind="root" />
                            <span className="truncate">{t.name}</span>
                          </button>
                        ) : c === "Run ID" ? (
                          <code>
                            {t.id.length > 17 ? `${t.id.slice(0, 17)}…` : t.id}
                          </code>
                        ) : c === "Request" ? (
                          <code title={t.input}>“{t.input}”</code>
                        ) : c === "Outcome" ? (
                          <code title={t.output}>
                            {t.error ? "—" : t.output}
                          </code>
                        ) : (
                          t.time
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {!rows.length && (
              <div className={s.empty}>
                No executions match your filters.
                <button
                  className="ml-2 underline"
                  onClick={() => {
                    setQuery("");
                    setFilter("All statuses");
                  }}
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
          <footer className={s.footer}>
            <span>{rows.length} traces loaded</span>
            <span>
              {live ? (
                <>
                  <Radio size={10} className="mr-1 inline" />
                  Receiving simulated traces
                </>
              ) : (
                "Latest first · sampled project activity"
              )}
            </span>
          </footer>
        </section>
        {selected && (
          <Inspector
            key={selected.id}
            trace={selected}
            width={expanded ? undefined : width}
            expanded={expanded}
            onExpand={() => setExpanded(!expanded)}
            onClose={() => {
              setSelected(null);
              setExpanded(false);
            }}
            onResize={(w) =>
              setWidth(
                Math.max(
                  400,
                  Math.min((root.current?.clientWidth ?? 1300) - 320, w),
                ),
              )
            }
          />
        )}
      </div>
    </AiWorkspaceShell>
  );
}

function Inspector({
  trace,
  width,
  expanded,
  onClose,
  onExpand,
  onResize,
}: {
  trace: Trace;
  width?: number;
  expanded: boolean;
  onClose: () => void;
  onExpand: () => void;
  onResize: (w: number) => void;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState("plan");
  const [mode, setMode] = useState("Transcript");
  const list = spansFor(trace);
  const items = list
    .slice(1)
    .filter((sp) =>
      `${sp.name} ${sp.input} ${sp.output}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
  const panel = useRef<HTMLElement>(null);
  return (
    <aside
      ref={panel}
      className={s.inspector}
      style={{ width: expanded ? "100%" : width }}
      aria-label="Trace inspector"
    >
      <div
        role="separator"
        aria-label="Resize trace inspector"
        aria-orientation="vertical"
        tabIndex={0}
        aria-valuemin={400}
        aria-valuenow={width ?? 500}
        className={s.resize}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") onResize((width ?? 500) + 20);
          if (e.key === "ArrowRight") onResize((width ?? 500) - 20);
        }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            const right = panel.current?.getBoundingClientRect().right ?? 0;
            onResize(right - e.clientX);
          }
        }}
        onPointerUp={(e) => e.currentTarget.releasePointerCapture(e.pointerId)}
      />
      <div className={s.inspectorHeader}>
        <span className={s.inspectorEyebrow}>
          <Layers size={14} /> Execution details
        </span>
        <button
          className={s.iconButton}
          aria-label="Expand inspector"
          aria-pressed={expanded}
          title="Expand inspector"
          onClick={onExpand}
        >
          <Maximize2 />
        </button>
        <button
          className={s.iconButton}
          aria-label="Export trace"
          title="Download trace"
          onClick={() => download(trace)}
        >
          <ArrowDownToLine />
        </button>
        <button
          className={s.iconButton}
          aria-label="Close inspector"
          title="Close inspector"
          onClick={onClose}
        >
          <X />
        </button>
      </div>
      <div className={s.runSummary}>
        <h2>{trace.name}</h2>
        <div className={s.runIdentity}>
          <span>{trace.agent}</span>
          <span aria-hidden="true">·</span>
          <code>{trace.id}</code>
        </div>
        <div className={s.runMetadata}>
          <span className={s.runStatus} data-status={trace.run.status}>
            <span aria-hidden="true" />
            {trace.run.status === "review"
              ? "Needs review"
              : trace.run.status === "running"
                ? "In progress"
                : trace.run.status.charAt(0).toUpperCase() +
                  trace.run.status.slice(1)}
          </span>
          <span>Started {trace.time}</span>
        </div>
      </div>
      <label className={s.search} style={{ margin: "0 8px 8px" }}>
        <Search size={13} />
        <input
          aria-label="Search within trace"
          placeholder="Search steps and messages…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
      <section className={s.waterfall} aria-label="Execution timeline">
        <div className={s.timelineHeader}>
          <h3>Execution timeline</h3>
          <span>
            {trace.run.steps.length} steps · {trace.duration}s elapsed
          </span>
        </div>
        <div className={s.timelineColumns}>
          <span>Step</span>
          <div className={s.ruler}>
            {[0, 0.5, 1].map((fraction) => (
              <span key={fraction}>
                {Math.round(trace.duration * fraction)}s
              </span>
            ))}
          </div>
          <span className={s.timelineResult}>State</span>
        </div>
        <div className={s.timelineRows}>
          {list
            .filter((sp) => sp.id === "plan" || sp.id.startsWith("step-"))
            .map((sp) => {
              const pending = ["waiting", "review", "blocked"].includes(
                sp.status,
              );
              const state =
                sp.status === "review"
                  ? "Review"
                  : sp.status === "waiting"
                    ? "Waiting"
                    : sp.status === "blocked"
                      ? "Blocked"
                      : sp.status === "failed"
                        ? "Failed"
                        : sp.status === "running"
                          ? "Running"
                          : `${sp.duration.toFixed(1)}s`;
              return (
                <button
                  key={sp.id}
                  className={s.timelineRow}
                  aria-label={`Inspect span ${sp.name} ${sp.id}`}
                  aria-pressed={open === sp.id}
                  title={`${sp.name} · ${state}`}
                  onClick={() => {
                    setOpen(sp.id);
                    document.getElementById(`span-${sp.id}`)?.scrollIntoView({
                      block: "nearest",
                      behavior: "smooth",
                    });
                  }}
                >
                  <span className={s.timelineName}>{sp.name}</span>
                  <span className={s.timelineLane}>
                    {pending ? (
                      <span className={s.pendingTrack} />
                    ) : (
                      <span
                        className={s.timelineBar}
                        data-failed={sp.status === "failed"}
                        style={{
                          left: `${(sp.start / trace.duration) * 100}%`,
                          width: `${Math.max(2, (sp.duration / trace.duration) * 100)}%`,
                        }}
                      />
                    )}
                  </span>
                  <span className={s.timelineResult}>{state}</span>
                </button>
              );
            })}
        </div>
      </section>
      <div className={s.transcriptToolbar}>
        <select
          aria-label="Trace presentation"
          className={s.control}
          style={{ height: 24 }}
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        >
          <option>Transcript</option>
          <option>Span tree</option>
        </select>
        <span className={s.pill}>{trace.duration.toFixed(2)}s</span>
        <span className={s.pill}>
          {trace.tokens >= 1000000
            ? `${(trace.tokens / 1000000).toFixed(1)}M`
            : `${(trace.tokens / 1000).toFixed(1)}K`}{" "}
          tokens
        </span>
        <span className={s.pill}>${trace.cost.toFixed(2)}</span>
      </div>
      <div className={s.transcript}>
        <div className={s.inputBlock}>
          <h3>Input</h3>
          <p>{trace.name}</p>
          <p className="mt-3">{trace.input}</p>
        </div>
        {items.map((sp) => (
          <article
            id={`span-${sp.id}`}
            key={sp.id}
            className={s.spanCard}
            style={
              mode === "Span tree" ? { marginLeft: sp.depth * 12 } : undefined
            }
          >
            <button
              className={s.spanHeader}
              aria-expanded={open === sp.id}
              onClick={() => setOpen(open === sp.id ? "" : sp.id)}
            >
              <strong className={s.spanHeading}>{sp.name}</strong>
              <span className={s.spanMeta}>
                {sp.status === "waiting"
                  ? "Not started"
                  : `${sp.duration.toFixed(2)}s`}
              </span>
              <ChevronDown
                size={12}
                style={{
                  transform: open === sp.id ? "rotate(180deg)" : undefined,
                }}
              />
            </button>
            {open === sp.id && (
              <div className={s.spanBody}>
                <section className={s.spanSection}>
                  <h4>Input</h4>
                  <p>{sp.input}</p>
                </section>
                <section className={s.spanSection}>
                  <h4>{sp.status === "waiting" ? "Pending" : "Output"}</h4>
                  <p>{sp.output}</p>
                </section>
              </div>
            )}
          </article>
        ))}
        {!items.length && (
          <div className={s.empty}>No spans match “{search}”.</div>
        )}
      </div>
    </aside>
  );
}
