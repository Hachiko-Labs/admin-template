"use client";

import { AlertTriangle, Download, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

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
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { downloadFile } from "./platform-data";
import { PlatformPage, PlatformSelect } from "./platform-ui";
import {
  byDay,
  sumUsage,
  USAGE_MODELS,
  USAGE_PROJECTS,
  usageDate,
  type UsageModel,
  usageMoney,
  usageNumber,
  usageRows,
} from "./usage-analytics-data";
import { UsageModelMark } from "./usage-analytics-ui";

type View = { model: UsageModel; tab: "activity" | "budget" } | null;

export function ModelUsageScreen() {
  const [project, setProject] = useState("all");
  const [period, setPeriod] = useState("14");
  const [view, setView] = useState<View>(null);
  const [budgets, setBudgets] = useState<Record<string, number>>(() =>
    Object.fromEntries(USAGE_MODELS.map((model) => [model.id, model.budget])),
  );
  const [budgetDraft, setBudgetDraft] = useState("");
  const [budgetError, setBudgetError] = useState("");
  const rows = useMemo(
    () => usageRows(Number(period), project),
    [period, project],
  );
  const total = sumUsage(rows);
  const summaries = USAGE_MODELS.map((model) => {
    const modelRows = rows.filter((row) => row.model === model.id);
    return { model, ...sumUsage(modelRows), days: byDay(modelRows) };
  });
  const active = summaries.filter((row) => row.requests > 0).length;
  const detail = view
    ? summaries.find((row) => row.model.id === view.model.id)!
    : null;
  const monthlySpend = view
    ? sumUsage(usageRows(24).filter((row) => row.model === view.model.id)).cost
    : 0;
  function openBudget(model: UsageModel) {
    setView({ model, tab: "budget" });
    setBudgetDraft(String(budgets[model.id]));
    setBudgetError("");
  }
  function saveBudget(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(budgetDraft);
    if (
      !budgetDraft.trim() ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      amount > 1000000
    ) {
      setBudgetError("Enter a monthly budget between $0.01 and $1,000,000.");
      return;
    }
    if (!view) return;
    setBudgets((current) => ({
      ...current,
      [view.model.id]: Math.round(amount * 100) / 100,
    }));
    toast.success(`${view.model.name} demo budget updated`);
    setView(null);
  }
  function exportUsage() {
    downloadFile(
      "model-usage.csv",
      [
        "Model,Provider,Requests,Tokens,Spend USD,Errors,Rate limited,Monthly budget USD",
        ...summaries.map((row) =>
          [
            row.model.id,
            row.model.provider,
            row.requests,
            row.tokens,
            row.cost.toFixed(2),
            row.errors,
            row.limited,
            budgets[row.model.id],
          ].join(","),
        ),
      ].join("\r\n"),
      "text/csv;charset=utf-8",
    );
  }
  return (
    <PlatformPage
      title="Model usage"
      description="Track usage, spend, and reliability across your models."
      contentClassName="max-w-[944px] gap-6 py-8 sm:py-12"
      actions={
        <Button size="sm" onClick={exportUsage}>
          <Download className="size-3.5" />
          Export
        </Button>
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
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
              { value: "14", label: "Last 14 days" },
              { value: "30", label: "Last 30 days" },
            ]}
          />
        </div>
        <span className="text-muted-foreground text-xs">
          As of Sep 24, 2026
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex min-h-24 flex-col justify-between gap-4 rounded-2xl border p-4">
          <span className="text-muted-foreground text-sm">Total requests</span>
          <div className="flex items-end justify-between gap-2">
            <span className="text-xl font-medium tabular-nums" data-usage-total>
              {usageNumber(total.requests)}
            </span>
            <span className="text-muted-foreground text-xs">
              {usageNumber(total.tokens)} tokens
            </span>
          </div>
        </div>
        <div className="flex min-h-24 flex-col justify-between gap-4 rounded-2xl border p-4">
          <span className="text-muted-foreground text-sm">Usage spend</span>
          <div className="flex items-end justify-between gap-2">
            <span className="text-xl font-medium tabular-nums">
              {usageMoney(total.cost)}
            </span>
            <span className="text-muted-foreground text-xs">
              USD · this period
            </span>
          </div>
        </div>
        <div className="flex min-h-24 flex-col justify-between gap-4 rounded-2xl border p-4">
          <span className="text-muted-foreground text-sm">Models in use</span>
          <div className="flex items-end justify-between gap-2">
            <span className="text-xl font-medium tabular-nums">
              {active}{" "}
              <span className="text-muted-foreground text-sm">
                of {USAGE_MODELS.length}
              </span>
            </span>
            <span className="text-xs text-amber-700 dark:text-amber-400">
              1 needs attention
            </span>
          </div>
        </div>
      </div>
      <div className="grid items-start gap-5 md:grid-cols-2">
        {summaries.map((row) => {
          const maxDay = Math.max(...row.days.map((day) => day.requests), 1);
          const hasUsage = row.requests > 0;
          const attention = row.model.id === "claude-sonnet-4";
          return (
            <article
              key={row.model.id}
              aria-label={`${row.model.name} usage`}
              className="bg-muted/35 overflow-hidden rounded-2xl"
            >
              <div className="flex h-11 items-center justify-between gap-3 px-4">
                <div className="flex min-w-0 items-center gap-2">
                  <UsageModelMark model={row.model} />
                  <h2 className="truncate text-sm font-medium">
                    {row.model.name}
                  </h2>
                </div>
                {attention ? (
                  <span title="Elevated errors in the last 7 days">
                    <AlertTriangle
                      className="size-4 text-amber-500"
                      aria-label="Needs attention"
                    />
                  </span>
                ) : (
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {row.model.provider}
                  </span>
                )}
              </div>
              <div className="bg-background flex min-h-[258px] flex-col rounded-2xl border p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-muted-foreground text-xs">
                    {row.model.purpose}
                  </p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-normal",
                      !hasUsage
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
                        : attention
                          ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300"
                          : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
                    )}
                  >
                    {hasUsage
                      ? attention
                        ? "Elevated errors"
                        : "Healthy"
                      : "Ready"}
                  </Badge>
                </div>
                {hasUsage ? (
                  <>
                    <div
                      className="mt-6 flex h-[76px] items-end gap-1"
                      role="img"
                      aria-label={`${row.model.name}: ${row.requests.toLocaleString("en-US")} requests, ${row.errors} failed, ${row.limited} rate limited in ${period} days.`}
                    >
                      {row.days.map((day) => (
                        <div
                          key={day.date}
                          className="flex min-w-0 flex-1 flex-col justify-end overflow-hidden rounded-t-[3px]"
                          style={{
                            height: `${(day.requests / maxDay) * 100}%`,
                          }}
                          title={`${usageDate(day.date)}: ${day.requests.toLocaleString("en-US")} requests · ${day.errors} failed · ${day.limited} rate limited`}
                        >
                          <span
                            className="min-h-0 bg-rose-500"
                            style={{
                              height: `${(day.errors / Math.max(day.requests, 1)) * 100}%`,
                              minHeight: day.errors ? 2 : 0,
                            }}
                          />
                          <span
                            className="min-h-0 bg-amber-400"
                            style={{
                              height: `${(day.limited / Math.max(day.requests, 1)) * 100}%`,
                              minHeight: day.limited ? 2 : 0,
                            }}
                          />
                          <span className="min-h-0 flex-1 bg-emerald-500" />
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span>{usageNumber(row.requests)} requests</span>
                      <span className="text-muted-foreground">
                        {usageMoney(row.cost)} used
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-2 text-[11px]">
                      {period}-day usage · {usageNumber(row.tokens)} tokens
                    </p>
                    <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs shadow-none"
                        onClick={() =>
                          setView({ model: row.model, tab: "activity" })
                        }
                      >
                        Activity
                        <span className="sr-only"> for {row.model.name}</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs shadow-none"
                        onClick={() => openBudget(row.model)}
                      >
                        Budget
                        <span className="sr-only"> for {row.model.name}</span>
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="mt-auto pt-8">
                    <p className="text-sm font-medium">No requests yet</p>
                    <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                      This model is available to your workspace. Its usage will
                      appear here after your first API request.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-5 h-7 w-full text-xs shadow-none"
                      onClick={() =>
                        setView({ model: row.model, tab: "activity" })
                      }
                    >
                      View model
                    </Button>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
      <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap gap-4">
          {[
            ["bg-emerald-500", "Successful"],
            ["bg-amber-400", "Rate limited"],
            ["bg-rose-500", "Failed"],
          ].map(([color, label]) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className={cn("size-2 rounded-[2px]", color)} />
              {label}
            </span>
          ))}
        </div>
        <Link
          href="/ai-chat/usage-insights"
          className="text-foreground underline-offset-4 hover:underline"
        >
          Explore usage insights <span aria-hidden="true">↗</span>
        </Link>
      </div>
      <p className="text-muted-foreground text-xs">
        Demo workspace · Illustrative usage and costs. Budget changes apply to
        this demo session.
      </p>
      <Dialog
        open={view !== null}
        onOpenChange={(open) => {
          if (!open) setView(null);
        }}
      >
        <DialogContent className="max-h-[85svh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {view?.model.name}{" "}
              {view?.tab === "budget" ? "budget" : "activity"}
            </DialogTitle>
            <DialogDescription>
              {view?.tab === "budget"
                ? "Set a monthly USD budget for this model across all projects in this demo."
                : `${project === "all" ? "All projects" : project} · Last ${period} days · Demo usage`}
            </DialogDescription>
          </DialogHeader>
          {view?.tab === "budget" ? (
            <form onSubmit={saveBudget} className="space-y-5">
              <div className="bg-muted/50 rounded-lg p-4 text-sm">
                <p className="text-muted-foreground text-xs">
                  September spend · all projects
                </p>
                <p className="mt-1 font-medium">
                  {usageMoney(monthlySpend)} of{" "}
                  {usageMoney(budgets[view.model.id])}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthly-model-budget">
                  Monthly budget (USD)
                </Label>
                <Input
                  id="monthly-model-budget"
                  type="number"
                  min="0.01"
                  max="1000000"
                  step="0.01"
                  required
                  value={budgetDraft}
                  onChange={(event) => {
                    setBudgetDraft(event.target.value);
                    setBudgetError("");
                  }}
                  aria-invalid={!!budgetError}
                  aria-describedby={budgetError ? "budget-error" : undefined}
                />
                {budgetError && (
                  <p
                    id="budget-error"
                    role="alert"
                    className="text-destructive text-xs"
                  >
                    {budgetError}
                  </p>
                )}
              </div>
              <p className="text-muted-foreground text-xs">
                This demo stores a planning budget only. It does not change
                billing or enforce a live API limit.
              </p>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setView(null)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save budget</Button>
              </DialogFooter>
            </form>
          ) : (
            detail && (
              <>
                <div className="grid grid-cols-3 gap-3 rounded-xl border p-4">
                  {[
                    ["Requests", usageNumber(detail.requests)],
                    ["Spend", usageMoney(detail.cost)],
                    ["Median latency", detail.model.latency],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-muted-foreground text-xs">{label}</p>
                      <p className="mt-1 text-sm font-medium">{value}</p>
                    </div>
                  ))}
                </div>
                {detail.requests ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <caption className="sr-only">
                        Daily requests, failures, rate limits, and spend
                      </caption>
                      <thead className="text-muted-foreground border-b">
                        <tr>
                          {[
                            "Date",
                            "Requests",
                            "Failed",
                            "Limited",
                            "Spend",
                          ].map((label) => (
                            <th key={label} className="px-2 py-2 font-medium">
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[...detail.days].reverse().map((day) => (
                          <tr key={day.date} className="border-b last:border-0">
                            <td className="px-2 py-2">{usageDate(day.date)}</td>
                            <td className="px-2 py-2 tabular-nums">
                              {day.requests.toLocaleString("en-US")}
                            </td>
                            <td className="px-2 py-2 tabular-nums">
                              {day.errors}
                            </td>
                            <td className="px-2 py-2 tabular-nums">
                              {day.limited}
                            </td>
                            <td className="px-2 py-2 tabular-nums">
                              {usageMoney(day.cost)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground py-5 text-sm">
                    No requests were recorded for {detail.model.name} in this
                    period. Browse the catalog to compare capabilities before
                    using this model.
                  </p>
                )}
                <DialogFooter>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/ai-chat/model-catalog">
                      Model catalog
                      <ExternalLink className="size-3.5" />
                    </Link>
                  </Button>
                </DialogFooter>
              </>
            )
          )}
        </DialogContent>
      </Dialog>
    </PlatformPage>
  );
}
