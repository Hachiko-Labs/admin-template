"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Copy,
  Ellipsis,
  Pencil,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

import type { StudioSkill } from "./studio-data";

export function SkillsTable({
  skills,
  onOpen,
}: {
  skills: StudioSkill[];
  onOpen: (skill: StudioSkill) => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All types");
  const [sorting, setSorting] = useState<SortingState>([]);
  const filteredSkills = useMemo(() => {
    const search = query.trim().toLowerCase();
    return skills.filter(
      (skill) =>
        (category === "All types" || skill.category === category) &&
        [skill.name, skill.description, ...skill.agents]
          .join(" ")
          .toLowerCase()
          .includes(search),
    );
  }, [skills, category, query]);
  const categories = [...new Set(skills.map((skill) => skill.category))];
  function resetFilters() {
    setQuery("");
    setCategory("All types");
  }

  const columns = useMemo<ColumnDef<StudioSkill>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Skill",
        size: 380,
        cell: ({ row }) => (
          <div className="min-w-0 py-1">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <button
                type="button"
                aria-label={row.original.name}
                onClick={() => onOpen(row.original)}
                className="focus-visible:ring-ring rounded-sm text-left text-[13px] font-medium outline-none hover:underline focus-visible:ring-2"
              >
                {row.original.name}
              </button>
              <span className="text-muted-foreground bg-muted rounded border px-1.5 py-0.5 text-[10px] leading-3">
                {row.original.category}
              </span>
            </div>
            <p className="text-muted-foreground mt-1.5 text-xs leading-5">
              {row.original.description}
            </p>
          </div>
        ),
      },
      {
        id: "agents",
        accessorFn: (skill) => skill.agents[0] ?? "Unassigned",
        header: "Used by",
        size: 240,
        cell: ({ row }) => (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={`Manage agents for ${row.original.name}`}
                onClick={() => onOpen(row.original)}
                className="focus-visible:ring-ring flex w-full min-w-0 items-center gap-2 rounded-sm text-left text-xs outline-none hover:underline focus-visible:ring-2"
              >
                <span className="truncate">
                  {row.original.agents[0] ?? "Unassigned"}
                </span>
                {row.original.agents.length > 1 && (
                  <span className="text-muted-foreground bg-muted shrink-0 rounded px-1.5 py-0.5 text-[10px] tabular-nums">
                    +{row.original.agents.length - 1}
                  </span>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-72">
              {row.original.agents.join(", ") || "No agents assigned"}
            </TooltipContent>
          </Tooltip>
        ),
      },
      {
        accessorKey: "updated",
        header: "Updated",
        size: 100,
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-muted-foreground text-xs whitespace-nowrap">
            {row.original.updated}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        size: 48,
        enableSorting: false,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Actions for ${row.original.name}`}
              >
                <Ellipsis className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                aria-label={`Edit ${row.original.name}`}
                onSelect={() => onOpen(row.original)}
              >
                <Pencil className="size-4" />
                Edit skill
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  void navigator.clipboard
                    .writeText(row.original.name)
                    .then(() => toast.success("Skill name copied"))
                    .catch(() => toast.error("Could not copy skill name"));
                }}
              >
                <Copy className="size-4" />
                Copy name
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [onOpen],
  );
  const table = useReactTable({
    data: filteredSkills,
    columns,
    getRowId: (skill) => skill.id,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <section className="mt-10" aria-labelledby="individual-title">
      <h2
        id="individual-title"
        className="mb-4 flex items-center gap-2 text-sm font-medium"
      >
        Workspace skills{" "}
        <span className="text-muted-foreground text-xs font-normal">
          {skills.length}
        </span>
      </h2>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-3.5" />
          <Input
            aria-label="Search studio skills"
            placeholder="Search skills or agents…"
            className="h-9 pl-8 text-sm"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger aria-label="Skill type" className="h-9 w-40 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All types">All types</SelectItem>
            {categories.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(query || category !== "All types") && (
          <Button size="sm" variant="ghost" onClick={resetFilters}>
            Reset
          </Button>
        )}
      </div>
      <div className="overflow-hidden rounded-lg border">
        <Table
          aria-label="Workspace skills"
          className="table-fixed"
          style={{ minWidth: table.getTotalSize() }}
        >
          <TableHeader>
            <TableRow className="hover:bg-muted/40">
              {table.getHeaderGroups()[0].headers.map((header) => (
                <TableHead
                  key={header.id}
                  style={
                    header.column.id === "name"
                      ? undefined
                      : { width: header.getSize() }
                  }
                  aria-sort={
                    header.column.getIsSorted() === "asc"
                      ? "ascending"
                      : header.column.getIsSorted() === "desc"
                        ? "descending"
                        : undefined
                  }
                  className={cn(
                    "bg-muted/40 h-10 px-4 text-xs font-normal",
                    header.id === "actions" && "px-2",
                  )}
                >
                  {header.column.getCanSort() ? (
                    <button
                      type="button"
                      className="focus-visible:ring-ring hover:text-foreground inline-flex items-center gap-2 rounded-sm text-left outline-none focus-visible:ring-2"
                      aria-label={`Sort by ${header.column.columnDef.header}`}
                      onClick={header.column.getToggleSortingHandler()}
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
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="h-[76px]">
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      "px-4 py-3",
                      cell.column.id === "actions" && "px-2",
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {!filteredSkills.length && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-48 text-center"
                >
                  <p className="text-sm font-medium">
                    No skills match these filters.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={resetFilters}
                  >
                    Clear filters
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <footer className="text-muted-foreground flex flex-wrap items-center justify-between gap-3 py-3 text-xs">
        <span>
          {filteredSkills.length} of {skills.length} skills
        </span>
        <span>
          {new Set(skills.flatMap((skill) => skill.agents)).size} workspace
          agents
        </span>
      </footer>
    </section>
  );
}
