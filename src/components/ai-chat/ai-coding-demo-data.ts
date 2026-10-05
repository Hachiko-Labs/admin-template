import type { FileContents } from "@pierre/diffs";
import type { GitStatusEntry } from "@pierre/trees";

export interface AiDemoCodeFile {
  additions: number;
  current: FileContents;
  deletions: number;
  previous: FileContents;
  status: "added" | "modified" | "unchanged";
}

const dashboardBefore = `import { MetricCard } from "@/components/dashboard/metric-card";

export default function DashboardPage() {
  return (
    <main className="space-y-6 p-6">
      <header>
        <p className="text-sm text-muted-foreground">Overview</p>
        <h1 className="text-2xl font-semibold">Revenue</h1>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Revenue" value="$128,430" />
        <MetricCard label="Orders" value="2,840" />
        <MetricCard label="Conversion" value="4.8%" />
      </section>
    </main>
  );
}
`;

const dashboardAfter = `import { MetricCard } from "@/components/dashboard/metric-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";

export default function DashboardPage() {
  return (
    <main className="space-y-6 p-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Overview</p>
          <h1 className="text-2xl font-semibold">Revenue</h1>
        </div>
        <p className="text-sm text-muted-foreground">Updated 2 min ago</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Revenue" value="$128,430" trend="+12.4%" />
        <MetricCard label="Orders" value="2,840" trend="+8.1%" />
        <MetricCard label="Conversion" value="4.8%" trend="+0.6%" />
      </section>

      <RevenueChart />
    </main>
  );
}
`;

const chartBefore = `export function RevenueChart() {
  return null;
}
`;

const chartAfter = `"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";

const revenue = [
  { month: "Jan", total: 82000 },
  { month: "Feb", total: 94000 },
  { month: "Mar", total: 91000 },
  { month: "Apr", total: 108000 },
  { month: "May", total: 116000 },
  { month: "Jun", total: 128430 },
];

export function RevenueChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue over time</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer className="h-72 w-full" config={{ total: { label: "Revenue" } }}>
          <AreaChart data={revenue} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <ChartTooltip />
            <Area dataKey="total" type="monotone" fill="var(--color-total)" fillOpacity={0.16} stroke="var(--color-total)" />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
`;

const cardBefore = `interface MetricCardProps {
  label: string;
  value: string;
}

export function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="rounded-xl border p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
`;

const cardAfter = `interface MetricCardProps {
  label: string;
  value: string;
  trend?: string;
}

export function MetricCard({ label, value, trend }: MetricCardProps) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-xs">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="mt-2 flex items-baseline justify-between gap-3">
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        {trend ? <span className="text-xs font-medium text-emerald-600">{trend}</span> : null}
      </div>
    </div>
  );
}
`;

export const aiDemoFiles = {
  "src/app/dashboard/page.tsx": {
    additions: 12,
    current: { name: "src/app/dashboard/page.tsx", contents: dashboardAfter },
    deletions: 2,
    previous: { name: "src/app/dashboard/page.tsx", contents: dashboardBefore },
    status: "modified",
  },
  "src/components/dashboard/revenue-chart.tsx": {
    additions: 34,
    current: {
      name: "src/components/dashboard/revenue-chart.tsx",
      contents: chartAfter,
    },
    deletions: 1,
    previous: {
      name: "src/components/dashboard/revenue-chart.tsx",
      contents: chartBefore,
    },
    status: "modified",
  },
  "src/components/dashboard/metric-card.tsx": {
    additions: 8,
    current: {
      name: "src/components/dashboard/metric-card.tsx",
      contents: cardAfter,
    },
    deletions: 3,
    previous: {
      name: "src/components/dashboard/metric-card.tsx",
      contents: cardBefore,
    },
    status: "modified",
  },
  "src/lib/format-currency.ts": {
    additions: 7,
    current: {
      name: "src/lib/format-currency.ts",
      contents: `export function formatCurrency(value: number) {\n  return new Intl.NumberFormat("en-US", {\n    style: "currency",\n    currency: "USD",\n    maximumFractionDigits: 0,\n  }).format(value);\n}\n`,
    },
    deletions: 0,
    previous: { name: "src/lib/format-currency.ts", contents: "" },
    status: "added",
  },
  "src/components/ui/chart.tsx": {
    additions: 0,
    current: {
      name: "src/components/ui/chart.tsx",
      contents: `"use client";\n\nimport * as React from "react";\nimport * as RechartsPrimitive from "recharts";\n\nimport { cn } from "@/lib/utils";\n\nexport function ChartContainer({ className, children }: React.ComponentProps<"div">) {\n  return (\n    <div className={cn("flex aspect-video justify-center text-xs", className)}>\n      <RechartsPrimitive.ResponsiveContainer>\n        {children}\n      </RechartsPrimitive.ResponsiveContainer>\n    </div>\n  );\n}\n\nexport const ChartTooltip = RechartsPrimitive.Tooltip;\n`,
    },
    deletions: 0,
    previous: {
      name: "src/components/ui/chart.tsx",
      contents: `"use client";\n\nimport * as React from "react";\nimport * as RechartsPrimitive from "recharts";\n\nimport { cn } from "@/lib/utils";\n\nexport function ChartContainer({ className, children }: React.ComponentProps<"div">) {\n  return (\n    <div className={cn("flex aspect-video justify-center text-xs", className)}>\n      <RechartsPrimitive.ResponsiveContainer>\n        {children}\n      </RechartsPrimitive.ResponsiveContainer>\n    </div>\n  );\n}\n\nexport const ChartTooltip = RechartsPrimitive.Tooltip;\n`,
    },
    status: "unchanged",
  },
} satisfies Record<string, AiDemoCodeFile>;

export const aiDemoTreePaths = [
  "README.md",
  "package.json",
  "src/app/dashboard/page.tsx",
  "src/app/layout.tsx",
  "src/components/dashboard/metric-card.tsx",
  "src/components/dashboard/revenue-chart.tsx",
  "src/components/ui/card.tsx",
  "src/components/ui/chart.tsx",
  "src/lib/format-currency.ts",
  "src/lib/utils.ts",
  "src/styles/globals.css",
];

// Diffshub treats modified files as the visual default. Only exceptional
// statuses remain colored in the repository rail.
export const aiDemoGitStatus: GitStatusEntry[] = Object.entries(aiDemoFiles)
  .filter(([, file]) => file.status === "added")
  .map(([path]) => ({ path, status: "added" }));

export const defaultAiDemoFile = "src/app/dashboard/page.tsx";
