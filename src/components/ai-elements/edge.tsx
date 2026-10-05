"use client";

import {
  BaseEdge,
  type EdgeProps,
  getBezierPath,
  getSmoothStepPath,
} from "@xyflow/react";
import { useReducedMotion } from "motion/react";
import * as React from "react";

function TemporaryEdge(props: EdgeProps) {
  const [path] = getSmoothStepPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
    borderRadius: 16,
  });

  return (
    <BaseEdge
      id={props.id}
      path={path}
      markerEnd={props.markerEnd}
      style={{
        stroke: "var(--muted-foreground)",
        strokeDasharray: "3 7",
        strokeLinecap: "round",
        strokeWidth: 1.25,
        opacity: 0.55,
        ...props.style,
      }}
    />
  );
}

function AnimatedEdge(props: EdgeProps) {
  const reducedMotion = useReducedMotion();
  const [path] = getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
    curvature: 0.32,
  });

  return (
    <>
      <BaseEdge
        id={props.id}
        path={path}
        markerEnd={props.markerEnd}
        style={{
          stroke: "var(--border)",
          strokeWidth: 1.5,
          ...props.style,
        }}
      />
      {!reducedMotion && (
        <circle fill="var(--primary)" r="3.5">
          <animateMotion dur="1.8s" path={path} repeatCount="indefinite" />
        </circle>
      )}
    </>
  );
}

function DefaultEdge(props: EdgeProps) {
  const [path] = getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
    curvature: 0.32,
  });

  return (
    <BaseEdge
      id={props.id}
      path={path}
      markerEnd={props.markerEnd}
      style={{ stroke: "var(--border)", strokeWidth: 1.5, ...props.style }}
    />
  );
}

export const Edge = {
  Animated: AnimatedEdge,
  Default: DefaultEdge,
  Temporary: TemporaryEdge,
};
