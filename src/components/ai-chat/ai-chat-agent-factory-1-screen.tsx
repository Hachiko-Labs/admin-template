"use client";

import {
  ArrowLeft,
  Box,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  CircleDot,
  Clock3,
  Ellipsis,
  Files,
  FileText,
  GitBranch,
  GitFork,
  Inbox,
  ListFilter,
  MessageSquare,
  Play,
  Plus,
  Search,
  ShieldCheck,
  Tag,
  Users,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

import {
  AiChatAgentKanban,
  type IssueBoardItem,
} from "@/components/ai-chat/ai-chat-agent-kanban";
import {
  getDisplayStatusLabel,
  type IssueStatus,
} from "@/components/ai-chat/ai-chat-agent-kanban-core";
import {
  AiConversationSidebarItem,
  AiConversationSidebarSection,
} from "@/components/ai-chat/ai-conversation-navigation";
import { AiConversationShell } from "@/components/ai-chat/ai-conversation-shell";
import {
  type AgentBlobSilhouette,
  AnimatedAgentBlob,
} from "@/components/ai-chat/animated-agent-blob";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type TaskStatus = IssueStatus;
type AgentId = "scout" | "builder" | "reviewer" | "qa";

type FactoryTask = {
  id: string;
  code: string;
  title: string;
  description: string;
  status: TaskStatus;
  type: "Feature" | "Bug" | "Maintenance";
  priority: "high" | "medium" | "low";
  file: string;
  estimate: string;
  agentId?: AgentId;
  acceptance: string[];
  details: string;
  reviewNote: string;
};

const agents: Array<{
  id: AgentId;
  name: string;
  role: string;
  color: string;
  softColor: string;
  blobColors: readonly [string, string, string];
  silhouette: AgentBlobSilhouette;
  phase: number;
}> = [
  {
    id: "scout",
    name: "Scout",
    role: "Repository researcher",
    color: "bg-emerald-500",
    softColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    blobColors: ["#67e8f9", "#3b82f6", "#8b5cf6"],
    silhouette: "droplet",
    phase: 0,
  },
  {
    id: "builder",
    name: "Builder",
    role: "Implementation agent",
    color: "bg-sky-500",
    softColor: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
    blobColors: ["#f9a8d4", "#ec4899", "#fdba74"],
    silhouette: "squircle",
    phase: 0.8,
  },
  {
    id: "reviewer",
    name: "Reviewer",
    role: "Code and UX reviewer",
    color: "bg-violet-500",
    softColor: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
    blobColors: ["#a7f3d0", "#14b8a6", "#0ea5e9"],
    silhouette: "hexagon",
    phase: 1.6,
  },
  {
    id: "qa",
    name: "Verifier",
    role: "Test and validation agent",
    color: "bg-amber-500",
    softColor: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    blobColors: ["#fde68a", "#f97316", "#ef4444"],
    silhouette: "triangle",
    phase: 2.4,
  },
];

const initialTasks: FactoryTask[] = [
  {
    id: "1",
    code: "ARC-207",
    title: "Update agent run description to reflect full execution control",
    description:
      "Clarify what the factory can change before the first run starts.",
    status: "Backlog",
    type: "Maintenance",
    priority: "low",
    file: "src/agents/run-description.ts",
    estimate: "2",
    acceptance: [
      "Describe branch and workspace isolation.",
      "Keep the copy concise and actionable.",
    ],
    details:
      "The launch description currently stops at the selected agent. Extend it to explain where the run executes, which branch it can change, and when the operator gets control back. Keep the language scannable inside the launch dialog.",
    reviewNote:
      "Keep the description tied to controls that actually exist. Avoid promising automatic isolation when the current-branch mode is selected.",
  },
  {
    id: "2",
    code: "ARC-211",
    title: "Check task graph against product brief",
    description:
      "Review dependencies and identify missing implementation steps.",
    status: "Backlog",
    type: "Feature",
    priority: "medium",
    file: "docs/product-brief.md",
    estimate: "3",
    agentId: "scout",
    acceptance: [
      "Map each brief requirement to a task.",
      "Flag missing dependencies before dispatch.",
    ],
    details:
      "Trace every requirement in the current product brief to an executable task and make gaps visible before implementation begins. The resulting graph should distinguish missing work from work that is merely waiting on another task.",
    reviewNote:
      "The dependency pass should produce actionable gaps, not another summary of the brief.",
  },
  {
    id: "3",
    code: "ARC-214",
    title: "Add branch-aware launch configuration",
    description:
      "Let operators run an agent in the active branch or an isolated branch.",
    status: "Planned",
    type: "Feature",
    priority: "high",
    file: "src/factory/launch-config.tsx",
    estimate: "5",
    agentId: "builder",
    acceptance: [
      "Support current and new branch modes.",
      "Generate a safe branch name from the task.",
      "Allow an optional local workspace.",
    ],
    details:
      "Add an explicit launch choice between the active branch and an isolated task branch. New branches need a deterministic safe name, a visible base branch, and an optional local workspace without changing the current repository until the run is confirmed.",
    reviewNote:
      "The branch preview should always match the value sent to the runner, including after the task title changes.",
  },
  {
    id: "4",
    code: "ARC-218",
    title: "Persist conversation memory between agent handoffs",
    description:
      "Keep the relevant run context when a task moves from Builder to Reviewer.",
    status: "Planned",
    type: "Feature",
    priority: "high",
    file: "src/agents/handoff-store.ts",
    estimate: "8",
    agentId: "builder",
    acceptance: [
      "Store the compact handoff summary.",
      "Expose source run and agent metadata.",
    ],
    details:
      "Persist a compact handoff record when one agent passes work to the next. The receiving agent needs the decisions, unresolved questions, source run, and relevant file context without replaying the entire conversation.",
    reviewNote:
      "Cap the stored memory and preserve provenance. A reviewer should be able to tell which run produced every carried decision.",
  },
  {
    id: "5",
    code: "ARC-220",
    title: "Prevent null-byte arguments in generated commands",
    description:
      "Validate generated command input before a workspace process starts.",
    status: "In Progress",
    type: "Bug",
    priority: "high",
    file: "src/runtime/commands.ts",
    estimate: "3",
    agentId: "qa",
    acceptance: [
      "Reject null bytes before process invocation.",
      "Preserve valid escaped input.",
      "Add a regression test for the reported command.",
    ],
    details:
      "Validate command arguments at the runtime boundary before any child process is created. Reject embedded null bytes with a clear task error while preserving escaped text and otherwise valid generated commands.",
    reviewNote:
      "Keep the guard at the process boundary so every command source receives the same protection.",
  },
  {
    id: "6",
    code: "ARC-223",
    title: "Review mobile task inspector behavior",
    description:
      "Validate the full-screen inspector and launch sequence on narrow screens.",
    status: "In Progress",
    type: "Maintenance",
    priority: "medium",
    file: "src/factory/task-inspector.tsx",
    estimate: "2",
    agentId: "reviewer",
    acceptance: [
      "No horizontal page overflow.",
      "Launch controls remain reachable.",
    ],
    details:
      "Exercise the task detail and launch flow at phone and tablet widths. The inspector should become a focused sheet, retain its scroll position, and keep the primary run control reachable without introducing page-level overflow.",
    reviewNote:
      "Test long titles and file paths as well as the default examples; those are the likely overflow sources.",
  },
  {
    id: "7",
    code: "ARC-201",
    title: "Add repository context to factory runs",
    description: "Attach selected repository metadata to each dispatched run.",
    status: "Done",
    type: "Feature",
    priority: "medium",
    file: "src/factory/repository-context.ts",
    estimate: "5",
    agentId: "reviewer",
    acceptance: [
      "Record repository and branch.",
      "Display context in run history.",
    ],
    details:
      "Capture the selected repository, base branch, working branch, and workspace path when a run is dispatched. Surface the same immutable context in run history so later handoffs never depend on whichever repository is currently open.",
    reviewNote:
      "Snapshot this data at dispatch time. Reading live workspace state from history would make old runs misleading.",
  },
];

const statuses: TaskStatus[] = ["Backlog", "Planned", "In Progress", "Done"];

function agentById(id?: AgentId) {
  return agents.find((agent) => agent.id === id);
}

function AgentBot({
  agent,
  className,
}: {
  agent: (typeof agents)[number];
  className?: string;
}) {
  return (
    <AnimatedAgentBlob
      className={cn("shrink-0", className)}
      colors={agent.blobColors}
      silhouette={agent.silhouette}
      phase={agent.phase}
      decorative
    />
  );
}

function AgentFactoryWorkspaceSidebar({
  filter,
  onFilterChange,
  tasks,
}: {
  filter: string;
  onFilterChange: (filter: string) => void;
  tasks: FactoryTask[];
}) {
  const assignedCount = tasks.filter((task) => task.agentId).length;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <AiConversationSidebarSection label="Actions">
        <AiConversationSidebarItem
          icon={Box}
          label="Task board"
          onClick={() => onFilterChange("All tasks")}
        />
      </AiConversationSidebarSection>

      <ScrollArea className="min-h-0 flex-1 [&>[data-slot=scroll-area-viewport]>div]:!block">
        <AiConversationSidebarSection label="Your work">
          <AiConversationSidebarItem
            active={filter === "Inbox"}
            count="3"
            icon={Inbox}
            label="Inbox"
            onClick={() => onFilterChange("Inbox")}
          />
          <AiConversationSidebarItem
            active={filter === "My tasks"}
            count={String(assignedCount)}
            icon={CircleDot}
            label="My tasks"
            onClick={() => onFilterChange("My tasks")}
          />
          <AiConversationSidebarItem
            active={filter === "All tasks"}
            count={String(tasks.length)}
            icon={ListFilter}
            label="All tasks"
            onClick={() => onFilterChange("All tasks")}
          />
        </AiConversationSidebarSection>

        <AiConversationSidebarSection label="Status">
          {statuses.map((status) => (
            <AiConversationSidebarItem
              key={status}
              active={filter === status}
              count={String(
                tasks.filter((task) => task.status === status).length,
              )}
              icon={Circle}
              label={getDisplayStatusLabel(status)}
              onClick={() => onFilterChange(status)}
            />
          ))}
        </AiConversationSidebarSection>

        <AiConversationSidebarSection label="Agents">
          {agents.map((agent) => (
            <AiConversationSidebarItem
              key={agent.id}
              active={filter === agent.name}
              iconClassName={cn(
                "fill-current",
                agent.id === "scout" && "text-emerald-500",
                agent.id === "builder" && "text-sky-500",
                agent.id === "reviewer" && "text-violet-500",
                agent.id === "qa" && "text-amber-500",
              )}
              count={String(
                tasks.filter((task) => task.agentId === agent.id).length,
              )}
              icon={Circle}
              label={agent.name}
              onClick={() => onFilterChange(agent.name)}
            />
          ))}
        </AiConversationSidebarSection>
      </ScrollArea>
    </div>
  );
}

function TaskInspector({
  task,
  running,
  onClose,
  onDispatch,
}: {
  task: FactoryTask;
  running: boolean;
  onClose: () => void;
  onDispatch: (agent: AgentId) => void;
}) {
  const assignedAgent = agentById(task.agentId);
  const relatedFile = task.file.replace(/\.[^.]+$/, ".test.ts");
  const branchName = `agent/${task.code.toLowerCase()}-${task.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 28)}`;
  const estimate = Number(task.estimate);
  const additions = estimate * 12 + task.acceptance.length * 4;
  const deletions = Math.max(3, estimate * 2 - 1);
  const completedChecks =
    task.status === "Done"
      ? task.acceptance.length + 1
      : task.status === "In Progress"
        ? Math.max(1, task.acceptance.length - 1)
        : 1;
  const totalChecks = task.acceptance.length + 1;
  const updatedLabel = running
    ? "running now"
    : task.status === "Done"
      ? "completed yesterday"
      : "updated 18 min ago";

  return (
    <Tabs defaultValue="summary" className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b">
        <div className="flex h-8 items-center gap-1 px-4">
          <Button
            variant="ghost"
            size="icon-sm"
            className="mr-1 -ml-1"
            aria-label="Back to task board"
            onClick={onClose}
          >
            <ArrowLeft />
          </Button>
          <span className="text-muted-foreground min-w-0 truncate text-[11px]">
            Release factory
          </span>
          <span className="text-muted-foreground/60 text-[11px]">/</span>
          <span className="shrink-0 text-[11px] font-medium">{task.code}</span>
        </div>

        <div className="px-4 pt-1 pb-3.5">
          <h2 className="text-[16px] leading-6 font-semibold tracking-[-0.015em]">
            {task.title}
          </h2>
          <div className="text-muted-foreground mt-2 flex min-w-0 items-center gap-1.5 text-[11px]">
            {assignedAgent ? (
              <AgentBot agent={assignedAgent} className="size-4" />
            ) : (
              <span className="size-4 rounded-full border border-dashed" />
            )}
            <span className="text-foreground font-medium">
              {assignedAgent?.name ?? "Unassigned"}
            </span>
            <span>·</span>
            <span>{updatedLabel}</span>
          </div>

          <div className="text-muted-foreground mt-3.5 flex min-w-0 items-center gap-2 text-[11px]">
            <span className="flex min-w-0 flex-1 items-center gap-1.5 font-mono">
              <code className="shrink-0">main</code>
              <ArrowLeft className="size-3 shrink-0 opacity-60" />
              <code className="min-w-0 truncate">{branchName}</code>
            </span>
            <span className="flex shrink-0 items-center gap-1 tabular-nums">
              <Files className="size-3" />2
            </span>
            <span className="shrink-0 font-mono tabular-nums">
              <span className="text-emerald-600">+{additions}</span>{" "}
              <span className="text-rose-600">−{deletions}</span>
            </span>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-2 border-t px-4 py-2">
          <TabsList className="bg-muted/70 h-7 rounded-md p-0.5">
            <TabsTrigger
              value="summary"
              className="h-6 rounded-[5px] px-2.5 py-0 text-[11px] font-medium data-[state=active]:shadow-none"
            >
              Summary
            </TabsTrigger>
            <TabsTrigger
              value="timeline"
              className="h-6 rounded-[5px] px-2.5 py-0 text-[11px] font-medium data-[state=active]:shadow-none"
            >
              Timeline
            </TabsTrigger>
            <TabsTrigger
              value="files"
              className="h-6 rounded-[5px] px-2.5 py-0 text-[11px] font-medium data-[state=active]:shadow-none"
            >
              Code
            </TabsTrigger>
          </TabsList>
          <span className="text-muted-foreground ml-auto flex shrink-0 items-center gap-1.5 text-[10px]">
            <CheckCircle2
              className={cn(
                "size-3.5",
                completedChecks === totalChecks && "text-emerald-600",
              )}
            />
            {completedChecks}/{totalChecks} checks
          </span>
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <TabsContent value="summary" className="absolute inset-0 m-0">
          <ScrollArea className="h-full [&>[data-slot=scroll-area-viewport]>div]:!block">
            <section className="px-4 py-2 text-[12px]">
              <TaskMetaRow icon={<Users />} label="Reviewers">
                <span className="flex items-center">
                  {agents.slice(2, 4).map((agent, index) => (
                    <AgentBot
                      key={agent.id}
                      agent={agent}
                      className={cn(
                        "ring-background size-5 rounded-full ring-2",
                        index > 0 && "-ml-1.5",
                      )}
                    />
                  ))}
                  <span className="ml-2">Reviewer, Verifier</span>
                </span>
              </TaskMetaRow>
              <TaskMetaRow icon={<Tag />} label="Labels">
                <span className="flex min-w-0 flex-wrap gap-1.5">
                  <Badge
                    variant="outline"
                    className="border-border/70 h-5 px-1.5 text-[10px] font-normal"
                  >
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        task.type === "Bug"
                          ? "bg-rose-500"
                          : task.type === "Feature"
                            ? "bg-violet-500"
                            : "bg-zinc-400",
                      )}
                    />
                    {task.type}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-border/70 h-5 px-1.5 text-[10px] font-normal capitalize"
                  >
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        task.priority === "high"
                          ? "bg-rose-500"
                          : task.priority === "medium"
                            ? "bg-amber-500"
                            : "bg-slate-400",
                      )}
                    />
                    {task.priority}
                  </Badge>
                </span>
              </TaskMetaRow>
              <TaskMetaRow icon={<MessageSquare />} label="Comments">
                1 review comment
              </TaskMetaRow>
            </section>

            <TaskDetailSection title="Description">
              <div className="space-y-3 text-[12px] leading-5">
                <p>{task.description}</p>
                <p className="text-muted-foreground">{task.details}</p>
                <p className="text-muted-foreground">
                  Primary scope:{" "}
                  <code className="bg-muted text-foreground rounded px-1 py-0.5 text-[10px]">
                    {task.file}
                  </code>
                </p>
              </div>
            </TaskDetailSection>

            <TaskDetailSection title="Checks" count={totalChecks}>
              <div className="space-y-1">
                <div className="hover:bg-muted/50 flex min-h-8 items-center gap-2 rounded-md px-2 py-1.5">
                  <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600" />
                  <span className="min-w-0 flex-1 text-[11px] leading-4">
                    Task scope resolved
                  </span>
                  <span className="text-muted-foreground shrink-0 text-[10px]">
                    Passed
                  </span>
                </div>
                {task.acceptance.map((item, index) => {
                  const checked = index < completedChecks - 1;
                  return (
                    <div
                      key={item}
                      className="hover:bg-muted/50 flex min-h-8 items-center gap-2 rounded-md px-2 py-1.5"
                    >
                      {checked ? (
                        <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600" />
                      ) : (
                        <Circle className="text-muted-foreground size-3.5 shrink-0" />
                      )}
                      <span className="min-w-0 flex-1 text-[11px] leading-4">
                        {item}
                      </span>
                      <span className="text-muted-foreground shrink-0 text-[10px]">
                        {checked ? "Passed" : "Pending"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </TaskDetailSection>

            <TaskDetailSection title="Comments" count={1}>
              <article className="border-border/60 rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <AgentBot agent={agents[2]!} className="size-5" />
                  <span className="text-[11px] font-medium">Reviewer</span>
                  <span className="text-muted-foreground ml-auto text-[10px]">
                    12 min ago
                  </span>
                </div>
                <p className="text-muted-foreground mt-2 text-[11px] leading-4.5">
                  {task.reviewNote}
                </p>
              </article>
            </TaskDetailSection>

            <TaskDetailSection title="Run with">
              <div className="grid grid-cols-2 gap-2">
                {agents.map((agent) => (
                  <Button
                    key={agent.id}
                    variant="outline"
                    className={cn(
                      "h-9 min-w-0 justify-start px-2.5 text-[11px] font-normal",
                      task.agentId === agent.id && "bg-muted",
                    )}
                    onClick={() => onDispatch(agent.id)}
                    disabled={running}
                  >
                    <AgentBot agent={agent} className="size-5" />
                    <span className="min-w-0 truncate">{agent.name}</span>
                    {task.agentId === agent.id ? (
                      <Check className="text-muted-foreground ml-auto size-3" />
                    ) : null}
                  </Button>
                ))}
              </div>
            </TaskDetailSection>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="timeline" className="absolute inset-0 m-0">
          <ScrollArea className="h-full [&>[data-slot=scroll-area-viewport]>div]:!block">
            <div className="px-4 py-5">
              <div className="before:bg-border relative space-y-6 before:absolute before:top-3 before:bottom-3 before:left-[7px] before:w-px">
                <TaskTimelineEvent
                  icon={CircleDot}
                  title="Task added to the release queue"
                  detail={`Created from the product brief as ${task.code}`}
                  time="Aug 24"
                />
                <TaskTimelineEvent
                  icon={GitBranch}
                  title="Working branch prepared"
                  detail={branchName}
                  time="22 min ago"
                  mono
                />
                <TaskTimelineEvent
                  icon={MessageSquare}
                  title={`${assignedAgent?.name ?? "Builder"} refined the task context`}
                  detail={`${task.acceptance.length} acceptance checks and 2 files are in scope`}
                  time="18 min ago"
                />
                {running || task.status === "Done" ? (
                  <TaskTimelineEvent
                    icon={running ? Clock3 : ShieldCheck}
                    title={
                      running ? "Agent run started" : "Verification completed"
                    }
                    detail={
                      running
                        ? `${assignedAgent?.name ?? "Builder"} is executing the change`
                        : "All acceptance checks passed"
                    }
                    time={running ? "Now" : "Yesterday"}
                    active={running}
                  />
                ) : null}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="files" className="absolute inset-0 m-0">
          <ScrollArea className="h-full [&>[data-slot=scroll-area-viewport]>div]:!block">
            <div className="flex h-11 items-center border-b px-4">
              <span className="text-[12px] font-medium">Changed files</span>
              <span className="text-muted-foreground ml-auto font-mono text-[10px]">
                <span className="text-emerald-600">+{additions}</span>{" "}
                <span className="text-rose-600">−{deletions}</span>
              </span>
            </div>
            <TaskFileRow
              path={task.file}
              additions={additions - 8}
              deletions={deletions}
              status="M"
            />
            <TaskFileRow
              path={relatedFile}
              additions={8}
              deletions={0}
              status="A"
            />
            <div className="border-t px-4 py-4">
              <div className="bg-muted/20 flex items-start gap-2.5 rounded-lg border p-3">
                <ShieldCheck className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                <div>
                  <p className="text-[11px] font-medium">Review scope</p>
                  <p className="text-muted-foreground mt-1 text-[11px] leading-4">
                    Verify the implementation and its focused regression test
                    before the run can move to Done.
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </div>

      <div className="flex h-12 shrink-0 items-center gap-3 border-t px-4">
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[11px] font-medium">
            {running
              ? `${assignedAgent?.name ?? "Builder"} is running`
              : `Run with ${assignedAgent?.name ?? "Builder"}`}
          </span>
          <span className="text-muted-foreground block truncate text-[10px]">
            {running ? "Follow progress in Timeline" : branchName}
          </span>
        </span>
        <Button
          size="sm"
          className="h-7 px-2.5 text-[11px] shadow-none"
          onClick={() => onDispatch(task.agentId ?? "builder")}
          disabled={running}
        >
          {running ? (
            <Circle className="animate-spin" />
          ) : (
            <Play className="fill-current" />
          )}
          {running ? "Running" : "Run task"}
        </Button>
      </div>
    </Tabs>
  );
}

function TaskMetaRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-8 grid-cols-[88px_minmax(0,1fr)] items-center gap-2 py-1.5 text-[11px]">
      <span className="text-muted-foreground flex min-w-0 items-center gap-1.5 [&_svg]:size-3.5">
        {icon}
        {label}
      </span>
      <span className="min-w-0">{children}</span>
    </div>
  );
}

function TaskDetailSection({
  title,
  count,
  defaultOpen = true,
  children,
}: {
  title: string;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <section className="border-t">
      <button
        type="button"
        className="flex h-10 w-full items-center gap-1.5 px-4 text-left text-[12px] font-medium"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{title}</span>
        <ChevronRight
          className={cn(
            "text-muted-foreground size-3.5 transition-transform",
            open && "rotate-90",
          )}
        />
        {count === undefined ? null : (
          <span className="text-muted-foreground text-[10px] tabular-nums">
            {count}
          </span>
        )}
      </button>
      {open ? <div className="px-4 pb-4">{children}</div> : null}
    </section>
  );
}

function TaskTimelineEvent({
  icon: Icon,
  title,
  detail,
  time,
  mono = false,
  active = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  detail: string;
  time: string;
  mono?: boolean;
  active?: boolean;
}) {
  return (
    <div className="relative flex gap-3 pl-7">
      <span
        className={cn(
          "bg-background absolute top-0 left-0 z-10 grid size-[15px] place-items-center rounded-full border",
          active && "border-emerald-500 text-emerald-600",
        )}
      >
        <Icon className="size-2.5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p className="min-w-0 flex-1 text-[12px] leading-4 font-medium">
            {title}
          </p>
          <span className="text-muted-foreground shrink-0 text-[10px]">
            {time}
          </span>
        </div>
        <p
          className={cn(
            "text-muted-foreground mt-1 text-[11px] leading-4 break-words",
            mono && "font-mono",
          )}
        >
          {detail}
        </p>
      </div>
    </div>
  );
}

function TaskFileRow({
  path,
  status,
  additions,
  deletions,
}: {
  path: string;
  status: "A" | "M";
  additions: number;
  deletions: number;
}) {
  const slash = path.lastIndexOf("/");
  return (
    <div className="flex min-h-14 items-center gap-2.5 border-b px-4 py-2.5">
      <FileText className="text-muted-foreground size-4 shrink-0" />
      <span className="min-w-0 flex-1 text-[11px]">
        <span className="block truncate font-medium">
          {path.slice(slash + 1)}
        </span>
        <span className="text-muted-foreground block truncate">
          {slash > -1 ? path.slice(0, slash) : "/"}
        </span>
      </span>
      <span className="shrink-0 font-mono text-[10px] tabular-nums">
        <span className="text-emerald-600">+{additions}</span>{" "}
        <span className="text-rose-600">−{deletions}</span>
      </span>
      <Badge
        variant="outline"
        className="border-border/70 size-5 justify-center p-0 text-[9px] font-medium"
      >
        {status}
      </Badge>
    </div>
  );
}

function LaunchDialog({
  open,
  task,
  agentId,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  task: FactoryTask;
  agentId: AgentId;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const [mode, setMode] = React.useState("current");
  const [confirming, setConfirming] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  React.useEffect(() => {
    if (!open) {
      if (timer.current) clearTimeout(timer.current);
      setConfirming(false);
    }
  }, [open]);
  function changeOpen(next: boolean) {
    if (!next && timer.current) clearTimeout(timer.current);
    onOpenChange(next);
  }
  const agent = agentById(agentId)!;

  function confirm() {
    setConfirming(true);
    timer.current = setTimeout(() => {
      setConfirming(false);
      onConfirm();
    }, 650);
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle className="flex items-center gap-2 text-base">
            Launch{" "}
            <Badge className={cn("font-normal", agent.softColor)}>
              {agent.name}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Prepare an isolated run for {task.code}.
          </DialogDescription>
        </DialogHeader>
        <div className="p-4">
          <RadioGroup value={mode} onValueChange={setMode} className="gap-2">
            <label
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border p-3",
                mode === "current" && "border-primary/40 bg-primary/5",
              )}
            >
              <RadioGroupItem value="current" className="mt-0.5" />
              <GitBranch className="mt-0.5 size-4" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">
                  Current branch
                </span>
                <span className="text-muted-foreground mt-0.5 block text-xs">
                  Use the active workspace branch
                </span>
              </span>
            </label>
            <label
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border p-3",
                mode === "new" && "border-primary/40 bg-primary/5",
              )}
            >
              <RadioGroupItem value="new" className="mt-0.5" />
              <GitFork className="mt-0.5 size-4" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">New branch</span>
                <span className="text-muted-foreground mt-0.5 block text-xs">
                  Isolate this task in a dedicated branch
                </span>
              </span>
            </label>
          </RadioGroup>
          {mode === "new" ? (
            <div className="mt-4 space-y-3 border-t pt-4">
              <div>
                <label
                  htmlFor="factory-base-branch"
                  className="text-muted-foreground mb-1 block text-xs"
                >
                  Base branch
                </label>
                <Input id="factory-base-branch" defaultValue="main" />
              </div>
              <div>
                <label
                  htmlFor="factory-branch-name"
                  className="text-muted-foreground mb-1 block text-xs"
                >
                  Branch name
                </label>
                <Input
                  id="factory-branch-name"
                  defaultValue={`agent/${task.code.toLowerCase()}-${task.title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-|-$/g, "")
                    .slice(0, 28)}`}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium">Local workspace</p>
                  <p className="text-muted-foreground text-[10px]">
                    Create and launch in the current directory
                  </p>
                </div>
                <Switch />
              </div>
            </div>
          ) : null}
        </div>
        <DialogFooter className="border-t px-4 py-3">
          <Button variant="ghost" onClick={() => changeOpen(false)}>
            Cancel
          </Button>
          <Button onClick={confirm} disabled={confirming}>
            {confirming ? (
              <Circle className="size-3.5 animate-spin" />
            ) : (
              <Play className="size-3.5" />
            )}
            {confirming ? "Preparing…" : "Confirm run"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AiChatAgentFactory1Screen() {
  const [tasks, setTasks] = React.useState(initialTasks);
  const [selectedId, setSelectedId] = React.useState("3");
  const [filter, setFilter] = React.useState("All tasks");
  const [query, setQuery] = React.useState("");
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [inspectorOpen, setInspectorOpen] = React.useState(false);
  const [launchOpen, setLaunchOpen] = React.useState(false);
  const [launchAgent, setLaunchAgent] = React.useState<AgentId>("qa");
  const [runningIds, setRunningIds] = React.useState<Set<string>>(
    new Set(["5"]),
  );
  const selected = tasks.find((task) => task.id === selectedId) ?? tasks[0];

  const visibleTasks = React.useMemo(
    () =>
      tasks.filter((task) => {
        const matchesQuery = `${task.code} ${task.title}`
          .toLowerCase()
          .includes(query.toLowerCase());
        if (!matchesQuery) return false;
        if (statuses.some((status) => status === filter))
          return task.status === filter;
        const agent = agents.find((item) => item.name === filter);
        if (agent) return task.agentId === agent.id;
        if (filter === "Inbox") return task.priority === "high";
        if (filter === "My tasks") return Boolean(task.agentId);
        return true;
      }),
    [filter, query, tasks],
  );

  const boardIssues = React.useMemo<IssueBoardItem[]>(
    () =>
      visibleTasks.map((task) => {
        const agent = agentById(task.agentId);
        return {
          id: task.id,
          code: task.code,
          title: task.title,
          description: task.description,
          status: task.status,
          assignee: agent
            ? { initials: agent.name.slice(0, 1), name: agent.name, avatar: "" }
            : null,
          blocked: false,
          priority: task.priority,
          lane: task.type,
          updateLabel: runningIds.has(task.id) ? "Agent running" : task.type,
          subIssueCount: 0,
        };
      }),
    [runningIds, visibleTasks],
  );

  function selectTask(task: FactoryTask) {
    setSelectedId(task.id);
    if (window.matchMedia("(max-width: 1279px)").matches) {
      setDetailsOpen(true);
    } else {
      setInspectorOpen(true);
    }
  }

  function dispatch(agentId: AgentId) {
    setLaunchAgent(agentId);
    setLaunchOpen(true);
  }

  function confirmRun() {
    setTasks((current) =>
      current.map((task) =>
        task.id === selected.id
          ? { ...task, status: "In Progress", agentId: launchAgent }
          : task,
      ),
    );
    setRunningIds((current) => new Set(current).add(selected.id));
    setLaunchOpen(false);
    setDetailsOpen(false);
  }

  function renderInspector(onClose: () => void) {
    return (
      <TaskInspector
        task={selected}
        running={runningIds.has(selected.id)}
        onClose={onClose}
        onDispatch={dispatch}
      />
    );
  }

  return (
    <AiConversationShell
      sidebarScrollMode="nested"
      headerTitle="Agent Factory 1"
      headerActions={
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Agent Factory actions"
            >
              <Ellipsis aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onSelect={() => {
                setFilter("All tasks");
                setQuery("");
              }}
            >
              Show all tasks
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/original/settings">Workspace settings</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      }
      sidebarContent={
        <AgentFactoryWorkspaceSidebar
          filter={filter}
          onFilterChange={setFilter}
          tasks={tasks}
        />
      }
    >
      <h1 className="sr-only">Agent Factory 1</h1>
      <div className="flex h-12 shrink-0 items-center gap-3 border-b px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="bg-muted grid size-7 place-items-center rounded-md">
            <Box className="size-3.5" />
          </span>
          <span className="truncate text-sm font-medium">Release factory</span>
          <Badge
            variant="outline"
            className="hidden font-normal sm:inline-flex"
          >
            <GitBranch className="size-3" />
            main
          </Badge>
        </div>
        <div className="relative ml-auto hidden w-56 md:block">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search tasks"
            autoComplete="off"
            name="task-search"
            placeholder="Search tasks"
            className="h-8 pl-8 text-xs"
          />
        </div>
        <span className="text-muted-foreground hidden text-xs lg:inline">
          {tasks.length} tasks
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          className="size-8"
          aria-label="Filter tasks"
        >
          <ListFilter className="size-3.5" />
        </Button>
        <Button size="sm" className="h-8 text-xs">
          <Plus className="size-3.5" />
          New task
        </Button>
      </div>
      <div
        className={cn(
          "grid min-h-0 flex-1",
          inspectorOpen
            ? "xl:grid-cols-[minmax(0,1fr)_440px] 2xl:grid-cols-[minmax(0,1fr)_500px]"
            : "grid-cols-[minmax(0,1fr)]",
        )}
      >
        <div className="bg-background min-h-0 min-w-0 overflow-hidden">
          <AiChatAgentKanban
            openBoard
            hideHeader
            issues={boardIssues}
            onIssuesChange={(issues) =>
              setTasks((current) => {
                const visibleIds = new Set(
                  boardIssues.map((issue) => issue.id),
                );
                return [
                  ...current.filter((task) => !visibleIds.has(task.id)),
                  ...issues.map((issue): FactoryTask => {
                    const task = current.find((item) => item.id === issue.id);
                    return task
                      ? { ...task, status: issue.status, title: issue.title }
                      : {
                          id: issue.id,
                          code: issue.code,
                          title: issue.title,
                          description: issue.description ?? "",
                          status: issue.status,
                          type: "Feature",
                          priority: issue.priority ?? "medium",
                          agentId: agents.find(
                            (agent) => agent.name === issue.assignee?.name,
                          )?.id,
                          file: "src/app/page.tsx",
                          estimate: "1",
                          acceptance: [],
                          details: issue.description ?? "",
                          reviewNote: "",
                        };
                  }),
                ];
              })
            }
            initialStatusFilter={statuses}
            selectedIssueId={
              inspectorOpen || detailsOpen ? selected.id : undefined
            }
            onIssueSelect={(issue) => {
              const task = tasks.find((item) => item.id === issue.id);
              if (task) selectTask(task);
            }}
            renderAssignee={(issue) => {
              const task = tasks.find((item) => item.id === issue.id);
              const agent = agentById(task?.agentId);
              return agent ? (
                <AgentBot agent={agent} className="size-7" />
              ) : (
                <span className="size-7 rounded-full border border-dashed" />
              );
            }}
          />
        </div>
        {inspectorOpen ? (
          <aside className="bg-background hidden min-h-0 border-l xl:block">
            {renderInspector(() => setInspectorOpen(false))}
          </aside>
        ) : null}
      </div>
      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent
          side="right"
          className="w-full gap-0 p-0 sm:max-w-md [&>button.absolute]:hidden"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Task details</SheetTitle>
            <SheetDescription>
              Inspect and dispatch agents for the selected task.
            </SheetDescription>
          </SheetHeader>
          {renderInspector(() => setDetailsOpen(false))}
        </SheetContent>
      </Sheet>
      <LaunchDialog
        open={launchOpen}
        task={selected}
        agentId={launchAgent}
        onOpenChange={setLaunchOpen}
        onConfirm={confirmRun}
      />
    </AiConversationShell>
  );
}
