"use client";

import "@xyflow/react/dist/style.css";

import {
  Background,
  BackgroundVariant,
  type Edge,
  type Node,
  ReactFlow,
  type ReactFlowProps,
} from "@xyflow/react";
import { useTheme } from "next-themes";
import * as React from "react";

import { cn } from "@/lib/utils";

export type CanvasProps<
  NodeType extends Node = Node,
  EdgeType extends Edge = Edge,
> = ReactFlowProps<NodeType, EdgeType> & {
  backgroundColor?: string;
  children?: React.ReactNode;
};

const subscribeToHydration = () => () => {};
const clientHydrationSnapshot = () => true;
const serverHydrationSnapshot = () => false;

export function Canvas<
  NodeType extends Node = Node,
  EdgeType extends Edge = Edge,
>({
  backgroundColor,
  deleteKeyCode = null,
  children,
  className,
  ...props
}: CanvasProps<NodeType, EdgeType>) {
  const { resolvedTheme } = useTheme();
  const hydrated = React.useSyncExternalStore(
    subscribeToHydration,
    clientHydrationSnapshot,
    serverHydrationSnapshot,
  );
  const isDark = hydrated && resolvedTheme === "dark";
  // Match the acquirer topology grid in payment-processor/dashboard-6.
  const dotColor =
    backgroundColor ??
    (isDark
      ? "color-mix(in oklab, var(--muted-foreground) 52%, transparent)"
      : "color-mix(in oklab, var(--muted-foreground) 32%, transparent)");
  return (
    <ReactFlow
      className={cn("!bg-background", className)}
      colorMode={isDark ? "dark" : "light"}
      deleteKeyCode={deleteKeyCode}
      fitView
      fitViewOptions={{ padding: 0.16, minZoom: 0.55 }}
      minZoom={0.35}
      maxZoom={1.45}
      panOnDrag={[1, 2]}
      panOnScroll
      selectionOnDrag
      zoomOnDoubleClick={false}
      {...props}
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={16}
        size={1.5}
        color={dotColor}
      />
      {children}
    </ReactFlow>
  );
}
