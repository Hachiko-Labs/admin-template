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
  type VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Copy,
  Download,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { SiAnthropic, SiGooglegemini, SiOpenai } from "react-icons/si";

import { AiWorkspaceShell } from "@/components/ai-chat/ai-workspace-shell";
import {
  CAPABILITIES,
  type CatalogModel,
  CATEGORIES,
  comparePrices,
  developerName,
  DEVELOPERS,
  exportModels,
  MODELS,
  priceParts,
  SOURCE,
} from "@/components/ai-chat/model-catalog/catalog-data";
import {
  CatalogDetail,
  copyModel,
} from "@/components/ai-chat/model-catalog/catalog-detail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

function DeveloperMark({ name }: { name: string }) {
  const Icon =
    name === "openai"
      ? SiOpenai
      : name === "anthropic"
        ? SiAnthropic
        : name === "google"
          ? SiGooglegemini
          : null;
  return (
    <span
      className="bg-background text-foreground/80 flex size-7 shrink-0 items-center justify-center rounded-md border text-xs font-medium"
      aria-hidden="true"
    >
      {Icon ? <Icon className="size-4" /> : name.slice(0, 2).toUpperCase()}
    </span>
  );
}

function Flag({ value, label }: { value: boolean; label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          className="inline-flex p-1"
          aria-label={`${label}: ${value ? "Yes" : "No"}`}
        >
          {value ? (
            <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <span className="text-muted-foreground/60">—</span>
          )}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        {label}: {value ? "Yes" : "No"}
      </TooltipContent>
    </Tooltip>
  );
}

function Price({ value }: { value: string }) {
  const { price, additional } = priceParts(value);
  return (
    <div className="text-right tabular-nums">
      <span
        className={cn(
          price === "Free" && "text-emerald-700 dark:text-emerald-400",
        )}
      >
        {price}
      </span>
      {additional && (
        <span className="text-muted-foreground mt-0.5 block text-[10px]">
          +{additional}
        </span>
      )}
    </div>
  );
}

function MultiFilter({
  label,
  options,
  selected,
  onChange,
  names = false,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (value: string[]) => void;
  names?: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          {label}
          {selected.length > 0 && (
            <span className="bg-muted rounded px-1.5 text-xs">
              {selected.length}
            </span>
          )}
          <ChevronDown className="text-muted-foreground size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="max-h-80 w-56 overflow-y-auto"
      >
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option}
            checked={selected.includes(option)}
            onSelect={(e) => e.preventDefault()}
            onCheckedChange={(checked) =>
              onChange(
                checked
                  ? [...selected, option]
                  : selected.filter((x) => x !== option),
              )
            }
          >
            {names ? developerName(option) : option}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const PRIVACY = ["Zero data retention", "No training", "Free tier"];

export function ModelCatalogScreen() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [developers, setDevelopers] = useState<string[]>([]);
  const [capabilities, setCapabilities] = useState<string[]>([]);
  const [privacy, setPrivacy] = useState<string[]>([]);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "released", desc: true },
  ]);
  const [visibility, setVisibility] = useState<VisibilityState>({});
  const [selected, setSelected] = useState<CatalogModel | null>(null);
  const data = useMemo(
    () =>
      MODELS.filter(
        (m) =>
          (category === "All" || m.category === category) &&
          (!developers.length || developers.includes(m.developer)) &&
          (!capabilities.length ||
            capabilities.some((c) => m.capabilities.includes(c))) &&
          privacy.every((p) =>
            p === "Zero data retention"
              ? m.zdr
              : p === "No training"
                ? m.noTraining
                : m.freeTier,
          ),
      ),
    [category, developers, capabilities, privacy],
  );
  const columns = useMemo<ColumnDef<CatalogModel>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Model",
        size: 310,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="group/model flex items-center gap-2.5">
            <DeveloperMark name={row.original.developer} />
            <button
              className="min-w-0 flex-1 text-left focus-visible:underline focus-visible:outline-none"
              onClick={() => setSelected(row.original)}
            >
              <span
                className="block truncate font-medium"
                title={row.original.id}
              >
                {row.original.id.split("/")[1]}
              </span>
              <span className="text-muted-foreground mt-0.5 block text-[11px]">
                {developerName(row.original.developer)}
                <span className="px-1.5">·</span>
                {row.original.category}
              </span>
            </button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-6 shrink-0 opacity-0 group-hover/model:opacity-100 focus-visible:opacity-100"
              aria-label={`Copy ${row.original.id}`}
              onClick={() => void copyModel(row.original.id)}
            >
              <Copy className="size-3" />
            </Button>
          </div>
        ),
      },
      {
        accessorKey: "input",
        header: "Input",
        size: 100,
        sortingFn: (a, b) => comparePrices(a.original.input, b.original.input),
        cell: ({ row }) => <Price value={row.original.input} />,
      },
      {
        accessorKey: "output",
        header: "Output",
        size: 100,
        sortingFn: (a, b) =>
          comparePrices(a.original.output, b.original.output),
        cell: ({ row }) => <Price value={row.original.output} />,
      },
      {
        id: "latency",
        accessorFn: (m) => Number.parseFloat(m.latency) || undefined,
        header: "Latency",
        size: 108,
        sortUndefined: "last",
        cell: ({ row }) => (
          <span className="block text-right tabular-nums">
            {row.original.latency}
          </span>
        ),
      },
      {
        id: "providers",
        accessorFn: (m) => m.providers.join(" "),
        header: "Providers",
        size: 150,
        cell: ({ row }) => (
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={0} className="flex items-center gap-1.5">
                <span className="truncate">
                  {developerName(row.original.providers[0] || "Unknown")}
                </span>
                {row.original.providers.length + row.original.extraProviders >
                  1 && (
                  <span className="text-muted-foreground bg-muted rounded px-1 text-[10px]">
                    +
                    {row.original.providers.length +
                      row.original.extraProviders -
                      1}
                  </span>
                )}
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-72">
              {row.original.providers.map(developerName).join(", ")}
              {row.original.extraProviders > 0 &&
                ` and ${row.original.extraProviders} more at source`}
            </TooltipContent>
          </Tooltip>
        ),
      },
      {
        accessorKey: "zdr",
        header: "ZDR",
        size: 82,
        cell: ({ row }) => (
          <Flag value={row.original.zdr} label="Zero data retention eligible" />
        ),
      },
      {
        accessorKey: "noTraining",
        header: "No training",
        size: 132,
        cell: ({ row }) => (
          <Flag
            value={row.original.noTraining}
            label="No prompt training eligible"
          />
        ),
      },
      {
        accessorKey: "freeTier",
        header: "Free tier",
        size: 116,
        cell: ({ row }) => (
          <Flag value={row.original.freeTier} label="Free tier eligible" />
        ),
      },
      {
        id: "capabilities",
        header: "Capabilities",
        size: 175,
        cell: ({ row }) => (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="flex w-full items-center gap-1.5 text-left"
                onClick={() => setSelected(row.original)}
              >
                <span className="text-muted-foreground truncate text-xs">
                  {row.original.capabilities
                    .filter((c) => c !== "Text")
                    .slice(0, 2)
                    .join(", ") || row.original.category}
                </span>
                {row.original.capabilities.filter((c) => c !== "Text").length +
                  row.original.extraCapabilities >
                  2 && (
                  <span className="text-muted-foreground shrink-0 text-[10px]">
                    +
                    {row.original.capabilities.filter((c) => c !== "Text")
                      .length +
                      row.original.extraCapabilities -
                      2}
                  </span>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-72">
              {row.original.capabilities.join(", ") || "See provider details"}
              {row.original.extraCapabilities > 0 &&
                ` · ${row.original.extraCapabilities} additional capabilities at source`}
            </TooltipContent>
          </Tooltip>
        ),
      },
      {
        id: "released",
        accessorFn: (m) =>
          m.released
            ? `${m.released.slice(6)}-${m.released.slice(0, 2)}-${m.released.slice(3, 5)}`
            : undefined,
        header: "Released",
        size: 120,
        sortUndefined: "last",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-xs tabular-nums">
            {row.original.released || "—"}
          </span>
        ),
      },
    ],
    [],
  );
  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility: visibility, globalFilter: query },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setVisibility,
    onGlobalFilterChange: setQuery,
    getRowId: (m) => m.id,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, _column, value) =>
      `${row.original.id} ${developerName(row.original.developer)} ${row.original.providers.join(" ")}`
        .toLowerCase()
        .includes(String(value).trim().toLowerCase()),
    initialState: { pagination: { pageIndex: 0, pageSize: 25 } },
  });
  const filteredCount = table.getFilteredRowModel().rows.length;
  const activeCount = developers.length + capabilities.length + privacy.length;
  const reset = () => {
    setQuery("");
    setCategory("All");
    setDevelopers([]);
    setCapabilities([]);
    setPrivacy([]);
    table.setPageIndex(0);
  };
  return (
    <AiWorkspaceShell headerTitle="Model catalog" hideNavigationSidebar>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[1700px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Model catalog
                </h1>
                <Badge variant="secondary" className="tabular-nums">
                  {MODELS.length}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1.5 text-sm">
                Find the right model for your next conversation, workflow, or
                agent.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                exportModels(
                  table.getSortedRowModel().rows.map((r) => r.original),
                )
              }
            >
              <Download className="size-3.5" />
              Export catalog
            </Button>
          </header>
          <section aria-label="Model catalog" className="min-w-0">
            <nav
              aria-label="Model category"
              className="flex gap-5 overflow-x-auto border-b"
            >
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  aria-pressed={category === c}
                  className={cn(
                    "shrink-0 border-b-2 px-0.5 pt-1 pb-3 text-sm transition-colors",
                    category === c
                      ? "border-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground border-transparent",
                  )}
                >
                  {c}
                  <span className="text-muted-foreground ml-1.5 text-[11px] tabular-nums">
                    {c === "All"
                      ? MODELS.length
                      : MODELS.filter((m) => m.category === c).length}
                  </span>
                </button>
              ))}
            </nav>
            <div className="flex flex-wrap items-center gap-2 py-4">
              <div className="relative w-full sm:w-64">
                <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-3.5" />
                <Input
                  className="h-9 pl-8 text-sm"
                  placeholder="Search models or providers…"
                  aria-label="Search models"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <MultiFilter
                label="Developers"
                options={DEVELOPERS}
                selected={developers}
                onChange={setDevelopers}
                names
              />
              <MultiFilter
                label="Capabilities"
                options={CAPABILITIES}
                selected={capabilities}
                onChange={setCapabilities}
              />
              <MultiFilter
                label="Privacy & access"
                options={PRIVACY}
                selected={privacy}
                onChange={setPrivacy}
              />
              {(activeCount > 0 || query) && (
                <Button variant="ghost" size="sm" onClick={reset}>
                  Reset
                  <X className="size-3.5" />
                </Button>
              )}
              <div className="ml-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <SlidersHorizontal className="size-3.5" />
                      Columns
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {table
                      .getAllLeafColumns()
                      .filter((c) => c.getCanHide())
                      .map((c) => (
                        <DropdownMenuCheckboxItem
                          key={c.id}
                          checked={c.getIsVisible()}
                          onSelect={(e) => e.preventDefault()}
                          onCheckedChange={(v) => c.toggleVisibility(v)}
                        >
                          {String(c.columnDef.header)}
                        </DropdownMenuCheckboxItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            {activeCount > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {[
                  [developers, setDevelopers],
                  [capabilities, setCapabilities],
                  [privacy, setPrivacy],
                ].map(([values, setValues], i) =>
                  (values as string[]).map((v) => (
                    <button
                      key={`${i}-${v}`}
                      className="bg-muted inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs"
                      aria-label={`Remove ${v} filter`}
                      onClick={() =>
                        (setValues as (v: string[]) => void)(
                          (values as string[]).filter((x) => x !== v),
                        )
                      }
                    >
                      {i === 0 ? developerName(v) : v}
                      <X className="size-3" />
                    </button>
                  )),
                )}
              </div>
            )}
            <div className="overflow-hidden rounded-lg border [&>div]:max-h-[calc(100svh-330px)] [&>div]:min-h-64">
              <Table
                className="table-fixed"
                style={{ minWidth: table.getTotalSize() }}
              >
                <TableHeader className="sticky top-0 z-20">
                  <TableRow className="hover:bg-muted">
                    <>
                      {table.getHeaderGroups()[0].headers.map((h) => (
                        <TableHead
                          key={h.id}
                          style={{ width: h.getSize() }}
                          aria-sort={
                            h.column.getIsSorted() === "asc"
                              ? "ascending"
                              : h.column.getIsSorted() === "desc"
                                ? "descending"
                                : undefined
                          }
                          className={cn(
                            "bg-muted h-11 border-r px-4 text-xs font-normal whitespace-nowrap last:border-r-0",
                            h.id === "id" && "sticky left-0 z-30",
                          )}
                        >
                          {h.column.getCanSort() ? (
                            <button
                              className="hover:text-foreground flex w-full items-center justify-between gap-3 text-left"
                              onClick={h.column.getToggleSortingHandler()}
                              aria-label={`Sort by ${h.column.columnDef.header}`}
                            >
                              {flexRender(
                                h.column.columnDef.header,
                                h.getContext(),
                              )}
                              {h.column.getIsSorted() === "asc" ? (
                                <ArrowUp className="size-3 shrink-0" />
                              ) : h.column.getIsSorted() === "desc" ? (
                                <ArrowDown className="size-3 shrink-0" />
                              ) : (
                                <ArrowUpDown className="size-2.5 shrink-0 opacity-40" />
                              )}
                            </button>
                          ) : (
                            flexRender(
                              h.column.columnDef.header,
                              h.getContext(),
                            )
                          )}
                        </TableHead>
                      ))}
                    </>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} className="group h-[54px]">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "overflow-hidden border-r px-3 py-2 text-xs last:border-r-0",
                            cell.column.id === "id" &&
                              "bg-background group-hover:bg-muted sticky left-0 z-10",
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  {!filteredCount && (
                    <TableRow>
                      <TableCell
                        colSpan={table.getVisibleLeafColumns().length}
                        className="h-64 text-center"
                      >
                        <p className="text-sm font-medium">
                          No models match these filters
                        </p>
                        <p className="text-muted-foreground mt-1 text-xs">
                          Search a different name or remove a filter.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4"
                          onClick={reset}
                        >
                          Clear filters
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <footer className="flex flex-wrap items-center justify-between gap-3 py-3 text-xs">
              <p className="text-muted-foreground tabular-nums">
                {filteredCount
                  ? table.getState().pagination.pageIndex *
                      table.getState().pagination.pageSize +
                    1
                  : 0}
                –
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  filteredCount,
                )}{" "}
                of {filteredCount} models
              </p>
              <div className="flex items-center gap-4">
                <div className="hidden items-center gap-2 sm:flex">
                  <span className="text-muted-foreground">Rows per page</span>
                  <Select
                    value={String(table.getState().pagination.pageSize)}
                    onValueChange={(v) => table.setPageSize(Number(v))}
                  >
                    <SelectTrigger
                      aria-label="Rows per page"
                      className="h-8 w-17 text-xs"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[25, 50, 100].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <span className="tabular-nums">
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {Math.max(1, table.getPageCount())}
                </span>
                <div className="flex gap-1">
                  {[
                    {
                      label: "First page",
                      icon: ChevronsLeft,
                      disabled: !table.getCanPreviousPage(),
                      click: () => table.firstPage(),
                    },
                    {
                      label: "Previous page",
                      icon: ChevronLeft,
                      disabled: !table.getCanPreviousPage(),
                      click: () => table.previousPage(),
                    },
                    {
                      label: "Next page",
                      icon: ChevronRight,
                      disabled: !table.getCanNextPage(),
                      click: () => table.nextPage(),
                    },
                    {
                      label: "Last page",
                      icon: ChevronsRight,
                      disabled: !table.getCanNextPage(),
                      click: () => table.lastPage(),
                    },
                  ].map(({ label, icon: Icon, disabled, click }) => (
                    <Button
                      key={label}
                      variant="outline"
                      size="icon-sm"
                      className="size-7"
                      aria-label={label}
                      disabled={disabled}
                      onClick={click}
                    >
                      <Icon className="size-3.5" />
                    </Button>
                  ))}
                </div>
              </div>
            </footer>
            <div className="text-muted-foreground flex flex-wrap justify-between gap-2 border-t pt-4 text-[11px] leading-5">
              <p>
                Prices retain their billing units. ZDR and no-training
                eligibility depend on the routing provider.
              </p>
              <a
                href={SOURCE}
                target="_blank"
                rel="noreferrer"
                className="decoration-muted-foreground/40 underline underline-offset-4"
              >
                Vercel AI Gateway · Snapshot 19 Sep 2026
              </a>
            </div>
          </section>
        </div>
      </div>
      <CatalogDetail model={selected} onClose={() => setSelected(null)} />
    </AiWorkspaceShell>
  );
}
