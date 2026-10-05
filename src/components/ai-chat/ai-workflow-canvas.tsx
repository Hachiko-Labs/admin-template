"use client";

import {
  addEdge,
  type Connection as FlowConnection,
  type Edge as FlowEdge,
  type EdgeTypes,
  MarkerType,
  type Node as FlowNode,
  type NodeProps as FlowNodeProps,
  type NodeTypes,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import {
  Braces,
  Check,
  Circle,
  CircleAlert,
  CircleCheck,
  Clock3,
  Copy,
  FileCode2,
  FileInput,
  GitBranch,
  LoaderCircle,
  LockKeyhole,
  type LucideIcon,
  MoreHorizontal,
  Pencil,
  RotateCw,
  ShieldCheck,
  SquareTerminal,
  Trash2,
  UserRound,
  Wrench,
  XCircle,
} from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

import { Canvas } from "@/components/ai-elements/canvas";
import { Connection } from "@/components/ai-elements/connection";
import { Controls } from "@/components/ai-elements/controls";
import { Edge as AiEdge } from "@/components/ai-elements/edge";
import {
  Node as AiNode,
  NodeAction,
  NodeContent,
  NodeDescription,
  NodeFooter,
  NodeHeader,
  NodeTitle,
} from "@/components/ai-elements/node";
import { Toolbar } from "@/components/ai-elements/toolbar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export type WorkflowNodeStatus =
  | "blocked"
  | "completed"
  | "failed"
  | "revised"
  | "running"
  | "skipped"
  | "waiting";

export type WorkflowNodeKind =
  | "agent"
  | "approval"
  | "branch"
  | "code"
  | "input"
  | "review"
  | "tool";

export interface WorkflowTaskData {
  label: string;
  status: "completed" | "running" | "waiting";
}

export interface WorkflowNodeDefinition {
  agent?: string;
  category: string;
  description: string;
  duration?: string;
  file?: string;
  handles: { source: boolean; target: boolean };
  id: string;
  kind: WorkflowNodeKind;
  owner?: string;
  position: { x: number; y: number };
  progress?: number;
  status: WorkflowNodeStatus;
  tasks?: WorkflowTaskData[];
  title: string;
  tool?: string;
}

export interface WorkflowLinkDefinition {
  id: string;
  kind?: "active" | "conditional" | "default";
  label?: string;
  source: string;
  target: string;
}

export type WorkflowCanvasMode = "author" | "live" | "review";

type WorkflowNodeData = {
  definition: WorkflowNodeDefinition;
  editable: boolean;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
};

type WorkflowFlowNode = FlowNode<WorkflowNodeData, "workflow">;

const kindMeta: Record<
  WorkflowNodeKind,
  { icon: LucideIcon; surface: string }
> = {
  agent: {
    icon: UserRound,
    surface: "bg-muted text-muted-foreground ring-border",
  },
  approval: {
    icon: LockKeyhole,
    surface: "bg-muted text-muted-foreground ring-border",
  },
  branch: {
    icon: GitBranch,
    surface: "bg-muted text-muted-foreground ring-border",
  },
  code: {
    icon: Braces,
    surface: "bg-muted text-muted-foreground ring-border",
  },
  input: {
    icon: FileInput,
    surface: "bg-muted text-muted-foreground ring-border",
  },
  review: {
    icon: ShieldCheck,
    surface: "bg-muted text-muted-foreground ring-border",
  },
  tool: {
    icon: Wrench,
    surface: "bg-muted text-muted-foreground ring-border",
  },
};

const statusMeta: Record<
  WorkflowNodeStatus,
  { icon: LucideIcon; label: string; className: string; dot: string }
> = {
  blocked: {
    icon: CircleAlert,
    label: "Blocked",
    className: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  completed: {
    icon: CircleCheck,
    label: "Completed",
    className: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  failed: {
    icon: XCircle,
    label: "Failed",
    className: "text-destructive",
    dot: "bg-destructive",
  },
  revised: {
    icon: RotateCw,
    label: "Revised",
    className: "text-orange-600 dark:text-orange-400",
    dot: "bg-orange-500",
  },
  running: {
    icon: LoaderCircle,
    label: "Running",
    className: "text-blue-600 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  skipped: {
    icon: Circle,
    label: "Skipped",
    className: "text-muted-foreground",
    dot: "bg-muted-foreground/50",
  },
  waiting: {
    icon: Clock3,
    label: "Waiting",
    className: "text-muted-foreground",
    dot: "bg-muted-foreground/50",
  },
};

function WorkflowStatus({ status }: { status: WorkflowNodeStatus }) {
  const meta = statusMeta[status];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-medium",
        meta.className,
      )}
    >
      <Icon
        className={cn(
          "size-3",
          status === "running" && "animate-spin motion-reduce:animate-none",
        )}
        aria-hidden="true"
      />
      {meta.label}
    </span>
  );
}

function TaskDot({ status }: { status: WorkflowTaskData["status"] }) {
  return (
    <span
      className={cn(
        "relative grid size-3 shrink-0 place-items-center rounded-full border",
        status === "completed" && "border-emerald-500 bg-emerald-500",
        status === "running" && "border-blue-500",
        status === "waiting" && "border-muted-foreground/45",
      )}
    >
      {status === "completed" ? (
        <Check className="size-2 text-white" aria-hidden="true" />
      ) : status === "running" ? (
        <span className="size-1 animate-pulse rounded-full bg-blue-500" />
      ) : null}
    </span>
  );
}

function WorkflowNodeCard({ data, selected }: FlowNodeProps<WorkflowFlowNode>) {
  const { definition, editable, onDelete, onDuplicate } = data;
  const kind = kindMeta[definition.kind];
  const KindIcon = kind.icon;
  const running = definition.status === "running";

  return (
    <AiNode
      handles={definition.handles}
      className={cn(
        selected && "border-foreground/35 ring-foreground/10 ring-4",
        running &&
          "border-blue-500/45 shadow-[0_10px_32px_rgba(59,130,246,0.14)]",
        definition.status === "failed" && "border-destructive/50",
        definition.status === "blocked" && "border-amber-500/50",
        definition.status === "revised" && "border-orange-500/50",
      )}
    >
      <NodeHeader>
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={cn(
              "grid size-8 shrink-0 place-items-center rounded-lg ring-1",
              kind.surface,
            )}
          >
            <KindIcon className="size-3.5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-muted-foreground truncate font-mono text-[9px] tracking-[0.08em] uppercase">
              {definition.category}
            </p>
            <NodeTitle className="truncate">{definition.title}</NodeTitle>
          </div>
        </div>
        <NodeAction>
          <WorkflowStatus status={definition.status} />
        </NodeAction>
        <NodeDescription className="mt-1.5 line-clamp-2">
          {definition.description}
        </NodeDescription>
      </NodeHeader>

      <NodeContent>
        {definition.tool || definition.file ? (
          <div
            className={cn(
              "bg-muted/35 space-y-1.5 rounded-lg border px-2.5 py-2",
              running && "border-blue-500/20 bg-blue-500/5",
            )}
          >
            {definition.tool ? (
              <div className="flex min-w-0 items-center gap-2 text-[10px]">
                <SquareTerminal
                  className={cn(
                    "text-muted-foreground size-3 shrink-0",
                    running && "text-blue-500",
                  )}
                  aria-hidden="true"
                />
                <span className="text-muted-foreground shrink-0">Tool</span>
                <span className="min-w-0 truncate font-mono">
                  {definition.tool}
                </span>
              </div>
            ) : null}
            {definition.file ? (
              <div className="flex min-w-0 items-center gap-2 text-[10px]">
                <FileCode2
                  className="text-muted-foreground size-3 shrink-0"
                  aria-hidden="true"
                />
                <span className="text-muted-foreground shrink-0">File</span>
                <span className="min-w-0 truncate font-mono">
                  {definition.file}
                </span>
              </div>
            ) : null}
          </div>
        ) : definition.tasks?.length ? (
          <div className="space-y-2">
            {definition.tasks.slice(0, 3).map((task) => (
              <div
                key={task.label}
                className="flex min-w-0 items-center gap-2 text-[10px]"
              >
                <TaskDot status={task.status} />
                <span
                  className={cn(
                    "min-w-0 truncate",
                    task.status === "waiting" && "text-muted-foreground",
                  )}
                >
                  {task.label}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-[10px] leading-4">
            Select the node to inspect its configuration and dependencies.
          </p>
        )}
      </NodeContent>

      <NodeFooter className="justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1.5 text-[10px]">
          <span
            className={cn(
              "size-1.5 shrink-0 rounded-full",
              statusMeta[definition.status].dot,
            )}
          />
          <span className="text-muted-foreground truncate">
            {definition.agent ?? definition.owner ?? "Workflow agent"}
          </span>
        </div>
        {definition.progress !== undefined ? (
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-muted-foreground font-mono text-[9px]">
              {definition.progress}%
            </span>
            <span className="bg-muted block h-1 w-10 overflow-hidden rounded-full">
              <span
                className={cn(
                  "block h-full rounded-full",
                  running ? "bg-blue-500" : "bg-foreground/65",
                )}
                style={{ width: `${definition.progress}%` }}
              />
            </span>
          </div>
        ) : definition.duration ? (
          <span className="text-muted-foreground font-mono text-[9px] tabular-nums">
            {definition.duration}
          </span>
        ) : null}
      </NodeFooter>

      {editable ? (
        <Toolbar isVisible={selected} className="nodrag">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-7"
            aria-label={`Edit ${definition.title}`}
          >
            <Pencil aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-7"
            aria-label={`Duplicate ${definition.title}`}
            onClick={() => onDuplicate?.(definition.id)}
          >
            <Copy aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-destructive size-7"
            aria-label={`Delete ${definition.title}`}
            onClick={() => onDelete?.(definition.id)}
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </Toolbar>
      ) : null}
    </AiNode>
  );
}

const nodeTypes: NodeTypes = { workflow: WorkflowNodeCard };
const edgeTypes: EdgeTypes = {
  animated: AiEdge.Animated,
  default: AiEdge.Default,
  temporary: AiEdge.Temporary,
};

function toFlowNodes(
  definitions: WorkflowNodeDefinition[],
  editable: boolean,
  onDelete?: (id: string) => void,
  onDuplicate?: (id: string) => void,
): WorkflowFlowNode[] {
  return definitions.map((definition) => ({
    id: definition.id,
    type: "workflow",
    position: definition.position,
    data: { definition, editable, onDelete, onDuplicate },
  }));
}

function toFlowEdges(links: WorkflowLinkDefinition[]): FlowEdge[] {
  return links.map((link) => ({
    id: link.id,
    source: link.source,
    target: link.target,
    label: link.label,
    type:
      link.kind === "active"
        ? "animated"
        : link.kind === "conditional"
          ? "temporary"
          : "default",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: link.kind === "active" ? "var(--foreground)" : "var(--border)",
      width: 14,
      height: 14,
    },
    labelStyle: {
      fill: "var(--muted-foreground)",
      fontSize: 9,
      fontWeight: 600,
    },
    labelBgStyle: {
      fill: "var(--background)",
      fillOpacity: 0.94,
    },
    labelBgPadding: [5, 3],
    labelBgBorderRadius: 5,
    style:
      link.kind === "active"
        ? { stroke: "var(--foreground)", strokeWidth: 1.5 }
        : undefined,
  }));
}

export interface WorkflowCanvasProps {
  definitions: WorkflowNodeDefinition[];
  editable?: boolean;
  links: WorkflowLinkDefinition[];
  onDeleteNode?: (id: string) => void;
  onDuplicateNode?: (id: string) => void;
  onSelectedNodeChange?: (node: WorkflowNodeDefinition | null) => void;
  selectedNodeId?: string | null;
  title: string;
}

export function WorkflowCanvas({
  definitions,
  editable = false,
  links,
  onDeleteNode,
  onDuplicateNode,
  onSelectedNodeChange,
  selectedNodeId,
  title,
}: WorkflowCanvasProps) {
  const { resolvedTheme } = useTheme();
  const backgroundDotColor =
    resolvedTheme === "dark"
      ? "color-mix(in oklab, var(--muted-foreground) 52%, transparent)"
      : "color-mix(in oklab, var(--muted-foreground) 32%, transparent)";
  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowFlowNode>(
    toFlowNodes(definitions, editable, onDeleteNode, onDuplicateNode),
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(toFlowEdges(links));

  React.useEffect(() => {
    setNodes((current) => {
      const positions = new Map(
        current.map((node) => [node.id, node.position]),
      );
      return toFlowNodes(
        definitions,
        editable,
        onDeleteNode,
        onDuplicateNode,
      ).map((node) => ({
        ...node,
        position: positions.get(node.id) ?? node.position,
        selected: node.id === selectedNodeId,
      }));
    });
    const nodeIds = new Set(definitions.map((node) => node.id));
    setEdges((current) => [
      ...toFlowEdges(links).filter(
        (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target),
      ),
      ...current.filter(
        (edge) =>
          edge.data?.userCreated &&
          nodeIds.has(edge.source) &&
          nodeIds.has(edge.target),
      ),
    ]);
  }, [
    definitions,
    editable,
    links,
    onDeleteNode,
    onDuplicateNode,
    selectedNodeId,
    setEdges,
    setNodes,
  ]);

  const onConnect = React.useCallback(
    (connection: FlowConnection) => {
      if (!editable) return;
      setEdges((current) => {
        const prefix = `${connection.source}-${connection.target}-`;
        let suffix = current.length;
        while (current.some((edge) => edge.id === `${prefix}${suffix}`))
          suffix++;
        return addEdge(
          {
            ...connection,
            data: { userCreated: true },
            id: `${prefix}${suffix}`,
            type: "default",
            markerEnd: { type: MarkerType.ArrowClosed },
          },
          current,
        );
      });
    },
    [editable, setEdges],
  );

  return (
    <Canvas<WorkflowFlowNode, FlowEdge>
      backgroundColor={backgroundDotColor}
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      connectionLineComponent={Connection}
      colorMode={resolvedTheme === "dark" ? "dark" : "light"}
      nodesDraggable={editable}
      nodesConnectable={editable}
      elementsSelectable
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={(_, node) =>
        onSelectedNodeChange?.(
          definitions.find((definition) => definition.id === node.id) ?? null,
        )
      }
      onPaneClick={() => onSelectedNodeChange?.(null)}
      proOptions={{ hideAttribution: true }}
      aria-label={title}
    >
      <Controls showInteractive={false} />
    </Canvas>
  );
}

interface WorkflowInspectorProps {
  mode: WorkflowCanvasMode;
  node: WorkflowNodeDefinition | null;
  onClose?: () => void;
}

export function WorkflowInspector({
  mode,
  node,
  onClose,
}: WorkflowInspectorProps) {
  if (!node) {
    return (
      <aside className="bg-background flex min-h-0 flex-col p-5">
        <div className="border-border/70 grid size-10 place-items-center rounded-xl border">
          <GitBranch className="text-muted-foreground size-4" />
        </div>
        <h2 className="mt-5 text-sm font-medium">Inspect a workflow step</h2>
        <p className="text-muted-foreground mt-1 max-w-60 text-xs leading-5">
          Select a node to review its activity, dependencies, files, and
          execution details.
        </p>
      </aside>
    );
  }

  const kind = kindMeta[node.kind];
  const KindIcon = kind.icon;

  return (
    <aside className="bg-background flex min-h-0 flex-col">
      <div className="flex min-h-14 items-center gap-3 border-b px-4 py-2.5">
        <span
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-lg ring-1",
            kind.surface,
          )}
        >
          <KindIcon className="size-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-[9px] tracking-wide uppercase">
            {node.category}
          </p>
          <h2 className="truncate text-xs font-medium">{node.title}</h2>
        </div>
        {onClose ? (
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-7"
            aria-label="Close inspector"
            onClick={onClose}
          >
            <XCircle aria-hidden="true" />
          </Button>
        ) : null}
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-5 p-4">
          <div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">
                Status
              </p>
              <WorkflowStatus status={node.status} />
            </div>
            <p className="mt-2 text-xs leading-5">{node.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 border-y py-4">
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-muted-foreground text-[10px]">Progress</p>
              <p className="mt-1 text-sm font-semibold tabular-nums">
                {node.progress ?? (node.status === "completed" ? 100 : 0)}%
              </p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-muted-foreground text-[10px]">Duration</p>
              <p className="mt-1 text-sm font-semibold tabular-nums">
                {node.duration ?? "—"}
              </p>
            </div>
          </div>

          {node.tool || node.file ? (
            <section>
              <p className="text-muted-foreground mb-2 text-[10px] font-medium tracking-wide uppercase">
                {mode === "live" ? "Observed activity" : "Execution context"}
              </p>
              <div className="overflow-hidden rounded-lg border">
                {node.tool ? (
                  <div className="flex min-w-0 items-center gap-2.5 border-b px-3 py-2.5 text-xs last:border-0">
                    <SquareTerminal className="text-muted-foreground size-3.5 shrink-0" />
                    <span className="text-muted-foreground">Tool</span>
                    <span className="ml-auto min-w-0 truncate font-mono text-[10px]">
                      {node.tool}
                    </span>
                  </div>
                ) : null}
                {node.file ? (
                  <div className="flex min-w-0 items-center gap-2.5 px-3 py-2.5 text-xs">
                    <FileCode2 className="text-muted-foreground size-3.5 shrink-0" />
                    <span className="text-muted-foreground">File</span>
                    <span className="ml-auto min-w-0 truncate font-mono text-[10px]">
                      {node.file}
                    </span>
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          {node.tasks?.length ? (
            <section>
              <p className="text-muted-foreground mb-2 text-[10px] font-medium tracking-wide uppercase">
                Tasks
              </p>
              <div className="space-y-1 rounded-lg border p-1.5">
                {node.tasks.map((task) => (
                  <div
                    key={task.label}
                    className={cn(
                      "flex min-w-0 items-center gap-2 rounded-md px-2 py-2 text-xs",
                      task.status === "running" && "bg-muted/60",
                    )}
                  >
                    <TaskDot status={task.status} />
                    <span className="min-w-0 flex-1 truncate">
                      {task.label}
                    </span>
                    <span className="text-muted-foreground text-[9px] capitalize">
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section>
            <p className="text-muted-foreground mb-2 text-[10px] font-medium tracking-wide uppercase">
              Ownership
            </p>
            <div className="flex items-center gap-2.5 rounded-lg border px-3 py-2.5">
              <span className="bg-muted grid size-7 place-items-center rounded-full">
                <UserRound className="text-muted-foreground size-3.5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium">
                  {node.agent ?? node.owner ?? "Workflow agent"}
                </p>
                <p className="text-muted-foreground text-[10px]">
                  Responsible for this step
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                className="ml-auto size-7"
                aria-label="More ownership actions"
              >
                <MoreHorizontal />
              </Button>
            </div>
          </section>
        </div>
      </ScrollArea>
    </aside>
  );
}

export function WorkflowLegend() {
  return (
    <div className="flex items-center gap-3 px-2 py-1 text-[10px]">
      {(["running", "completed", "waiting", "blocked"] as const).map(
        (status) => (
          <span
            key={status}
            className="text-muted-foreground flex items-center gap-1.5 capitalize"
          >
            <span
              className={cn("size-1.5 rounded-full", statusMeta[status].dot)}
            />
            {status}
          </span>
        ),
      )}
    </div>
  );
}
