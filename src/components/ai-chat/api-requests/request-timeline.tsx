"use client";

import { useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { type ApiRequest, formatTime } from "./request-data";

// Each bar is also a keyboard-accessible time filter. Pointer capture supports
// selecting a range across bars without moving focus or relying on chart internals.
export function RequestTimeline({
  rows,
  start,
  end,
  from,
  to,
  onRange,
}: {
  rows: ApiRequest[];
  start: number;
  end: number;
  from: number;
  to: number;
  onRange: (from: number, to: number) => void;
}) {
  const [selection, setSelection] = useState<[number, number] | null>(null);
  const drag = useRef<number | null>(null);
  const track = useRef<HTMLDivElement>(null);
  const count = 48,
    step = (end - start) / count;
  const bins = Array.from({ length: count }, (_, index) => ({
    index,
    success: 0,
    error: 0,
  }));
  for (const row of rows) {
    if (row.timestamp < start || row.timestamp > end) continue;
    const bin =
      bins[Math.min(count - 1, Math.floor((row.timestamp - start) / step))];
    if (row.status === 200) bin.success++;
    else bin.error++;
  }
  const max = Math.max(1, ...bins.map((bin) => bin.success + bin.error));
  function indexAt(clientX: number) {
    const rect = track.current!.getBoundingClientRect();
    return Math.min(
      count - 1,
      Math.max(0, Math.floor(((clientX - rect.left) / rect.width) * count)),
    );
  }
  function commit(a: number, b: number) {
    onRange(
      Math.floor(start + Math.min(a, b) * step),
      Math.floor(start + (Math.max(a, b) + 1) * step),
    );
  }
  return (
    <section
      aria-label="Request timeline"
      className="h-[74px] shrink-0 border-b px-2 pt-1 pb-3"
    >
      <div>
        <div
          ref={track}
          className="relative flex h-[32px] touch-none items-end gap-[6px] select-none"
          onPointerDown={(event) => {
            if (event.button !== 0) return;
            const index = indexAt(event.clientX);
            drag.current = index;
            setSelection([index, index]);
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            if (drag.current !== null)
              setSelection([drag.current, indexAt(event.clientX)]);
          }}
          onPointerUp={(event) => {
            if (drag.current !== null)
              commit(drag.current, indexAt(event.clientX));
            drag.current = null;
            setSelection(null);
          }}
          onPointerCancel={() => {
            drag.current = null;
            setSelection(null);
          }}
        >
          {bins.map((bin) => {
            const selected = selection
              ? bin.index >= Math.min(...selection) &&
                bin.index <= Math.max(...selection)
              : !from ||
                (start + (bin.index + 1) * step > from &&
                  start + bin.index * step < to);
            return (
              <button
                key={bin.index}
                type="button"
                aria-label={`Filter ${formatTime(start + bin.index * step)} to ${formatTime(start + (bin.index + 1) * step)} UTC, ${bin.success + bin.error} requests, ${bin.error} errors`}
                title={`${formatTime(start + bin.index * step)} UTC · ${bin.success + bin.error} requests · ${bin.error} errors`}
                onClick={(event) => {
                  if (event.detail === 0) commit(bin.index, bin.index);
                }}
                className={cn(
                  "focus-visible:outline-ring relative flex h-full min-w-0 flex-1 flex-col-reverse justify-start outline-offset-2 transition-opacity hover:opacity-70 focus-visible:outline-2",
                  !selected && "opacity-20",
                )}
              >
                <span
                  className="bg-primary block w-full"
                  style={{ height: `${(bin.error / max) * 90}%` }}
                />
                <span
                  className="bg-primary/20 block w-full"
                  style={{
                    height: `${(bin.success / max) * 90}%`,
                    minHeight: bin.success ? 2 : 0,
                  }}
                />
              </button>
            );
          })}
        </div>
        <div className="text-muted-foreground mt-1 flex justify-around text-xs">
          {[0, 0.25, 0.5, 0.75, 1].map((position) => (
            <span key={position}>
              {formatTime(start + (end - start) * position).slice(0, 5)}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
