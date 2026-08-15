"use client";

import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import { IconCalendar } from "@tabler/icons-react";
import * as React from "react";
import { type DateRange } from "react-day-picker";

import { useIsMobile } from "@/hooks/use-mobile";

import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface DateRangePickerProps {
  initialDateFrom?: Date | string;
  initialDateTo?: Date | string;
  align?: "start" | "center" | "end";
  locale?: string;
}

const getDateAdjustedForTimezone = (dateInput: Date | string): Date => {
  if (typeof dateInput !== "string") {
    return dateInput;
  }

  const [year, month, day] = dateInput.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatRange = (range: DateRange | undefined, locale: string) => {
  if (!range?.from) {
    return "Pick a date range";
  }

  const formatter = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (!range.to) {
    return formatter.format(range.from);
  }

  return `${formatter.format(range.from)} - ${formatter.format(range.to)}`;
};

export function DateRangePicker({
  initialDateFrom = new Date(new Date().setHours(0, 0, 0, 0)),
  initialDateTo,
  align = "end",
  locale = "en-US",
}: DateRangePickerProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = React.useState(false);
  const initialRange = React.useMemo<DateRange>(
    () => ({
      from: getDateAdjustedForTimezone(initialDateFrom),
      to: initialDateTo
        ? getDateAdjustedForTimezone(initialDateTo)
        : getDateAdjustedForTimezone(initialDateFrom),
    }),
    [initialDateFrom, initialDateTo],
  );
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    initialRange,
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="flex items-center">
          <div className="rounded-l-md border border-r-0 px-2 py-[0.5rem]">
            <IconCalendar size={18} />
          </div>
          <Button className="rounded-l-none px-3" variant="outline">
            <div className="text-right">
              <div className="py-1 text-xs">
                <div>{formatRange(dateRange, locale)}</div>
              </div>
            </div>
            <div className="pl-1 opacity-60">
              {isOpen ? (
                <ChevronUpIcon width={20} />
              ) : (
                <ChevronDownIcon width={20} />
              )}
            </div>
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        collisionPadding={16}
        className="w-auto overflow-hidden rounded-md p-0"
      >
        <Calendar
          mode="range"
          defaultMonth={dateRange?.from}
          selected={dateRange}
          onSelect={setDateRange}
          numberOfMonths={isMobile ? 1 : 2}
        />
      </PopoverContent>
    </Popover>
  );
}

DateRangePicker.displayName = "DateRangePicker";
