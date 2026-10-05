"use client";

import { Check, ChevronDown } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Adapted from the composable anatomy of Vercel AI Elements Queue.
// https://elements.ai-sdk.dev/components/queue
export type QueueProps = React.ComponentProps<"div">;

export function Queue({ className, ...props }: QueueProps) {
  return (
    <div
      className={cn(
        "bg-background not-prose overflow-hidden rounded-xl border shadow-xs",
        className,
      )}
      {...props}
    />
  );
}

export type QueueSectionProps = React.ComponentProps<typeof Collapsible>;

export function QueueSection({
  className,
  defaultOpen = true,
  ...props
}: QueueSectionProps) {
  return (
    <Collapsible
      className={cn("group/queue", className)}
      defaultOpen={defaultOpen}
      {...props}
    />
  );
}

export type QueueSectionTriggerProps = React.ComponentProps<"button">;

export function QueueSectionTrigger({
  children,
  className,
  ...props
}: QueueSectionTriggerProps) {
  return (
    <CollapsibleTrigger asChild>
      <button
        type="button"
        className={cn(
          "hover:bg-muted/45 focus-visible:ring-ring flex h-9 w-full items-center gap-2 px-3 text-left transition-colors focus-visible:ring-1 focus-visible:outline-hidden",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDown
          className="text-muted-foreground ml-auto size-3.5 transition-transform group-data-[state=open]/queue:rotate-180"
          aria-hidden="true"
        />
      </button>
    </CollapsibleTrigger>
  );
}

interface QueueSectionLabelProps extends React.ComponentProps<"span"> {
  count?: number;
  label: string;
}

export function QueueSectionLabel({
  children,
  className,
  count,
  label,
  ...props
}: QueueSectionLabelProps) {
  return (
    <span
      className={cn("flex min-w-0 items-center gap-2", className)}
      {...props}
    >
      {children}
      <span className="truncate text-[11px] font-medium">{label}</span>
      {count !== undefined ? (
        <span className="text-muted-foreground text-[10px] tabular-nums">
          {count}
        </span>
      ) : null}
    </span>
  );
}

export type QueueSectionContentProps = React.ComponentProps<
  typeof CollapsibleContent
>;

export function QueueSectionContent({
  className,
  ...props
}: QueueSectionContentProps) {
  return (
    <CollapsibleContent
      className={cn(
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-1 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-1 border-t",
        className,
      )}
      {...props}
    />
  );
}

export type QueueListProps = React.ComponentProps<typeof ScrollArea>;

export function QueueList({ children, className, ...props }: QueueListProps) {
  return (
    <ScrollArea
      className={cn(
        "max-h-60 [&_[data-slot=scroll-area-viewport]>div]:!block [&_[data-slot=scroll-area-viewport]>div]:!w-full",
        className,
      )}
      {...props}
    >
      <ul className="w-full min-w-0 divide-y">{children}</ul>
    </ScrollArea>
  );
}

export type QueueItemProps = React.ComponentProps<"li">;

export function QueueItem({ className, ...props }: QueueItemProps) {
  return (
    <li
      className={cn(
        "group/queue-item hover:bg-muted/30 flex min-h-12 w-full min-w-0 items-start gap-2.5 px-3 py-2.5 transition-colors",
        className,
      )}
      {...props}
    />
  );
}

interface QueueItemIndicatorProps extends React.ComponentProps<"span"> {
  completed?: boolean;
  position?: number;
}

export function QueueItemIndicator({
  className,
  completed = false,
  position,
  ...props
}: QueueItemIndicatorProps) {
  return (
    <span
      className={cn(
        "text-muted-foreground mt-0.5 flex h-4 w-5 shrink-0 items-center font-mono text-[9px] tabular-nums",
        completed && "text-emerald-600",
        className,
      )}
      {...props}
    >
      {completed ? (
        <Check className="size-3" aria-hidden="true" />
      ) : position !== undefined ? (
        String(position).padStart(2, "0")
      ) : null}
    </span>
  );
}

interface QueueItemContentProps extends React.ComponentProps<"div"> {
  completed?: boolean;
}

export function QueueItemContent({
  className,
  completed = false,
  ...props
}: QueueItemContentProps) {
  return (
    <div
      className={cn(
        "min-w-0 flex-1 text-[11px] leading-4",
        completed && "text-muted-foreground line-through",
        className,
      )}
      {...props}
    />
  );
}

export type QueueItemDescriptionProps = React.ComponentProps<"p">;

export function QueueItemDescription({
  className,
  ...props
}: QueueItemDescriptionProps) {
  return (
    <p
      className={cn(
        "text-muted-foreground mt-0.5 truncate text-[10px] leading-4",
        className,
      )}
      {...props}
    />
  );
}

export type QueueItemActionsProps = React.ComponentProps<"div">;

export function QueueItemActions({
  className,
  ...props
}: QueueItemActionsProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-focus-within/queue-item:opacity-100 sm:group-hover/queue-item:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

export type QueueItemActionProps = Omit<
  React.ComponentProps<typeof Button>,
  "size" | "variant"
>;

export function QueueItemAction({ className, ...props }: QueueItemActionProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className={cn("text-muted-foreground size-6", className)}
      {...props}
    />
  );
}

export type QueueItemAttachmentProps = React.ComponentProps<"div">;

export function QueueItemAttachment({
  className,
  ...props
}: QueueItemAttachmentProps) {
  return (
    <div
      className={cn(
        "bg-muted/55 text-muted-foreground mt-1.5 flex w-fit max-w-full items-center gap-1.5 rounded-md border px-1.5 py-1 text-[9px]",
        className,
      )}
      {...props}
    />
  );
}
