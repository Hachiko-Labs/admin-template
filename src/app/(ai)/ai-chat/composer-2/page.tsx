"use client";

import {
  CircleDashed,
  FileText,
  Folder,
  ImageIcon,
  MousePointer2,
  PencilLine,
  X,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
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

export default function AiChatComposer2Page() {
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
  const [attachments, setAttachments] = React.useState([
    "pdf",
    "image",
    "notes",
  ]);

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
            <span className="truncate text-sm font-medium">Composer 2</span>
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
          <div className="my-auto flex w-full max-w-[720px] flex-col gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <Logo
                width={21}
                height={24}
                className="ai-home-reveal ai-home-reveal-kicker object-contain"
              />
              <h1 className="ai-home-reveal ai-home-reveal-title text-2xl font-medium tracking-tight">
                Work with your references
              </h1>
              <p className="ai-home-reveal ai-home-reveal-title text-muted-foreground text-sm">
                Attach files, inspect their context, then give the UI agent a
                task.
              </p>
            </div>

            <div className="ai-home-reveal ai-home-reveal-composer bg-muted/35 rounded-2xl border p-2">
              <div className="no-scrollbar flex min-w-0 gap-2 overflow-x-auto pb-2">
                {attachments.includes("pdf") && (
                  <div className="group relative min-w-0 shrink-0">
                    <Button
                      aria-label="Remove admin-audit-brief.pdf"
                      onClick={() =>
                        setAttachments((items) =>
                          items.filter((item) => item !== "pdf"),
                        )
                      }
                      variant="outline"
                      className="max-w-64 min-w-0 rounded-lg px-3 font-normal shadow-sm"
                    >
                      <FileText data-icon="inline-start" />
                      <span className="truncate">admin-audit-brief.pdf</span>
                      <X data-icon="inline-end" />
                    </Button>
                    <div className="bg-popover text-popover-foreground invisible absolute top-full left-0 z-10 mt-2 hidden w-96 rounded-xl border p-3 opacity-0 shadow-md transition-opacity sm:block sm:group-focus-within:visible sm:group-focus-within:opacity-100 sm:group-hover:visible sm:group-hover:opacity-100">
                      <div className="grid gap-3">
                        <div className="grid gap-1 px-1">
                          <p className="text-sm font-medium">
                            admin-audit-brief.pdf
                          </p>
                          <p className="text-muted-foreground text-xs">
                            PDF · 2.3 MB · 93 lines
                          </p>
                        </div>
                        <Card className="gap-0 py-0 shadow-none">
                          <CardHeader className="gap-2 px-4 py-4">
                            <Badge variant="secondary" className="w-fit">
                              AI-generated summary
                            </Badge>
                            <CardTitle className="text-base">
                              AI admin screen audit
                            </CardTitle>
                            <CardDescription className="text-xs leading-5">
                              A focused review of navigation hierarchy, composer
                              density, interaction states, and the transition
                              from chat to agent workflows.
                            </CardDescription>
                          </CardHeader>
                        </Card>
                      </div>
                    </div>
                  </div>
                )}

                {attachments.includes("image") && (
                  <Button
                    aria-label="Remove composer-reference.png"
                    onClick={() =>
                      setAttachments((items) =>
                        items.filter((item) => item !== "image"),
                      )
                    }
                    variant="outline"
                    className="max-w-60 min-w-0 shrink-0 rounded-lg px-3 font-normal shadow-sm"
                  >
                    <ImageIcon data-icon="inline-start" />
                    <span className="truncate">composer-reference.png</span>
                    <X data-icon="inline-end" />
                  </Button>
                )}
                {attachments.includes("notes") && (
                  <Button
                    aria-label="Remove Navigation notes"
                    onClick={() =>
                      setAttachments((items) =>
                        items.filter((item) => item !== "notes"),
                      )
                    }
                    variant="outline"
                    className="max-w-52 min-w-0 shrink-0 rounded-lg px-3 font-normal shadow-sm"
                  >
                    <Folder data-icon="inline-start" />
                    <span className="truncate">Navigation notes</span>
                    <X data-icon="inline-end" />
                  </Button>
                )}
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
                density="compact"
                placement="home"
                aria-label="Composer with attachments"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (chat.send(prompt)) setPrompt("");
                }}
              >
                <AiChatComposerEditor
                  aria-label="Composer with attachments"
                  placeholder="Add instructions from attached references..."
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                />
                <AiChatComposerToolbar>
                  <AiChatComposerToolbarGroup>
                    <AiChatAddContextAction />
                    <AiChatComposerAction label="Refine prompt">
                      <PencilLine />
                    </AiChatComposerAction>
                    <AiChatComposerAction label="Select context area">
                      <CircleDashed />
                    </AiChatComposerAction>
                    <AiChatComposerAction label="Point to element">
                      <MousePointer2 />
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
            </div>
          </div>
        </section>
      </SidebarInset>
    </div>
  );
}
