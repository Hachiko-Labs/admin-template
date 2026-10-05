"use client";

import {
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Symbols,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

export type BenchmarkPoint = {
  id: string;
  name: string;
  lab: string;
  setting: string;
  score: number;
  cost: number;
  seconds: number;
};
export const DEVELOPERS = [
  { name: "OpenAI", shape: "circle", color: "#43a477" },
  { name: "Anthropic", shape: "triangle", color: "#d49a30" },
  { name: "Google", shape: "diamond", color: "#598ce0" },
  { name: "Z.ai", shape: "square", color: "#cf6898" },
  { name: "Moonshot AI", shape: "diamond", color: "#9470ce" },
  { name: "DeepSeek", shape: "cross", color: "#428eb6" },
  { name: "Alibaba", shape: "wye", color: "#be854e" },
  { name: "xAI", shape: "triangle", color: "#8b8b98" },
  { name: "Thinking Machines", shape: "wye", color: "#3e9b92" },
] as const;
export function duration(seconds: number) {
  return seconds >= 3600
    ? `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
    : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}
export function BenchmarkLegend({
  hidden,
  onToggle,
}: {
  hidden: string[];
  onToggle: (name: string) => void;
}) {
  return (
    <div
      className="flex flex-wrap justify-center gap-x-4 gap-y-2"
      aria-label="Filter charts by developer"
    >
      {DEVELOPERS.map((developer) => (
        <button
          key={developer.name}
          onClick={() => onToggle(developer.name)}
          aria-pressed={!hidden.includes(developer.name)}
          className="focus-visible:outline-ring flex items-center gap-1.5 rounded-sm py-1 text-xs focus-visible:outline-2"
          style={{ opacity: hidden.includes(developer.name) ? 0.3 : 1 }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <Symbols
              cx={8}
              cy={8}
              size={60}
              type={developer.shape}
              fill={developer.color}
            />
          </svg>
          {developer.name}
        </button>
      ))}
    </div>
  );
}
export function BenchmarkComparison({
  data,
  metric,
  selectedId,
  onSelect,
}: {
  data: BenchmarkPoint[];
  metric: "cost" | "seconds";
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const series = Array.from(new Set(data.map((row) => row.name))).map(
    (name) => ({
      name,
      points: data
        .filter((row) => row.name === name)
        .map(({ id, ...row }) => ({ ...row, runId: id }))
        .sort((a, b) => a[metric] - b[metric]),
    }),
  );
  const title = metric === "cost" ? "Score vs. cost" : "Score vs. total time";
  return (
    <section className="min-w-0" aria-label={title}>
      <h3 className="mb-1 text-sm font-medium">{title}</h3>
      <p className="text-muted-foreground mb-5 text-xs">
        {metric === "cost"
          ? "Total model cost for the benchmark run"
          : "Time to complete the benchmark run"}
      </p>
      <div className="h-[350px] w-full xl:h-[380px]">
        {data.length ? (
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={1}
            minHeight={1}
            initialDimension={{ width: 320, height: 350 }}
          >
            <ScatterChart margin={{ top: 12, right: 18, bottom: 18, left: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis
                type="number"
                dataKey={metric}
                reversed
                domain={[0, metric === "cost" ? 150 : 18000]}
                ticks={
                  metric === "cost"
                    ? [0, 50, 100, 150]
                    : [0, 3600, 7200, 10800, 14400, 18000]
                }
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickFormatter={(value) =>
                  metric === "cost" ? `$${value}` : `${value / 3600}h`
                }
              />
              <YAxis
                type="number"
                dataKey="score"
                domain={[0, 40]}
                ticks={[0, 10, 20, 30, 40]}
                width={30}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              />
              <ZAxis range={[70, 70]} />
              <Tooltip
                cursor={false}
                content={({ active, payload }) => {
                  const point = payload?.[0]?.payload as
                    | BenchmarkPoint
                    | undefined;
                  return active && point ? (
                    <div className="bg-popover text-popover-foreground min-w-48 rounded-lg border p-3 text-xs shadow-lg">
                      <p className="font-medium">{point.name}</p>
                      <p className="text-muted-foreground mt-1 capitalize">
                        {point.setting} reasoning
                      </p>
                      <dl className="mt-3 space-y-2">
                        {[
                          ["Score", point.score.toFixed(2)],
                          ["Cost", `$${point.cost.toFixed(2)}`],
                          ["Total time", duration(point.seconds)],
                        ].map(([label, value]) => (
                          <div
                            className="flex justify-between gap-8"
                            key={label}
                          >
                            <dt className="text-muted-foreground">{label}</dt>
                            <dd className="tabular-nums">{value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ) : null;
                }}
              />
              {series.map((group) => {
                const developer =
                  DEVELOPERS.find((d) => d.name === group.points[0].lab) ??
                  DEVELOPERS[7];
                return (
                  <Scatter
                    key={group.name}
                    name={group.name}
                    data={group.points}
                    shape={developer.shape}
                    fill={developer.color}
                    line={
                      group.points.length > 1
                        ? {
                            stroke: developer.color,
                            strokeWidth: 1.5,
                            strokeDasharray: "4 4",
                          }
                        : false
                    }
                    lineType="joint"
                    lineJointType="linear"
                    isAnimationActive={false}
                    onClick={(point) =>
                      onSelect((point.payload as { runId: string }).runId)
                    }
                  >
                    {group.points.map((point) => (
                      <Cell
                        key={point.runId}
                        stroke={
                          point.runId === selectedId
                            ? "var(--foreground)"
                            : "var(--background)"
                        }
                        strokeWidth={point.runId === selectedId ? 2 : 0.8}
                      />
                    ))}
                  </Scatter>
                );
              })}
            </ScatterChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
            No matching configurations
          </div>
        )}
      </div>
    </section>
  );
}
