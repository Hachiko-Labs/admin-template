"use client";

import "@xyflow/react/dist/style.css";

import {
  addEdge,
  Background,
  type Connection,
  Controls,
  type Edge,
  Handle,
  MarkerType,
  type Node,
  type NodeProps,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
  useStore,
} from "@xyflow/react";
import {
  CircleAlert,
  CircleCheck,
  CreditCard,
  ExternalLink,
  GitBranch,
  Info,
  KeyRound,
  LoaderCircle,
  type LucideIcon,
  Mail,
  PanelRight,
  Play,
  ReceiptText,
  Star,
  Workflow,
} from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

type StepKind = "trigger" | "logic" | "action";
type EditorTab = "editor" | "runs";
type DraftStatus = "unpublished" | "live";
type RunStatus = "succeeded" | "failed" | "running";

type WorkflowStep = {
  id: string;
  kind: StepKind;
  category: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  x: number;
  y: number;
  hasTarget: boolean;
  hasSource: boolean;
  config: { label: string; value: string }[];
};

type WorkflowNodeData = Record<string, unknown> & {
  step: WorkflowStep;
  isActive: boolean;
};

type WorkflowNodeType = Node<WorkflowNodeData, "workflowStep">;

type WorkflowRun = {
  id: string;
  event: string;
  customer: string;
  amount: string;
  branch: string;
  steps: string;
  duration: string;
  startedAt: string;
  status: RunStatus;
};

const nodeWidth = 264;

/**
 * Laid out on a fixed grid rather than an auto-layout pass: the shape of the
 * branch is the point of the screen, so it should not reflow when a consumer
 * renames a step.
 */
const workflowSteps: WorkflowStep[] = [
  {
    id: "trigger",
    kind: "trigger",
    category: "Payments",
    title: "Payment succeeded",
    subtitle: "A live charge cleared for a shadcnblocks order",
    icon: CreditCard,
    x: 420,
    y: 0,
    hasTarget: false,
    hasSource: true,
    config: [
      { label: "Event", value: "payment_intent.succeeded" },
      { label: "Mode", value: "Live payments only" },
      { label: "Source", value: "Checkout and invoice payments" },
      { label: "Debounce", value: "Skip duplicate intents for 60s" },
    ],
  },
  {
    id: "branch",
    kind: "logic",
    category: "Conditions",
    title: "If / else",
    subtitle: "If the order contains a team license",
    icon: GitBranch,
    x: 420,
    y: 162,
    hasTarget: true,
    hasSource: true,
    config: [
      { label: "Condition", value: "line_item.sku starts with team_" },
      { label: "Fallback", value: "Route to the single-seat branch" },
      { label: "Evaluated on", value: "Every matching payment" },
    ],
  },
  {
    id: "single-license",
    kind: "action",
    category: "Fulfillment",
    title: "Issue license key",
    subtitle: "Single seat, no expiry",
    icon: KeyRound,
    x: 120,
    y: 334,
    hasTarget: true,
    hasSource: true,
    config: [
      { label: "License type", value: "Single seat" },
      { label: "Seats", value: "1" },
      { label: "Expires", value: "Never" },
      { label: "On failure", value: "Retry 3x, then alert #billing" },
    ],
  },
  {
    id: "single-email",
    kind: "action",
    category: "Communication",
    title: "Send email",
    subtitle: "Template: Receipt and downloads",
    icon: Mail,
    x: 120,
    y: 496,
    hasTarget: true,
    hasSource: true,
    config: [
      { label: "Template", value: "Receipt and downloads" },
      { label: "To", value: "Billing contact on the payment" },
      { label: "Attachments", value: "PDF receipt" },
      { label: "Send window", value: "Immediately" },
    ],
  },
  {
    id: "team-license",
    kind: "action",
    category: "Fulfillment",
    title: "Issue license key",
    subtitle: "Team seat pool, 25 seats",
    icon: KeyRound,
    x: 720,
    y: 334,
    hasTarget: true,
    hasSource: true,
    config: [
      { label: "License type", value: "Team seat pool" },
      { label: "Seats", value: "25" },
      { label: "Expires", value: "12 months from purchase" },
      { label: "On failure", value: "Retry 3x, then alert #billing" },
    ],
  },
  {
    id: "team-email",
    kind: "action",
    category: "Communication",
    title: "Send email",
    subtitle: "Template: Team onboarding",
    icon: Mail,
    x: 720,
    y: 496,
    hasTarget: true,
    hasSource: true,
    config: [
      { label: "Template", value: "Team onboarding" },
      { label: "To", value: "Billing contact and named admin" },
      { label: "Attachments", value: "PDF receipt, seat invite link" },
      { label: "Send window", value: "Immediately" },
    ],
  },
  {
    id: "ledger",
    kind: "action",
    category: "Accounting",
    title: "Post to ledger",
    subtitle: "Recognize revenue for the period",
    icon: ReceiptText,
    x: 420,
    y: 668,
    hasTarget: true,
    hasSource: false,
    config: [
      { label: "Ledger", value: "Revenue · product sales" },
      { label: "Recognition", value: "On payment for one-time orders" },
      { label: "Tax", value: "Split out to the tax liability account" },
      { label: "On failure", value: "Queue for the nightly reconcile" },
    ],
  },
];

const workflowLinks: { from: string; to: string; label?: string }[] = [
  { from: "trigger", to: "branch" },
  { from: "branch", to: "single-license", label: "NO" },
  { from: "branch", to: "team-license", label: "YES" },
  { from: "single-license", to: "single-email" },
  { from: "team-license", to: "team-email" },
  { from: "single-email", to: "ledger" },
  { from: "team-email", to: "ledger" },
];

const stepTileClass: Record<StepKind, string> = {
  trigger:
    "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 ring-blue-600/15 dark:ring-blue-400/20",
  logic:
    "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 ring-amber-600/15 dark:ring-amber-400/20",
  action:
    "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 ring-rose-600/15 dark:ring-rose-400/20",
};

const workflowEdgeColor = "var(--muted-foreground)";

const runs: WorkflowRun[] = [
  {
    id: "run_9f2c41",
    event: "pi_3QRw8pKm",
    customer: "Northline Studio",
    amount: "$2,400.00",
    branch: "Team license",
    steps: "5/5",
    duration: "1.4s",
    startedAt: "2 min ago",
    status: "succeeded",
  },
  {
    id: "run_9f2b07",
    event: "pi_3QRw6tLd",
    customer: "Verdant Studio",
    amount: "$340.00",
    branch: "Single seat",
    steps: "5/5",
    duration: "0.9s",
    startedAt: "14 min ago",
    status: "succeeded",
  },
  {
    id: "run_9f2a55",
    event: "pi_3QRw4bNs",
    customer: "Halden Robotics",
    amount: "$6,800.00",
    branch: "Team license",
    steps: "3/5",
    duration: "18.2s",
    startedAt: "26 min ago",
    status: "running",
  },
  {
    id: "run_9f29e1",
    event: "pi_3QRw1jHc",
    customer: "Ember Digital",
    amount: "$1,250.00",
    branch: "Team license",
    steps: "4/5",
    duration: "3.1s",
    startedAt: "48 min ago",
    status: "failed",
  },
  {
    id: "run_9f2917",
    event: "pi_3QRvzXKp",
    customer: "Crest Advisory",
    amount: "$780.00",
    branch: "Single seat",
    steps: "5/5",
    duration: "1.1s",
    startedAt: "1 hr ago",
    status: "succeeded",
  },
  {
    id: "run_9f288d",
    event: "pi_3QRvwQBt",
    customer: "Kairos Ventures",
    amount: "$3,600.00",
    branch: "Team license",
    steps: "5/5",
    duration: "1.7s",
    startedAt: "2 hr ago",
    status: "succeeded",
  },
  {
    id: "run_9f27c2",
    event: "pi_3QRvtFyR",
    customer: "Orrery Design",
    amount: "$490.00",
    branch: "Single seat",
    steps: "5/5",
    duration: "0.8s",
    startedAt: "3 hr ago",
    status: "succeeded",
  },
  {
    id: "run_9f2704",
    event: "pi_3QRvqDaW",
    customer: "Axiom Financial",
    amount: "$5,200.00",
    branch: "Team license",
    steps: "2/5",
    duration: "4.6s",
    startedAt: "4 hr ago",
    status: "failed",
  },
];

const runStatusMeta: Record<
  RunStatus,
  { label: string; icon: LucideIcon; className: string }
> = {
  succeeded: {
    label: "Succeeded",
    icon: CircleCheck,
    className:
      "border-emerald-600/20 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
  failed: {
    label: "Failed",
    icon: CircleAlert,
    className:
      "border-destructive/20 bg-destructive/10 text-destructive dark:bg-destructive/15",
  },
  running: {
    label: "Running",
    icon: LoaderCircle,
    className:
      "border-blue-600/20 bg-blue-50 text-blue-700 dark:border-blue-400/20 dark:bg-blue-950/40 dark:text-blue-400",
  },
};

const checklistItems = [
  { id: "connect", label: "Connect a live payment method", done: true },
  { id: "skus", label: "Map license SKUs to products", done: true },
  { id: "receipt", label: "Verify the receipt email template", done: false },
  { id: "ledger", label: "Point the ledger at the right account", done: false },
];

const resources = [
  { id: "triggers", label: "Payment event reference" },
  { id: "branching", label: "Branching and conditions" },
  { id: "retries", label: "Retry and failure handling" },
];

/**
 * The canvas always fills the pane so the dotted background runs edge to edge.
 * The unpublished-changes banner floats on top of it, so instead of reserving
 * a strip of blank page the graph is fitted with extra padding underneath it.
 */
const fitPadding = (bannerVisible: boolean) =>
  ({
    bottom: bannerVisible ? "116px" : "8%",
    top: "8%",
    x: "8%",
  }) as const;

type FitPadding = ReturnType<typeof fitPadding>;

function WorkflowStepNode({ data }: NodeProps<WorkflowNodeType>) {
  const { isActive, step } = data;
  const Icon = step.icon;

  return (
    <div className="w-full">
      <div className="text-muted-foreground flex items-center justify-between gap-3 px-1 pb-2 text-[10px] font-semibold tracking-[0.14em] uppercase">
        <span className="truncate">{step.kind}</span>
        <span className="truncate">{step.category}</span>
      </div>

      <div
        className={cn(
          "bg-background relative rounded-xl border px-3 py-3 shadow-sm transition-colors",
          isActive
            ? "border-foreground/25 ring-foreground/15 ring-2"
            : "hover:border-foreground/20",
        )}
      >
        {step.hasTarget ? (
          <Handle
            className="!bg-background !border-muted-foreground/60 !size-2.5 !border"
            position={Position.Top}
            type="target"
          />
        ) : null}

        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={cn(
              "grid size-7 shrink-0 place-items-center rounded-md ring-1 ring-inset",
              stepTileClass[step.kind],
            )}
          >
            <Icon aria-hidden="true" className="size-4" />
          </span>
          <p className="truncate text-sm font-semibold">{step.title}</p>
        </div>

        {/* Fixed two-line box so every node keeps the same height on the grid. */}
        <p className="text-muted-foreground mt-2 line-clamp-2 min-h-8 text-xs leading-4">
          {step.subtitle}
        </p>

        {step.hasSource ? (
          <Handle
            className="!bg-background !border-muted-foreground/60 !size-2.5 !border"
            position={Position.Bottom}
            type="source"
          />
        ) : null}
      </div>
    </div>
  );
}

const nodeTypes = {
  workflowStep: WorkflowStepNode,
};

/**
 * Re-centers the graph whenever the canvas is resized — collapsing the details
 * pane, collapsing the app sidebar, publishing away the banner, or resizing the
 * window. Without this the graph stays wherever the first fit put it and ends
 * up hugging one edge. Only the viewport moves, so dragged nodes stay put.
 */
function FitViewOnResize({ padding }: { padding: FitPadding }) {
  const { fitView } = useReactFlow();
  const width = useStore((state) => state.width);
  const height = useStore((state) => state.height);
  const fitted = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!width || !height) return;

    const signature = `${width}x${height}:${JSON.stringify(padding)}`;

    // The `fitView` prop owns the first fit, and it waits for node dimensions.
    // Refitting on that same first measurement would fit against nodes that
    // have not been measured yet and zoom in wildly.
    if (!fitted.current) {
      fitted.current = signature;
      return;
    }

    if (fitted.current === signature) return;

    fitted.current = signature;
    void fitView({ duration: 200, padding });
  }, [fitView, height, padding, width]);

  return null;
}

function WorkflowCanvas({
  draftStatus,
  onDiscard,
  onPublish,
  onSelectStep,
  selectedStepId,
}: {
  draftStatus: DraftStatus;
  onDiscard: () => void;
  onPublish: () => void;
  onSelectStep: (stepId: string) => void;
  selectedStepId: string;
}) {
  const { resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = React.useState(false);
  const flowColorMode = resolvedTheme === "dark" ? "dark" : "light";
  const bannerVisible = draftStatus === "unpublished";
  const padding = React.useMemo(
    () => fitPadding(bannerVisible),
    [bannerVisible],
  );
  const backgroundDotColor =
    resolvedTheme === "dark"
      ? "color-mix(in oklab, var(--muted-foreground) 42%, transparent)"
      : "var(--border)";

  const initialNodes = React.useMemo<WorkflowNodeType[]>(
    () =>
      workflowSteps.map((step) => ({
        id: step.id,
        type: "workflowStep" as const,
        position: { x: step.x, y: step.y },
        data: { step, isActive: step.id === selectedStepId },
        style: { width: nodeWidth },
      })),
    // Seeded once; selection is applied through the effect below so that
    // dragging a node never resets its position.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const initialEdges = React.useMemo<Edge[]>(
    () =>
      workflowLinks.map((link) => ({
        id: `${link.from}-${link.to}`,
        source: link.from,
        target: link.to,
        type: "smoothstep",
        label: link.label,
        labelShowBg: Boolean(link.label),
        labelBgPadding: [8, 4] as [number, number],
        labelBgBorderRadius: 999,
        labelBgStyle: {
          fill: "var(--background)",
          stroke: workflowEdgeColor,
          strokeOpacity: 0.35,
        },
        labelStyle: {
          fill: "var(--muted-foreground)",
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.08em",
        },
        markerEnd: { type: MarkerType.ArrowClosed, color: workflowEdgeColor },
        style: { stroke: workflowEdgeColor, strokeWidth: 1.5 },
      })),
    [],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    setNodes((current) =>
      current.map((node) =>
        node.data.isActive === (node.id === selectedStepId)
          ? node
          : {
              ...node,
              data: { ...node.data, isActive: node.id === selectedStepId },
            },
      ),
    );
  }, [selectedStepId, setNodes]);

  const onConnect = React.useCallback(
    (connection: Connection) => {
      setEdges((currentEdges) =>
        addEdge(
          {
            ...connection,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: workflowEdgeColor,
            },
            style: { stroke: workflowEdgeColor, strokeWidth: 1.5 },
            type: "smoothstep",
          },
          currentEdges,
        ),
      );
    },
    [setEdges],
  );

  return (
    <div className="relative min-h-[26rem] flex-1 overflow-hidden">
      {bannerVisible ? (
        <div className="pointer-events-none absolute inset-x-4 bottom-4 z-10 flex justify-center lg:inset-x-6">
          <div className="bg-background pointer-events-auto flex w-full max-w-3xl flex-col gap-3 rounded-xl border px-4 py-3 shadow-lg sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                <Info aria-hidden="true" className="size-4" />
              </span>
              <p className="truncate text-sm font-medium">
                This workflow has unpublished changes
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                className="h-8 rounded-md text-xs"
                onClick={onDiscard}
                type="button"
                variant="outline"
              >
                Discard changes
              </Button>
              <Button
                className="h-8 rounded-md text-xs"
                onClick={onPublish}
                type="button"
              >
                Publish changes
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {isMounted ? (
        <ReactFlow
          className="!bg-background [&_.react-flow__controls]:!bg-background [&_.react-flow__controls-button]:!border-border [&_.react-flow__controls-button]:!bg-background [&_.react-flow__controls-button]:!text-foreground [&_.react-flow__attribution]:hidden [&_.react-flow__controls]:!flex [&_.react-flow__controls]:!flex-row [&_.react-flow__controls]:!overflow-hidden [&_.react-flow__controls]:!rounded-md [&_.react-flow__controls]:!border [&_.react-flow__controls]:!shadow-sm [&_.react-flow__controls-button]:!size-8 [&_.react-flow__panel]:!m-3 sm:[&_.react-flow__panel]:!m-5"
          colorMode={flowColorMode}
          connectionLineStyle={{ stroke: workflowEdgeColor, strokeWidth: 1.5 }}
          defaultEdgeOptions={{
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: workflowEdgeColor, strokeWidth: 1.5 },
            type: "smoothstep",
          }}
          edges={edges}
          fitView
          fitViewOptions={{ padding }}
          maxZoom={1.4}
          minZoom={0.3}
          nodes={nodes}
          nodeTypes={nodeTypes}
          onConnect={onConnect}
          onEdgesChange={onEdgesChange}
          onNodeClick={(_event, node) => onSelectStep(node.id)}
          onNodesChange={onNodesChange}
          panOnDrag
          proOptions={{ hideAttribution: true }}
        >
          <Background color={backgroundDotColor} gap={16} size={1} />
          {/* Top-left: on narrow screens the banner spans the canvas bottom. */}
          <Controls position="top-left" showInteractive={false} />
          <FitViewOnResize padding={padding} />
        </ReactFlow>
      ) : (
        <div className="grid size-full place-items-center">
          <p className="text-muted-foreground text-xs">Loading editor...</p>
        </div>
      )}
    </div>
  );
}

function RunsPanel() {
  return (
    <div className="vertical-scrollbar min-h-0 flex-1 overflow-auto">
      <table className="w-full min-w-[46rem] border-collapse text-sm">
        <thead>
          <tr className="text-muted-foreground border-b text-left text-xs">
            <th className="px-4 py-3 font-medium">Run</th>
            <th className="px-4 py-3 font-medium">Payment</th>
            <th className="px-4 py-3 font-medium">Customer</th>
            <th className="px-4 py-3 text-right font-medium">Amount</th>
            <th className="px-4 py-3 font-medium">Branch</th>
            <th className="px-4 py-3 font-medium">Steps</th>
            <th className="px-4 py-3 text-right font-medium">Duration</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => {
            const status = runStatusMeta[run.status];
            const StatusIcon = status.icon;

            return (
              <tr className="hover:bg-muted/40 border-b" key={run.id}>
                <td className="px-4 py-3">
                  <p className="font-mono text-xs font-medium">{run.id}</p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {run.startedAt}
                  </p>
                </td>
                <td className="text-muted-foreground px-4 py-3 font-mono text-xs">
                  {run.event}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{run.customer}</td>
                <td className="px-4 py-3 text-right font-medium whitespace-nowrap tabular-nums">
                  {run.amount}
                </td>
                <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">
                  {run.branch}
                </td>
                <td className="px-4 py-3 tabular-nums">{run.steps}</td>
                <td className="text-muted-foreground px-4 py-3 text-right tabular-nums">
                  {run.duration}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    className={cn(
                      "h-6 gap-1 rounded-full px-2 text-[11px] font-medium shadow-none",
                      status.className,
                    )}
                    variant="outline"
                  >
                    <StatusIcon
                      aria-hidden="true"
                      className={cn(
                        "size-3",
                        run.status === "running" && "animate-spin",
                      )}
                    />
                    {status.label}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DetailsPanel({
  checked,
  setChecked,
  step,
}: {
  checked: string[];
  setChecked: React.Dispatch<React.SetStateAction<string[]>>;
  step: WorkflowStep;
}) {
  const StepIcon = step.icon;
  const completed = checked.length;

  return (
    <aside className="vertical-scrollbar min-h-0 overflow-y-auto border-t lg:border-t-0 lg:border-l">
      <div className="border-b px-5 py-5">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-md bg-blue-50 text-blue-600 ring-1 ring-blue-600/15 ring-inset dark:bg-blue-950/50 dark:text-blue-400 dark:ring-blue-400/20">
            <Workflow aria-hidden="true" className="size-4" />
          </span>
          <p className="truncate text-sm font-semibold">
            Paid order fulfillment
          </p>
        </div>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          When a payment clears, issue the license the customer actually bought,
          send the matching receipt, and post the revenue to the ledger.
        </p>
      </div>

      <div className="border-b px-5 py-5">
        <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
          Selected step
        </p>

        <div className="mt-3 flex items-center gap-2.5">
          <span
            className={cn(
              "grid size-8 shrink-0 place-items-center rounded-md ring-1 ring-inset",
              stepTileClass[step.kind],
            )}
          >
            <StepIcon aria-hidden="true" className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{step.title}</p>
            <p className="text-muted-foreground truncate text-xs">
              {step.kind} · {step.category}
            </p>
          </div>
        </div>

        <dl className="mt-4 space-y-2.5">
          {step.config.map((row) => (
            <div
              className="flex items-start justify-between gap-4"
              key={row.label}
            >
              <dt className="text-muted-foreground shrink-0 text-xs">
                {row.label}
              </dt>
              <dd className="min-w-0 text-right text-xs font-medium break-words">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="border-b px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold">Checklist</p>
          <span className="text-muted-foreground text-xs tabular-nums">
            {completed}/{checklistItems.length}
          </span>
        </div>
        <p className="text-muted-foreground mt-1 text-xs">
          Finish these before publishing to live payments.
        </p>

        <ul className="mt-3 space-y-2.5">
          {checklistItems.map((item) => {
            const isChecked = checked.includes(item.id);

            return (
              <li className="flex items-start gap-2.5" key={item.id}>
                <Checkbox
                  checked={isChecked}
                  className="mt-0.5"
                  id={`checklist-${item.id}`}
                  onCheckedChange={() =>
                    setChecked((current) =>
                      isChecked
                        ? current.filter((id) => id !== item.id)
                        : [...current, item.id],
                    )
                  }
                />
                <label
                  className={cn(
                    "cursor-pointer text-sm leading-snug",
                    isChecked && "text-muted-foreground line-through",
                  )}
                  htmlFor={`checklist-${item.id}`}
                >
                  {item.label}
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="px-5 py-5">
        <p className="text-sm font-semibold">Helpful resources</p>
        <ul className="mt-3 space-y-1">
          {resources.map((resource) => (
            <li key={resource.id}>
              <a
                className="text-muted-foreground hover:text-foreground flex items-center justify-between gap-3 rounded-md py-1.5 text-sm transition-colors"
                href="#"
                onClick={(event) => event.preventDefault()}
              >
                <span className="truncate">{resource.label}</span>
                <ExternalLink
                  aria-hidden="true"
                  className="size-3.5 shrink-0"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

export function PaymentProcessorPaymentWorkflow() {
  const [activeTab, setActiveTab] = React.useState<EditorTab>("editor");
  const [draftStatus, setDraftStatus] =
    React.useState<DraftStatus>("unpublished");
  const [selectedStepId, setSelectedStepId] = React.useState("trigger");
  const [isStarred, setIsStarred] = React.useState(false);
  const [detailOpen, setDetailOpen] = React.useState(true);
  // Held here rather than in DetailsPanel so ticking an item survives a trip
  // to the Runs tab, which unmounts the panel.
  const [checked, setChecked] = React.useState<string[]>(
    checklistItems.filter((item) => item.done).map((item) => item.id),
  );

  const showDetails = detailOpen && activeTab === "editor";

  const selectedStep =
    workflowSteps.find((step) => step.id === selectedStepId) ??
    workflowSteps[0];

  const tabs: { value: EditorTab; label: string; icon: LucideIcon }[] = [
    { value: "editor", label: "Editor", icon: Workflow },
    { value: "runs", label: "Runs", icon: Play },
  ];

  return (
    <main className="bg-background text-foreground flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b px-4 py-3 lg:px-6">
        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 items-center gap-2 text-xs font-semibold tracking-[0.12em] uppercase"
        >
          <GitBranch
            aria-hidden="true"
            className="text-muted-foreground size-3.5 shrink-0"
          />
          <span className="text-muted-foreground hidden shrink-0 sm:inline">
            Workflows
          </span>
          <span className="text-muted-foreground hidden shrink-0 sm:inline">
            /
          </span>
          <span className="truncate">Paid order fulfillment</span>
        </nav>

        <Button
          aria-label={isStarred ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={isStarred}
          className="size-8 shrink-0 rounded-md"
          onClick={() => setIsStarred((current) => !current)}
          size="icon"
          type="button"
          variant="ghost"
        >
          <Star
            aria-hidden="true"
            className={cn(
              "size-4",
              isStarred ? "fill-amber-400 text-amber-500" : "",
            )}
          />
        </Button>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Badge
            className={cn(
              "h-6 rounded-full px-2.5 text-[11px] font-medium shadow-none",
              draftStatus === "unpublished"
                ? "border-amber-600/20 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-950/40 dark:text-amber-400"
                : "border-emerald-600/20 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-950/40 dark:text-emerald-400",
            )}
            variant="outline"
          >
            {draftStatus === "unpublished" ? "Draft changes" : "Live"}
          </Badge>
          {/* The panel carries editor context, so the toggle only shows there. */}
          {activeTab === "editor" ? (
            <Button
              aria-label={detailOpen ? "Hide details" : "Show details"}
              aria-pressed={detailOpen}
              className="hidden size-8 rounded-md lg:inline-flex"
              onClick={() => setDetailOpen((current) => !current)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <PanelRight aria-hidden="true" className="size-4" />
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-6 border-b px-4 lg:px-6">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.value;

          return (
            <button
              aria-pressed={isActive}
              className={cn(
                // No horizontal padding, so the tab icon sits flush with the
                // breadcrumb icon on the row above.
                "flex h-11 shrink-0 items-center gap-2 border-b-2 text-sm font-medium transition-colors",
                isActive
                  ? "border-b-foreground text-foreground"
                  : "text-muted-foreground hover:text-foreground border-b-transparent",
              )}
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              type="button"
            >
              <TabIcon aria-hidden="true" className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        className={cn(
          "vertical-scrollbar grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:overflow-hidden",
          showDetails &&
            "lg:grid-cols-[minmax(0,1fr)_minmax(20rem,22rem)] xl:grid-cols-[minmax(0,1fr)_minmax(22rem,24rem)]",
        )}
      >
        <div className="flex min-h-0 flex-col">
          {activeTab === "editor" ? (
            <WorkflowCanvas
              draftStatus={draftStatus}
              onDiscard={() => setDraftStatus("live")}
              onPublish={() => setDraftStatus("live")}
              onSelectStep={setSelectedStepId}
              selectedStepId={selectedStepId}
            />
          ) : (
            <RunsPanel />
          )}
        </div>

        {showDetails ? (
          <DetailsPanel
            checked={checked}
            setChecked={setChecked}
            step={selectedStep}
          />
        ) : null}
      </div>
    </main>
  );
}
