"use client";

import {
  ArrowDown,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Circle,
  CircleAlert,
  Database,
  FileBarChart,
  FileText,
  GitBranch,
  Home,
  LoaderCircle,
  Mail,
  Mic,
  PanelLeft,
  Settings,
  SquarePen,
  Table2,
  TimerReset,
} from "lucide-react";
import * as React from "react";
import { SiGoogledrive, SiLinear, SiNotion, SiSlack } from "react-icons/si";

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
import { AiSessionActions } from "@/components/ai-chat/ai-session-actions";
import { AiSidebarSectionSearch } from "@/components/ai-chat/ai-sidebar-section-search";
import { aiTeams, AiTeamSwitcher } from "@/components/ai-chat/ai-team-switcher";
import { GlideMenu } from "@/components/ai-chat/glide-menu";
import { HeaderNotifications } from "@/components/layout/header-notifications";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Portal, PortalSlot } from "@/components/ui/portal-slot";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const productNavigation = [
  { icon: Home, label: "Home" },
  { icon: FileBarChart, label: "Reports" },
  { icon: TimerReset, label: "Automations" },
  { icon: Settings, label: "Settings" },
];

const sessions = [
  {
    title: "Prepare renewal follow-ups",
    status: "Running",
    branch: "sales/renewals",
  },
  {
    title: "Summarize product interviews",
    status: "Ready",
    branch: "research/interviews",
  },
  {
    title: "Review pipeline exceptions",
    status: "Needs input",
    branch: "revenue/pipeline",
  },
  {
    title: "Draft launch brief",
    status: "Settled",
    branch: "marketing/launch",
  },
  {
    title: "Organize customer notes",
    status: "Settled",
    branch: "success/notes",
  },
  {
    title: "Compare weekly forecasts",
    status: "Settled",
    branch: "revenue/forecast",
  },
  {
    title: "Plan partner outreach",
    status: "Settled",
    branch: "growth/partners",
  },
  {
    title: "Audit onboarding feedback",
    status: "Ready",
    branch: "product/onboarding",
  },
  {
    title: "Review support escalations",
    status: "Needs input",
    branch: "support/escalations",
  },
  {
    title: "Prepare quarterly business review",
    status: "Running",
    branch: "success/quarterly-review",
  },
  {
    title: "Summarize campaign results",
    status: "Settled",
    branch: "marketing/campaigns",
  },
  {
    title: "Check migration milestones",
    status: "Ready",
    branch: "engineering/migration",
  },
  {
    title: "Draft customer case study",
    status: "Settled",
    branch: "marketing/case-study",
  },
  {
    title: "Review account health",
    status: "Needs input",
    branch: "success/account-health",
  },
  {
    title: "Plan the next release",
    status: "Ready",
    branch: "product/release-plan",
  },
  {
    title: "Reconcile usage reports",
    status: "Settled",
    branch: "finance/usage",
  },
  {
    title: "Analyze trial conversions",
    status: "Settled",
    branch: "growth/trials",
  },
  {
    title: "Prepare team retrospective",
    status: "Ready",
    branch: "operations/retrospective",
  },
  {
    title: "Review integration requests",
    status: "Settled",
    branch: "engineering/integrations",
  },
  {
    title: "Archive completed projects",
    status: "Settled",
    branch: "operations/archive",
  },
];

const suggestions = [
  {
    icon: Table2,
    label: "Import a CSV",
    prompt: "Import a CSV and summarize the most important patterns",
  },
  {
    icon: Database,
    label: "Ask about a project",
    prompt: "Summarize the current state of the Atlas migration project",
  },
  {
    icon: Mail,
    label: "Draft a follow-up",
    prompt: "Draft a follow-up for my last customer meeting",
  },
  {
    icon: CalendarDays,
    label: "Recap a meeting",
    prompt: "Recap my latest product review and list the decisions",
  },
  {
    icon: FileText,
    label: "Write a brief",
    prompt: "Write a concise launch brief from my connected notes",
  },
];

function SessionSidebarMenu({ children }: { children: React.ReactNode }) {
  return (
    <GlideMenu
      rowSelector='[data-sidebar="menu-button"]'
      className="group/session-sidebar-glide relative"
      highlightClassName="bg-sidebar-accent inset-x-0 rounded-md"
    >
      <SidebarMenu className="relative [&_[data-active=true]]:group-hover/session-sidebar-glide:bg-transparent [&_[data-sidebar=menu-button]]:hover:bg-transparent">
        {children}
      </SidebarMenu>
    </GlideMenu>
  );
}

function SessionSidebar({
  activeSession,
  onSessionChange,
  onNewSession,
  query,
  onQueryChange,
}: {
  activeSession: string;
  onSessionChange: (session: string) => void;
  onNewSession: () => void;
  query: string;
  onQueryChange: (query: string) => void;
}) {
  const visibleSessions = sessions.filter((session) =>
    `${session.title} ${session.branch} ${session.status}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Actions</SidebarGroupLabel>
        <SidebarGroupContent>
          <SessionSidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                data-ai-sidebar-row
                onClick={onNewSession}
                isActive={!activeSession}
              >
                <SquarePen aria-hidden="true" />
                <span>New session</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {productNavigation.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton data-ai-sidebar-row>
                  <item.icon aria-hidden="true" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SessionSidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup>
        <AiSidebarSectionSearch
          label="Sessions"
          searchLabel="Search sessions"
          closeLabel="Close session search"
          query={query}
          onQueryChange={onQueryChange}
        />
        <SidebarGroupContent>
          <SessionSidebarMenu>
            {visibleSessions.map((session) => (
              <SidebarMenuItem key={session.title}>
                <SessionSidebarRow
                  active={activeSession === session.title}
                  {...session}
                  onClick={() => onSessionChange(session.title)}
                />
              </SidebarMenuItem>
            ))}
          </SessionSidebarMenu>
          {visibleSessions.length === 0 && (
            <p
              role="status"
              className="text-muted-foreground px-2 py-3 text-xs"
            >
              No sessions found.
            </p>
          )}
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}

function SessionSidebarRow({
  active,
  branch,
  onClick,
  status,
  title,
}: {
  active: boolean;
  branch: string;
  onClick: () => void;
  status: string;
  title: string;
}) {
  const running = status === "Running";
  const needsInput = status === "Needs input";
  return (
    <SidebarMenuButton
      data-ai-sidebar-row
      type="button"
      title={title}
      isActive={active}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className="h-[52px]"
    >
      {running ? (
        <LoaderCircle
          className="text-muted-foreground animate-spin motion-reduce:animate-none"
          aria-hidden="true"
        />
      ) : needsInput ? (
        <CircleAlert className="text-warning" aria-hidden="true" />
      ) : (
        <span className="flex size-4 shrink-0 items-center justify-center">
          <Circle
            className="text-muted-foreground/45 size-2 fill-current"
            strokeWidth={0}
            aria-hidden="true"
          />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm leading-5">{title}</span>
        <span className="text-muted-foreground mt-0.5 flex min-w-0 items-center gap-1 text-xs leading-4">
          <GitBranch
            className="size-3 shrink-0"
            strokeWidth={1.8}
            aria-hidden="true"
          />
          <span className="min-w-0 flex-1 truncate">{branch}</span>
          {status !== "Settled" && (
            <span
              className={cn(
                "shrink-0",
                running && "text-success",
                needsInput && "text-warning",
              )}
            >
              {status}
            </span>
          )}
        </span>
      </span>
    </SidebarMenuButton>
  );
}

function PromptShortcuts({
  selectedPrompt,
  onSelect,
}: {
  selectedPrompt: string;
  onSelect: (prompt: string) => void;
}) {
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const pausedRef = React.useRef(false);
  const positionRef = React.useRef(0);

  React.useEffect(() => {
    const element = scrollerRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!element) return;

    let frame = 0;
    let previousTime = performance.now();
    const animate = (time: number) => {
      const elapsed = Math.min(time - previousTime, 48);
      previousTime = time;
      const loopWidth = element.scrollWidth / 2;

      if (!pausedRef.current && loopWidth > 0) {
        positionRef.current += elapsed * 0.025;
        if (positionRef.current >= loopWidth) {
          positionRef.current -= loopWidth;
        }
        element.scrollLeft = positionRef.current;
      }
      frame = requestAnimationFrame(animate);
    };
    let visible = false;
    const update = () => {
      cancelAnimationFrame(frame);
      if (visible && !document.hidden && !reducedMotion.matches) {
        previousTime = performance.now();
        frame = requestAnimationFrame(animate);
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    observer.observe(element);
    document.addEventListener("visibilitychange", update);
    reducedMotion.addEventListener("change", update);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      reducedMotion.removeEventListener("change", update);
    };
  }, []);

  const moveForward = () => {
    scrollerRef.current?.scrollBy({ left: 260, behavior: "smooth" });
  };

  const maskImage =
    "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)";

  return (
    <div
      className="relative w-full max-w-full min-w-0 overflow-hidden pr-8"
      onPointerEnter={() => {
        pausedRef.current = true;
      }}
      onPointerLeave={() => {
        pausedRef.current = false;
      }}
      onFocusCapture={() => {
        pausedRef.current = true;
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          pausedRef.current = false;
        }
      }}
    >
      <div
        ref={scrollerRef}
        onScroll={(event) => {
          positionRef.current = event.currentTarget.scrollLeft;
        }}
        className="flex min-w-0 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ maskImage, WebkitMaskImage: maskImage }}
      >
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className="flex shrink-0 gap-2 pr-2"
            aria-hidden={copy === 1 ? true : undefined}
          >
            {suggestions.map((suggestion) => {
              const Icon = suggestion.icon;
              const selected = selectedPrompt === suggestion.prompt;
              return (
                <Button
                  key={`${copy}-${suggestion.label}`}
                  type="button"
                  tabIndex={copy === 1 ? -1 : undefined}
                  variant="outline"
                  className={cn(
                    "bg-background h-9 shrink-0 rounded-xl px-3 font-normal shadow-xs",
                    selected && "border-foreground/20 bg-muted",
                  )}
                  onClick={() => onSelect(suggestion.prompt)}
                >
                  <Icon className="text-muted-foreground size-3.5" />
                  {suggestion.label}
                  <ArrowDown className="text-muted-foreground size-3" />
                </Button>
              );
            })}
          </div>
        ))}
      </div>
      <Button
        variant="outline"
        size="icon-sm"
        className="bg-background/90 absolute top-1/2 right-0 z-10 -translate-y-1/2 rounded-full shadow-sm backdrop-blur"
        aria-label="Show more suggestions"
        onClick={moveForward}
      >
        <ChevronRight aria-hidden="true" />
      </Button>
    </div>
  );
}

export function AiChatComposer5Screen() {
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
  const [query, setQuery] = React.useState("");
  const defaultPrompt = "Draft a follow-up for my last customer meeting";
  const [activeSession, setActiveSession] = React.useState(sessions[0].title);
  const [model, setModel] = React.useState(defaultAiModelId);
  const [prompt, setPrompt] = React.useState(defaultPrompt);
  const [submitted, setSubmitted] = React.useState(false);
  const [contextPickerKey, setContextPickerKey] = React.useState(0);

  const choosePrompt = (nextPrompt: string) => {
    setPrompt(nextPrompt);
    setSubmitted(false);
  };

  const startNewSession = () => {
    setActiveSession("");
    setPrompt("");
    setSubmitted(false);
    setContextPickerKey((current) => current + 1);
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
        <SessionSidebar
          activeSession={activeSession}
          onSessionChange={setActiveSession}
          onNewSession={startNewSession}
          query={query}
          onQueryChange={setQuery}
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
        <SidebarContent className="gap-0 overscroll-y-contain pb-3">
          <SessionSidebar
            activeSession={activeSession}
            onSessionChange={setActiveSession}
            onNewSession={startNewSession}
            query={query}
            onQueryChange={setQuery}
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
            <span className="truncate text-sm font-medium">Composer 5</span>
          </div>
          <PortalSlot name="ai-header-actions" className="shrink-0" />
        </header>

        <Portal to="ai-header-actions">
          <AiSessionActions
            transcript={submitted ? `## You\n\n${prompt}` : ""}
            onClear={startNewSession}
          />
        </Portal>
        <ScrollArea className="min-h-0 w-screen max-w-[100vw] min-w-0 flex-1 pt-12 md:w-full md:max-w-none md:pt-0">
          <div className="flex min-h-[calc(100svh-4rem)] w-screen max-w-[100vw] min-w-0 flex-col overflow-x-hidden md:w-full md:max-w-full">
            <section className="mx-auto flex w-full max-w-[100vw] min-w-0 flex-1 flex-col items-center px-4 pt-[clamp(3rem,10vh,7rem)] sm:px-6 md:max-w-4xl">
              <Logo
                width={28}
                height={32}
                className="ai-home-reveal ai-home-reveal-kicker object-contain"
                alt="Workspace assistant"
              />
              <h1 className="ai-home-reveal ai-home-reveal-title mt-5 text-center text-2xl font-medium tracking-tight sm:text-3xl">
                What would you like to accomplish?
              </h1>
              <p className="ai-home-reveal ai-home-reveal-title text-muted-foreground mt-2 text-center text-sm">
                Ask across your meetings, documents, and connected workspace.
              </p>

              <div className="ai-home-reveal ai-home-reveal-suggestions mt-7 w-full max-w-[720px]">
                <PromptShortcuts
                  selectedPrompt={prompt}
                  onSelect={choosePrompt}
                />
              </div>

              <AiChatComposer
                className="ai-home-reveal ai-home-reveal-composer mt-4 max-w-[calc(100vw-2rem)] sm:max-w-[720px]"
                density="compact"
                placement="home"
                aria-label="Start a workspace session"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (prompt.trim()) setSubmitted(true);
                }}
                rail={
                  <AiChatComposerRail className="min-h-10 py-1.5">
                    <span className="mr-auto">
                      Get better answers from your apps
                    </span>
                    <div className="flex items-center gap-0.5">
                      <AiChatComposerAction label="Notion connected">
                        <SiNotion
                          className="text-foreground"
                          aria-hidden="true"
                        />
                      </AiChatComposerAction>
                      <AiChatComposerAction label="Slack connected">
                        <SiSlack
                          className="text-[#4a154b] dark:text-[#e01e5a]"
                          aria-hidden="true"
                        />
                      </AiChatComposerAction>
                      <AiChatComposerAction label="Linear connected">
                        <SiLinear
                          className="text-[#5e6ad2]"
                          aria-hidden="true"
                        />
                      </AiChatComposerAction>
                      <AiChatComposerAction label="Google Drive connected">
                        <SiGoogledrive
                          className="text-[#0f9d58]"
                          aria-hidden="true"
                        />
                      </AiChatComposerAction>
                    </div>
                  </AiChatComposerRail>
                }
              >
                <AiChatComposerEditor
                  value={prompt}
                  onChange={(event) => {
                    setPrompt(event.target.value);
                    setSubmitted(false);
                  }}
                  placeholder="Ask about a project, meeting, or document"
                  aria-label="Message the workspace assistant"
                />
                <AiChatComposerToolbar>
                  <AiChatComposerToolbarGroup>
                    <AiChatAddContextAction key={contextPickerKey} />
                  </AiChatComposerToolbarGroup>
                  <AiChatComposerToolbarGroup side="end">
                    <AiChatComposerAction label="Use voice input">
                      <Mic aria-hidden="true" />
                    </AiChatComposerAction>
                    <AiModelPicker
                      value={model}
                      onValueChange={setModel}
                      className="h-7"
                    />
                    <AiChatComposerSubmit disabled={!prompt.trim()} />
                  </AiChatComposerToolbarGroup>
                </AiChatComposerToolbar>
              </AiChatComposer>

              <div
                className={cn(
                  "text-muted-foreground mt-3 flex h-5 items-center gap-1.5 text-xs transition-opacity",
                  submitted ? "opacity-100" : "opacity-0",
                )}
                role="status"
                aria-live="polite"
              >
                <CheckCircle2 className="size-3.5" aria-hidden="true" />
                {submitted ? "Session ready to run" : ""}
              </div>
            </section>
          </div>
        </ScrollArea>
      </SidebarInset>
    </div>
  );
}
