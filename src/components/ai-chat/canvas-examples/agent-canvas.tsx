"use client";

import {
  type Connection,
  Handle,
  type Node,
  type NodeProps,
  NodeResizer,
  Position,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import {
  ArrowDownToLine,
  ArrowUpRight,
  CircleAlert,
  FileText,
  GripVertical,
  History,
  Maximize,
  MoreHorizontal,
  MoveRight,
  PencilRuler,
  Play,
  Plus,
  Redo2,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Square,
  Trash2,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import * as React from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { z } from "zod";

import { Canvas } from "@/components/ai-elements/canvas";
import { ThemeSwitch } from "@/components/theme-switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { demoAgentRequests } from "@/lib/ai-canvas/agent-demo";
import {
  type AgentPlan,
  agentPlanSchema,
  agentProviders,
  type AgentScenarioId,
  agentScenarios,
  type AgentTask,
  type AgentTaskRun,
  agentTaskSchema,
  type AgentTeamRun,
  type DemoStatus,
  validateAgentPlan,
} from "@/lib/ai-canvas/agents";
import { cn } from "@/lib/utils";

import { AiWorkspaceShell } from "../ai-workspace-shell";
import {
  AgentActivityView as Activity,
  AgentPrompt,
  AgentTerminalHeader,
  AgentWorking,
} from "./agent-terminal";
import { downloadFile, IconButton } from "./shared";
import { useLocalDocument } from "./use-local-document";

const documentSchema = agentPlanSchema.extend({
  brief: z.string().max(12000),
  tasks: z
    .array(
      agentTaskSchema.extend({
        title: z.string().max(100),
        instruction: z.string().max(6000),
      }),
    )
    .min(1)
    .max(9),
  runId: z.string().uuid().nullable(),
});
const scenarioDocumentSchemas = {
  codex: documentSchema,
  mixed: documentSchema,
};
const initialDocuments = {
  codex: { ...agentScenarios.codex.plan, runId: null },
  mixed: { ...agentScenarios.mixed.plan, runId: null },
};
const roleIcons = {
  Research: Search,
  Design: PencilRuler,
  Review: ShieldCheck,
};
const statusLabels = {
  queued: "Waiting",
  running: "Working",
  completed: "Complete",
  failed: "Failed",
  cancelled: "Stopped",
  blocked: "Blocked",
  stale: "Inputs changed",
};
const signature = (plan: AgentPlan) =>
  JSON.stringify({
    brief: plan.brief,
    tasks: plan.tasks.map(
      ({ position: _position, width: _width, height: _height, ...task }) =>
        task,
    ),
  });

type CardData = {
  scenario: AgentScenarioId;
  task: AgentTask;
  result?: AgentTaskRun;
  stale: boolean;
  parentNames: string[];
  inspect: (id: string) => void;
  stop: (id: string) => void;
  stopping: boolean;
  send: (id: string, prompt: string) => Promise<boolean>;
  canSend: boolean;
  sendHint: string;
  directory: string;
  version: string;
  checkpoint: () => void;
  locked: boolean;
};
type TaskNode = Node<CardData, "agentTask">;
function TaskCard({ data, selected }: NodeProps<TaskNode>) {
  const { task, result } = data;
  const Icon = roleIcons[task.role];
  const active = result?.status === "running";
  const [prompt, setPrompt] = React.useState("");
  const scroll = React.useRef<HTMLDivElement>(null);
  const follow = React.useRef(true);
  React.useEffect(() => {
    if (follow.current && scroll.current)
      scroll.current.scrollTop = scroll.current.scrollHeight;
  }, [result?.items]);
  async function send() {
    if (!prompt.trim() || !data.canSend) return;
    if (await data.send(task.id, prompt.trim())) {
      setPrompt("");
      follow.current = true;
    }
  }
  return (
    <article
      className={cn(
        "brainless-terminal flex h-full w-full flex-col overflow-visible rounded-xl border border-[#363636] bg-[#1a1a1a] text-[#ededed] shadow-xl shadow-black/10",
        selected && "ring-ring ring-2",
        active && "border-[#6b6b6b]",
      )}
      aria-label={`${task.role}: ${task.title}`}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Escape" && active) {
          event.preventDefault();
          event.stopPropagation();
          data.stop(task.id);
        }
      }}
    >
      <NodeResizer
        isVisible={selected && !data.locked}
        minWidth={400}
        minHeight={400}
        maxWidth={1600}
        maxHeight={1600}
        onResizeStart={data.checkpoint}
      />
      <Handle
        type="target"
        position={
          task.id === "design" || task.id === "research"
            ? Position.Right
            : Position.Left
        }
        style={task.id === "design" ? { top: "24%" } : undefined}
        aria-label={`Input to ${task.title}`}
        title="Drop another terminal’s OUT here to connect"
        aria-describedby="agent-canvas-help"
        className="!flex !h-7 !w-10 !items-center !justify-center !rounded-md !border-2 !border-[#6b6b6b] !bg-[#242424] !font-mono !text-[10px] !font-semibold !text-[#ededed] hover:!border-[#5cc2e0] hover:!bg-[#363636]"
      >
        <span className="pointer-events-none">IN</span>
      </Handle>
      <div
        title={
          data.locked
            ? "Stop playback to rearrange terminals"
            : "Drag this title bar to move the terminal"
        }
        aria-describedby="agent-canvas-help"
        className={cn(
          "agent-drag flex h-10 shrink-0 items-center gap-2 rounded-t-xl border-b border-[#2b2b2b] bg-[#161616] px-3",
          data.locked ? "cursor-default" : "cursor-grab active:cursor-grabbing",
        )}
      >
        <span
          aria-hidden
          className="flex shrink-0 items-center gap-1 font-mono text-[10px] text-[#b3b3b3]"
        >
          <GripVertical className="size-3.5" />
          {data.locked ? "" : "Drag"}
        </span>
        <div aria-hidden className="flex gap-1.5 pr-1">
          <span className="size-2 rounded-full bg-[#ff5f57]" />
          <span className="size-2 rounded-full bg-[#febc2e]" />
          <span className="size-2 rounded-full bg-[#28c840]" />
        </div>
        <Icon className="size-3 shrink-0 text-[#969696]" />
        <span className="min-w-0 truncate font-mono text-[11px]">
          {data.scenario === "codex"
            ? task.id === "design"
              ? "main"
              : `sub-agent · ${task.role.toLowerCase()}`
            : `${agentProviders[task.provider]} · ${task.role.toLowerCase()}`}
          {" — "}
          {task.title}
        </span>
        <button
          className="nodrag ml-auto shrink-0 rounded p-1 text-[#9b9b9b] hover:bg-white/10 hover:text-white"
          aria-label={`Open ${task.title}`}
          onClick={() => data.inspect(task.id)}
        >
          <ArrowUpRight className="size-3.5" />
        </button>
      </div>
      <div className="nodrag nopan shrink-0 px-4 pt-3">
        <AgentTerminalHeader
          provider={task.provider}
          version={data.version}
          directory={data.directory}
        />
      </div>
      <div
        ref={scroll}
        onScroll={() => {
          if (scroll.current)
            follow.current =
              scroll.current.scrollHeight -
                scroll.current.scrollTop -
                scroll.current.clientHeight <
              50;
        }}
        className="nodrag nopan nowheel min-h-0 flex-1 overflow-auto px-4 py-3 [scrollbar-color:#444_transparent]"
        tabIndex={0}
        aria-label={`${task.title} activity`}
      >
        <div className="space-y-3">
          {!result?.items.some((item) => item.kind === "prompt") && (
            <Activity
              provider={task.provider}
              item={{ id: "prompt", kind: "prompt", text: task.instruction }}
            />
          )}
          {result?.items.map((item) => (
            <Activity key={item.id} item={item} provider={task.provider} />
          ))}
          {(!result || result.status === "queued") && (
            <p className="font-mono text-[12px] leading-relaxed text-[#7a7a7a]">
              {data.parentNames.length
                ? `Waiting for inputs: ${data.parentNames.join(" + ")}`
                : "Ready. Replay the team to watch this assignment."}
            </p>
          )}
          {result?.error && (
            <p className="font-mono text-xs break-words text-[#f7768e]">
              {result.error}
            </p>
          )}
          {result?.status === "stale" && (
            <p className="font-mono text-xs text-[#e0af68]">
              An upstream deliverable changed. Send a follow-up to review the
              latest inputs.
            </p>
          )}
        </div>
      </div>
      <div className="nodrag nopan shrink-0 px-4 pb-3">
        <div className="mb-2 flex min-h-5 items-center justify-between gap-2 font-mono text-[11px]">
          {active ? (
            <AgentWorking
              provider={task.provider}
              key={result?.startedAt}
              startedAt={result?.startedAt}
            />
          ) : (
            <span className="text-[#7a7a7a]">
              {result ? statusLabels[result.status] : "Ready"}
              {data.stale
                ? " · assignment edited"
                : result?.threadId
                  ? ` · ${result.threadId.slice(0, 8)}`
                  : " · ready"}
            </span>
          )}
          {active ? (
            <button
              onClick={() => data.stop(task.id)}
              disabled={data.stopping}
              className="text-[#9b9b9b] hover:text-white"
              aria-label={`Stop ${task.title}`}
            >
              ■ stop
            </button>
          ) : result?.output ? (
            <button
              onClick={() => data.inspect(task.id)}
              className="shrink-0 text-[#5cc2e0] hover:underline"
            >
              Open output ↗
            </button>
          ) : null}
        </div>
        <AgentPrompt
          provider={task.provider}
          ariaLabel={`Message ${task.title}`}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          disabled={!data.canSend}
          placeholder={
            data.canSend ? "Send a follow-up · Enter to submit" : data.sendHint
          }
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.nativeEvent.isComposing) {
              event.preventDefault();
              void send();
            }
          }}
          directory={data.directory}
          model="gpt-5.6-sol high"
        />
      </div>
      <Handle
        type="source"
        position={task.id === "research" ? Position.Left : Position.Right}
        style={task.id === "design" ? { top: "76%" } : undefined}
        aria-label={`Output from ${task.title}`}
        title="Drag OUT to another terminal’s IN to connect"
        aria-describedby="agent-canvas-help"
        className="!flex !h-7 !w-10 !items-center !justify-center !rounded-md !border-2 !border-[#5cc2e0] !bg-[#1b343b] !font-mono !text-[10px] !font-semibold !text-[#b4efff] hover:!bg-[#285362]"
      >
        <span className="pointer-events-none">OUT</span>
      </Handle>
    </article>
  );
}
const nodeTypes = { agentTask: TaskCard };

function AgentCanvasInner({ scenario }: { scenario: AgentScenarioId }) {
  const api = demoAgentRequests[scenario];
  const { doc, store, ready, saved, canUndo, canRedo } = useLocalDocument(
    `shadcnblocks-agent-canvas-demo-${agentScenarios[scenario].storageVersion}`,
    initialDocuments[scenario],
    scenarioDocumentSchemas[scenario],
  );
  const [pastRuns, setPastRuns] = React.useState<AgentTeamRun[]>([]);
  const [runtime, setRuntime] = React.useState<DemoStatus | null>(null);
  const [run, setRun] = React.useState<AgentTeamRun | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);
  const [inspecting, setInspecting] = React.useState<string | null>(null);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [reconnect, setReloadPlayback] = React.useState(0);
  const flow = useReactFlow<TaskNode>();
  const locked = run?.status === "running" || pending;
  const selected = doc.tasks.find((task) => task.id === inspecting);
  const result = run?.tasks.find((task) => task.taskId === inspecting);
  const stale = Boolean(run && signature(doc) !== signature(run.plan));

  React.useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    api()
      .then((status) => {
        if (cancelled) return;
        setRuntime(status);
        setError(null);
        const discoverId =
          status.activeRunId || (!doc.runId ? status.latestRunId : undefined);
        if (discoverId && discoverId !== doc.runId) {
          api(undefined, discoverId)
            .then((active) => {
              if (cancelled) return;
              setRun(active);
              store.replace({ ...active.plan, runId: active.id });
            })
            .catch((e) => {
              if (!cancelled) setError(e.message);
            });
        }
      })
      .catch((e) => {
        if (!cancelled)
          setRuntime({ enabled: false, available: false, message: e.message });
      });
    return () => {
      cancelled = true;
    };
    // Scenario restoration and playback updates have separate lifecycles.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, reconnect, store]);

  React.useEffect(() => {
    if (!ready || !doc.runId) return;
    const runId = doc.runId;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const next = await api(undefined, runId);
        if (cancelled) return;
        setRun(next);
        setError(null);
        if (next.status === "running") timer = setTimeout(poll, 800);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Playback could not load.");
      }
    };
    void poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [doc.runId, ready, reconnect, api]);

  function updateTask(id: string, patch: Partial<AgentTask>, record = true) {
    store.change(
      (current) => ({
        ...current,
        tasks: current.tasks.map((task) =>
          task.id === id ? { ...task, ...patch } : task,
        ),
      }),
      record,
    );
  }
  function dependencies(id: string, values: string[]) {
    const next = {
      ...doc,
      tasks: doc.tasks.map((task) =>
        task.id === id ? { ...task, dependsOn: values } : task,
      ),
    };
    const errors = validateAgentPlan(next);
    if (errors.length) {
      toast.error(errors[0]);
      return;
    }
    store.replace(next);
  }
  function connect(connection: Connection) {
    if (locked) return;
    const target = doc.tasks.find((task) => task.id === connection.target);
    if (target && !target.dependsOn.includes(connection.source))
      dependencies(target.id, [...target.dependsOn, connection.source]);
  }
  async function start() {
    const parsed = agentPlanSchema.safeParse(doc);
    if (!parsed.success) {
      toast.error(
        "Fill in the shared brief and every task’s title and assignment.",
      );
      return;
    }
    const errors = validateAgentPlan(parsed.data);
    if (errors.length) {
      toast.error(errors[0]);
      return;
    }
    setPending(true);
    setError(null);
    try {
      const next = await api({
        action: "start",
        plan: parsed.data,
      });
      setRun(next);
      store.change((current) => ({ ...current, runId: next.id }), false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start agents.");
    } finally {
      setPending(false);
    }
  }
  async function stop(taskId?: string) {
    if (!run) return;
    setPending(true);
    try {
      setRun(await api({ action: "stop", id: run.id, taskId }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not stop agents.");
    } finally {
      setPending(false);
    }
  }
  async function send(taskId: string, prompt: string) {
    if (!run || locked) return false;
    setPending(true);
    setError(null);
    try {
      setRun(
        await api({
          action: "continue",
          id: run.id,
          taskId,
          prompt,
        }),
      );
      setReloadPlayback((n) => n + 1);
      return true;
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not continue this session.",
      );
      return false;
    } finally {
      setPending(false);
    }
  }
  function addTask() {
    if (doc.tasks.length >= 9) {
      toast.error("Use up to 9 tasks in one team.");
      return;
    }
    const id =
      globalThis.crypto?.randomUUID?.() ??
      `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    store.change((current) => ({
      ...current,
      tasks: [
        ...current.tasks,
        {
          id,
          title: "New task",
          role: "Research",
          provider: "codex",
          instruction: "Describe the work this agent should do.",
          dependsOn: [],
          position: { x: 1100, y: (current.tasks.length - 3) * 480 },
        },
      ],
    }));
    setInspecting(id);
  }
  async function resetExample() {
    setPending(true);
    try {
      const next = await api({ action: "reset" });
      setRun(next);
      store.replace({ ...next.plan, runId: next.id });
      setReloadPlayback((n) => n + 1);
      toast.success("This example has been reset");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not reset this example",
      );
    } finally {
      setPending(false);
    }
  }
  async function openHistory() {
    try {
      setPastRuns(await api({ action: "history" }));
      setInspecting("history");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not load history",
      );
    }
  }

  function exportRun() {
    if (!run) return;
    downloadFile(
      `agent-team-${run.id.slice(0, 8)}.md`,
      `# Agent team\n\n${run.plan.brief}\n\n${run.plan.tasks
        .map((task) => {
          const output = run.tasks.find((item) => item.taskId === task.id)!;
          return `## ${task.title} · ${agentProviders[task.provider]} · ${task.role}\n\nStatus: ${output.status}\nSession: ${output.threadId || "Not started"}\n\n${output.output || output.error || "No deliverable yet."}`;
        })
        .join("\n\n---\n\n")}`,
      "text/markdown",
    );
  }

  const nodes: TaskNode[] = doc.tasks.map((task) => ({
    id: task.id,
    type: "agentTask",
    position: task.position,
    selected: task.id === selectedId,
    dragHandle: ".agent-drag",
    style: { width: task.width || 500, height: task.height || 480 },
    data: {
      scenario,
      task,
      result: run?.tasks.find((item) => item.taskId === task.id),
      stale,
      parentNames: task.dependsOn.map(
        (id) => doc.tasks.find((item) => item.id === id)?.title || id,
      ),
      inspect: setInspecting,
      stop: (id) => void stop(id),
      stopping: pending,
      send,
      canSend: Boolean(
        run &&
        !locked &&
        !stale &&
        task.dependsOn.every(
          (id) =>
            run.tasks.find((item) => item.taskId === id)?.status ===
            "completed",
        ),
      ),
      sendHint: locked
        ? "Team working · stop or wait to send"
        : stale
          ? "Replay team to apply assignment edits"
          : !run
            ? "Replay team to start this session"
            : "Waiting for upstream deliverables",
      directory: "shadcnblocks-admin",
      version: runtime?.version || "local",
      checkpoint: store.checkpoint,
      locked,
    },
  }));
  const edges = doc.tasks.flatMap((task) =>
    task.dependsOn.map((id) => ({
      id: `${id}:${task.id}`,
      source: id,
      target: task.id,
      type: "smoothstep",
      pathOptions: { offset: 18, borderRadius: 12 },
      animated:
        run?.tasks.find((item) => item.taskId === task.id)?.status ===
        "running",
      style: { stroke: "var(--muted-foreground)", strokeWidth: 1.5 },
    })),
  );

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col">
      <AiWorkspaceShell
        hideNavigationSidebar
        headerTitle={agentScenarios[scenario].label}
        header={
          <header className="shrink-0 shadow-[inset_0_-1px_0_var(--border)]">
            <div className="flex min-h-[var(--ai-workspace-header-height,3.5rem)] flex-wrap items-center gap-x-3 gap-y-1 px-3 py-1.5">
              <SidebarTrigger className="shrink-0 md:hidden" />
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-sm font-semibold">
                  {agentScenarios[scenario].label}
                </h1>
                <p className="text-muted-foreground truncate text-[11px]">
                  {scenario === "codex" ? "Team onboarding" : "Usage & billing"}{" "}
                  · {doc.tasks.length} terminals
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setInspecting("brief")}
              >
                <FileText data-icon="inline-start" />
                Shared brief
              </Button>
              <div className="flex items-center gap-0.5">
                <IconButton
                  label="Save layout"
                  icon={Save}
                  onClick={() => {
                    store.flush();
                    toast.success("Layout saved on this device");
                  }}
                  disabled={!ready}
                />
                <IconButton
                  label="Undo edit"
                  icon={Undo2}
                  onClick={() => store.undo()}
                  disabled={locked || !canUndo}
                />
                <IconButton
                  label="Redo edit"
                  icon={Redo2}
                  onClick={() => store.redo()}
                  disabled={locked || !canRedo}
                />
                <IconButton
                  label="Run history"
                  icon={History}
                  onClick={() => void openHistory()}
                  disabled={!ready}
                />
                <IconButton
                  label="Export outputs"
                  icon={ArrowDownToLine}
                  onClick={exportRun}
                  disabled={!run}
                />
                <IconButton
                  label="Reset example"
                  icon={RefreshCw}
                  onClick={() => void resetExample()}
                  disabled={locked || !ready}
                />
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addTask}
                  disabled={locked || !ready}
                  className="shrink-0"
                >
                  <Plus data-icon="inline-start" />
                  Add task
                </Button>
                {run?.status === "running" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void stop()}
                    disabled={pending}
                  >
                    <Square data-icon="inline-start" />
                    Stop team
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => void start()}
                    disabled={!ready || !runtime?.available || pending}
                  >
                    <Play data-icon="inline-start" />
                    {pending ? "Starting…" : "Replay team"}
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Canvas actions"
                    >
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                      <DropdownMenuItem onSelect={() => setInspecting("brief")}>
                        <FileText />
                        Shared brief & scenario
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={addTask}
                        disabled={locked || !ready}
                      >
                        <Plus />
                        Add task
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => store.undo()}
                        disabled={locked || !canUndo}
                      >
                        <Undo2 />
                        Undo edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={exportRun} disabled={!run}>
                        <ArrowDownToLine />
                        Export team outputs
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() => setReloadPlayback((n) => n + 1)}
                      >
                        <RefreshCw />
                        Reload playback
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <ThemeSwitch triggerClassName="size-8 shrink-0 scale-100 rounded-lg" />
            </div>
          </header>
        }
      >
        <div className="m-0 flex min-h-0 flex-1 flex-col">
          <div className="relative flex min-h-0 flex-1 flex-col">
            <Canvas<TaskNode>
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onConnect={connect}
              nodesConnectable={!locked}
              nodesDraggable={!locked}
              deleteKeyCode={null}
              fitViewOptions={{ padding: 0.1, minZoom: 0.28, maxZoom: 1 }}
              minZoom={0.25}
              onNodeClick={(_, node) => setSelectedId(node.id)}
              onNodeDoubleClick={(_, node) => setInspecting(node.id)}
              onPaneClick={() => setSelectedId(null)}
              onNodeDragStart={() => store.checkpoint()}
              onNodesChange={(changes) => {
                if (locked) return;
                const positions = changes.filter(
                  (change) => change.type === "position" && change.position,
                );
                const sizes = changes.filter(
                  (change) =>
                    change.type === "dimensions" &&
                    change.resizing !== undefined,
                );
                if (positions.length || sizes.length)
                  store.change(
                    (current) => ({
                      ...current,
                      tasks: current.tasks.map((task) => {
                        const move = positions.find(
                          (change) =>
                            change.type === "position" && change.id === task.id,
                        );
                        const moved =
                          move?.type === "position" && move.position
                            ? { ...task, position: move.position }
                            : task;
                        const size = sizes.find(
                          (change) =>
                            change.type === "dimensions" &&
                            change.id === task.id,
                        );
                        return size?.type === "dimensions" && size.dimensions
                          ? {
                              ...moved,
                              width: Math.min(
                                1600,
                                Math.max(400, size.dimensions.width),
                              ),
                              height: Math.min(
                                1600,
                                Math.max(400, size.dimensions.height),
                              ),
                            }
                          : moved;
                      }),
                    }),
                    false,
                  );
              }}
              onEdgesChange={(changes) => {
                if (locked) return;
                const removed = new Set(
                  changes
                    .filter((change) => change.type === "remove")
                    .map((change) => change.id),
                );
                if (removed.size)
                  store.change((current) => ({
                    ...current,
                    tasks: current.tasks.map((task) => ({
                      ...task,
                      dependsOn: task.dependsOn.filter(
                        (id) => !removed.has(`${id}:${task.id}`),
                      ),
                    })),
                  }));
              }}
            />
            <div className="absolute top-3 left-3 w-52 sm:hidden">
              <Select
                value={selectedId || ""}
                onValueChange={(id) => {
                  setSelectedId(id);
                  setInspecting(id);
                }}
              >
                <SelectTrigger
                  className="bg-background"
                  aria-label="Open a task"
                >
                  <SelectValue placeholder="Open a task" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {doc.tasks.map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            {(error || (runtime && !runtime.available)) && (
              <div
                className="bg-background absolute right-3 bottom-16 left-3 flex max-w-xl items-start gap-2 rounded-lg border p-3 shadow-sm"
                role="status"
              >
                <CircleAlert className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                <div className="min-w-0 flex-1 text-xs leading-relaxed">
                  {error || runtime?.message}
                  <Button
                    variant="link"
                    size="sm"
                    className="px-0"
                    onClick={() => setReloadPlayback((n) => n + 1)}
                  >
                    Reload playback
                  </Button>
                </div>
              </div>
            )}
            <div className="bg-background absolute bottom-3 left-3 flex items-center rounded-lg border p-1 shadow-sm">
              <IconButton
                icon={ZoomOut}
                label="Zoom out"
                onClick={() => void flow.zoomOut()}
              />
              <IconButton
                icon={ZoomIn}
                label="Zoom in"
                onClick={() => void flow.zoomIn()}
              />
              <IconButton
                icon={Maximize}
                label="Fit tasks"
                onClick={() =>
                  void flow.fitView({
                    padding: 0.1,
                    duration: 250,
                    minZoom: 0.28,
                    maxZoom: 1,
                  })
                }
              />
            </div>
            <div className="bg-background text-muted-foreground absolute right-3 bottom-3 hidden rounded-lg border px-3 py-2 text-xs sm:block">
              <span
                id="agent-canvas-help"
                className="flex flex-wrap items-center gap-x-4 gap-y-1"
              >
                <span className="flex items-center gap-1.5">
                  <GripVertical className="size-3.5" />
                  Drag the title bar to move
                </span>
                <span className="flex items-center gap-1.5">
                  Drag <strong>OUT</strong>
                  <MoveRight className="size-3.5" />
                  <strong>IN</strong> to connect
                </span>
              </span>
            </div>
          </div>
          <footer className="text-muted-foreground flex h-9 shrink-0 items-center gap-2 border-t px-3 text-[10px]">
            <span
              className={cn(
                "bg-muted-foreground size-1.5 rounded-full",
                runtime?.available && "bg-primary",
              )}
            />
            <button
              className="hover:text-foreground truncate"
              onClick={() => setInspecting("brief")}
            >
              Scripted demo
            </button>
            <span className="hidden sm:inline">
              · Mock activity · No model calls
            </span>
            <span className="ml-auto truncate">
              {run?.status === "running"
                ? `${run.tasks.filter((task) => task.status === "running").length} working · ${run.tasks.filter((task) => task.status === "completed").length}/${run.tasks.length} complete`
                : run
                  ? `Team ${run.status}`
                  : saved}
            </span>
          </footer>

          <Sheet
            open={inspecting !== null}
            onOpenChange={(open) => {
              if (!open) setInspecting(null);
            }}
          >
            <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
              <SheetHeader>
                <SheetTitle>
                  {selected
                    ? selected.title
                    : inspecting === "history"
                      ? "Run history"
                      : "Shared brief"}
                </SheetTitle>
                <SheetDescription>
                  {selected
                    ? "Give this agent a focused assignment and choose its inputs."
                    : inspecting === "history"
                      ? "Recent scripted runs for this version, saved on this device."
                      : agentScenarios[scenario].description}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-6 px-4 pb-6">
                {inspecting === "brief" && (
                  <>
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor="agent-brief">
                          What should the team accomplish?
                        </FieldLabel>
                        <Textarea
                          id="agent-brief"
                          onFocus={() => store.checkpoint()}
                          className="min-h-36"
                          value={doc.brief}
                          disabled={locked}
                          onChange={(event) =>
                            store.change(
                              (current) => ({
                                ...current,
                                brief: event.target.value,
                              }),
                              false,
                            )
                          }
                        />
                      </Field>
                    </FieldGroup>
                    <div className="space-y-2 rounded-lg border p-4 text-sm">
                      <p className="font-medium">
                        {runtime?.message || "Loading scenario…"}
                      </p>
                      {runtime?.workspace && (
                        <p className="text-muted-foreground text-xs break-all">
                          {runtime.workspace}
                        </p>
                      )}
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        This public showcase uses authored dialogue, command
                        output, and review results. Playback runs entirely in
                        your browser. No account, repository connection, or
                        model request is used.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReloadPlayback((n) => n + 1)}
                      >
                        <RefreshCw data-icon="inline-start" />
                        Reload playback
                      </Button>
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {agentScenarios[scenario].description} Edits and playback
                      are saved separately for each version. Follow-ups play
                      authored responses for the selected role.
                    </p>
                  </>
                )}
                {inspecting === "history" && (
                  <div className="flex flex-col gap-3">
                    {pastRuns.map((entry, index) => (
                      <details
                        key={entry.id}
                        className="rounded-lg border p-3"
                        open={index === 0}
                      >
                        <summary className="cursor-pointer text-sm font-medium">
                          {index === 0
                            ? "Current run"
                            : `Previous run ${index}`}{" "}
                          · {entry.status}
                        </summary>
                        <p className="text-muted-foreground mt-2 text-xs">
                          {new Date(entry.startedAt).toLocaleString()}
                        </p>
                        <div className="mt-3 flex flex-col gap-3">
                          {entry.tasks.map((task) => (
                            <section key={task.taskId}>
                              <h4 className="text-sm font-medium">
                                {
                                  entry.plan.tasks.find(
                                    (item) => item.id === task.taskId,
                                  )?.title
                                }{" "}
                                · {statusLabels[task.status]}
                              </h4>
                              <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                                <ReactMarkdown>
                                  {task.output ||
                                    task.error ||
                                    "No output yet."}
                                </ReactMarkdown>
                              </div>
                            </section>
                          ))}
                        </div>
                      </details>
                    ))}
                  </div>
                )}
                {selected && (
                  <>
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor="agent-title">
                          Task title
                        </FieldLabel>
                        <Input
                          id="agent-title"
                          onFocus={() => store.checkpoint()}
                          value={selected.title}
                          disabled={locked}
                          onChange={(event) =>
                            updateTask(
                              selected.id,
                              {
                                title: event.target.value,
                              },
                              false,
                            )
                          }
                        />
                      </Field>
                      <Field>
                        <FieldLabel>
                          Role · {agentProviders[selected.provider]}
                        </FieldLabel>
                        <Select
                          value={selected.role}
                          disabled={locked}
                          onValueChange={(value: AgentTask["role"]) =>
                            updateTask(selected.id, { role: value })
                          }
                        >
                          <SelectTrigger aria-label="Agent role">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {Object.keys(roleIcons).map((role) => (
                                <SelectItem key={role} value={role}>
                                  {role}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="agent-instruction">
                          Assignment
                        </FieldLabel>
                        <Textarea
                          id="agent-instruction"
                          onFocus={() => store.checkpoint()}
                          className="min-h-28"
                          value={selected.instruction}
                          disabled={locked}
                          onChange={(event) =>
                            updateTask(
                              selected.id,
                              {
                                instruction: event.target.value,
                              },
                              false,
                            )
                          }
                        />
                      </Field>
                    </FieldGroup>
                    <fieldset className="space-y-3">
                      <legend className="mb-2 text-sm font-medium">
                        Wait for these deliverables
                      </legend>
                      {doc.tasks
                        .filter((task) => task.id !== selected.id)
                        .map((task) => (
                          <label
                            key={task.id}
                            className="flex items-center gap-2 text-sm"
                          >
                            <Checkbox
                              disabled={locked}
                              checked={selected.dependsOn.includes(task.id)}
                              onCheckedChange={(checked) =>
                                dependencies(
                                  selected.id,
                                  checked
                                    ? [...selected.dependsOn, task.id]
                                    : selected.dependsOn.filter(
                                        (id) => id !== task.id,
                                      ),
                                )
                              }
                            />
                            {task.title}
                          </label>
                        ))}
                      {doc.tasks.length === 1 && (
                        <p className="text-muted-foreground text-xs">
                          Add another task to share its output.
                        </p>
                      )}
                    </fieldset>
                    {result && (
                      <section className="space-y-3 border-t pt-5">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold">
                            {result.output ? "Deliverable" : "Live activity"}
                          </h3>
                          <Badge variant="secondary">
                            {statusLabels[result.status]}
                          </Badge>
                        </div>
                        {stale && (
                          <p className="text-muted-foreground text-xs">
                            This output belongs to the previous assignment. Run
                            the team again to use your edits.
                          </p>
                        )}
                        {result.threadId && (
                          <p className="text-muted-foreground font-mono text-[10px] break-all">
                            Session {result.threadId}
                          </p>
                        )}
                        {result.output ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                            <ReactMarkdown>{result.output}</ReactMarkdown>
                          </div>
                        ) : (
                          <div className="space-y-3 rounded-lg bg-[#1a1a1a] p-4">
                            {result.items.map((item) => (
                              <Activity
                                key={item.id}
                                item={item}
                                provider={selected.provider}
                              />
                            ))}
                          </div>
                        )}
                        {result.error && (
                          <p className="text-destructive text-sm break-words">
                            {result.error}
                          </p>
                        )}
                        {result.output && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              downloadFile(
                                `agent-${selected.id}.md`,
                                result.output,
                                "text/markdown",
                              )
                            }
                          >
                            <ArrowDownToLine data-icon="inline-start" />
                            Download output
                          </Button>
                        )}
                        {result.status === "running" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void stop(selected.id)}
                            disabled={pending}
                          >
                            <Square data-icon="inline-start" />
                            Stop this task
                          </Button>
                        )}
                        {result.inputTokens !== undefined && (
                          <p className="text-muted-foreground text-xs">
                            {result.inputTokens.toLocaleString()} input ·{" "}
                            {result.outputTokens?.toLocaleString()} output
                            tokens
                          </p>
                        )}
                      </section>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={locked || doc.tasks.length === 1}
                      onClick={() => {
                        store.change((current) => ({
                          ...current,
                          tasks: current.tasks
                            .filter((task) => task.id !== selected.id)
                            .map((task) => ({
                              ...task,
                              dependsOn: task.dependsOn.filter(
                                (id) => id !== selected.id,
                              ),
                            })),
                        }));
                        setInspecting(null);
                      }}
                    >
                      <Trash2 data-icon="inline-start" />
                      Remove task
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </AiWorkspaceShell>
    </div>
  );
}

export function AgentCanvas({ scenario }: { scenario: AgentScenarioId }) {
  return (
    <ReactFlowProvider key={scenario}>
      <AgentCanvasInner scenario={scenario} />
    </ReactFlowProvider>
  );
}
