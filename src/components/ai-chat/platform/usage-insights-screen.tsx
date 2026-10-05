"use client";

import { ArrowDownToLine, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { downloadFile } from "./platform-data";
import { PlatformPage, PlatformSelect } from "./platform-ui";
import {
  ANALYTICS_DAYS,
  type AnalyticsMetric,
  byDay,
  HOURLY_WEIGHTS,
  metricValue,
  sumUsage,
  USAGE_MODELS,
  USAGE_PROJECTS,
  usageDate,
  usageNumber,
  usageRows,
} from "./usage-analytics-data";
import { UsageModelMark } from "./usage-analytics-ui";

const metrics: AnalyticsMetric[] = ["requests", "tokens", "cost"];
const metricLabels = { requests: "Requests", tokens: "Tokens", cost: "Spend" };

export function UsageInsightsScreen() {
  const [project, setProject] = useState("all");
  const [period, setPeriod] = useState("year");
  const [metric, setMetric] = useState<AnalyticsMetric>("requests");
  const [selectedDate, setSelectedDate] = useState(ANALYTICS_DAYS.at(-1)!);
  const grid = useRef<HTMLDivElement>(null);
  const rows = useMemo(
    () => usageRows(period === "year" ? 362 : 90, project),
    [period, project],
  );
  const days = useMemo(() => byDay(rows), [rows]);
  const total = sumUsage(rows);
  const maxDay = Math.max(...days.map((day) => day.requests), 1);
  const peak = days.reduce(
    (best, day) => (day.requests > best.requests ? day : best),
    days[0],
  );
  const selected =
    days.find((day) => day.date === selectedDate) ?? days.at(-1)!;
  const weeks = Array.from({ length: Math.ceil(days.length / 7) }, (_, i) => {
    const dates = new Set(days.slice(i * 7, i * 7 + 7).map((day) => day.date));
    return USAGE_MODELS.map((model) => ({
      model,
      ...sumUsage(
        rows.filter((row) => dates.has(row.date) && row.model === model.id),
      ),
    }));
  });
  const maxWeek = Math.max(
    ...weeks.map((week) => week.reduce((sum, model) => sum + model[metric], 0)),
    1,
  );
  const ranking = USAGE_MODELS.map((model) => ({
    model,
    ...sumUsage(rows.filter((row) => row.model === model.id)),
  })).sort((a, b) => b[metric] - a[metric]);
  const hourTotal = HOURLY_WEIGHTS.reduce((sum, weight) => sum + weight, 0);
  let streak = 0,
    longest = 0;
  for (const day of days) {
    streak = day.requests ? streak + 1 : 0;
    longest = Math.max(longest, streak);
  }
  function cycleMetric(direction: number) {
    setMetric(
      metrics[
        (metrics.indexOf(metric) + direction + metrics.length) % metrics.length
      ],
    );
  }
  function exportUsage() {
    downloadFile(
      "usage-insights.csv",
      [
        "Date,Project,Model,Requests,Tokens,Spend USD,Errors,Rate limited",
        ...rows.map((row) =>
          [
            row.date,
            row.project,
            row.model,
            row.requests,
            row.tokens,
            row.cost.toFixed(2),
            row.errors,
            row.limited,
          ].join(","),
        ),
      ].join("\r\n"),
      "text/csv;charset=utf-8",
    );
  }
  return (
    <PlatformPage
      title="Usage insights"
      description="A closer look at how your workspace uses AI."
      contentClassName="max-w-[944px] gap-10 py-8 sm:py-12"
      actions={
        <>
          <PlatformSelect
            label="Project"
            value={project}
            onChange={setProject}
            className="h-8 min-w-0 text-xs"
            options={[
              { value: "all", label: "All projects" },
              ...USAGE_PROJECTS,
            ]}
          />
          <PlatformSelect
            label="Usage period"
            value={period}
            onChange={setPeriod}
            className="h-8 min-w-0 text-xs"
            options={[
              { value: "year", label: "Last 12 months" },
              { value: "quarter", label: "Last 90 days" },
            ]}
          />
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Export usage insights"
            onClick={exportUsage}
          >
            <ArrowDownToLine />
          </Button>
        </>
      }
    >
      <section aria-labelledby="activity-title" className="space-y-5">
        <div>
          <h2 id="activity-title" className="text-sm font-semibold">
            Activity
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            API requests, day by day <span className="mx-1">·</span>{" "}
            <span data-usage-total>{usageNumber(total.requests)}</span> in this
            period
          </p>
        </div>
        <div className="overflow-x-auto pb-1">
          <div className={period === "year" ? "min-w-[680px]" : "w-[228px]"}>
            <div
              className="text-muted-foreground mb-2 ml-8 grid text-[11px]"
              style={{
                gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
              }}
              aria-hidden="true"
            >
              {weeks.map((_, i) => {
                const date = days[i * 7].date;
                const month = date.slice(0, 7);
                return (
                  <span
                    key={date}
                    className="overflow-visible whitespace-nowrap"
                  >
                    {(
                      i === 0
                        ? days[7]?.date.slice(0, 7) === month
                        : days[(i - 1) * 7].date.slice(0, 7) !== month
                    )
                      ? new Date(date + "T12:00:00Z").toLocaleDateString(
                          "en-US",
                          { month: "short", timeZone: "UTC" },
                        )
                      : ""}
                  </span>
                );
              })}
            </div>
            <div className="flex gap-2">
              <div
                className="text-muted-foreground grid w-6 shrink-0 grid-rows-7 items-center text-[10px]"
                aria-hidden="true"
              >
                {Array.from({ length: 7 }, (_, index) => {
                  const name = [
                    "Sun",
                    "Mon",
                    "Tue",
                    "Wed",
                    "Thu",
                    "Fri",
                    "Sat",
                  ][
                    (new Date(days[0].date + "T12:00:00Z").getUTCDay() +
                      index) %
                      7
                  ];
                  return (
                    <span key={index}>
                      {["Mon", "Wed", "Fri"].includes(name) ? name : ""}
                    </span>
                  );
                })}
              </div>
              <div
                ref={grid}
                className="grid min-w-0 flex-1 grid-flow-col grid-rows-7 gap-[3px]"
                style={{
                  gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
                }}
                aria-label="Daily request activity"
              >
                {days.map((day, index) => (
                  <button
                    key={day.date}
                    type="button"
                    aria-label={`${usageDate(day.date)}: ${day.requests.toLocaleString("en-US")} requests`}
                    aria-pressed={day.date === selected.date}
                    tabIndex={day.date === selected.date ? 0 : -1}
                    title={`${usageDate(day.date)} · ${day.requests.toLocaleString("en-US")} requests`}
                    className="focus-visible:ring-ring aspect-square rounded-[3px] outline-none hover:ring-1 hover:ring-emerald-500 focus-visible:ring-2 focus-visible:ring-offset-1"
                    style={{
                      backgroundColor: day.requests
                        ? `color-mix(in oklab, var(--color-emerald-500) ${Math.round(18 + (day.requests / maxDay) * 82)}%, var(--muted))`
                        : "var(--muted)",
                    }}
                    onClick={() => setSelectedDate(day.date)}
                    onKeyDown={(event) => {
                      const shift = {
                        ArrowRight: 7,
                        ArrowLeft: -7,
                        ArrowDown: 1,
                        ArrowUp: -1,
                      }[event.key];
                      if (shift !== undefined) {
                        event.preventDefault();
                        const next = Math.max(
                          0,
                          Math.min(days.length - 1, index + shift),
                        );
                        setSelectedDate(days[next].date);
                        (
                          grid.current?.children[next] as HTMLButtonElement
                        )?.focus();
                      }
                    }}
                  />
                ))}
                {Array.from(
                  { length: weeks.length * 7 - days.length },
                  (_, i) => (
                    <span key={`future-${i}`} className="aspect-square" />
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs">
          <p>
            {streak}-day streak · Longest {longest} days · Busiest{" "}
            {usageDate(peak.date)} ({usageNumber(peak.requests)} requests)
          </p>
          <div
            className="flex items-center gap-1"
            aria-label="Color intensity represents request volume"
          >
            <span className="mr-1">Less</span>
            {[0, 20, 40, 60, 80, 100].map((level) => (
              <span
                key={level}
                className="size-2.5 rounded-[2px]"
                style={{
                  backgroundColor: `color-mix(in oklab, var(--color-emerald-500) ${level}%, var(--muted))`,
                }}
              />
            ))}
            <span className="ml-1">More</span>
          </div>
        </div>
        <p className="text-muted-foreground text-xs" aria-live="polite">
          {usageDate(selected.date)}:{" "}
          {selected.requests.toLocaleString("en-US")} requests · Select a day,
          or use the arrow keys to explore.
        </p>
      </section>
      <section aria-labelledby="over-time-title" className="space-y-4">
        <div>
          <h2 id="over-time-title" className="text-sm font-semibold">
            Over time
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {metricLabels[metric]} per week, by model
          </p>
        </div>
        <div
          className="flex h-28 items-end gap-[3px]"
          role="img"
          aria-label={`Weekly ${metricLabels[metric].toLowerCase()} by model. ${ranking[0].model.name} leads with ${metricValue(ranking[0][metric], metric)}.`}
        >
          {weeks.map((week, i) => (
            <div
              key={i}
              className="flex h-full min-w-0 flex-1 flex-col justify-end"
              title={`Week of ${usageDate(days[i * 7].date)}\n${week.map((row) => `${row.model.name}: ${metricValue(row[metric], metric)}`).join("\n")}`}
            >
              {[...week].reverse().map((row) => (
                <div
                  key={row.model.id}
                  style={{
                    height: `${(row[metric] / maxWeek) * 100}%`,
                    backgroundColor: row.model.color,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
        <div
          className="text-muted-foreground flex justify-between text-[11px]"
          aria-hidden="true"
        >
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((fraction) => (
            <span key={fraction}>
              {usageDate(days[Math.round(fraction * (days.length - 1))].date)}
            </span>
          ))}
        </div>
        <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-2 text-xs">
          {USAGE_MODELS.filter((model) =>
            rows.some((row) => row.model === model.id && row.requests > 0),
          ).map((model) => (
            <span key={model.id} className="flex items-center gap-1.5">
              <span
                className="size-2.5 rounded-[2px]"
                style={{ backgroundColor: model.color }}
              />
              {model.name}
            </span>
          ))}
        </div>
      </section>
      <section aria-labelledby="by-hour-title" className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="by-hour-title" className="text-sm font-semibold">
              By hour
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Most active around 4 PM <span className="text-xs">· UTC</span>
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Previous usage metric"
              onClick={() => cycleMetric(-1)}
            >
              <ChevronLeft />
            </Button>
            <span className="min-w-14 text-center text-xs" aria-live="polite">
              {metricLabels[metric]}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Next usage metric"
              onClick={() => cycleMetric(1)}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
        <div
          className="flex h-24 items-end gap-1"
          role="img"
          aria-label={`${metricLabels[metric]} by hour in UTC; peak at 4 PM.`}
        >
          {HOURLY_WEIGHTS.map((weight, hour) => (
            <div
              key={hour}
              className={cn(
                "min-w-0 flex-1 rounded-t-[3px]",
                hour === 16
                  ? "bg-emerald-500"
                  : "bg-emerald-400/75 dark:bg-emerald-400/60",
              )}
              style={{ height: `${(weight / 38) * 100}%` }}
              title={`${hour.toString().padStart(2, "0")}:00 UTC · ${metricValue((total[metric] * weight) / hourTotal, metric)}`}
            />
          ))}
        </div>
        <div className="text-muted-foreground flex justify-between text-[11px]">
          <span>12 AM</span>
          <span>6 AM</span>
          <span>12 PM</span>
          <span>6 PM</span>
          <span>11 PM</span>
        </div>
      </section>
      <section aria-labelledby="models-title" className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 id="models-title" className="text-sm font-semibold">
            Models
          </h2>
          <span className="text-muted-foreground text-xs">
            {metricLabels[metric]}
          </span>
        </div>
        <div className="space-y-5">
          {ranking.map((row) => (
            <div
              key={row.model.id}
              className="grid grid-cols-[minmax(110px,180px)_minmax(40px,1fr)_60px] items-center gap-3"
            >
              <div className="flex min-w-0 items-center gap-2">
                <UsageModelMark model={row.model} />
                <span className="truncate text-xs sm:text-sm">
                  {row.model.name}
                </span>
              </div>
              <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{
                    width: `${(row[metric] / Math.max(ranking[0][metric], 1)) * 100}%`,
                  }}
                />
              </div>
              <span className="text-muted-foreground text-right text-xs tabular-nums">
                {metricValue(row[metric], metric)}
              </span>
            </div>
          ))}
        </div>
      </section>
      <p className="text-muted-foreground pb-2 text-xs">
        Demo usage · {usageDate(days[0].date)}, {days[0].date.slice(0, 4)} –{" "}
        {usageDate(days.at(-1)!.date)}, {days.at(-1)!.date.slice(0, 4)} · All
        times UTC
      </p>
    </PlatformPage>
  );
}
