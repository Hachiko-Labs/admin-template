"use client";

import * as React from "react";

import type {
  WorkflowNodeDefinition,
  WorkflowNodeKind,
} from "@/components/ai-chat/ai-workflow-canvas";
import {
  authoringLinks,
  authoringNodes,
} from "@/components/ai-chat/ai-workflow-demo-data";
import { AiWorkflowScreenShell } from "@/components/ai-chat/ai-workflow-screen-shell";
import { AiWorkflowWorkspace } from "@/components/ai-chat/ai-workflow-workspace";

export function AiChatWorkflow1Screen() {
  const nextId = React.useRef(authoringNodes.length);
  const [nodes, setNodes] = React.useState(authoringNodes);
  const [validated, setValidated] = React.useState(false);

  function addNode(kind: WorkflowNodeKind = "tool") {
    setValidated(false);
    const nextIndex = ++nextId.current;
    setNodes((current) => {
      const template: Record<
        WorkflowNodeKind,
        Pick<WorkflowNodeDefinition, "category" | "title">
      > = {
        agent: { category: "Agent", title: "New agent task" },
        approval: { category: "Checkpoint", title: "New approval" },
        branch: { category: "Routing", title: "New decision" },
        code: { category: "Code", title: "New code step" },
        input: { category: "Input", title: "New workflow input" },
        review: { category: "Quality", title: "New review step" },
        tool: { category: "Tool", title: "New tool step" },
      };
      const node: WorkflowNodeDefinition = {
        id: `new-step-${nextIndex}`,
        category: template[kind].category,
        title: `${template[kind].title} ${nextIndex}`,
        description:
          "Configure this step from the inspector before running the workflow.",
        kind,
        status: "waiting",
        progress: 0,
        owner: "Unassigned",
        position: { x: 720, y: 500 + (nextIndex - 7) * 150 },
        handles: { target: true, source: true },
      };
      return [...current, node];
    });
  }

  function duplicateNode(id: string) {
    const copyId = ++nextId.current;
    setValidated(false);
    setNodes((current) => {
      const source = current.find((node) => node.id === id);
      if (!source) return current;
      return [
        ...current,
        {
          ...source,
          id: `${source.id}-copy-${copyId}`,
          title: `${source.title} copy`,
          position: {
            x: source.position.x + 40,
            y: source.position.y + 160,
          },
          status: "waiting" as const,
          progress: 0,
        },
      ];
    });
  }

  function validate() {
    setValidated(true);
  }

  function deleteNode(id: string) {
    setValidated(false);
    setNodes((current) => current.filter((node) => node.id !== id));
  }

  return (
    <AiWorkflowScreenShell
      recentLabel="Design release workflow"
      headerTitle="Workflow 1 · Build and configure"
      userText="Create a guarded release workflow from discovery through verification. I need a visual route I can inspect and adjust before anything runs."
      assistantText="I created an editable workflow with a risk branch, an explicit approval checkpoint, and a shared verification output. Open the workspace to move steps, inspect configuration, or add another route."
      badge={validated ? "Validated" : "Draft"}
      cardTitle="Guarded release workflow"
      summaryMode="author"
      metrics={[
        { label: "Steps", value: String(nodes.length) },
        {
          label: "Branches",
          value: String(nodes.filter((node) => node.kind === "branch").length),
        },
        {
          label: "Checkpoints",
          value: String(
            nodes.filter((node) => node.kind === "approval").length,
          ),
        },
      ]}
    >
      {({ expanded, setExpanded, setOpen }) => (
        <AiWorkflowWorkspace
          definitions={nodes}
          links={authoringLinks}
          mode="author"
          editable
          expanded={expanded}
          eyebrow="Editable workflow · guarded release"
          title="Release workflow builder"
          statusLabel={validated ? "Flow valid" : "Draft changes"}
          runLabel="Validate flow"
          onRun={validate}
          onAddNode={addNode}
          onDuplicateNode={duplicateNode}
          onDeleteNode={deleteNode}
          onExpandedChange={setExpanded}
          onClose={() => setOpen(false)}
        />
      )}
    </AiWorkflowScreenShell>
  );
}
