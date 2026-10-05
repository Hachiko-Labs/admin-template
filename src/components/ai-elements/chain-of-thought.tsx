"use client";

import {
  BrainIcon,
  ChevronDownIcon,
  DotIcon,
  type LucideIcon,
} from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

// Adapted from Vercel AI Elements.
// https://elements.ai-sdk.dev/components/chain-of-thought
export type ChainOfThoughtProps = React.ComponentProps<typeof Collapsible>;

export function ChainOfThought({
  className,
  defaultOpen = false,
  ...props
}: ChainOfThoughtProps) {
  return (
    <Collapsible
      className={cn("not-prose w-full", className)}
      defaultOpen={defaultOpen}
      {...props}
    />
  );
}

export type ChainOfThoughtHeaderProps = React.ComponentProps<
  typeof CollapsibleTrigger
>;

export function ChainOfThoughtHeader({
  children,
  className,
  ...props
}: ChainOfThoughtHeaderProps) {
  return (
    <CollapsibleTrigger
      className={cn(
        "group text-muted-foreground hover:text-foreground flex w-full items-center gap-2 text-sm transition-colors",
        className,
      )}
      {...props}
    >
      <BrainIcon className="size-4 shrink-0" aria-hidden="true" />
      <span className="flex-1 text-left">{children ?? "Agent activity"}</span>
      <ChevronDownIcon
        className="size-4 shrink-0 transition-transform group-data-[state=open]:rotate-180"
        aria-hidden="true"
      />
    </CollapsibleTrigger>
  );
}

export type ChainOfThoughtContentProps = React.ComponentProps<
  typeof CollapsibleContent
>;

export function ChainOfThoughtContent({
  className,
  ...props
}: ChainOfThoughtContentProps) {
  return (
    <CollapsibleContent
      className={cn(
        "data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 data-[state=closed]:animate-out data-[state=open]:animate-in mt-3 space-y-3 outline-none",
        className,
      )}
      {...props}
    />
  );
}

export interface ChainOfThoughtStepProps extends React.ComponentPropsWithoutRef<"div"> {
  description?: React.ReactNode;
  icon?: LucideIcon;
  label: React.ReactNode;
  status?: "active" | "complete" | "pending";
}

const stepStatusStyles = {
  active: "text-foreground",
  complete: "text-muted-foreground",
  pending: "text-muted-foreground/50",
};

export function ChainOfThoughtStep({
  children,
  className,
  description,
  icon: Icon = DotIcon,
  label,
  status = "complete",
  ...props
}: ChainOfThoughtStepProps) {
  return (
    <div
      className={cn(
        "animate-in fade-in-0 slide-in-from-top-2 flex gap-2 text-sm",
        stepStatusStyles[status],
        className,
      )}
      {...props}
    >
      <div className="relative mt-0.5 shrink-0">
        <Icon className="size-4" aria-hidden="true" />
        <span className="bg-border absolute top-6 bottom-0 left-1/2 w-px -translate-x-1/2" />
      </div>
      <div className="min-w-0 flex-1 space-y-2 pb-1">
        <div>{label}</div>
        {description ? (
          <div className="text-muted-foreground text-xs leading-5">
            {description}
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}

export type ChainOfThoughtSearchResultsProps =
  React.ComponentPropsWithoutRef<"div">;

export function ChainOfThoughtSearchResults({
  className,
  ...props
}: ChainOfThoughtSearchResultsProps) {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-1.5", className)}
      {...props}
    />
  );
}

export type ChainOfThoughtSearchResultProps = React.ComponentProps<
  typeof Badge
>;

export function ChainOfThoughtSearchResult({
  children,
  className,
  ...props
}: ChainOfThoughtSearchResultProps) {
  return (
    <Badge
      variant="secondary"
      className={cn("gap-1 px-2 py-0.5 text-xs font-normal", className)}
      {...props}
    >
      {children}
    </Badge>
  );
}
