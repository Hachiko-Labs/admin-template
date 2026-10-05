"use client";

import { ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

// Adapted from Vercel AI Elements.
// https://elements.ai-sdk.dev/components/plan
export interface PlanProps extends React.ComponentProps<typeof Collapsible> {
  isStreaming?: boolean;
}

const PlanContext = React.createContext({ isStreaming: false });

export function Plan({
  children,
  className,
  isStreaming = false,
  ...props
}: PlanProps) {
  const value = React.useMemo(() => ({ isStreaming }), [isStreaming]);

  return (
    <PlanContext.Provider value={value}>
      <Collapsible className={cn("not-prose", className)} {...props}>
        <Card className="overflow-hidden shadow-none">{children}</Card>
      </Collapsible>
    </PlanContext.Provider>
  );
}

export type PlanHeaderProps = React.ComponentProps<typeof CardHeader>;

export function PlanHeader({ className, ...props }: PlanHeaderProps) {
  return (
    <CardHeader
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 space-y-0 p-4",
        className,
      )}
      {...props}
    />
  );
}

export type PlanTitleProps = React.ComponentProps<typeof CardTitle>;

export function PlanTitle({ className, ...props }: PlanTitleProps) {
  const { isStreaming } = React.useContext(PlanContext);

  return (
    <CardTitle
      className={cn(
        "text-sm leading-5",
        isStreaming && "animate-pulse",
        className,
      )}
      {...props}
    />
  );
}

export type PlanDescriptionProps = React.ComponentProps<typeof CardDescription>;

export function PlanDescription({ className, ...props }: PlanDescriptionProps) {
  const { isStreaming } = React.useContext(PlanContext);

  return (
    <CardDescription
      className={cn(
        "mt-1 text-xs leading-5 text-pretty",
        isStreaming && "animate-pulse",
        className,
      )}
      {...props}
    />
  );
}

export type PlanTriggerProps = React.ComponentProps<typeof CollapsibleTrigger>;

export function PlanTrigger({ className, ...props }: PlanTriggerProps) {
  return (
    <CollapsibleTrigger asChild>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className={cn("size-8", className)}
        {...props}
      >
        <ChevronsUpDown aria-hidden="true" />
        <span className="sr-only">Toggle plan</span>
      </Button>
    </CollapsibleTrigger>
  );
}

export type PlanContentProps = React.ComponentProps<typeof CardContent>;

export function PlanContent({ className, ...props }: PlanContentProps) {
  return (
    <CollapsibleContent>
      <CardContent className={cn("border-t p-4", className)} {...props} />
    </CollapsibleContent>
  );
}

export type PlanFooterProps = React.ComponentProps<typeof CardFooter>;

export function PlanFooter({ className, ...props }: PlanFooterProps) {
  return (
    <CardFooter className={cn("border-t px-4 py-3", className)} {...props} />
  );
}
