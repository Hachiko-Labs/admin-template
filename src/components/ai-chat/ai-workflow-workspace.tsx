"use client";

import {
  Check,
  Circle,
  Expand,
  FileCode2,
  FileInput,
  GitBranch,
  History,
  LockKeyhole,
  Minimize2,
  PanelRightOpen,
  Play,
  Plus,
  RotateCw,
  ShieldCheck,
  UserRound,
  Wrench,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import * as React from "react";

import {
  type WorkflowCanvasMode,
  WorkflowInspector,
  WorkflowLegend,
  type WorkflowLinkDefinition,
  type WorkflowNodeDefinition,
  type WorkflowNodeKind,
} from "@/components/ai-chat/ai-workflow-canvas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const WorkflowCanvas = dynamic(
  () =>
    import("@/components/ai-chat/ai-workflow-canvas").then(
      (module) => module.WorkflowCanvas,
    ),
  {
    ssr: false,
    loading: () => <div className="bg-muted/10 size-full" />,
  },
);

const stepLibrary: {
  description: string;
  icon: React.ElementType;
  kind: WorkflowNodeKind;
  label: string;
}[] = [
  {
    description: "Collect structured context",
    icon: FileInput,
    kind: "input",
    label: "Input",
  },
  {
    description: "Delegate an agent task",
    icon: UserRound,
    kind: "agent",
    label: "Agent task",
  },
  {
    description: "Route by a condition",
    icon: GitBranch,
    kind: "branch",
    label: "Decision",
  },
  {
    description: "Require confirmation",
    icon: LockKeyhole,
    kind: "approval",
    label: "Approval",
  },
];

function WorkflowStepPalette({
  onAddNode,
}: {
  onAddNode: (kind?: WorkflowNodeKind) => void;
}) {
  return (
    <div className="no-scrollbar pointer-events-none absolute inset-x-3 top-3 z-20 flex overflow-x-auto pb-2">
      <div className="pointer-events-auto flex items-center gap-2">
        {stepLibrary.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.kind}
              type="button"
              className="bg-background/95 hover:bg-accent hover:text-accent-foreground flex min-w-24 shrink-0 items-center gap-2 rounded-lg border px-2.5 py-2 text-left shadow-xs backdrop-blur transition-colors"
              title={`Add ${item.label.toLowerCase()} step`}
              onClick={() => onAddNode(item.kind)}
            >
              <Icon className="text-muted-foreground size-3.5" />
              <span className="text-[10px] font-medium">{item.label}</span>
              <Plus className="text-muted-foreground ml-auto size-3" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LiveTraceRail({
  definitions,
  following,
  node,
  onClose,
  onFollow,
}: {
  definitions: WorkflowNodeDefinition[];
  following: boolean;
  node: WorkflowNodeDefinition;
  onClose: () => void;
  onFollow: () => void;
}) {
  const finished = definitions.filter(
    (item) => item.status === "completed" || item.status === "revised",
  ).length;
  const progress = Math.round((finished / definitions.length) * 100);
  const activity = definitions.filter(
    (item) =>
      item.status === "completed" ||
      item.status === "revised" ||
      item.status === "running",
  );

  return (
    <aside className="bg-background flex size-full min-h-0 flex-col">
      <div className="flex h-12 shrink-0 items-center gap-2.5 border-b px-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium">Live trace</p>
          <p className="text-muted-foreground text-[9px]">
            {following ? "Following active step" : "Inspecting run history"}
          </p>
        </div>
        {!following ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[10px]"
            onClick={onFollow}
          >
            Follow live
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-7"
          aria-label="Close live trace"
          onClick={onClose}
        >
          <X />
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <section className="border-b p-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-muted-foreground text-[9px] tracking-wide uppercase">
                Run progress
              </p>
              <p className="mt-1 text-sm font-semibold tabular-nums">
                {finished} of {definitions.length} steps
              </p>
            </div>
            <span className="text-muted-foreground font-mono text-[10px]">
              {progress}%
            </span>
          </div>
          <div className="bg-muted mt-2 h-1.5 overflow-hidden rounded-full">
            <span
              className="bg-foreground block h-full rounded-full transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </section>

        <section className="border-b p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-muted-foreground text-[9px] tracking-wide uppercase">
              {node.status === "running" ? "Now executing" : "Selected event"}
            </p>
            <span className="text-muted-foreground font-mono text-[9px] tabular-nums">
              {node.duration ?? "—"}
            </span>
          </div>
          <p className="mt-2 text-xs font-medium">{node.title}</p>
          <p className="text-muted-foreground mt-1 text-[10px] leading-4">
            {node.description}
          </p>
          {node.tool || node.file ? (
            <div className="mt-3 overflow-hidden rounded-lg border text-[10px]">
              {node.tool ? (
                <div className="flex items-center gap-2 border-b px-2.5 py-2 last:border-0">
                  <Wrench className="text-muted-foreground size-3" />
                  <span className="text-muted-foreground">Tool</span>
                  <span className="ml-auto truncate font-mono">
                    {node.tool}
                  </span>
                </div>
              ) : null}
              {node.file ? (
                <div className="flex items-center gap-2 px-2.5 py-2">
                  <FileCode2 className="text-muted-foreground size-3" />
                  <span className="text-muted-foreground">File</span>
                  <span className="ml-auto min-w-0 truncate font-mono">
                    {node.file}
                  </span>
                </div>
              ) : null}
            </div>
          ) : null}
        </section>

        <section className="p-3">
          <p className="text-muted-foreground mb-2 text-[9px] tracking-wide uppercase">
            Activity
          </p>
          <div className="space-y-1">
            {activity.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left",
                  item.id === node.id && "bg-muted",
                )}
              >
                <span
                  className={cn(
                    "grid size-4 shrink-0 place-items-center rounded-full border",
                    item.status === "running" && "border-blue-500",
                    item.status === "completed" &&
                      "border-emerald-500 bg-emerald-500",
                    item.status === "revised" && "border-orange-500",
                  )}
                >
                  {item.status === "completed" ? (
                    <Check className="size-2.5 text-white" />
                  ) : item.status === "running" ? (
                    <span className="size-1 animate-pulse rounded-full bg-blue-500" />
                  ) : (
                    <RotateCw className="size-2.5 text-orange-500" />
                  )}
                </span>
                <span className="min-w-0 flex-1 truncate text-[10px]">
                  {item.title}
                </span>
                <span className="text-muted-foreground font-mono text-[9px]">
                  {item.duration ?? (item.status === "running" ? "live" : "—")}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
}

const reviewStages = [
  { ids: ["planner"], label: "Plan" },
  { ids: ["researcher", "implementer"], label: "Parallel work" },
  { ids: ["tester", "reviewer"], label: "Verification" },
  { ids: ["implementer"], label: "Revision", revision: true },
  { ids: ["approval"], label: "Approval" },
  { ids: ["published"], label: "Release" },
];

function WorkflowReviewTimeline({
  definitions,
}: {
  definitions: WorkflowNodeDefinition[];
}) {
  return (
    <div className="bg-muted/10 flex h-14 shrink-0 items-center gap-2 overflow-x-auto border-b px-3">
      {reviewStages.map((stage, index) => {
        const nodes = stage.ids
          .map((id) => definitions.find((node) => node.id === id))
          .filter((node) => node !== undefined);
        const running = nodes.some((node) => node.status === "running");
        const revised =
          stage.revision && nodes.some((node) => node.status === "revised");
        const complete =
          nodes.length > 0 &&
          nodes.every((node) => ["completed", "revised"].includes(node.status));

        return (
          <React.Fragment key={stage.label}>
            <div className="bg-background flex min-w-24 items-center gap-2 rounded-lg border px-2.5 py-2 shadow-xs">
              <span
                className={cn(
                  "grid size-4 shrink-0 place-items-center rounded-full border",
                  running && "border-blue-500",
                  complete && !revised && "border-emerald-500 bg-emerald-500",
                  revised && "border-orange-500 bg-orange-500",
                )}
              >
                {complete ? (
                  revised ? (
                    <RotateCw className="size-2.5 text-white" />
                  ) : (
                    <Check className="size-2.5 text-white" />
                  )
                ) : running ? (
                  <span className="size-1 animate-pulse rounded-full bg-blue-500" />
                ) : (
                  <Circle className="text-muted-foreground size-2.5" />
                )}
              </span>
              <span className="truncate text-[10px] font-medium">
                {stage.label}
              </span>
            </div>
            {index < reviewStages.length - 1 ? (
              <span className="bg-border h-px w-4 shrink-0" />
            ) : null}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function WorkflowReviewFooter() {
  return (
    <div className="bg-background flex h-10 shrink-0 items-center gap-3 overflow-x-auto border-t px-3 text-[10px]">
      <span className="flex shrink-0 items-center gap-1.5 font-medium">
        <ShieldCheck className="size-3.5" />
        Run evidence
      </span>
      <span className="bg-border h-4 w-px shrink-0" />
      <span className="text-muted-foreground shrink-0">5 agents</span>
      <span className="text-muted-foreground shrink-0">1 revision</span>
      <span className="text-muted-foreground shrink-0">6 evidence items</span>
      <span className="ml-auto flex shrink-0 items-center gap-1.5 text-emerald-600">
        <Check className="size-3" />
        Human approved
      </span>
    </div>
  );
}

interface AiWorkflowWorkspaceProps {
  definitions: WorkflowNodeDefinition[];
  editable?: boolean;
  expanded?: boolean;
  eyebrow: string;
  links: WorkflowLinkDefinition[];
  mode: WorkflowCanvasMode;
  onAddNode?: (kind?: WorkflowNodeKind) => void;
  onClose: () => void;
  onDeleteNode?: (id: string) => void;
  onDuplicateNode?: (id: string) => void;
  onExpandedChange?: (expanded: boolean) => void;
  onRun?: () => void;
  runLabel?: string;
  statusLabel: string;
  title: string;
}

export function AiWorkflowWorkspace({
  definitions,
  editable,
  expanded = false,
  eyebrow,
  links,
  mode,
  onAddNode,
  onClose,
  onDeleteNode,
  onDuplicateNode,
  onExpandedChange,
  onRun,
  runLabel,
  statusLabel,
  title,
}: AiWorkflowWorkspaceProps) {
  const [selectedNode, setSelectedNode] = React.useState<
    WorkflowNodeDefinition["id"] | null
  >(null);
  const [followActive, setFollowActive] = React.useState(mode === "live");
  const [inspectorOpen, setInspectorOpen] = React.useState(mode === "live");
  const selectedDefinition = followActive
    ? (definitions.find((node) => node.status === "running") ??
      [...definitions]
        .reverse()
        .find(
          (node) => node.status === "completed" || node.status === "revised",
        ) ??
      null)
    : (definitions.find((node) => node.id === selectedNode) ?? null);
  const WorkspaceIcon = mode === "review" ? History : GitBranch;

  return (
    <section className="bg-background flex size-full min-h-0 flex-col overflow-hidden">
      <header className="flex min-h-12 shrink-0 items-center gap-3 border-b px-3">
        {mode !== "live" ? (
          <span className="bg-muted grid size-7 shrink-0 place-items-center rounded-lg">
            <WorkspaceIcon className="text-muted-foreground size-3.5" />
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium">{title}</p>
          <p className="text-muted-foreground truncate text-[10px]">
            {eyebrow}
          </p>
        </div>
        <Badge
          variant="secondary"
          className="hidden h-6 gap-1.5 rounded-md px-2 text-[10px] font-normal sm:flex"
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              mode === "live" ? "animate-pulse bg-blue-500" : "bg-emerald-500",
            )}
          />
          {statusLabel}
        </Badge>
        {editable && onAddNode && mode !== "author" ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="size-7 px-0 text-xs sm:h-7 sm:w-auto sm:px-2"
            aria-label="Add workflow step"
            onClick={() => onAddNode()}
          >
            <Plus aria-hidden="true" />
            <span className="hidden sm:inline">Add step</span>
          </Button>
        ) : null}
        {onRun ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="size-7 px-0 text-xs shadow-xs sm:h-7 sm:w-auto sm:px-2.5"
            aria-label={runLabel ?? "Run workflow"}
            onClick={onRun}
          >
            <Play aria-hidden="true" />
            <span className="hidden sm:inline">{runLabel}</span>
          </Button>
        ) : null}
        {onExpandedChange ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-7"
            aria-label={
              expanded ? "Exit full workspace" : "Expand workflow workspace"
            }
            onClick={() => onExpandedChange(!expanded)}
          >
            {expanded ? <Minimize2 /> : <Expand />}
          </Button>
        ) : null}
        {selectedDefinition && !inspectorOpen ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-7"
            aria-label="Open inspector"
            onClick={() => setInspectorOpen(true)}
          >
            <PanelRightOpen />
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-7"
          aria-label="Close workflow workspace"
          onClick={onClose}
        >
          <X />
        </Button>
      </header>

      {mode === "review" ? (
        <WorkflowReviewTimeline definitions={definitions} />
      ) : null}
      <div className="relative flex min-h-0 flex-1">
        <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
          {mode === "author" && onAddNode ? (
            <WorkflowStepPalette onAddNode={onAddNode} />
          ) : null}
          <WorkflowCanvas
            definitions={definitions}
            editable={editable}
            links={links}
            selectedNodeId={selectedDefinition?.id}
            title={title}
            onDeleteNode={onDeleteNode}
            onDuplicateNode={onDuplicateNode}
            onSelectedNodeChange={(node) => {
              if (mode === "live" && !node) {
                setFollowActive(true);
                setSelectedNode(null);
                setInspectorOpen(true);
                return;
              }
              setFollowActive(false);
              setSelectedNode(node?.id ?? null);
              setInspectorOpen(Boolean(node));
            }}
          />
          <div className="bg-background/90 absolute right-3 bottom-3 z-10 hidden rounded-lg border px-1 shadow-sm backdrop-blur lg:block">
            <WorkflowLegend />
          </div>
        </div>

        {selectedDefinition && inspectorOpen ? (
          <div
            className={cn(
              "bg-background z-20 min-h-0 w-80 shrink-0 overflow-hidden border-l",
              "max-[759px]:absolute max-[759px]:inset-3 max-[759px]:w-auto max-[759px]:rounded-xl max-[759px]:border max-[759px]:shadow-xl",
              followActive && "max-[759px]:hidden",
            )}
          >
            {mode === "live" ? (
              <LiveTraceRail
                definitions={definitions}
                following={followActive}
                node={selectedDefinition}
                onClose={() => setInspectorOpen(false)}
                onFollow={() => {
                  setFollowActive(true);
                  setSelectedNode(null);
                }}
              />
            ) : (
              <WorkflowInspector
                mode={mode}
                node={selectedDefinition}
                onClose={() => setInspectorOpen(false)}
              />
            )}
          </div>
        ) : null}
      </div>
      {mode === "review" ? <WorkflowReviewFooter /> : null}
    </section>
  );
}
