"use client";

import {
  Files,
  FileText,
  ListChecks,
  MessagesSquare,
  PanelLeftClose,
  PencilLine,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  X,
} from "lucide-react";
import * as React from "react";

import {
  AiChatComposer,
  AiChatComposerEditor,
  AiChatComposerSubmit,
  AiChatComposerToolbar,
  AiChatComposerToolbarGroup,
} from "@/components/ai-chat/ai-chat-composer";
import {
  AiChatMessage,
  type AiChatMessageData,
} from "@/components/ai-chat/ai-chat-message";
import { AiConversationScroller } from "@/components/ai-chat/ai-conversation-scroller";
import {
  AiModelPicker,
  defaultAiModelId,
} from "@/components/ai-chat/ai-model-picker";
import { GlideMenu } from "@/components/ai-chat/glide-menu";
import { BrandMark } from "@/components/logo";
import {
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { recordValue } from "@/lib/record-value";
import { cn } from "@/lib/utils";

const SIDEBAR_MOTION = {
  collapsedWidth: 40,
  copyDuration: 180,
  copyOffset: 8,
  duration: 280,
  easing: "cubic-bezier(0.16, 1, 0.3, 1)",
  expandedWidth: 224,
};

const recentChats = [
  "Tighten launch update",
  "Rewrite customer notice",
  "Clarify migration summary",
  "Shorten weekly briefing",
  "Refine approval rationale",
  "Polish release notes",
];

const conversationStarters = [
  {
    icon: FileText,
    id: "tighten-update",
    label: "Tighten a customer-facing update",
    prompt:
      "Tighten this customer-facing update while keeping the rollout details specific.",
  },
  {
    icon: ListChecks,
    id: "meeting-actions",
    label: "Turn meeting notes into clear actions",
    prompt:
      "Turn these meeting notes into clear actions with owners and next steps.",
  },
  {
    icon: MessagesSquare,
    id: "compare-directions",
    label: "Compare two response directions",
    prompt:
      "Compare these two response directions and recommend the clearer one.",
  },
  {
    icon: Search,
    id: "project-context",
    label: "Summarize the latest project context",
    prompt:
      "Summarize the latest project context and call out the decisions still open.",
  },
  {
    icon: PencilLine,
    id: "rewrite-rationale",
    label: "Rewrite an approval rationale",
    prompt:
      "Rewrite this approval rationale so the tradeoff is easy to understand.",
  },
  {
    icon: Files,
    id: "release-brief",
    label: "Create a short release brief",
    prompt:
      "Create a short release brief from these notes for the operations team.",
  },
] as const;

interface ComposerMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
}

interface ComposerChat {
  id: number;
  messages: ComposerMessage[];
  title: string | null;
}

const conversationPrompts = {
  "Tighten launch update":
    "Tighten the launch update and keep the operational safeguards specific.",
  "Rewrite customer notice":
    "Rewrite the customer notice so the impact is clear without sounding alarmist.",
  "Clarify migration summary":
    "Clarify the migration summary and keep the rollback boundary explicit.",
  "Shorten weekly briefing":
    "Shorten the weekly briefing while preserving decisions and owners.",
  "Refine approval rationale":
    "Refine the approval rationale so reviewers can understand the tradeoff quickly.",
  "Polish release notes":
    "Polish the release notes and separate customer value from operational detail.",
} satisfies Record<string, string>;

function assistantReply(prompt: string) {
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes("meeting") || lowerPrompt.includes("action")) {
    return "I organized the notes around decisions, owners, and next steps. Share the source material and I’ll turn it into a concise action list without losing the open questions.";
  }

  if (lowerPrompt.includes("compare")) {
    return "Send both directions and I’ll compare them for clarity, tone, and decision cost. I’ll recommend one direction and keep the strongest detail from the alternative.";
  }

  if (lowerPrompt.includes("summary") || lowerPrompt.includes("summarize")) {
    return "I’ll separate confirmed context from open decisions, then reduce the rest to the details someone needs to act. Add the project notes whenever you’re ready.";
  }

  return "I’ll tighten the structure, preserve the important constraints, and make the next action obvious. Paste the draft or source notes and I’ll produce a focused first pass.";
}

function createSeededChat(id: number, title: string): ComposerChat {
  const prompt = recordValue(conversationPrompts, title) ?? title;

  return {
    id,
    title,
    messages: [
      { id: `${id}-seed-user`, role: "user", text: prompt },
      {
        id: `${id}-seed-assistant`,
        role: "assistant",
        text: assistantReply(prompt),
      },
    ],
  };
}

interface ComposerSidebarProps {
  activeTitle: string | null;
  collapsed: boolean;
  onNewChat: () => void;
  onPickRecent: (title: string) => void;
}

function ComposerSidebarRow({
  count,
  icon: Icon,
  label,
  onClick,
}: {
  count?: string;
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
}) {
  return (
    <SidebarMenuItem className="mx-2 group-data-[collapsed=true]/composer-sidebar:mr-0">
      <SidebarMenuButton
        data-glide-menu-row
        type="button"
        onClick={onClick}
        title={label}
        className="relative z-10 text-[var(--composer-workspace-ink-2)] hover:bg-transparent hover:text-[var(--composer-workspace-ink)] active:scale-[0.98]"
      >
        <Icon strokeWidth={1.8} aria-hidden="true" />
        <span className="composer-workspace-sidebar-copy min-w-0 flex-1 truncate">
          {label}
        </span>
        {count ? (
          <span className="composer-workspace-sidebar-copy mr-2 shrink-0 text-xs font-medium text-[var(--composer-workspace-ink-3)] tabular-nums">
            {count}
          </span>
        ) : null}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function ComposerSidebar({
  activeTitle,
  collapsed,
  onNewChat,
  onPickRecent,
}: ComposerSidebarProps) {
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const visibleRecents = recentChats.filter((chat) =>
    chat.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <aside
      data-collapsed={collapsed}
      aria-label="Workspace navigation"
      className="composer-workspace-sidebar group/composer-sidebar relative hidden h-full shrink-0 overflow-hidden transition-[width] lg:flex"
      style={
        // SAFETY: these locally declared CSS custom properties contain CSS strings or numbers.
        {
          width: collapsed
            ? SIDEBAR_MOTION.collapsedWidth
            : SIDEBAR_MOTION.expandedWidth,
          transitionDuration: `${SIDEBAR_MOTION.duration}ms`,
          transitionTimingFunction: SIDEBAR_MOTION.easing,
          "--composer-workspace-sidebar-copy-duration": `${SIDEBAR_MOTION.copyDuration}ms`,
          "--composer-workspace-sidebar-copy-offset": `${SIDEBAR_MOTION.copyOffset}px`,
        } as React.CSSProperties
      }
    >
      <div className="flex min-h-0 w-full shrink-0 flex-col">
        <div className="relative mb-2 h-12 shrink-0">
          <div
            className="composer-workspace-sidebar-workspace absolute top-4 left-2 w-[208px]"
            inert={collapsed}
          >
            <div className="flex h-8 items-center gap-2 px-2">
              <span className="flex size-4 shrink-0 items-center justify-center">
                <BrandMark decorative size="sm" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] leading-[15px] font-medium text-[var(--composer-workspace-ink)]">
                  Shadcnblocks
                </span>
                <span className="block truncate text-[10.5px] leading-[13px] text-[var(--composer-workspace-ink-3)]">
                  Composer 6
                </span>
              </span>
            </div>
          </div>

          <div className="composer-workspace-sidebar-tile absolute top-4 left-2">
            <div className="flex size-8 items-center justify-center">
              <BrandMark decorative size="sm" />
            </div>
          </div>
        </div>

        <SidebarGroupLabel
          className={cn(
            "mx-2 mt-4 text-[var(--composer-workspace-ink-2)]",
            collapsed && "hidden",
          )}
        >
          Actions
        </SidebarGroupLabel>
        <GlideMenu
          className="shrink-0"
          highlightClassName="inset-x-2 rounded-md bg-[var(--composer-workspace-hover-2)] group-data-[collapsed=true]/composer-sidebar:right-0"
        >
          <SidebarMenu>
            <ComposerSidebarRow
              icon={PencilLine}
              label="New conversation"
              onClick={onNewChat}
            />
            <ComposerSidebarRow
              icon={ListChecks}
              label="Review queue"
              count="3"
            />
            <ComposerSidebarRow
              icon={Files}
              label="Saved responses"
              count="12"
            />
          </SidebarMenu>
        </GlideMenu>

        <div
          inert={collapsed}
          aria-hidden={collapsed}
          className={cn(
            "mt-3 min-h-0 flex-1 overflow-y-auto",
            collapsed && "invisible",
          )}
        >
          <div className="composer-workspace-sidebar-copy relative mx-2 mb-1 h-8">
            <div
              aria-hidden={searchOpen}
              className={cn(
                "absolute inset-0 flex items-center px-2 text-[12.5px] font-medium text-[var(--composer-workspace-ink-3)] transition-[opacity,transform] duration-180",
                searchOpen
                  ? "pointer-events-none -translate-x-1 opacity-0"
                  : "translate-x-0 opacity-100",
              )}
            >
              <span>Recent conversations</span>
            </div>

            <button
              type="button"
              aria-label="Search conversations"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen(true)}
              className={cn(
                "absolute top-0 right-0 flex size-8 items-center justify-center rounded-[8px] text-[var(--composer-workspace-ink-3)] transition-[opacity,background-color,color,transform] duration-180 hover:bg-[var(--composer-workspace-hover-2)] hover:text-[var(--composer-workspace-ink)] active:scale-[0.96]",
                searchOpen ? "pointer-events-none opacity-0" : "opacity-100",
              )}
            >
              <Search className="size-4" strokeWidth={1.8} />
            </button>

            <div
              className={cn(
                "absolute top-0 right-0 flex h-8 items-center overflow-hidden rounded-[8px] bg-[var(--composer-workspace-field)] text-[var(--composer-workspace-ink-3)] shadow-[var(--composer-workspace-shadow-hairline)] transition-[width,opacity] duration-180 focus-within:text-[var(--composer-workspace-ink-2)]",
                searchOpen
                  ? "pointer-events-auto w-full opacity-100"
                  : "pointer-events-none w-7 opacity-0",
              )}
            >
              <Search className="ml-2 size-[15px] shrink-0" strokeWidth={1.8} />
              <input
                autoFocus={searchOpen}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setSearchOpen(false);
                    setQuery("");
                  }
                }}
                placeholder="Search conversations"
                aria-label="Search recent conversations"
                className="ml-1.5 min-w-0 flex-1 bg-transparent text-[13px] font-medium text-[var(--composer-workspace-ink)] outline-none placeholder:text-[var(--composer-workspace-ink-3)]"
              />
              <button
                type="button"
                aria-label="Close conversation search"
                onClick={() => {
                  setSearchOpen(false);
                  setQuery("");
                }}
                className="flex size-8 shrink-0 items-center justify-center rounded-[8px] text-[var(--composer-workspace-ink-3)] transition-[background-color,color,transform] duration-150 hover:bg-[var(--composer-workspace-hover-2)] hover:text-[var(--composer-workspace-ink)] active:scale-[0.96]"
              >
                <X className="size-4" strokeWidth={1.8} />
              </button>
            </div>
          </div>

          <GlideMenu
            className="flex flex-col gap-px"
            highlightClassName="inset-x-2 rounded-[7px] bg-[var(--composer-workspace-hover-2)]"
          >
            {visibleRecents.map((chat) => {
              const active = chat === activeTitle;
              return (
                <button
                  key={chat}
                  data-glide-menu-row
                  type="button"
                  title={chat}
                  onClick={() => onPickRecent(chat)}
                  className={cn(
                    "relative z-10 mx-2 flex h-8 items-center rounded-[8px] px-2 text-left transition-[width,background-color,color,transform] duration-150 active:scale-[0.98]",
                    active && "bg-[var(--composer-workspace-hover-2)]",
                  )}
                >
                  <span
                    className={cn(
                      "composer-workspace-sidebar-copy min-w-0 flex-1 truncate text-[14px] font-medium",
                      active
                        ? "text-[var(--composer-workspace-ink)]"
                        : "text-[var(--composer-workspace-ink-2)]",
                    )}
                  >
                    {chat}
                  </span>
                </button>
              );
            })}
            {query && visibleRecents.length === 0 ? (
              <div className="composer-workspace-sidebar-copy mx-2 px-2 py-2 text-[12.5px] text-[var(--composer-workspace-ink-3)]">
                No conversations found
              </div>
            ) : null}
          </GlideMenu>
        </div>

        <div
          inert={collapsed}
          aria-hidden={collapsed}
          className={cn(
            "composer-workspace-sidebar-copy mx-2 mt-3 w-[208px] border-t border-[var(--composer-workspace-line)] pt-3",
            collapsed && "invisible",
          )}
        >
          <button
            type="button"
            className="flex h-8 w-full items-center gap-2 rounded-[8px] px-2 text-left text-[12.5px] font-medium text-[var(--composer-workspace-ink-2)] transition-[background-color,color,transform] duration-150 hover:bg-[var(--composer-workspace-hover-2)] hover:text-[var(--composer-workspace-ink)] active:scale-[0.98]"
          >
            <Settings2 className="size-4" strokeWidth={1.8} />
            <span className="min-w-0 flex-1 truncate">Workspace settings</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

interface ComposerTabBarProps {
  activeId: number;
  chats: ComposerChat[];
  onActivate: (id: number) => void;
  onClose: (id: number) => void;
  onNew: () => void;
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

function ComposerTabBar({
  activeId,
  chats,
  onActivate,
  onClose,
  onNew,
  onToggleSidebar,
  sidebarCollapsed,
}: ComposerTabBarProps) {
  const tabRefs = React.useRef(new Map<number, HTMLButtonElement>());

  React.useEffect(() => {
    tabRefs.current.get(activeId)?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
    });
  }, [activeId]);

  const moveFocus = (currentId: number, direction: -1 | 1) => {
    const currentIndex = chats.findIndex((chat) => chat.id === currentId);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + direction + chats.length) % chats.length;
    const nextId = chats[nextIndex].id;
    onActivate(nextId);
    tabRefs.current.get(nextId)?.focus();
  };

  return (
    <header className="flex h-12 shrink-0 items-end bg-[var(--composer-workspace-canvas)] px-2">
      <div className="flex min-w-0 flex-1 items-center gap-1.5 pb-0.5">
        <SidebarTrigger className="size-7 shrink-0 lg:hidden" />
        <button
          type="button"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!sidebarCollapsed}
          onMouseDown={(event) => event.preventDefault()}
          onClick={onToggleSidebar}
          className="hidden size-7 shrink-0 items-center justify-center rounded-[6px] text-[var(--composer-workspace-ink-3)] transition-colors duration-100 hover:bg-[var(--composer-workspace-hover)] hover:text-[var(--composer-workspace-ink)] focus-visible:bg-[var(--composer-workspace-hover)] focus-visible:outline-none lg:flex"
        >
          <PanelLeftClose
            className={cn("size-[16px]", sidebarCollapsed && "rotate-180")}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </button>

        <div className="w-fit max-w-[calc(100%-2.25rem)] min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div
            role="tablist"
            aria-label="Open chats"
            className="flex w-max items-center gap-1.5"
          >
            {chats.map((chat, index) => {
              const active = chat.id === activeId;
              const previousIsActive = chats[index - 1]?.id === activeId;
              const draft = chat.title === null;

              return (
                <div
                  key={chat.id}
                  className={cn(
                    "relative flex min-w-0 shrink-0 before:absolute before:top-2 before:-left-[3.75px] before:h-3 before:w-px before:rounded-full before:bg-[var(--composer-workspace-line-strong)]",
                    draft ? "w-40" : "w-56",
                    (index === 0 || active || previousIsActive) &&
                      "before:hidden",
                  )}
                >
                  <div
                    className={cn(
                      "group relative flex h-7 w-full min-w-0 items-center gap-1.5 overflow-hidden rounded-[6px] px-1.5 text-[13px] font-medium whitespace-nowrap",
                      active
                        ? "bg-[var(--composer-workspace-hover-2)] text-[var(--composer-workspace-ink)]"
                        : "text-[var(--composer-workspace-ink-2)] hover:bg-[var(--composer-workspace-hover)] hover:text-[var(--composer-workspace-ink)]",
                    )}
                  >
                    <span className="flex size-4 shrink-0 items-center justify-center">
                      {draft ? (
                        <PencilLine className="size-3.5" strokeWidth={1.8} />
                      ) : (
                        <span className="flex size-4 items-center justify-center rounded-[3px] bg-[var(--composer-workspace-ink-2)] text-[9px] font-semibold text-[var(--composer-workspace-surface)]">
                          {chat.title?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </span>
                    <button
                      ref={(node) => {
                        if (node) tabRefs.current.set(chat.id, node);
                        else tabRefs.current.delete(chat.id);
                      }}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      tabIndex={active ? 0 : -1}
                      onMouseDown={(event) => {
                        if (event.button === 0) onActivate(chat.id);
                      }}
                      onClick={() => onActivate(chat.id)}
                      onKeyDown={(event) => {
                        if (event.key === "ArrowLeft") {
                          event.preventDefault();
                          moveFocus(chat.id, -1);
                        } else if (event.key === "ArrowRight") {
                          event.preventDefault();
                          moveFocus(chat.id, 1);
                        } else if (event.key === "Home") {
                          event.preventDefault();
                          const firstId = chats[0]?.id;
                          if (firstId) {
                            onActivate(firstId);
                            tabRefs.current.get(firstId)?.focus();
                          }
                        } else if (event.key === "End") {
                          event.preventDefault();
                          const lastId = chats.at(-1)?.id;
                          if (lastId) {
                            onActivate(lastId);
                            tabRefs.current.get(lastId)?.focus();
                          }
                        }
                      }}
                      title={chat.title ?? "New chat"}
                      className="min-w-0 flex-1 overflow-hidden pr-5 text-left outline-none focus-visible:ring-1 focus-visible:ring-[var(--composer-workspace-ink-3)]"
                    >
                      <span className="block truncate">
                        {chat.title ?? "New chat"}
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-label={`Close ${chat.title ?? "New chat"}`}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => onClose(chat.id)}
                      className={cn(
                        "absolute top-1 right-1 flex size-5 items-center justify-center rounded-[4px] bg-[var(--composer-workspace-hover-2)] text-[var(--composer-workspace-ink-3)] opacity-0 transition-[opacity,background-color,color] duration-100 group-focus-within:opacity-100 group-hover:opacity-100 hover:text-[var(--composer-workspace-ink)] focus-visible:opacity-100 focus-visible:outline-none",
                        active && "opacity-100",
                      )}
                    >
                      <X className="size-3" strokeWidth={2.2} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          aria-label="New chat"
          onMouseDown={(event) => event.preventDefault()}
          onClick={onNew}
          className="flex size-7 shrink-0 items-center justify-center rounded-[6px] text-[var(--composer-workspace-ink-3)] transition-colors duration-100 hover:bg-[var(--composer-workspace-hover)] hover:text-[var(--composer-workspace-ink)] focus-visible:bg-[var(--composer-workspace-hover)] focus-visible:outline-none"
        >
          <Plus className="size-[15px]" strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}

interface WorkspaceComposerProps {
  prompt: string;
  setPrompt: (value: string) => void;
  busy?: boolean;
  density?: "compact" | "default";
  onSend: (text: string) => void;
  onStop?: () => void;
  placement?: "home" | "thread";
  placeholder: string;
}

function WorkspaceComposer({
  prompt,
  setPrompt,
  busy = false,
  density = "default",
  onSend,
  onStop,
  placement = "thread",
  placeholder,
}: WorkspaceComposerProps) {
  const [model, setModel] = React.useState(defaultAiModelId);

  return (
    <AiChatComposer
      appearance="quiet"
      aria-label={
        placement === "home" ? "Start conversation" : "Continue conversation"
      }
      density={density}
      placement={placement}
      onSubmit={(event) => {
        event.preventDefault();
        if (!prompt.trim() || busy) return;
        onSend(prompt.trim());
        setPrompt("");
      }}
    >
      <AiChatComposerEditor
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        placeholder={placeholder}
        disabled={busy}
        className={density === "compact" ? undefined : "min-h-16"}
      />
      <AiChatComposerToolbar>
        <AiChatComposerToolbarGroup />
        <AiChatComposerToolbarGroup side="end">
          <AiModelPicker value={model} onValueChange={setModel} />
          <AiChatComposerSubmit
            status={busy ? "submitted" : "ready"}
            onStop={onStop}
            disabled={!prompt.trim()}
          />
        </AiChatComposerToolbarGroup>
      </AiChatComposerToolbar>
    </AiChatComposer>
  );
}

function ComposerStart({
  prompt,
  setPrompt,
  busy,
  onSend,
  onStop,
}: {
  prompt: string;
  setPrompt: (value: string) => void;
  busy: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
}) {
  const [suggestionOffset, setSuggestionOffset] = React.useState(0);
  const shownSuggestions = [0, 1, 2, 3].map(
    (index) =>
      conversationStarters[
        (suggestionOffset + index) % conversationStarters.length
      ],
  );

  return (
    <div className="mx-auto flex min-h-full w-full max-w-[720px] flex-col justify-center px-4 py-10 sm:px-8">
      <h1 className="text-[26px] font-normal tracking-[-0.02em] text-[var(--composer-workspace-ink)]">
        <span className="ai-home-reveal ai-home-reveal-kicker block text-[var(--composer-workspace-ink-3)]">
          Hello Robert
        </span>
        <span className="ai-home-reveal ai-home-reveal-title block">
          What are we working on?
        </span>
      </h1>

      <div className="ai-home-reveal ai-home-reveal-composer mt-7">
        <WorkspaceComposer
          prompt={prompt}
          setPrompt={setPrompt}
          busy={busy}
          density="compact"
          placement="home"
          placeholder="Ask about a draft, audience, or outcome…"
          onSend={onSend}
          onStop={onStop}
        />
      </div>

      <section className="ai-home-reveal ai-home-reveal-suggestions mt-6">
        <div className="flex min-h-7 items-center justify-between px-0.5 text-xs text-[var(--composer-workspace-ink-3)]">
          <span>Suggested starting points</span>
          <button
            type="button"
            onClick={() =>
              setSuggestionOffset(
                (current) => (current + 4) % conversationStarters.length,
              )
            }
            className="flex items-center gap-1.5 rounded-[6px] px-1.5 py-1 transition-colors duration-150 hover:bg-[var(--composer-workspace-hover)] hover:text-[var(--composer-workspace-ink)]"
          >
            <RefreshCw className="size-3.5" strokeWidth={1.8} />
            Shuffle
          </button>
        </div>

        <div className="mt-1 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
          {shownSuggestions.map((suggestion) => {
            const Icon = suggestion.icon;

            return (
              <button
                key={suggestion.id}
                type="button"
                onClick={() => onSend(suggestion.prompt)}
                className="group flex min-w-0 items-center gap-3 border-t border-[var(--composer-workspace-line)] px-0.5 py-3 text-left text-[13.5px] text-[var(--composer-workspace-ink-2)] transition-colors duration-150 hover:text-[var(--composer-workspace-ink)]"
              >
                <Icon
                  className="size-[15px] shrink-0 text-[var(--composer-workspace-ink-3)] transition-colors duration-150 group-hover:text-[var(--composer-workspace-ink-2)]"
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                <span className="min-w-0 truncate">{suggestion.label}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function ComposerThread({
  prompt,
  setPrompt,
  busy,
  chat,
  onSend,
  onStop,
}: {
  prompt: string;
  setPrompt: (value: string) => void;
  busy: boolean;
  chat: ComposerChat;
  onSend: (text: string) => void;
  onStop: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AiConversationScroller>
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:px-6 md:py-10">
          {chat.messages.map((message) => {
            const data: AiChatMessageData = {
              id: String(message.id),
              role: message.role,
              parts: [{ type: "text", text: message.text }],
            };

            return <AiChatMessage key={message.id} message={data} />;
          })}
          {busy ? (
            <AiChatMessage
              message={{
                id: `${chat.id}-pending`,
                role: "assistant",
                parts: [],
              }}
              status="thinking"
            />
          ) : null}
        </div>
      </AiConversationScroller>

      <div className="shrink-0 bg-[var(--composer-workspace-page)] px-4 pt-3 pb-4 sm:px-6">
        <WorkspaceComposer
          prompt={prompt}
          setPrompt={setPrompt}
          busy={busy}
          placeholder="Ask a follow-up or add more context…"
          onSend={onSend}
          onStop={onStop}
        />
      </div>
    </div>
  );
}

export function AiChatComposer6Screen() {
  const [drafts, setDrafts] = React.useState<Record<string, string>>({});
  const nextChatId = React.useRef(1);
  const nextMessageId = React.useRef(0);
  const responseTimers = React.useRef(new Map<number, number>());
  const [chats, setChats] = React.useState<ComposerChat[]>([
    { id: 1, title: null, messages: [] },
  ]);
  const [activeId, setActiveId] = React.useState(1);
  const [pendingChatIds, setPendingChatIds] = React.useState<Set<number>>(
    () => new Set(),
  );
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const activeChat = chats.find((chat) => chat.id === activeId) ?? chats[0];
  const activeChatBusy = pendingChatIds.has(activeChat.id);

  React.useEffect(
    () => () => {
      responseTimers.current.forEach(window.clearTimeout);
      responseTimers.current.clear();
    },
    [],
  );

  const stopGeneration = React.useCallback((chatId: number) => {
    const timer = responseTimers.current.get(chatId);
    if (timer !== undefined) window.clearTimeout(timer);
    responseTimers.current.delete(chatId);
    setPendingChatIds((current) => {
      const next = new Set(current);
      next.delete(chatId);
      return next;
    });
  }, []);

  const createChat = React.useCallback(() => {
    const id = (nextChatId.current += 1);
    setChats((current) => [...current, { id, title: null, messages: [] }]);
    setActiveId(id);
  }, []);

  const closeChat = React.useCallback(
    (id: number) => {
      stopGeneration(id);
      const closingIndex = chats.findIndex((chat) => chat.id === id);
      const remaining = chats.filter((chat) => chat.id !== id);

      if (remaining.length === 0) {
        const replacementId = (nextChatId.current += 1);
        setChats([{ id: replacementId, title: null, messages: [] }]);
        setActiveId(replacementId);
        return;
      }

      setChats(remaining);
      if (id === activeId) {
        setActiveId(remaining[Math.min(closingIndex, remaining.length - 1)].id);
      }
    },
    [activeId, chats, stopGeneration],
  );

  const send = React.useCallback(
    (text: string) => {
      if (pendingChatIds.has(activeId)) return;

      const userMessage: ComposerMessage = {
        id: `${activeId}-${(nextMessageId.current += 1)}-user`,
        role: "user",
        text,
      };

      setChats((current) =>
        current.map((chat) => {
          if (chat.id !== activeId) return chat;

          const title =
            chat.title ??
            (text.length > 34 ? `${text.slice(0, 34).trimEnd()}…` : text);

          return {
            ...chat,
            title,
            messages: [...chat.messages, userMessage],
          };
        }),
      );

      setPendingChatIds((current) => new Set(current).add(activeId));
      const chatId = activeId;
      const timer = window.setTimeout(() => {
        const responseMessage: ComposerMessage = {
          id: `${chatId}-${(nextMessageId.current += 1)}-assistant`,
          role: "assistant",
          text: assistantReply(text),
        };
        setChats((current) =>
          current.map((chat) =>
            chat.id === chatId
              ? { ...chat, messages: [...chat.messages, responseMessage] }
              : chat,
          ),
        );
        responseTimers.current.delete(chatId);
        setPendingChatIds((current) => {
          const next = new Set(current);
          next.delete(chatId);
          return next;
        });
      }, 900);
      responseTimers.current.set(chatId, timer);
    },
    [activeId, pendingChatIds],
  );

  const pickRecent = React.useCallback(
    (title: string) => {
      const existing = chats.find((chat) => chat.title === title);
      if (existing) {
        setActiveId(existing.id);
        return;
      }

      const id = (nextChatId.current += 1);
      const seeded = createSeededChat(id, title);
      setChats((current) => [...current, seeded]);
      setActiveId(id);
    },
    [chats],
  );

  return (
    <>
      <main
        data-composer-workspace
        className="flex h-[100dvh] w-full gap-0 overflow-hidden bg-[var(--composer-workspace-canvas)] font-[var(--font-inter)] tracking-[-0.01em] text-[var(--composer-workspace-ink)]"
      >
        <ComposerSidebar
          activeTitle={activeChat.title}
          collapsed={sidebarCollapsed}
          onNewChat={createChat}
          onPickRecent={pickRecent}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <ComposerTabBar
            activeId={activeId}
            chats={chats}
            onActivate={setActiveId}
            onClose={closeChat}
            onNew={createChat}
            onToggleSidebar={() => setSidebarCollapsed((current) => !current)}
            sidebarCollapsed={sidebarCollapsed}
          />

          <div className="flex min-h-0 flex-1 px-2 pt-1 pb-2">
            <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[14px] border border-[var(--composer-workspace-line)] bg-[var(--composer-workspace-page)]">
              {activeChat.messages.length ? (
                <ComposerThread
                  prompt={drafts[activeChat.id] ?? ""}
                  setPrompt={(value) =>
                    setDrafts((current) => ({
                      ...current,
                      [activeChat.id]: value,
                    }))
                  }
                  key={activeChat.id}
                  busy={activeChatBusy}
                  chat={activeChat}
                  onSend={send}
                  onStop={() => stopGeneration(activeChat.id)}
                />
              ) : (
                <div className="min-h-0 flex-1 overflow-y-auto">
                  <ComposerStart
                    prompt={drafts[activeChat.id] ?? ""}
                    setPrompt={(value) =>
                      setDrafts((current) => ({
                        ...current,
                        [activeChat.id]: value,
                      }))
                    }
                    busy={activeChatBusy}
                    onSend={send}
                    onStop={() => stopGeneration(activeChat.id)}
                  />
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
