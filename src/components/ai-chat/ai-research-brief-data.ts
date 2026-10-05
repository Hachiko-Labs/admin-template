export type ResearchRow = { id: string; text: string };
export type ResearchBrief = {
  objective: string;
  audience: string;
  region: string;
  period: string;
  sources: string[];
  exclusions: string;
  questions: ResearchRow[];
  steps: ResearchRow[];
};
export const researchSourceTypes = [
  "Official documentation",
  "Independent research",
  "Customer interviews",
];
export const initialResearchBrief: ResearchBrief = {
  objective: "What would make a self-serve onboarding pilot worth expanding?",
  audience: "Product and customer success teams",
  region: "North America",
  period: "Past 12 months",
  sources: ["Official documentation", "Independent research"],
  exclusions: "Exclude vendor-sponsored rankings and anonymous claims.",
  questions: [
    {
      id: "question-1",
      text: "Where do new teams lose momentum before reaching first value?",
    },
    {
      id: "question-2",
      text: "Which onboarding interventions have evidence of improving activation?",
    },
    {
      id: "question-3",
      text: "What should we measure before expanding a 20-workspace pilot?",
    },
  ],
  steps: [
    { id: "step-1", text: "Find relevant sources for each research question." },
    {
      id: "step-2",
      text: "Compare evidence, publication dates, and conflicting findings.",
    },
    {
      id: "step-3",
      text: "Draft a decision brief with citations and open questions.",
    },
  ],
};
export function validateResearchBrief(brief: ResearchBrief) {
  const errors: Record<string, string> = {};
  if (!brief.objective.trim()) errors.objective = "Add a research objective.";
  if (!brief.audience.trim())
    errors.audience = "Name the audience for this brief.";
  if (!brief.sources.length)
    errors.sources = "Choose at least one source type.";
  if (!brief.questions.length)
    errors.questions = "Add at least one research question.";
  if (!brief.steps.length) errors.steps = "Add at least one plan step.";
  for (const row of [...brief.questions, ...brief.steps]) {
    if (!row.text.trim())
      errors[row.id] = "Write a question or step, or remove this row.";
  }
  return errors;
}
export type ResearchDemoRun = {
  brief: ResearchBrief;
  completed: number;
  status: "running" | "paused" | "complete" | "stopped";
};
export function startResearchDemo(
  brief: ResearchBrief,
): ResearchDemoRun | null {
  if (Object.keys(validateResearchBrief(brief)).length) return null;
  return { brief: structuredClone(brief), completed: 0, status: "running" };
}
export function transitionResearchDemo(
  run: ResearchDemoRun,
  action: "tick" | "pause" | "resume" | "stop",
): ResearchDemoRun {
  if (action === "tick" && run.status === "running") {
    const completed = Math.min(run.completed + 1, run.brief.steps.length);
    return {
      ...run,
      completed,
      status: completed === run.brief.steps.length ? "complete" : "running",
    };
  }
  if (action === "pause" && run.status === "running")
    return { ...run, status: "paused" };
  if (action === "resume" && run.status === "paused")
    return { ...run, status: "running" };
  if (
    action === "stop" &&
    (run.status === "running" || run.status === "paused")
  )
    return { ...run, status: "stopped" };
  return run;
}
export function moveResearchRow(
  rows: ResearchRow[],
  id: string,
  direction: -1 | 1,
) {
  const index = rows.findIndex((row) => row.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= rows.length) return rows;
  const next = [...rows];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
export function researchBriefMarkdown(brief: ResearchBrief) {
  return `# Research brief\n\n${brief.objective}\n\n## Scope\n\n- Audience: ${brief.audience}\n- Region: ${brief.region}\n- Publication window: ${brief.period}\n- Source types: ${brief.sources.join(", ")}\n- Exclusions: ${brief.exclusions.trim() || "None specified"}\n\n## Research questions\n\n${brief.questions.map((row, index) => `${index + 1}. ${row.text}`).join("\n")}\n\n## Research plan\n\n${brief.steps.map((row, index) => `${index + 1}. ${row.text}`).join("\n")}\n\n## Evidence to collect\n\n${brief.questions.map((row) => `### ${row.text}\n\nEvidence pending. Record sources, supporting passages, conflicting findings, and remaining uncertainty.\n`).join("\n")}\n---\nThis is a planning document from a local demo. No sources have been retrieved or findings verified.\n`;
}
