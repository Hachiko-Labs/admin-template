"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowUp,
  ArrowUpDown,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";

import { AiWorkspaceShell } from "@/components/ai-chat/ai-workspace-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  BenchmarkComparison,
  BenchmarkLegend,
  DEVELOPERS,
  duration,
} from "./benchmark-comparison";
import snapshot from "./benchmark-results.json";

type Result = (typeof snapshot.rows)[number];
export function ModelBenchmarksScreen() {
  const [search, setSearch] = useState("");
  const [hidden, setHidden] = useState<string[]>([]);
  const [detail, setDetail] = useState<Result | null>(null);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "score", desc: true },
  ]);
  const data = useMemo(
    () => snapshot.rows.filter((row) => !hidden.includes(row.lab)),
    [hidden],
  );
  const columns = useMemo<ColumnDef<Result>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Model",
        cell: ({ row }) => (
          <button className="text-left" onClick={() => setDetail(row.original)}>
            <span className="flex items-center gap-2 font-medium">
              <span
                className="size-1.5 shrink-0 rounded-full"
                style={{
                  background: DEVELOPERS.find(
                    (d) => d.name === row.original.lab,
                  )?.color,
                }}
              />
              {row.original.name}
              <span className="text-muted-foreground text-xs font-normal">
                {row.original.setting}
              </span>
            </span>
            <span className="text-muted-foreground mt-1 block pl-3.5 text-xs">
              {row.original.slug}
            </span>
          </button>
        ),
      },
      {
        accessorKey: "score",
        header: "Score",
        cell: ({ getValue }) => (
          <span className="font-semibold tabular-nums">
            {Number(getValue()).toFixed(2)}
          </span>
        ),
      },
      {
        accessorKey: "recall",
        header: "Recall",
        cell: ({ getValue }) => `${Number(getValue()).toFixed(1)}%`,
      },
      {
        accessorKey: "precision",
        header: "Precision",
        cell: ({ getValue }) => `${Number(getValue()).toFixed(1)}%`,
      },
      { accessorKey: "falsePositives", header: "False positives" },
      {
        accessorKey: "cost",
        header: "Cost",
        cell: ({ getValue }) => `$${Number(getValue()).toFixed(2)}`,
      },
      {
        accessorKey: "seconds",
        header: "Total time",
        cell: ({ getValue }) => duration(Number(getValue())),
      },
      {
        accessorKey: "tokens",
        header: "Tokens",
        cell: ({ getValue }) =>
          `${(Number(getValue()) / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k`,
      },
      {
        accessorKey: "harness",
        header: "Harness",
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{String(getValue())}</span>
        ),
      },
      {
        id: "inspect",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Inspect ${row.original.name} ${row.original.setting}`}
            onClick={() => setDetail(row.original)}
          >
            <ChevronRight className="size-3.5" />
          </Button>
        ),
      },
    ],
    [],
  );
  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter: search },
    initialState: { pagination: { pageSize: 15 } },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  const visible = table.getFilteredRowModel().rows.map((row) => row.original);
  function inspect(id: string) {
    setDetail(snapshot.rows.find((row) => row.id === id) ?? null);
  }
  function exportResults() {
    const csv = [
      "Model,Reasoning,Score,Recall,Precision,False positives,Cost USD,Total seconds,Tokens,Harness",
      ...visible.map((r) =>
        [
          r.name,
          r.setting,
          r.score,
          r.recall,
          r.precision,
          r.falsePositives,
          r.cost,
          r.seconds,
          r.tokens,
          r.harness,
        ]
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(","),
      ),
    ].join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "shadcnbench-2026-09-19.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <AiWorkspaceShell
      headerTitle="Model benchmarks"
      headerActions={
        <Button variant="ghost" size="sm" onClick={exportResults}>
          <ArrowDownToLine className="size-4" />
          Export results
        </Button>
      }
      hideNavigationSidebar
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1560px] px-5 py-7 sm:px-8 lg:px-10">
          <header className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">
              ShadcnBench
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-6">
              Model performance on code vulnerability detection, measured by
              quality, cost, and runtime.
            </p>
          </header>
          <div className="grid gap-x-10 gap-y-7 lg:grid-cols-2">
            <BenchmarkComparison
              data={visible}
              metric="cost"
              selectedId={detail?.id}
              onSelect={inspect}
            />
            <BenchmarkComparison
              data={visible}
              metric="seconds"
              selectedId={detail?.id}
              onSelect={inspect}
            />
          </div>
          <div className="mt-2 mb-6 flex flex-wrap items-center justify-center gap-3 border-b pb-5">
            <BenchmarkLegend
              hidden={hidden}
              onToggle={(name) =>
                setHidden((current) =>
                  current.includes(name)
                    ? current.filter((item) => item !== name)
                    : [...current, name],
                )
              }
            />
            {hidden.length > 0 && (
              <button
                className="text-xs underline"
                onClick={() => setHidden([])}
              >
                Show all
              </button>
            )}
          </div>
          <section aria-label="Benchmark results">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-medium">Results</h2>
                <span className="text-muted-foreground text-xs">
                  {visible.length} configurations
                </span>
              </div>
              <div className="relative">
                <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" />
                <Input
                  aria-label="Search models"
                  placeholder="Search models or harness…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 w-64 pl-9"
                />
              </div>
            </div>
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((group) => (
                    <TableRow
                      key={group.id}
                      className="bg-muted/30 hover:bg-muted/30"
                    >
                      {group.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          aria-sort={
                            header.column.getIsSorted() === "asc"
                              ? "ascending"
                              : header.column.getIsSorted() === "desc"
                                ? "descending"
                                : "none"
                          }
                          className="h-11 px-4 text-xs whitespace-nowrap"
                        >
                          {header.column.getCanSort() ? (
                            <button
                              className="flex items-center gap-1.5"
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                              {header.column.getIsSorted() === "desc" ? (
                                <ArrowDown className="size-3" />
                              ) : header.column.getIsSorted() === "asc" ? (
                                <ArrowUp className="size-3" />
                              ) : (
                                <ArrowUpDown className="size-3 opacity-40" />
                              )}
                            </button>
                          ) : null}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="cursor-pointer"
                      onClick={() => setDetail(row.original)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="px-4 py-3 text-xs whitespace-nowrap tabular-nums"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  {!visible.length && (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="text-muted-foreground h-28 text-center"
                      >
                        No matching configurations.{" "}
                        <button
                          className="underline"
                          onClick={() => {
                            setSearch("");
                            setHidden([]);
                          }}
                        >
                          Clear filters
                        </button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="text-muted-foreground mt-4 flex items-center justify-between text-xs">
              <span>
                {visible.length
                  ? table.getState().pagination.pageIndex * 15 + 1
                  : 0}
                –
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * 15,
                  visible.length,
                )}{" "}
                of {visible.length} results
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={!table.getCanPreviousPage()}
                  onClick={() => table.previousPage()}
                  aria-label="Previous results"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span>
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {Math.max(1, table.getPageCount())}
                </span>
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={!table.getCanNextPage()}
                  onClick={() => table.nextPage()}
                  aria-label="Next results"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </section>
          <p className="text-muted-foreground mt-7 text-xs leading-5">
            Source:{" "}
            <a
              href={snapshot.source}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2"
            >
              Vercel AI Gateway · DeepsecBench
            </a>
            , using the deepsec cyber harness. Scores apply to this security
            benchmark; they are not a general model quality rating.
          </p>
        </div>
      </div>
      <Sheet
        open={!!detail}
        onOpenChange={(open) => {
          if (!open) setDetail(null);
        }}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {detail && (
            <>
              <SheetHeader className="border-b pb-5">
                <SheetTitle>{detail.name}</SheetTitle>
                <SheetDescription>
                  {detail.slug} · {detail.setting} reasoning
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-6 py-6">
                <div>
                  <p className="text-muted-foreground text-xs">
                    ShadcnBench score
                  </p>
                  <p className="mt-2 text-4xl font-semibold tracking-tight">
                    {detail.score.toFixed(2)}
                  </p>
                  <p className="text-muted-foreground mt-2 text-xs leading-5">
                    The benchmark combines recall and precision into its
                    reported score.
                  </p>
                </div>
                <dl className="divide-y rounded-lg border px-4">
                  {[
                    ["Recall", `${detail.recall}%`],
                    ["Precision", `${detail.precision}%`],
                    ["False positives", detail.falsePositives],
                    ["Total cost", `$${detail.cost.toFixed(2)}`],
                    ["Total time", duration(detail.seconds)],
                    ["Tokens", detail.tokens.toLocaleString()],
                    ["Harness", detail.harness],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex justify-between py-3 text-sm"
                    >
                      <dt className="text-muted-foreground">{label}</dt>
                      <dd className="tabular-nums">{value}</dd>
                    </div>
                  ))}
                </dl>
                <div>
                  <h3 className="text-sm font-medium">Reading these results</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-6">
                    Recall measures how many vulnerabilities were found.
                    Precision measures how many reported findings were correct.
                    Cost and time cover the full benchmark run for this
                    configuration.
                  </p>
                </div>
                <a
                  href={detail.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm"
                >
                  View model on AI Gateway
                  <ArrowUpRight className="size-4" />
                </a>
                <p className="text-muted-foreground text-xs">
                  Captured 19 September 2026. Source results have not been
                  modified.
                </p>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AiWorkspaceShell>
  );
}
