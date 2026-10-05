"use client";

import {
  Clipboard,
  Copy,
  Ellipsis,
  FileSearch,
  Folder,
  Plus,
  RefreshCw,
  Share2,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import * as React from "react";

import {
  AiChatComposer,
  AiChatComposerAction,
  AiChatComposerButton,
  AiChatComposerEditor,
  AiChatComposerRail,
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
  aiModelOptions,
  AiModelPicker,
  defaultAiModelId,
} from "@/components/ai-chat/ai-model-picker";
import { AnimatedAgentBlob } from "@/components/ai-chat/animated-agent-blob";
import { useMockChat } from "@/components/ai-chat/use-mock-chat";
import {
  Context,
  ContextCacheUsage,
  ContextContent,
  ContextContentBody,
  ContextContentFooter,
  ContextContentHeader,
  ContextInputUsage,
  ContextOutputUsage,
  ContextReasoningUsage,
  ContextTrigger,
} from "@/components/ai-elements/context";
import type { InlineCitationSourceData } from "@/components/ai-elements/inline-citation";
import { Button } from "@/components/ui/button";

const reactSource: InlineCitationSourceData = {
  id: "react-use-optimistic",
  title: "useOptimistic – React",
  url: "https://react.dev/reference/react/useOptimistic",
  description:
    "React’s optimistic-state primitive is intended for temporary interface state while an action is underway.",
  excerpt:
    "useOptimistic is a React Hook that lets you optimistically update the UI.",
};

const tanstackSource: InlineCitationSourceData = {
  id: "tanstack-optimistic-updates",
  title: "Optimistic Updates – TanStack Query",
  url: "https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates",
  description:
    "TanStack Query documents both UI-level optimistic rendering and cache updates with explicit rollback handling.",
  excerpt:
    "When you optimistically update your state before performing a mutation, there is a chance that the mutation will fail.",
};

const stripeSource: InlineCitationSourceData = {
  id: "stripe-idempotency",
  title: "Idempotent requests – Stripe API",
  url: "https://docs.stripe.com/api/idempotent_requests",
  description:
    "Stripe recommends idempotency keys so clients can retry external mutations without duplicating side effects.",
  excerpt:
    "Idempotency works by saving the resulting status code and body of the first request.",
};

const sources = [reactSource, tanstackSource, stripeSource].map(
  ({ id, title, url }) => ({ id, title, url }),
);

const userMessage: AiChatMessageData = {
  id: "bulk-feedback-request",
  role: "user",
  parts: [
    {
      type: "text",
      text: "Research how bulk admin actions should communicate progress when they touch an external API. I want the interface to feel immediate without implying success before the server confirms it.",
    },
  ],
};

function getAssistantMessage(isReasoning: boolean): AiChatMessageData {
  return {
    id: "bulk-feedback-response",
    role: "assistant",
    parts: [
      {
        type: "reasoning",
        id: "bulk-feedback-reasoning",
        duration: 9,
        isStreaming: isReasoning,
        text: "I separated reversible interface feedback from irreversible external side effects. Then I compared React’s optimistic-state primitive, TanStack Query’s rollback guidance, and Stripe’s idempotency model. The recommendation uses optimistic UI only where the client can clearly undo or relabel the state.",
      },
      {
        type: "text",
        text: `### Recommendation

Use a **hybrid state model**: acknowledge the operator immediately, but reserve completed language for server-confirmed outcomes.`,
      },
      {
        type: "cited-text",
        id: "optimistic-local-feedback",
        segments: [
          {
            type: "citation",
            text: "Show reversible local feedback immediately—selection, queued status, and temporary list changes—while preserving a rollback path",
            sources: [reactSource, tanstackSource],
          },
          {
            type: "text",
            text: ". This makes the interface responsive without presenting the external mutation as finished.",
          },
        ],
      },
      {
        type: "cited-text",
        id: "confirmed-external-effects",
        segments: [
          {
            type: "citation",
            text: "Keep external side effects in a pending state until the server confirms them, and attach an idempotency key to every retryable mutation",
            sources: [stripeSource],
          },
          {
            type: "text",
            text: ". A retry can then remain visible and auditable without risking a duplicate charge or duplicate workflow run.",
          },
        ],
      },
      {
        type: "text",
        text: `### State contract

- **Queued:** accepted by the interface but not sent.
- **Running:** submitted with progress and a safe cancel boundary.
- **Succeeded:** confirmed by the authoritative service.
- **Needs attention:** failed with retry, rollback, and audit details.`,
      },
      {
        type: "cited-text",
        id: "rollback-on-failure",
        segments: [
          {
            type: "text",
            text: "If the request fails, ",
          },
          {
            type: "citation",
            text: "restore the previous client snapshot or replace the optimistic state with an explicit error state",
            sources: [tanstackSource],
          },
          {
            type: "text",
            text: ". Never leave an optimistic success indicator in place after the authoritative request fails.",
          },
        ],
      },
      { type: "sources", sources },
    ],
  };
}

function ResponseActions({ onReplay }: { onReplay: () => void }) {
  return (
    <div className="mt-1 flex items-center gap-1">
      <Button variant="ghost" size="icon-sm" aria-label="Copy response">
        <Copy aria-hidden="true" />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Good response">
        <ThumbsUp aria-hidden="true" />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Bad response">
        <ThumbsDown aria-hidden="true" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Replay reasoning state"
        onClick={onReplay}
      >
        <RefreshCw aria-hidden="true" />
      </Button>
    </div>
  );
}

export function AiChatConversation10Screen() {
  const [model, setModel] = React.useState(defaultAiModelId);
  const [prompt, setPrompt] = React.useState("");
  const chat = useMockChat();
  const [isReasoning, setIsReasoning] = React.useState(false);
  const replayTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  React.useEffect(
    () => () => {
      if (replayTimer.current) clearTimeout(replayTimer.current);
    },
    [],
  );

  function replayReasoning() {
    if (replayTimer.current) clearTimeout(replayTimer.current);
    setIsReasoning(true);
    replayTimer.current = setTimeout(() => setIsReasoning(false), 1400);
  }

  const activeModel =
    aiModelOptions.find((option) => option.id === model) ?? aiModelOptions[0];

  return (
    <AiConversationShell
      activeRecent="Research bulk action feedback"
      headerTitle="Research with citations and context"
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
        <h1 className="sr-only">Research with citations and context</h1>
        <AiConversationScroller>
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:px-6 md:py-10">
            <AiChatMessage message={userMessage} />
            <AiChatMessage
              message={getAssistantMessage(isReasoning)}
              assistantAvatar={
                <AnimatedAgentBlob
                  className="size-8"
                  colors={["#050505", "#1d4ed8", "#050505"]}
                  silhouette="orb"
                  phase={0.45}
                  decorative
                />
              }
              assistantHeader={
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-[13px] font-medium">
                    Shadcnblocks AI
                  </span>
                  <span className="text-muted-foreground text-xs">
                    Research agent
                  </span>
                </div>
              }
              actions={<ResponseActions onReplay={replayReasoning} />}
            />
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

        <div className="bg-background shrink-0 px-4 pt-3 pb-4 sm:px-6">
          <AiChatComposer
            aria-label="Continue research conversation"
            className="max-w-2xl"
            onSubmit={(event) => {
              event.preventDefault();
              if (chat.send(prompt)) setPrompt("");
            }}
            rail={
              <AiChatComposerRail className="hidden sm:flex">
                <span className="flex items-center gap-1.5">
                  <Folder className="size-3.5" aria-hidden="true" />
                  Admin interaction research
                </span>
                <span className="flex items-center gap-1.5">
                  <FileSearch className="size-3.5" aria-hidden="true" />
                  <span>3 cited sources</span>
                </span>
              </AiChatComposerRail>
            }
          >
            <AiChatComposerEditor
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Ask a follow-up or request another comparison…"
              className="min-h-16"
            />
            <AiChatComposerToolbar>
              <AiChatComposerToolbarGroup>
                <AiChatComposerAction label="Add research context">
                  <Plus aria-hidden="true" />
                </AiChatComposerAction>
                <AiChatComposerButton
                  size="sm"
                  className="h-8 gap-1.5 rounded-lg px-2 text-xs font-normal"
                >
                  <Clipboard aria-hidden="true" />
                  Sources
                </AiChatComposerButton>
              </AiChatComposerToolbarGroup>
              <AiChatComposerToolbarGroup className="shrink-0">
                <Context
                  usedTokens={18420}
                  maxTokens={128000}
                  modelLabel={activeModel?.shortName}
                  usage={{
                    inputTokens: 14280,
                    outputTokens: 2380,
                    reasoningTokens: 1760,
                    cachedInputTokens: 6400,
                  }}
                >
                  <ContextTrigger aria-label="View context usage" />
                  <ContextContent>
                    <ContextContentHeader />
                    <ContextContentBody>
                      <ContextInputUsage />
                      <ContextOutputUsage />
                      <ContextReasoningUsage />
                      <ContextCacheUsage />
                    </ContextContentBody>
                    <ContextContentFooter />
                  </ContextContent>
                </Context>
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
