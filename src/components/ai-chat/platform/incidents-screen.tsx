"use client";

import {
  ArrowUpRight,
  ChevronRight,
  Download,
  Siren,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { AiWorkspaceShell } from "@/components/ai-chat/ai-workspace-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import {
  type IncidentDay,
  incidentDays,
  incidentRows,
  incidentRowsCsv,
  incidentsByEndpoint,
  incidentsByRegion,
  incidentSeverities,
  type IncidentSeverity,
  incidentWeekday,
} from "./incident-data";

const chartInitialDimension = { width: 640, height: 224 };

function dayLabel(date: string, label: string): string {
  return `${incidentWeekday(date)}, ${label}`;
}

function HorizontalBars({ rows }: { rows: { name: string; value: number }[] }) {
  return (
    <ChartContainer
      config={{ value: { label: "Incidents", color: "#10b981" } }}
      className="h-56 w-full"
      initialDimension={chartInitialDimension}
    >
      <BarChart
        accessibilityLayer
        data={rows}
        layout="vertical"
        margin={{ left: 0, right: 24, top: 0, bottom: 0 }}
      >
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis
          type="number"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          tickFormatter={(v) =>
            Number(v).toLocaleString("en-US", {
              notation: "compact",
              maximumFractionDigits: 1,
            })
          }
        />
        <YAxis
          type="category"
          dataKey="name"
          width={168}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => (
                <span className="flex flex-1 justify-between gap-8">
                  <span className="text-muted-foreground">Incidents</span>
                  <span className="font-mono font-medium">
                    {Number(value).toLocaleString()}
                  </span>
                </span>
              )}
            />
          }
        />
        <Bar
          dataKey="value"
          fill="var(--color-value)"
          radius={[0, 4, 4, 0]}
          maxBarSize={18}
          isAnimationActive={false}
        />
      </BarChart>
    </ChartContainer>
  );
}

export function IncidentsScreen() {
  const [active, setActive] = React.useState<IncidentSeverity[]>([
    "critical",
    "high",
    "medium",
    "low",
  ]);
  function toggle(severity: IncidentSeverity) {
    setActive((current) =>
      current.includes(severity)
        ? current.filter((s) => s !== severity)
        : [...current, severity],
    );
  }
  const rows: (IncidentDay & { total: number })[] = incidentDays.map((d) => ({
    ...d,
    total: active.reduce((sum, s) => sum + d[s], 0),
  }));
  const grand = rows.reduce((sum, d) => sum + d.total, 0);
  const severityTotals = incidentSeverities.map((s) => ({
    ...s,
    total: incidentDays.reduce((sum, d) => sum + d[s.id], 0),
  }));
  const topActive =
    incidentSeverities.filter((severity) => active.includes(severity.id)).at(-1)
      ?.id ?? null;
  const [panel, setPanel] = React.useState<
    "incidents" | "endpoints" | "regions"
  >("incidents");
  const [notice, setNotice] = React.useState("");
  const [platNotes, setPlatNotes] = React.useState<
    { id: string; text: string }[]
  >([
    {
      id: "pn-seed",
      text: "Aug 17 spike traced to unbounded retries — read the outage postmortem before touching limits.",
    },
  ]);
  const [platDraft, setPlatDraft] = React.useState("");
  function addPlatNote() {
    if (!platDraft.trim()) return;
    setPlatNotes((n) => [
      ...n,
      {
        id:
          globalThis.crypto?.randomUUID?.() ??
          `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
        text: platDraft.trim(),
      },
    ]);
    setPlatDraft("");
  }
  function exportCsv() {
    const url = URL.createObjectURL(
      new Blob([incidentRowsCsv(incidentRows)], {
        type: "text/csv;charset=utf-8",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "incidents-august-2026.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice(`Exported ${incidentRows.length} incidents to CSV.`);
  }

  return (
    <AiWorkspaceShell
      headerTitle="Incidents"
      hideNavigationSidebar
      headerActions={<Badge variant="outline">August 2026 · all regions</Badge>}
    >
      <div className="min-h-0 flex-1 overflow-auto">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-5 p-4 md:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="bg-muted flex size-11 shrink-0 items-center justify-center rounded-xl border">
                <Siren className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">
                  API platform · production
                </h1>
                <p className="text-muted-foreground mt-1 text-[13px]">
                  5 regions · 99.95% monthly SLO · {grand.toLocaleString()}{" "}
                  August incidents
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/ai-chat/profile">
                  Profile <ArrowUpRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/ai-chat/api-requests">
                  Logs <ArrowUpRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/ai-chat/knowledge-base">
                  Runbook <ArrowUpRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={exportCsv}>
                <Download data-icon="inline-start" />
                Export
              </Button>
            </div>
          </div>

          <div
            className="flex gap-1 border-b"
            role="tablist"
            aria-label="Incident views"
          >
            {(
              [
                { id: "incidents", label: "Overview" },
                { id: "endpoints", label: "Endpoints" },
                { id: "regions", label: "Regions" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={panel === t.id}
                onClick={() => setPanel(t.id)}
                className={cn(
                  "border-b-2 px-3 py-2 text-[13px]",
                  panel === t.id
                    ? "border-foreground font-medium"
                    : "text-muted-foreground border-transparent",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="grid min-w-0 gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
            <aside aria-label="Platform details" className="min-w-0">
              <h2 className="mb-3 text-sm font-semibold">Details</h2>
              <dl className="flex flex-col gap-3">
                {[
                  ["Internal name", "chat-completions", true],
                  ["Version", "2026-08-01", true],
                  ["Provider", "Northstar inference", false],
                  ["Primary region", "us-east", false],
                  ["Owner", "ML platform", false],
                  ["Added", "Mar 14, 2026", false],
                  ["SLO", "99.95% monthly", false],
                  ["Base URL", "api.northstar.dev/v1", true],
                ].map(([label, value, mono]) => (
                  <div
                    key={label as string}
                    className="grid grid-cols-[104px_minmax(0,1fr)] gap-2 text-[13px]"
                  >
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd
                      className={
                        mono
                          ? "min-w-0 font-mono text-xs break-words"
                          : "min-w-0 font-medium break-words"
                      }
                    >
                      {value}
                    </dd>
                  </div>
                ))}
                <div className="grid grid-cols-[104px_minmax(0,1fr)] gap-2 text-[13px]">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="flex items-center gap-1.5 font-medium">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    Operational
                  </dd>
                </div>
                <div className="grid grid-cols-[104px_minmax(0,1fr)] gap-2 text-[13px]">
                  <dt className="text-muted-foreground">
                    Filtered August incidents
                  </dt>
                  <dd className="font-medium tabular-nums">
                    {grand.toLocaleString()}
                  </dd>
                </div>
              </dl>
              <div className="mt-5 border-t pt-4">
                <h3 className="mb-2 text-sm font-semibold">Internal notes</h3>
                <ul className="flex flex-col gap-2">
                  {platNotes.map((n) => (
                    <li
                      key={n.id}
                      className="group flex items-start gap-2 rounded-lg border p-2.5 text-xs leading-5"
                    >
                      <span className="min-w-0 flex-1 break-words">
                        {n.text}
                      </span>
                      <button
                        aria-label="Delete internal note"
                        onClick={() =>
                          setPlatNotes((prev) =>
                            prev.filter((x) => x.id !== n.id),
                          )
                        }
                        className="text-muted-foreground hover:text-foreground shrink-0 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex gap-2">
                  <Input
                    aria-label="Add an internal note"
                    placeholder="Write a note…"
                    value={platDraft}
                    maxLength={300}
                    onChange={(e) => setPlatDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addPlatNote();
                    }}
                    className="h-8 min-w-0 flex-1 text-xs"
                  />
                  <Button
                    size="sm"
                    className="h-8 shrink-0 text-xs"
                    onClick={addPlatNote}
                    disabled={!platDraft.trim()}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </aside>
            <div className="flex min-w-0 flex-col gap-5">
              {panel === "incidents" ? (
                <section
                  aria-label="Incident overview"
                  className="flex min-w-0 flex-col gap-5"
                >
                  <section
                    aria-label="Total incidents"
                    className="min-w-0 rounded-xl border p-4 sm:p-5"
                  >
                    <div className="mb-1 flex items-start justify-between gap-3">
                      <h2 className="text-sm font-medium">Incidents</h2>
                      <Button
                        asChild
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs"
                      >
                        <Link href="/ai-chat/api-requests">
                          View data <ChevronRight data-icon="inline-end" />
                        </Link>
                      </Button>
                    </div>
                    <p className="text-2xl font-semibold tabular-nums">
                      {grand.toLocaleString()}
                    </p>
                    <p className="text-muted-foreground mb-3 text-xs">Total</p>
                    <ChartContainer
                      config={{
                        total: { label: "Incidents", color: "#10b981" },
                      }}
                      className="h-56 w-full"
                      initialDimension={chartInitialDimension}
                    >
                      <BarChart
                        accessibilityLayer
                        data={rows}
                        margin={{ left: 0, right: 12, top: 8, bottom: 0 }}
                      >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                          dataKey="label"
                          tickLine={false}
                          axisLine={false}
                          interval={1}
                          tickMargin={8}
                          tick={{
                            fill: "var(--muted-foreground)",
                            fontSize: 11,
                          }}
                        />
                        <YAxis
                          width={44}
                          tickLine={false}
                          axisLine={false}
                          tick={{
                            fill: "var(--muted-foreground)",
                            fontSize: 11,
                          }}
                          tickFormatter={(v) =>
                            Number(v).toLocaleString("en-US", {
                              notation: "compact",
                              maximumFractionDigits: 1,
                            })
                          }
                        />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              labelFormatter={(_, payload) =>
                                payload?.[0]
                                  ? dayLabel(
                                      String(payload[0].payload.date),
                                      String(payload[0].payload.label),
                                    )
                                  : ""
                              }
                              formatter={(value) => (
                                <span className="flex flex-1 justify-between gap-8">
                                  <span className="text-muted-foreground">
                                    Incidents
                                  </span>
                                  <span className="font-mono font-medium">
                                    {Number(value).toLocaleString()}
                                  </span>
                                </span>
                              )}
                            />
                          }
                        />
                        <Bar
                          dataKey="total"
                          fill="var(--color-total)"
                          radius={[3, 3, 0, 0]}
                          maxBarSize={16}
                          isAnimationActive={false}
                        />
                      </BarChart>
                    </ChartContainer>
                  </section>

                  <section
                    aria-label="Incidents by severity"
                    className="min-w-0 rounded-xl border p-4 sm:p-5"
                  >
                    <div className="mb-1 flex items-start justify-between gap-3">
                      <h2 className="text-sm font-medium">
                        Incidents by severity
                      </h2>
                      <Button
                        asChild
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs"
                      >
                        <Link href="/ai-chat/api-requests">
                          View data <ChevronRight data-icon="inline-end" />
                        </Link>
                      </Button>
                    </div>
                    <div className="mb-3 flex flex-wrap gap-x-6 gap-y-2">
                      {severityTotals.map((s) => {
                        const on = active.includes(s.id);
                        return (
                          <button
                            key={s.id}
                            onClick={() => toggle(s.id)}
                            aria-pressed={on}
                            title={`${on ? "Hide" : "Show"} ${s.label}`}
                            className={cn(!on && "opacity-40")}
                          >
                            <span className="block text-left text-xl font-semibold tabular-nums">
                              {s.total.toLocaleString()}
                            </span>
                            <span className="mt-0.5 flex items-center gap-1.5 text-xs">
                              <span
                                className="size-2 rounded-full"
                                style={{ backgroundColor: s.color }}
                              />
                              <span className="text-muted-foreground">
                                {s.label}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <ChartContainer
                      config={Object.fromEntries(
                        incidentSeverities.map((s) => [
                          s.id,
                          { label: s.label, color: s.color },
                        ]),
                      )}
                      className="h-56 w-full"
                      initialDimension={chartInitialDimension}
                    >
                      <BarChart
                        accessibilityLayer
                        data={rows}
                        margin={{ left: 0, right: 12, top: 8, bottom: 0 }}
                      >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                          dataKey="label"
                          tickLine={false}
                          axisLine={false}
                          interval={1}
                          tickMargin={8}
                          tick={{
                            fill: "var(--muted-foreground)",
                            fontSize: 11,
                          }}
                        />
                        <YAxis
                          width={44}
                          tickLine={false}
                          axisLine={false}
                          tick={{
                            fill: "var(--muted-foreground)",
                            fontSize: 11,
                          }}
                          tickFormatter={(v) =>
                            Number(v).toLocaleString("en-US", {
                              notation: "compact",
                              maximumFractionDigits: 1,
                            })
                          }
                        />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              labelFormatter={(_, payload) =>
                                payload?.[0]
                                  ? dayLabel(
                                      String(payload[0].payload.date),
                                      String(payload[0].payload.label),
                                    )
                                  : ""
                              }
                            />
                          }
                        />
                        {incidentSeverities.map((s) =>
                          active.includes(s.id) ? (
                            <Bar
                              key={s.id}
                              dataKey={s.id}
                              stackId="severity"
                              fill={`var(--color-${s.id})`}
                              radius={topActive === s.id ? [3, 3, 0, 0] : 0}
                              maxBarSize={16}
                              isAnimationActive={false}
                            />
                          ) : null,
                        )}
                      </BarChart>
                    </ChartContainer>
                    <p className="text-muted-foreground mt-2 text-xs">
                      Select a severity above to isolate it.
                    </p>
                  </section>
                </section>
              ) : null}

              {panel === "endpoints" ? (
                <section
                  aria-label="Incidents by endpoint"
                  className="min-w-0 rounded-xl border p-4 sm:p-5"
                >
                  <h2 className="mb-1 text-sm font-medium">
                    Incidents by endpoint
                  </h2>
                  <p className="text-muted-foreground mb-3 text-xs">
                    August total · all severities
                  </p>
                  <HorizontalBars
                    rows={incidentsByEndpoint.map((e) => ({
                      name: e.name,
                      value: e.incidents,
                    }))}
                  />
                </section>
              ) : null}

              {panel === "regions" ? (
                <section
                  aria-label="Incidents by region"
                  className="min-w-0 rounded-xl border p-4 sm:p-5"
                >
                  <h2 className="mb-1 text-sm font-medium">
                    Incidents by region
                  </h2>
                  <p className="text-muted-foreground mb-3 text-xs">
                    August total · all severities
                  </p>
                  <HorizontalBars
                    rows={incidentsByRegion.map((r) => ({
                      name: r.name,
                      value: r.incidents,
                    }))}
                  />
                </section>
              ) : null}
            </div>
          </div>

          <p role="status" className="text-muted-foreground text-xs">
            {notice ||
              "Static August sample · drill into request-level rows in API Requests."}
          </p>
        </div>
      </div>
    </AiWorkspaceShell>
  );
}
