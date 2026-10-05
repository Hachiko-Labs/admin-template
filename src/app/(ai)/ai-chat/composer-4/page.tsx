"use client";

import {
  FileCheck2,
  Link2,
  Mic,
  Orbit,
  PanelLeft,
  SlidersHorizontal,
  SquarePen,
  UsersRound,
  Waypoints,
} from "lucide-react";
import * as React from "react";
import { SiFigma, SiGithub, SiNotion, SiSlack } from "react-icons/si";

import {
  AiChatComposer,
  AiChatComposerAction,
  AiChatComposerEditor,
  AiChatComposerRail,
  AiChatComposerSubmit,
  AiChatComposerToolbar,
  AiChatComposerToolbarGroup,
} from "@/components/ai-chat/ai-chat-composer";
import { AiChatAddContextAction } from "@/components/ai-chat/ai-chat-context-picker";
import { AiComposerMobileHeader } from "@/components/ai-chat/ai-composer-navigation";
import {
  AiModelPicker,
  defaultAiModelId,
} from "@/components/ai-chat/ai-model-picker";
import {
  AiSidebarGlideGroup,
  AiSidebarRow,
  AiSidebarSectionHeader,
} from "@/components/ai-chat/ai-navigation-sidebar";
import { AiSessionActions } from "@/components/ai-chat/ai-session-actions";
import { aiTeams, AiTeamSwitcher } from "@/components/ai-chat/ai-team-switcher";
import { AnimatedAgentBlob } from "@/components/ai-chat/animated-agent-blob";
import { useMockChat } from "@/components/ai-chat/use-mock-chat";
import { HeaderNotifications } from "@/components/layout/header-notifications";
import { Button } from "@/components/ui/button";
import { Portal, PortalSlot } from "@/components/ui/portal-slot";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const workspaceActions = [
  { icon: SquarePen, label: "New session", prompt: "" },
  {
    icon: UsersRound,
    label: "Agent library",
    prompt: "Help me choose or build the right agent for this task",
  },
  {
    icon: Link2,
    label: "Connections",
    prompt: "Connect the tools used by my product team",
  },
  {
    icon: Waypoints,
    label: "Workflows",
    prompt: "Create an automated workflow for ",
  },
  {
    icon: FileCheck2,
    label: "Deliverables",
    prompt: "Define the deliverables and acceptance criteria for ",
  },
];

const sidebarAgents = [
  {
    name: "Screen Review",
    prompt: "Ask the Screen Review Agent to review this interface",
    colors: ["#67e8f9", "#3b82f6", "#8b5cf6"] as const,
    phase: 0.3,
    silhouette: "hexagon" as const,
  },
  {
    name: "Release Planner",
    prompt: "Ask the Release Planner to create a launch checklist",
    colors: ["#f9a8d4", "#ec4899", "#fdba74"] as const,
    phase: 1.8,
    silhouette: "capsule" as const,
  },
  {
    name: "Research Assistant",
    prompt: "Ask the Research Assistant to investigate this request",
    colors: ["#86efac", "#14b8a6", "#3b82f6"] as const,
    phase: 2.5,
    silhouette: "droplet" as const,
  },
];

const recentChats = [
  "Build a screen review agent",
  "Connect the product stack",
  "Automate design review intake",
  "Plan the release workflow",
];

const recentActivity = [
  "Screen Review finished a run",
  "GitHub connection added",
  "Design review workflow published",
];

const connectedTools = [
  { icon: SiGithub, label: "GitHub", className: "text-foreground" },
  { icon: SiNotion, label: "Notion", className: "text-foreground" },
  { icon: SiSlack, label: "Slack", className: "text-[#E01E5A]" },
  { icon: SiFigma, label: "Figma", className: "text-[#F24E1E]" },
];

const quickStarts = [
  {
    icon: Orbit,
    title: "Build Agent",
    description: "Design your AI teammate from scratch.",
    action: "Build",
    prompt: "Help me build an agent for reviewing admin screens",
  },
  {
    icon: Link2,
    title: "Connect tools",
    description: "Link your favorite apps in minutes.",
    action: "Connect",
    prompt: "Connect the tools used by my product team",
  },
  {
    icon: Waypoints,
    title: "Activate Workflow",
    description: "Automate tasks end to end, hands-free.",
    action: "Workflow",
    prompt: "Create a workflow for triaging design review requests",
  },
];

const agents = [
  {
    name: "Screen Review Agent",
    description: "Reviews hierarchy, accessibility, and component consistency.",
    colors: ["#67e8f9", "#3b82f6", "#8b5cf6"] as const,
    phase: 0.3,
    silhouette: "hexagon" as const,
  },
  {
    name: "Release Planner",
    description: "Turns product changes into a clear launch checklist.",
    colors: ["#f9a8d4", "#ec4899", "#fdba74"] as const,
    phase: 1.8,
    silhouette: "capsule" as const,
  },
];

function ComposerSidebar({
  onNewSession,
  onPromptSelect,
}: {
  onNewSession: () => void;
  onPromptSelect: (prompt: string) => void;
}) {
  const [tab, setTab] = React.useState<"create" | "activity">("create");
  const [activityRead, setActivityRead] = React.useState(false);

  return (
    <>
      <div className="ai-sidebar-copy bg-sidebar-accent mx-2 mt-2 grid grid-cols-2 gap-1 rounded-lg p-1">
        <button
          type="button"
          onClick={() => setTab("create")}
          className={cn(
            "text-muted-foreground flex h-6 items-center justify-center rounded-md text-[12.5px] font-medium transition-colors",
            tab === "create" && "bg-background text-foreground shadow-sm",
          )}
        >
          Create
        </button>
        <button
          type="button"
          onClick={() => setTab("activity")}
          className={cn(
            "text-muted-foreground flex h-6 items-center justify-center gap-1.5 rounded-md text-[12.5px] font-medium transition-colors",
            tab === "activity" && "bg-background text-foreground shadow-sm",
          )}
        >
          Activity
          {!activityRead ? (
            <span className="bg-foreground text-background flex size-4 items-center justify-center rounded text-[10px] font-medium">
              3
            </span>
          ) : null}
        </button>
      </div>

      {tab === "create" ? (
        <>
          <AiSidebarGlideGroup>
            {workspaceActions.map((item) => (
              <AiSidebarRow
                key={item.label}
                icon={item.icon}
                label={item.label}
                onClick={() => {
                  if (item.label === "New session") onNewSession();
                  else onPromptSelect(item.prompt);
                }}
              />
            ))}
          </AiSidebarGlideGroup>

          <div className="mt-3">
            <AiSidebarSectionHeader>Agents</AiSidebarSectionHeader>
            <AiSidebarGlideGroup>
              {sidebarAgents.map((agent) => (
                <AiSidebarRow
                  key={agent.name}
                  icon={UsersRound}
                  label={agent.name}
                  onClick={() => onPromptSelect(agent.prompt)}
                />
              ))}
            </AiSidebarGlideGroup>
          </div>

          <div className="mt-3">
            <AiSidebarSectionHeader>Chats</AiSidebarSectionHeader>
            <AiSidebarGlideGroup>
              {recentChats.map((chat) => (
                <AiSidebarRow
                  key={chat}
                  label={chat}
                  onClick={() => onPromptSelect(`Continue “${chat}”: `)}
                  textOnly
                />
              ))}
            </AiSidebarGlideGroup>
          </div>
        </>
      ) : (
        <div className="mt-3">
          <AiSidebarSectionHeader
            action={
              !activityRead ? (
                <button
                  type="button"
                  onClick={() => setActivityRead(true)}
                  className="hover:text-foreground text-[11px]"
                >
                  Mark read
                </button>
              ) : null
            }
          >
            Recent activity
          </AiSidebarSectionHeader>
          <AiSidebarGlideGroup>
            {recentActivity.map((item) => (
              <AiSidebarRow key={item} label={item} textOnly />
            ))}
          </AiSidebarGlideGroup>
        </div>
      )}
    </>
  );
}

export default function AiChatComposer4Page() {
  const [teams, setTeams] = React.useState(aiTeams);
  const [team, setTeam] = React.useState(aiTeams[0].id);
  const activeTeam = teams.find((item) => item.id === team) ?? teams[0];

  const addTeam = (name: string) => {
    const newTeam = { id: crypto.randomUUID(), name };
    setTeams((current) => [...current, newTeam]);
    setTeam(newTeam.id);
  };

  React.useEffect(() => {
    const switchTeam = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey)
        return;
      const selected = teams[Number(event.key) - 1];
      if (!/^[1-9]$/.test(event.key) || !selected) return;
      event.preventDefault();
      setTeam(selected.id);
    };
    window.addEventListener("keydown", switchTeam);
    return () => window.removeEventListener("keydown", switchTeam);
  }, [teams]);
  const [secondaryOpen, setSecondaryOpen] = React.useState(true);
  const [model, setModel] = React.useState(defaultAiModelId);
  const [prompt, setPrompt] = React.useState("");
  const chat = useMockChat();
  const [contextPickerKey, setContextPickerKey] = React.useState(0);

  function submitPrompt(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!chat.send(prompt)) return;
    setPrompt("");
  }

  function startNewSession() {
    chat.reset();
    setPrompt("");
    setModel(defaultAiModelId);
    setContextPickerKey((current) => current + 1);
  }

  const workspaceHeader = (
    <div className="flex w-full min-w-0 items-center gap-1">
      <div className="min-w-0 flex-1">
        <AiTeamSwitcher
          teams={teams}
          value={team}
          onValueChange={setTeam}
          onAddTeam={addTeam}
        />
      </div>
      <HeaderNotifications appearance="icon" />
    </div>
  );

  return (
    <div className="bg-background flex h-svh w-full overflow-hidden font-sans tracking-[-0.15px]">
      <AiComposerMobileHeader
        workspaceName={activeTeam.name}
        workspaceSwitcher={workspaceHeader}
      >
        <ComposerSidebar
          onNewSession={startNewSession}
          onPromptSelect={setPrompt}
        />
      </AiComposerMobileHeader>

      <Sidebar
        id="ai-workspace-navigation"
        collapsible="none"
        aria-label="AI workspace navigation"
        className={`${secondaryOpen ? "md:flex" : "md:hidden"} hidden w-[234px] shrink-0 border-r [font-feature-settings:'cv11','ss01'] text-[14px] leading-[1.5]`}
      >
        <SidebarHeader className="flex h-[var(--ai-workspace-header-height,3.5rem)] shrink-0 justify-center">
          {workspaceHeader}
        </SidebarHeader>
        <SidebarContent className="gap-0 pb-3">
          <ComposerSidebar
            onNewSession={startNewSession}
            onPromptSelect={setPrompt}
          />
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="min-h-0 min-w-0 overflow-hidden">
        <header className="hidden h-[var(--ai-workspace-header-height,3.5rem)] shrink-0 items-center gap-2 md:flex">
          <div className="flex min-w-0 flex-1 items-center gap-2 px-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 shrink-0"
              aria-label="Toggle AI workspace navigation"
              aria-controls="ai-workspace-navigation"
              aria-expanded={secondaryOpen}
              onClick={() => setSecondaryOpen((open) => !open)}
            >
              <PanelLeft aria-hidden="true" />
            </Button>
            <Separator orientation="vertical" className="mr-2 h-4" />
            <span className="truncate text-sm font-medium">Composer 4</span>
          </div>
          <PortalSlot name="ai-header-actions" className="shrink-0" />
        </header>

        <Portal to="ai-header-actions">
          <AiSessionActions
            transcript={chat.messages
              .map(
                (message) =>
                  `## ${message.role === "user" ? "You" : "Assistant"}\n\n${message.text}`,
              )
              .join("\n\n")}
            onClear={startNewSession}
          />
        </Portal>
        <section className="min-w-0 flex-1 overflow-y-auto px-4 pt-16 pb-12 sm:px-6 md:pt-16 lg:px-8 lg:pt-24">
          <div className="mx-auto flex w-full max-w-4xl flex-col">
            <div className="mx-auto w-full max-w-[720px]">
              <div className="mb-7">
                <div className="ai-home-reveal ai-home-reveal-kicker w-fit">
                  <AnimatedAgentBlob
                    className="size-11"
                    colors={["#050505", "#111111", "#050505"]}
                    phase={0.8}
                    silhouette="orb"
                    decorative
                  />
                </div>
                <h1 className="ai-home-reveal ai-home-reveal-title mt-4 text-2xl font-medium tracking-tight sm:text-[28px]">
                  What do you want to build?
                </h1>
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
              <AiChatComposer
                className="ai-home-reveal ai-home-reveal-composer"
                density="compact"
                placement="home"
                aria-label="AI workspace composer"
                onSubmit={submitPrompt}
                rail={
                  <AiChatComposerRail className="gap-2">
                    <Link2 className="size-3.5 shrink-0" />
                    <span className="min-w-0 flex-1 truncate">
                      Connect tools to AI Admin Kit
                    </span>
                    <div className="hidden shrink-0 items-center gap-1 sm:flex">
                      {connectedTools.map((tool) => {
                        const Icon = tool.icon;
                        return (
                          <button
                            key={tool.label}
                            type="button"
                            aria-label={tool.label}
                            title={tool.label}
                            className="bg-background hover:bg-accent flex size-6 items-center justify-center rounded-md border"
                          >
                            <Icon className={cn("size-3", tool.className)} />
                          </button>
                        );
                      })}
                    </div>
                  </AiChatComposerRail>
                }
              >
                <AiChatComposerEditor
                  aria-label="Describe what you want to build"
                  placeholder="Assign a task, ask a question, or describe what to build"
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                />
                <AiChatComposerToolbar>
                  <AiChatComposerToolbarGroup>
                    <AiChatAddContextAction key={contextPickerKey} />
                    <AiChatComposerAction label="Connect a tool">
                      <Link2 />
                    </AiChatComposerAction>
                    <AiChatComposerAction label="Configure task">
                      <SlidersHorizontal />
                    </AiChatComposerAction>
                  </AiChatComposerToolbarGroup>
                  <AiChatComposerToolbarGroup side="end">
                    <AiModelPicker
                      value={model}
                      onValueChange={setModel}
                      className="h-7"
                    />
                    <AiChatComposerAction label="Use voice input">
                      <Mic />
                    </AiChatComposerAction>
                    <AiChatComposerSubmit disabled={!prompt.trim()} />
                  </AiChatComposerToolbarGroup>
                </AiChatComposerToolbar>
              </AiChatComposer>
            </div>

            <section className="ai-home-reveal ai-home-reveal-suggestions mx-auto mt-14 grid w-full max-w-[720px] border-y sm:grid-cols-3">
              {quickStarts.map((item, index) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.title}
                    className={cn(
                      "flex min-h-44 flex-col px-4 py-5 sm:min-h-48 sm:px-5 sm:py-6",
                      index > 0 && "border-t sm:border-t-0 sm:border-l",
                    )}
                  >
                    {index === 1 ? (
                      <div className="mb-5 flex h-4 items-center gap-1.5">
                        <SiGithub className="size-3.5" aria-label="GitHub" />
                        <SiSlack
                          className="size-3.5 text-[#E01E5A]"
                          aria-label="Slack"
                        />
                        <SiFigma
                          className="size-3.5 text-[#F24E1E]"
                          aria-label="Figma"
                        />
                      </div>
                    ) : (
                      <Icon
                        className="mb-5 size-4"
                        strokeWidth={1.75}
                        aria-hidden="true"
                      />
                    )}
                    <h2 className="text-sm font-medium">{item.title}</h2>
                    <p className="text-muted-foreground mt-1.5 max-w-44 text-xs leading-5">
                      {item.description}
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      className="mt-auto w-fit"
                      onClick={() => setPrompt(item.prompt)}
                    >
                      {item.action}
                    </Button>
                  </article>
                );
              })}
            </section>

            <section className="ai-home-reveal ai-home-reveal-suggestions mx-auto mt-14 w-full max-w-[720px]">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-muted-foreground text-sm font-medium">
                  Agents
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs font-normal"
                >
                  View all
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {agents.map((agent) => (
                  <button
                    key={agent.name}
                    type="button"
                    className="hover:bg-muted/25 rounded-lg border p-4 text-left transition-colors"
                    onClick={() => setPrompt(`Ask ${agent.name} to `)}
                  >
                    <AnimatedAgentBlob
                      className="mb-8 size-9"
                      colors={agent.colors}
                      phase={agent.phase}
                      silhouette={agent.silhouette}
                      decorative
                    />
                    <h3 className="text-sm font-medium">{agent.name}</h3>
                    <p className="text-muted-foreground mt-1 text-xs leading-5">
                      {agent.description}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </section>
      </SidebarInset>
    </div>
  );
}
