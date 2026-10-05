"use client";

import { Bookmark } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Adapted from Vercel AI Elements.
// https://elements.ai-sdk.dev/components/checkpoint
export type CheckpointProps = React.ComponentPropsWithoutRef<"div">;

export function Checkpoint({ children, className, ...props }: CheckpointProps) {
  return (
    <div
      className={cn(
        "text-muted-foreground flex min-w-0 items-center gap-1 overflow-hidden",
        className,
      )}
      {...props}
    >
      <Bookmark className="size-3.5 shrink-0" aria-hidden="true" />
      {children}
      <Separator className="min-w-6 flex-1" />
    </div>
  );
}

export interface CheckpointTriggerProps extends React.ComponentProps<
  typeof Button
> {
  tooltip?: string;
}

export function CheckpointTrigger({
  children,
  tooltip,
  ...props
}: CheckpointTriggerProps) {
  const button = (
    <Button type="button" variant="ghost" size="sm" {...props}>
      {children}
    </Button>
  );

  if (!tooltip) return button;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="bottom" align="start">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
