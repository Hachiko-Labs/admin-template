"use client";

import type { Day as WeekDay } from "date-fns";
import {
  differenceInCalendarDays,
  eachDayOfInterval,
  formatISO,
  getDay,
  getMonth,
  getYear,
  nextDay,
  parseISO,
  subWeeks,
} from "date-fns";
import {
  type CSSProperties,
  createContext,
  Fragment,
  type HTMLAttributes,
  type ReactNode,
  useContext,
  useMemo,
} from "react";

import { cn } from "@/lib/utils";

export type ContributionActivity = {
  date: string;
  count: number;
  level: number;
};

type Week = Array<ContributionActivity | undefined>;

type ContributionGraphLabels = {
  months?: string[];
  totalCount?: string;
  legend?: {
    less?: string;
    more?: string;
  };
};

type MonthLabel = {
  weekIndex: number;
  label: string;
};

const defaultMonthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const defaultLabels: ContributionGraphLabels = {
  months: defaultMonthLabels,
  totalCount: "{{count}} activities in {{year}}",
  legend: { less: "Less", more: "More" },
};

type ContributionGraphContextValue = {
  blockMargin: number;
  blockRadius: number;
  blockSize: number;
  fontSize: number;
  height: number;
  labelHeight: number;
  labels: ContributionGraphLabels;
  maxLevel: number;
  totalCount: number;
  weeks: Week[];
  width: number;
  year: number;
};

const ContributionGraphContext =
  createContext<ContributionGraphContextValue | null>(null);

function useContributionGraph() {
  const context = useContext(ContributionGraphContext);

  if (!context) {
    throw new Error(
      "ContributionGraph components must be used within ContributionGraph",
    );
  }

  return context;
}

function fillHoles(activities: ContributionActivity[]) {
  if (activities.length === 0) return [];

  const sorted = [...activities].sort((a, b) => a.date.localeCompare(b.date));
  const calendar = new Map(activities.map((activity) => [activity.date, activity]));
  const first = sorted[0];
  const last = sorted.at(-1);

  if (!first || !last) return [];

  return eachDayOfInterval({
    start: parseISO(first.date),
    end: parseISO(last.date),
  }).map((day) => {
    const date = formatISO(day, { representation: "date" });
    return calendar.get(date) ?? { date, count: 0, level: 0 };
  });
}

function groupByWeeks(
  activities: ContributionActivity[],
  weekStart: WeekDay,
) {
  const normalized = fillHoles(activities);
  const first = normalized[0];

  if (!first) return [];

  const firstDate = parseISO(first.date);
  const firstCalendarDate =
    getDay(firstDate) === weekStart
      ? firstDate
      : subWeeks(nextDay(firstDate, weekStart), 1);
  const padded = [
    ...Array<ContributionActivity | undefined>(
      differenceInCalendarDays(firstDate, firstCalendarDate),
    ).fill(undefined),
    ...normalized,
  ];

  return Array.from({ length: Math.ceil(padded.length / 7) }, (_, index) =>
    padded.slice(index * 7, index * 7 + 7),
  );
}

function getMonthLabels(
  weeks: Week[],
  monthNames = defaultMonthLabels,
): MonthLabel[] {
  return weeks
    .reduce<MonthLabel[]>((labels, week, weekIndex) => {
      const first = week.find(Boolean);
      if (!first) return labels;

      const month = monthNames[getMonth(parseISO(first.date))];
      const previous = labels.at(-1);
      return month && (!previous || previous.label !== month)
        ? [...labels, { weekIndex, label: month }]
        : labels;
    }, [])
    .filter(({ weekIndex }, index, labels) => {
      if (index === 0) {
        return Boolean(labels[1] && labels[1].weekIndex - weekIndex >= 3);
      }
      if (index === labels.length - 1) return weeks.length - weekIndex >= 3;
      return true;
    });
}

export type ContributionGraphProps = HTMLAttributes<HTMLDivElement> & {
  data: ContributionActivity[];
  blockMargin?: number;
  blockRadius?: number;
  blockSize?: number;
  fontSize?: number;
  labels?: ContributionGraphLabels;
  maxLevel?: number;
  style?: CSSProperties;
  totalCount?: number;
  weekStart?: WeekDay;
  children: ReactNode;
};

export function ContributionGraph({
  data,
  blockMargin = 4,
  blockRadius = 2,
  blockSize = 12,
  fontSize = 12,
  labels: labelOverrides,
  maxLevel: requestedMaxLevel = 4,
  totalCount: requestedTotalCount,
  weekStart = 0,
  className,
  style,
  children,
  ...props
}: ContributionGraphProps) {
  const maxLevel = Math.max(1, requestedMaxLevel);
  const weeks = useMemo(() => groupByWeeks(data, weekStart), [data, weekStart]);
  const labels = { ...defaultLabels, ...labelOverrides };
  const labelHeight = fontSize + 8;
  const width = weeks.length * (blockSize + blockMargin) - blockMargin;
  const height = labelHeight + (blockSize + blockMargin) * 7 - blockMargin;
  const totalCount =
    requestedTotalCount ??
    data.reduce((sum, activity) => sum + activity.count, 0);
  const first = data[0];
  const year = first ? getYear(parseISO(first.date)) : new Date().getFullYear();

  if (data.length === 0) return null;

  return (
    <ContributionGraphContext.Provider
      value={{
        blockMargin,
        blockRadius,
        blockSize,
        fontSize,
        height,
        labelHeight,
        labels,
        maxLevel,
        totalCount,
        weeks,
        width,
        year,
      }}
    >
      <div
        className={cn("flex w-max max-w-full flex-col gap-2", className)}
        style={{ fontSize, ...style }}
        {...props}
      >
        {children}
      </div>
    </ContributionGraphContext.Provider>
  );
}

export type ContributionGraphBlockProps = HTMLAttributes<SVGRectElement> & {
  activity: ContributionActivity;
  dayIndex: number;
  weekIndex: number;
};

export function ContributionGraphBlock({
  activity,
  dayIndex,
  weekIndex,
  className,
  ...props
}: ContributionGraphBlockProps) {
  const { blockMargin, blockRadius, blockSize, labelHeight, maxLevel } =
    useContributionGraph();

  if (activity.level < 0 || activity.level > maxLevel) {
    throw new RangeError(
      `Activity level ${activity.level} must be between 0 and ${maxLevel}`,
    );
  }

  return (
    <rect
      className={cn(
        'data-[level="0"]:fill-muted',
        'data-[level="1"]:fill-muted-foreground/20',
        'data-[level="2"]:fill-muted-foreground/40',
        'data-[level="3"]:fill-muted-foreground/60',
        'data-[level="4"]:fill-muted-foreground/80',
        className,
      )}
      data-count={activity.count}
      data-date={activity.date}
      data-level={activity.level}
      height={blockSize}
      rx={blockRadius}
      ry={blockRadius}
      width={blockSize}
      x={(blockSize + blockMargin) * weekIndex}
      y={labelHeight + (blockSize + blockMargin) * dayIndex}
      {...props}
    />
  );
}

export type ContributionGraphCalendarProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  hideMonthLabels?: boolean;
  children: (props: {
    activity: ContributionActivity;
    dayIndex: number;
    weekIndex: number;
  }) => ReactNode;
};

export function ContributionGraphCalendar({
  hideMonthLabels = false,
  className,
  children,
  ...props
}: ContributionGraphCalendarProps) {
  const { blockMargin, blockSize, height, labels, weeks, width } =
    useContributionGraph();
  const monthLabels = useMemo(
    () => getMonthLabels(weeks, labels.months),
    [labels.months, weeks],
  );

  return (
    <div
      className={cn("max-w-full overflow-x-auto overflow-y-hidden", className)}
      {...props}
    >
      <svg
        className="text-muted-foreground block h-auto w-full overflow-visible"
        height={height}
        preserveAspectRatio="xMinYMin meet"
        style={{ minWidth: width }}
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        role="img"
        aria-label="Activity contribution calendar"
      >
        {!hideMonthLabels ? (
          <g className="fill-current">
            {monthLabels.map(({ label, weekIndex }) => (
              <text
                dominantBaseline="hanging"
                key={`${label}-${weekIndex}`}
                x={(blockSize + blockMargin) * weekIndex}
              >
                {label}
              </text>
            ))}
          </g>
        ) : null}
        {weeks.map((week, weekIndex) =>
          week.map((activity, dayIndex) =>
            activity ? (
              <Fragment key={activity.date}>
                {children({ activity, dayIndex, weekIndex })}
              </Fragment>
            ) : null,
          ),
        )}
      </svg>
    </div>
  );
}

export function ContributionGraphFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 whitespace-nowrap sm:gap-x-4",
        className,
      )}
      {...props}
    />
  );
}

export function ContributionGraphTotalCount({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const { labels, totalCount, year } = useContributionGraph();
  const label =
    labels.totalCount
      ?.replace("{{count}}", totalCount.toLocaleString())
      .replace("{{year}}", String(year)) ??
    `${totalCount.toLocaleString()} activities in ${year}`;

  return (
    <div className={cn("text-muted-foreground", className)} {...props}>
      {label}
    </div>
  );
}

export function ContributionGraphLegend({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const { blockRadius, blockSize, labels, maxLevel } = useContributionGraph();

  return (
    <div className={cn("ml-auto flex items-center gap-1", className)} {...props}>
      <span className="text-muted-foreground mr-1">
        {labels.legend?.less ?? "Less"}
      </span>
      {Array.from({ length: maxLevel + 1 }, (_, level) => (
        <svg height={blockSize} key={level} width={blockSize}>
          <title>{`${level} activity level`}</title>
          <rect
            className={cn(
              'data-[level="0"]:fill-muted',
              'data-[level="1"]:fill-emerald-500/20',
              'data-[level="2"]:fill-emerald-500/40',
              'data-[level="3"]:fill-emerald-500/60',
              'data-[level="4"]:fill-emerald-500/80',
              'data-[level="5"]:fill-emerald-500',
            )}
            data-level={level}
            height={blockSize}
            rx={blockRadius}
            ry={blockRadius}
            width={blockSize}
          />
        </svg>
      ))}
      <span className="text-muted-foreground ml-1">
        {labels.legend?.more ?? "More"}
      </span>
    </div>
  );
}
