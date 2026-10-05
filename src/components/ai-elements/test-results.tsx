"use client";

import {
  CheckCircle2,
  ChevronRight,
  Circle,
  CircleDot,
  XCircle,
} from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export type TestResultStatus = "failed" | "passed" | "running" | "skipped";

export interface TestResultsSummaryData {
  duration?: number;
  failed: number;
  passed: number;
  running?: number;
  skipped: number;
  total: number;
}

interface TestResultsContextValue {
  summary?: TestResultsSummaryData;
}

const TestResultsContext = React.createContext<TestResultsContextValue>({});

function formatDuration(duration: number) {
  return duration < 1000 ? `${duration}ms` : `${(duration / 1000).toFixed(2)}s`;
}

export type TestResultsProps = React.ComponentProps<"section"> & {
  summary?: TestResultsSummaryData;
};

export function TestResults({
  children,
  className,
  summary,
  ...props
}: TestResultsProps) {
  const value = React.useMemo(() => ({ summary }), [summary]);

  return (
    <TestResultsContext.Provider value={value}>
      <section
        className={cn(
          "bg-background not-prose overflow-hidden rounded-xl border shadow-xs",
          className,
        )}
        {...props}
      >
        {children ??
          (summary ? (
            <TestResultsHeader>
              <TestResultsSummary />
              <TestResultsDuration />
            </TestResultsHeader>
          ) : null)}
      </section>
    </TestResultsContext.Provider>
  );
}

export type TestResultsHeaderProps = React.ComponentProps<"header">;

export function TestResultsHeader({
  className,
  ...props
}: TestResultsHeaderProps) {
  return (
    <header
      className={cn(
        "bg-muted/20 flex min-h-12 flex-wrap items-center justify-between gap-2 border-b px-3 py-2.5 sm:px-4",
        className,
      )}
      {...props}
    />
  );
}

export type TestResultsSummaryProps = React.ComponentProps<"div">;

export function TestResultsSummary({
  children,
  className,
  ...props
}: TestResultsSummaryProps) {
  const { summary } = React.useContext(TestResultsContext);
  if (!summary) return null;

  return (
    <div
      className={cn("flex flex-wrap items-center gap-1.5", className)}
      {...props}
    >
      {children ?? (
        <>
          {summary.running ? (
            <Badge
              variant="secondary"
              className="gap-1 rounded-md px-1.5 text-[10px] font-normal text-blue-600"
            >
              <CircleDot
                className="size-3 animate-pulse motion-reduce:animate-none"
                aria-hidden="true"
              />
              {summary.running} running
            </Badge>
          ) : null}
          <Badge
            variant="secondary"
            className="gap-1 rounded-md px-1.5 text-[10px] font-normal text-emerald-600"
          >
            <CheckCircle2 className="size-3" aria-hidden="true" />
            {summary.passed} passed
          </Badge>
          {summary.failed ? (
            <Badge
              variant="secondary"
              className="text-destructive gap-1 rounded-md px-1.5 text-[10px] font-normal"
            >
              <XCircle className="size-3" aria-hidden="true" />
              {summary.failed} failed
            </Badge>
          ) : null}
          {summary.skipped ? (
            <Badge
              variant="secondary"
              className="gap-1 rounded-md px-1.5 text-[10px] font-normal text-amber-600"
            >
              <Circle className="size-3" aria-hidden="true" />
              {summary.skipped} skipped
            </Badge>
          ) : null}
        </>
      )}
    </div>
  );
}

export type TestResultsDurationProps = React.ComponentProps<"span">;

export function TestResultsDuration({
  children,
  className,
  ...props
}: TestResultsDurationProps) {
  const { summary } = React.useContext(TestResultsContext);
  if (summary?.duration === undefined) return null;

  return (
    <span
      className={cn("text-muted-foreground text-xs tabular-nums", className)}
      {...props}
    >
      {children ?? formatDuration(summary.duration)}
    </span>
  );
}

export type TestResultsProgressProps = React.ComponentProps<"div">;

export function TestResultsProgress({
  children,
  className,
  ...props
}: TestResultsProgressProps) {
  const { summary } = React.useContext(TestResultsContext);
  if (!summary || summary.total <= 0) return null;

  const passed = (summary.passed / summary.total) * 100;
  const failed = (summary.failed / summary.total) * 100;
  const running = ((summary.running ?? 0) / summary.total) * 100;

  return (
    <div className={cn("space-y-2", className)} {...props}>
      {children ?? (
        <>
          <div
            className="bg-muted flex h-1.5 overflow-hidden rounded-full"
            aria-label={`${summary.passed} of ${summary.total} tests passed`}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={summary.total}
            aria-valuenow={summary.passed}
          >
            <span
              className="bg-emerald-500 transition-[width]"
              style={{ width: `${passed}%` }}
            />
            <span
              className="bg-destructive transition-[width]"
              style={{ width: `${failed}%` }}
            />
            <span
              className="animate-pulse bg-blue-500 transition-[width] motion-reduce:animate-none"
              style={{ width: `${running}%` }}
            />
          </div>
          <div className="text-muted-foreground flex justify-between text-[11px]">
            <span>
              {summary.passed}/{summary.total} tests passed
            </span>
            <span>{passed.toFixed(0)}%</span>
          </div>
        </>
      )}
    </div>
  );
}

export type TestResultsContentProps = React.ComponentProps<"div">;

export function TestResultsContent({
  className,
  ...props
}: TestResultsContentProps) {
  return <div className={cn("space-y-3 p-3 sm:p-4", className)} {...props} />;
}

interface TestSuiteContextValue {
  name: string;
  status: TestResultStatus;
}

const TestSuiteContext = React.createContext<TestSuiteContextValue>({
  name: "",
  status: "passed",
});

const statusStyles: Record<TestResultStatus, string> = {
  failed: "text-destructive",
  passed: "text-emerald-600",
  running: "text-blue-600",
  skipped: "text-amber-600",
};

function StatusIcon({ status }: { status: TestResultStatus }) {
  return (
    <span className={cn("shrink-0", statusStyles[status])}>
      {status === "failed" ? (
        <XCircle className="size-3.5" aria-hidden="true" />
      ) : status === "passed" ? (
        <CheckCircle2 className="size-3.5" aria-hidden="true" />
      ) : status === "running" ? (
        <CircleDot
          className="size-3.5 animate-pulse motion-reduce:animate-none"
          aria-hidden="true"
        />
      ) : (
        <Circle className="size-3.5" aria-hidden="true" />
      )}
    </span>
  );
}

export type TestSuiteProps = React.ComponentProps<typeof Collapsible> & {
  name: string;
  status: TestResultStatus;
};

export function TestSuite({
  children,
  className,
  name,
  status,
  ...props
}: TestSuiteProps) {
  const value = React.useMemo(() => ({ name, status }), [name, status]);

  return (
    <TestSuiteContext.Provider value={value}>
      <Collapsible
        className={cn(
          "group/test-suite overflow-hidden rounded-lg border",
          className,
        )}
        {...props}
      >
        {children}
      </Collapsible>
    </TestSuiteContext.Provider>
  );
}

export type TestSuiteNameProps = React.ComponentProps<
  typeof CollapsibleTrigger
>;

export function TestSuiteName({
  children,
  className,
  ...props
}: TestSuiteNameProps) {
  const { name, status } = React.useContext(TestSuiteContext);

  return (
    <CollapsibleTrigger
      className={cn(
        "hover:bg-muted/35 flex min-h-11 w-full items-center gap-2 px-3 py-2.5 text-left transition-colors",
        className,
      )}
      {...props}
    >
      <ChevronRight
        className="text-muted-foreground size-3.5 shrink-0 transition-transform group-data-[state=open]/test-suite:rotate-90"
        aria-hidden="true"
      />
      <StatusIcon status={status} />
      <span className="min-w-0 truncate text-xs font-medium">
        {children ?? name}
      </span>
    </CollapsibleTrigger>
  );
}

export interface TestSuiteStatsProps extends React.ComponentProps<"div"> {
  failed?: number;
  passed?: number;
  running?: number;
  skipped?: number;
}

export function TestSuiteStats({
  children,
  className,
  failed = 0,
  passed = 0,
  running = 0,
  skipped = 0,
  ...props
}: TestSuiteStatsProps) {
  return (
    <div
      className={cn(
        "text-muted-foreground ml-auto flex shrink-0 items-center gap-2 text-[10px] tabular-nums",
        className,
      )}
      {...props}
    >
      {children ?? (
        <>
          {passed ? (
            <span className="text-emerald-600">{passed} passed</span>
          ) : null}
          {failed ? (
            <span className="text-destructive">{failed} failed</span>
          ) : null}
          {running ? (
            <span className="text-blue-600">{running} running</span>
          ) : null}
          {skipped ? (
            <span className="text-amber-600">{skipped} skipped</span>
          ) : null}
        </>
      )}
    </div>
  );
}

export type TestSuiteContentProps = React.ComponentProps<
  typeof CollapsibleContent
>;

export function TestSuiteContent({
  children,
  className,
  ...props
}: TestSuiteContentProps) {
  return (
    <CollapsibleContent
      className={cn("bg-muted/10 border-t", className)}
      {...props}
    >
      <div className="divide-y">{children}</div>
    </CollapsibleContent>
  );
}

interface TestContextValue {
  duration?: number;
  name: string;
  status: TestResultStatus;
}

const TestContext = React.createContext<TestContextValue>({
  name: "",
  status: "passed",
});

export type TestProps = React.ComponentProps<"div"> & {
  duration?: number;
  name: string;
  status: TestResultStatus;
};

export function Test({
  children,
  className,
  duration,
  name,
  status,
  ...props
}: TestProps) {
  const value = React.useMemo(
    () => ({ duration, name, status }),
    [duration, name, status],
  );

  return (
    <TestContext.Provider value={value}>
      <div
        className={cn(
          "flex min-h-10 items-center gap-2 px-3 py-2.5 text-xs",
          className,
        )}
        {...props}
      >
        {children ?? (
          <>
            <TestStatus />
            <TestName />
            <TestDuration />
          </>
        )}
      </div>
    </TestContext.Provider>
  );
}

export type TestStatusProps = React.ComponentProps<"span">;

export function TestStatus({ children, className, ...props }: TestStatusProps) {
  const { status } = React.useContext(TestContext);
  return (
    <span className={cn("shrink-0", className)} {...props}>
      {children ?? <StatusIcon status={status} />}
    </span>
  );
}

export type TestNameProps = React.ComponentProps<"span">;

export function TestName({ children, className, ...props }: TestNameProps) {
  const { name } = React.useContext(TestContext);
  return (
    <span className={cn("min-w-0 flex-1", className)} {...props}>
      {children ?? name}
    </span>
  );
}

export type TestDurationProps = React.ComponentProps<"span">;

export function TestDuration({
  children,
  className,
  ...props
}: TestDurationProps) {
  const { duration } = React.useContext(TestContext);
  if (duration === undefined) return null;
  return (
    <span
      className={cn(
        "text-muted-foreground ml-auto shrink-0 text-[10px] tabular-nums",
        className,
      )}
      {...props}
    >
      {children ?? formatDuration(duration)}
    </span>
  );
}

export type TestErrorProps = React.ComponentProps<"div">;

export function TestError({ className, ...props }: TestErrorProps) {
  return (
    <div
      className={cn(
        "bg-destructive/5 border-destructive/20 mx-3 mt-1 mb-3 rounded-lg border p-3",
        className,
      )}
      {...props}
    />
  );
}

export type TestErrorMessageProps = React.ComponentProps<"p">;

export function TestErrorMessage({
  className,
  ...props
}: TestErrorMessageProps) {
  return (
    <p
      className={cn(
        "text-destructive text-xs leading-5 font-medium",
        className,
      )}
      {...props}
    />
  );
}

export type TestErrorStackProps = React.ComponentProps<"pre">;

export function TestErrorStack({ className, ...props }: TestErrorStackProps) {
  return (
    <pre
      className={cn(
        "text-destructive/80 mt-2 overflow-x-auto font-mono text-[10px] leading-5",
        className,
      )}
      {...props}
    />
  );
}
