"use client";

import {
  Check,
  CircleGauge,
  FileCode2,
  ListTodo,
  LoaderCircle,
  LockKeyhole,
  Minimize2,
} from "lucide-react";
import * as React from "react";

import {
  AiChatComposer,
  AiChatComposerEditor,
  type AiChatComposerStatus,
  AiChatComposerSubmit,
  AiChatComposerToolbar,
  AiChatComposerToolbarGroup,
} from "@/components/ai-chat/ai-chat-composer";
import { AiChatAddContextAction } from "@/components/ai-chat/ai-chat-context-picker";
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
import { BrandMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type CompactionPhase = "ready" | "compacting" | "compacted";

interface PreservedItem {
  detail: string;
  icon: React.ElementType;
  label: string;
}

interface ContextSegment {
  color: string;
  label: string;
  percent: number;
  tokens: string;
}

const preservedItems: PreservedItem[] = [
  {
    icon: Check,
    label: "Decisions",
    detail: "3 approved implementation decisions",
  },
  {
    icon: FileCode2,
    label: "Files",
    detail: "4 active files and their latest changes",
  },
  {
    icon: LockKeyhole,
    label: "Constraints",
    detail: "No API changes; preserve guest checkout",
  },
  {
    icon: ListTodo,
    label: "Open task",
    detail: "Verify the keyboard fallback flow",
  },
];

const contextBreakdown: Record<"before" | "after", ContextSegment[]> = {
  before: [
    { color: "bg-slate-500", label: "System", percent: 9.8, tokens: "11.6k" },
    { color: "bg-blue-500", label: "User", percent: 15.6, tokens: "18.4k" },
    {
      color: "bg-violet-500",
      label: "Assistant",
      percent: 42,
      tokens: "49.7k",
    },
    { color: "bg-amber-500", label: "Tools", percent: 32.6, tokens: "38.5k" },
  ],
  after: [
    { color: "bg-slate-500", label: "System", percent: 26.8, tokens: "8.4k" },
    { color: "bg-blue-500", label: "User", percent: 16.6, tokens: "5.2k" },
    {
      color: "bg-violet-500",
      label: "Assistant",
      percent: 34.1,
      tokens: "10.7k",
    },
    { color: "bg-amber-500", label: "Tools", percent: 22.5, tokens: "7.1k" },
  ],
};

const requestMessage: AiChatMessageData = {
  id: "checkout-context-request",
  role: "user",
  parts: [
    {
      type: "text",
      text: "Continue the checkout migration. Add the keyboard fallback without losing the approved decisions or the files already in scope.",
    },
  ],
};

const pressureMessage: AiChatMessageData = {
  id: "checkout-context-pressure",
  role: "assistant",
  parts: [
    {
      type: "text",
      text: "The session is close to its context limit. I can compact the earlier turns into a working summary before changing the fallback flow.",
    },
  ],
};

const compactedMessage: AiChatMessageData = {
  id: "checkout-context-compacted",
  role: "assistant",
  parts: [
    {
      type: "text",
      text: "Context compacted. The approved checkout behavior, active files, constraints, and remaining keyboard task are preserved. We can continue from here without reloading the full session history.",
    },
  ],
};

function AssistantIdentity() {
  return (
    <div className="border-border flex size-8 items-center justify-center rounded-lg border">
      <BrandMark size="sm" />
    </div>
  );
}

function AssistantHeader() {
  return (
    <div className="mb-1 flex items-center gap-2">
      <span className="text-[13px] font-medium">Shadcnblocks AI</span>
      <span className="text-muted-foreground text-xs">Migration agent</span>
    </div>
  );
}

function ContextHeaderStatus({ phase }: { phase: CompactionPhase }) {
  const [open, setOpen] = React.useState(true);
  const compacted = phase === "compacted";
  const compacting = phase === "compacting";
  const segments = contextBreakdown[compacted ? "after" : "before"];
  const usage = compacted ? 25 : 92;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={compacting}
          className="flex h-8 gap-2 px-2 text-xs font-normal"
          aria-label="View context usage details"
        >
          {compacting ? (
            <LoaderCircle
              className="text-muted-foreground size-3.5 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          ) : (
            <CircleGauge
              className={cn(
                "size-3.5",
                compacted ? "text-emerald-600" : "text-amber-600",
              )}
              aria-hidden="true"
            />
          )}
          <span className="hidden font-medium sm:inline" aria-live="polite">
            {compacting
              ? "Compacting context"
              : compacted
                ? "31.4k / 128k"
                : "118.2k / 128k"}
          </span>
          {!compacting ? (
            <span
              className={cn(
                "font-medium tabular-nums",
                compacted ? "text-emerald-700" : "text-amber-700",
              )}
            >
              {compacted ? "25%" : "92%"}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={6}
        collisionPadding={12}
        className="w-72 p-3"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Context usage</p>
            <p className="text-muted-foreground mt-0.5 text-xs">
              GPT-5.6 Sol · 128k limit
            </p>
          </div>
          <span
            className={cn(
              "text-sm font-semibold tabular-nums",
              compacted ? "text-emerald-700" : "text-amber-700",
            )}
          >
            {compacted ? "25%" : "92%"}
          </span>
        </div>

        <div
          className="bg-muted mt-3 h-1.5 overflow-hidden rounded-full"
          aria-label={`${usage}% of the context window used`}
        >
          <div className="flex h-full" style={{ width: `${usage}%` }}>
            {segments.map((segment) => (
              <span
                key={segment.label}
                className={segment.color}
                style={{ width: `${segment.percent}%` }}
              />
            ))}
          </div>
        </div>

        <div className="mt-3 space-y-2">
          {segments.map((segment) => (
            <div
              key={segment.label}
              className="flex items-center gap-2 text-xs"
            >
              <span
                className={cn("size-1.5 shrink-0 rounded-full", segment.color)}
                aria-hidden="true"
              />
              <span className="text-muted-foreground">{segment.label}</span>
              <span className="ml-auto font-mono text-[11px] tabular-nums">
                {segment.tokens}
              </span>
              <span className="text-muted-foreground w-9 text-right font-mono text-[10px] tabular-nums">
                {segment.percent}%
              </span>
            </div>
          ))}
        </div>

        <div className="text-muted-foreground mt-3 flex items-center justify-between border-t pt-2.5 text-[11px]">
          <span>{compacted ? "96.6k available" : "9.8k remaining"}</span>
          <span>{compacted ? "38 messages summarized" : "38 messages"}</span>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function PreservedContextPopover({
  compacted,
  open,
  onCompact,
  onOpenChange,
}: {
  compacted: boolean;
  open: boolean;
  onCompact: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="sm">
          {compacted ? "View preserved" : "Review context"}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={6}
        collisionPadding={12}
        className="w-80 p-3"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <p className="text-sm font-medium">
          {compacted ? "Preserved context" : "Keep through compaction"}
        </p>
        <p className="text-muted-foreground mt-1 text-xs leading-5">
          These details remain available after earlier turns are summarized.
        </p>

        <div className="mt-3 divide-y">
          {preservedItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-start gap-2.5 py-2">
                <Icon
                  className="text-muted-foreground mt-0.5 size-3.5 shrink-0"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium">{item.label}</p>
                  <p className="text-muted-foreground mt-0.5 text-[11px] leading-4">
                    {item.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between gap-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-ml-2"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          {!compacted ? (
            <Button type="button" size="sm" onClick={onCompact}>
              <Minimize2 data-icon="inline-start" aria-hidden="true" />
              Compact now
            </Button>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ContextPressure({
  phase,
  previewOpen,
  onCompact,
  onPreviewOpenChange,
}: {
  phase: CompactionPhase;
  previewOpen: boolean;
  onCompact: () => void;
  onPreviewOpenChange: (open: boolean) => void;
}) {
  const compacted = phase === "compacted";
  const compacting = phase === "compacting";
  const usage = compacted ? 25 : 92;

  return (
    <div className="mx-1.5 overflow-hidden rounded-xl border">
      <div className="px-4 py-3.5">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg",
              compacted
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-400",
            )}
          >
            {compacting ? (
              <LoaderCircle
                className="size-3.5 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
            ) : compacted ? (
              <Check className="size-3.5" aria-hidden="true" />
            ) : (
              <CircleGauge className="size-3.5" aria-hidden="true" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[13px] font-medium">
                {compacting
                  ? "Compacting context"
                  : compacted
                    ? "Context compacted"
                    : "Context window nearly full"}
              </p>
              <span className="text-muted-foreground shrink-0 font-mono text-[11px] tabular-nums">
                {compacted ? "31.4k / 128k" : "118.2k / 128k"}
              </span>
            </div>
            <Progress
              value={usage}
              aria-label={`${usage}% of context window used`}
              className={cn(
                "bg-muted mt-2 h-1.5",
                compacted ? "[&>div]:bg-emerald-500" : "[&>div]:bg-amber-500",
              )}
            />
            <div className="text-muted-foreground mt-2 flex items-center justify-between gap-3 text-[11px]">
              <span>
                {compacted ? "96.6k tokens available" : "9.8k tokens remaining"}
              </span>
              <span>{compacted ? "75% headroom" : "Auto-compact at 96%"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-muted/20 flex min-h-11 items-center justify-between gap-3 border-t px-3 py-1.5">
        <span className="text-muted-foreground hidden text-[11px] sm:block">
          {compacted
            ? "4 memory groups preserved"
            : "Review exactly what will remain"}
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <PreservedContextPopover
            compacted={compacted}
            open={previewOpen}
            onCompact={onCompact}
            onOpenChange={onPreviewOpenChange}
          />
          {!compacted ? (
            <Button
              type="button"
              size="sm"
              disabled={compacting}
              onClick={onCompact}
            >
              {compacting ? (
                <LoaderCircle
                  data-icon="inline-start"
                  className="animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
              ) : (
                <Minimize2 data-icon="inline-start" aria-hidden="true" />
              )}
              {compacting ? "Compacting" : "Compact now"}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function CompactionBoundary() {
  return (
    <div className="text-muted-foreground ml-10 flex items-center gap-2 py-1 text-xs sm:ml-11">
      <Minimize2 className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="text-foreground font-medium">Context compacted</span>
      <span aria-hidden="true">·</span>
      <span className="font-mono text-[11px]">118.2k → 31.4k</span>
      <span className="ml-1 hidden text-[11px] sm:inline">Just now</span>
    </div>
  );
}

function PreservedSummary() {
  return (
    <div className="flex flex-wrap gap-1.5 px-1.5">
      {["3 decisions", "4 files", "2 constraints", "1 open task"].map(
        (item) => (
          <span
            key={item}
            className="bg-muted text-muted-foreground rounded-md px-2 py-1 text-[11px]"
          >
            {item}
          </span>
        ),
      )}
    </div>
  );
}

export function AiChatConversation20Screen() {
  const [phase, setPhase] = React.useState<CompactionPhase>("ready");
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [model, setModel] = React.useState(defaultAiModelId);
  const [prompt, setPrompt] = React.useState("");
  const [followUp, setFollowUp] = React.useState<string | null>(null);
  const timerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  function compactContext() {
    if (phase !== "ready") return;
    setPreviewOpen(false);
    setPhase("compacting");
    timerRef.current = window.setTimeout(() => {
      setPhase("compacted");
      timerRef.current = null;
    }, 900);
  }

  const composerStatus: AiChatComposerStatus =
    phase === "compacting" ? "submitted" : "ready";

  return (
    <AiConversationShell
      activeRecent="Compact checkout migration context"
      headerTitle="Checkout migration"
      headerActions={<ContextHeaderStatus phase={phase} />}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <h1 className="sr-only">Context compaction and continuation</h1>

        <AiConversationScroller
          showScrollButton={false}
          contentClassName="pb-6"
        >
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-7 sm:px-6">
            <AiChatMessage message={requestMessage} />
            <AiChatMessage
              message={pressureMessage}
              assistantAvatar={<AssistantIdentity />}
              assistantHeader={<AssistantHeader />}
              actions={
                <ContextPressure
                  phase={phase}
                  previewOpen={previewOpen}
                  onCompact={compactContext}
                  onPreviewOpenChange={setPreviewOpen}
                />
              }
            />

            {phase === "compacted" ? (
              <>
                <CompactionBoundary />
                <AiChatMessage
                  message={compactedMessage}
                  assistantAvatar={<AssistantIdentity />}
                  assistantHeader={<AssistantHeader />}
                  actions={<PreservedSummary />}
                />
              </>
            ) : null}

            {followUp ? (
              <>
                <AiChatMessage
                  message={{
                    id: "compacted-follow-up",
                    role: "user",
                    parts: [{ type: "text", text: followUp }],
                  }}
                />
                <AiChatMessage
                  message={{
                    id: "compacted-follow-up-response",
                    role: "assistant",
                    parts: [
                      {
                        type: "text",
                        text: "Continuing from the compacted context. The keyboard fallback remains the only open task, and the existing checkout constraints are still in scope.",
                      },
                    ],
                  }}
                  assistantAvatar={<AssistantIdentity />}
                  assistantHeader={<AssistantHeader />}
                />
              </>
            ) : null}
          </div>
        </AiConversationScroller>

        <div className="bg-background shrink-0 px-4 py-3 sm:px-6">
          <AiChatComposer
            aria-label="Continue compacted conversation"
            density="compact"
            className="max-w-3xl"
            onSubmit={(event) => {
              event.preventDefault();
              const value = prompt.trim();
              if (!value || phase === "compacting") return;
              setFollowUp(value);
              setPrompt("");
            }}
          >
            <AiChatComposerEditor
              value={prompt}
              disabled={phase === "compacting"}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder={
                phase === "compacting"
                  ? "Compacting earlier context..."
                  : phase === "compacted"
                    ? "Continue with preserved context..."
                    : "Continue or compact first..."
              }
              className="min-h-12"
            />
            <AiChatComposerToolbar>
              <AiChatComposerToolbarGroup>
                <AiChatAddContextAction />
                <span className="text-muted-foreground px-1.5 text-xs">
                  {phase === "compacted" ? "31.4k tokens" : "118.2k tokens"}
                </span>
              </AiChatComposerToolbarGroup>
              <AiChatComposerToolbarGroup className="shrink-0">
                <AiModelPicker
                  value={model}
                  disabled={phase === "compacting"}
                  onValueChange={setModel}
                />
                <AiChatComposerSubmit
                  status={composerStatus}
                  disabled={!prompt.trim() || phase === "compacting"}
                />
              </AiChatComposerToolbarGroup>
            </AiChatComposerToolbar>
          </AiChatComposer>
        </div>
      </div>
    </AiConversationShell>
  );
}
