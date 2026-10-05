"use client";

import { Brain, ChevronDown } from "lucide-react";
import * as React from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

// Adapted from Vercel AI Elements without a streaming-markdown dependency.
// https://elements.ai-sdk.dev/components/reasoning
interface ReasoningContextValue {
  duration?: number;
  isOpen: boolean;
  isStreaming: boolean;
}

const ReasoningContext = React.createContext<ReasoningContextValue | null>(
  null,
);

function useReasoning() {
  const context = React.useContext(ReasoningContext);
  if (!context) {
    throw new Error("Reasoning components must be used within Reasoning");
  }
  return context;
}

export interface ReasoningProps extends React.ComponentProps<
  typeof Collapsible
> {
  duration?: number;
  isStreaming?: boolean;
}

export function Reasoning({
  children,
  className,
  defaultOpen,
  duration,
  isStreaming = false,
  onOpenChange,
  open,
  ...props
}: ReasoningProps) {
  const [internalOpen, setInternalOpen] = React.useState(
    defaultOpen ?? isStreaming,
  );
  const wasStreaming = React.useRef(isStreaming);
  const isOpen = open ?? internalOpen;

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (open === undefined) setInternalOpen(nextOpen);
      onOpenChange?.(nextOpen);
    },
    [onOpenChange, open],
  );

  React.useEffect(() => {
    if (isStreaming) {
      wasStreaming.current = true;
      setOpen(true);
      return;
    }

    if (!wasStreaming.current) return;
    const timer = setTimeout(() => {
      setOpen(false);
      wasStreaming.current = false;
    }, 800);

    return () => clearTimeout(timer);
  }, [isStreaming, setOpen]);

  const value = React.useMemo(
    () => ({ duration, isOpen, isStreaming }),
    [duration, isOpen, isStreaming],
  );

  return (
    <ReasoningContext.Provider value={value}>
      <Collapsible
        className={cn("not-prose w-full", className)}
        open={isOpen}
        onOpenChange={setOpen}
        {...props}
      >
        {children}
      </Collapsible>
    </ReasoningContext.Provider>
  );
}

export type ReasoningTriggerProps = React.ComponentProps<
  typeof CollapsibleTrigger
>;

export function ReasoningTrigger({
  children,
  className,
  ...props
}: ReasoningTriggerProps) {
  const { duration, isOpen, isStreaming } = useReasoning();
  const label = isStreaming
    ? "Reasoning…"
    : duration
      ? `Reasoned for ${duration} seconds`
      : "View reasoning summary";

  return (
    <CollapsibleTrigger
      className={cn(
        "text-muted-foreground hover:text-foreground flex w-full items-center gap-2 text-sm transition-colors",
        className,
      )}
      {...props}
    >
      <Brain className="size-4 shrink-0" aria-hidden="true" />
      <span className={cn("text-left", isStreaming && "animate-pulse")}>
        {children ?? label}
      </span>
      <ChevronDown
        className={cn(
          "size-4 shrink-0 transition-transform",
          isOpen && "rotate-180",
        )}
        aria-hidden="true"
      />
    </CollapsibleTrigger>
  );
}

export type ReasoningContentProps = React.ComponentProps<
  typeof CollapsibleContent
>;

export function ReasoningContent({
  className,
  ...props
}: ReasoningContentProps) {
  return (
    <CollapsibleContent
      className={cn(
        "data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 text-muted-foreground data-[state=closed]:animate-out data-[state=open]:animate-in mt-3 border-l pl-4 text-sm leading-6 whitespace-pre-wrap outline-none",
        className,
      )}
      {...props}
    />
  );
}
