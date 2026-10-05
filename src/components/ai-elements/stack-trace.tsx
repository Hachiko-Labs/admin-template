"use client";

import {
  AlertTriangle,
  Check,
  ChevronDown,
  Copy,
  ListTree,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface StackFrame {
  columnNumber: number | null;
  filePath: string | null;
  functionName: string | null;
  internal: boolean;
  lineNumber: number | null;
  raw: string;
}

interface ParsedStackTrace {
  errorMessage: string;
  errorType: string | null;
  frames: StackFrame[];
}

const frameWithFunction = /^at\s+(.+?)\s+\((.+):(\d+):(\d+)\)$/;
const frameWithoutFunction = /^at\s+(.+):(\d+):(\d+)$/;
const errorLine = /^(\w*Error|Error):\s*(.*)$/;

function isInternalPath(path: string) {
  return (
    path.includes("node_modules") ||
    path.startsWith("node:") ||
    path.includes("internal/")
  );
}

function parseFrame(line: string): StackFrame {
  const raw = line.trim();
  const withFunction = raw.match(frameWithFunction);
  if (withFunction) {
    const [, functionName, filePath, lineNumber, columnNumber] = withFunction;
    return {
      columnNumber: columnNumber ? Number.parseInt(columnNumber, 10) : null,
      filePath: filePath ?? null,
      functionName: functionName ?? null,
      internal: filePath ? isInternalPath(filePath) : false,
      lineNumber: lineNumber ? Number.parseInt(lineNumber, 10) : null,
      raw,
    };
  }

  const withoutFunction = raw.match(frameWithoutFunction);
  if (withoutFunction) {
    const [, filePath, lineNumber, columnNumber] = withoutFunction;
    return {
      columnNumber: columnNumber ? Number.parseInt(columnNumber, 10) : null,
      filePath: filePath ?? null,
      functionName: null,
      internal: filePath ? isInternalPath(filePath) : false,
      lineNumber: lineNumber ? Number.parseInt(lineNumber, 10) : null,
      raw,
    };
  }

  return {
    columnNumber: null,
    filePath: null,
    functionName: null,
    internal: isInternalPath(raw),
    lineNumber: null,
    raw,
  };
}

function parseStackTrace(trace: string): ParsedStackTrace {
  const lines = trace.split("\n").filter((line) => line.trim());
  const first = lines[0]?.trim() ?? trace;
  const matchedError = first.match(errorLine);

  return {
    errorMessage: matchedError?.[2] ?? first,
    errorType: matchedError?.[1] ?? null,
    frames: lines
      .slice(1)
      .filter((line) => line.trim().startsWith("at "))
      .map(parseFrame),
  };
}

interface StackTraceContextValue {
  onFilePathClick?: (filePath: string, line?: number, column?: number) => void;
  open: boolean;
  raw: string;
  setOpen: (open: boolean) => void;
  setShowInternal: React.Dispatch<React.SetStateAction<boolean>>;
  showInternal: boolean;
  trace: ParsedStackTrace;
}

const StackTraceContext = React.createContext<StackTraceContextValue | null>(
  null,
);

function useStackTrace() {
  const context = React.useContext(StackTraceContext);
  if (!context) throw new Error("StackTrace components must be used together");
  return context;
}

export type StackTraceProps = Omit<
  React.ComponentProps<typeof Collapsible>,
  "onOpenChange"
> & {
  onFilePathClick?: (filePath: string, line?: number, column?: number) => void;
  onOpenChange?: (open: boolean) => void;
  trace: string;
};

export function StackTrace({
  children,
  className,
  defaultOpen = false,
  onFilePathClick,
  onOpenChange,
  open: controlledOpen,
  trace,
  ...props
}: StackTraceProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const [showInternal, setShowInternal] = React.useState(false);
  const open = controlledOpen ?? internalOpen;
  const parsed = React.useMemo(() => parseStackTrace(trace), [trace]);
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange],
  );
  const value = React.useMemo(
    () => ({
      onFilePathClick,
      open,
      raw: trace,
      setOpen,
      setShowInternal,
      showInternal,
      trace: parsed,
    }),
    [onFilePathClick, open, parsed, setOpen, showInternal, trace],
  );

  return (
    <StackTraceContext.Provider value={value}>
      <Collapsible
        open={open}
        onOpenChange={setOpen}
        className={cn(
          "bg-background group/stack-trace not-prose w-full overflow-hidden rounded-xl border font-mono shadow-xs",
          className,
        )}
        {...props}
      >
        {children}
      </Collapsible>
    </StackTraceContext.Provider>
  );
}

export type StackTraceHeaderProps = React.ComponentProps<"div">;

export function StackTraceHeader({
  children,
  className,
  onClick,
  onKeyDown,
  ...props
}: StackTraceHeaderProps) {
  const { open, setOpen } = useStackTrace();

  return (
    <div
      className={cn(
        "bg-muted/20 hover:bg-muted/35 flex min-h-12 cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors",
        className,
      )}
      onClick={onClick}
      onKeyDown={onKeyDown}
      {...props}
    >
      {children}
      <button
        type="button"
        aria-label={open ? "Collapse stack trace" : "Expand stack trace"}
        aria-expanded={open}
        className="rounded p-1"
        onClick={() => setOpen(!open)}
      >
        <ChevronDown
          className="text-muted-foreground size-4 shrink-0 transition-transform group-data-[state=open]/stack-trace:rotate-180"
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

export type StackTraceErrorProps = React.ComponentProps<"div">;

export function StackTraceError({
  children,
  className,
  ...props
}: StackTraceErrorProps) {
  return (
    <div
      className={cn("flex min-w-0 flex-1 items-start gap-2", className)}
      {...props}
    >
      <AlertTriangle
        className="text-destructive mt-0.5 size-4 shrink-0"
        aria-hidden="true"
      />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export type StackTraceErrorTypeProps = React.ComponentProps<"span">;

export function StackTraceErrorType({
  children,
  className,
  ...props
}: StackTraceErrorTypeProps) {
  const { trace } = useStackTrace();
  if (!trace.errorType && !children) return null;
  return (
    <span
      className={cn("text-destructive mr-2 text-xs font-semibold", className)}
      {...props}
    >
      {children ?? trace.errorType}
    </span>
  );
}

export type StackTraceErrorMessageProps = React.ComponentProps<"span">;

export function StackTraceErrorMessage({
  children,
  className,
  ...props
}: StackTraceErrorMessageProps) {
  const { trace } = useStackTrace();
  return (
    <span
      className={cn("text-foreground text-xs leading-5", className)}
      {...props}
    >
      {children ?? trace.errorMessage}
    </span>
  );
}

export type StackTraceActionsProps = React.ComponentProps<"div">;

export function StackTraceActions({
  className,
  onClick,
  onKeyDown,
  ...props
}: StackTraceActionsProps) {
  return (
    <div
      className={cn("flex shrink-0 items-center gap-0.5", className)}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.(event);
      }}
      onKeyDown={(event) => {
        event.stopPropagation();
        onKeyDown?.(event);
      }}
      {...props}
    />
  );
}

export type StackTraceCopyButtonProps = React.ComponentProps<typeof Button> & {
  onCopy?: () => void;
  onError?: (error: Error) => void;
  timeout?: number;
};

export function StackTraceCopyButton({
  children,
  className,
  onCopy,
  onError,
  timeout = 1600,
  ...props
}: StackTraceCopyButtonProps) {
  const { raw } = useStackTrace();
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  async function copyTrace() {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API is unavailable");
      }
      await navigator.clipboard.writeText(raw);
      setCopied(true);
      onCopy?.();
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), timeout);
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className={cn("text-muted-foreground size-7", className)}
      aria-label={copied ? "Stack trace copied" : "Copy stack trace"}
      onClick={copyTrace}
      {...props}
    >
      {children ??
        (copied ? (
          <Check className="text-emerald-600" aria-hidden="true" />
        ) : (
          <Copy aria-hidden="true" />
        ))}
    </Button>
  );
}

export type StackTraceExpandButtonProps = React.ComponentProps<typeof Button>;

export function StackTraceExpandButton({
  children,
  className,
  ...props
}: StackTraceExpandButtonProps) {
  const { setShowInternal, showInternal } = useStackTrace();
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className={cn("text-muted-foreground size-7", className)}
      aria-label={
        showInternal ? "Hide internal frames" : "Show internal frames"
      }
      onClick={() => setShowInternal((current) => !current)}
      {...props}
    >
      {children ?? <ListTree aria-hidden="true" />}
    </Button>
  );
}

export type StackTraceContentProps = React.ComponentProps<
  typeof CollapsibleContent
> & {
  maxHeight?: number;
};

export function StackTraceContent({
  children,
  className,
  maxHeight = 240,
  style,
  ...props
}: StackTraceContentProps) {
  return (
    <CollapsibleContent
      className={cn("bg-muted/10 border-t", className)}
      style={{ maxHeight, ...style }}
      {...props}
    >
      {children}
    </CollapsibleContent>
  );
}

export type StackTraceFramesProps = React.ComponentProps<"div"> & {
  showInternalFrames?: boolean;
};

export function StackTraceFrames({
  className,
  showInternalFrames,
  ...props
}: StackTraceFramesProps) {
  const context = useStackTrace();
  const showInternal = showInternalFrames ?? context.showInternal;
  const frames = showInternal
    ? context.trace.frames
    : context.trace.frames.filter((frame) => !frame.internal);

  return (
    <div
      className={cn("max-h-60 overflow-auto px-3 py-2", className)}
      {...props}
    >
      {frames.map((frame, index) => (
        <div
          key={`${frame.raw}-${index}`}
          className={cn(
            "flex min-w-0 items-baseline gap-2 py-1 text-[11px] leading-5",
            frame.internal && "text-muted-foreground/55",
          )}
        >
          <span className="text-muted-foreground shrink-0">at</span>
          {frame.functionName ? (
            <span className="text-foreground min-w-0 truncate">
              {frame.functionName}
            </span>
          ) : null}
          {frame.filePath ? (
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground min-w-0 truncate text-left underline-offset-2 hover:underline"
              onClick={() =>
                context.onFilePathClick?.(
                  frame.filePath!,
                  frame.lineNumber ?? undefined,
                  frame.columnNumber ?? undefined,
                )
              }
            >
              {frame.filePath}
              {frame.lineNumber ? `:${frame.lineNumber}` : ""}
              {frame.columnNumber ? `:${frame.columnNumber}` : ""}
            </button>
          ) : (
            <span className="text-muted-foreground min-w-0 truncate">
              {frame.raw.replace(/^at\s+/, "")}
            </span>
          )}
        </div>
      ))}
      {!frames.length ? (
        <p className="text-muted-foreground py-2 text-[11px]">
          No application frames to show.
        </p>
      ) : null}
    </div>
  );
}
