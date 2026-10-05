"use client";

import {
  Copy,
  Ellipsis,
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
  AiModelPicker,
  defaultAiModelId,
} from "@/components/ai-chat/ai-model-picker";
import { SupportPriorityInsights } from "@/components/ai-chat/support-priority-insights";
import { useMockChat } from "@/components/ai-chat/use-mock-chat";
import { BrandMark } from "@/components/logo";
import { Button } from "@/components/ui/button";

type GenerativePartData = { kind: "support-priority-insights" };

const userMessage: AiChatMessageData = {
  id: "review-support-backlog",
  role: "user",
  parts: [
    {
      type: "text",
      text: "Review the support backlog from the last seven days. Show what changed, prioritize accounts at SLA risk, and let me assign the urgent issues without leaving the conversation.",
    },
  ],
};

const assistantMessage: AiChatMessageData<GenerativePartData> = {
  id: "support-backlog-response",
  role: "assistant",
  parts: [
    {
      type: "text",
      text: "The backlog peaked on Monday and has started to recover, but 17 cases still carry material SLA risk. I pulled the decision into three focused views.",
    },
    {
      data: { kind: "support-priority-insights" },
      id: "support-priority-insights",
      name: "support-priority-insights",
      type: "custom",
    },
    {
      type: "text",
      text: "Move through the risk comparison and backlog change, then assign the three urgent cases from the final view.",
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
      <span className="text-muted-foreground text-xs">Operations analyst</span>
    </div>
  );
}

function ResponseActions() {
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
      <Button variant="ghost" size="icon-sm" aria-label="Regenerate response">
        <RefreshCw aria-hidden="true" />
      </Button>
    </div>
  );
}

export function AiChatConversation15Screen() {
  const [model, setModel] = React.useState(defaultAiModelId);
  const [prompt, setPrompt] = React.useState("");
  const chat = useMockChat();

  return (
    <AiConversationShell
      activeRecent="Triage support backlog"
      headerTitle="Interactive support triage"
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
        <h1 className="sr-only">Interactive support triage</h1>
        <AiConversationScroller
          contentClassName="pb-14"
          showScrollButton={false}
        >
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:px-6 md:py-10">
            <AiChatMessage message={userMessage} />
            <AiChatMessage
              message={assistantMessage}
              assistantAvatar={<AssistantIdentity />}
              assistantHeader={<AssistantHeader />}
              actions={<ResponseActions />}
              renderPart={({ part }) => {
                if (
                  part.type === "custom" &&
                  part.data.kind === "support-priority-insights"
                ) {
                  return <SupportPriorityInsights />;
                }
                return undefined;
              }}
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
            aria-label="Continue support backlog conversation"
            className="max-w-3xl"
            onSubmit={(event) => {
              event.preventDefault();
              if (chat.send(prompt)) setPrompt("");
            }}
            rail={
              <AiChatComposerRail className="hidden sm:flex">
                <span>Support workspace</span>
                <span>Backlog snapshot · 184 cases</span>
              </AiChatComposerRail>
            }
          >
            <AiChatComposerEditor
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Ask for another view or change the assignment…"
              className="min-h-16"
            />
            <AiChatComposerToolbar>
              <AiChatComposerToolbarGroup>
                <AiChatComposerAction label="Add support context">
                  <Plus aria-hidden="true" />
                </AiChatComposerAction>
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
