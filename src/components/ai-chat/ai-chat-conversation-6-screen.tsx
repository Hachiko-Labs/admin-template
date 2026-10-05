"use client";

import {
  ArrowDown,
  Copy,
  FileCode2,
  GitBranch,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  TerminalSquare,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { z } from "zod";

import {
  Commit,
  CommitContent,
  CommitHeader,
  CommitInfo,
  CommitMessage,
  CommitMetadata,
  CommitTrigger,
} from "@/components/ai-elements/commit";
import { ClaudeHeader } from "@/components/brainless/claude/claude-header";
import { ClaudeMessage } from "@/components/brainless/claude/claude-message";
import { ClaudePrompt } from "@/components/brainless/claude/claude-prompt";
import { ClaudeThinking } from "@/components/brainless/claude/claude-thinking";
import { ClaudeToolCall } from "@/components/brainless/claude/claude-tool-call";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import {
  AiChatComposer,
  AiChatComposerEditor,
  AiChatComposerSubmit,
  AiChatComposerToolbar,
  AiChatComposerToolbarGroup,
} from "./ai-chat-composer";
import { AiChatMessage, type AiChatMessageData } from "./ai-chat-message";
import {
  AiCodeArtifactPanel,
  type AiCodePanelMode,
} from "./ai-code-artifact-panel";
import { defaultAiDemoFile } from "./ai-coding-demo-data";
import { AiConversationScroller } from "./ai-conversation-scroller";
import { useReviewState } from "./ai-review-utils";
import {
  initialTerminalEntries,
  terminalBranch,
  type TerminalEntry,
  terminalFiles,
  terminalReply,
  terminalRepo,
  terminalRequest,
  terminalSummary,
} from "./ai-terminal-conversation-data";
import { AiWorkspaceShell } from "./ai-workspace-shell";

const entrySchema = z.object({
  kind: z.enum(["user", "message", "tool"]),
  text: z.string().max(6000),
  arg: z.string().max(1000).optional(),
  result: z.string().max(1000).optional(),
  output: z.string().max(6000).optional(),
});
const sessionSchema = z.object({
  turns: z
    .array(
      z.object({
        id: z.string(),
        prompt: z.string().max(2000),
        summary: z.string().max(6000),
        events: z.array(entrySchema).max(12),
        origin: z.enum(["chat", "terminal"]),
      }),
    )
    .max(10),
});
type Session = z.infer<typeof sessionSchema>;
const initialSession: Session = { turns: [] };
const validSession = (value: unknown): value is Session =>
  sessionSchema.safeParse(value).success;
type Pending = {
  id: string;
  prompt: string;
  summary: string;
  events: TerminalEntry[];
  visible: number;
  origin: "chat" | "terminal";
  replay: boolean;
};
const thinkingVerbs = ["Working"];
const message = (
  id: string,
  role: "user" | "assistant",
  text: string,
): AiChatMessageData => ({ id, role, parts: [{ type: "text", text }] });

function TerminalOutput({ entry }: { entry: TerminalEntry }) {
  if (entry.kind === "tool")
    return (
      <ClaudeToolCall
        tool={entry.text}
        arg={entry.arg}
        result={entry.result ?? ""}
      >
        {entry.output}
      </ClaudeToolCall>
    );
  return (
    <ClaudeMessage
      role={entry.kind === "user" ? "user" : "assistant"}
      className="whitespace-pre-wrap"
    >
      {entry.text}
    </ClaudeMessage>
  );
}

function IconButton({
  label,
  icon: Icon,
  ...props
}: { label: string; icon: React.ElementType } & React.ComponentProps<
  typeof Button
>) {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={label}
      title={label}
      {...props}
    >
      <Icon />
    </Button>
  );
}

export function AiChatConversation6Screen() {
  const {
    value: session,
    setValue: setSession,
    ready,
    storageError,
  } = useReviewState(
    "ai-terminal-revenue-conversation-v2",
    initialSession,
    validSession,
  );
  const [prompt, setPrompt] = React.useState("");
  const [terminalPrompt, setTerminalPrompt] = React.useState("");
  const [pane, setPane] = React.useState("terminal");
  const [rightTab, setRightTab] = React.useState("terminal");
  const [expanded, setExpanded] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState(defaultAiDemoFile);
  const [codeMode, setCodeMode] = React.useState<AiCodePanelMode>("diff");
  const [pending, setPending] = React.useState<Pending | null>(null);
  const [playing, setPlaying] = React.useState(false);
  const terminalViewport = React.useRef<HTMLDivElement>(null);
  const following = React.useRef(false);
  const [showLatest, setShowLatest] = React.useState(false);

  React.useEffect(() => {
    if (!playing || !pending) return;
    const timer = window.setTimeout(() => {
      if (pending.visible < pending.events.length)
        setPending((p) => (p ? { ...p, visible: p.visible + 1 } : p));
      else {
        if (!pending.replay)
          setSession((s) => ({
            turns: [
              ...s.turns,
              {
                id: pending.id,
                prompt: pending.prompt,
                summary: pending.summary,
                events: pending.events,
                origin: pending.origin,
              },
            ].slice(-10),
          }));
        setPending(null);
        setPlaying(false);
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [pending, playing, setSession]);

  const entries = pending?.replay
    ? pending.events.slice(0, pending.visible)
    : [
        ...initialTerminalEntries,
        ...session.turns.flatMap((t) => [
          { kind: "user" as const, text: t.prompt },
          ...t.events,
        ]),
        ...(pending
          ? [
              { kind: "user" as const, text: pending.prompt },
              ...pending.events.slice(0, pending.visible),
            ]
          : []),
      ];
  const entryCount = entries.length;
  React.useEffect(() => {
    const element = terminalViewport.current;
    if (!element || !following.current) return;
    element.scrollTop = element.scrollHeight;
  }, [entryCount]);

  function followLatest() {
    following.current = true;
    setShowLatest(false);
    const element = terminalViewport.current;
    if (element) element.scrollTop = element.scrollHeight;
  }
  function send(text: string, origin: "chat" | "terminal") {
    const cleaned = text.trim().slice(0, 2000);
    if (!cleaned || pending || !ready) return;
    const reply = terminalReply(cleaned);
    following.current = true;
    setPending({
      id:
        globalThis.crypto?.randomUUID?.() ??
        `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
      prompt: cleaned,
      ...reply,
      visible: 0,
      origin,
      replay: false,
    });
    setPlaying(true);
    setPrompt("");
    setTerminalPrompt("");
    setRightTab("terminal");
    setPane("terminal");
  }
  function replay() {
    if (pending) {
      setPlaying((value) => !value);
      return;
    }
    following.current = true;
    setPending({
      id: "replay",
      prompt: terminalRequest,
      summary: terminalSummary,
      events: entries,
      visible: 1,
      origin: "terminal",
      replay: true,
    });
    setPlaying(true);
    setRightTab("terminal");
    setPane("terminal");
  }
  function openDiff(path: string) {
    setSelectedFile(path);
    setCodeMode("diff");
    setRightTab("changes");
    setPane("terminal");
  }
  function reset() {
    const previous = session;
    setPlaying(false);
    setPending(null);
    setSession(initialSession);
    setPrompt("");
    setTerminalPrompt("");
    setRightTab("terminal");
    following.current = true;
    toast("Example restored", {
      action: { label: "Undo", onClick: () => setSession(previous) },
    });
  }
  async function copyTranscript() {
    try {
      await navigator.clipboard.writeText(
        entries
          .map((e) =>
            e.kind === "tool"
              ? `${e.text}(${e.arg ?? ""})\n${e.result ?? ""}\n${e.output ?? ""}`
              : `${e.kind === "user" ? "❯ " : ""}${e.text}`,
          )
          .join("\n\n"),
      );
      toast.success("Terminal transcript copied");
    } catch {
      toast.error("Could not access the clipboard");
    }
  }
  const assistantHeader = (
    <span className="text-muted-foreground mb-1 text-xs font-medium">
      Claude Code
    </span>
  );
  return (
    <AiWorkspaceShell
      hideNavigationSidebar
      headerTitle="Revenue overview · terminal review"
      headerActions={
        <>
          <Button variant="ghost" size="sm" onClick={replay} disabled={!ready}>
            {playing ? (
              <Pause data-icon="inline-start" />
            ) : (
              <Play data-icon="inline-start" />
            )}
            <span className="hidden sm:inline">
              {playing ? "Pause" : pending ? "Resume" : "Replay session"}
            </span>
            <span className="sr-only sm:hidden">
              {playing ? "Pause" : pending ? "Resume" : "Replay session"}
            </span>
          </Button>
          <IconButton
            label="Reset demo"
            icon={RotateCcw}
            onClick={reset}
            disabled={!ready}
          />
        </>
      }
    >
      <h1 className="sr-only">Conversation with a side terminal</h1>
      <Tabs
        value={pane}
        onValueChange={setPane}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div
          onKeyDown={(event) => {
            if (event.key === "Escape" && playing) {
              event.stopPropagation();
              setPlaying(false);
            }
          }}
          className="shrink-0 border-b px-3 py-1.5 lg:hidden"
        >
          <TabsList className="w-full" aria-label="Workspace pane">
            <TabsTrigger value="conversation" className="flex-1">
              Conversation
            </TabsTrigger>
            <TabsTrigger value="terminal" className="flex-1">
              Terminal workspace
            </TabsTrigger>
          </TabsList>
        </div>
        <div
          className={cn(
            "grid min-h-0 flex-1 grid-cols-1",
            expanded
              ? "lg:grid-cols-1"
              : "lg:grid-cols-[minmax(340px,0.85fr)_minmax(0,1.15fr)]",
          )}
        >
          <TabsContent
            forceMount
            value="conversation"
            className={cn(
              "m-0 flex min-h-0 min-w-0 flex-col data-[state=inactive]:hidden lg:border-r lg:data-[state=inactive]:flex",
              expanded && "lg:hidden lg:data-[state=inactive]:hidden",
            )}
          >
            <div className="text-muted-foreground flex h-10 shrink-0 items-center gap-2 border-b px-4 text-[11px]">
              <GitBranch className="size-3.5 shrink-0" />
              <span className="truncate">{terminalBranch}</span>
              <span className="ml-auto shrink-0">4 files changed</span>
            </div>
            <AiConversationScroller>
              <div className="mx-auto flex w-full max-w-2xl flex-col gap-7 px-5 py-6 xl:px-7">
                <AiChatMessage
                  message={message("revenue-request", "user", terminalRequest)}
                />
                <AiChatMessage
                  assistantHeader={assistantHeader}
                  message={message(
                    "revenue-response",
                    "assistant",
                    terminalSummary,
                  )}
                />
                <Commit>
                  <CommitHeader>
                    <CommitInfo>
                      <CommitMessage>Edited 4 files</CommitMessage>
                      <CommitMetadata>Revenue overview · +61 −6</CommitMetadata>
                    </CommitInfo>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDiff(defaultAiDemoFile)}
                    >
                      Review
                    </Button>
                    <CommitTrigger />
                  </CommitHeader>
                  <CommitContent>
                    <div className="divide-y border-t">
                      {terminalFiles.map((file) => (
                        <button
                          key={file.current.name}
                          className="hover:bg-muted focus-visible:ring-ring flex w-full items-center gap-2 px-3 py-3 text-left outline-none focus-visible:ring-2"
                          onClick={() => openDiff(file.current.name)}
                          aria-label={`Review ${file.current.name}`}
                        >
                          <FileCode2 className="text-muted-foreground size-4 shrink-0" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs">
                              {file.current.name.split("/").at(-1)}
                            </span>
                            <span className="text-muted-foreground block truncate text-[10px]">
                              {file.current.name
                                .split("/")
                                .slice(0, -1)
                                .join("/")}
                            </span>
                          </span>
                          <span className="text-muted-foreground font-mono text-[10px]">
                            {file.status === "added" ? "A" : "M"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </CommitContent>
                </Commit>
                <div className="flex flex-wrap gap-2">
                  {["Review the chart", "Explain the repo layout"].map(
                    (text) => (
                      <Button
                        key={text}
                        variant="outline"
                        size="sm"
                        disabled={!!pending || !ready}
                        onClick={() => send(text, "chat")}
                      >
                        {text}
                      </Button>
                    ),
                  )}
                </div>
                {session.turns.map((turn) => (
                  <React.Fragment key={turn.id}>
                    <AiChatMessage
                      message={message(`${turn.id}-user`, "user", turn.prompt)}
                    />
                    <AiChatMessage
                      assistantHeader={assistantHeader}
                      message={message(
                        `${turn.id}-answer`,
                        "assistant",
                        turn.summary,
                      )}
                    />
                  </React.Fragment>
                ))}
                {pending && !pending.replay && (
                  <>
                    <AiChatMessage
                      message={message(
                        `${pending.id}-pending`,
                        "user",
                        pending.prompt,
                      )}
                    />
                    <p role="status" className="text-muted-foreground text-xs">
                      {playing
                        ? "Following the repo context in the terminal…"
                        : "Session paused. Resume from the header."}
                    </p>
                  </>
                )}
              </div>
            </AiConversationScroller>
            <div className="shrink-0 px-4 pt-3 pb-3">
              <AiChatComposer
                onSubmit={(event) => {
                  event.preventDefault();
                  send(prompt, "chat");
                }}
                aria-label="Continue repository conversation"
              >
                <AiChatComposerEditor
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  maxLength={2000}
                  placeholder="Ask about the change or its checks…"
                  className="min-h-16"
                />
                <AiChatComposerToolbar>
                  <AiChatComposerToolbarGroup>
                    <FileCode2 className="text-muted-foreground ml-1 size-3.5" />
                    <span className="text-muted-foreground text-[11px]">
                      Repo context
                    </span>
                  </AiChatComposerToolbarGroup>
                  <AiChatComposerToolbarGroup>
                    <span className="text-muted-foreground mr-2 text-[11px]">
                      Claude Code
                    </span>
                    <AiChatComposerSubmit
                      disabled={!prompt.trim() || !!pending || !ready}
                    />
                  </AiChatComposerToolbarGroup>
                </AiChatComposerToolbar>
              </AiChatComposer>
              <div className="text-muted-foreground mt-2 flex items-center gap-2 text-[10px]">
                <GitBranch className="size-3" />
                <span className="truncate">{terminalRepo}</span>
                <span className="ml-auto shrink-0">Local demo</span>
              </div>
            </div>
          </TabsContent>
          <TabsContent
            forceMount
            value="terminal"
            className="m-0 flex min-h-0 min-w-0 flex-col data-[state=inactive]:hidden lg:data-[state=inactive]:flex"
          >
            <Tabs
              value={rightTab}
              onValueChange={setRightTab}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="flex h-10 shrink-0 items-center gap-2 border-b px-2">
                <TabsList className="h-8" aria-label="Terminal panel">
                  <TabsTrigger value="terminal" className="gap-1.5 text-xs">
                    <TerminalSquare className="size-3.5" />
                    Terminal
                  </TabsTrigger>
                  <TabsTrigger value="changes" className="gap-1.5 text-xs">
                    <FileCode2 className="size-3.5" />
                    Files <span className="text-muted-foreground">4</span>
                  </TabsTrigger>
                </TabsList>
                <span className="text-muted-foreground ml-auto hidden text-[10px] sm:block">
                  {terminalRepo}
                </span>
                <IconButton
                  label="Copy terminal transcript"
                  icon={Copy}
                  onClick={() => void copyTranscript()}
                  className="size-7"
                />
                <IconButton
                  label={expanded ? "Restore split view" : "Expand terminal"}
                  icon={expanded ? Minimize2 : Maximize2}
                  onClick={() => setExpanded((v) => !v)}
                  className="hidden size-7 lg:flex"
                />
              </div>
              <TabsContent
                forceMount
                value="terminal"
                className="relative m-0 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden"
                style={{ background: "#111111", color: "#c0caf5" }}
              >
                <div className="flex h-9 shrink-0 items-center gap-2 border-b border-white/10 px-4 font-mono text-[11px]">
                  <span style={{ color: "#cd694a" }}>✳</span>
                  <span>Claude Code</span>
                  <span className="ml-auto text-[#949494]">
                    {pending ? (playing ? "working" : "paused") : "ready"}
                  </span>
                </div>
                <div
                  ref={terminalViewport}
                  className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 [scrollbar-color:#444_transparent] xl:px-5"
                  aria-label="Terminal transcript"
                  tabIndex={0}
                  onScroll={(event) => {
                    const el = event.currentTarget;
                    const nearBottom =
                      el.scrollHeight - el.scrollTop - el.clientHeight < 80;
                    following.current = nearBottom;
                    setShowLatest(!nearBottom);
                  }}
                >
                  <div className="mb-7">
                    <ClaudeHeader
                      compact
                      version=""
                      model="Repository session · high effort"
                      cwd={`~/Developer/${terminalRepo}`}
                      className="rounded-none border-0 px-0"
                    />
                  </div>
                  <div className="flex flex-col gap-5">
                    {entries.map((entry, i) => (
                      <TerminalOutput
                        key={`${pending?.replay ? "replay" : "session"}-${i}`}
                        entry={entry}
                      />
                    ))}
                    {playing && (
                      <ClaudeThinking
                        key={pending?.id}
                        verbs={thinkingVerbs}
                        showTokens={false}
                      />
                    )}
                    {pending && !playing && (
                      <p className="font-mono text-xs text-[#949494]">
                        Paused · resume to continue this recorded sequence.
                      </p>
                    )}
                  </div>
                </div>
                {showLatest && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute right-4 bottom-32"
                    onClick={followLatest}
                  >
                    <ArrowDown data-icon="inline-start" />
                    Latest output
                  </Button>
                )}
                <div className="shrink-0 px-4 pt-3 pb-2 xl:px-5">
                  <ClaudePrompt
                    value={terminalPrompt}
                    onChange={(event) =>
                      setTerminalPrompt(event.target.value.slice(0, 2000))
                    }
                    ariaLabel="Terminal prompt"
                    placeholder="Ask about this repo · /help"
                    disabled={!!pending || !ready}
                    mode="accept-edits"
                    effort={false}
                    showShortcuts={false}
                    inputClassName="focus-visible:ring-1 focus-visible:ring-[#7dcfff]/60"
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" &&
                        !event.nativeEvent.isComposing
                      ) {
                        event.preventDefault();
                        send(terminalPrompt, "terminal");
                      }
                    }}
                  />
                  <p className="mt-2 border-t border-white/10 pt-2 font-mono text-[10px] text-[#949494]">
                    Scripted session · no model or shell connection
                  </p>
                </div>
              </TabsContent>
              <TabsContent
                value="changes"
                className="m-0 flex min-h-0 flex-1 flex-col"
              >
                <AiCodeArtifactPanel
                  mode={codeMode}
                  onClose={() => setRightTab("terminal")}
                  onModeChange={setCodeMode}
                  onSelectFile={setSelectedFile}
                  selectedFile={selectedFile}
                />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </div>
      </Tabs>
      {storageError && (
        <p role="status" className="border-t px-3 py-1 text-xs">
          {storageError}
        </p>
      )}
    </AiWorkspaceShell>
  );
}
