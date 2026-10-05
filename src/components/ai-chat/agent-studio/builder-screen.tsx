"use client";

import type { LucideIcon } from "lucide-react";
import {
  ArrowUp,
  Bot,
  CalendarClock,
  Check,
  ChevronDown,
  Database,
  GitBranch,
  Layers,
  MessageSquare,
  Minus,
  PanelRightClose,
  PanelRightOpen,
  Play,
  Plus,
  ShieldCheck,
  Square,
  Trash2,
  Webhook,
  Wrench,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { StudioShell } from "./studio-shell";

type NodeId =
  | "schedule"
  | "triggers"
  | "channels"
  | "memory"
  | "agent"
  | "tools"
  | "skills"
  | "delegation";
type Config = {
  name: string;
  role: string;
  instructions: string;
  model: string;
  frequency: string;
  time: string;
  trigger: string;
  filter: string;
  channel: string;
  destination: string;
  approval: boolean;
  memories: { name: string; content: string }[];
  tools: string[];
  skills: string[];
  agents: string[];
};
const initial: Config = {
  name: "Customer signal analyst",
  role: "Turn customer feedback into the next right decision.",
  instructions:
    "Read the latest customer signals and group them by underlying need. Support every finding with a source. Prioritize recurring issues and separate evidence from assumptions. Prepare a brief for human review; never contact customers directly.",
  model: "GPT-4.1",
  frequency: "Every Monday",
  time: "09:00",
  trigger: "New support conversation",
  filter: "priority = high",
  channel: "Slack",
  destination: "#customer-insights",
  approval: true,
  memories: [
    {
      name: "Product priorities",
      content:
        "Focus on onboarding, collaboration, and reliable exports this quarter. Prioritize friction that prevents teams from reaching their first shared outcome.",
    },
    {
      name: "Previous findings",
      content:
        "Bulk invitations were raised in the previous review. Track new evidence before recommending a second initiative.",
    },
  ],
  tools: [
    "Zendesk · Search tickets",
    "Notion · Read pages",
    "Slack · Read threads",
  ],
  skills: ["Signal clustering", "Source verification", "Opportunity scoring"],
  agents: ["Evidence researcher", "Brief editor"],
};
const labels: Record<
  NodeId,
  { title: string; description: string; icon: LucideIcon }
> = {
  schedule: {
    title: "Schedule",
    description: "Set when the agent checks for new signals. Times are in UTC.",
    icon: CalendarClock,
  },
  triggers: {
    title: "Event trigger",
    description: "Choose the event and condition that start a run.",
    icon: Webhook,
  },
  channels: {
    title: "Channels",
    description: "Choose where the agent delivers its results.",
    icon: MessageSquare,
  },
  memory: {
    title: "Memory",
    description: "Maintain the context this agent carries between runs.",
    icon: Database,
  },
  agent: {
    title: "Agent instructions",
    description: "Define its purpose, model, and working instructions.",
    icon: Bot,
  },
  tools: {
    title: "Tools",
    description: "Select the resources this agent can read.",
    icon: Wrench,
  },
  skills: {
    title: "Skills",
    description: "Attach reusable ways of working.",
    icon: Layers,
  },
  delegation: {
    title: "Sub-agents",
    description: "Choose specialists available for delegated work.",
    icon: GitBranch,
  },
};
const toolOptions = [
  "Zendesk · Search tickets",
  "Notion · Read pages",
  "Slack · Read threads",
  "GitHub · Read issues",
  "Google Drive · Search files",
];
const skillOptions = [
  "Signal clustering",
  "Source verification",
  "Opportunity scoring",
  "Concise writing",
];
const delegateOptions = [
  "Evidence researcher",
  "Brief editor",
  "Support coordinator",
];

function CanvasNode({
  id,
  children,
  className,
  onOpen,
  subtitle,
}: {
  id: NodeId;
  children: React.ReactNode;
  className: string;
  onOpen: (id: NodeId) => void;
  subtitle?: string;
}) {
  const { title, icon: Icon } = labels[id];
  return (
    <button
      onClick={() => onOpen(id)}
      aria-label={`Configure ${title.toLowerCase()}`}
      className={cn(
        "bg-muted/60 absolute rounded-xl border p-1 text-left shadow-xs transition-[border-color,box-shadow] outline-none hover:border-emerald-500/50 hover:shadow-md focus-visible:ring-2 focus-visible:ring-emerald-500",
        className,
      )}
    >
      <div className="flex items-center gap-2 px-2 py-2 text-[11px]">
        <Icon className="text-muted-foreground size-3.5" />
        <span className="font-medium">
          {title === "Agent instructions" ? "Agent" : title}
        </span>
        {subtitle && (
          <span className="ml-auto text-[9px] text-emerald-700 dark:text-emerald-400">
            {subtitle}
          </span>
        )}
        <ChevronDown className="text-muted-foreground ml-auto size-3" />
      </div>
      <div className="bg-background rounded-lg border px-3 py-3">
        {children}
      </div>
    </button>
  );
}
const cloneConfig = (value: Config): Config => ({
  ...value,
  memories: value.memories.map((m) => ({ ...m })),
  tools: [...value.tools],
  skills: [...value.skills],
  agents: [...value.agents],
});

export function StudioBuilderScreen() {
  const [config, setConfig] = useState(initial);
  const [saved, setSaved] = useState(JSON.stringify(initial));
  const [version, setVersion] = useState(1);
  const [node, setNode] = useState<NodeId | null>(null);
  const [draft, setDraft] = useState(cloneConfig(initial));
  const [zoom, setZoom] = useState(0.9);
  const [showRun, setShowRun] = useState(true);
  const [mobileRun, setMobileRun] = useState(false);
  const [phase, setPhase] = useState(4);
  const [hasRun, setHasRun] = useState(true);
  const [runConfig, setRunConfig] = useState(initial);
  const [followUp, setFollowUp] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );
  const running = phase > 0 && phase < 4;
  const dirty = JSON.stringify(config) !== saved;
  function inspect(id: NodeId) {
    setDraft(cloneConfig(config));
    setNode(id);
  }
  function run() {
    if (timer.current) clearInterval(timer.current);
    setRunConfig(cloneConfig(config));
    setMessages([]);
    setHasRun(true);
    setPhase(1);
    setMobileRun(true);
    let step = 1;
    timer.current = setInterval(() => {
      step++;
      setPhase(step);
      if (step === 4 && timer.current) clearInterval(timer.current);
    }, 900);
  }
  const patch = (value: Partial<Config>) =>
    setDraft((d) => ({ ...d, ...value }));
  const cardText = "text-[11px] leading-5";
  return (
    <StudioShell active="builder">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-[66px] shrink-0 flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold">{config.name}</h1>
              <span className="text-muted-foreground rounded border px-1.5 py-0.5 text-[9px]">
                v{version}
              </span>
            </div>
            <p className="text-muted-foreground mt-1 text-[11px]">
              Build the context. Let the agent do the work.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground hidden text-[10px] sm:block">
              {dirty ? "Unsaved changes" : "All changes saved"}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={!dirty}
              onClick={() => {
                setSaved(JSON.stringify(config));
                setVersion((v) => v + 1);
                toast.success("Agent version saved in this demo");
              }}
            >
              Save agent
            </Button>
            <Button size="sm" onClick={run} disabled={running}>
              <Play className="size-3.5" />
              Test run
            </Button>
          </div>
        </div>
        <div className="flex shrink-0 border-b p-2 lg:hidden">
          <Button
            size="sm"
            variant={!mobileRun ? "secondary" : "ghost"}
            onClick={() => setMobileRun(false)}
          >
            Builder
          </Button>
          <Button
            size="sm"
            variant={mobileRun ? "secondary" : "ghost"}
            onClick={() => {
              setShowRun(true);
              setMobileRun(true);
            }}
          >
            Test conversation
          </Button>
        </div>
        <div className="flex min-h-0 flex-1">
          <section
            aria-label="Agent configuration canvas"
            className={cn(
              "bg-muted/15 relative min-w-0 flex-1 overflow-hidden",
              mobileRun ? "hidden lg:block" : "block",
            )}
          >
            <div className="absolute top-3 right-3 z-10 hidden lg:block">
              <Button
                variant="outline"
                size="icon-sm"
                className="bg-background"
                aria-label={
                  showRun ? "Hide test conversation" : "Show test conversation"
                }
                onClick={() => setShowRun(!showRun)}
              >
                {showRun ? (
                  <PanelRightClose className="size-4" />
                ) : (
                  <PanelRightOpen className="size-4" />
                )}
              </Button>
            </div>
            <div className="h-full overflow-auto bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-size-[18px_18px] p-4 pb-20">
              <div
                className="mx-auto"
                style={{ width: 800 * zoom, height: 780 * zoom }}
              >
                <div
                  className="relative h-[780px] w-[800px] origin-top-left"
                  style={{ transform: `scale(${zoom})` }}
                >
                  <div className="text-muted-foreground absolute top-6 left-6 text-[10px] tracking-widest">
                    INPUTS & CONTEXT
                  </div>
                  <div className="text-muted-foreground absolute top-6 left-[280px] text-[10px] tracking-widest">
                    YOUR AGENT
                  </div>
                  <div className="text-muted-foreground absolute top-6 left-[574px] text-[10px] tracking-widest">
                    CAPABILITIES
                  </div>
                  <svg
                    className="pointer-events-none absolute inset-0 h-full w-full text-emerald-600/35 dark:text-emerald-400/30"
                    aria-hidden="true"
                  >
                    {[130, 275, 424, 603].map((y) => (
                      <path
                        key={y}
                        d={`M224 ${y} C250 ${y}, 247 325, 274 325`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                    ))}
                    {[145, 358, 559].map((y) => (
                      <path
                        key={y}
                        d={`M522 325 C545 325, 545 ${y}, 572 ${y}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                    ))}
                    {[130, 275, 424, 603].map((y) => (
                      <circle
                        key={y}
                        cx="224"
                        cy={y}
                        r="3"
                        fill="currentColor"
                      />
                    ))}
                    {[145, 358, 559].map((y) => (
                      <circle
                        key={y}
                        cx="572"
                        cy={y}
                        r="3"
                        fill="currentColor"
                      />
                    ))}
                  </svg>
                  <CanvasNode
                    id="schedule"
                    className="top-[76px] left-6 w-[200px]"
                    onOpen={inspect}
                  >
                    <p className={cardText}>{config.frequency}</p>
                    <p className="text-muted-foreground mt-1 text-[10px]">
                      {config.frequency === "Manual only"
                        ? "Run when you need it"
                        : config.time + " UTC · Customer brief"}
                    </p>
                  </CanvasNode>
                  <CanvasNode
                    id="triggers"
                    className="top-[214px] left-6 w-[200px]"
                    onOpen={inspect}
                    subtitle="Event"
                  >
                    <p className={cardText}>{config.trigger}</p>
                    <code className="text-muted-foreground bg-muted/50 mt-2 block rounded px-1.5 py-1 text-[10px]">
                      {config.filter || "All matching events"}
                    </code>
                  </CanvasNode>
                  <CanvasNode
                    id="channels"
                    className="top-[374px] left-6 w-[200px]"
                    onOpen={inspect}
                  >
                    <div className="flex items-center justify-between">
                      <p className={cardText}>{config.channel}</p>
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                    </div>
                    <p className="text-muted-foreground mt-1 truncate text-[10px]">
                      {config.destination}
                    </p>
                    <p className="mt-2 text-[9px] text-emerald-700 dark:text-emerald-400">
                      {config.approval
                        ? "Approval before delivery"
                        : "Demo delivery enabled"}
                    </p>
                  </CanvasNode>
                  <CanvasNode
                    id="memory"
                    className="top-[548px] left-6 w-[200px]"
                    onOpen={inspect}
                    subtitle={String(config.memories.length)}
                  >
                    <div className="space-y-2">
                      {config.memories.map((m, i) => (
                        <p
                          key={i}
                          className={cn(cardText, "flex items-center gap-2")}
                        >
                          <span className="bg-muted-foreground/50 size-1 shrink-0 rounded-full" />
                          <span className="truncate">{m.name}</span>
                        </p>
                      ))}
                      {!config.memories.length && (
                        <p className="text-muted-foreground text-[11px]">
                          Attach persistent context
                        </p>
                      )}
                    </div>
                  </CanvasNode>
                  <CanvasNode
                    id="agent"
                    className="top-[194px] left-[274px] w-[248px] border-emerald-500/35 shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-emerald-500)_5%,transparent)]"
                    onOpen={inspect}
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex size-7 items-center justify-center rounded-md bg-emerald-500/10 font-serif text-base text-emerald-700 dark:text-emerald-400">
                        N
                      </div>
                      <span className="text-[12px] font-semibold">
                        {config.name}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-[11px] leading-5">
                      {config.role}
                    </p>
                    <div className="my-3 border-t" />
                    <p className="mb-1.5 text-[10px] font-medium">
                      Instructions
                    </p>
                    <p className="text-muted-foreground line-clamp-5 text-[11px] leading-[19px]">
                      {config.instructions}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t pt-3 text-[10px]">
                      <span>{config.model}</span>
                      <span className="text-emerald-700 dark:text-emerald-400">
                        Edit agent →
                      </span>
                    </div>
                  </CanvasNode>
                  <CanvasNode
                    id="tools"
                    className="top-[76px] left-[572px] w-[204px]"
                    onOpen={inspect}
                    subtitle={String(config.tools.length)}
                  >
                    <div className="space-y-2">
                      {config.tools.map((t) => (
                        <p key={t} className={cn(cardText, "truncate")}>
                          {t}
                        </p>
                      ))}
                      {!config.tools.length && (
                        <p className="text-muted-foreground text-[11px]">
                          No tools attached
                        </p>
                      )}
                    </div>
                  </CanvasNode>
                  <CanvasNode
                    id="skills"
                    className="top-[294px] left-[572px] w-[204px]"
                    onOpen={inspect}
                    subtitle={String(config.skills.length)}
                  >
                    <div className="space-y-2">
                      {config.skills.map((s) => (
                        <p key={s} className={cardText}>
                          {s}
                        </p>
                      ))}
                      {!config.skills.length && (
                        <p className="text-muted-foreground text-[11px]">
                          No skills attached
                        </p>
                      )}
                    </div>
                  </CanvasNode>
                  <CanvasNode
                    id="delegation"
                    className="top-[505px] left-[572px] w-[204px]"
                    onOpen={inspect}
                    subtitle={String(config.agents.length)}
                  >
                    <div className="space-y-2">
                      {config.agents.map((a) => (
                        <p
                          key={a}
                          className={cn(cardText, "flex items-center gap-2")}
                        >
                          <span className="size-1.5 rounded-full bg-emerald-500/60" />
                          {a}
                        </p>
                      ))}
                      {!config.agents.length && (
                        <p className="text-muted-foreground text-[11px]">
                          Agent works independently
                        </p>
                      )}
                    </div>
                  </CanvasNode>
                </div>
              </div>
            </div>
            <div className="bg-background absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center rounded-lg border p-1 shadow-sm">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Zoom out"
                disabled={zoom <= 0.6}
                onClick={() =>
                  setZoom((z) => Math.max(0.6, +(z - 0.1).toFixed(1)))
                }
              >
                <Minus className="size-3.5" />
              </Button>
              <button
                className="min-w-14 text-xs tabular-nums"
                aria-label="Reset zoom"
                onClick={() => setZoom(0.9)}
              >
                {Math.round(zoom * 100)}%
              </button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Zoom in"
                disabled={zoom >= 1.2}
                onClick={() =>
                  setZoom((z) => Math.min(1.2, +(z + 0.1).toFixed(1)))
                }
              >
                <Plus className="size-3.5" />
              </Button>
            </div>
          </section>
          {showRun && (
            <aside
              aria-label="Test conversation"
              className={cn(
                "bg-background flex w-full shrink-0 flex-col border-l lg:w-[292px]",
                mobileRun ? "flex" : "hidden lg:flex",
              )}
            >
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h2 className="text-xs font-medium">Test conversation</h2>
                <span className="text-muted-foreground text-[10px]">
                  Sample run
                </span>
              </div>
              <div
                className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-5 text-xs leading-6"
                aria-live="polite"
              >
                <div className="bg-muted/50 rounded-lg border px-3 py-2.5">
                  Review customer signals from the past seven days.
                </div>
                <div>
                  <div className="mb-2 flex items-center gap-2 text-[10px] text-emerald-700 dark:text-emerald-400">
                    <span
                      className={cn(
                        "size-1.5 rounded-full bg-emerald-500",
                        running && "animate-pulse",
                      )}
                    />
                    {running
                      ? "Working on your brief"
                      : phase === 0
                        ? "Run stopped"
                        : "Run complete"}
                  </div>
                  <p>
                    I’ll review the latest feedback, check it against our
                    product priorities, and prepare a brief with links to the
                    evidence.
                  </p>
                </div>
                {hasRun && phase >= 1 && (
                  <div className="space-y-2">
                    <p className="text-muted-foreground text-[10px] font-medium tracking-wide">
                      CONTEXT
                    </p>
                    <div className="space-y-1.5">
                      {runConfig.memories.length ? (
                        runConfig.memories.map((m) => (
                          <div
                            key={m.name}
                            className="flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-[11px]"
                          >
                            <Database className="text-muted-foreground size-3" />
                            {m.name}
                            <Check className="ml-auto size-3 text-emerald-600" />
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">
                          No persistent memories attached.
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {phase >= 2 && (
                  <div className="space-y-2">
                    <p className="text-muted-foreground text-[10px] font-medium tracking-wide">
                      READING SOURCES
                    </p>
                    {runConfig.tools.map((t) => (
                      <div
                        key={t}
                        className="flex items-center gap-2 text-[11px]"
                      >
                        <Check className="size-3 text-emerald-600" />
                        {t}
                      </div>
                    ))}
                    {!runConfig.tools.length && (
                      <p className="text-muted-foreground">
                        No external tools selected. This run uses attached
                        memory only.
                      </p>
                    )}
                  </div>
                )}
                {phase >= 3 && (
                  <div className="flex flex-wrap gap-1.5">
                    {runConfig.agents.map((a) => (
                      <span
                        key={a}
                        className="bg-muted/40 rounded-md border px-2 py-1 text-[10px]"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                )}
                {phase === 4 && (
                  <div className="space-y-3">
                    <p className="font-medium">
                      Three themes worth a closer look
                    </p>
                    {[
                      "Invite flows need clearer role descriptions.",
                      "Teams want a single place for handoff decisions.",
                      "Export status needs to be easier to find.",
                    ].map((text, i) => (
                      <div key={text} className="flex gap-2">
                        <span className="text-muted-foreground">{i + 1}.</span>
                        <p>{text}</p>
                      </div>
                    ))}
                    <div className="rounded-lg border border-emerald-600/20 bg-emerald-500/5 p-3 text-[11px]">
                      <p className="font-medium">
                        {runConfig.approval
                          ? "Ready for your review"
                          : "Demo delivery prepared"}
                      </p>
                      <p className="text-muted-foreground mt-1">
                        {runConfig.channel} ·{" "}
                        {runConfig.destination || "No destination selected"}
                      </p>
                      <p className="text-muted-foreground mt-1">
                        Sample output only. Nothing has been sent.
                      </p>
                    </div>
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} className="space-y-3">
                    <div className="bg-muted/50 rounded-lg p-3">{m}</div>
                    <p className="text-muted-foreground">
                      Added to the review notes for this sample brief. Start
                      another test run to preview the configured workflow.
                    </p>
                  </div>
                ))}
              </div>
              <div className="space-y-2 border-t p-3">
                <div className="text-muted-foreground flex items-center justify-between text-[10px]">
                  <span>{runConfig.model}</span>
                  <span>{running ? "Running…" : "Demo · 1.8k tokens"}</span>
                </div>
                <form
                  className="rounded-lg border p-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (followUp.trim()) {
                      setMessages((m) => [...m, followUp.trim()]);
                      setFollowUp("");
                    }
                  }}
                >
                  <Textarea
                    aria-label="Follow-up notes"
                    placeholder="Add a review note…"
                    value={followUp}
                    onChange={(e) => setFollowUp(e.target.value)}
                    className="min-h-12 resize-none border-0 p-1 text-xs shadow-none focus-visible:ring-0"
                  />
                  <div className="flex justify-end">
                    {running ? (
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="secondary"
                        aria-label="Stop test run"
                        onClick={() => {
                          if (timer.current) clearInterval(timer.current);
                          setPhase(0);
                        }}
                      >
                        <Square className="size-3" />
                      </Button>
                    ) : (
                      <Button
                        size="icon-sm"
                        type="submit"
                        disabled={!followUp.trim()}
                        aria-label="Add review note"
                      >
                        <ArrowUp className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </form>
              </div>
            </aside>
          )}
        </div>
      </div>
      <Sheet
        open={!!node}
        onOpenChange={(open) => {
          if (!open) setNode(null);
        }}
      >
        <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-[460px]">
          <SheetHeader className="shrink-0 border-b px-5 py-5 pr-10 text-left">
            <SheetTitle>{node ? labels[node].title : ""}</SheetTitle>
            <SheetDescription>
              {node ? labels[node].description : ""}
            </SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-3">
            {node === "agent" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="agent-name">Agent name</Label>
                  <Input
                    id="agent-name"
                    value={draft.name}
                    onChange={(e) => patch({ name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agent-role">Purpose</Label>
                  <Input
                    id="agent-role"
                    value={draft.role}
                    onChange={(e) => patch({ role: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agent-model">Model</Label>
                  <Select
                    value={draft.model}
                    onValueChange={(value) => patch({ model: value })}
                  >
                    <SelectTrigger id="agent-model" className="h-10 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["GPT-4.1", "Claude Sonnet 4", "Gemini 2.5 Flash"].map(
                        (option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agent-instructions">Instructions</Label>
                  <Textarea
                    id="agent-instructions"
                    className="min-h-52 leading-6"
                    value={draft.instructions}
                    onChange={(e) => patch({ instructions: e.target.value })}
                  />
                </div>
              </>
            )}
            {node === "schedule" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="frequency">Repeat</Label>
                  <Select
                    value={draft.frequency}
                    onValueChange={(value) => patch({ frequency: value })}
                  >
                    <SelectTrigger id="frequency" className="h-10 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Every Monday",
                        "Every weekday",
                        "Every day",
                        "Manual only",
                      ].map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="run-time">Time (UTC)</Label>
                  <Input
                    id="run-time"
                    type="time"
                    disabled={draft.frequency === "Manual only"}
                    value={draft.time}
                    onChange={(e) => patch({ time: e.target.value })}
                  />
                </div>
                <p className="text-muted-foreground bg-muted/30 rounded-lg border p-3 text-xs leading-5">
                  This schedule configures the demo. No background job will be
                  created.
                </p>
              </>
            )}
            {node === "triggers" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="trigger-event">Event</Label>
                  <Select
                    value={draft.trigger}
                    onValueChange={(value) => patch({ trigger: value })}
                  >
                    <SelectTrigger id="trigger-event" className="h-10 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "New support conversation",
                        "Issue updated",
                        "Document added",
                        "Manual trigger",
                      ].map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-filter">Only when</Label>
                  <Input
                    id="event-filter"
                    value={draft.filter}
                    onChange={(e) => patch({ filter: e.target.value })}
                    placeholder="priority = high"
                  />
                </div>
                <p className="text-muted-foreground text-xs">
                  Example condition stored with the agent; no live webhook is
                  registered.
                </p>
              </>
            )}
            {node === "channels" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="delivery-channel">Delivery channel</Label>
                  <Select
                    value={draft.channel}
                    onValueChange={(value) =>
                      patch({
                        channel: value,
                        destination:
                          value === "Slack"
                            ? "#customer-insights"
                            : value === "Email"
                              ? "team@example.com"
                              : "Review queue",
                      })
                    }
                  >
                    <SelectTrigger
                      id="delivery-channel"
                      className="h-10 w-full"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Slack", "Email", "Workspace inbox"].map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery-destination">Destination</Label>
                  <Input
                    id="delivery-destination"
                    value={draft.destination}
                    onChange={(e) => patch({ destination: e.target.value })}
                  />
                </div>
                <label className="flex items-start gap-3 rounded-lg border p-4">
                  <Checkbox
                    checked={draft.approval}
                    onCheckedChange={(v) => patch({ approval: !!v })}
                  />
                  <span>
                    <span className="block text-sm font-medium">
                      Require approval
                    </span>
                    <span className="text-muted-foreground mt-1 block text-xs">
                      Review the output before it leaves the workspace.
                    </span>
                  </span>
                </label>
                <div className="bg-muted/30 rounded-lg border p-4 text-xs leading-5">
                  <ShieldCheck className="mb-2 size-4 text-emerald-600" />
                  Agent identity: {draft.name}
                  <p className="text-muted-foreground mt-1">
                    Delivery is simulated. No messages are sent.
                  </p>
                </div>
              </>
            )}
            {node === "memory" && (
              <>
                <p className="text-muted-foreground text-xs leading-5">
                  Attached context is available at the beginning of each run.
                  Keep facts concise and attributable.
                </p>
                {draft.memories.map((m, i) => (
                  <div key={i} className="space-y-3 rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`memory-name-${i}`}>Memory {i + 1}</Label>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        aria-label={`Remove memory ${i + 1}`}
                        onClick={() =>
                          patch({
                            memories: draft.memories.filter((_, j) => j !== i),
                          })
                        }
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                    <Input
                      id={`memory-name-${i}`}
                      aria-label={`Memory ${i + 1} name`}
                      value={m.name}
                      onChange={(e) =>
                        patch({
                          memories: draft.memories.map((v, j) =>
                            j === i ? { ...v, name: e.target.value } : v,
                          ),
                        })
                      }
                    />
                    <Textarea
                      aria-label={`Memory ${i + 1} content`}
                      className="min-h-32 text-xs leading-5"
                      value={m.content}
                      onChange={(e) =>
                        patch({
                          memories: draft.memories.map((v, j) =>
                            j === i ? { ...v, content: e.target.value } : v,
                          ),
                        })
                      }
                    />
                    <p className="text-muted-foreground text-[10px]">
                      Source: workspace note · Visible to this agent
                    </p>
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  disabled={draft.memories.length >= 4}
                  onClick={() =>
                    patch({
                      memories: [
                        ...draft.memories,
                        { name: "New memory", content: "" },
                      ],
                    })
                  }
                >
                  <Plus className="size-3.5" />
                  Add memory
                </Button>
              </>
            )}
            {(node === "tools" ||
              node === "skills" ||
              node === "delegation") && (
              <div className="space-y-2">
                {(node === "tools"
                  ? toolOptions
                  : node === "skills"
                    ? skillOptions
                    : delegateOptions
                ).map((item) => {
                  const key = node === "delegation" ? "agents" : node;
                  return (
                    <label
                      key={item}
                      className="flex items-center gap-3 rounded-lg border p-3 text-sm"
                    >
                      <Checkbox
                        checked={draft[key].includes(item)}
                        onCheckedChange={(v) =>
                          patch({
                            [key]: v
                              ? [...draft[key], item]
                              : draft[key].filter((t) => t !== item),
                          })
                        }
                      />
                      {item}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
          <div className="shrink-0 border-t p-4">
            <Button
              className="w-full"
              disabled={
                !draft.name.trim() ||
                !draft.instructions.trim() ||
                !draft.destination.trim() ||
                !draft.time ||
                draft.memories.some((m) => !m.name.trim() || !m.content.trim())
              }
              onClick={() => {
                setConfig(cloneConfig(draft));
                setNode(null);
              }}
            >
              Apply changes
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </StudioShell>
  );
}
