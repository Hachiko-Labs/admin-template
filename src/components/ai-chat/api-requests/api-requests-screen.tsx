"use client";

import {
  Bookmark,
  Filter,
  PanelLeftClose,
  PanelLeftOpen,
  Pause,
  Play,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import {
  parseAsArrayOf,
  parseAsFloat,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from "nuqs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AiWorkspaceShell } from "@/components/ai-chat/ai-workspace-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import { PlatformSelect } from "../platform/platform-ui";
import {
  type ApiRequest,
  DEFAULT_FILTERS,
  DEMO_END,
  FACETS,
  formatMs,
  INITIAL_REQUESTS,
  LOG_SOURCES,
  makeRequest,
  matchesRequest,
  type RequestFilters,
} from "./request-data";
import { RequestFiltersPanel } from "./request-filters";
import { RequestTable } from "./request-table";
import { RequestTimeline } from "./request-timeline";

const RequestDetail = dynamic(() =>
  import("./request-detail").then((module) => module.RequestDetail),
);
const parsers = {
  q: parseAsString.withDefault(""),
  hours: parseAsInteger.withDefault(24),
  from: parseAsInteger.withDefault(0),
  to: parseAsInteger.withDefault(0),
  minLatency: parseAsInteger.withDefault(0),
  minTtft: parseAsInteger.withDefault(0),
  minCost: parseAsFloat.withDefault(0),
  status: parseAsArrayOf(parseAsString).withDefault([]),
  provider: parseAsArrayOf(parseAsString).withDefault([]),
  source: parseAsArrayOf(parseAsString).withDefault([]),
  model: parseAsArrayOf(parseAsString).withDefault([]),
  project: parseAsArrayOf(parseAsString).withDefault([]),
  environment: parseAsArrayOf(parseAsString).withDefault([]),
  cache: parseAsArrayOf(parseAsString).withDefault([]),
};
const PRESETS = [
  {
    label: "All requests",
    description: "Everything in the last 24 hours",
    filters: {},
  },
  {
    label: "Errors",
    description: "Rate limits and provider failures",
    filters: { status: ["429", "500", "503"] },
  },
  {
    label: "Slow first token",
    description: "Time to first token above 1.5 seconds",
    filters: { minTtft: 1500 },
  },
  {
    label: "High cost",
    description: "Requests costing more than $0.02",
    filters: { minCost: 0.02 },
  },
  {
    label: "Cache misses",
    description: "Successful requests without a cache hit",
    filters: { cache: ["Miss"], status: ["200"] },
  },
] satisfies {
  label: string;
  description: string;
  filters: Partial<RequestFilters>;
}[];

export function ApiRequestsScreen() {
  const [query, setQuery] = useQueryStates(parsers, { history: "replace" });
  const filters: RequestFilters = useMemo(
    () => ({
      ...query,
      hours: [1, 6, 24].includes(query.hours) ? query.hours : 24,
      minLatency: Math.max(0, Math.min(8000, query.minLatency)),
      minTtft: Math.max(0, query.minTtft),
      minCost: Math.max(0, query.minCost),
      from: Math.max(0, query.from),
      to: Math.max(0, query.to),
    }),
    [query],
  );
  const [rows, setRows] = useState(INITIAL_REQUESTS);
  const [live, setLive] = useState(false);
  const sequence = useRef(721);
  const [rail, setRail] = useState(true);
  const [toolsElement, setToolsElement] = useState<HTMLDivElement | null>(null);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [detail, setDetail] = useState<{
    rows: ApiRequest[];
    index: number;
  } | null>(null);
  const end = rows[0]?.timestamp ?? DEMO_END;
  const update = useCallback(
    (patch: Partial<RequestFilters>) => {
      void setQuery(patch);
    },
    [setQuery],
  );
  const reset = useCallback(() => {
    void setQuery(null);
  }, [setQuery]);
  const openRequest = useCallback((row: ApiRequest, ordered: ApiRequest[]) => {
    setDetail({
      rows: ordered,
      index: ordered.findIndex((item) => item.id === row.id),
    });
  }, []);
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        event.stopPropagation();
        setCommandOpen((open) => !open);
      }
    }
    window.addEventListener("keydown", handleKey, true);
    return () => window.removeEventListener("keydown", handleKey, true);
  }, []);
  useEffect(() => {
    if (!live) return;
    const timer = window.setInterval(() => {
      const index = sequence.current++;
      setRows((previous) =>
        [makeRequest(index, previous[0].timestamp + 5000), ...previous].slice(
          0,
          1000,
        ),
      );
    }, 5000);
    return () => window.clearInterval(timer);
  }, [live]);
  const filtered = useMemo(
    () => rows.filter((row) => matchesRequest(row, filters, end)),
    [rows, filters, end],
  );
  const chartRows = useMemo(
    () =>
      rows.filter((row) => matchesRequest(row, filters, end, undefined, true)),
    [rows, filters, end],
  );
  const chips = FACETS.flatMap(({ key }) =>
    filters[key].map((value) => ({
      label: `${key}: ${value}`,
      clear: () =>
        update({ [key]: filters[key].filter((item) => item !== value) }),
    })),
  )
    .concat(
      filters.minLatency
        ? [
            {
              label: `latency ≥ ${formatMs(filters.minLatency)}`,
              clear: () => update({ minLatency: 0 }),
            },
          ]
        : [],
    )
    .concat(
      filters.minTtft
        ? [
            {
              label: `TTFT ≥ ${formatMs(filters.minTtft)}`,
              clear: () => update({ minTtft: 0 }),
            },
          ]
        : [],
    )
    .concat(
      filters.minCost
        ? [
            {
              label: `cost ≥ $${filters.minCost}`,
              clear: () => update({ minCost: 0 }),
            },
          ]
        : [],
    );
  function preset(patch: Partial<RequestFilters>) {
    update({ ...DEFAULT_FILTERS, ...patch });
    setCommandOpen(false);
  }
  const filterPanel = (
    <RequestFiltersPanel
      rows={rows}
      filters={filters}
      end={end}
      onChange={update}
    />
  );
  return (
    <AiWorkspaceShell
      hideNavigationSidebar
      headerTitle="API requests"
      headerActions={<Badge variant="outline">Demo data</Badge>}
    >
      <div className="flex min-h-0 flex-1" data-api-requests>
        <h1 className="sr-only">API requests</h1>
        <aside
          aria-label="Request filters"
          className={cn(
            "w-[236px] shrink-0 border-r",
            rail ? "hidden lg:block" : "hidden",
          )}
        >
          {filterPanel}
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="shrink-0 px-2 pt-1">
            <InputGroup className="h-[46px] rounded-lg">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                aria-label="Search requests"
                placeholder="Search data table..."
                value={filters.q}
                onChange={(event) => update({ q: event.target.value })}
              />
              <InputGroupAddon align="inline-end">
                <button
                  type="button"
                  aria-label="Open filter commands"
                  onClick={() => setCommandOpen(true)}
                  className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-xs"
                >
                  ⌘ K
                </button>
              </InputGroupAddon>
            </InputGroup>
          </div>
          <div className="flex h-[62px] shrink-0 items-center justify-between gap-2 px-3">
            <div className="flex min-w-0 items-center gap-4">
              <Button
                variant="ghost"
                size="icon-sm"
                className="hidden lg:inline-flex"
                aria-label={rail ? "Hide controls" : "Show controls"}
                aria-expanded={rail}
                onClick={() => setRail((value) => !value)}
              >
                {rail ? <PanelLeftClose /> : <PanelLeftOpen />}
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="lg:hidden"
                aria-label="Open request filters"
                onClick={() => setMobileFilters(true)}
              >
                <PanelLeftOpen />
              </Button>
              <span className="text-muted-foreground truncate text-sm">
                <span className="font-mono">
                  {filtered.length.toLocaleString("en-US")}
                </span>{" "}
                of{" "}
                <span className="font-mono">
                  {rows.length.toLocaleString("en-US")}
                </span>{" "}
                <span className="hidden sm:inline">row(s) filtered</span>
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {filters.from > 0 ? (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Clear time selection"
                  onClick={() => update({ from: 0, to: 0 })}
                >
                  <X />
                </Button>
              ) : null}
              <Button
                variant="outline"
                size="icon"
                aria-label="Reset all filters and traffic"
                onClick={() => {
                  reset();
                  setLive(false);
                  setRows(INITIAL_REQUESTS);
                  sequence.current = 721;
                }}
              >
                <RotateCcw />
              </Button>
              <Button
                variant="outline"
                className="gap-3"
                aria-label={live ? "Pause live demo" : "Start live demo"}
                aria-pressed={live}
                onClick={() => setLive((value) => !value)}
              >
                {live ? (
                  <Pause data-icon="inline-start" />
                ) : (
                  <Play data-icon="inline-start" />
                )}
                Live
              </Button>
              <div ref={setToolsElement} className="flex items-center" />
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3 border-b px-3 pb-3">
            <span className="text-muted-foreground text-xs">Log source</span>
            <PlatformSelect
              label="Log source"
              value={
                filters.source.length === 1
                  ? filters.source[0]
                  : filters.source.length
                    ? "multiple"
                    : "all"
              }
              onChange={(value) =>
                update({ source: value === "all" ? [] : [value] })
              }
              options={[
                { value: "all", label: "All sources" },
                ...(filters.source.length > 1
                  ? [
                      {
                        value: "multiple",
                        label: `${filters.source.length} sources selected`,
                      },
                    ]
                  : []),
                ...LOG_SOURCES,
              ]}
            />
          </div>
          {chips.length ? (
            <div className="flex max-h-24 shrink-0 flex-wrap gap-1.5 border-b px-3 pb-2">
              {chips.map((chip) => (
                <Button
                  key={chip.label}
                  variant="secondary"
                  size="sm"
                  onClick={chip.clear}
                  aria-label={`Remove ${chip.label}`}
                >
                  {chip.label}
                  <X data-icon="inline-end" />
                </Button>
              ))}
              <Button variant="ghost" size="sm" onClick={reset}>
                Clear all
              </Button>
            </div>
          ) : null}
          <RequestTimeline
            rows={chartRows}
            start={end - filters.hours * 3600000}
            end={end}
            from={filters.from}
            to={filters.to}
            onRange={(from, to) => update({ from, to })}
          />
          <RequestTable
            rows={filtered}
            onOpen={openRequest}
            onReset={reset}
            toolsElement={toolsElement}
          />
        </div>
      </div>
      <Sheet open={mobileFilters} onOpenChange={setMobileFilters}>
        <SheetContent side="left" className="w-72 gap-0 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Request filters</SheetTitle>
            <SheetDescription>Filter sample API traffic.</SheetDescription>
          </SheetHeader>
          {filterPanel}
        </SheetContent>
      </Sheet>
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput
          placeholder="Search views, filters, or request IDs…"
          value={commandQuery}
          onValueChange={setCommandQuery}
        />
        <CommandList>
          <CommandEmpty>No matching filters.</CommandEmpty>
          {commandQuery.trim() ? (
            <CommandGroup heading="Search requests">
              <CommandItem
                value={`Search ${commandQuery}`}
                onSelect={() => {
                  update({ q: commandQuery });
                  setCommandOpen(false);
                }}
              >
                <Search />
                Search for “{commandQuery}”
              </CommandItem>
            </CommandGroup>
          ) : null}
          <CommandGroup heading="Saved views">
            {PRESETS.map((view) => (
              <CommandItem
                key={view.label}
                value={`${view.label} ${view.description}`}
                onSelect={() => preset(view.filters)}
              >
                <Bookmark />
                {view.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Add a filter">
            {FACETS.flatMap(({ key, options }) =>
              options.map((option) => (
                <CommandItem
                  key={`${key}:${option}`}
                  value={`${key}:${option}`}
                  onSelect={() => {
                    update({
                      [key]: Array.from(new Set([...filters[key], option])),
                    });
                    setCommandOpen(false);
                  }}
                >
                  <Filter />
                  {key}: {option}
                </CommandItem>
              )),
            )}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
      {detail ? (
        <RequestDetail
          row={detail.rows[detail.index]}
          position={detail.index}
          total={detail.rows.length}
          onClose={() => setDetail(null)}
          onNavigate={(offset) =>
            setDetail((value) =>
              value
                ? {
                    ...value,
                    index: Math.max(
                      0,
                      Math.min(value.rows.length - 1, value.index + offset),
                    ),
                  }
                : null,
            )
          }
        />
      ) : null}
    </AiWorkspaceShell>
  );
}
