"use client";

import { Blocks, Library, PanelLeft, Search, SquarePen } from "lucide-react";
import * as React from "react";

import {
  AiChatComposer,
  AiChatComposerButton,
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
import { AiConversationScroller } from "@/components/ai-chat/ai-conversation-scroller";
import { AiMockChatTurns } from "@/components/ai-chat/ai-mock-chat-turns";
import {
  AiModelPicker,
  defaultAiModelId,
} from "@/components/ai-chat/ai-model-picker";
import { AiSessionActions } from "@/components/ai-chat/ai-session-actions";
import { AiSuggestedPromptEditor } from "@/components/ai-chat/ai-suggested-prompt-editor";
import { aiTeams, AiTeamSwitcher } from "@/components/ai-chat/ai-team-switcher";
import { useMockChat } from "@/components/ai-chat/use-mock-chat";
import { HeaderNotifications } from "@/components/layout/header-notifications";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Portal, PortalSlot } from "@/components/ui/portal-slot";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
} from "@/components/ui/sidebar";

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

export default function AiChatComposer1Page() {
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
  const [model, setModel] = React.useState(defaultAiModelId);
  const [prompt, setPrompt] = React.useState("");
  const [secondaryOpen, setSecondaryOpen] = React.useState(true);
  const [suggestionsEnabled, setSuggestionsEnabled] = React.useState(true);
  const chat = useMockChat();
  const transcript = chat.messages
    .map(
      (message) =>
        `## ${message.role === "user" ? "You" : "Assistant"}\n\n${message.text}`,
    )
    .join("\n\n");
  const hasMessages = chat.messages.length > 0;

  const startNewSession = () => {
    chat.reset();
    setPrompt("");
  };

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
            <span className="truncate text-sm font-medium">Composer 1</span>
          </div>
          <PortalSlot name="ai-header-actions" className="shrink-0" />
        </header>

        <Portal to="ai-header-actions">
          <AiSessionActions
            transcript={transcript}
            onClear={startNewSession}
            suggestionsEnabled={suggestionsEnabled}
            onSuggestionsChange={setSuggestionsEnabled}
          />
        </Portal>

        <section
          className={
            hasMessages
              ? "flex min-h-0 min-w-0 flex-1 justify-center overflow-hidden px-4 pt-16 pb-4 sm:px-6 md:pt-6"
              : "flex min-w-0 flex-1 items-start justify-center overflow-y-auto px-4 pt-20 pb-12 sm:px-6 md:py-12"
          }
        >
          <div
            className={
              hasMessages
                ? "flex min-h-0 w-full max-w-[720px] flex-col gap-4"
                : "my-auto flex w-full max-w-[720px] flex-col items-center gap-6"
            }
          >
            {hasMessages ? (
              <AiConversationScroller>
                <div className="flex flex-col gap-8 px-2 py-5">
                  <AiMockChatTurns
                    messages={chat.messages}
                    status={chat.status}
                    onRetry={chat.retry}
                  />
                </div>
              </AiConversationScroller>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center">
                <Logo
                  width={17}
                  height={20}
                  className="ai-home-reveal ai-home-reveal-kicker object-contain"
                />
                <h1 className="ai-home-reveal ai-home-reveal-title text-2xl font-medium tracking-tight">
                  What should we build?
                </h1>
                <p className="ai-home-reveal ai-home-reveal-title text-muted-foreground text-sm">
                  Describe an admin screen, component, or workflow.
                </p>
              </div>
            )}

            <AiChatComposer
              density="compact"
              placement={hasMessages ? "thread" : "home"}
              className={
                hasMessages
                  ? "w-full max-w-none shrink-0"
                  : "ai-home-reveal ai-home-reveal-composer w-full"
              }
              aria-label="AI screen composer"
              onSubmit={(event) => {
                event.preventDefault();
                if (chat.send(prompt)) setPrompt("");
              }}
            >
              <AiSuggestedPromptEditor
                enabled={!hasMessages && suggestionsEnabled}
                value={prompt}
                onValueChange={setPrompt}
              />
              <AiChatComposerToolbar>
                <AiChatComposerToolbarGroup>
                  <AiChatAddContextAction />
                  <AiChatComposerButton className="h-7 gap-1.5 rounded-lg px-2 text-xs font-normal">
                    <Blocks /> Blocks
                  </AiChatComposerButton>
                </AiChatComposerToolbarGroup>
                <AiChatComposerToolbarGroup side="end">
                  <AiModelPicker
                    value={model}
                    onValueChange={setModel}
                    className="h-7"
                  />
                  <AiChatComposerSubmit
                    disabled={!prompt.trim()}
                    status={chat.status}
                    onStop={chat.stop}
                  />
                </AiChatComposerToolbarGroup>
              </AiChatComposerToolbar>
            </AiChatComposer>
          </div>
        </section>
      </SidebarInset>
    </div>
  );
}
