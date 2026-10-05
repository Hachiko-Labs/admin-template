"use client";

import type { ConnectionLineComponentProps } from "@xyflow/react";

export const Connection = ({
  fromX,
  fromY,
  toX,
  toY,
}: Pick<ConnectionLineComponentProps, "fromX" | "fromY" | "toX" | "toY">) => {
  const middle = fromX + (toX - fromX) * 0.5;
  const path = `M${fromX},${fromY} C ${middle},${fromY} ${middle},${toY} ${toX},${toY}`;

  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke="var(--ring)"
        strokeWidth={1.5}
        strokeDasharray="4 5"
      />
      <circle
        cx={toX}
        cy={toY}
        fill="var(--background)"
        r={3}
        stroke="var(--ring)"
        strokeWidth={1.5}
      />
    </g>
  );
};
