"use client";

import { Controls as ControlsPrimitive } from "@xyflow/react";
import * as React from "react";

import { cn } from "@/lib/utils";

export type ControlsProps = React.ComponentProps<typeof ControlsPrimitive>;

export function Controls({ className, ...props }: ControlsProps) {
  return (
    <ControlsPrimitive
      className={cn(
        "bg-background! m-3! gap-0.5 overflow-hidden rounded-xl! border p-1 shadow-lg!",
        "[&>button]:text-muted-foreground! [&>button]:hover:bg-muted! [&>button]:hover:text-foreground! [&>button]:size-8! [&>button]:rounded-lg! [&>button]:border-0! [&>button]:bg-transparent!",
        className,
      )}
      {...props}
    />
  );
}
