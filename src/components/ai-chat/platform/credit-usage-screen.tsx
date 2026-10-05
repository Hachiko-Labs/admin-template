"use client";

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChartNoAxesColumn,
  Download,
  Plus,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  type CreditAudience,
  type CreditPeriod,
  creditUsageData,
  type CreditUsageRow,
} from "./credit-usage-data";
import { downloadFile } from "./platform-data";
import { NoResults, PlatformPage } from "./platform-ui";

const number = (value: number) => value.toLocaleString("en-US");
const compact = (value: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
type SortKey = "runs" | "hours" | "credits";

export function CreditUsageScreen() {
  const [period, setPeriod] = useState<CreditPeriod>("weekly");
  const [audience, setAudience] = useState<CreditAudience>("agents");
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [sort, setSort] = useState<{
    key: SortKey;
    direction: "asc" | "desc";
  } | null>(null);
  const data = creditUsageData(period);
  const source = data[audience];
  const total = data.organizationCredits + data.agentCredits;
  const groupTotal = source.reduce((sum, row) => sum + row.credits, 0);
  const options = [...new Set(source.map((row) => row.category))];
  const rows = source.filter(
    (row) =>
      `${row.name} ${row.category}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()) &&
      (!categories.length || categories.includes(row.category)),
  );
  if (sort)
    rows.sort(
      (a, b) =>
        (a[sort.key] - b[sort.key]) * (sort.direction === "asc" ? 1 : -1),
    );
  const share = (row: CreditUsageRow) =>
    `${((row.credits / groupTotal) * 100).toFixed(1)}%`;
  function resetFilters() {
    setQuery("");
    setCategories([]);
  }
  function changeAudience(value: string) {
    setAudience(value as CreditAudience);
    resetFilters();
    setSort(null);
  }
  function exportReport() {
    const fields = [
      audience === "agents" ? "Agent" : "User",
      audience === "agents" ? "Category" : "Team",
      "Runs",
      "Hours saved",
      "Credits used",
      "% usage",
      "Period",
    ];
    const csv = [
      fields,
      ...rows.map((row) => [
        row.name,
        row.category,
        row.runs,
        row.hours,
        row.credits,
        share(row),
        data.periodLabel,
      ]),
    ]
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\r\n");
    downloadFile(
      `credit-usage-${audience}-${period}.csv`,
      csv,
      "text/csv;charset=utf-8",
    );
    toast.success(
      `Exported ${rows.length} ${audience === "agents" ? "agents" : "users"}`,
    );
  }
  function numericHeading(key: SortKey, label: string) {
    const active = sort?.key === key;
    const Icon = active
      ? sort.direction === "asc"
        ? ArrowUp
        : ArrowDown
      : ArrowUpDown;
    return (
      <TableHead
        className="text-right"
        aria-sort={
          active
            ? sort.direction === "asc"
              ? "ascending"
              : "descending"
            : "none"
        }
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            setSort({
              key,
              direction: active && sort.direction === "desc" ? "asc" : "desc",
            })
          }
          aria-label={`Sort by ${label.toLowerCase()}`}
        >
          {label}
          <Icon data-icon="inline-end" />
        </Button>
      </TableHead>
    );
  }
  return (
    <Tabs
      value={period}
      onValueChange={(value) => setPeriod(value as CreditPeriod)}
      className="flex min-h-0 min-w-0 flex-1 flex-col"
    >
      <TabsContent
        value={period}
        className="mt-0 flex min-h-0 min-w-0 flex-1 flex-col"
      >
        <PlatformPage
          title="Credit usage"
          description="A closer look at what your team is creating, running, and saving."
          contentClassName="max-w-5xl"
          actions={
            <TabsList aria-label="Usage period">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
            </TabsList>
          }
        >
          <div className="flex flex-col gap-10 pt-3">
            <Card className="overflow-hidden">
              <CardHeader className="flex-row flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                    <ChartNoAxesColumn className="size-5" aria-hidden="true" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <CardTitle>Business plan</CardTitle>
                    <CardDescription>
                      Team workspace · Monthly billing
                    </CardDescription>
                  </div>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/ai-chat/billing">Manage plan</Link>
                </Button>
              </CardHeader>
              <Separator />
              <CardContent className="flex flex-col gap-5 pt-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground text-xs">
                      Credits used this {period === "daily" ? "day" : "week"}
                    </span>
                    <span className="text-3xl font-semibold tracking-tight tabular-nums">
                      {number(total)}
                    </span>
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {data.periodLabel}
                  </span>
                </div>
                <div
                  role="img"
                  aria-label={`Credit usage: organization ${number(data.organizationCredits)} credits, agents ${number(data.agentCredits)} credits`}
                  className="flex h-3 gap-1"
                >
                  <div
                    className="rounded-md bg-emerald-500 transition-[width] duration-300 motion-reduce:transition-none"
                    style={{
                      width: `${(data.organizationCredits / total) * 100}%`,
                    }}
                  />
                  <div
                    className="rounded-md bg-emerald-500/35 transition-[width] duration-300 motion-reduce:transition-none"
                    style={{ width: `${(data.agentCredits / total) * 100}%` }}
                  />
                </div>
                <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-sm">
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    <span className="flex items-center gap-2">
                      <span className="size-2 rounded-sm bg-emerald-500" />
                      Organization usage ({compact(
                        data.organizationCredits,
                      )}{" "}
                      credits)
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="size-2 rounded-sm bg-emerald-500/35" />
                      Agent usage ({compact(data.agentCredits)} credits)
                    </span>
                  </div>
                  <span>Renews on 28 Sep 2026</span>
                </div>
              </CardContent>
              <Separator />
              <CardFooter className="grid grid-cols-2 divide-x p-0 md:grid-cols-4">
                {[
                  { label: "Hours saved", value: number(data.hours) },
                  {
                    label:
                      audience === "agents" ? "Active agents" : "Active users",
                    value: source.length,
                  },
                  { label: "Completed runs", value: number(data.runs) },
                  {
                    label:
                      period === "weekly"
                        ? "Runs / day avg."
                        : "Runs / hour avg.",
                    value: number(
                      Math.round(data.runs / (period === "weekly" ? 7 : 24)),
                    ),
                  },
                ].map((metric) => (
                  <div key={metric.label} className="flex flex-col gap-1.5 p-5">
                    <span className="text-2xl font-semibold tracking-tight tabular-nums">
                      {metric.value}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {metric.label}
                    </span>
                  </div>
                ))}
              </CardFooter>
            </Card>
            <Tabs
              value={audience}
              onValueChange={changeAudience}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <TabsList aria-label="Usage breakdown">
                  <TabsTrigger value="agents">Agents</TabsTrigger>
                  <TabsTrigger value="users">Power users</TabsTrigger>
                </TabsList>
                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                  <InputGroup className="w-full sm:w-60">
                    <InputGroupAddon>
                      <Search />
                    </InputGroupAddon>
                    <InputGroupInput
                      aria-label={
                        audience === "agents" ? "Search agents" : "Search users"
                      }
                      placeholder={
                        audience === "agents"
                          ? "Search agents…"
                          : "Search users…"
                      }
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                    />
                  </InputGroup>
                  <Button
                    variant="outline"
                    onClick={exportReport}
                    disabled={!rows.length}
                  >
                    <Download data-icon="inline-start" />
                    Export
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="border-dashed">
                        <Plus data-icon="inline-start" />
                        Filter
                        {categories.length > 0 ? ` (${categories.length})` : ""}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-60">
                      <DropdownMenuLabel>
                        {audience === "agents" ? "Category" : "Team"}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        {options.map((category) => (
                          <DropdownMenuCheckboxItem
                            key={category}
                            checked={categories.includes(category)}
                            onSelect={(event) => event.preventDefault()}
                            onCheckedChange={(checked) =>
                              setCategories((current) =>
                                checked
                                  ? [...current, category]
                                  : current.filter((item) => item !== category),
                              )
                            }
                          >
                            {category}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <TabsContent
                value={audience}
                className="mt-0 flex flex-col gap-3"
              >
                <div className="overflow-hidden rounded-xl border">
                  <Table className="min-w-[800px]">
                    <TableHeader>
                      <TableRow className="bg-muted/35">
                        <TableHead className="w-[32%] px-5">
                          {audience === "agents" ? "Agent" : "User"}
                        </TableHead>
                        <TableHead className="w-[23%]">
                          {audience === "agents" ? "Category" : "Team"}
                        </TableHead>
                        {numericHeading("runs", "Runs")}
                        {numericHeading("hours", "Hours saved")}
                        {numericHeading("credits", "Credits used")}
                        <TableHead className="pr-5 text-right">Share</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.length ? (
                        rows.map((row) => (
                          <TableRow key={row.name}>
                            <TableCell className="px-5 py-5 font-medium">
                              {row.name}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {row.category}
                            </TableCell>
                            <TableCell className="px-5 text-right tabular-nums">
                              {number(row.runs)}
                            </TableCell>
                            <TableCell className="px-5 text-right tabular-nums">
                              {number(row.hours)}
                            </TableCell>
                            <TableCell className="px-5 text-right tabular-nums">
                              {number(row.credits)}
                            </TableCell>
                            <TableCell className="pr-5 text-right tabular-nums">
                              {share(row)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6}>
                            <NoResults
                              title={
                                audience === "agents"
                                  ? "No agents found"
                                  : "No users found"
                              }
                              onClear={resetFilters}
                            />
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div
                  className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-xs"
                  aria-live="polite"
                >
                  <span>
                    {rows.length} of {source.length}{" "}
                    {audience === "agents" ? "agents" : "users"}{" "}
                    {categories.length > 0 || query ? (
                      <Button variant="link" size="sm" onClick={resetFilters}>
                        Clear filters
                      </Button>
                    ) : null}
                  </span>
                  <span>
                    {data.periodLabel} · Share of{" "}
                    {audience === "agents" ? "agent" : "total"} credits
                  </span>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </PlatformPage>
      </TabsContent>
    </Tabs>
  );
}
