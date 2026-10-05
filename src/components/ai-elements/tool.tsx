"use client";

import {
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock3,
  Wrench,
  XCircle,
} from "lucide-react";
import * as React from "react";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

// Adapted from Vercel AI Elements without coupling it to AI SDK message types.
// https://elements.ai-sdk.dev/components/tool
export type ToolState =
  | "approval-requested"
  | "approval-responded"
  | "input-available"
  | "input-streaming"
  | "output-available"
  | "output-denied"
  | "output-error";

export type ToolProps = React.ComponentProps<typeof Collapsible>;

export function Tool({ className, ...props }: ToolProps) {
  return (
    <Collapsible
      className={cn(
        "group/tool not-prose w-full overflow-hidden rounded-xl border",
        className,
      )}
      {...props}
    />
  );
}

const statusContent: Record<
  ToolState,
  { icon: React.ReactNode; label: string }
> = {
  "approval-requested": {
    icon: <Clock3 className="size-3 text-amber-600" />,
    label: "Awaiting approval",
  },
  "approval-responded": {
    icon: <CheckCircle2 className="size-3 text-blue-600" />,
    label: "Approved",
  },
  "input-available": {
    icon: <Clock3 className="size-3 animate-pulse" />,
    label: "Running",
  },
  "input-streaming": {
    icon: <Circle className="size-3 animate-pulse" />,
    label: "Preparing",
  },
  "output-available": {
    icon: <CheckCircle2 className="size-3 text-emerald-600" />,
    label: "Completed",
  },
  "output-denied": {
    icon: <XCircle className="size-3 text-orange-600" />,
    label: "Denied",
  },
  "output-error": {
    icon: <XCircle className="text-destructive size-3" />,
    label: "Error",
  },
};

export interface ToolHeaderProps extends React.ComponentProps<
  typeof CollapsibleTrigger
> {
  detail?: string;
  state: ToolState;
  title: string;
}

export function ToolHeader({
  className,
  detail,
  state,
  title,
  ...props
}: ToolHeaderProps) {
  const status = statusContent[state];

  return (
    <CollapsibleTrigger
      className={cn(
        "hover:bg-muted/35 flex w-full items-center gap-3 p-3 text-left transition-colors",
        className,
      )}
      {...props}
    >
      <span className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-lg">
        <Wrench className="text-muted-foreground size-3.5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{title}</span>
        {detail ? (
          <span className="text-muted-foreground block truncate text-xs">
            {detail}
          </span>
        ) : null}
      </span>
      <Badge variant="secondary" className="shrink-0 gap-1.5 px-2 font-normal">
        {status.icon}
        <span className="hidden sm:inline">{status.label}</span>
      </Badge>
      <ChevronDown
        className="text-muted-foreground size-4 shrink-0 transition-transform group-data-[state=open]/tool:rotate-180"
        aria-hidden="true"
      />
    </CollapsibleTrigger>
  );
}

export type ToolContentProps = React.ComponentProps<typeof CollapsibleContent>;

export function ToolContent({ className, ...props }: ToolContentProps) {
  return (
    <CollapsibleContent
      className={cn(
        "data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 data-[state=closed]:animate-out data-[state=open]:animate-in space-y-4 border-t p-3 outline-none",
        className,
      )}
      {...props}
    />
  );
}

const printableValueSchema = z.unknown().transform((value) => {
  const text = z.string().safeParse(value);
  if (text.success) return text.data;

  try {
    return JSON.stringify(value, null, 2) ?? String(value);
  } catch {
    return String(value);
  }
});

function SerializableValue({ value }: { value: unknown }) {
  if (React.isValidElement(value)) return value;

  return (
    <pre className="overflow-x-auto p-3 font-mono text-[11px] leading-5">
      {printableValueSchema.parse(value)}
    </pre>
  );
}

export interface ToolInputProps extends React.ComponentPropsWithoutRef<"div"> {
  input: unknown;
}

export function ToolInput({ className, input, ...props }: ToolInputProps) {
  return (
    <div className={cn("space-y-2 overflow-hidden", className)} {...props}>
      <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
        Parameters
      </p>
      <div className="bg-muted/45 overflow-hidden rounded-lg border">
        <SerializableValue value={input} />
      </div>
    </div>
  );
}

export interface ToolOutputProps extends React.ComponentPropsWithoutRef<"div"> {
  error?: string;
  output?: unknown;
}

export function ToolOutput({
  className,
  error,
  output,
  ...props
}: ToolOutputProps) {
  if (output === undefined && !error) return null;

  return (
    <div className={cn("space-y-2 overflow-hidden", className)} {...props}>
      <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
        {error ? "Error" : "Result"}
      </p>
      <div
        className={cn(
          "overflow-hidden rounded-lg border",
          error ? "bg-destructive/5 text-destructive" : "bg-muted/45",
        )}
      >
        <SerializableValue value={error ?? output} />
      </div>
    </div>
  );
}
