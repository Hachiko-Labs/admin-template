"use client";

import { NodeToolbar, Position } from "@xyflow/react";
import * as React from "react";

import { cn } from "@/lib/utils";

export type ToolbarProps = React.ComponentProps<typeof NodeToolbar>;

export function Toolbar({ className, ...props }: ToolbarProps) {
  return (
    <NodeToolbar
      position={Position.Bottom}
      offset={10}
      className={cn(
        "bg-background flex items-center gap-0.5 rounded-lg border p-1 shadow-lg",
        className,
      )}
      {...props}
    />
  );
}
