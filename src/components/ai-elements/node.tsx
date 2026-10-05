"use client";

import { Handle, Position } from "@xyflow/react";
import * as React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type NodeProps = React.ComponentProps<typeof Card> & {
  handles: { source: boolean; target: boolean };
};

const handleClass =
  "size-2.5! border-2! border-background! bg-muted-foreground! shadow-[0_0_0_1px_var(--border)]! transition-colors group-hover/node:bg-foreground!";

export function Node({ className, handles, ...props }: NodeProps) {
  return (
    <Card
      className={cn(
        "group/node node-container bg-background relative h-auto w-[16.5rem] gap-0 overflow-visible rounded-xl py-0 shadow-[0_8px_24px_rgba(15,23,42,0.07)] transition-[border-color,box-shadow,transform] duration-200",
        className,
      )}
      {...props}
    >
      {handles.target ? (
        <Handle
          type="target"
          position={Position.Left}
          className={handleClass}
        />
      ) : null}
      {handles.source ? (
        <Handle
          type="source"
          position={Position.Right}
          className={handleClass}
        />
      ) : null}
      {props.children}
    </Card>
  );
}

export type NodeHeaderProps = React.ComponentProps<typeof CardHeader>;
export function NodeHeader({ className, ...props }: NodeHeaderProps) {
  return (
    <CardHeader
      className={cn(
        "bg-muted/25 gap-1 rounded-t-xl border-b py-3 pr-20 pl-3.5",
        className,
      )}
      {...props}
    />
  );
}

export type NodeTitleProps = React.ComponentProps<typeof CardTitle>;
export function NodeTitle({ className, ...props }: NodeTitleProps) {
  return <CardTitle className={cn("text-[13px]", className)} {...props} />;
}

export type NodeDescriptionProps = React.ComponentProps<typeof CardDescription>;
export function NodeDescription({ className, ...props }: NodeDescriptionProps) {
  return (
    <CardDescription
      className={cn("text-[11px] leading-4", className)}
      {...props}
    />
  );
}

export type NodeActionProps = React.ComponentProps<"div">;
export function NodeAction({ className, ...props }: NodeActionProps) {
  return (
    <div
      className={cn("absolute top-3 right-3 flex items-center", className)}
      {...props}
    />
  );
}

export type NodeContentProps = React.ComponentProps<typeof CardContent>;
export function NodeContent({ className, ...props }: NodeContentProps) {
  return <CardContent className={cn("px-3.5 py-3", className)} {...props} />;
}

export type NodeFooterProps = React.ComponentProps<typeof CardFooter>;
export function NodeFooter({ className, ...props }: NodeFooterProps) {
  return (
    <CardFooter
      className={cn(
        "bg-muted/15 min-h-9 rounded-b-xl border-t px-3.5 py-2",
        className,
      )}
      {...props}
    />
  );
}
