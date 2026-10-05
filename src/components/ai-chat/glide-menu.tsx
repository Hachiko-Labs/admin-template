"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface GlideMenuProps extends React.ComponentProps<"div"> {
  highlightClassName?: string;
  rowSelector?: string;
}

export function GlideMenu({
  children,
  className,
  highlightClassName,
  rowSelector = "[data-glide-menu-row]",
  ...props
}: GlideMenuProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [highlight, setHighlight] = React.useState<{
    height: number;
    top: number;
  } | null>(null);
  const [visible, setVisible] = React.useState(false);

  const moveHighlight = React.useCallback(
    (target: EventTarget | null) => {
      const container = containerRef.current;
      if (!(target instanceof Element) || !container) return;

      const row = target.closest(rowSelector);
      if (!(row instanceof HTMLElement) || !container.contains(row)) return;

      const containerRect = container.getBoundingClientRect();
      const rowRect = row.getBoundingClientRect();
      setHighlight({
        height: rowRect.height,
        top: rowRect.top - containerRect.top,
      });
      setVisible(true);
    },
    [rowSelector],
  );

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      onMouseOver={(event) => moveHighlight(event.target)}
      onMouseLeave={() => setVisible(false)}
      onFocusCapture={(event) => moveHighlight(event.target)}
      onBlurCapture={(event) => {
        if (!containerRef.current?.contains(event.relatedTarget)) {
          setVisible(false);
        }
      }}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute",
          highlightClassName ?? "bg-accent inset-x-0 rounded-[8px]",
        )}
        style={{
          top: highlight?.top ?? 0,
          height: highlight?.height ?? 0,
          opacity: highlight && visible ? 1 : 0,
          transition:
            "top 220ms cubic-bezier(0.23,1,0.32,1), height 220ms cubic-bezier(0.23,1,0.32,1), opacity 150ms ease",
        }}
      />
      {children}
    </div>
  );
}
