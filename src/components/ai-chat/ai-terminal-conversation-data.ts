import { aiDemoFiles } from "./ai-coding-demo-data";

export type TerminalEntry = {
  kind: "user" | "message" | "tool";
  text: string;
  arg?: string;
  result?: string;
  output?: string;
};
export type TerminalReply = { summary: string; events: TerminalEntry[] };
export const terminalRepo = "shadcn-analytics";
export const terminalBranch = "main";
export const terminalRequest =
  "Continue the revenue overview from our last session. Walk me through the four changed files in the terminal, especially the chart and the shared metric card.";
export const terminalSummary = `The revenue overview is ready for review. The dashboard keeps the existing metric cards, adds optional trend values, and renders a six-month revenue chart using the shared shadcn chart components.

The page stays server-rendered; Recharts lives in its own client component. The currency formatter is included as a separate helper.

The terminal walks through the same four files from our last session. Open Files to browse the repository, read the code, or compare changes.`;

// The same repository snapshot powers Conversation 5 and its terminal continuation.
export const terminalFiles = Object.values(aiDemoFiles).filter(
  (file) => file.status !== "unchanged",
);

const checks: TerminalEntry[] = [
  {
    kind: "tool",
    text: "Read",
    arg: "src/components/dashboard/revenue-chart.tsx",
    result: "Review checklist · bundled example",
    output:
      "✓ Recharts isolated behind a client boundary\n✓ Shared ChartContainer and ChartTooltip reused\n✓ Six monthly data points, Jan–Jun\n✓ accessibilityLayer enabled\n\nThis is a scripted source review, not an executed test result.",
  },
  {
    kind: "message",
    text: "Before shipping, run TypeScript and browser checks in the real project. Review chart labels, theme colors, tooltip formatting, and the layout at narrow widths.",
  },
];
export const initialTerminalEntries: TerminalEntry[] = [
  { kind: "user", text: terminalRequest },
  {
    kind: "message",
    text: "I’ll pick up the revenue overview and trace the dashboard, chart, metric card, and formatter from the existing changes.",
  },
  {
    kind: "tool",
    text: "Bash",
    arg: "git diff --stat",
    result: "4 files changed · 61 additions · 6 deletions",
    output: terminalFiles
      .map(
        (f) =>
          `${f.status === "added" ? "A" : "M"} ${f.current.name}  +${f.additions} -${f.deletions}`,
      )
      .join("\n"),
  },
  {
    kind: "tool",
    text: "Read",
    arg: "src/app/dashboard/page.tsx",
    result: "The route composes the existing cards and the new chart.",
    output:
      '<MetricCard label="Revenue" value="$128,430" trend="+12.4%" />\n<RevenueChart />',
  },
  {
    kind: "tool",
    text: "Read",
    arg: "src/components/dashboard/revenue-chart.tsx",
    result: "A small client component with the shared chart primitives.",
    output:
      '"use client";\n\nimport { ChartContainer, ChartTooltip } from "@/components/ui/chart";\n\n// Jan–Jun · one area series · light fill · horizontal grid lines',
  },
  {
    kind: "tool",
    text: "Read",
    arg: "src/components/dashboard/metric-card.tsx",
    result: "Optional trend prop keeps the existing card reusable.",
    output:
      "interface MetricCardProps {\n  label: string;\n  value: string;\n  trend?: string;\n}",
  },
  {
    kind: "tool",
    text: "Read",
    arg: "src/lib/format-currency.ts",
    result: "New helper for whole-dollar USD formatting.",
    output: aiDemoFiles["src/lib/format-currency.ts"].current.contents,
  },
  {
    kind: "message",
    text: "The four-file review is ready. Open Files for the same repository tree and Code / Changes views from the previous session.\n\nThe formatter is present as a helper; the current dashboard values are still literal strings.",
  },
];

export function terminalReply(prompt: string): TerminalReply {
  const normalized = prompt.toLowerCase();
  if (/mobile|keyboard|narrow|responsive/.test(normalized))
    return {
      summary:
        "The metric-card grid stacks below the md breakpoint and uses three columns above it. The chart container takes the available width with a fixed h-72 height. The sample enables Recharts accessibilityLayer; keyboard behavior and small-screen tooltip placement still need browser validation.",
      events: [
        {
          kind: "tool",
          text: "Read",
          arg: "src/app/dashboard/page.tsx + revenue-chart.tsx",
          result: "Responsive layout in the shared example",
          output:
            "Cards: grid gap-4 md:grid-cols-3\nChart: h-72 w-full\nAreaChart: accessibilityLayer",
        },
        {
          kind: "message",
          text: "Check the stacked cards and chart at a narrow viewport, then verify focus and tooltip behavior with a keyboard.",
        },
      ],
    };
  if (/check|test|tsc|lint|verify/.test(normalized))
    return {
      summary:
        "The source review confirms the client boundary, shared chart components, six-month data, and accessibilityLayer. TypeScript and browser validation should run in the real project; this terminal only replays the bundled review.",
      events: checks,
    };
  if (/chart|revenue|metric|trend|currency/.test(normalized))
    return {
      summary:
        "RevenueChart owns the Recharts client boundary and reuses ChartContainer and ChartTooltip. MetricCard adds an optional trend prop, so existing callers still work. The new formatter returns whole-dollar USD strings, but the dashboard currently keeps its display values as literals.",
      events: [
        {
          kind: "tool",
          text: "Read",
          arg: "src/components/dashboard/revenue-chart.tsx",
          result: "Shared shadcn chart primitives",
          output:
            aiDemoFiles["src/components/dashboard/revenue-chart.tsx"].current
              .contents,
        },
        {
          kind: "message",
          text: "The chart uses Jan–Jun revenue data, one monotone area series, a 16% fill, and horizontal grid lines. Open Files to compare the implementation with the previous version.",
        },
      ],
    };
  if (/diff|change|review|file|status/.test(normalized))
    return {
      summary:
        "Four files carry the revenue overview: the dashboard page, RevenueChart, the existing MetricCard, and a new formatCurrency helper. They are the same +61 / −6 example from the previous session. Use Files to browse the repository and switch between Code and Changes.",
      events: [
        {
          kind: "tool",
          text: "Bash",
          arg: "git diff --stat",
          result: "Bundled snapshot · 4 files changed",
          output: terminalFiles
            .map((f) => `${f.status === "added" ? "A" : "M"} ${f.current.name}`)
            .join("\n"),
        },
        {
          kind: "message",
          text: "The shared ui/chart.tsx is context for the review and remains unchanged. All four changed files are available in the repository tree.",
        },
      ],
    };
  if (/repo|layout|split|sidebar|component|architecture/.test(normalized))
    return {
      summary:
        "The dashboard route composes MetricCard and RevenueChart. MetricCard remains a shared presentation component; RevenueChart isolates Recharts behind a client boundary and imports the shared shadcn chart wrapper. The separate formatCurrency helper is ready for data formatting.",
      events: [
        {
          kind: "tool",
          text: "Read",
          arg: "src/app/dashboard/page.tsx",
          result: "Revenue overview composition",
          output:
            "DashboardPage (server)\n├─ MetricCard × 3 · optional trend\n└─ RevenueChart (client)\n   └─ ChartContainer + ChartTooltip\n\nlib/format-currency.ts · shared helper",
        },
        {
          kind: "message",
          text: "The existing card stays reusable, and the interactive chart does not move the entire page into the client bundle.",
        },
      ],
    };
  return {
    summary:
      "This sample continues the revenue overview. Ask about the chart, metric-card trends, repo layout, responsive behavior, review checks, or the four changed files.",
    events: [
      {
        kind: "message",
        text: "Available in this scripted session:\n  Review the chart\n  Explain the repo layout\n  Check responsive behavior\n  Review the changed files\n\nNo shell commands or model requests are executed.",
      },
    ],
  };
}
