"use client";

import { CalendarDays } from "lucide-react";
import { useId, useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";

import {
  type ApiRequest,
  FACETS,
  matchesRequest,
  type RequestFilters,
} from "./request-data";

const SIDEBAR_FACETS = FACETS.filter(
  ({ key }) => key === "source" || key === "provider" || key === "model",
);

const LEVELS = [
  { label: "Success", value: ["200"], code: "2xx", color: "bg-emerald-500" },
  { label: "Warning", value: ["429"], code: "4xx", color: "bg-warning" },
  {
    label: "Error",
    value: ["500", "503"],
    code: "5xx",
    color: "bg-destructive",
  },
];
export function RequestFiltersPanel({
  rows,
  filters,
  end,
  onChange,
}: {
  rows: ApiRequest[];
  filters: RequestFilters;
  end: number;
  onChange: (patch: Partial<RequestFilters>) => void;
}) {
  const id = useId();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const levelRows = rows.filter((row) =>
    matchesRequest(row, filters, end, "status"),
  );
  const selectedDate = filters.from ? new Date(filters.from) : undefined;
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[58px] shrink-0 items-center border-b px-3">
        <h1 className="text-base font-medium">Filters</h1>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-none">
        <Accordion type="multiple" defaultValue={["level", "date"]}>
          <AccordionItem value="level">
            <AccordionTrigger className="px-3 py-3 hover:no-underline">
              Level
            </AccordionTrigger>
            <AccordionContent className="px-2 pb-5">
              <FieldSet className="gap-0 overflow-hidden rounded-lg border">
                <FieldLegend className="sr-only">Response level</FieldLegend>
                <FieldGroup className="gap-0">
                  {LEVELS.map((level) => (
                    <Field
                      key={level.label}
                      orientation="horizontal"
                      className="gap-2 border-b px-2 py-2 last:border-b-0"
                    >
                      <Checkbox
                        className="rounded-[4px]"
                        id={`${id}-${level.label}`}
                        checked={level.value.every((v) =>
                          filters.status.includes(v),
                        )}
                        onCheckedChange={(checked) =>
                          onChange({
                            status: checked
                              ? Array.from(
                                  new Set([...filters.status, ...level.value]),
                                )
                              : filters.status.filter(
                                  (v) => !level.value.includes(v),
                                ),
                          })
                        }
                      />
                      <FieldLabel
                        htmlFor={`${id}-${level.label}`}
                        className="min-w-0 flex-1 items-center gap-2 font-mono font-normal"
                      >
                        <span className="w-[7ch] shrink-0">{level.label}</span>
                        <span
                          className={`${level.color} size-2.5 shrink-0 rounded-[2px]`}
                        />
                        <span className="text-muted-foreground text-xs">
                          {level.code}
                        </span>
                      </FieldLabel>
                      <span className="text-muted-foreground font-mono text-xs">
                        {levelRows
                          .filter((row) =>
                            level.value.includes(String(row.status)),
                          )
                          .length.toLocaleString("en-US")}
                      </span>
                    </Field>
                  ))}
                </FieldGroup>
              </FieldSet>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="date">
            <AccordionTrigger className="px-3 py-3 hover:no-underline">
              Date
            </AccordionTrigger>
            <AccordionContent className="px-2 pb-5">
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-muted/30 h-9 w-full justify-start"
                    aria-label="Pick a date"
                  >
                    <CalendarDays data-icon="inline-start" />
                    <span className="text-muted-foreground">
                      {selectedDate
                        ? selectedDate.toISOString().slice(0, 10)
                        : "Pick a date"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    mode="single"
                    defaultMonth={new Date(2026, 8, 11)}
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        const from = Date.UTC(
                          date.getFullYear(),
                          date.getMonth(),
                          date.getDate(),
                        );
                        onChange({ from, to: from + 86400000 - 1 });
                      } else onChange({ from: 0, to: 0 });
                      setCalendarOpen(false);
                    }}
                  />
                  <div className="border-t p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        onChange({ from: 0, to: 0 });
                        setCalendarOpen(false);
                      }}
                    >
                      All dates
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </AccordionContent>
          </AccordionItem>
          {SIDEBAR_FACETS.map(({ key, label, options }) => {
            const counts = new Map<string, number>();
            rows
              .filter((row) => matchesRequest(row, filters, end, key))
              .forEach((row) =>
                counts.set(
                  String(row[key]),
                  (counts.get(String(row[key])) ?? 0) + 1,
                ),
              );
            return (
              <AccordionItem key={key} value={key}>
                <AccordionTrigger className="text-muted-foreground px-3 py-2.5 hover:no-underline">
                  <span>
                    {label}
                    {filters[key].length ? (
                      <span className="text-foreground ml-2 font-mono text-xs">
                        {filters[key].length}
                      </span>
                    ) : null}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3">
                  <FieldSet>
                    <FieldLegend className="sr-only">{label}</FieldLegend>
                    <FieldGroup className="gap-2.5">
                      {options.map((option) => (
                        <Field
                          key={option}
                          orientation="horizontal"
                          className="gap-2"
                        >
                          <Checkbox
                            className="rounded-[4px]"
                            id={`${id}-${key}-${option}`}
                            checked={filters[key].includes(option)}
                            onCheckedChange={(checked) =>
                              onChange({
                                [key]: checked
                                  ? [...filters[key], option]
                                  : filters[key].filter((v) => v !== option),
                              })
                            }
                          />
                          <FieldLabel
                            htmlFor={`${id}-${key}-${option}`}
                            className="min-w-0 flex-1 font-normal"
                          >
                            <span className="truncate text-xs">{option}</span>
                          </FieldLabel>
                          <span className="text-muted-foreground font-mono text-xs">
                            {counts.get(option) ?? 0}
                          </span>
                        </Field>
                      ))}
                    </FieldGroup>
                  </FieldSet>
                </AccordionContent>
              </AccordionItem>
            );
          })}
          <AccordionItem value="latency">
            <AccordionTrigger className="text-muted-foreground px-3 py-2.5 hover:no-underline">
              Latency
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-4">
              <Field className="gap-3">
                <FieldLabel className="text-xs">
                  Minimum · {(filters.minLatency / 1000).toFixed(1)} s
                </FieldLabel>
                <Slider
                  aria-label="Minimum latency"
                  value={[filters.minLatency]}
                  max={8000}
                  step={500}
                  onValueChange={([minLatency]) => onChange({ minLatency })}
                />
              </Field>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
