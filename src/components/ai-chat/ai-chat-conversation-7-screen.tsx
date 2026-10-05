"use client";

import {
  Check,
  Code2,
  FileCode2,
  Monitor,
  PanelRightClose,
  PanelRightOpen,
  RefreshCw,
  Share2,
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
import { AiCodingWorkspace } from "@/components/ai-chat/ai-coding-workspace";
import {
  AiConversationScroller,
  AiConversationTurn,
} from "@/components/ai-chat/ai-conversation-scroller";
import {
  aiMarketingFiles,
  defaultAiMarketingFile,
} from "@/components/ai-chat/ai-marketing-demo-data";
import {
  AiModelPicker,
  defaultAiModelId,
} from "@/components/ai-chat/ai-model-picker";
import {
  type AiPreviewPanelMode,
  AiPreviewWorkspacePanel,
} from "@/components/ai-chat/ai-preview-workspace-panel";
import { AiWorkspaceShell } from "@/components/ai-chat/ai-workspace-shell";
import { AnimatedAgentBlob } from "@/components/ai-chat/animated-agent-blob";
import { useMockChat } from "@/components/ai-chat/use-mock-chat";
import {
  Task,
  TaskContent,
  TaskItem,
  TaskItemFile,
  TaskTrigger,
} from "@/components/ai-elements/task";
import { Button } from "@/components/ui/button";
type PreviewPartData = { kind: "preview-artifact" };

function AiUserMessage({ children }: { children: string }) {
  const message: AiChatMessageData = {
    id: "preview-user-message",
    role: "user",
    parts: [{ type: "text", text: children }],
  };

  return <AiChatMessage message={message} />;
}

function AgentMessage({ children }: { children: React.ReactNode }) {
  const message: AiChatMessageData<PreviewPartData> = {
    id: "preview-agent-message",
    role: "assistant",
    parts: [
      {
        type: "custom",
        id: "preview-artifact",
        name: "preview-artifact",
        data: { kind: "preview-artifact" },
      },
    ],
  };

  return (
    <AiChatMessage
      message={message}
      assistantAvatar={
        <AnimatedAgentBlob
          className="size-7"
          colors={["#050505", "#334155", "#050505"]}
          silhouette="squircle"
          phase={1.2}
          decorative
        />
      }
      assistantHeader={
        <div className="flex items-center gap-2">
          <span className="text-foreground text-xs font-medium">
            Shadcnblocks AI
          </span>
          <span className="text-muted-foreground text-[11px]">Code</span>
        </div>
      }
      renderPart={({ part }) =>
        part.type === "custom" && part.data.kind === "preview-artifact"
          ? children
          : undefined
      }
    />
  );
}

function CompletedTaskItem({
  children,
  file,
}: {
  children: React.ReactNode;
  file?: string;
}) {
  return (
    <TaskItem className="flex items-start gap-2 text-xs leading-5">
      <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
      <span className="min-w-0">
        <span className="text-foreground block">{children}</span>
        {file ? (
          <TaskItemFile className="mt-1 max-w-full font-mono text-[10px]">
            <FileCode2 className="size-3 shrink-0" />
            <span className="truncate">{file}</span>
          </TaskItemFile>
        ) : null}
      </span>
    </TaskItem>
  );
}

export function AiChatConversation7Screen() {
  const [model, setModel] = React.useState(defaultAiModelId);
  const [prompt, setPrompt] = React.useState("");
  const chat = useMockChat();
  const [panelOpen, setPanelOpen] = React.useState(false);
  const [workspaceExpanded, setWorkspaceExpanded] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState(
    defaultAiMarketingFile,
  );
  const [mode, setMode] = React.useState<AiPreviewPanelMode>("preview");

  React.useEffect(() => {
    if (window.matchMedia("(min-width: 980px)").matches) setPanelOpen(true);
  }, []);

  function openFile(path: string, nextMode: AiPreviewPanelMode = "code") {
    if (!(path in aiMarketingFiles)) return;
    setSelectedFile(path);
    setMode(nextMode);
    setPanelOpen(true);
  }

  const panel = (
    <AiPreviewWorkspacePanel
      expanded={workspaceExpanded}
      mode={mode}
      selectedFile={selectedFile}
      onClose={() => {
        setPanelOpen(false);
        setWorkspaceExpanded(false);
      }}
      onExpandedChange={setWorkspaceExpanded}
      onModeChange={setMode}
      onSelectFile={setSelectedFile}
    />
  );

  return (
    <AiWorkspaceShell
      headerTitle="Live preview and code artifacts"
      hideNavigationSidebar
      headerActions={
        <>
          <Button
            variant="ghost"
            size="sm"
            className="hidden h-8 text-xs sm:flex"
          >
            <Share2 />
            Share
          </Button>
        </>
      }
    >
      <AiCodingWorkspace
        chat={
          <div className="flex min-h-0 flex-1 flex-col">
            <h1 className="sr-only">Live preview and code artifacts</h1>
            <div className="flex h-10 shrink-0 items-center border-b px-4">
              <span className="text-xs font-medium">Thread</span>
              <Button
                variant="ghost"
                size="icon-sm"
                className="ml-auto size-7"
                aria-label={panelOpen ? "Close workspace" : "Open workspace"}
                aria-pressed={panelOpen}
                onClick={() => {
                  if (panelOpen) setWorkspaceExpanded(false);
                  setPanelOpen(!panelOpen);
                }}
              >
                {panelOpen ? <PanelRightClose /> : <PanelRightOpen />}
              </Button>
            </div>
            <AiConversationScroller
              itemized
              contentClassName="mx-auto w-full max-w-xl px-4 py-7 sm:px-5"
            >
              <AiConversationTurn id="build" className="pb-8">
                <AiUserMessage>
                  Use the free Mainline marketing template as the starting point
                  and give me a complete responsive landing page.
                </AiUserMessage>
                <AgentMessage>
                  <p className="text-xs leading-5">
                    I’ll adapt the public Shadcnblocks template, preserve its
                    marketing hierarchy, and keep the rendered page open beside
                    this conversation.
                  </p>
                  <Task className="mt-4" defaultOpen>
                    <TaskTrigger title="Read project files" />
                    <TaskContent>
                      <CompletedTaskItem file="src/app/page.tsx">
                        Composed the complete landing page
                      </CompletedTaskItem>
                      <CompletedTaskItem file="src/components/marketing/hero.tsx">
                        Adapted the free Mainline hero
                      </CompletedTaskItem>
                      <CompletedTaskItem file="src/components/marketing/features.tsx">
                        Added the responsive feature grid
                      </CompletedTaskItem>
                    </TaskContent>
                  </Task>
                </AgentMessage>
              </AiConversationTurn>

              <AiConversationTurn id="preview" className="pb-8">
                <AiUserMessage>
                  Show me the result while we continue. Keep the repository
                  available whenever I switch into code.
                </AiUserMessage>
                <AgentMessage>
                  <p className="text-xs leading-5">
                    The preview is mounted in the large workspace. Switching to
                    Code opens the source with its repository tree without
                    replacing the conversation.
                  </p>
                  <div className="mt-4 rounded-lg border p-3">
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <Monitor className="size-3.5 text-blue-500" />
                      Preview ready
                      <span className="ml-auto size-1.5 rounded-full bg-emerald-500" />
                    </div>
                    <p className="text-muted-foreground mt-1.5 text-[11px] leading-4">
                      Rendered locally at <code>/</code> with desktop, tablet,
                      and phone viewport controls.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[11px]"
                        onClick={() => {
                          setMode("preview");
                          setPanelOpen(true);
                        }}
                      >
                        <Monitor />
                        Open preview
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-[11px]"
                        onClick={() =>
                          openFile("src/components/marketing/hero.tsx", "code")
                        }
                      >
                        <Code2 />
                        View code
                      </Button>
                    </div>
                  </div>
                </AgentMessage>
              </AiConversationTurn>

              <AiConversationTurn id="responsive">
                <AiUserMessage>
                  Check the responsive states and make sure this is an app
                  preview, not a fake browser.
                </AiUserMessage>
                <AgentMessage>
                  <p className="text-xs leading-5">
                    Confirmed. The workspace renders the React marketing page
                    directly—there is no iframe, remote URL, or browser backend.
                  </p>
                  <Task className="mt-4" defaultOpen>
                    <TaskTrigger title="Verified responsive preview" />
                    <TaskContent>
                      <CompletedTaskItem>
                        Desktop keeps the floating navigation, hero, product
                        image, and feature content visible
                      </CompletedTaskItem>
                      <CompletedTaskItem>
                        Tablet reflows the hero and feature cards cleanly
                      </CompletedTaskItem>
                      <CompletedTaskItem>
                        Phone switches to a focused single-column preview
                      </CompletedTaskItem>
                    </TaskContent>
                  </Task>
                  <div className="mt-4 flex items-center gap-2 text-[11px] text-emerald-600">
                    <RefreshCw className="size-3.5" />
                    Preview controls verified
                  </div>
                </AgentMessage>
              </AiConversationTurn>
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

            <div className="bg-background shrink-0 px-4 pt-3 pb-4 sm:px-5">
              <AiChatComposer
                className="max-w-xl"
                aria-label="Continue preview conversation"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (chat.send(prompt)) setPrompt("");
                }}
              >
                <AiChatComposerEditor
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Ask for a change or add a file…"
                  className="min-h-16"
                />
                <AiChatComposerToolbar>
                  <AiChatComposerToolbarGroup>
                    <AiChatAddContextAction />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => setPanelOpen(true)}
                    >
                      <FileCode2 />
                      Workspace
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
        codePanel={panel}
        codePanelOpen={panelOpen}
        codePanelExpanded={workspaceExpanded}
        defaultPanelWidthPercent={70}
        onCodePanelOpenChange={(open) => {
          setPanelOpen(open);
          if (!open) setWorkspaceExpanded(false);
        }}
      />
    </AiWorkspaceShell>
  );
}
