"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Adapted from Vercel AI Elements without AI SDK or pricing dependencies.
// https://elements.ai-sdk.dev/components/context
export interface ContextUsage {
  cachedInputTokens?: number;
  inputTokens?: number;
  outputTokens?: number;
  reasoningTokens?: number;
}

interface ContextValue {
  maxTokens: number;
  modelLabel?: string;
  usage?: ContextUsage;
  usedTokens: number;
}

const ContextContext = React.createContext<ContextValue | null>(null);

function useContextValue() {
  const context = React.useContext(ContextContext);
  if (!context) {
    throw new Error("Context components must be used within Context");
  }
  return context;
}

export interface ContextProps extends React.ComponentProps<typeof Popover> {
  maxTokens: number;
  modelLabel?: string;
  usage?: ContextUsage;
  usedTokens: number;
}

export function Context({
  maxTokens,
  modelLabel,
  usage,
  usedTokens,
  ...props
}: ContextProps) {
  const value = React.useMemo(
    () => ({ maxTokens, modelLabel, usage, usedTokens }),
    [maxTokens, modelLabel, usage, usedTokens],
  );

  return (
    <ContextContext.Provider value={value}>
      <Popover {...props} />
    </ContextContext.Provider>
  );
}

function ContextIcon() {
  const { maxTokens, usedTokens } = useContextValue();
  const radius = 8;
  const circumference = 2 * Math.PI * radius;
  const usedPercent = Math.min(1, Math.max(0, usedTokens / maxTokens));

  return (
    <svg
      viewBox="0 0 20 20"
      className="size-4"
      role="img"
      aria-label="Model context usage"
    >
      <circle
        cx="10"
        cy="10"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.2"
      />
      <circle
        cx="10"
        cy="10"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={circumference * (1 - usedPercent)}
        style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
      />
    </svg>
  );
}

export type ContextTriggerProps = Omit<
  React.ComponentProps<typeof Button>,
  "children"
> & { children?: React.ReactNode };

export function ContextTrigger({
  children,
  className,
  ...props
}: ContextTriggerProps) {
  const { maxTokens, usedTokens } = useContextValue();
  const percentage = Math.round((usedTokens / maxTokens) * 100);

  return (
    <PopoverTrigger asChild>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn("h-8 gap-1.5 px-2 text-xs font-normal", className)}
        {...props}
      >
        {children ?? (
          <>
            <ContextIcon />
            <span className="text-muted-foreground hidden sm:inline">
              {percentage}%
            </span>
          </>
        )}
      </Button>
    </PopoverTrigger>
  );
}

export type ContextContentProps = React.ComponentProps<typeof PopoverContent>;

export function ContextContent({ className, ...props }: ContextContentProps) {
  return (
    <PopoverContent
      align="end"
      side="top"
      sideOffset={8}
      className={cn("w-72 overflow-hidden p-0", className)}
      {...props}
    />
  );
}

function compactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(value);
}

export type ContextContentHeaderProps = React.ComponentPropsWithoutRef<"div">;

export function ContextContentHeader({
  children,
  className,
  ...props
}: ContextContentHeaderProps) {
  const { maxTokens, usedTokens } = useContextValue();
  const percentage = Math.min(100, (usedTokens / maxTokens) * 100);

  return (
    <div className={cn("space-y-2.5 p-3", className)} {...props}>
      {children ?? (
        <>
          <div className="flex items-center justify-between gap-3 text-xs">
            <span>{percentage.toFixed(1)}% used</span>
            <span className="text-muted-foreground font-mono">
              {compactNumber(usedTokens)} / {compactNumber(maxTokens)}
            </span>
          </div>
          <Progress value={percentage} className="bg-muted h-1.5" />
        </>
      )}
    </div>
  );
}

export type ContextContentBodyProps = React.ComponentPropsWithoutRef<"div">;

export function ContextContentBody({
  className,
  ...props
}: ContextContentBodyProps) {
  return <div className={cn("space-y-2 border-t p-3", className)} {...props} />;
}

function UsageRow({ label, tokens }: { label: string; tokens?: number }) {
  if (!tokens) return null;
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">{compactNumber(tokens)}</span>
    </div>
  );
}

export function ContextInputUsage() {
  const { usage } = useContextValue();
  return <UsageRow label="Input" tokens={usage?.inputTokens} />;
}

export function ContextOutputUsage() {
  const { usage } = useContextValue();
  return <UsageRow label="Output" tokens={usage?.outputTokens} />;
}

export function ContextReasoningUsage() {
  const { usage } = useContextValue();
  return <UsageRow label="Reasoning" tokens={usage?.reasoningTokens} />;
}

export function ContextCacheUsage() {
  const { usage } = useContextValue();
  return <UsageRow label="Cache read" tokens={usage?.cachedInputTokens} />;
}

export type ContextContentFooterProps = React.ComponentPropsWithoutRef<"div">;

export function ContextContentFooter({
  children,
  className,
  ...props
}: ContextContentFooterProps) {
  const { modelLabel } = useContextValue();

  return (
    <div
      className={cn(
        "bg-muted/45 text-muted-foreground flex items-center justify-between border-t px-3 py-2.5 text-xs",
        className,
      )}
      {...props}
    >
      {children ?? (
        <>
          <span>Context window</span>
          <span>{modelLabel ?? "Current model"}</span>
        </>
      )}
    </div>
  );
}
