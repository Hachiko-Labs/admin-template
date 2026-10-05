"use client";

import { useCommandState } from "cmdk";
import {
  Blocks,
  BookOpen,
  Bot,
  CheckCircle2,
  CornerDownLeft,
  FileCode2,
  FileStack,
  FileText,
  Folder,
  GitBranch,
  GitCompareArrows,
  LayoutTemplate,
  type LucideIcon,
  Package,
  PanelLeft,
  Plus,
  SquarePen,
  Terminal,
  TestTube2,
  Wrench,
  X,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

import {
  AiChatComposer,
  AiChatComposerAction,
  AiChatComposerEditor,
  AiChatComposerSubmit,
  AiChatComposerToolbar,
  AiChatComposerToolbarGroup,
} from "@/components/ai-chat/ai-chat-composer";
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
import { BrandMark } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Portal, PortalSlot } from "@/components/ui/portal-slot";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const primaryItems = [
  { icon: Blocks, label: "Skill library", href: "/ai-chat/skill-library" },
  {
    icon: LayoutTemplate,
    label: "Agent workspace",
    href: "/ai-chat/agent-detail",
  },
];

const workspaces = [
  { icon: Folder, label: "AI admin screens", href: "/ai-chat/composer-1" },
  {
    icon: FileStack,
    label: "Commerce workspace",
    href: "/ai-chat/embedded-commerce-copilot",
  },
];

const recentChats = [
  {
    label: "Map agent approval states",
    href: "/ai-chat/conversation-1",
  },
  {
    label: "Review product table density",
    href: "/ai-chat/conversation-2",
  },
  {
    label: "Choose campaign direction",
    href: "/ai-chat/conversation-3",
  },
  {
    label: "Summarize weekly kickoff",
    href: "/ai-chat/conversation-4",
  },
  {
    label: "Build revenue overview",
    href: "/ai-chat/conversation-5",
  },
  {
    label: "Preview marketing page",
    href: "/ai-chat/conversation-7",
  },
  {
    label: "Synthesize recording",
    href: "/ai-chat/conversation-8",
  },
  {
    label: "Plan billing webhook migration",
    href: "/ai-chat/conversation-9",
  },
  {
    label: "Research bulk action feedback",
    href: "/ai-chat/conversation-10",
  },
  {
    label: "Generate admin bulk actions",
    href: "/ai-chat/conversation-11",
  },
  {
    label: "Verify generated bulk actions",
    href: "/ai-chat/conversation-12",
  },
  {
    label: "Queue product review follow-ups",
    href: "/ai-chat/conversation-13",
  },
  {
    label: "Review and commit verified changes",
    href: "/ai-chat/conversation-14",
  },
  {
    label: "Triage support backlog",
    href: "/ai-chat/conversation-15",
  },
  {
    label: "Compare response versions",
    href: "/ai-chat/conversation-16",
  },
  {
    label: "Review release blockers",
    href: "/ai-chat/conversation-17",
  },
  {
    label: "Review component ownership",
    href: "/ai-chat/conversation-18",
  },
  {
    label: "Recover billing retry session",
    href: "/ai-chat/conversation-19",
  },
  {
    label: "Compact checkout migration context",
    href: "/ai-chat/conversation-20",
  },
];

const workflows = [
  { label: "Design release workflow", href: "/ai-chat/workflow-1" },
  { label: "Observe live agent run", href: "/ai-chat/workflow-2" },
  { label: "Review multi-agent handoff", href: "/ai-chat/workflow-3" },
];

function ComposerNavigationMenu({ children }: { children: React.ReactNode }) {
  return (
    <GlideMenu
      rowSelector='[data-sidebar="menu-button"]'
      className="group/composer-navigation-glide"
      highlightClassName="bg-sidebar-accent inset-x-0 rounded-md"
    >
      <SidebarMenu className="relative [&_[data-active=true]]:group-hover/composer-navigation-glide:bg-transparent [&_[data-sidebar=menu-button]]:hover:bg-transparent">
        {children}
      </SidebarMenu>
    </GlideMenu>
  );
}

function ComposerNavigation({ onNewChat }: { onNewChat: () => void }) {
  const [query, setQuery] = React.useState("");
  const visibleChats = recentChats.filter((chat) =>
    chat.label.toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Actions</SidebarGroupLabel>
        <ComposerNavigationMenu>
          <SidebarMenuItem>
            <SidebarMenuButton data-ai-sidebar-row onClick={onNewChat}>
              <SquarePen aria-hidden="true" />
              <span>New chat</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {primaryItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton data-ai-sidebar-row asChild>
                <Link href={item.href}>
                  <item.icon aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </ComposerNavigationMenu>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>Workspaces</SidebarGroupLabel>
        <ComposerNavigationMenu>
          {workspaces.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton data-ai-sidebar-row asChild>
                <Link href={item.href}>
                  <item.icon aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </ComposerNavigationMenu>
      </SidebarGroup>
      <SidebarGroup>
        <AiSidebarSectionSearch
          label="Chats"
          searchLabel="Search chats"
          closeLabel="Close chat search"
          query={query}
          onQueryChange={setQuery}
        />
        <ComposerNavigationMenu>
          {visibleChats.map((chat) => (
            <SidebarMenuItem key={chat.label}>
              <SidebarMenuButton data-ai-sidebar-row asChild>
                <Link href={chat.href}>
                  <span>{chat.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </ComposerNavigationMenu>
        {visibleChats.length === 0 && (
          <p role="status" className="text-muted-foreground px-2 py-3 text-xs">
            No chats found.
          </p>
        )}
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>Workflows</SidebarGroupLabel>
        <ComposerNavigationMenu>
          {workflows.map((workflow) => (
            <SidebarMenuItem key={workflow.label}>
              <SidebarMenuButton data-ai-sidebar-row asChild>
                <Link href={workflow.href}>
                  <GitBranch aria-hidden="true" />
                  <span>{workflow.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </ComposerNavigationMenu>
      </SidebarGroup>
    </>
  );
}

type InteractionMode = "command" | "context";
type ContextKind = "agent" | "document" | "file";

interface ComposerSuggestion {
  description: string;
  icon: LucideIcon;
  id: string;
  insert: string;
  keywords: string;
  label: string;
  meta: string;
}

interface ContextSuggestion extends ComposerSuggestion {
  kind: ContextKind;
}

interface ActiveTrigger {
  mode: InteractionMode;
  query: string;
  start: number;
}

interface Submission {
  prompt: string;
  references: ContextSuggestion[];
}

interface ComposerState {
  lastSubmission: Submission | null;
  menuDismissed: boolean;
  prompt: string;
  references: ContextSuggestion[];
  selectedIndex: number;
}

type ComposerAction =
  | { type: "dismiss-menu" }
  | { type: "remove-reference"; id: string }
  | { type: "reset" }
  | {
      type: "select-suggestion";
      suggestion: ComposerSuggestion;
      trigger: ActiveTrigger;
    }
  | { type: "set-prompt"; prompt: string }
  | { type: "set-selection"; index: number }
  | { type: "submit" };

const commandSuggestions: ComposerSuggestion[] = [
  {
    id: "review",
    label: "Review changes",
    description: "Inspect the current diff for regressions and missing tests.",
    icon: GitCompareArrows,
    insert: "/review",
    keywords: "review diff regressions code",
    meta: "/review",
  },
  {
    id: "test",
    label: "Run relevant tests",
    description: "Choose the smallest useful verification set for this change.",
    icon: TestTube2,
    insert: "/test",
    keywords: "test verify checks lint typecheck",
    meta: "/test",
  },
  {
    id: "explain",
    label: "Explain selection",
    description: "Describe the selected code and the decisions behind it.",
    icon: BookOpen,
    insert: "/explain",
    keywords: "explain selection code context",
    meta: "/explain",
  },
  {
    id: "fix",
    label: "Fix an issue",
    description: "Diagnose a bug, implement the smallest fix, and verify it.",
    icon: Wrench,
    insert: "/fix",
    keywords: "fix issue bug repair diagnose",
    meta: "/fix",
  },
];

const contextSuggestions: ContextSuggestion[] = [
  {
    id: "composer-source",
    label: "ai-chat-composer.tsx",
    description: "Shared composer primitives and keyboard submit behavior.",
    icon: FileCode2,
    insert: "ai-chat-composer.tsx",
    keywords: "composer source component textarea input",
    kind: "file",
    meta: "Component",
  },
  {
    id: "package-manifest",
    label: "package.json",
    description: "Project scripts, dependencies, and runtime requirements.",
    icon: Package,
    insert: "package.json",
    keywords: "package dependencies scripts manifest",
    kind: "file",
    meta: "Project file",
  },
  {
    id: "frontend-agent",
    label: "Frontend agent",
    description: "Delegate focused UI implementation and visual verification.",
    icon: Bot,
    insert: "frontend-agent",
    keywords: "frontend agent delegate ui design",
    kind: "agent",
    meta: "Agent",
  },
  {
    id: "design-guidelines",
    label: "Design guidelines",
    description:
      "Spacing, typography, accessibility, and interaction standards.",
    icon: FileText,
    insert: "design-guidelines.md",
    keywords: "design guidelines documentation rules standards",
    kind: "document",
    meta: "Document",
  },
];

const interactionRows = [
  {
    trigger: "/",
    title: "Run a command",
  },
  {
    trigger: "@",
    title: "Attach context",
  },
  {
    trigger: "!",
    title: "Open shell mode",
  },
] as const;

const menuCopy: Record<
  InteractionMode,
  { empty: string; heading: string; hint: string }
> = {
  command: {
    empty: "No matching commands",
    heading: "Commands",
    hint: "Choose a workflow",
  },
  context: {
    empty: "No matching context",
    heading: "Add context",
    hint: "Files, documents, and agents",
  },
};

const initialState: ComposerState = {
  lastSubmission: null,
  menuDismissed: false,
  prompt: "/",
  references: [],
  selectedIndex: 0,
};

function getActiveTrigger(prompt: string): ActiveTrigger | null {
  const match = prompt.match(/(?:^|\s)([/@])([^\s]*)$/);
  if (!match) return null;

  const token = `${match[1]}${match[2]}`;
  return {
    mode: match[1] === "/" ? "command" : "context",
    query: match[2],
    start: prompt.length - token.length,
  };
}

function composerReducer(
  state: ComposerState,
  action: ComposerAction,
): ComposerState {
  switch (action.type) {
    case "set-prompt":
      return {
        ...state,
        menuDismissed: false,
        prompt: action.prompt,
        selectedIndex: 0,
      };
    case "dismiss-menu":
      return { ...state, menuDismissed: true };
    case "set-selection":
      return { ...state, selectedIndex: action.index };
    case "select-suggestion": {
      if (action.trigger.mode === "context") {
        const suggestion = contextSuggestions.find(
          (item) => item.id === action.suggestion.id,
        );
        if (!suggestion) return state;

        const beforeTrigger = state.prompt
          .slice(0, action.trigger.start)
          .trimEnd();
        return {
          ...state,
          menuDismissed: true,
          prompt: beforeTrigger ? `${beforeTrigger} ` : "",
          references: state.references.some(
            (reference) => reference.id === suggestion.id,
          )
            ? state.references
            : [...state.references, suggestion],
          selectedIndex: 0,
        };
      }

      const beforeTrigger = state.prompt.slice(0, action.trigger.start);
      const prompt = `${beforeTrigger}${action.suggestion.insert} `;

      return {
        ...state,
        menuDismissed: true,
        prompt,
        selectedIndex: 0,
      };
    }
    case "remove-reference":
      return {
        ...state,
        references: state.references.filter(
          (reference) => reference.id !== action.id,
        ),
      };
    case "submit":
      if (
        !state.prompt.trim() ||
        state.prompt.trim() === "!" ||
        state.prompt.trim() === "/" ||
        state.prompt.trim() === "@"
      )
        return state;
      return {
        ...state,
        lastSubmission: {
          prompt: state.prompt.trim(),
          references: state.references,
        },
        menuDismissed: false,
        prompt: "",
        references: [],
        selectedIndex: 0,
      };
    case "reset":
      return initialState;
  }
}

function getSuggestions(mode: InteractionMode, query: string) {
  const source = mode === "command" ? commandSuggestions : contextSuggestions;
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) return source;
  return source.filter((suggestion) =>
    `${suggestion.label} ${suggestion.keywords} ${suggestion.insert}`
      .toLowerCase()
      .includes(normalizedQuery),
  );
}

function responseFor(submission: Submission) {
  if (submission.prompt.startsWith("!")) {
    return "Shell mode is ready. This showcase previews the command and keeps execution behind an explicit confirmation boundary.";
  }
  if (submission.prompt.startsWith("/review")) {
    return "Review started. I’ll inspect the attached context first, then report regressions and missing tests in severity order.";
  }
  if (submission.prompt.startsWith("/test")) {
    return "Verification plan prepared. I’ll run the narrowest relevant checks before expanding to the full suite.";
  }
  return "The instruction and attached context are ready for the agent. Commands stay visible in the transcript so the action remains auditable.";
}

function CommandAwareEditor({
  menuOpen,
  ...props
}: React.ComponentProps<typeof AiChatComposerEditor> & {
  menuOpen: boolean;
}) {
  const selectedItemId = useCommandState((state) => state.selectedItemId);

  return (
    <AiChatComposerEditor
      aria-activedescendant={menuOpen ? selectedItemId : undefined}
      {...props}
    />
  );
}

export function AiChatComposer7Screen() {
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
  const [state, dispatch] = React.useReducer(composerReducer, initialState);
  const [model, setModel] = React.useState(defaultAiModelId);
  const editorRef = React.useRef<HTMLTextAreaElement>(null);
  const trigger = state.menuDismissed ? null : getActiveTrigger(state.prompt);
  const suggestions = trigger
    ? getSuggestions(trigger.mode, trigger.query)
    : [];
  const selectedIndex = suggestions.length
    ? Math.min(state.selectedIndex, suggestions.length - 1)
    : 0;
  const selectedSuggestion = suggestions[selectedIndex];
  const shellMode = state.prompt.startsWith("!");
  const bareTrigger =
    state.prompt.trim() === "/" || state.prompt.trim() === "@";
  const canSubmit = bareTrigger
    ? false
    : shellMode
      ? state.prompt.slice(1).trim().length > 0
      : state.prompt.trim().length > 0;

  function focusEditor(cursorPosition?: number) {
    window.requestAnimationFrame(() => {
      const editor = editorRef.current;
      if (!editor) return;

      editor.focus();
      if (cursorPosition !== undefined) {
        editor.setSelectionRange(cursorPosition, cursorPosition);
      }
    });
  }

  function openShortcut(value: "/" | "@" | "!") {
    dispatch({ type: "set-prompt", prompt: value });
    focusEditor(value.length);
  }

  function appendContextTrigger() {
    if (state.prompt === "@") {
      focusEditor(1);
      return;
    }

    const separator = state.prompt && !state.prompt.endsWith(" ") ? " " : "";
    const prompt = `${state.prompt}${separator}@`;
    dispatch({
      type: "set-prompt",
      prompt,
    });
    focusEditor(prompt.length);
  }

  function selectSuggestion(suggestion: ComposerSuggestion) {
    if (!trigger) return;
    dispatch({ type: "select-suggestion", suggestion, trigger });
    focusEditor();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (shellMode && event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      dispatch({ type: "set-prompt", prompt: state.prompt.slice(1) });
      return;
    }

    if (!trigger) {
      event.stopPropagation();
      return;
    }

    if (event.key === "Tab" && selectedSuggestion) {
      event.preventDefault();
      selectSuggestion(selectedSuggestion);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      dispatch({ type: "dismiss-menu" });
    }
  }

  const composerPanel = (
    <div className="relative w-full text-left">
      <Command
        aria-label={
          trigger
            ? `${menuCopy[trigger.mode].heading} suggestions`
            : "Composer suggestions"
        }
        className="contents"
        loop
        shouldFilter={false}
        value={selectedSuggestion?.id}
        onValueChange={(value) => {
          const index = suggestions.findIndex(
            (suggestion) => suggestion.id === value,
          );
          if (index >= 0) {
            dispatch({ type: "set-selection", index });
          }
        }}
      >
        {trigger ? (
          <div
            id="composer-7-suggestions"
            className="bg-popover absolute right-0 bottom-full left-0 mb-2 overflow-hidden rounded-xl border shadow-lg"
          >
            <div className="flex items-center justify-between border-b px-3 py-2.5">
              <div className="min-w-0">
                <p className="text-xs font-medium">
                  {menuCopy[trigger.mode].heading}
                </p>
                <p className="text-muted-foreground truncate text-[11px]">
                  {menuCopy[trigger.mode].hint}
                </p>
              </div>
              <KbdGroup>
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd>
                <Kbd>Enter</Kbd>
              </KbdGroup>
            </div>
            <CommandList className="max-h-64 p-1">
              <CommandEmpty>{menuCopy[trigger.mode].empty}</CommandEmpty>
              <CommandGroup>
                {suggestions.map((suggestion) => {
                  const Icon = suggestion.icon;
                  return (
                    <CommandItem
                      key={suggestion.id}
                      id={`composer-7-option-${suggestion.id}`}
                      value={suggestion.id}
                      onMouseDown={(event) => event.preventDefault()}
                      onSelect={() => selectSuggestion(suggestion)}
                      className="grid grid-cols-[28px_minmax(0,1fr)_auto] gap-2.5 rounded-lg px-2 py-2"
                    >
                      <span className="bg-muted flex size-7 items-center justify-center rounded-md">
                        <Icon aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-medium">
                          {suggestion.label}
                        </span>
                        <span className="text-muted-foreground block truncate text-[11px]">
                          {suggestion.description}
                        </span>
                      </span>
                      <span className="text-muted-foreground text-[11px]">
                        {suggestion.meta}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </div>
        ) : null}

        <AiChatComposer
          aria-label="Command and context AI composer"
          className="max-w-none"
          onSubmit={(event) => {
            event.preventDefault();
            dispatch({ type: "submit" });
          }}
        >
          {state.references.length ? (
            <div className="flex flex-wrap gap-1.5 px-4 pt-3">
              {state.references.map((reference) => (
                <Badge
                  key={reference.id}
                  variant="secondary"
                  className="gap-1.5 pr-1 font-normal"
                >
                  <reference.icon aria-hidden="true" />
                  <span className="max-w-40 truncate">{reference.label}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${reference.label}`}
                    onClick={() =>
                      dispatch({
                        type: "remove-reference",
                        id: reference.id,
                      })
                    }
                    className="hover:bg-foreground/10 flex size-5 items-center justify-center rounded-sm transition-colors"
                  >
                    <X aria-hidden="true" />
                  </button>
                </Badge>
              ))}
            </div>
          ) : null}
          {shellMode && state.prompt === "!" ? (
            <span className="text-muted-foreground pointer-events-none absolute top-4 left-7 font-mono text-[13px]">
              Enter shell command...
            </span>
          ) : null}
          <CommandAwareEditor
            menuOpen={Boolean(trigger)}
            ref={editorRef}
            role="combobox"
            aria-autocomplete="list"
            aria-controls={trigger ? "composer-7-suggestions" : undefined}
            aria-expanded={Boolean(trigger)}
            placeholder={
              shellMode
                ? undefined
                : "Ask anything, / for commands, @ for context, ! for shell..."
            }
            submitOnEnter={!trigger}
            value={state.prompt}
            onChange={(event) =>
              dispatch({ type: "set-prompt", prompt: event.target.value })
            }
            onKeyDown={handleKeyDown}
            className={cn("min-h-20 text-[13px]", shellMode && "font-mono")}
          />
          <AiChatComposerToolbar>
            {shellMode ? (
              <>
                <AiChatComposerToolbarGroup>
                  <span className="text-muted-foreground flex items-center gap-1.5 px-1 font-mono text-[11px]">
                    <Terminal className="size-3" aria-hidden="true" />
                    Shell mode
                  </span>
                </AiChatComposerToolbarGroup>
                <AiChatComposerToolbarGroup side="end">
                  <span className="text-muted-foreground hidden text-[11px] sm:inline">
                    Esc to exit
                  </span>
                  <AiChatComposerAction
                    label="Run command"
                    type="submit"
                    variant="default"
                    disabled={!canSubmit}
                    className="rounded-full"
                  >
                    <CornerDownLeft aria-hidden="true" />
                  </AiChatComposerAction>
                </AiChatComposerToolbarGroup>
              </>
            ) : (
              <>
                <AiChatComposerToolbarGroup>
                  <AiChatComposerAction
                    label="Add context"
                    type="button"
                    onClick={appendContextTrigger}
                  >
                    <Plus aria-hidden="true" />
                  </AiChatComposerAction>
                  <AiModelPicker value={model} onValueChange={setModel} />
                </AiChatComposerToolbarGroup>
                <AiChatComposerToolbarGroup side="end">
                  <span className="text-muted-foreground hidden text-[11px] md:inline">
                    {trigger ? "Esc to close" : "Shift + Enter for new line"}
                  </span>
                  <AiChatComposerSubmit disabled={!canSubmit} />
                </AiChatComposerToolbarGroup>
              </>
            )}
          </AiChatComposerToolbar>
        </AiChatComposer>
      </Command>
    </div>
  );

  const resetComposer = () => {
    dispatch({ type: "reset" });
    focusEditor();
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
        <ComposerNavigation onNewChat={resetComposer} />
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
          <ComposerNavigation onNewChat={resetComposer} />
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="min-h-0 min-w-0 overflow-hidden pt-12 md:pt-0">
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
            <span className="truncate text-sm font-medium">Composer 7</span>
          </div>
          <PortalSlot name="ai-header-actions" className="shrink-0" />
        </header>

        <Portal to="ai-header-actions">
          <AiSessionActions
            transcript={
              state.lastSubmission
                ? `## You\n\n${state.lastSubmission.prompt}\n\n## Assistant\n\n${responseFor(state.lastSubmission)}`
                : ""
            }
            onClear={resetComposer}
            onReset={resetComposer}
          />
        </Portal>
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-8 sm:px-6 md:py-10">
            {state.lastSubmission ? (
              <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
                <div className="flex justify-end">
                  <div className="flex max-w-[88%] flex-col items-end gap-2 sm:max-w-[76%]">
                    {state.lastSubmission.references.length ? (
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {state.lastSubmission.references.map((reference) => (
                          <Badge
                            key={reference.id}
                            variant="outline"
                            className="bg-background gap-1.5 font-normal [&_svg]:size-3"
                          >
                            <reference.icon aria-hidden="true" />
                            {reference.label}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                    <p
                      className={cn(
                        "max-w-full rounded-2xl rounded-br-md px-4 py-2.5 text-[13px] leading-5",
                        state.lastSubmission.prompt.startsWith("!")
                          ? "bg-foreground text-background font-mono"
                          : "bg-muted",
                      )}
                    >
                      {state.lastSubmission.prompt}
                    </p>
                  </div>
                </div>

                <article className="grid grid-cols-[28px_minmax(0,1fr)] gap-3">
                  <span className="flex size-7 items-center justify-center rounded-lg border">
                    <BrandMark size="xs" />
                  </span>
                  <div className="min-w-0">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-[13px] font-medium">
                        Shadcnblocks AI
                      </span>
                      <span className="text-muted-foreground text-xs">
                        Interaction agent
                      </span>
                    </div>
                    <p className="text-[13px] leading-5">
                      {responseFor(state.lastSubmission)}
                    </p>
                    <div className="text-muted-foreground mt-4 flex items-center gap-2 text-xs">
                      <CheckCircle2 className="text-foreground size-3.5" />
                      Instruction parsed
                      <span aria-hidden="true">·</span>
                      {state.lastSubmission.references.length} context item
                      {state.lastSubmission.references.length === 1 ? "" : "s"}
                    </div>
                  </div>
                </article>
              </div>
            ) : (
              <div className="mx-auto flex min-h-full w-full max-w-2xl items-center justify-center py-8">
                <div className="-mt-10 flex flex-col items-center text-center sm:-mt-16">
                  <span className="bg-muted/70 flex size-10 items-center justify-center rounded-xl border shadow-sm">
                    <BrandMark size="sm" />
                  </span>
                  <h1 className="mt-4 text-base font-medium tracking-[-0.015em]">
                    Start a focused task
                  </h1>
                  <p className="text-muted-foreground mt-1 max-w-sm text-[13px] leading-5">
                    Describe the outcome below, or start with a shortcut.
                  </p>

                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    {interactionRows.map((row) => (
                      <button
                        key={row.trigger}
                        type="button"
                        onClick={() => openShortcut(row.trigger)}
                        className="bg-background hover:bg-muted/60 active:bg-muted flex h-9 items-center gap-2 rounded-lg border px-2.5 text-xs font-medium shadow-xs transition-[background-color,transform] active:scale-[0.98]"
                      >
                        <Kbd className="bg-muted/70 size-5 border-0 px-0">
                          {row.trigger}
                        </Kbd>
                        {row.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-background shrink-0 px-3 pb-3 sm:px-5">
            <div className="mx-auto w-full max-w-2xl">{composerPanel}</div>
          </div>
        </div>
      </SidebarInset>
    </div>
  );
}
