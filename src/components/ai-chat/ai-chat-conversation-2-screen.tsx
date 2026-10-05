"use client";

import {
  Check,
  ChevronDown,
  Clipboard,
  Copy,
  Ellipsis,
  FileText,
  Folder,
  Grid2X2,
  RefreshCw,
  Search,
  Share2,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import * as React from "react";

import {
  AiChatComposer,
  AiChatComposerButton,
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
import { AnimatedAgentBlob } from "@/components/ai-chat/animated-agent-blob";
import { useMockChat } from "@/components/ai-chat/use-mock-chat";
import { Button } from "@/components/ui/button";
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";

const activitySteps = [
  "Compared catalog, orders, inventory, and customer tables",
  "Measured row heights, column count, and action density",
  "Checked scan paths at desktop and tablet widths",
  "Reviewed keyboard focus and selection behavior",
];

const conversationMessages: AiChatMessageData[] = [
  {
    id: "density-request",
    role: "user",
    parts: [
      {
        type: "text",
        text: "Review the density across our product tables. I want them to feel efficient without making row actions or status details difficult to scan.",
      },
    ],
  },
  {
    id: "density-response",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: "I audited the highest-traffic table patterns first, then compared how each density behaves when filters, selection, and row actions are present.",
      },
      {
        type: "tool",
        id: "density-audit",
        label: "Finished density audit",
        detail: "Worked for 3m 38s",
        state: "output-available",
      },
      {
        type: "text",
        text: `The best default is a **balanced 44 px row**. It keeps eight to eleven records visible in the common viewport while leaving enough room for a two-line product identity, status, price, and one primary action.

### Recommended density system

- Use **44 px** as the shared default and **36 px** only for high-volume operational tables.
- Keep density user-selectable, but preserve column widths and row-action placement between modes.
- Move secondary metadata into a detail panel instead of compressing it into additional columns.`,
      },
    ],
  },
];

function DensityAuditActivity() {
  return (
    <details open className="group px-1.5">
      <summary className="hover:text-foreground w-fit cursor-pointer list-none transition-colors [&::-webkit-details-marker]:hidden">
        <Marker className="w-fit">
          <MarkerIcon>
            <ChevronDown
              className="-rotate-90 transition-transform group-open:rotate-0"
              strokeWidth={1.75}
            />
          </MarkerIcon>
          <MarkerContent>Worked for 3m 38s</MarkerContent>
        </Marker>
      </summary>

      <div className="mt-4 ml-2.5 border-l pl-5">
        <div className="relative pb-4">
          <span className="bg-background absolute top-0.5 -left-[27px] flex size-3 items-center justify-center">
            <Search
              className="text-muted-foreground size-3.5"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </span>
          <p className="text-muted-foreground text-sm">Searched</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {["Product catalog", "Orders", "Inventory", "Customers"].map(
              (source) => (
                <span
                  key={source}
                  className="bg-muted inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs"
                >
                  <Grid2X2
                    className="size-3 text-blue-500"
                    aria-hidden="true"
                  />
                  {source}
                </span>
              ),
            )}
          </div>
        </div>

        <div className="space-y-3 pb-4">
          {activitySteps.map((step) => (
            <div key={step} className="relative text-sm">
              <span className="bg-muted-foreground/50 ring-background absolute top-2 -left-[25px] size-2 rounded-full ring-4" />
              <span className="text-muted-foreground">{step}</span>
            </div>
          ))}
        </div>

        <div className="relative text-sm">
          <span className="ring-background absolute top-0.5 -left-[28px] flex size-4 items-center justify-center rounded-full bg-emerald-500 text-white ring-4">
            <Check className="size-3" strokeWidth={2.5} aria-hidden="true" />
          </span>
          Finished density audit
        </div>
      </div>
    </details>
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

export function AiChatConversation2Screen() {
  const [model, setModel] = React.useState(defaultAiModelId);
  const [prompt, setPrompt] = React.useState("");
  const chat = useMockChat();

  function submitPrompt(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!chat.send(prompt)) return;
    setPrompt("");
  }

  return (
    <AiConversationShell
      activeRecent="Review product table density"
      headerTitle="Tool activity and results"
      headerActions={
        <>
          <Button variant="ghost" size="sm" className="h-8 text-xs">
            <Share2 data-icon="inline-start" aria-hidden="true" />
            Share
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="More actions">
            <Ellipsis aria-hidden="true" />
          </Button>
        </>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <h1 className="sr-only">Tool activity and results</h1>

        <AiConversationScroller>
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-9 px-4 py-8 sm:px-6 md:py-10">
            {conversationMessages.map((message) => (
              <AiChatMessage
                key={message.id}
                message={message}
                assistantAvatar={
                  <AnimatedAgentBlob
                    className="size-8"
                    colors={["#050505", "#171717", "#050505"]}
                    silhouette="hexagon"
                    phase={1.25}
                    decorative
                  />
                }
                assistantHeader={
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-[13px] font-medium">
                      Shadcnblocks AI
                    </span>
                    <span className="text-muted-foreground text-xs">
                      UI agent
                    </span>
                  </div>
                }
                actions={<ResponseActions />}
                renderPart={({ part }) =>
                  part.type === "tool" && part.id === "density-audit" ? (
                    <DensityAuditActivity />
                  ) : undefined
                }
              />
            ))}
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
            aria-label="Continue conversation"
            className="max-w-2xl"
            onSubmit={submitPrompt}
            rail={
              <AiChatComposerRail className="hidden sm:flex">
                <span className="flex items-center gap-1.5">
                  <Folder className="size-3.5" aria-hidden="true" />
                  Commerce workspace
                </span>
                <span className="flex items-center gap-1.5">
                  <FileText className="size-3.5" aria-hidden="true" />
                  Product tables
                </span>
              </AiChatComposerRail>
            }
          >
            <AiChatComposerEditor
              aria-label="Reply to Shadcnblocks AI"
              placeholder="Reply, use @ to add context, or / for commands"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              className="min-h-16"
            />
            <AiChatComposerToolbar>
              <AiChatComposerToolbarGroup>
                <AiChatAddContextAction />
                <AiChatComposerButton
                  size="sm"
                  className="h-8 gap-1.5 rounded-lg px-2 text-xs font-normal"
                >
                  <Clipboard aria-hidden="true" />
                  Context
                </AiChatComposerButton>
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
