import { z } from "zod";

export const agentProviders = {
  codex: "Codex",
  claude: "Claude Code",
  grok: "Grok",
} as const;
export type AgentProvider = keyof typeof agentProviders;

export const agentTaskSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9-]{1,64}$/),
  title: z.string().trim().min(1).max(100),
  role: z.enum(["Research", "Design", "Review"]),
  provider: z.enum(["codex", "claude", "grok"]).default("codex"),
  instruction: z.string().trim().min(1).max(6000),
  dependsOn: z.array(z.string()).max(8),
  width: z.number().min(400).max(1600).optional(),
  height: z.number().min(400).max(1600).optional(),
  position: z.object({
    x: z.number().finite().min(-10000).max(10000),
    y: z.number().finite().min(-10000).max(10000),
  }),
});
export const agentPlanSchema = z.object({
  brief: z.string().trim().min(1).max(12000),
  tasks: z.array(agentTaskSchema).min(1).max(9),
});
export type AgentTask = z.infer<typeof agentTaskSchema>;
export type AgentPlan = z.infer<typeof agentPlanSchema>;
export type AgentStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled"
  | "blocked"
  | "stale";
export type AgentActivity = {
  id: string;
  kind: "prompt" | "message" | "command" | "search" | "error" | "tool";
  text: string;
  output?: string;
  status?: "run" | "ok" | "error";
};
export type AgentTaskRun = {
  taskId: string;
  status: AgentStatus;
  threadId?: string;
  startedAt?: string;
  endedAt?: string;
  items: AgentActivity[];
  output: string;
  error?: string;
  inputTokens?: number;
  outputTokens?: number;
  turnCount?: number;
};
export type AgentTeamRun = {
  id: string;
  plan: AgentPlan;
  status: "running" | "completed" | "failed" | "cancelled" | "needs-review";
  startedAt: string;
  tasks: AgentTaskRun[];
};
export type DemoStatus = {
  enabled: boolean;
  available: boolean;
  message: string;
  workspace?: string;
  activeRunId?: string;
  latestRunId?: string;
  version?: string;
};

export const mixedAgentPlan: AgentPlan = {
  brief:
    "Ship a usage and billing dashboard for shadcnblocks-admin. Claude maps the owner’s decisions, Codex implements the overview, and Grok checks the handoff. Clearly distinguish invoice estimates from confirmed charges.",
  tasks: [
    {
      id: "research",
      title: "Map billing decisions",
      role: "Research",
      provider: "claude",
      instruction:
        "Review the billing journey. Identify what a workspace owner needs to know about usage, estimates, overages, and changing plans. Hand the requirements to Codex.",
      dependsOn: [],
      position: { x: 680, y: 0 },
      width: 500,
      height: 480,
    },
    {
      id: "design",
      title: "Build the usage overview",
      role: "Design",
      provider: "codex",
      instruction:
        "Use Claude’s requirements to build the billing overview with existing dashboard components. Separate estimates from confirmed charges and hand the implementation to Grok.",
      dependsOn: ["research"],
      position: { x: 0, y: 0 },
      width: 600,
      height: 1010,
    },
    {
      id: "review",
      title: "Check the billing edge cases",
      role: "Review",
      provider: "grok",
      instruction:
        "Review Claude’s requirements and Codex’s implementation. Check zero usage, over-limit states, stale billing periods, and narrow layouts. Return any actionable findings to Codex.",
      dependsOn: ["research", "design"],
      position: { x: 680, y: 530 },
      width: 500,
      height: 480,
    },
  ],
};

export const codexAgentPlan: AgentPlan = {
  brief:
    "Build a team onboarding flow for the shadcnblocks admin dashboard. Help workspace owners invite teammates, assign roles, and understand who still needs to join.",
  tasks: [
    {
      id: "research",
      title: "Map the onboarding flow",
      role: "Research",
      provider: "codex",
      instruction:
        "Review the existing team settings and map the invite journey. Identify edge cases around pending invitations, duplicate emails, and role assignment.",
      dependsOn: [],
      position: { x: 680, y: 0 },
      width: 500,
      height: 480,
    },
    {
      id: "design",
      title: "Build the invite experience",
      role: "Design",
      provider: "codex",
      instruction:
        "Create a team invitation dialog using the existing shadcn components. Include email entry, role selection, pending invitations, and clear success and error states.",
      dependsOn: [],
      position: { x: 0, y: 0 },
      width: 600,
      height: 1010,
    },
    {
      id: "review",
      title: "Review the implementation",
      role: "Review",
      provider: "codex",
      instruction:
        "Review the research and invitation flow together. Check keyboard access, validation, responsive layout, and the owner/admin/member permissions. Summarize what is ready to ship.",
      dependsOn: ["research", "design"],
      position: { x: 680, y: 530 },
      width: 500,
      height: 480,
    },
  ],
};
export const agentScenarios = {
  codex: {
    label: "Subagent canvas",
    description:
      "Three Codex terminals work together on the team onboarding flow.",
    plan: codexAgentPlan,
    storageVersion: "v2",
  },
  mixed: {
    label: "Mixed agent canvas",
    description:
      "Claude researches a billing dashboard, Codex builds it, and Grok reviews the handoff.",
    plan: mixedAgentPlan,
    storageVersion: "v3",
  },
} as const;
export type AgentScenarioId = keyof typeof agentScenarios;
export const initialAgentPlan = codexAgentPlan;

export function validateAgentPlan(plan: AgentPlan): string[] {
  const errors: string[] = [];
  const ids = new Set(plan.tasks.map((task) => task.id));
  if (ids.size !== plan.tasks.length)
    errors.push("Each task needs a unique ID.");
  for (const task of plan.tasks) {
    if (new Set(task.dependsOn).size !== task.dependsOn.length)
      errors.push(`${task.title} has duplicate inputs.`);
    if (task.dependsOn.some((id) => !ids.has(id)))
      errors.push(`${task.title} has a missing input.`);
  }
  const visiting = new Set<string>(),
    visited = new Set<string>();
  const visit = (id: string): boolean => {
    if (visiting.has(id)) return false;
    if (visited.has(id)) return true;
    visiting.add(id);
    for (const parent of plan.tasks.find((task) => task.id === id)?.dependsOn ??
      [])
      if (!visit(parent)) return false;
    visiting.delete(id);
    visited.add(id);
    return true;
  };
  if (!plan.tasks.every((task) => visit(task.id)))
    errors.push("Task dependencies must not form a loop.");
  return errors;
}
