"use client";

import {
  Ellipsis,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Share2,
  X,
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
import { ComponentRecordsGrid } from "@/components/ai-chat/component-records-grid";
import { useMockChat } from "@/components/ai-chat/use-mock-chat";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type WorkspacePartData = { kind: "workspace-launcher" };

const userMessage: AiChatMessageData = {
  id: "workspace-request",
  role: "user",
  parts: [
    {
      type: "text",
      text: "Open the component inventory and keep this conversation available while I review release readiness.",
    },
  ],
};

function WorkspaceLauncher({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const workspaceButton = (
    <Button
      type="button"
      size="sm"
      variant={open ? "outline" : "default"}
      className={cn(
        "h-8 shrink-0 px-2.5 text-xs",
        open && "text-muted-foreground",
      )}
      onClick={() => onOpenChange(!open)}
    >
      {open ? (
        <PanelLeftClose aria-hidden="true" />
      ) : (
        <PanelLeftOpen aria-hidden="true" />
      )}
      {open ? "Close workspace" : "Open workspace"}
    </Button>
  );

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          "min-w-0 border-y py-3",
          !open &&
            "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        )}
      >
        <div className="min-w-0">
          <p className="text-[13px] font-medium">
            {open
              ? "Component inventory is open"
              : "24 component records found"}
          </p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            5 need an owner · 6 in review · 2 blocked
          </p>
        </div>
        {!open ? workspaceButton : null}
      </div>
      {open ? <div className="mt-2 self-end">{workspaceButton}</div> : null}
    </div>
  );
}

export function AiChatConversation18Screen() {
  const [workspaceOpen, setWorkspaceOpen] = React.useState(false);
  const [model, setModel] = React.useState(defaultAiModelId);
  const [prompt, setPrompt] = React.useState("");
  const chat = useMockChat();

  const assistantMessage: AiChatMessageData<WorkspacePartData> = {
    id: "workspace-response",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: "I found 24 component records across the shared product surfaces. The working grid can sort records, resize columns, configure properties, refresh generated values, and add a release-notes column without closing this thread.",
      },
      {
        id: "workspace-launcher",
        name: "component-workspace-launcher",
        type: "custom",
        data: { kind: "workspace-launcher" },
      },
    ],
  };

  return (
    <AiConversationShell
      activeRecent="Review component ownership"
      headerTitle="Adaptive workspace"
      headerActions={
        <>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Share conversation"
          >
            <Share2 aria-hidden="true" />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="More actions">
            <Ellipsis aria-hidden="true" />
          </Button>
        </>
      }
    >
      <div
        className={cn(
          "grid min-h-0 flex-1 overflow-hidden",
          workspaceOpen
            ? "grid-cols-1 xl:grid-cols-[minmax(34rem,1fr)_22rem]"
            : "grid-cols-1",
        )}
      >
        {workspaceOpen ? (
          <section
            className="bg-background flex min-h-0 min-w-0 flex-col"
            aria-label="Component inventory workspace"
          >
            <div className="flex h-13 shrink-0 items-center justify-between gap-4 border-b px-4 sm:px-5">
              <div className="min-w-0">
                <h2 className="truncate text-sm font-medium">
                  Component inventory
                </h2>
                <p className="text-muted-foreground mt-0.5 text-[11px]">
                  24 records · release readiness
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Close component inventory"
                onClick={() => setWorkspaceOpen(false)}
              >
                <X aria-hidden="true" />
              </Button>
            </div>
            <div className="flex min-h-0 flex-1">
              <ComponentRecordsGrid fill />
            </div>
          </section>
        ) : null}

        <section
          className={cn(
            "bg-background min-h-0 flex-col",
            workspaceOpen ? "hidden xl:flex xl:border-l" : "flex",
          )}
        >
          <h1 className="sr-only">Adaptive component workspace</h1>
          <AiConversationScroller showScrollButton={false}>
            <div
              className={cn(
                "mx-auto flex w-full flex-col gap-7 px-4 py-7 sm:px-6",
                workspaceOpen ? "max-w-none" : "max-w-2xl md:py-10",
              )}
            >
              <AiChatMessage message={userMessage} />
              <AiChatMessage
                message={assistantMessage}
                assistantHeader={
                  <div className="mb-1 flex items-center gap-2 px-1.5">
                    <span className="text-[13px] font-medium">
                      Component reviewer
                    </span>
                    <span className="text-muted-foreground text-xs">
                      Inventory
                    </span>
                  </div>
                }
                renderPart={({ part }) => {
                  if (
                    part.type === "custom" &&
                    part.data.kind === "workspace-launcher"
                  ) {
                    return (
                      <div className="px-1.5">
                        <WorkspaceLauncher
                          open={workspaceOpen}
                          onOpenChange={setWorkspaceOpen}
                        />
                      </div>
                    );
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

          <div className="bg-background shrink-0 px-4 pt-3 pb-4">
            <AiChatComposer
              aria-label="Continue component inventory conversation"
              onSubmit={(event) => {
                event.preventDefault();
                if (!chat.send(prompt)) return;
                setPrompt("");
                setWorkspaceOpen(true);
              }}
              rail={
                workspaceOpen ? (
                  <AiChatComposerRail>
                    <span className="min-w-0 flex-1 truncate">
                      Component inventory
                    </span>
                    <span className="shrink-0">24 records</span>
                  </AiChatComposerRail>
                ) : undefined
              }
            >
              <AiChatComposerEditor
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder={
                  workspaceOpen
                    ? "Ask about these records…"
                    : "Ask to inspect or update the inventory…"
                }
                className="min-h-16"
              />
              <AiChatComposerToolbar>
                <AiChatComposerToolbarGroup>
                  <AiChatComposerAction label="Add inventory context">
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
        </section>
      </div>
    </AiConversationShell>
  );
}
