"use client";

import {
  Ellipsis,
  GitCommitHorizontal,
  MessageSquareText,
  Plus,
  RotateCcw,
  Share2,
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
  Commit,
  CommitActions,
  CommitContent,
  CommitCopyButton,
  CommitFile,
  CommitFileAdditions,
  CommitFileChanges,
  CommitFileDeletions,
  CommitFileIcon,
  CommitFileInfo,
  CommitFilePath,
  CommitFiles,
  CommitFileStatus,
  CommitHash,
  CommitHeader,
  CommitInfo,
  CommitMessage,
  CommitMetadata,
  CommitSeparator,
  CommitTimestamp,
  CommitTrigger,
  CommitVerifiedMark,
} from "@/components/ai-elements/commit";
import { BrandMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ReviewPhase = "committed" | "requesting-changes" | "review";

interface ReviewState {
  commitMessage: string;
  followUps: string[];
  phase: ReviewPhase;
  revisions: string[];
}

type ReviewAction =
  | { message: string; type: "set-message" }
  | { type: "request-changes" }
  | { text: string; type: "submit" }
  | { type: "commit" };

type ReviewPartData = {
  kind: "review-card";
  placement: "initial" | "revision";
};

interface ChangedFile {
  additions: number;
  deletions: number;
  path: string;
  status: "added" | "deleted" | "modified" | "renamed";
}

const commitHash = "86ae00d";

const changedFiles: ChangedFile[] = [
  {
    additions: 5,
    deletions: 0,
    path: "src/app/(ai)/ai-chat/conversation-13/page.tsx",
    status: "added",
  },
  {
    additions: 267,
    deletions: 0,
    path: "src/components/ai-elements/queue.tsx",
    status: "added",
  },
  {
    additions: 536,
    deletions: 0,
    path: "src/components/ai-chat/ai-chat-conversation-13-screen.tsx",
    status: "added",
  },
  {
    additions: 4,
    deletions: 0,
    path: "src/components/ai-chat/ai-workspace-shell.tsx",
    status: "modified",
  },
  {
    additions: 1,
    deletions: 0,
    path: "src/data/sidebar-data.tsx",
    status: "modified",
  },
];

const initialState: ReviewState = {
  commitMessage: "feat(ai-chat): add queued conversation steering",
  followUps: [],
  phase: "review",
  revisions: [],
};

function reviewReducer(state: ReviewState, action: ReviewAction): ReviewState {
  if (action.type === "set-message") {
    return { ...state, commitMessage: action.message };
  }

  if (action.type === "request-changes") {
    return { ...state, phase: "requesting-changes" };
  }

  if (action.type === "commit") {
    if (!state.commitMessage.trim() || state.phase === "requesting-changes") {
      return state;
    }
    return { ...state, phase: "committed" };
  }

  if (state.phase === "committed") {
    return { ...state, followUps: [...state.followUps, action.text] };
  }

  return {
    ...state,
    phase: "review",
    revisions: [...state.revisions, action.text],
  };
}

const openingUserMessage: AiChatMessageData = {
  id: "commit-review-request",
  role: "user",
  parts: [
    {
      type: "text",
      text: "The queued follow-ups are complete. Show me the final verified change set and let me review the commit before it is created.",
    },
  ],
};

const openingAssistantMessage: AiChatMessageData<ReviewPartData> = {
  id: "commit-review-response",
  role: "assistant",
  parts: [
    {
      type: "text",
      text: "The implementation stayed within the intended five-file boundary. The interaction checks, responsive overflow audit, TypeScript validation, and production build all pass.",
    },
    {
      type: "custom",
      id: "initial-commit-review",
      name: "commit-review",
      data: { kind: "review-card", placement: "initial" },
    },
  ],
};

function revisionUserMessage(note: string, index: number): AiChatMessageData {
  return {
    id: `commit-revision-user-${index}`,
    role: "user",
    parts: [{ type: "text", text: note }],
  };
}

function revisionAssistantMessage(
  note: string,
  index: number,
): AiChatMessageData<ReviewPartData> {
  return {
    id: `commit-revision-assistant-${index}`,
    role: "assistant",
    parts: [
      {
        type: "text",
        text: `I applied the requested revision without widening the change boundary: “${note}” The focused checks and production build still pass.`,
      },
      {
        type: "custom",
        id: `revision-commit-review-${index}`,
        name: "commit-review",
        data: { kind: "review-card", placement: "revision" },
      },
    ],
  };
}

function followUpUserMessage(text: string, index: number): AiChatMessageData {
  return {
    id: `commit-follow-up-user-${index}`,
    role: "user",
    parts: [{ type: "text", text }],
  };
}

function followUpAssistantMessage(index: number): AiChatMessageData {
  return {
    id: `commit-follow-up-assistant-${index}`,
    role: "assistant",
    parts: [
      {
        type: "text",
        text: `The commit is already recorded as ${commitHash}. Its file list and verification evidence remain unchanged above.`,
      },
    ],
  };
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
      <span className="text-muted-foreground text-xs">Change reviewer</span>
    </div>
  );
}

function CommitReviewCard({
  onCommit,
  onMessageChange,
  onRequestChanges,
  state,
}: {
  onCommit: () => void;
  onMessageChange: (message: string) => void;
  onRequestChanges: () => void;
  state: ReviewState;
}) {
  const committed = state.phase === "committed";
  const requestingChanges = state.phase === "requesting-changes";

  return (
    <Commit>
      <CommitHeader>
        <CommitInfo>
          <CommitMessage>
            {committed ? state.commitMessage : "5 files ready to commit"}
          </CommitMessage>
          <CommitMetadata>
            <CommitHash>{committed ? commitHash : "Working tree"}</CommitHash>
            <CommitSeparator />
            {!committed ? (
              <>
                <span className="font-mono tabular-nums">+813</span>
              </>
            ) : null}
            {committed ? (
              <CommitTimestamp>
                {committed ? "Committed just now" : null}
              </CommitTimestamp>
            ) : null}
          </CommitMetadata>
        </CommitInfo>
        <CommitActions>
          {committed ? <CommitCopyButton hash={commitHash} /> : null}
          <CommitTrigger />
        </CommitActions>
      </CommitHeader>

      <CommitContent>
        <CommitFiles>
          {changedFiles.map((file) => (
            <CommitFile key={file.path}>
              <CommitFileStatus status={file.status} />
              <CommitFileInfo>
                <CommitFileIcon />
                <CommitFilePath>{file.path}</CommitFilePath>
              </CommitFileInfo>
              <CommitFileChanges>
                <CommitFileAdditions count={file.additions} />
                <CommitFileDeletions count={file.deletions} />
              </CommitFileChanges>
            </CommitFile>
          ))}
        </CommitFiles>
      </CommitContent>

      {!committed ? (
        <div className="bg-muted/20 border-t p-2.5">
          <div className="bg-background focus-within:ring-ring flex min-w-0 items-center rounded-md border focus-within:ring-1">
            <label
              htmlFor="commit-message"
              className="text-muted-foreground shrink-0 px-2.5 text-[9px] font-medium tracking-wide uppercase"
            >
              Message
            </label>
            <span className="bg-border h-4 w-px shrink-0" aria-hidden="true" />
            <Input
              id="commit-message"
              value={state.commitMessage}
              onChange={(event) => onMessageChange(event.target.value)}
              className="h-8 min-w-0 border-0 px-2.5 font-mono text-[10px] shadow-none focus-visible:ring-0"
              disabled={requestingChanges}
            />
          </div>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
            <CommitVerifiedMark>
              {state.revisions.length
                ? `${state.revisions.length} revision${state.revisions.length === 1 ? "" : "s"} applied · 3 checks passed`
                : "3 checks passed"}
            </CommitVerifiedMark>
            <div className="flex items-center justify-end gap-1.5 sm:ml-auto">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2.5 text-[10px]"
                disabled={requestingChanges}
                onClick={onRequestChanges}
              >
                <RotateCcw aria-hidden="true" />
                Request changes
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-8 px-2.5 text-[10px]"
                disabled={requestingChanges || !state.commitMessage.trim()}
                onClick={onCommit}
              >
                <GitCommitHorizontal aria-hidden="true" />
                Create commit
              </Button>
            </div>
          </div>
          {requestingChanges ? (
            <p className="text-muted-foreground mt-2 text-[10px]">
              Describe the required revision in the composer below.
            </p>
          ) : null}
        </div>
      ) : null}
    </Commit>
  );
}

export function AiChatConversation14Screen() {
  const [model, setModel] = React.useState(defaultAiModelId);
  const [prompt, setPrompt] = React.useState("");
  const [state, dispatch] = React.useReducer(reviewReducer, initialState);
  const editorRef = React.useRef<HTMLTextAreaElement | null>(null);

  function requestChanges() {
    dispatch({ type: "request-changes" });
    requestAnimationFrame(() => editorRef.current?.focus());
  }

  function submitPrompt() {
    const text = prompt.trim();
    if (!text) return;
    dispatch({ text, type: "submit" });
    setPrompt("");
  }

  function renderReviewCard(placement: ReviewPartData["placement"]) {
    if (placement === "initial" && state.revisions.length) return null;

    return (
      <CommitReviewCard
        state={state}
        onCommit={() => dispatch({ type: "commit" })}
        onMessageChange={(message) =>
          dispatch({ message, type: "set-message" })
        }
        onRequestChanges={requestChanges}
      />
    );
  }

  return (
    <AiConversationShell
      activeRecent="Review and commit verified changes"
      headerTitle="Change review and commit handoff"
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
        <h1 className="sr-only">Change review and commit handoff</h1>
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
                  part.data.kind === "review-card"
                ) {
                  return renderReviewCard(part.data.placement);
                }
                return undefined;
              }}
            />

            {state.revisions.map((note, index) => (
              <React.Fragment key={`${note}-${index}`}>
                <AiChatMessage message={revisionUserMessage(note, index)} />
                <AiChatMessage
                  message={revisionAssistantMessage(note, index)}
                  assistantAvatar={<AssistantIdentity />}
                  assistantHeader={<AssistantHeader />}
                  renderPart={({ part }) => {
                    if (
                      part.type === "custom" &&
                      part.data.kind === "review-card" &&
                      index === state.revisions.length - 1
                    ) {
                      return renderReviewCard(part.data.placement);
                    }
                    return undefined;
                  }}
                />
              </React.Fragment>
            ))}

            {state.followUps.map((text, index) => (
              <React.Fragment key={`${text}-${index}`}>
                <AiChatMessage message={followUpUserMessage(text, index)} />
                <AiChatMessage
                  message={followUpAssistantMessage(index)}
                  assistantAvatar={<AssistantIdentity />}
                  assistantHeader={<AssistantHeader />}
                />
              </React.Fragment>
            ))}
          </div>
        </AiConversationScroller>

        <div className="bg-background shrink-0 px-4 pt-3 pb-4 sm:px-6">
          <AiChatComposer
            aria-label="Continue change review"
            className="max-w-2xl"
            onSubmit={(event) => {
              event.preventDefault();
              submitPrompt();
            }}
          >
            <AiChatComposerEditor
              ref={editorRef}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder={
                state.phase === "requesting-changes"
                  ? "Describe the required revision…"
                  : state.phase === "committed"
                    ? "Ask about the committed change…"
                    : "Request a revision before committing…"
              }
              className="min-h-16"
            />
            <AiChatComposerToolbar>
              <AiChatComposerToolbarGroup>
                <AiChatComposerAction label="Attach review context">
                  <Plus aria-hidden="true" />
                </AiChatComposerAction>
                <span className="text-muted-foreground hidden items-center gap-1.5 text-[11px] sm:flex">
                  <MessageSquareText className="size-3.5" aria-hidden="true" />
                  {state.phase === "committed"
                    ? `Commit ${commitHash}`
                    : "Review mode"}
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
