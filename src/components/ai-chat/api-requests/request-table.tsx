"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Copy,
  Download,
  SlidersHorizontal,
} from "lucide-react";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { RequestCell } from "./request-cell";
import {
  type ApiRequest,
  copyText,
  formatCost,
  formatMs,
  formatTime,
  statusLabel,
} from "./request-data";

const REGION_LABELS = new Map([
  ["iad1", "Washington D.C."],
  ["fra1", "Frankfurt"],
  ["sfo1", "San Francisco"],
]);

export function RequestStatus({ status }: { status: number }) {
  return (
    <span
      className={
        status === 200
          ? "inline-flex rounded border border-emerald-600/20 bg-emerald-50 px-1.5 py-0.5 font-mono text-xs text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-900/30 dark:text-emerald-400"
          : status < 500
            ? "text-warning bg-warning/10 border-warning/20 inline-flex rounded border px-1.5 py-0.5 font-mono text-xs"
            : "text-destructive bg-destructive/10 border-destructive/20 inline-flex rounded border px-1.5 py-0.5 font-mono text-xs"
      }
      title={statusLabel(status)}
    >
      {status}
    </span>
  );
}
function exportCsv(rows: ApiRequest[]) {
  const fields: (keyof ApiRequest)[] = [
    "id",
    "timestamp",
    "source",
    "endpoint",
    "model",
    "provider",
    "status",
    "latency",
    "ttft",
    "input",
    "output",
    "cost",
    "project",
    "environment",
    "cache",
  ];
  const csv = [
    fields.join(","),
    ...rows.map((row) =>
      fields.map((key) => JSON.stringify(row[key])).join(","),
    ),
  ].join("\n");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8;" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "api-requests-demo.csv";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast.success(`Exported ${rows.length} sample requests`);
}

export function RequestTable({
  rows,
  onOpen,
  onReset,
  toolsElement,
}: {
  toolsElement: HTMLDivElement | null;
  rows: ApiRequest[];
  onOpen: (row: ApiRequest, ordered: ApiRequest[]) => void;
  onReset: () => void;
}) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "timestamp", desc: true },
  ]);
  const [visibility, setVisibility] = useState<VisibilityState>({
    source: false,
    provider: false,
    region: false,
    ttft: false,
    tokens: false,
    cost: false,
    project: false,
    cache: false,
  });
  const [selection, setSelection] = useState({});
  const [limit, setLimit] = useState(80);
  const columns = useMemo<ColumnDef<ApiRequest>[]>(
    () => [
      {
        id: "select",
        enableHiding: false,
        size: 36,
        header: ({ table }) => (
          <Checkbox
            className="rounded-[4px]"
            aria-label="Select all filtered requests"
            checked={
              table.getIsAllRowsSelected() ||
              (table.getIsSomeRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            className="rounded-[4px]"
            aria-label={`Select ${row.original.id}`}
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            onClick={(event) => event.stopPropagation()}
          />
        ),
      },
      {
        id: "level",
        header: "",
        size: 36,
        cell: ({ row }) => (
          <span
            aria-label={
              row.original.status === 200
                ? "Success"
                : row.original.status < 500
                  ? "Warning"
                  : "Error"
            }
            className={
              row.original.status === 200
                ? "inline-block size-3.5 rounded-[4px] bg-emerald-500"
                : row.original.status < 500
                  ? "bg-warning inline-block size-3.5 rounded-[4px]"
                  : "bg-destructive inline-block size-3.5 rounded-[4px]"
            }
          />
        ),
      },
      {
        accessorKey: "timestamp",
        header: "Date",
        size: 184,
        cell: ({ row }) => (
          <span className="font-mono text-sm">
            Sep {new Date(row.original.timestamp).getUTCDate()}, 2026{" "}
            {formatTime(row.original.timestamp)}
          </span>
        ),
      },
      {
        accessorKey: "id",
        header: "Request Id",
        size: 150,
        cell: ({ row, table }) => (
          <button
            className="block w-full truncate text-left hover:underline"
            onClick={(event) => {
              event.stopPropagation();
              onOpen(
                row.original,
                table.getRowModel().rows.map((item) => item.original),
              );
            }}
            aria-label={`Inspect ${row.original.id}`}
          >
            {row.original.id}
          </button>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 60,
        cell: ({ row }) => <RequestStatus status={row.original.status} />,
      },
      { accessorKey: "source", header: "Log source", size: 120 },
      { accessorKey: "provider", header: "Provider", size: 85 },
      {
        accessorKey: "model",
        header: "Model",
        size: 135,
        cell: ({ row }) => (
          <span className="block truncate">{row.original.model}</span>
        ),
      },
      {
        accessorKey: "endpoint",
        header: "Endpoint",
        size: 140,
        cell: ({ row }) => (
          <span className="block truncate">{row.original.endpoint}</span>
        ),
      },
      {
        accessorKey: "latency",
        header: "Latency",
        size: 105,
        cell: ({ row }) => (
          <div className="relative -mx-2 -my-2 px-2 py-2">
            <span
              className="bg-primary/5 absolute inset-y-0 left-0"
              style={{ width: `${(row.original.latency / 8200) * 100}%` }}
            />
            <span className="relative font-mono">
              {row.original.latency.toLocaleString("en-US")}ms
            </span>
          </div>
        ),
      },
      {
        accessorKey: "region",
        header: "Regions",
        size: 132,
        cell: ({ row }) => (
          <span>
            {row.original.region}{" "}
            <span className="text-muted-foreground text-xs">
              {REGION_LABELS.get(row.original.region)}
            </span>
          </span>
        ),
      },
      {
        id: "timing",
        header: "Timing Phases",
        size: 160,
        cell: ({ row }) => {
          const first = Math.max(24, row.original.ttft || row.original.latency);
          return (
            <div
              className="flex h-4 w-full"
              aria-label={`Gateway 24 ms, first response ${first - 24} ms, generation ${row.original.latency - first} ms`}
            >
              <span
                style={{
                  width: `${(24 / row.original.latency) * 100}%`,
                  minWidth: 5,
                  background:
                    "color-mix(in oklch, var(--primary) 46%, var(--background))",
                }}
              />
              <span
                style={{
                  width: `${((first - 24) / row.original.latency) * 100}%`,
                  background:
                    "color-mix(in oklch, var(--primary) 70%, var(--background))",
                }}
              />
              <span className="bg-primary flex-1" />
            </div>
          );
        },
      },
      {
        accessorKey: "ttft",
        header: "TTFT",
        size: 110,
        cell: ({ row }) =>
          row.original.ttft ? formatMs(row.original.ttft) : "—",
      },
      {
        id: "tokens",
        accessorFn: (row) => row.input + row.output,
        header: "Tokens",
        size: 90,
      },
      {
        accessorKey: "cost",
        header: "Cost",
        size: 95,
        cell: ({ row }) => formatCost(row.original.cost),
      },
      { accessorKey: "project", header: "Project", size: 150 },
      { accessorKey: "cache", header: "Cache", size: 80 },
    ],
    [onOpen],
  );
  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, columnVisibility: visibility, rowSelection: selection },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setVisibility,
    onRowSelectionChange: setSelection,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
  const ordered = table.getRowModel().rows;
  const selected = table.getSelectedRowModel().rows.map((row) => row.original);
  return (
    <section
      aria-label="API request results"
      className="flex min-h-0 flex-1 flex-col"
    >
      {toolsElement
        ? createPortal(
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Table settings"
                >
                  <SlidersHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="max-h-[70vh] overflow-y-auto"
              >
                <DropdownMenuLabel>Table controls</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    disabled={!rows.length}
                    onSelect={() =>
                      exportCsv(selected.length ? selected : rows)
                    }
                  >
                    <Download />
                    Export{" "}
                    {selected.length
                      ? `${selected.length} selected`
                      : "filtered rows"}
                  </DropdownMenuItem>
                  {selected.length ? (
                    <DropdownMenuItem
                      onSelect={() =>
                        void copyText(selected.map((row) => row.id).join("\n"))
                          .then(() => toast.success("Request IDs copied"))
                          .catch(() =>
                            toast.error("Could not access clipboard"),
                          )
                      }
                    >
                      <Copy />
                      Copy selected request IDs
                    </DropdownMenuItem>
                  ) : null}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
                <DropdownMenuGroup>
                  {table
                    .getAllLeafColumns()
                    .filter(
                      (column) => column.getCanHide() && column.id !== "level",
                    )
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(value)
                        }
                        onSelect={(event) => event.preventDefault()}
                      >
                        {String(column.columnDef.header)}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>,
            toolsElement,
          )
        : null}
      <div
        className="min-h-0 flex-1 overflow-hidden [&>div]:h-full [&>div]:overscroll-none"
        data-request-table-scroll
      >
        {rows.length ? (
          <Table
            className="table-fixed border-collapse text-sm whitespace-nowrap"
            style={{ minWidth: table.getTotalSize(), width: "100%" }}
            aria-label="API requests"
          >
            <TableHeader className="bg-muted sticky top-0 z-10">
              <TableRow>
                {table.getHeaderGroups()[0].headers.map((header) => (
                  <TableHead
                    key={header.id}
                    aria-sort={
                      header.column.getIsSorted() === "asc"
                        ? "ascending"
                        : header.column.getIsSorted() === "desc"
                          ? "descending"
                          : undefined
                    }
                    style={
                      ["endpoint", "timing"].includes(header.column.id)
                        ? undefined
                        : { width: header.getSize() }
                    }
                    className="bg-muted h-10 overflow-hidden border-r px-2 font-normal last:border-r-0"
                  >
                    {header.column.getCanSort() ? (
                      <button
                        type="button"
                        aria-label={`Sort by ${header.column.columnDef.header}`}
                        onClick={header.column.getToggleSortingHandler()}
                        className="text-muted-foreground hover:text-foreground flex w-full items-center justify-between gap-2 text-sm font-normal"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {header.column.getIsSorted() === "asc" ? (
                          <ArrowUp className="size-3" />
                        ) : header.column.getIsSorted() === "desc" ? (
                          <ArrowDown className="size-3" />
                        ) : (
                          <ArrowUpDown className="size-2.5 opacity-40" />
                        )}
                      </button>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordered.slice(0, limit).map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  className={
                    row.original.status === 200
                      ? "h-[37px] cursor-pointer"
                      : row.original.status < 500
                        ? "bg-warning/5 h-[37px] cursor-pointer"
                        : "bg-destructive/5 h-[37px] cursor-pointer"
                  }
                  onClick={() => {
                    if (window.getSelection()?.toString()) return;
                    onOpen(
                      row.original,
                      ordered.map((item) => item.original),
                    );
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="overflow-hidden border-r px-2 py-1.5 last:border-r-0"
                    >
                      {["select", "level"].includes(cell.column.id) ? (
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )
                      ) : (
                        <RequestCell
                          row={row.original}
                          column={cell.column.id}
                          label={String(cell.column.columnDef.header)}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </RequestCell>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="overflow-y-auto">
            <Empty className="min-h-full">
              <EmptyHeader>
                <EmptyTitle>No matching requests</EmptyTitle>
                <EmptyDescription>
                  Try a wider time range or remove a filter.
                </EmptyDescription>
              </EmptyHeader>
              <Button variant="outline" size="sm" onClick={onReset}>
                Clear filters
              </Button>
            </Empty>
          </div>
        )}
      </div>
      <div className="text-muted-foreground flex h-10 shrink-0 items-center justify-between gap-2 border-t px-4 text-[10px] md:px-5">
        <span>
          Showing {Math.min(limit, rows.length)} of {rows.length} requests{" "}
          <span className="hidden sm:inline">· All times UTC</span>
        </span>
        {limit < rows.length ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLimit((value) => value + 60)}
          >
            Load 60 more
          </Button>
        ) : (
          <span>End of results</span>
        )}
      </div>
    </section>
  );
}
