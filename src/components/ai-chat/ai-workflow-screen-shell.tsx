"use client";

import {
  ArrowRight,
  Check,
  Ellipsis,
  GitBranch,
  History,
  Maximize2,
  PanelRightOpen,
  Plus,
  RotateCw,
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
import { AiCodingWorkspace } from "@/components/ai-chat/ai-coding-workspace";
import { AiConversationScroller } from "@/components/ai-chat/ai-conversation-scroller";
import {
  AiModelPicker,
  defaultAiModelId,
} from "@/components/ai-chat/ai-model-picker";
import type { WorkflowCanvasMode } from "@/components/ai-chat/ai-workflow-canvas";
import { AiWorkspaceShell } from "@/components/ai-chat/ai-workspace-shell";
import { AnimatedAgentBlob } from "@/components/ai-chat/animated-agent-blob";
import { useMockChat } from "@/components/ai-chat/use-mock-chat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WorkflowMetric {
  label: string;
  value: string;
}

interface AiWorkflowScreenShellProps {
  assistantText: string;
  badge: string;
  cardTitle: string;
  children: (controls: {
    expanded: boolean;
    open: boolean;
    setExpanded: (expanded: boolean) => void;
    setOpen: (open: boolean) => void;
  }) => React.ReactNode;
  headerTitle: string;
  metrics: WorkflowMetric[];
  recentLabel: string;
  summaryMode: WorkflowCanvasMode;
  userText: string;
}

function WorkflowCardPreview({ mode }: { mode: WorkflowCanvasMode }) {
  if (mode === "author") {
    return (
      <div
        className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-1.5"
        aria-hidden="true"
      >
        {["Input", "Decision", "Approval"].map((step, index) => (
          <React.Fragment key={step}>
            <span className="bg-muted/15 flex min-w-0 items-center gap-1.5 rounded-md border px-2 py-1.5">
              <span className="bg-muted-foreground/45 size-1.5 shrink-0 rounded-full" />
              <span className="truncate text-[9px]">{step}</span>
            </span>
            {index < 2 ? (
              <ArrowRight className="text-muted-foreground size-3" />
            ) : null}
          </React.Fragment>
        ))}
      </div>
    );
  }

  if (mode === "live") {
    return (
      <div
        className="bg-muted/10 rounded-lg border px-2.5 py-2"
        aria-hidden="true"
      >
        <div className="flex items-center gap-2">
          <span className="size-1.5 animate-pulse rounded-full bg-blue-500 motion-reduce:animate-none" />
          <span className="text-[10px] font-medium">Execution in progress</span>
          <span className="text-muted-foreground ml-auto font-mono text-[9px]">
            00:18
          </span>
        </div>
        <div className="mt-2 grid grid-cols-5 gap-1">
          {[0, 1, 2, 3, 4].map((step) => (
            <span
              key={step}
              className={cn(
                "h-1 rounded-full",
                step < 2
                  ? "bg-emerald-500"
                  : step === 2
                    ? "animate-pulse bg-blue-500"
                    : "bg-muted",
              )}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-muted/10 flex items-center gap-2 rounded-lg border px-2.5 py-2"
      aria-hidden="true"
    >
      <History className="text-muted-foreground size-3.5" />
      <span className="text-[10px] font-medium">Reviewed handoffs</span>
      <span className="text-muted-foreground ml-auto flex items-center gap-1 text-[9px]">
        <RotateCw className="size-3 text-orange-500" />1 revision
      </span>
      <span className="flex items-center gap-1 text-[9px] text-emerald-600">
        <Check className="size-3" /> Approved
      </span>
    </div>
  );
}

function WorkflowSummaryCard({
  badge,
  metrics,
  mode,
  onOpen,
  title,
}: {
  badge: string;
  metrics: WorkflowMetric[];
  mode: WorkflowCanvasMode;
  onOpen: () => void;
  title: string;
}) {
  return (
    <section className="bg-background mt-1 overflow-hidden rounded-xl border shadow-xs">
      <header className="bg-muted/25 flex h-11 items-center gap-2.5 border-b px-3">
        <span className="bg-background grid size-7 shrink-0 place-items-center rounded-lg border shadow-xs">
          <GitBranch className="text-muted-foreground size-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium">{title}</p>
          <p className="text-muted-foreground truncate text-[10px]">
            Interactive workflow workspace
          </p>
        </div>
        <Badge
          variant="secondary"
          className="h-5 rounded-md px-1.5 text-[9px] font-normal"
        >
          {badge}
        </Badge>
      </header>

      <div className="p-2.5">
        <WorkflowCardPreview mode={mode} />
        <div className="mt-2 grid grid-cols-3 divide-x overflow-hidden rounded-lg border">
          {metrics.slice(0, 3).map((metric) => (
            <div key={metric.label} className="bg-muted/10 min-w-0 px-2 py-1.5">
              <p className="truncate text-[11px] font-medium tabular-nums">
                {metric.value}
              </p>
              <p className="text-muted-foreground mt-0.5 truncate text-[9px]">
                {metric.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <footer className="flex h-10 items-center justify-between gap-2 border-t px-3">
        <span className="text-muted-foreground flex items-center gap-1.5 text-[10px]">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Workspace ready
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 px-2.5 text-[10px] shadow-xs"
          onClick={onOpen}
        >
          <Maximize2 aria-hidden="true" />
          Open workflow
        </Button>
      </footer>
    </section>
  );
}

export function AiWorkflowScreenShell({
  assistantText,
  badge,
  cardTitle,
  children,
  headerTitle,
  metrics,
  recentLabel,
  summaryMode,
  userText,
}: AiWorkflowScreenShellProps) {
  const [model, setModel] = React.useState(defaultAiModelId);
  const [prompt, setPrompt] = React.useState("");
  const chat = useMockChat();
  const [panelOpen, setPanelOpen] = React.useState(true);
  const [expanded, setExpanded] = React.useState(false);

  const userMessage = React.useMemo<AiChatMessageData>(
    () => ({
      id: `${recentLabel}-user`,
      role: "user",
      parts: [{ type: "text", text: userText }],
    }),
    [recentLabel, userText],
  );
  const assistantMessage = React.useMemo<AiChatMessageData>(
    () => ({
      id: `${recentLabel}-assistant`,
      role: "assistant",
      parts: [{ type: "text", text: assistantText }],
    }),
    [assistantText, recentLabel],
  );

  const workspace = children({
    expanded,
    open: panelOpen,
    setExpanded,
    setOpen: setPanelOpen,
  });

  return (
    <AiWorkspaceShell
      activeWorkflow={recentLabel}
      headerTitle={headerTitle}
      hideNavigationSidebar
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
      <AiCodingWorkspace
        chat={
          <div className="flex min-h-0 flex-1 flex-col">
            <h1 className="sr-only">{headerTitle}</h1>
            <div className="flex h-12 shrink-0 items-center border-b px-4">
              <span className="text-xs font-medium">Workflow thread</span>
              <Button
                variant="ghost"
                size="icon-sm"
                className="ml-auto size-7"
                aria-label={panelOpen ? "Close workflow" : "Open workflow"}
                aria-pressed={panelOpen}
                onClick={() => {
                  if (panelOpen) setExpanded(false);
                  setPanelOpen(!panelOpen);
                }}
              >
                <PanelRightOpen aria-hidden="true" />
              </Button>
            </div>

            <AiConversationScroller>
              <div className="mx-auto flex w-full max-w-xl flex-col gap-8 px-4 py-8 sm:px-5">
                <AiChatMessage message={userMessage} />
                <AiChatMessage
                  message={assistantMessage}
                  assistantAvatar={
                    <AnimatedAgentBlob
                      className="size-8"
                      colors={["#050505", "#737373", "#050505"]}
                      silhouette="orb"
                      phase={0.9}
                      decorative
                    />
                  }
                  assistantHeader={
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-[13px] font-medium">
                        Shadcnblocks AI
                      </span>
                      <span className="text-muted-foreground text-xs">
                        Workflow agent
                      </span>
                    </div>
                  }
                  actions={
                    <WorkflowSummaryCard
                      badge={badge}
                      metrics={metrics}
                      mode={summaryMode}
                      onOpen={() => setPanelOpen(true)}
                      title={cardTitle}
                    />
                  }
                />
              </div>
              {chat.messages.length > 0 && (
                <div
                  className="mx-auto w-full max-w-3xl space-y-6 px-4 py-4"
                  aria-live="polite"
                >
                  {chat.messages.map((message) => (
                    <div
                      key={message.id}
                      className="text-sm whitespace-pre-wrap"
                    >
                      <p className="mb-2 font-medium">
                        {message.role === "user" ? "You" : "Assistant"}
                      </p>
                      {message.text}
                    </div>
                  ))}
                </div>
              )}
            </AiConversationScroller>

            <div className="bg-background shrink-0 px-4 pt-3 pb-4 sm:px-5">
              <AiChatComposer
                className="max-w-xl"
                aria-label={`Continue ${headerTitle}`}
                onSubmit={(event) => {
                  event.preventDefault();
                  if (chat.send(prompt)) setPrompt("");
                }}
              >
                <AiChatComposerEditor
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Ask for a workflow change…"
                  className="min-h-16"
                />
                <AiChatComposerToolbar>
                  <AiChatComposerToolbarGroup>
                    <AiChatComposerAction label="Add workflow context">
                      <Plus aria-hidden="true" />
                    </AiChatComposerAction>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => setPanelOpen(true)}
                    >
                      <GitBranch aria-hidden="true" />
                      Canvas
                    </Button>
                  </AiChatComposerToolbarGroup>
                  <AiChatComposerToolbarGroup className="shrink-0">
                    <AiModelPicker value={model} onValueChange={setModel} />
                    <AiChatComposerSubmit disabled={!prompt.trim()} />
                  </AiChatComposerToolbarGroup>
                </AiChatComposerToolbar>
              </AiChatComposer>
            </div>
          </div>
        }
        codePanel={workspace}
        codePanelOpen={panelOpen}
        codePanelExpanded={expanded}
        defaultPanelWidthPercent={72}
        onCodePanelOpenChange={(open) => {
          setPanelOpen(open);
          if (!open) setExpanded(false);
        }}
        panelTitle="Workflow workspace"
      />
    </AiWorkspaceShell>
  );
}
