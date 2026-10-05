"use client";

import {
  Bookmark,
  GitBranch,
  GitFork,
  Redo2,
  RotateCcw,
  Undo2,
} from "lucide-react";
import * as React from "react";

import {
  AiChatComposer,
  AiChatComposerEditor,
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
import { useMockChat } from "@/components/ai-chat/use-mock-chat";
import { BrandMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type CheckpointId = "plan-approved" | "retry-baseline";
type BranchId = "main" | "plan-recovery" | "retry-recovery";

interface SessionCheckpoint {
  id: CheckpointId;
  label: string;
  time: string;
}

interface SessionSnapshot {
  branch: BranchId;
  cutoff: CheckpointId | null;
}

interface RecoveryState {
  current: SessionSnapshot;
  future: SessionSnapshot[];
  past: SessionSnapshot[];
  preview: CheckpointId | null;
}

type RecoveryAction =
  | { type: "cancel-preview" }
  | { type: "fork"; checkpoint: CheckpointId }
  | { type: "preview"; checkpoint: CheckpointId }
  | { type: "redo" }
  | { type: "restore"; checkpoint: CheckpointId }
  | { type: "undo" };

type TimelineEntry =
  | { id: string; type: "checkpoint"; checkpoint: CheckpointId }
  | { id: string; type: "message"; message: AiChatMessageData };

const checkpoints: Record<CheckpointId, SessionCheckpoint> = {
  "plan-approved": {
    id: "plan-approved",
    label: "Plan approved",
    time: "10:18 AM",
  },
  "retry-baseline": {
    id: "retry-baseline",
    label: "Verified idempotency fix",
    time: "10:31 AM",
  },
};

const timeline: TimelineEntry[] = [
  {
    id: "request",
    type: "message",
    message: {
      id: "recovery-request",
      role: "user",
      parts: [
        {
          type: "text",
          text: "Trace the duplicate invoice deliveries, fix the idempotency gap, and keep recovery points before changing retry behavior.",
        },
      ],
    },
  },
  {
    id: "plan",
    type: "message",
    message: {
      id: "recovery-plan",
      role: "assistant",
      parts: [
        {
          type: "text",
          text: "The duplicate path is isolated to the retry handler and event ledger. I can fix it without touching the retry window.",
        },
      ],
    },
  },
  {
    id: "checkpoint-plan",
    type: "checkpoint",
    checkpoint: "plan-approved",
  },
  {
    id: "approval",
    type: "message",
    message: {
      id: "implementation-approval",
      role: "user",
      parts: [
        {
          type: "text",
          text: "Proceed with the narrow fix. Leave the retry window alone.",
        },
      ],
    },
  },
  {
    id: "implementation",
    type: "message",
    message: {
      id: "idempotency-implementation",
      role: "assistant",
      parts: [
        {
          type: "text",
          text: "The handler now records each invoice event before acknowledging it. The focused replay passes for successful, duplicate, and delayed deliveries.",
        },
      ],
    },
  },
  {
    id: "checkpoint-retry",
    type: "checkpoint",
    checkpoint: "retry-baseline",
  },
  {
    id: "retry-request",
    type: "message",
    message: {
      id: "retry-window-request",
      role: "user",
      parts: [
        {
          type: "text",
          text: "Shorten the retry window and rerun the delayed fixture.",
        },
      ],
    },
  },
  {
    id: "retry-result",
    type: "message",
    message: {
      id: "retry-window-result",
      role: "assistant",
      parts: [
        {
          type: "text",
          text: "An 8-second window made the delayed fixture intermittent. The verified fix is still available at the recovery point above.",
        },
      ],
    },
  },
];

const initialSnapshot: SessionSnapshot = { branch: "main", cutoff: null };

const initialState: RecoveryState = {
  current: initialSnapshot,
  future: [],
  past: [],
  preview: "plan-approved",
};

const branchLabels: Record<BranchId, string> = {
  main: "main",
  "plan-recovery": "recovery/approved-plan",
  "retry-recovery": "recovery/verified-fix",
};

function checkpointIndex(checkpoint: CheckpointId) {
  return timeline.findIndex(
    (entry) => entry.type === "checkpoint" && entry.checkpoint === checkpoint,
  );
}

function affectedTurnCount(checkpoint: CheckpointId) {
  return timeline
    .slice(checkpointIndex(checkpoint) + 1)
    .filter((entry) => entry.type === "message").length;
}

function transition(
  state: RecoveryState,
  current: SessionSnapshot,
): RecoveryState {
  if (
    state.current.branch === current.branch &&
    state.current.cutoff === current.cutoff
  ) {
    return { ...state, preview: null };
  }

  return {
    current,
    past: [...state.past, state.current],
    future: [],
    preview: null,
  };
}

function recoveryReducer(
  state: RecoveryState,
  action: RecoveryAction,
): RecoveryState {
  switch (action.type) {
    case "preview":
      return { ...state, preview: action.checkpoint };
    case "cancel-preview":
      return { ...state, preview: null };
    case "restore":
      return transition(state, { branch: "main", cutoff: action.checkpoint });
    case "fork":
      return transition(state, {
        branch:
          action.checkpoint === "plan-approved"
            ? "plan-recovery"
            : "retry-recovery",
        cutoff: action.checkpoint,
      });
    case "undo": {
      const previous = state.past.at(-1);
      if (!previous) return state;
      return {
        current: previous,
        past: state.past.slice(0, -1),
        future: [state.current, ...state.future],
        preview: null,
      };
    }
    case "redo": {
      const next = state.future[0];
      if (!next) return state;
      return {
        current: next,
        past: [...state.past, state.current],
        future: state.future.slice(1),
        preview: null,
      };
    }
  }
}

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
      <span className="text-muted-foreground text-xs">Recovery agent</span>
    </div>
  );
}

function HeaderBranchStatus({ current }: { current: SessionSnapshot }) {
  const status =
    current.branch !== "main"
      ? "Fork active"
      : current.cutoff
        ? "Restored"
        : "Current";

  return (
    <div
      aria-label="Active branch status"
      className="hidden min-w-0 items-center gap-3 md:flex"
    >
      <span className="flex min-w-0 items-center gap-1.5 text-xs font-medium">
        <GitBranch
          className="text-muted-foreground size-3.5 shrink-0"
          aria-hidden="true"
        />
        <span className="max-w-44 truncate">
          {branchLabels[current.branch]}
        </span>
      </span>
      <span className="text-muted-foreground flex shrink-0 items-center gap-1.5 text-xs">
        <Bookmark className="size-3.5" aria-hidden="true" />2 checkpoints
      </span>
      <span className="flex shrink-0 items-center gap-1.5 text-xs">
        <span
          className={cn(
            "size-1.5 rounded-full",
            current.branch === "main" && !current.cutoff
              ? "bg-emerald-500"
              : "bg-amber-500",
          )}
        />
        {status}
      </span>
    </div>
  );
}

function CheckpointMarker({
  checkpoint,
  selected,
  onCancel,
  onFork,
  onPreview,
  onRestore,
}: {
  checkpoint: SessionCheckpoint;
  selected: boolean;
  onCancel: () => void;
  onFork: () => void;
  onPreview: () => void;
  onRestore: () => void;
}) {
  return (
    <Popover
      open={selected}
      onOpenChange={(open) => (open ? onPreview() : onCancel())}
    >
      <div className="ml-10 sm:ml-11">
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-pressed={selected}
            className={cn(
              "text-muted-foreground hover:text-foreground hover:bg-muted/60 inline-flex max-w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
              selected && "bg-muted/60 text-foreground",
            )}
          >
            <Bookmark className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="text-foreground truncate font-medium">
              {checkpoint.label}
            </span>
            <span aria-hidden="true">·</span>
            <span className="shrink-0">{checkpoint.time}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-80 p-3"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <p className="text-sm font-medium">Restore {checkpoint.label}?</p>
          <p className="text-muted-foreground mt-1 text-xs leading-5">
            {affectedTurnCount(checkpoint.id)} later turns leave the active
            branch. Nothing is deleted.
          </p>
          <div className="mt-4 flex items-center justify-between gap-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="-ml-2"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onFork}
              >
                <GitFork data-icon="inline-start" aria-hidden="true" />
                Fork
              </Button>
              <Button type="button" size="sm" onClick={onRestore}>
                <RotateCcw data-icon="inline-start" aria-hidden="true" />
                Restore
              </Button>
            </div>
          </div>
        </PopoverContent>
      </div>
    </Popover>
  );
}

function RecoveryBoundary({ snapshot }: { snapshot: SessionSnapshot }) {
  const checkpoint = snapshot.cutoff ? checkpoints[snapshot.cutoff] : null;
  if (!checkpoint) return null;

  const forked = snapshot.branch !== "main";
  return (
    <div className="text-muted-foreground ml-10 flex items-start gap-2 border-t border-dashed pt-3 text-xs sm:ml-11">
      {forked ? (
        <GitFork className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      ) : (
        <RotateCcw className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      )}
      <span>
        <span className="text-foreground font-medium">
          {forked ? "New branch" : "Restored"} at {checkpoint.label}.
        </span>{" "}
        Later turns are discarded when you restore or fork.
      </span>
    </div>
  );
}

export function AiChatConversation19Screen() {
  const [state, dispatch] = React.useReducer(recoveryReducer, initialState);
  const [model, setModel] = React.useState(defaultAiModelId);
  const [prompt, setPrompt] = React.useState("");
  const chat = useMockChat();
  const previewIndex = state.preview ? checkpointIndex(state.preview) : -1;
  const cutoffIndex = state.preview
    ? timeline.length - 1
    : state.current.cutoff
      ? checkpointIndex(state.current.cutoff)
      : timeline.length - 1;

  return (
    <AiConversationShell
      activeRecent="Recover billing retry session"
      headerTitle="Invoice retry investigation"
      headerCenter={
        <>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
            aria-label="Undo"
            disabled={state.past.length === 0}
            onClick={() => dispatch({ type: "undo" })}
          >
            <Undo2 aria-hidden="true" />
            <span className="hidden sm:inline">Undo</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
            aria-label="Redo"
            disabled={state.future.length === 0}
            onClick={() => dispatch({ type: "redo" })}
          >
            <Redo2 aria-hidden="true" />
            <span className="hidden sm:inline">Redo</span>
          </Button>
        </>
      }
      headerActions={<HeaderBranchStatus current={state.current} />}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <h1 className="sr-only">Invoice retry session recovery</h1>

        <AiConversationScroller
          showScrollButton={false}
          contentClassName="pb-6"
        >
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6 sm:gap-6 sm:px-6 sm:py-7">
            {timeline.map((entry, index) => {
              if (index > cutoffIndex) return null;
              const affected = previewIndex >= 0 && index > previewIndex;

              return (
                <React.Fragment key={entry.id}>
                  <div
                    className={cn(
                      "transition-opacity duration-200",
                      affected && "opacity-25",
                    )}
                  >
                    {entry.type === "checkpoint" ? (
                      <>
                        <CheckpointMarker
                          checkpoint={checkpoints[entry.checkpoint]}
                          selected={state.preview === entry.checkpoint}
                          onCancel={() => dispatch({ type: "cancel-preview" })}
                          onFork={() =>
                            dispatch({
                              type: "fork",
                              checkpoint: entry.checkpoint,
                            })
                          }
                          onPreview={() =>
                            dispatch({
                              type: "preview",
                              checkpoint: entry.checkpoint,
                            })
                          }
                          onRestore={() =>
                            dispatch({
                              type: "restore",
                              checkpoint: entry.checkpoint,
                            })
                          }
                        />
                      </>
                    ) : (
                      <AiChatMessage
                        message={entry.message}
                        assistantAvatar={
                          entry.message.role === "assistant" ? (
                            <AssistantIdentity />
                          ) : undefined
                        }
                        assistantHeader={
                          entry.message.role === "assistant" ? (
                            <AssistantHeader />
                          ) : undefined
                        }
                      />
                    )}
                  </div>
                </React.Fragment>
              );
            })}

            <RecoveryBoundary snapshot={state.current} />
          </div>
          <div className="mx-auto w-full max-w-3xl space-y-6 px-4 pb-6">
            {chat.messages.map((message) => (
              <AiChatMessage
                key={message.id}
                message={{
                  id: message.id,
                  role: message.role,
                  parts: [{ type: "text", text: message.text }],
                }}
              />
            ))}
          </div>
        </AiConversationScroller>

        <div className="bg-background shrink-0 px-4 py-3 sm:px-6">
          <AiChatComposer
            aria-label="Continue recovery conversation"
            density="compact"
            className="max-w-3xl"
            onSubmit={(event) => {
              event.preventDefault();
              if (chat.send(prompt)) setPrompt("");
            }}
          >
            <AiChatComposerEditor
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Continue from this point..."
              className="min-h-12"
            />
            <AiChatComposerToolbar>
              <AiChatComposerToolbarGroup>
                <AiChatAddContextAction />
                <span className="text-muted-foreground flex min-w-0 items-center gap-1.5 px-1.5 text-xs">
                  <GitBranch className="size-3.5 shrink-0" aria-hidden="true" />
                  <span className="max-w-40 truncate">
                    {branchLabels[state.current.branch]}
                  </span>
                </span>
              </AiChatComposerToolbarGroup>
              <AiChatComposerToolbarGroup className="shrink-0">
                <AiModelPicker value={model} onValueChange={setModel} />
                <AiChatComposerSubmit disabled={!prompt.trim()} />
              </AiChatComposerToolbarGroup>
            </AiChatComposerToolbar>
          </AiChatComposer>
        </div>
      </div>
    </AiConversationShell>
  );
}
