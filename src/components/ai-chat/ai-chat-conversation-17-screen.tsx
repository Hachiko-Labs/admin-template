"use client";

import {
  Check,
  ChevronDown,
  Ellipsis,
  LoaderCircle,
  Plus,
  RefreshCw,
  Share2,
} from "lucide-react";
import * as React from "react";

import {
  AiChatComposer,
  AiChatComposerAction,
  AiChatComposerEditor,
  type AiChatComposerStatus,
  AiChatComposerSubmit,
  AiChatComposerToolbar,
  AiChatComposerToolbarGroup,
} from "@/components/ai-chat/ai-chat-composer";
import {
  AiChatMessage,
  type AiChatMessageData,
} from "@/components/ai-chat/ai-chat-message";
import { AiConversationScroller } from "@/components/ai-chat/ai-conversation-scroller";
import { AiConversationShell } from "@/components/ai-chat/ai-conversation-shell";
import {
  AiModelPicker,
  defaultAiModelId,
} from "@/components/ai-chat/ai-model-picker";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

type RunPhase = "complete" | "error" | "stopped" | "streaming" | "thinking";
type RunMode = "failure" | "success";

type LifecyclePartData =
  | { kind: "release-review" }
  | { kind: "run-stopped" }
  | { kind: "trace" };

const traceSteps = [
  {
    label: "Index component records",
    detail: "48 records",
  },
  {
    label: "Compare release labels",
    detail: "6 surfaces",
  },
  {
    label: "Check unresolved review notes",
    detail: "11 notes",
  },
  {
    label: "Prepare release actions",
    detail: "3 blockers",
  },
] as const;

const responseText =
  "Three components are holding the release: the data table lacks a documented mobile selection state, the audit drawer still uses a deprecated status token, and the command menu needs keyboard verification. I prepared a focused review below.";
const responseWords = responseText.split(" ");

const releaseItems = [
  {
    id: "table",
    title: "Data table",
    detail: "Document the compact bulk-selection state",
    owner: "Product systems",
  },
  {
    id: "drawer",
    title: "Audit drawer",
    detail: "Replace the deprecated status token",
    owner: "Design systems",
  },
  {
    id: "command",
    title: "Command menu",
    detail: "Verify Enter, Escape, and focus return",
    owner: "Interaction QA",
  },
] as const;

function PixelLoader() {
  const delays = [90, 180, 270, 0, 90, 180, 90, 180, 270];

  return (
    <span
      aria-hidden="true"
      className="grid shrink-0 grid-cols-[repeat(3,3px)] gap-[1.5px]"
    >
      {delays.map((delay, index) => (
        <span
          key={index}
          className="ai-pixel-cell bg-foreground size-[3px] rounded-[1px] opacity-15"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}

function LifecycleTrace({
  completedSteps,
  elapsed,
  expanded,
  phase,
  onExpandedChange,
}: {
  completedSteps: number;
  elapsed: number;
  expanded: boolean;
  phase: RunPhase;
  onExpandedChange: (expanded: boolean) => void;
}) {
  const working = phase === "thinking";
  const failed = phase === "error";
  const summary = working
    ? "Reviewing release evidence"
    : failed
      ? "Review interrupted"
      : `Reviewed ${traceSteps.length} steps`;

  return (
    <div className="w-full max-w-md px-1.5">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => onExpandedChange(!expanded)}
        className="hover:bg-muted -mx-1.5 flex h-8 items-center gap-2 rounded-lg px-1.5 text-left transition-colors"
      >
        {working ? (
          <PixelLoader />
        ) : (
          <span
            className={cn(
              "flex size-3.5 shrink-0 items-center justify-center rounded-full border",
              failed ? "border-destructive/40" : "border-foreground/25",
            )}
          >
            {failed ? (
              <span className="bg-destructive size-1 rounded-full" />
            ) : (
              <Check className="size-2.5" strokeWidth={2.4} />
            )}
          </span>
        )}
        <span className="text-[13px] font-medium">{summary}</span>
        <span className="text-muted-foreground font-mono text-[11px] tabular-nums">
          {elapsed.toFixed(1)}s
        </span>
        <ChevronDown
          className={cn(
            "text-muted-foreground size-3.5 transition-transform duration-200",
            expanded && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      <div
        className="grid transition-[grid-template-rows,opacity] duration-300"
        style={{
          gridTemplateRows: expanded ? "1fr" : "0fr",
          opacity: expanded ? 1 : 0,
        }}
      >
        <div className="overflow-hidden">
          <div className="border-border mt-1 ml-[6px] space-y-0.5 border-l pl-4">
            {traceSteps.map((step, index) => {
              const complete = index < completedSteps;
              const active = working && index === completedSteps;
              const visible = complete || active;

              if (!visible) return null;

              return (
                <div
                  key={step.label}
                  className="ai-response-row-enter flex min-h-7 items-center gap-2 text-[12.5px]"
                >
                  {complete ? (
                    <Check
                      className="text-muted-foreground size-3.5 shrink-0"
                      strokeWidth={2.2}
                      aria-hidden="true"
                    />
                  ) : (
                    <LoaderCircle
                      className="text-muted-foreground size-3.5 shrink-0 animate-spin motion-reduce:animate-none"
                      aria-hidden="true"
                    />
                  )}
                  <span className="min-w-0 flex-1 truncate">{step.label}</span>
                  <span className="text-muted-foreground shrink-0 font-mono text-[10px]">
                    {step.detail}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReleaseReview() {
  const [reviewedIds, setReviewedIds] = React.useState<string[]>([]);

  return (
    <section className="ai-response-artifact-enter overflow-hidden rounded-xl border">
      <div className="flex items-center justify-between gap-4 border-b px-4 py-3">
        <div>
          <h2 className="text-[13px] font-medium">Release review</h2>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Resolve or assign each blocker before publishing.
          </p>
        </div>
        <span className="text-muted-foreground shrink-0 font-mono text-[11px] tabular-nums">
          {reviewedIds.length}/{releaseItems.length} reviewed
        </span>
      </div>

      <div className="divide-y">
        {releaseItems.map((item) => {
          const reviewed = reviewedIds.includes(item.id);

          return (
            <label
              key={item.id}
              className={cn(
                "hover:bg-muted/35 flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors",
                reviewed && "bg-muted/20",
              )}
            >
              <Checkbox
                checked={reviewed}
                onCheckedChange={() =>
                  setReviewedIds((current) =>
                    current.includes(item.id)
                      ? current.filter((id) => id !== item.id)
                      : [...current, item.id],
                  )
                }
                aria-label={`Mark ${item.title} reviewed`}
                className="mt-0.5 size-4 rounded-[4px]"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium">
                  {item.title}
                </span>
                <span className="text-muted-foreground mt-0.5 block text-xs leading-5">
                  {item.detail}
                </span>
              </span>
              <span className="text-muted-foreground hidden shrink-0 text-[11px] sm:block">
                {item.owner}
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
}

function StoppedNotice({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="bg-muted/35 flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm">
      <span>The response stopped. Your request is still available.</span>
      <Button type="button" variant="ghost" size="sm" onClick={onRetry}>
        <RefreshCw aria-hidden="true" />
        Retry
      </Button>
    </div>
  );
}

export function AiChatConversation17Screen() {
  const initialPrompt =
    "Audit the component inventory for release blockers. Show the review trace, then summarize what needs attention.";
  const [model, setModel] = React.useState(defaultAiModelId);
  const [prompt, setPrompt] = React.useState("");
  const [request, setRequest] = React.useState(initialPrompt);
  const [phase, setPhase] = React.useState<RunPhase>("thinking");
  const [mode, setMode] = React.useState<RunMode>("success");
  const [runKey, setRunKey] = React.useState(0);
  const [completedSteps, setCompletedSteps] = React.useState(0);
  const [streamedWordCount, setStreamedWordCount] = React.useState(0);
  const [traceExpanded, setTraceExpanded] = React.useState(true);
  const [elapsed, setElapsed] = React.useState(0);
  const startedAtRef = React.useRef(performance.now());

  const busy = phase === "thinking" || phase === "streaming";

  const startRun = React.useCallback(
    (nextMode: RunMode, nextRequest = request) => {
      startedAtRef.current = performance.now();
      setRequest(nextRequest);
      setMode(nextMode);
      setCompletedSteps(0);
      setStreamedWordCount(0);
      setTraceExpanded(true);
      setElapsed(0);
      setPhase("thinking");
      setRunKey((current) => current + 1);
    },
    [request],
  );

  React.useEffect(() => {
    if (phase !== "thinking") return;

    const stepTimers = [320, 760, 1210, 1700].map((delay, index) =>
      window.setTimeout(() => setCompletedSteps(index + 1), delay),
    );
    const resultTimer = window.setTimeout(
      () => {
        if (mode === "failure") {
          setCompletedSteps(2);
          setPhase("error");
          return;
        }

        setCompletedSteps(traceSteps.length);
        setTraceExpanded(false);
        setPhase("streaming");
      },
      mode === "failure" ? 1380 : 2050,
    );

    return () => {
      stepTimers.forEach(window.clearTimeout);
      window.clearTimeout(resultTimer);
    };
  }, [mode, phase, runKey]);

  React.useEffect(() => {
    if (phase !== "streaming") return;

    if (streamedWordCount >= responseWords.length) {
      const settleTimer = window.setTimeout(() => setPhase("complete"), 260);
      return () => window.clearTimeout(settleTimer);
    }

    const wordTimer = window.setTimeout(
      () => setStreamedWordCount((current) => current + 1),
      38,
    );
    return () => window.clearTimeout(wordTimer);
  }, [phase, streamedWordCount]);

  React.useEffect(() => {
    if (!busy) return;

    const updateElapsed = () =>
      setElapsed((performance.now() - startedAtRef.current) / 1000);
    updateElapsed();
    const timer = window.setInterval(updateElapsed, 100);
    return () => window.clearInterval(timer);
  }, [busy, runKey]);

  const streamedText = responseWords.slice(0, streamedWordCount).join(" ");
  const assistantParts: AiChatMessageData<LifecyclePartData>["parts"] = [
    {
      id: `trace-${runKey}`,
      name: "release-review-trace",
      type: "custom",
      data: { kind: "trace" },
    },
  ];

  if (streamedText) {
    assistantParts.push({ type: "text", text: streamedText });
  }
  if (phase === "complete") {
    assistantParts.push({
      id: `review-${runKey}`,
      name: "release-review",
      type: "custom",
      data: { kind: "release-review" },
    });
  }
  if (phase === "stopped") {
    assistantParts.push({
      id: `stopped-${runKey}`,
      name: "run-stopped",
      type: "custom",
      data: { kind: "run-stopped" },
    });
  }

  const userMessage: AiChatMessageData = {
    id: `request-${runKey}`,
    role: "user",
    parts: [{ type: "text", text: request }],
  };
  const assistantMessage: AiChatMessageData<LifecyclePartData> = {
    id: `response-${runKey}`,
    role: "assistant",
    parts: assistantParts,
  };
  const composerStatus: AiChatComposerStatus =
    phase === "thinking"
      ? "submitted"
      : phase === "streaming"
        ? "streaming"
        : "ready";

  return (
    <AiConversationShell
      activeRecent="Review release blockers"
      headerTitle="Response lifecycle"
      headerActions={
        <>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="hidden h-8 text-xs sm:flex"
          >
            <Share2 aria-hidden="true" />
            Share
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="More actions">
            <Ellipsis aria-hidden="true" />
          </Button>
        </>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <h1 className="sr-only">Response lifecycle</h1>
        <AiConversationScroller showScrollButton={false}>
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:px-6 md:py-10">
            <AiChatMessage message={userMessage} />
            <AiChatMessage
              key={assistantMessage.id}
              message={assistantMessage}
              status={phase === "error" ? "error" : "ready"}
              error="The review service stopped before the evidence set was complete."
              onRetry={() => startRun("success")}
              assistantHeader={
                <div className="mb-1 flex items-center gap-2 px-1.5">
                  <span className="text-[13px] font-medium">
                    Release reviewer
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {busy
                      ? "Working"
                      : phase === "complete"
                        ? "Complete"
                        : "Paused"}
                  </span>
                </div>
              }
              actions={
                phase === "complete" ? (
                  <div className="mt-1 flex flex-wrap items-center justify-between gap-2 px-1.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => startRun("success")}
                    >
                      <RefreshCw aria-hidden="true" />
                      Replay sequence
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground h-8 text-xs"
                      onClick={() => startRun("failure")}
                    >
                      Test interrupted run
                    </Button>
                  </div>
                ) : null
              }
              renderPart={({ part }) => {
                if (part.type !== "custom") return undefined;
                if (part.data.kind === "trace") {
                  return (
                    <LifecycleTrace
                      completedSteps={completedSteps}
                      elapsed={elapsed}
                      expanded={traceExpanded}
                      phase={phase}
                      onExpandedChange={setTraceExpanded}
                    />
                  );
                }
                if (part.data.kind === "release-review") {
                  return <ReleaseReview />;
                }
                if (part.data.kind === "run-stopped") {
                  return <StoppedNotice onRetry={() => startRun("success")} />;
                }
                return undefined;
              }}
            />
          </div>
        </AiConversationScroller>

        <div className="bg-background shrink-0 px-4 pt-3 pb-4 sm:px-6">
          <AiChatComposer
            aria-label="Continue release review conversation"
            onSubmit={(event) => {
              event.preventDefault();
              const value = prompt.trim();
              if (!value) return;
              setPrompt("");
              startRun("success", value);
            }}
          >
            <AiChatComposerEditor
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Ask for another review or change the scope…"
              className="min-h-16"
            />
            <AiChatComposerToolbar>
              <AiChatComposerToolbarGroup>
                <AiChatComposerAction label="Add review context">
                  <Plus aria-hidden="true" />
                </AiChatComposerAction>
              </AiChatComposerToolbarGroup>
              <AiChatComposerToolbarGroup className="shrink-0">
                <AiModelPicker value={model} onValueChange={setModel} />
                <AiChatComposerSubmit
                  status={composerStatus}
                  disabled={!prompt.trim()}
                  onStop={() => {
                    setTraceExpanded(false);
                    setPhase("stopped");
                  }}
                />
              </AiChatComposerToolbarGroup>
            </AiChatComposerToolbar>
          </AiChatComposer>
        </div>
      </div>
    </AiConversationShell>
  );
}
