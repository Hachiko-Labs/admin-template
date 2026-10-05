"use client";

import * as React from "react";

import type {
  WorkflowLinkDefinition,
  WorkflowNodeDefinition,
  WorkflowNodeStatus,
} from "@/components/ai-chat/ai-workflow-canvas";
import {
  liveBaseNodes,
  liveLinks,
} from "@/components/ai-chat/ai-workflow-demo-data";
import { AiWorkflowScreenShell } from "@/components/ai-chat/ai-workflow-screen-shell";
import { AiWorkflowWorkspace } from "@/components/ai-chat/ai-workflow-workspace";
import { useWorkflowPlayback } from "@/components/ai-chat/use-workflow-playback";
import { recordValue } from "@/lib/record-value";

const runStages = [
  ["context"],
  ["map"],
  ["build"],
  ["tests", "review"],
  ["complete"],
] as const;

const activity = {
  context: {
    file: "AGENTS.md",
    tool: "read",
  },
  map: {
    file: "src/components/ai-chat",
    tool: "search",
  },
  build: {
    file: "src/components/ai-elements/node.tsx",
    tool: "apply_patch",
  },
  tests: {
    file: "src/components/ai-chat/ai-workflow-canvas.tsx",
    tool: "pnpm lint",
  },
  review: {
    file: "/ai-chat/workflow-2",
    tool: "browser",
  },
  complete: {
    file: "validation-report.json",
    tool: "write",
  },
} satisfies Record<string, { file?: string; tool: string }>;

function resolveNodes(stage: number): WorkflowNodeDefinition[] {
  const activeIds = new Set<string>(runStages[stage] ?? []);
  const completedIds = new Set<string>(runStages.slice(0, stage).flat());
  const finished = stage >= runStages.length;

  return liveBaseNodes.map((node) => {
    let status: WorkflowNodeStatus = "waiting";
    if (finished || completedIds.has(node.id)) status = "completed";
    else if (activeIds.has(node.id)) status = "running";

    const observed = recordValue(activity, node.id);
    const progress =
      status === "completed" ? 100 : status === "running" ? 58 : 0;

    return {
      ...node,
      status,
      progress,
      duration:
        status === "running"
          ? "00:18"
          : status === "completed"
            ? (node.duration ?? "4.2s")
            : undefined,
      file: status === "running" ? observed?.file : node.file,
      tool: status === "running" ? observed?.tool : node.tool,
      tasks: node.tasks?.map((task, index) => ({
        ...task,
        status:
          status === "completed"
            ? "completed"
            : status === "running"
              ? index === 0
                ? "completed"
                : index === 1
                  ? "running"
                  : "waiting"
              : "waiting",
      })),
    };
  });
}

function resolveLinks(stage: number): WorkflowLinkDefinition[] {
  const activeIds = new Set<string>(runStages[stage] ?? []);
  return liveLinks.map((link) => ({
    ...link,
    kind: activeIds.has(link.target)
      ? "active"
      : link.kind === "conditional"
        ? "conditional"
        : "default",
  }));
}

export function AiChatWorkflow2Screen() {
  const { restart: restartRun, stage } = useWorkflowPlayback({
    completeStage: runStages.length,
    initialStage: 2,
    interval: 1500,
    stageCount: runStages.length,
  });

  const nodes = resolveNodes(stage);
  const complete = stage >= runStages.length;

  React.useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      restartRun();
  }, [restartRun]);
  return (
    <AiWorkflowScreenShell
      recentLabel="Observe live agent run"
      headerTitle="Workflow 2 · Live execution"
      userText="Run the workflow and keep the execution visible. I want to know which step is active, what tool it is using, and which file it is touching."
      assistantText="The execution map separates declared workflow progress from observed tool and file activity. The active route moves as the run advances, while each node retains its evidence."
      badge={complete ? "Completed" : "Live"}
      cardTitle="Workflow implementation run"
      summaryMode="live"
      metrics={[
        {
          label: "Completed",
          value: `${nodes.filter((node) => node.status === "completed").length}/${nodes.length}`,
        },
        {
          label: "Active agents",
          value: stage === 3 ? "2" : complete ? "0" : "1",
        },
        { label: "Elapsed", value: complete ? "1m 08s" : "00:18" },
      ]}
    >
      {({ expanded, setExpanded, setOpen }) => (
        <AiWorkflowWorkspace
          definitions={nodes}
          links={resolveLinks(stage)}
          mode="live"
          expanded={expanded}
          eyebrow="Observed activity · repository workflow"
          title="Live agent execution map"
          statusLabel={complete ? "Run completed" : "Agent working"}
          runLabel={complete ? "Run again" : "Restart run"}
          onRun={restartRun}
          onExpandedChange={setExpanded}
          onClose={() => setOpen(false)}
        />
      )}
    </AiWorkflowScreenShell>
  );
}
