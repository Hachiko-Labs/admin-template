"use client";

import {
  Check,
  ChevronDown,
  Code2,
  Copy,
  Ellipsis,
  FileCode2,
  FileDiff,
  GitBranch,
  Github,
  PanelRightOpen,
  RefreshCw,
  Search,
  Share2,
  TerminalSquare,
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
import {
  AiCodeArtifactPanel,
  type AiCodePanelMode,
} from "@/components/ai-chat/ai-code-artifact-panel";
import {
  aiDemoFiles,
  defaultAiDemoFile,
} from "@/components/ai-chat/ai-coding-demo-data";
import { AiCodingWorkspace } from "@/components/ai-chat/ai-coding-workspace";
import {
  AiConversationScroller,
  AiConversationTurn,
} from "@/components/ai-chat/ai-conversation-scroller";
import {
  AiModelPicker,
  defaultAiModelId,
} from "@/components/ai-chat/ai-model-picker";
import { AiWorkspaceShell } from "@/components/ai-chat/ai-workspace-shell";
import { AnimatedAgentBlob } from "@/components/ai-chat/animated-agent-blob";
import { useMockChat } from "@/components/ai-chat/use-mock-chat";
import { Button } from "@/components/ui/button";
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";
import { cn } from "@/lib/utils";

const conversationOutline = [
  { id: "brief", label: "Initial brief" },
  { id: "implementation", label: "Implementation" },
  { id: "architecture", label: "Architecture decision" },
  { id: "responsive", label: "Responsive review" },
  { id: "continuity", label: "Workspace continuity" },
  { id: "accessibility", label: "Accessibility review" },
];

interface FileReferenceProps {
  additions?: number;
  children: React.ReactNode;
  deletions?: number;
  onClick: () => void;
}

function FileReference({
  additions,
  children,
  deletions,
  onClick,
}: FileReferenceProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="hover:bg-accent focus-visible:ring-ring bg-background inline-flex max-w-full items-center gap-2 rounded-md border px-2 py-1 text-left font-mono text-[11px] shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none"
    >
      <FileCode2
        className="size-3.5 shrink-0 text-blue-500"
        aria-hidden="true"
      />
      <span className="truncate">{children}</span>
      {additions !== undefined ? (
        <span className="ml-auto flex shrink-0 gap-1 tabular-nums">
          <span className="text-emerald-600">+{additions}</span>
          {deletions ? (
            <span className="text-red-500">−{deletions}</span>
          ) : null}
        </span>
      ) : null}
    </button>
  );
}

type CodingPartData = { kind: "coding-artifact" };

function AiUserMessage({ children }: { children: string }) {
  const message: AiChatMessageData = {
    id: "coding-user-message",
    role: "user",
    parts: [{ type: "text", text: children }],
  };

  return <AiChatMessage message={message} />;
}

function AgentMessage({ children }: { children: React.ReactNode }) {
  const message: AiChatMessageData<CodingPartData> = {
    id: "coding-agent-message",
    role: "assistant",
    parts: [
      {
        type: "custom",
        id: "coding-artifact",
        name: "coding-artifact",
        data: { kind: "coding-artifact" },
      },
    ],
  };

  return (
    <AiChatMessage
      className="gap-3.5"
      message={message}
      assistantAvatar={
        <AnimatedAgentBlob
          className="size-8"
          colors={["#050505", "#1f2937", "#050505"]}
          silhouette="squircle"
          phase={0.8}
          decorative
        />
      }
      assistantHeader={
        <div className="mb-1 flex items-center gap-2">
          <span className="text-[13px] font-medium">Shadcnblocks AI</span>
          <span className="text-muted-foreground text-xs">Code</span>
        </div>
      }
      renderPart={({ part }) =>
        part.type === "custom" && part.data.kind === "coding-artifact"
          ? children
          : undefined
      }
    />
  );
}

export function AiChatConversation5Screen() {
  const [model, setModel] = React.useState(defaultAiModelId);
  const [prompt, setPrompt] = React.useState("");
  const chat = useMockChat();
  const [codePanelOpen, setCodePanelOpen] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState(defaultAiDemoFile);
  const [panelMode, setPanelMode] = React.useState<AiCodePanelMode>("diff");

  React.useEffect(() => {
    if (window.matchMedia("(min-width: 980px)").matches) setCodePanelOpen(true);
  }, []);

  function openFile(path: string, mode: AiCodePanelMode = "code") {
    if (!(path in aiDemoFiles)) return;
    setSelectedFile(path);
    setPanelMode(mode);
    setCodePanelOpen(true);
  }

  function submitPrompt(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!chat.send(prompt)) return;
    setPrompt("");
  }

  const codePanel = (
    <AiCodeArtifactPanel
      mode={panelMode}
      selectedFile={selectedFile}
      onClose={() => setCodePanelOpen(false)}
      onModeChange={setPanelMode}
      onSelectFile={(path) => openFile(path, panelMode)}
    />
  );

  return (
    <AiWorkspaceShell
      activeRecent="Build revenue overview"
      headerTitle="Code changes and repository context"
      hideNavigationSidebar
      headerActions={
        <>
          {!codePanelOpen ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setCodePanelOpen(true)}
            >
              <PanelRightOpen data-icon="inline-start" aria-hidden="true" />
              Code
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="sm"
            className="hidden h-8 text-xs sm:flex"
          >
            <Share2 data-icon="inline-start" aria-hidden="true" />
            Share
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="More actions">
            <Ellipsis aria-hidden="true" />
          </Button>
        </>
      }
    >
      <AiCodingWorkspace
        codePanelOpen={codePanelOpen}
        onCodePanelOpenChange={setCodePanelOpen}
        codePanel={codePanel}
        chat={
          <div className="flex min-h-0 flex-1 flex-col">
            <h1 className="sr-only">Code changes and repository context</h1>
            <AiConversationScroller
              itemized
              outlineItems={conversationOutline}
              contentClassName="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 md:py-10"
            >
              <AiConversationTurn id="brief" className="pb-9">
                <AiUserMessage>
                  Build the revenue overview from the dashboard brief. Keep the
                  existing metric cards, add a six-month chart, and make sure it
                  follows our shadcn patterns rather than introducing another
                  chart abstraction.
                </AiUserMessage>

                <AgentMessage>
                  <p className="text-sm leading-6">
                    I’ll trace the existing dashboard and chart primitives
                    first, then make the smallest set of changes needed for the
                    overview.
                  </p>

                  <details open className="group mt-4">
                    <summary className="w-fit cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                      <Marker className="w-fit">
                        <MarkerIcon>
                          <ChevronDown className="-rotate-90 transition-transform group-open:rotate-0" />
                        </MarkerIcon>
                        <MarkerContent>Explored the repository</MarkerContent>
                      </Marker>
                    </summary>
                    <div className="mt-4 ml-2.5 space-y-4 border-l pl-5 text-sm">
                      <div className="relative">
                        <Search className="text-muted-foreground bg-background absolute top-0.5 -left-[27px] size-3.5" />
                        <p className="text-muted-foreground">
                          Found the dashboard route, shared cards, chart
                          wrapper, and currency formatter.
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <FileReference
                          onClick={() => openFile("src/app/dashboard/page.tsx")}
                        >
                          src/app/dashboard/page.tsx
                        </FileReference>
                        <FileReference
                          onClick={() =>
                            openFile("src/components/ui/chart.tsx")
                          }
                        >
                          src/components/ui/chart.tsx
                        </FileReference>
                      </div>
                      <div className="relative flex items-center gap-2">
                        <Check className="bg-background absolute -left-[27px] size-3.5 text-emerald-600" />
                        <span>Implementation plan ready</span>
                      </div>
                    </div>
                  </details>

                  <p className="mt-5 text-sm leading-6">
                    The app already has the right chart container and tooltip.
                    I’ll reuse those directly, keep the page server-rendered,
                    and isolate Recharts in a small client component.
                  </p>
                </AgentMessage>
              </AiConversationTurn>

              <AiConversationTurn id="implementation" className="pb-9">
                <AiUserMessage>
                  Good. Keep the chart quiet and editorial—no gradient-heavy
                  treatment. Also show trend context on the cards.
                </AiUserMessage>

                <AgentMessage>
                  <div className="space-y-3 text-sm leading-6">
                    <p>
                      Implemented the restrained version. The chart uses one
                      area series, a light fill, horizontal grid lines, and the
                      existing theme token. Trend values are optional so the
                      card remains reusable elsewhere.
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <FileReference
                        additions={34}
                        deletions={1}
                        onClick={() =>
                          openFile(
                            "src/components/dashboard/revenue-chart.tsx",
                            "diff",
                          )
                        }
                      >
                        revenue-chart.tsx
                      </FileReference>
                      <FileReference
                        additions={8}
                        deletions={3}
                        onClick={() =>
                          openFile(
                            "src/components/dashboard/metric-card.tsx",
                            "diff",
                          )
                        }
                      >
                        metric-card.tsx
                      </FileReference>
                      <FileReference
                        additions={12}
                        deletions={2}
                        onClick={() =>
                          openFile("src/app/dashboard/page.tsx", "diff")
                        }
                      >
                        dashboard/page.tsx
                      </FileReference>
                      <FileReference
                        additions={7}
                        onClick={() =>
                          openFile("src/lib/format-currency.ts", "diff")
                        }
                      >
                        format-currency.ts
                      </FileReference>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => {
                        setPanelMode("diff");
                        setCodePanelOpen(true);
                      }}
                    >
                      <FileDiff aria-hidden="true" />
                      Review 4 changed files
                    </Button>
                    <span className="text-muted-foreground text-xs">
                      +61 −6
                    </span>
                  </div>
                </AgentMessage>
              </AiConversationTurn>

              <AiConversationTurn id="architecture" className="pb-9">
                <AiUserMessage>
                  Why did you extend the existing metric card instead of making
                  a separate trend card? I want to avoid two nearly identical
                  dashboard primitives.
                </AiUserMessage>

                <AgentMessage>
                  <div className="space-y-4 text-sm leading-6">
                    <p>
                      A separate component would duplicate the label, value,
                      spacing, and responsive behavior. The existing card only
                      needed one optional <code>trend</code> prop, so screens
                      without trend context render exactly as before.
                    </p>

                    <FileReference
                      additions={8}
                      deletions={3}
                      onClick={() =>
                        openFile(
                          "src/components/dashboard/metric-card.tsx",
                          "diff",
                        )
                      }
                    >
                      src/components/dashboard/metric-card.tsx
                    </FileReference>

                    <div className="bg-muted/20 rounded-lg border px-3 py-3">
                      <p className="text-xs font-medium">Compatibility check</p>
                      <ul className="text-muted-foreground mt-2 space-y-1.5 text-xs">
                        <li>12 existing usages render without changes</li>
                        <li>The trend remains optional and text-readable</li>
                        <li>No additional client boundary was introduced</li>
                      </ul>
                    </div>
                  </div>
                </AgentMessage>
              </AiConversationTurn>

              <AiConversationTurn id="responsive" className="pb-9">
                <AiUserMessage>
                  Run a responsive pass too. Check the narrow phone layout, a
                  tablet width, and the full desktop with the repository panel
                  open. I don’t want the composer or chart creating horizontal
                  overflow.
                </AiUserMessage>

                <AgentMessage>
                  <p className="text-sm leading-6">
                    I tested the three workspace sizes with the conversation and
                    code surfaces in their real responsive modes.
                  </p>

                  <details open className="group mt-4">
                    <summary className="w-fit cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                      <Marker className="w-fit">
                        <MarkerIcon>
                          <ChevronDown className="-rotate-90 transition-transform group-open:rotate-0" />
                        </MarkerIcon>
                        <MarkerContent>
                          Responsive review · 3 viewports
                        </MarkerContent>
                      </Marker>
                    </summary>

                    <div className="mt-4 ml-2.5 space-y-4 border-l pl-5 text-sm">
                      {[
                        {
                          label: "390 px",
                          detail:
                            "Single-column conversation; code opens as a full-screen sheet with a unified diff.",
                        },
                        {
                          label: "768 px",
                          detail:
                            "Composer controls remain reachable and file references wrap without clipping.",
                        },
                        {
                          label: "1440 px",
                          detail:
                            "Resizable split preserves readable chat and code columns with independent scrolling.",
                        },
                      ].map((viewport) => (
                        <div key={viewport.label} className="relative">
                          <Check className="bg-background absolute top-0.5 -left-[27px] size-3.5 text-emerald-600" />
                          <div className="flex items-baseline gap-2">
                            <span className="shrink-0 font-mono text-xs font-medium">
                              {viewport.label}
                            </span>
                            <span className="text-muted-foreground text-xs leading-5">
                              {viewport.detail}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>

                  <p className="text-muted-foreground mt-5 text-sm leading-6">
                    No document-level horizontal overflow was introduced. On
                    narrow screens, long code lines scroll inside the code
                    surface rather than widening the workspace.
                  </p>
                </AgentMessage>
              </AiConversationTurn>

              <AiConversationTurn id="continuity" className="pb-9">
                <AiUserMessage>
                  One more thing: make sure switching between files doesn’t
                  reset the conversation or lose my position in the thread.
                </AiUserMessage>

                <AgentMessage>
                  <div className="space-y-4 text-sm leading-6">
                    <p>
                      Confirmed. The conversation and composer stay mounted
                      while the right workspace changes files or switches
                      between code and diff views. Each side owns its scroll
                      container, so reviewing a file does not move the thread.
                    </p>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() =>
                          openFile(
                            "src/components/dashboard/revenue-chart.tsx",
                            "code",
                          )
                        }
                        className="hover:bg-accent focus-visible:ring-ring rounded-lg border px-3 py-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
                      >
                        <span className="flex items-center gap-2 text-xs font-medium">
                          <Code2 className="size-3.5 text-blue-500" />
                          Open source
                        </span>
                        <span className="text-muted-foreground mt-1 block text-xs">
                          Keep this conversation position
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          openFile(
                            "src/components/dashboard/revenue-chart.tsx",
                            "diff",
                          )
                        }
                        className="hover:bg-accent focus-visible:ring-ring rounded-lg border px-3 py-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
                      >
                        <span className="flex items-center gap-2 text-xs font-medium">
                          <FileDiff className="size-3.5 text-violet-500" />
                          Open changes
                        </span>
                        <span className="text-muted-foreground mt-1 block text-xs">
                          Preserve the active file selection
                        </span>
                      </button>
                    </div>
                  </div>
                </AgentMessage>
              </AiConversationTurn>

              <AiConversationTurn id="accessibility">
                <AiUserMessage>
                  Check the implementation for accessibility and any unnecessary
                  client boundaries before we call it done.
                </AiUserMessage>

                <AgentMessage>
                  <div className="space-y-4 text-sm leading-6">
                    <p>
                      Reviewed it. The page and metric cards stay server
                      components; only the chart crosses the client boundary.
                      The chart enables Recharts’ accessibility layer, headings
                      remain ordered, and trend color is supplemental to the
                      visible percentage text.
                    </p>

                    <div className="bg-muted/20 rounded-lg border px-3 py-2.5">
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <TerminalSquare className="text-muted-foreground size-3.5" />
                        pnpm lint &amp;&amp; pnpm typecheck
                        <Check className="ml-auto size-3.5 text-emerald-600" />
                      </div>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Completed with no errors
                      </p>
                    </div>

                    <p>
                      The overview is ready to review. I left the code workspace
                      open on the chart diff so the visual and implementation
                      decisions are easy to inspect together.
                    </p>
                  </div>

                  <div className="mt-5 flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Copy response"
                    >
                      <Copy aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Good response"
                    >
                      <ThumbsUp aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Bad response"
                    >
                      <ThumbsDown aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Regenerate response"
                    >
                      <RefreshCw aria-hidden="true" />
                    </Button>
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

            <div className="bg-background shrink-0 px-4 pt-3 pb-4 sm:px-6">
              <AiChatComposer
                aria-label="Continue coding conversation"
                className={cn(
                  "max-w-3xl",
                  codePanelOpen && "min-[980px]:max-w-2xl",
                )}
                onSubmit={submitPrompt}
                rail={
                  <AiChatComposerRail className="hidden sm:flex">
                    <span className="flex items-center gap-1.5">
                      <GitBranch className="size-3.5" aria-hidden="true" />
                      main
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Github className="size-3.5" aria-hidden="true" />
                      shadcn-analytics
                    </span>
                  </AiChatComposerRail>
                }
              >
                <AiChatComposerEditor
                  aria-label="Reply to the code agent"
                  placeholder="Ask for a change, use @ to add a file, or / for commands"
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
                      onClick={() => setCodePanelOpen(true)}
                    >
                      <Code2 aria-hidden="true" />
                      Codebase
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
        }
      />
    </AiWorkspaceShell>
  );
}
