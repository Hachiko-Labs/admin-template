"use client";

import type {
  WorkflowLinkDefinition,
  WorkflowNodeDefinition,
  WorkflowNodeStatus,
} from "@/components/ai-chat/ai-workflow-canvas";
import {
  reviewLinks,
  reviewNodes,
} from "@/components/ai-chat/ai-workflow-demo-data";
import { AiWorkflowScreenShell } from "@/components/ai-chat/ai-workflow-screen-shell";
import { AiWorkflowWorkspace } from "@/components/ai-chat/ai-workflow-workspace";
import { useWorkflowPlayback } from "@/components/ai-chat/use-workflow-playback";

const replayStages = [
  ["planner"],
  ["researcher", "implementer"],
  ["tester", "reviewer"],
  ["implementer"],
  ["approval"],
  ["published"],
] as const;

function replayNodes(stage: number | null): WorkflowNodeDefinition[] {
  if (stage === null || stage >= replayStages.length) return reviewNodes;
  const active = new Set<string>(replayStages[stage]);
  const completed = new Set<string>(replayStages.slice(0, stage).flat());

  return reviewNodes.map((node) => {
    let status: WorkflowNodeStatus = "waiting";
    if (completed.has(node.id)) {
      status =
        node.id === "implementer" && stage >= 3 ? "revised" : "completed";
    }
    if (active.has(node.id))
      status = node.id === "implementer" && stage === 3 ? "revised" : "running";
    return {
      ...node,
      status,
      progress:
        status === "completed" || status === "revised"
          ? 100
          : status === "running"
            ? 64
            : 0,
    };
  });
}

function replayLinks(stage: number | null): WorkflowLinkDefinition[] {
  if (stage === null || stage >= replayStages.length) return reviewLinks;
  const active = new Set<string>(replayStages[stage]);
  return reviewLinks.map((link) => ({
    ...link,
    kind: active.has(link.target)
      ? "active"
      : link.id === "reviewer-implementer"
        ? "conditional"
        : "default",
  }));
}

export function AiChatWorkflow3Screen() {
  const { restart: replay, stage } = useWorkflowPlayback({
    completeStage: null,
    initialStage: null,
    interval: 1400,
    stageCount: replayStages.length,
  });

  return (
    <AiWorkflowScreenShell
      recentLabel="Review multi-agent handoff"
      headerTitle="Workflow 3 · Multi-agent review"
      userText="Show me how the agents handed work off, where the implementation was reopened, and what evidence reached the final approval."
      assistantText="The completed run preserves parallel ownership, the reviewer-to-implementer revision loop, and the evidence that converged at approval. You can replay the route without losing the final audit state."
      badge={stage === null ? "Reviewed" : "Replaying"}
      cardTitle="Release migration · run review"
      summaryMode="review"
      metrics={[
        { label: "Agents", value: "5" },
        { label: "Revisions", value: "1" },
        { label: "Total time", value: "3m 39s" },
      ]}
    >
      {({ expanded, setExpanded, setOpen }) => (
        <AiWorkflowWorkspace
          definitions={replayNodes(stage)}
          links={replayLinks(stage)}
          mode="review"
          expanded={expanded}
          eyebrow="Run review · planned and observed handoffs"
          title="Multi-agent release review"
          statusLabel={stage === null ? "Evidence complete" : "Replaying route"}
          runLabel={stage === null ? "Replay run" : "Restart replay"}
          onRun={replay}
          onExpandedChange={setExpanded}
          onClose={() => setOpen(false)}
        />
      )}
    </AiWorkflowScreenShell>
  );
}
