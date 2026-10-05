"use client";

import * as React from "react";

import {
  type AgentBlobEyeLayout,
  type AgentBlobSilhouette,
  sampleAgentBlob,
} from "@/components/ai-chat/agent-blob-geometry";
import { cn } from "@/lib/utils";

export {
  AGENT_BLOB_SILHOUETTES,
  type AgentBlobSilhouette,
  sampleAgentBlob,
} from "@/components/ai-chat/agent-blob-geometry";

const VIEWBOX_SIZE = 64;

type AgentBlobA11y =
  | {
      decorative?: false;
      label: string;
    }
  | {
      decorative: true;
      label?: never;
    };

export type AnimatedAgentBlobProps = AgentBlobA11y & {
  className?: string;
  colors: readonly [string, string, string];
  silhouette: AgentBlobSilhouette;
  /** A deterministic animation offset, not a random seed. */
  phase?: number;
};

function blinkAmount(time: number, phase: number) {
  const cycle = (time + phase * 1.3) % 4.4;
  const start = 3.72;
  const duration = 0.2;
  if (cycle < start || cycle > start + duration) return 1;

  const progress = (cycle - start) / duration;
  return 0.08 + 0.92 * Math.abs(progress * 2 - 1);
}

function eyeTransform(
  layout: AgentBlobEyeLayout,
  eyeX: number,
  gazeX: number,
  gazeY: number,
  eyeScale: number,
) {
  return `translate(${gazeX.toFixed(2)} ${gazeY.toFixed(2)}) rotate(${layout.rotation} ${eyeX} ${layout.y}) translate(0 ${layout.y}) scale(1 ${eyeScale.toFixed(3)}) translate(0 ${-layout.y})`;
}

export function AnimatedAgentBlob({
  className,
  colors,
  silhouette,
  phase = 0,
  ...a11y
}: AnimatedAgentBlobProps) {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const bodyRef = React.useRef<SVGPathElement>(null);
  const leftEyeRef = React.useRef<SVGRectElement>(null);
  const rightEyeRef = React.useRef<SVGRectElement>(null);
  const targetRef = React.useRef({ x: 0, y: 0 });
  const gazeRef = React.useRef({ x: 0, y: 0 });
  const gradientId = React.useId().replaceAll(":", "");
  const maskId = `${gradientId}-mask`;
  const initialFrame = React.useMemo(
    () => sampleAgentBlob(silhouette, 0, phase),
    [phase, silhouette],
  );
  const { eyeLayout } = initialFrame;

  React.useEffect(() => {
    const svg = svgRef.current;
    const body = bodyRef.current;
    const leftEye = leftEyeRef.current;
    const rightEye = rightEyeRef.current;
    if (!svg || !body || !leftEye || !rightEye) return;
    const svgElement: SVGSVGElement = svg;
    const bodyElement: SVGPathElement = body;
    const leftEyeElement: SVGRectElement = leftEye;
    const rightEyeElement: SVGRectElement = rightEye;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let visible = true;
    let pointerTracking = false;
    let startedAt = performance.now();

    function trackPointer(event: PointerEvent) {
      if (event.pointerType === "touch") return;
      const bounds = svgElement.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const x =
        (event.clientX - (bounds.left + bounds.width / 2)) /
        Math.max(window.innerWidth / 2, 1);
      const y =
        (event.clientY - (bounds.top + bounds.height / 2)) /
        Math.max(window.innerHeight / 2, 1);
      targetRef.current = {
        x: Math.max(-eyeLayout.maxGazeX, Math.min(eyeLayout.maxGazeX, x * 3.4)),
        y: Math.max(-eyeLayout.maxGazeY, Math.min(eyeLayout.maxGazeY, y * 2.8)),
      };
    }

    function releasePointer() {
      targetRef.current = { x: 0, y: 0 };
    }

    function addPointerTracking() {
      if (pointerTracking) return;
      pointerTracking = true;
      window.addEventListener("pointermove", trackPointer);
      document.addEventListener("pointerleave", releasePointer);
    }

    function removePointerTracking() {
      if (!pointerTracking) return;
      pointerTracking = false;
      window.removeEventListener("pointermove", trackPointer);
      document.removeEventListener("pointerleave", releasePointer);
    }

    function renderFrame(time: number, animate: boolean) {
      const sample = sampleAgentBlob(silhouette, time);
      const target = animate ? targetRef.current : { x: 0, y: 0 };
      const gaze = gazeRef.current;
      gaze.x += (target.x - gaze.x) * (animate ? 0.075 : 1);
      gaze.y += (target.y - gaze.y) * (animate ? 0.075 : 1);

      const idleX = animate
        ? Math.sin(time * 0.74 + phase) * 0.9 +
          Math.sin(time * 1.63 + phase * 2) * 0.25
        : 0;
      const idleY = animate ? Math.sin(time * 0.58 + 1.2 + phase) * 0.55 : 0;
      const eyeX = Math.max(
        -eyeLayout.maxGazeX,
        Math.min(eyeLayout.maxGazeX, gaze.x + idleX),
      );
      const eyeY = Math.max(
        -eyeLayout.maxGazeY,
        Math.min(eyeLayout.maxGazeY, gaze.y + idleY),
      );
      const eyeScale = animate ? blinkAmount(time, phase) : 1;

      bodyElement.setAttribute("d", sample.bodyPath);
      bodyElement.setAttribute("transform", sample.bodyTransform);
      leftEyeElement.setAttribute(
        "transform",
        eyeTransform(eyeLayout, eyeLayout.leftX, eyeX, eyeY, eyeScale),
      );
      rightEyeElement.setAttribute(
        "transform",
        eyeTransform(eyeLayout, eyeLayout.rightX, eyeX, eyeY, eyeScale),
      );
    }

    function render(now: number) {
      frame = 0;
      if (motionQuery.matches || !visible) return;
      renderFrame((now - startedAt) / 1000 + phase, true);
      frame = window.requestAnimationFrame(render);
    }

    function syncAnimation() {
      if (motionQuery.matches || !visible) {
        if (frame) window.cancelAnimationFrame(frame);
        frame = 0;
        removePointerTracking();
        targetRef.current = { x: 0, y: 0 };
        gazeRef.current = { x: 0, y: 0 };
        if (motionQuery.matches) renderFrame(phase, false);
        return;
      }

      startedAt = performance.now();
      addPointerTracking();
      if (!frame) frame = window.requestAnimationFrame(render);
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      syncAnimation();
    });
    observer.observe(svgElement);
    motionQuery.addEventListener("change", syncAnimation);
    syncAnimation();

    return () => {
      observer.disconnect();
      motionQuery.removeEventListener("change", syncAnimation);
      removePointerTracking();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [eyeLayout, phase, silhouette]);

  const accessibleProps =
    "decorative" in a11y && a11y.decorative
      ? ({ "aria-hidden": true } as const)
      : ({ role: "img", "aria-label": a11y.label } as const);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
      className={cn("drop-shadow-sm", className)}
      {...accessibleProps}
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="10"
          y1="8"
          x2="54"
          y2="56"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor={colors[0]} />
          <stop offset="0.52" stopColor={colors[1]} />
          <stop offset="1" stopColor={colors[2]} />
        </linearGradient>
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="64"
          height="64"
        >
          <rect width="64" height="64" fill="black" />
          <path
            ref={bodyRef}
            d={initialFrame.bodyPath}
            transform={initialFrame.bodyTransform}
            fill="white"
          />
          <rect
            ref={leftEyeRef}
            x={eyeLayout.leftX - eyeLayout.width / 2}
            y={eyeLayout.y - eyeLayout.height / 2}
            width={eyeLayout.width}
            height={eyeLayout.height}
            rx={eyeLayout.radius}
            fill="black"
            transform={eyeTransform(eyeLayout, eyeLayout.leftX, 0, 0, 1)}
          />
          <rect
            ref={rightEyeRef}
            x={eyeLayout.rightX - eyeLayout.width / 2}
            y={eyeLayout.y - eyeLayout.height / 2}
            width={eyeLayout.width}
            height={eyeLayout.height}
            rx={eyeLayout.radius}
            fill="black"
            transform={eyeTransform(eyeLayout, eyeLayout.rightX, 0, 0, 1)}
          />
        </mask>
      </defs>
      <rect
        width="64"
        height="64"
        fill={`url(#${gradientId})`}
        mask={`url(#${maskId})`}
      />
    </svg>
  );
}
