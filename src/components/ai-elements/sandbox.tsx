"use client";

import {
  CheckCircle2,
  ChevronDown,
  Circle,
  Code2,
  LoaderCircle,
  XCircle,
} from "lucide-react";
import * as React from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type SandboxState =
  | "input-available"
  | "input-streaming"
  | "output-available"
  | "output-error";

const statusContent: Record<
  SandboxState,
  { icon: React.ReactNode; label: string }
> = {
  "input-streaming": {
    icon: <Circle className="size-3 animate-pulse" aria-hidden="true" />,
    label: "Preparing",
  },
  "input-available": {
    icon: (
      <LoaderCircle
        className="size-3 animate-spin motion-reduce:animate-none"
        aria-hidden="true"
      />
    ),
    label: "Running",
  },
  "output-available": {
    icon: (
      <CheckCircle2 className="size-3 text-emerald-600" aria-hidden="true" />
    ),
    label: "Completed",
  },
  "output-error": {
    icon: <XCircle className="text-destructive size-3" aria-hidden="true" />,
    label: "Error",
  },
};

export type SandboxProps = React.ComponentProps<typeof Collapsible>;

export function Sandbox({ className, ...props }: SandboxProps) {
  return (
    <Collapsible
      defaultOpen
      className={cn(
        "bg-background group/sandbox not-prose w-full overflow-hidden rounded-xl border shadow-xs",
        className,
      )}
      {...props}
    />
  );
}

export interface SandboxHeaderProps extends React.ComponentProps<
  typeof CollapsibleTrigger
> {
  detail?: string;
  state: SandboxState;
  title: string;
}

export function SandboxHeader({
  className,
  detail,
  state,
  title,
  ...props
}: SandboxHeaderProps) {
  const status = statusContent[state];

  return (
    <CollapsibleTrigger
      className={cn(
        "hover:bg-muted/35 flex min-h-14 w-full items-center gap-3 px-3 py-2.5 text-left transition-colors",
        className,
      )}
      {...props}
    >
      <span className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-lg">
        <Code2 className="text-muted-foreground size-3.5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{title}</span>
        {detail ? (
          <span className="text-muted-foreground block truncate text-xs">
            {detail}
          </span>
        ) : null}
      </span>
      <span className="bg-muted text-muted-foreground inline-flex h-6 shrink-0 items-center gap-1.5 rounded-md px-2 text-[10px] font-medium">
        {status.icon}
        <span className="hidden sm:inline">{status.label}</span>
      </span>
      <ChevronDown
        className="text-muted-foreground size-4 shrink-0 transition-transform group-data-[state=open]/sandbox:rotate-180"
        aria-hidden="true"
      />
    </CollapsibleTrigger>
  );
}

export type SandboxContentProps = React.ComponentProps<
  typeof CollapsibleContent
>;

export function SandboxContent({ className, ...props }: SandboxContentProps) {
  return (
    <CollapsibleContent
      className={cn(
        "data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 data-[state=closed]:animate-out data-[state=open]:animate-in outline-none",
        className,
      )}
      {...props}
    />
  );
}

export type SandboxTabsProps = React.ComponentProps<typeof Tabs>;

export function SandboxTabs({ className, ...props }: SandboxTabsProps) {
  return <Tabs className={cn("w-full gap-0", className)} {...props} />;
}

export type SandboxTabsBarProps = React.ComponentProps<"div">;

export function SandboxTabsBar({ className, ...props }: SandboxTabsBarProps) {
  return (
    <div
      className={cn(
        "bg-muted/20 flex min-h-11 w-full items-center justify-between gap-2 border-y px-2 py-1.5",
        className,
      )}
      {...props}
    />
  );
}

export type SandboxTabsListProps = React.ComponentProps<typeof TabsList>;

export function SandboxTabsList({ className, ...props }: SandboxTabsListProps) {
  return (
    <TabsList
      className={cn("bg-muted/70 h-8 rounded-lg p-0.5", className)}
      {...props}
    />
  );
}

export type SandboxTabsTriggerProps = React.ComponentProps<typeof TabsTrigger>;

export function SandboxTabsTrigger({
  className,
  ...props
}: SandboxTabsTriggerProps) {
  return (
    <TabsTrigger
      className={cn(
        "text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground h-7 rounded-md border-0 bg-transparent px-3 text-xs font-medium shadow-none data-[state=active]:shadow-xs",
        className,
      )}
      {...props}
    />
  );
}

export type SandboxTabContentProps = React.ComponentProps<typeof TabsContent>;

export function SandboxTabContent({
  className,
  ...props
}: SandboxTabContentProps) {
  return (
    <TabsContent
      className={cn("mt-0 min-w-0 text-sm outline-none", className)}
      {...props}
    />
  );
}
