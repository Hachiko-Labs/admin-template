"use client";

import { Link2, UserRound, Workflow } from "lucide-react";
import { Blocks, Library, PanelLeft, Search, SquarePen } from "lucide-react";
import * as React from "react";

import {
  AiChatComposer,
  AiChatComposerAction,
  AiChatComposerEditor,
  AiChatComposerSubmit,
  AiChatComposerToolbar,
  AiChatComposerToolbarGroup,
} from "@/components/ai-chat/ai-chat-composer";
import { AiChatAddContextAction } from "@/components/ai-chat/ai-chat-context-picker";
import {
  AiComposerMobileHeader,
  AiComposerNavigation,
  AiComposerSecondaryNavigation,
} from "@/components/ai-chat/ai-composer-navigation";
import {
  AiModelPicker,
  defaultAiModelId,
} from "@/components/ai-chat/ai-model-picker";
import { AiSessionActions } from "@/components/ai-chat/ai-session-actions";
import { aiTeams, AiTeamSwitcher } from "@/components/ai-chat/ai-team-switcher";
import { useMockChat } from "@/components/ai-chat/use-mock-chat";
import { HeaderNotifications } from "@/components/layout/header-notifications";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Portal, PortalSlot } from "@/components/ui/portal-slot";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
} from "@/components/ui/sidebar";

const blocks = [
  {
    icon: UserRound,
    title: "Build an agent",
    description: "Create a focused UI teammate.",
  },
  {
    icon: Link2,
    title: "Connect tools",
    description: "Add the apps used by your team.",
  },
  {
    icon: Workflow,
    title: "Run a workflow",
    description: "Automate a repeatable task.",
  },
];

const navigationItems = [
  { icon: SquarePen, label: "New session", active: true },
  { icon: Search, label: "Search sessions" },
  { icon: Blocks, label: "Browse blocks" },
  { icon: Library, label: "Reference library" },
];
const workspaces = ["AI Admin Kit", "Commerce Kit", "Payment Kit"];
const recentSessions = [
  "Refine the approval flow",
  "Compare settings layouts",
  "Plan a billing workspace",
  "Review responsive states",
];

export default function AiChatComposer3Page() {
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
        <AiComposerNavigation
          navigationItems={navigationItems}
          recentSessions={recentSessions}
          workspaces={workspaces}
        />
      </AiComposerMobileHeader>

      <Sidebar
        id="ai-workspace-navigation"
        collapsible="none"
        aria-label="AI workspace navigation"
        className={`${secondaryOpen ? "md:flex" : "md:hidden"} hidden w-[234px] shrink-0 border-r`}
      >
        <SidebarHeader className="flex h-[var(--ai-workspace-header-height,3.5rem)] shrink-0 justify-center">
          {workspaceHeader}
        </SidebarHeader>
        <SidebarContent className="gap-0 pb-3">
          <AiComposerSecondaryNavigation
            navigationItems={navigationItems}
            recentSessions={recentSessions}
            workspaces={workspaces}
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
            <span className="truncate text-sm font-medium">Composer 3</span>
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
            onClear={() => {
              chat.reset();
              setPrompt("");
            }}
          />
        </Portal>
        <section className="flex min-w-0 flex-1 items-start justify-center overflow-y-auto px-4 pt-20 pb-12 sm:px-6 md:py-12">
          <div className="my-auto flex w-full max-w-[720px] flex-col items-center gap-7">
            <div className="flex flex-col items-center gap-2 text-center">
              <Logo
                width={21}
                height={24}
                className="ai-home-reveal ai-home-reveal-kicker object-contain"
              />
              <h1 className="ai-home-reveal ai-home-reveal-title text-2xl font-medium tracking-tight">
                What do you want to build?
              </h1>
              <p className="ai-home-reveal ai-home-reveal-title text-muted-foreground text-sm">
                Start an agent, connect a tool, or automate a workflow.
              </p>
            </div>

            {chat.messages.length > 0 && (
              <div
                className="mx-auto w-full max-w-3xl space-y-6 px-4 py-4"
                aria-live="polite"
              >
                {chat.messages.map((message) => (
                  <div key={message.id} className="text-sm whitespace-pre-wrap">
                    <p className="mb-2 font-medium">
                      {message.role === "user" ? "You" : "Assistant"}
                    </p>
                    {message.text}
                  </div>
                ))}
              </div>
            )}
            <AiChatComposer
              density="compact"
              placement="home"
              className="ai-home-reveal ai-home-reveal-composer w-full"
              aria-label="Agent home composer"
              onSubmit={(event) => {
                event.preventDefault();
                if (chat.send(prompt)) setPrompt("");
              }}
            >
              <AiChatComposerEditor
                aria-label="Agent home composer"
                placeholder="Assign a task or ask anything"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
              />
              <AiChatComposerToolbar>
                <AiChatComposerToolbarGroup>
                  <AiChatAddContextAction />
                  <AiChatComposerAction label="Connect tools">
                    <Link2 />
                  </AiChatComposerAction>
                  <AiChatComposerAction label="Configure workflow">
                    <Workflow />
                  </AiChatComposerAction>
                </AiChatComposerToolbarGroup>
                <AiChatComposerToolbarGroup side="end">
                  <AiModelPicker
                    value={model}
                    onValueChange={setModel}
                    className="h-7"
                  />
                  <AiChatComposerSubmit disabled={!prompt.trim()} />
                </AiChatComposerToolbarGroup>
              </AiChatComposerToolbar>
            </AiChatComposer>

            <div className="ai-home-reveal ai-home-reveal-suggestions grid w-full gap-4 md:grid-cols-3">
              {blocks.map((item) => {
                const Icon = item.icon;
                return (
                  <Card
                    key={item.title}
                    className="gap-0 rounded-2xl py-0 shadow-none"
                  >
                    <CardHeader className="flex h-full flex-col justify-between gap-5 px-5 py-5">
                      <Icon
                        className="text-muted-foreground size-5"
                        strokeWidth={1.5}
                      />
                      <div className="grid gap-1">
                        <CardTitle className="text-sm font-medium">
                          {item.title}
                        </CardTitle>
                        <CardDescription className="text-[13px] leading-5">
                          {item.description}
                        </CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      </SidebarInset>
    </div>
  );
}
