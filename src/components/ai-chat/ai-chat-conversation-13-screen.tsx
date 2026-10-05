"use client";

import {
  ArrowDown,
  ArrowUp,
  Check,
  Ellipsis,
  FileText,
  Pencil,
  Plus,
  Share2,
  X,
} from "lucide-react";
import * as React from "react";

import {
  AiChatComposer,
  AiChatComposerAction,
  AiChatComposerEditor,
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
import {
  Queue,
  QueueItem,
  QueueItemAction,
  QueueItemActions,
  QueueItemAttachment,
  QueueItemContent,
  QueueItemDescription,
  QueueItemIndicator,
  QueueList,
  QueueSection,
  QueueSectionContent,
  QueueSectionLabel,
  QueueSectionTrigger,
} from "@/components/ai-elements/queue";
import { BrandMark } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface QueuedRequest {
  attachment?: string;
  detail: string;
  id: string;
  text: string;
}

interface QueueDemoState {
  active: QueuedRequest | null;
  completedIds: string[];
  queue: QueuedRequest[];
  turns: QueuedRequest[];
}

type QueueDemoAction =
  | { entry: QueuedRequest; type: "add" }
  | { id?: string; type: "advance" }
  | { direction: "down" | "up"; id: string; type: "move" }
  | { id: string; type: "remove" };

type QueuePartData = {
  kind: "active-request";
  requestId: string;
};

const initialActiveRequest: QueuedRequest = {
  detail: "Desktop selection, loading, failure, and retry states",
  id: "review-interaction-states",
  text: "Finish the interaction review for the generated bulk actions.",
};

const initialQueue: QueuedRequest[] = [
  {
    attachment: "bulk-actions-mobile.png",
    detail: "Compare the compact toolbar against the approved desktop states",
    id: "review-mobile-states",
    text: "Review the mobile empty and selected states next.",
  },
  {
    detail: "Check Enter, Escape, and table selection shortcuts",
    id: "audit-keyboard",
    text: "Audit the keyboard flow for conflicts and missing focus states.",
  },
  {
    attachment: "release-notes.md",
    detail: "Summarize only the behavior that passed verification",
    id: "draft-release-note",
    text: "Draft a concise release note after the review is complete.",
  },
];

const initialState: QueueDemoState = {
  active: initialActiveRequest,
  completedIds: [],
  queue: initialQueue,
  turns: [],
};

function queueReducer(
  state: QueueDemoState,
  action: QueueDemoAction,
): QueueDemoState {
  if (action.type === "add") {
    if (!state.active) {
      return {
        ...state,
        active: action.entry,
        turns: [...state.turns, action.entry],
      };
    }

    return { ...state, queue: [...state.queue, action.entry] };
  }

  if (action.type === "remove") {
    return {
      ...state,
      queue: state.queue.filter((entry) => entry.id !== action.id),
    };
  }

  if (action.type === "move") {
    const index = state.queue.findIndex((entry) => entry.id === action.id);
    const nextIndex = action.direction === "up" ? index - 1 : index + 1;
    if (index < 0 || nextIndex < 0 || nextIndex >= state.queue.length) {
      return state;
    }

    const queue = [...state.queue];
    [queue[index], queue[nextIndex]] = [queue[nextIndex], queue[index]];
    return { ...state, queue };
  }

  const next = action.id
    ? state.queue.find((entry) => entry.id === action.id)
    : state.queue[0];
  const completedIds = state.active
    ? [...state.completedIds, state.active.id]
    : state.completedIds;

  if (!next) {
    return { ...state, active: null, completedIds };
  }

  return {
    active: next,
    completedIds,
    queue: state.queue.filter((entry) => entry.id !== next.id),
    turns: [...state.turns, next],
  };
}

const openingUserMessage: AiChatMessageData = {
  id: "queue-steering-request",
  role: "user",
  parts: [
    {
      type: "text",
      text: "Continue the final bulk-action review. I may add follow-ups while you work—keep them ordered without interrupting the current pass.",
    },
  ],
};

const openingAssistantMessage: AiChatMessageData<QueuePartData> = {
  id: "queue-steering-response",
  role: "assistant",
  parts: [
    {
      type: "text",
      text: "I’ll finish the current interaction review first. New instructions will stay in the queue attached to the composer, where you can reprioritize or edit them before they run.",
    },
    {
      type: "custom",
      id: "active-initial-request",
      name: "active-request",
      data: {
        kind: "active-request",
        requestId: initialActiveRequest.id,
      },
    },
  ],
};

function promotedUserMessage(request: QueuedRequest): AiChatMessageData {
  return {
    id: `promoted-user-${request.id}`,
    role: "user",
    parts: [{ type: "text", text: request.text }],
  };
}

function promotedAssistantMessage(
  request: QueuedRequest,
): AiChatMessageData<QueuePartData> {
  return {
    id: `promoted-assistant-${request.id}`,
    role: "assistant",
    parts: [
      {
        type: "text",
        text: "The previous request is complete. I preserved the remaining order and moved this instruction into the active slot.",
      },
      {
        type: "custom",
        id: `active-request-${request.id}`,
        name: "active-request",
        data: { kind: "active-request", requestId: request.id },
      },
    ],
  };
}

function ActiveRequestCard({
  completed,
  onAdvance,
  queuedCount,
  request,
}: {
  completed: boolean;
  onAdvance: () => void;
  queuedCount: number;
  request: QueuedRequest;
}) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="flex h-10 items-center gap-2 border-b px-3">
        <span className="text-muted-foreground text-[9px] font-medium tracking-wide uppercase">
          Current request
        </span>
        <Badge
          variant="secondary"
          className="ml-auto h-6 gap-1.5 rounded-md px-2 text-[10px] font-normal"
        >
          {completed ? (
            <Check className="size-3 text-emerald-600" aria-hidden="true" />
          ) : (
            <span className="size-1.5 animate-pulse rounded-full bg-blue-500 motion-reduce:animate-none" />
          )}
          {completed ? "Completed" : "Working"}
        </Badge>
      </div>
      <div className="px-3 py-3">
        <p className="text-[13px] font-medium">{request.text}</p>
        <p className="text-muted-foreground mt-1 text-[11px] leading-5">
          {request.detail}
        </p>
      </div>
      <div className="bg-muted/15 flex min-h-10 items-center gap-3 border-t px-3 py-2">
        <span className="text-muted-foreground text-[10px] tabular-nums">
          {completed
            ? "Evidence retained in this turn"
            : `${queuedCount} follow-up${queuedCount === 1 ? "" : "s"} waiting`}
        </span>
        {!completed ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-auto h-7 px-2.5 text-[10px] shadow-xs"
            onClick={onAdvance}
          >
            <Check aria-hidden="true" />
            Finish current
          </Button>
        ) : null}
      </div>
    </div>
  );
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
      <span className="text-muted-foreground text-xs">Task coordinator</span>
    </div>
  );
}

export function AiChatConversation13Screen() {
  const [model, setModel] = React.useState(defaultAiModelId);
  const [prompt, setPrompt] = React.useState("");
  const [state, dispatch] = React.useReducer(queueReducer, initialState);
  const editorRef = React.useRef<HTMLTextAreaElement | null>(null);
  const requests = [initialActiveRequest, ...state.turns];

  function addPrompt() {
    const text = prompt.trim();
    if (!text) return;

    dispatch({
      type: "add",
      entry: {
        detail: "Added from the conversation composer",
        id: `queued-${Date.now()}`,
        text,
      },
    });
    setPrompt("");
  }

  function editRequest(request: QueuedRequest) {
    setPrompt(request.text);
    dispatch({ id: request.id, type: "remove" });
    requestAnimationFrame(() => editorRef.current?.focus());
  }

  function renderActiveRequest(requestId: string) {
    const request = requests.find((entry) => entry.id === requestId);
    if (!request) return null;

    return (
      <ActiveRequestCard
        request={request}
        completed={state.completedIds.includes(request.id)}
        queuedCount={state.queue.length}
        onAdvance={() => dispatch({ type: "advance" })}
      />
    );
  }

  return (
    <AiConversationShell
      activeRecent="Queue product review follow-ups"
      headerTitle="Queued follow-ups and conversation steering"
      headerActions={
        <>
          <Button
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
        <h1 className="sr-only">Queued follow-ups and conversation steering</h1>
        <AiConversationScroller>
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:px-6 md:py-10">
            <AiChatMessage message={openingUserMessage} />
            <AiChatMessage
              message={openingAssistantMessage}
              assistantAvatar={<AssistantIdentity />}
              assistantHeader={<AssistantHeader />}
              renderPart={({ part }) => {
                if (
                  part.type === "custom" &&
                  part.data.kind === "active-request"
                ) {
                  return renderActiveRequest(part.data.requestId);
                }
                return undefined;
              }}
            />

            {state.turns.map((request) => (
              <React.Fragment key={request.id}>
                <AiChatMessage message={promotedUserMessage(request)} />
                <AiChatMessage
                  message={promotedAssistantMessage(request)}
                  assistantAvatar={<AssistantIdentity />}
                  assistantHeader={<AssistantHeader />}
                  renderPart={({ part }) => {
                    if (
                      part.type === "custom" &&
                      part.data.kind === "active-request"
                    ) {
                      return renderActiveRequest(part.data.requestId);
                    }
                    return undefined;
                  }}
                />
              </React.Fragment>
            ))}
          </div>
        </AiConversationScroller>

        <div className="bg-background shrink-0 px-4 pt-2 pb-4 sm:px-6">
          <div className="mx-auto w-full max-w-2xl">
            {state.queue.length ? (
              <Queue className="mb-2">
                <QueueSection>
                  <QueueSectionTrigger>
                    <QueueSectionLabel
                      label="Queued requests"
                      count={state.queue.length}
                    />
                  </QueueSectionTrigger>
                  <QueueSectionContent>
                    <QueueList>
                      {state.queue.map((request, index) => (
                        <QueueItem key={request.id}>
                          <QueueItemIndicator position={index + 1} />
                          <QueueItemContent>
                            <p>{request.text}</p>
                            <QueueItemDescription>
                              {request.detail}
                            </QueueItemDescription>
                            {request.attachment ? (
                              <QueueItemAttachment>
                                <FileText
                                  className="size-3"
                                  aria-hidden="true"
                                />
                                <span className="truncate">
                                  {request.attachment}
                                </span>
                              </QueueItemAttachment>
                            ) : null}
                          </QueueItemContent>
                          <QueueItemActions>
                            {index > 0 ? (
                              <QueueItemAction
                                aria-label={`Move ${request.text} up`}
                                title="Move up"
                                onClick={() =>
                                  dispatch({
                                    direction: "up",
                                    id: request.id,
                                    type: "move",
                                  })
                                }
                              >
                                <ArrowUp aria-hidden="true" />
                              </QueueItemAction>
                            ) : null}
                            {index < state.queue.length - 1 ? (
                              <QueueItemAction
                                aria-label={`Move ${request.text} down`}
                                title="Move down"
                                onClick={() =>
                                  dispatch({
                                    direction: "down",
                                    id: request.id,
                                    type: "move",
                                  })
                                }
                              >
                                <ArrowDown aria-hidden="true" />
                              </QueueItemAction>
                            ) : null}
                            <QueueItemAction
                              aria-label={`Edit ${request.text}`}
                              title="Edit in composer"
                              onClick={() => editRequest(request)}
                            >
                              <Pencil aria-hidden="true" />
                            </QueueItemAction>
                            <QueueItemAction
                              aria-label={`Remove ${request.text}`}
                              title="Remove"
                              onClick={() =>
                                dispatch({ id: request.id, type: "remove" })
                              }
                            >
                              <X aria-hidden="true" />
                            </QueueItemAction>
                          </QueueItemActions>
                        </QueueItem>
                      ))}
                    </QueueList>
                  </QueueSectionContent>
                </QueueSection>
              </Queue>
            ) : null}

            <AiChatComposer
              aria-label="Add a queued follow-up"
              className="max-w-none"
              onSubmit={(event) => {
                event.preventDefault();
                addPrompt();
              }}
            >
              <AiChatComposerEditor
                ref={editorRef}
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder={
                  state.active
                    ? "Add a follow-up without interrupting…"
                    : "Start another request…"
                }
                className="min-h-16"
              />
              <AiChatComposerToolbar>
                <AiChatComposerToolbarGroup>
                  <AiChatComposerAction label="Attach context">
                    <Plus aria-hidden="true" />
                  </AiChatComposerAction>
                  <span className="text-muted-foreground hidden text-[11px] sm:inline">
                    {state.active
                      ? "New messages join the queue"
                      : "Ready for another request"}
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
      </div>
    </AiConversationShell>
  );
}
