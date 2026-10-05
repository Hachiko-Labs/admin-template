import { type AgentRun, initialAgentRuns } from "../ai-agent-activity-data";

export type Trace = {
  id: string;
  name: string;
  input: string;
  output: string;
  time: string;
  duration: number;
  tokens: number;
  cost: number;
  error: boolean;
  session: string;
  agent: string;
  run: AgentRun;
};
const ordered = [
  initialAgentRuns[1],
  initialAgentRuns[0],
  ...initialAgentRuns.slice(2),
];
export const traces: Trace[] = Array.from({ length: 36 }, (_, i) => {
  const run = ordered[i % ordered.length];
  const day = 18 - Math.floor(i / ordered.length);
  const minutes = Number(run.duration.match(/(\d+)m/)?.[1] ?? 0);
  const seconds = Number(run.duration.match(/(\d+)s/)?.[1] ?? 0);
  return {
    id: i < ordered.length ? run.id : `${run.id}_${day}`,
    name: run.title,
    input: `${run.title}. ${run.steps[0].detail}. Follow the ${run.rule?.name.toLowerCase() ?? "workspace approval and data handling rules"}.`,
    output:
      run.status === "completed"
        ? (run.output?.content ?? run.steps.at(-1)!.detail)
        : (run.rule?.description ??
          run.steps.find((step) => step.status !== "completed")?.detail ??
          "Execution in progress."),
    time: `Sep ${day}, ${run.time.replace("Yesterday, ", "")}`,
    duration: minutes * 60 + seconds,
    tokens: 1840 + (i % ordered.length) * 386,
    cost: 0.006 + (i % ordered.length) * 0.0017,
    error: run.status === "failed",
    session: `${run.agent.toLowerCase().replaceAll(" ", "-")}_${day}`,
    agent: run.agent,
    run,
  };
});
export const volume = Array.from({ length: 52 }, (_, i) => ({
  success: [
    3, 5, 2, 8, 4, 11, 7, 4, 2, 6, 9, 14, 12, 8, 16, 7, 4, 5, 18, 9, 3, 7, 4,
    15, 16, 9, 3, 5, 8, 13, 12, 6, 4, 7, 2, 6, 7, 9, 5, 3, 5, 8, 6, 4, 11, 3, 7,
    6, 8, 2, 4, 9,
  ][i],
  error: i === 5 ? 2 : i === 23 ? 1 : i === 30 ? 2 : 0,
}));
export type Span = {
  id: string;
  name: string;
  kind: "agent" | "model" | "tool" | "root";
  start: number;
  duration: number;
  depth: number;
  input: string;
  output: string;
  status: string;
  tokens?: string;
  cost?: string;
};
export function spansFor(trace: Trace): Span[] {
  const { run } = trace;
  const slot = (trace.duration * 0.8) / run.steps.length;
  const initial: Span[] = [
    {
      id: "root",
      name: run.agent,
      kind: "root",
      start: 0,
      duration: trace.duration,
      depth: 0,
      input: trace.input,
      output: trace.output,
      status: run.status,
    },
    {
      id: "plan",
      name: "Interpret request",
      kind: "model",
      start: 0,
      duration: trace.duration * 0.12,
      depth: 1,
      input: trace.input,
      output: `Execute ${run.steps.map((step) => step.title.toLowerCase()).join(" → ")}.${run.rule ? ` Enforce ${run.rule.name.toLowerCase()} before continuing.` : " Apply the workspace's connected-app permissions."}`,
      status: "completed",
      tokens: `${trace.tokens} total`,
      cost: `$${trace.cost.toFixed(4)}`,
    },
    {
      id: "agent",
      name: run.agent,
      kind: "agent",
      start: trace.duration * 0.14,
      duration: trace.duration * 0.8,
      depth: 1,
      input: run.title,
      output: trace.output,
      status: run.status,
    },
  ];
  run.steps.forEach((step, i) => {
    initial.push({
      id: `step-${i}`,
      name: step.title,
      kind: step.system === "Internal tool" ? "model" : "tool",
      start: trace.duration * 0.14 + i * slot,
      duration: slot * 0.85,
      depth: 2,
      input: `${step.system} · ${i === 0 ? run.title : run.steps[i - 1].detail}`,
      output: step.detail,
      status: step.status,
    });
    if (step.status === "completed")
      initial.push({
        id: `check-${i}`,
        name: `${step.system} · result validation`,
        kind: "tool",
        start: trace.duration * 0.14 + i * slot + slot * 0.86,
        duration: slot * 0.1,
        depth: 3,
        input: step.detail,
        output: "Result received and recorded in the execution context.",
        status: "completed",
      });
  });
  return initial;
}
