import {
  type AgentScript,
  followUpScript,
  scriptForTask,
} from "./agent-scripts";
import {
  type AgentPlan,
  agentPlanSchema,
  type AgentScenarioId,
  agentScenarios,
  type AgentTaskRun,
  type AgentTeamRun,
  type DemoStatus,
  validateAgentPlan,
} from "./agents";

// Browser-only scripted playback. No fetch, credentials, shell, or model SDK.
type Playback = {
  run: AgentTeamRun;
  cursors: Record<string, number>;
  scripts: Record<string, AgentScript>;
  tickAt: number;
  history?: AgentTeamRun[];
};
function createDemoAgentRequest(scenario: AgentScenarioId) {
  const storageKey = `shadcnblocks-agent-demo-playback-${agentScenarios[scenario].storageVersion}`;
  let playback: Playback | undefined;

  function create(plan: AgentPlan, completed: boolean): Playback {
    const run: AgentTeamRun = {
      id: crypto.randomUUID(),
      plan: structuredClone(plan),
      status: completed ? "completed" : "running",
      startedAt: new Date().toISOString(),
      tasks: [],
    };
    const next: Playback = {
      run,
      cursors: {},
      scripts: {},
      tickAt: Date.now(),
    };
    for (const task of plan.tasks) {
      const script = scriptForTask(task, scenario);
      next.scripts[task.id] = script;
      next.cursors[task.id] = completed ? script.steps.length : 0;
      const result: AgentTaskRun = {
        taskId: task.id,
        status: completed ? "completed" : "queued",
        threadId: `demo-${task.id}`,
        turnCount: 1,
        items: [{ id: "1:prompt", kind: "prompt", text: task.instruction }],
        output: completed ? script.output : "",
      };
      if (completed)
        for (const item of script.steps) {
          const event = { ...item, id: `1:${item.id}` };
          const index = result.items.findIndex(
            (entry) => entry.id === event.id,
          );
          if (index === -1) result.items.push(event);
          else result.items[index] = event;
        }
      run.tasks.push(result);
    }
    return next;
  }
  function save() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(playback));
    } catch {
      /* Playback remains usable when storage is unavailable. */
    }
  }
  function current() {
    if (playback) return playback;
    try {
      const raw = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (
        raw?.run?.id &&
        agentPlanSchema.safeParse(raw.run.plan).success &&
        raw.scripts &&
        raw.cursors
      )
        playback = {
          ...raw,
          run: { ...raw.run, plan: agentPlanSchema.parse(raw.run.plan) },
        };
    } catch {
      /* A corrupt draft restores the authored scenario. */
    }
    playback ??= create(agentScenarios[scenario].plan, true);
    save();
    return playback;
  }
  function advance(state: Playback) {
    if (state.run.status !== "running" || Date.now() - state.tickAt < 950)
      return;
    state.tickAt = Date.now();
    let changed = true;
    while (changed) {
      changed = false;
      for (const task of state.run.plan.tasks) {
        const result = state.run.tasks.find(
          (entry) => entry.taskId === task.id,
        )!;
        if (
          result.status === "queued" &&
          task.dependsOn.some((id) =>
            state.run.tasks.some(
              (entry) =>
                entry.taskId === id &&
                ["blocked", "cancelled", "failed"].includes(entry.status),
            ),
          )
        ) {
          result.status = "blocked";
          result.error = "An upstream task was stopped.";
          changed = true;
        }
      }
    }
    let count = state.run.tasks.filter(
      (entry) => entry.status === "running",
    ).length;
    for (const task of state.run.plan.tasks) {
      const result = state.run.tasks.find((entry) => entry.taskId === task.id)!;
      if (
        result.status === "queued" &&
        count < 3 &&
        task.dependsOn.every(
          (id) =>
            state.run.tasks.find((entry) => entry.taskId === id)?.status ===
            "completed",
        )
      ) {
        result.status = "running";
        result.startedAt = new Date().toISOString();
        count++;
      }
    }
    for (const result of state.run.tasks.filter(
      (entry) => entry.status === "running",
    )) {
      const script = state.scripts[result.taskId],
        index = state.cursors[result.taskId];
      const item = script.steps[index];
      if (item) {
        const event = { ...item, id: `${result.turnCount}:${item.id}` };
        const existing = result.items.findIndex(
          (entry) => entry.id === event.id,
        );
        if (existing === -1) result.items.push(event);
        else result.items[existing] = event;
        result.items = result.items.slice(-80);
        state.cursors[result.taskId]++;
      }
      if (state.cursors[result.taskId] >= script.steps.length) {
        result.status = "completed";
        result.output = script.output;
        result.endedAt = new Date().toISOString();
      }
    }
    if (
      !state.run.tasks.some(
        (entry) => entry.status === "running" || entry.status === "queued",
      )
    )
      state.run.status = state.run.tasks.some(
        (entry) => entry.status === "cancelled",
      )
        ? "cancelled"
        : state.run.tasks.some(
              (entry) => entry.status === "stale" || entry.status === "blocked",
            )
          ? "needs-review"
          : "completed";
    save();
  }
  type Action =
    | { action: "history" }
    | { action: "reset" }
    | { action: "start"; plan: AgentPlan }
    | { action: "stop"; id: string; taskId?: string }
    | { action: "continue"; id: string; taskId: string; prompt: string };
  type RunAction = Exclude<Action, { action: "history" }>;
  async function demoAgentRequest(): Promise<DemoStatus>;
  async function demoAgentRequest(
    body: undefined,
    id: string,
  ): Promise<AgentTeamRun>;
  async function demoAgentRequest(body: {
    action: "history";
  }): Promise<AgentTeamRun[]>;
  async function demoAgentRequest(body: RunAction): Promise<AgentTeamRun>;
  async function demoAgentRequest(
    body?: Action,
    id?: string,
  ): Promise<DemoStatus | AgentTeamRun | AgentTeamRun[]> {
    let state = current();
    if (!body) {
      advance(state);
      if (id) return structuredClone(state.run);
      return {
        enabled: true,
        available: true,
        message: "Scripted showcase",
        workspace: "shadcnblocks-admin",
        version: "v0.153.4",
        activeRunId: state.run.status === "running" ? state.run.id : undefined,
        latestRunId: state.run.id,
      } satisfies DemoStatus;
    }
    const action = body;
    if (action.action === "history")
      return structuredClone([state.run, ...(state.history || [])]);
    if (action.action === "start" || action.action === "reset") {
      const plan = agentPlanSchema.parse(
          action.action === "reset"
            ? agentScenarios[scenario].plan
            : action.plan,
        ),
        errors = validateAgentPlan(plan);
      if (errors.length) throw new Error(errors[0]);
      const history = [state.run, ...(state.history || [])].slice(0, 5);
      state = playback = create(plan, action.action === "reset");
      state.history = history;
      state.tickAt = 0;
      advance(state);
    } else if (action.action === "stop") {
      for (const task of state.run.tasks)
        if (
          (!action.taskId || task.taskId === action.taskId) &&
          ["running", "queued"].includes(task.status)
        ) {
          task.status = "cancelled";
          task.error = "Playback stopped.";
        }
      state.tickAt = 0;
      advance(state);
    } else {
      if (state.run.status === "running")
        throw new Error("Wait for this playback to finish or stop it first.");
      const result = state.run.tasks.find(
        (entry) => entry.taskId === action.taskId,
      );
      const task = state.run.plan.tasks.find(
        (entry) => entry.id === action.taskId,
      );
      if (!result || !task)
        throw new Error("Replay the team to start this task.");
      if (
        task.dependsOn.some(
          (parent) =>
            state.run.tasks.find((entry) => entry.taskId === parent)?.status !==
            "completed",
        )
      )
        throw new Error("Complete the upstream tasks first.");
      const affected = new Set([task.id]);
      let changed = true;
      while (changed) {
        changed = false;
        for (const child of state.run.plan.tasks)
          if (
            !affected.has(child.id) &&
            child.dependsOn.some((parent) => affected.has(parent))
          ) {
            affected.add(child.id);
            changed = true;
          }
      }
      for (const child of state.run.tasks)
        if (child.taskId !== task.id && affected.has(child.taskId))
          child.status = "stale";
      result.turnCount = (result.turnCount || 1) + 1;
      result.status = "running";
      result.error = undefined;
      result.output = "";
      result.startedAt = new Date().toISOString();
      result.items.push({
        id: `${result.turnCount}:prompt`,
        kind: "prompt",
        text: action.prompt,
      });
      state.scripts[task.id] = followUpScript(task, action.prompt, scenario);
      state.cursors[task.id] = 0;
      state.tickAt = Date.now();
      state.run.status = "running";
    }
    save();
    return structuredClone(state.run);
  }
  return demoAgentRequest;
}

export const demoAgentRequests = {
  codex: createDemoAgentRequest("codex"),
  mixed: createDemoAgentRequest("mixed"),
};
