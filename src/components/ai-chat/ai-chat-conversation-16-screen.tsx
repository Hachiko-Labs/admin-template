"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Ellipsis,
  GitBranch,
  GitCompareArrows,
  Pencil,
  RefreshCw,
  Share2,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import * as React from "react";

import {
  AiChatComposer,
  AiChatComposerEditor,
  AiChatComposerRail,
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
import { AiUserMessage } from "@/components/ai-chat/ai-user-message";
import { BrandMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ResponseVersion {
  id: string;
  label: string;
  note: string;
  text: string;
  time: string;
}

type ResponsePartData = { kind: "response-version-comparison" };

const initialPrompt =
  "Give me a rollout recommendation for the denser product table. Keep the default view calm, but make bulk actions easy to discover when they are needed.";

const initialVersions: ResponseVersion[] = [
  {
    id: "initial",
    label: "Initial answer",
    note: "Broad recommendation",
    time: "10:42 PM",
    text: `Use a compact toolbar above the table and keep the bulk actions visible at all times. This makes every capability discoverable, although it adds weight to the default state.

Roll the change out to the operations workspace first, then extend it after one week of usage data.`,
  },
  {
    id: "focused",
    label: "Focused answer",
    note: "Reduced default chrome",
    time: "10:43 PM",
    text: `Keep the default table focused on search, filters, and the primary create action. Reveal the bulk-action toolbar only after the first row is selected.

Preserve selection while filters change, show the selected count beside the actions, and keep **Clear selection** in a stable position. This gives frequent operators speed without making every visitor parse controls they cannot yet use.`,
  },
  {
    id: "rollout",
    label: "Rollout answer",
    note: "Adds validation and release guardrails",
    time: "10:44 PM",
    text: `Keep the default table focused on search, filters, and the primary create action. Reveal the bulk-action toolbar only after the first row is selected.

Preserve selection while filters change, show the selected count beside the actions, and keep **Clear selection** in a stable position.

For rollout, start with the operations workspace behind a feature flag. Track selection rate, abandoned selections, and accidental action reversals for five working days before expanding access.`,
  },
];

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
      <span className="text-muted-foreground text-xs">Product reviewer</span>
    </div>
  );
}

function EditableUserMessage({
  editing,
  draft,
  message,
  onCancel,
  onDraftChange,
  onEdit,
  onSave,
}: {
  editing: boolean;
  draft: string;
  message: string;
  onCancel: () => void;
  onDraftChange: (value: string) => void;
  onEdit: () => void;
  onSave: () => void;
}) {
  if (editing) {
    return (
      <div className="bg-background ml-auto w-full max-w-xl overflow-hidden rounded-xl border shadow-sm">
        <Textarea
          aria-label="Edit message"
          autoFocus
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          className="min-h-28 resize-none rounded-none border-0 px-4 py-3 text-[15px] leading-6 shadow-none focus-visible:ring-0"
        />
        <div className="flex items-center justify-between gap-3 border-t px-3 py-2">
          <span className="text-muted-foreground hidden text-xs sm:block">
            The current answer remains available as a branch.
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!draft.trim()}
              onClick={onSave}
            >
              <GitBranch aria-hidden="true" />
              Save and regenerate
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex flex-col items-end gap-1">
      <AiUserMessage>{message}</AiUserMessage>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-muted-foreground h-7 px-2 text-xs opacity-70 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        onClick={onEdit}
      >
        <Pencil aria-hidden="true" />
        Edit message
      </Button>
    </div>
  );
}

function VersionComparison({
  current,
  previous,
}: {
  current: ResponseVersion;
  previous: ResponseVersion;
}) {
  const previousParagraphs = previous.text.split("\n\n");
  const currentParagraphs = current.text.split("\n\n");

  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <p className="text-sm font-medium">Compare response versions</p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Review what changed before keeping a direction.
          </p>
        </div>
        <span className="text-muted-foreground font-mono text-[11px]">
          {previous.id} → {current.id}
        </span>
      </div>

      <div className="grid md:grid-cols-2 md:divide-x">
        <section
          className="flex h-64 min-h-0 flex-col border-b md:border-b-0"
          aria-label={previous.label}
        >
          <div className="flex shrink-0 items-start justify-between gap-3 px-4 pt-4 pb-3">
            <div>
              <p className="text-[13px] font-medium">{previous.label}</p>
              <p className="text-muted-foreground text-xs">{previous.note}</p>
            </div>
            <span className="text-muted-foreground font-mono text-[10px]">
              {previous.time}
            </span>
          </div>
          <ScrollArea className="min-h-0 flex-1">
            <div className="text-muted-foreground space-y-3 px-4 pr-6 pb-4 text-[13px] leading-6">
              {previousParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph.replaceAll("**", "")}</p>
              ))}
            </div>
          </ScrollArea>
        </section>

        <section
          className="flex h-64 min-h-0 flex-col"
          aria-label={current.label}
        >
          <div className="flex shrink-0 items-start justify-between gap-3 px-4 pt-4 pb-3">
            <div>
              <p className="text-[13px] font-medium">{current.label}</p>
              <p className="text-muted-foreground text-xs">{current.note}</p>
            </div>
            <span className="text-muted-foreground font-mono text-[10px]">
              {current.time}
            </span>
          </div>
          <ScrollArea className="min-h-0 flex-1">
            <div className="space-y-3 px-4 pr-6 pb-4 text-[13px] leading-6">
              {currentParagraphs.map((paragraph, index) => (
                <p
                  key={paragraph}
                  className={cn(
                    index === currentParagraphs.length - 1 &&
                      currentParagraphs.length > previousParagraphs.length &&
                      "border-l-2 border-emerald-600/60 bg-emerald-500/[0.06] py-1.5 pr-2 pl-3 dark:border-emerald-400/60",
                  )}
                >
                  {paragraph.replaceAll("**", "")}
                </p>
              ))}
            </div>
          </ScrollArea>
        </section>
      </div>
    </div>
  );
}

function VersionActions({
  activeIndex,
  comparing,
  count,
  onCompare,
  onNext,
  onPrevious,
  onRegenerate,
}: {
  activeIndex: number;
  comparing: boolean;
  count: number;
  onCompare: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onRegenerate: () => void;
}) {
  return (
    <div className="mt-1 flex w-full flex-wrap items-center justify-between gap-2 px-0.5">
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" aria-label="Copy response">
          <Copy aria-hidden="true" />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Good response">
          <ThumbsUp aria-hidden="true" />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Bad response">
          <ThumbsDown aria-hidden="true" />
        </Button>
        <span className="bg-border mx-1 h-4 w-px" />
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Previous response version"
          disabled={activeIndex === 0}
          onClick={onPrevious}
        >
          <ChevronLeft aria-hidden="true" />
        </Button>
        <span className="min-w-14 text-center font-mono text-[11px] tabular-nums">
          {activeIndex + 1} / {count}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Next response version"
          disabled={activeIndex === count - 1}
          onClick={onNext}
        >
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <Button
          type="button"
          variant={comparing ? "secondary" : "ghost"}
          size="sm"
          className="h-8 text-xs"
          disabled={activeIndex === 0}
          onClick={onCompare}
        >
          {comparing ? (
            <X aria-hidden="true" />
          ) : (
            <GitCompareArrows aria-hidden="true" />
          )}
          {comparing ? "Close compare" : "Compare"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 text-xs"
          onClick={onRegenerate}
        >
          <RefreshCw aria-hidden="true" />
          Regenerate
        </Button>
      </div>
    </div>
  );
}

export function AiChatConversation16Screen() {
  const [model, setModel] = React.useState(defaultAiModelId);
  const [prompt, setPrompt] = React.useState("");
  const [userMessage, setUserMessage] = React.useState(initialPrompt);
  const [draft, setDraft] = React.useState(initialPrompt);
  const [editing, setEditing] = React.useState(false);
  const [versions, setVersions] =
    React.useState<ResponseVersion[]>(initialVersions);
  const [activeIndex, setActiveIndex] = React.useState(2);
  const [comparing, setComparing] = React.useState(true);

  const activeVersion = versions[activeIndex];
  const previousVersion = versions[Math.max(0, activeIndex - 1)];

  const assistantMessage: AiChatMessageData<ResponsePartData> = {
    id: `response-${activeVersion.id}`,
    role: "assistant",
    parts: comparing
      ? [
          {
            id: `compare-${previousVersion.id}-${activeVersion.id}`,
            name: "response-version-comparison",
            type: "custom",
            data: { kind: "response-version-comparison" },
          },
        ]
      : [{ type: "text", text: activeVersion.text }],
  };

  function appendVersion(label: string, message: string) {
    const nextVersion: ResponseVersion = {
      id: `revision-${versions.length + 1}`,
      label,
      note: "Generated from the revised request",
      time: "Just now",
      text: `Use selection as the moment when the table changes mode. Keep the resting state limited to search, filters, and the primary create action; after selection, replace that quiet toolbar with the available bulk actions and a persistent selected count.\n\nThe revised request adds one release constraint: ${message.trim()}\n\nShip the behavior behind a workspace flag, preserve the earlier response as a branch, and compare operator outcomes before promoting this version.`,
    };
    setVersions((current) => [...current, nextVersion]);
    setActiveIndex(versions.length);
    setComparing(false);
  }

  function saveEditedMessage() {
    const value = draft.trim();
    if (!value) return;
    setUserMessage(value);
    setEditing(false);
    appendVersion("Edited-request answer", value);
  }

  return (
    <AiConversationShell
      activeRecent="Compare response versions"
      headerTitle="Response branches"
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
        <h1 className="sr-only">Response branching and message editing</h1>
        <AiConversationScroller
          showScrollButton={false}
          contentClassName="pb-12"
        >
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-7 px-4 py-7 sm:px-6 md:py-9">
            <EditableUserMessage
              editing={editing}
              draft={draft}
              message={userMessage}
              onCancel={() => {
                setDraft(userMessage);
                setEditing(false);
              }}
              onDraftChange={setDraft}
              onEdit={() => {
                setDraft(userMessage);
                setEditing(true);
              }}
              onSave={saveEditedMessage}
            />

            <AiChatMessage
              key={assistantMessage.id}
              message={assistantMessage}
              assistantAvatar={<AssistantIdentity />}
              assistantHeader={<AssistantHeader />}
              actions={
                <VersionActions
                  activeIndex={activeIndex}
                  comparing={comparing}
                  count={versions.length}
                  onCompare={() => setComparing((current) => !current)}
                  onNext={() =>
                    setActiveIndex((current) =>
                      Math.min(versions.length - 1, current + 1),
                    )
                  }
                  onPrevious={() => {
                    const nextIndex = Math.max(0, activeIndex - 1);
                    setActiveIndex(nextIndex);
                    if (nextIndex === 0) setComparing(false);
                  }}
                  onRegenerate={() =>
                    appendVersion("Regenerated answer", userMessage)
                  }
                />
              }
              renderPart={({ part }) => {
                if (
                  part.type === "custom" &&
                  part.data.kind === "response-version-comparison"
                ) {
                  return (
                    <VersionComparison
                      current={activeVersion}
                      previous={previousVersion}
                    />
                  );
                }
                return undefined;
              }}
            />

            <div className="text-muted-foreground flex items-center gap-2 pl-12 text-xs">
              <GitBranch className="size-3.5" aria-hidden="true" />
              <span>
                {versions.length} response versions preserved in this thread
              </span>
              <span aria-hidden="true">·</span>
              <span>{activeVersion.label}</span>
            </div>
          </div>
        </AiConversationScroller>

        <div className="bg-background shrink-0 px-4 pt-3 pb-4 sm:px-6">
          <AiChatComposer
            aria-label="Continue response branch conversation"
            className="max-w-3xl"
            onSubmit={(event) => {
              event.preventDefault();
              if (!prompt.trim()) return;
              appendVersion("Follow-up answer", prompt);
              setPrompt("");
            }}
            rail={
              <AiChatComposerRail className="hidden sm:flex">
                <span className="flex items-center gap-1.5">
                  <GitBranch className="size-3.5" aria-hidden="true" />
                  Product table review
                </span>
                <span>{versions.length} preserved versions</span>
              </AiChatComposerRail>
            }
          >
            <AiChatComposerEditor
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Ask for another direction or revise the active answer…"
              className="min-h-16"
            />
            <AiChatComposerToolbar>
              <AiChatComposerToolbarGroup>
                <AiChatAddContextAction />
              </AiChatComposerToolbarGroup>
              <AiChatComposerToolbarGroup className="shrink-0">
                <span
                  className={cn(
                    "text-muted-foreground hidden items-center gap-1.5 text-xs sm:flex",
                    comparing && "text-foreground",
                  )}
                >
                  {comparing ? (
                    <GitCompareArrows className="size-3.5" aria-hidden="true" />
                  ) : (
                    <Check className="size-3.5" aria-hidden="true" />
                  )}
                  {comparing ? "Comparing" : "Version selected"}
                </span>
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
