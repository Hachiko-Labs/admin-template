"use client";

import {
  Archive,
  Check,
  ChevronDown,
  ChevronRight,
  Circle,
  CircleDashed,
  Copy,
  Ellipsis,
  Folder,
  FolderOpen,
  GitBranch,
  GitPullRequest,
  Pin,
  Plus,
  Search,
  SquarePen,
} from "lucide-react";
import * as React from "react";

import {
  AiConversationSidebarItem,
  AiConversationSidebarSection,
} from "@/components/ai-chat/ai-conversation-navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type SessionStatus = "working" | "monitoring" | "ready" | "settled";

type CodingSession = {
  id: string;
  repository: string;
  title: string;
  branch: string;
  pullRequest?: number;
  provider: "Code" | "Review";
  status: SessionStatus;
  elapsedSeconds?: number;
  pinned?: boolean;
  environment?: "local" | "remote";
};

const initialSessions: CodingSession[] = [
  {
    id: "billing-migration",
    repository: "shadcnblocks/admin",
    title: "Plan billing webhook migration",
    branch: "feat/billing-webhooks",
    pullRequest: 624,
    provider: "Code",
    status: "monitoring",
    elapsedSeconds: 88,
    pinned: true,
    environment: "local",
  },
  {
    id: "repository-tree",
    repository: "shadcnblocks/admin",
    title: "Refine repository tree interactions",
    branch: "feat/repository-tree",
    pullRequest: 619,
    provider: "Code",
    status: "working",
    elapsedSeconds: 42,
    pinned: true,
    environment: "local",
  },
  {
    id: "hydration",
    repository: "shadcnblocks/admin",
    title: "Trace preview hydration mismatch",
    branch: "fix/preview-hydration",
    pullRequest: 617,
    provider: "Review",
    status: "working",
    elapsedSeconds: 255,
    environment: "remote",
  },
  {
    id: "mobile-workspace",
    repository: "shadcnblocks/admin",
    title: "Review mobile workspace sheet",
    branch: "review/mobile-workspace",
    pullRequest: 612,
    provider: "Review",
    status: "ready",
    environment: "local",
  },
  {
    id: "diff-contrast",
    repository: "shadcnblocks/admin",
    title: "Improve code diff contrast",
    branch: "fix/diff-contrast",
    pullRequest: 609,
    provider: "Review",
    status: "ready",
    environment: "local",
  },
  {
    id: "keyboard-resize",
    repository: "shadcnblocks/admin",
    title: "Add keyboard workspace resizing",
    branch: "feat/keyboard-resize",
    pullRequest: 607,
    provider: "Code",
    status: "working",
    elapsedSeconds: 136,
    environment: "local",
  },
  {
    id: "conversation-outline",
    repository: "shadcnblocks/admin",
    title: "Validate conversation outline anchors",
    branch: "review/conversation-outline",
    pullRequest: 603,
    provider: "Review",
    status: "ready",
    environment: "remote",
  },
  {
    id: "preview-viewports",
    repository: "shadcnblocks/marketing",
    title: "Tune preview viewport controls",
    branch: "feat/preview-viewports",
    pullRequest: 98,
    provider: "Code",
    status: "monitoring",
    elapsedSeconds: 318,
    environment: "local",
  },
  {
    id: "pierre-versions",
    repository: "shadcnblocks/admin",
    title: "Pin Pierre renderer versions",
    branch: "chore/pierre-versions",
    pullRequest: 598,
    provider: "Review",
    status: "ready",
    environment: "local",
  },
  {
    id: "message-anchors",
    repository: "shadcnblocks/admin",
    title: "Refactor message anchor navigation",
    branch: "refactor/message-anchors",
    pullRequest: 594,
    provider: "Code",
    status: "ready",
    environment: "local",
  },
  {
    id: "workspace-shortcuts",
    repository: "shadcnblocks/admin",
    title: "Add coding workspace shortcuts",
    branch: "feat/workspace-shortcuts",
    pullRequest: 589,
    provider: "Code",
    status: "working",
    elapsedSeconds: 71,
    environment: "remote",
  },
  {
    id: "artifact-actions",
    repository: "shadcnblocks/admin",
    title: "Review artifact copy actions",
    branch: "review/artifact-actions",
    pullRequest: 584,
    provider: "Review",
    status: "ready",
    environment: "local",
  },
  {
    id: "toolbar-actions",
    repository: "shadcnblocks/admin",
    title: "Audit coding toolbar actions",
    branch: "review/toolbar-actions",
    pullRequest: 581,
    provider: "Review",
    status: "ready",
    environment: "local",
  },
  {
    id: "tree-search",
    repository: "shadcnblocks/admin",
    title: "Fix repository tree search state",
    branch: "fix/tree-search",
    pullRequest: 578,
    provider: "Code",
    status: "ready",
    environment: "local",
  },
  {
    id: "branch-badges",
    repository: "shadcnblocks/admin",
    title: "Add branch and worktree badges",
    branch: "feat/branch-badges",
    pullRequest: 575,
    provider: "Code",
    status: "monitoring",
    elapsedSeconds: 203,
    environment: "remote",
  },
  {
    id: "code-tabs",
    repository: "shadcnblocks/admin",
    title: "Review code panel tab behavior",
    branch: "review/code-tabs",
    pullRequest: 573,
    provider: "Review",
    status: "ready",
    environment: "local",
  },
  {
    id: "scroll-continuity",
    repository: "shadcnblocks/admin",
    title: "Tune workspace scroll continuity",
    branch: "fix/scroll-continuity",
    pullRequest: 569,
    provider: "Code",
    status: "working",
    elapsedSeconds: 94,
    environment: "local",
  },
  {
    id: "workspace-accessibility",
    repository: "shadcnblocks/admin",
    title: "Validate workspace accessibility",
    branch: "review/workspace-a11y",
    pullRequest: 568,
    provider: "Review",
    status: "ready",
    environment: "remote",
  },
  {
    id: "prompt-studio",
    repository: "shadcnblocks/admin",
    title: "Structure prompt studio debug pane",
    branch: "feat/prompt-studio",
    provider: "Code",
    status: "settled",
    environment: "local",
  },
  {
    id: "marketing-preview",
    repository: "shadcnblocks/marketing",
    title: "Integrate marketing preview workspace",
    branch: "feat/marketing-preview",
    pullRequest: 91,
    provider: "Code",
    status: "settled",
    environment: "remote",
  },
  {
    id: "composer-navigation",
    repository: "shadcnblocks/admin",
    title: "Restore composer navigation parity",
    branch: "fix/composer-navigation",
    pullRequest: 571,
    provider: "Review",
    status: "settled",
    environment: "local",
  },
  {
    id: "conversation-variants",
    repository: "shadcnblocks/admin",
    title: "Add conversation showcase variants",
    branch: "feat/conversation-variants",
    pullRequest: 566,
    provider: "Code",
    status: "settled",
    environment: "local",
  },
  {
    id: "diffshub-tree",
    repository: "shadcnblocks/admin",
    title: "Polish Diffshub repository tree",
    branch: "feat/diffshub-tree",
    pullRequest: 559,
    provider: "Review",
    status: "settled",
    environment: "remote",
  },
  {
    id: "mainline-preview",
    repository: "shadcnblocks/marketing",
    title: "Build Mainline marketing preview",
    branch: "feat/mainline-preview",
    pullRequest: 84,
    provider: "Code",
    status: "settled",
    environment: "local",
  },
  {
    id: "selector-suspense",
    repository: "shadcnblocks/admin",
    title: "Fix screen selector suspense boundary",
    branch: "fix/selector-suspense",
    pullRequest: 548,
    provider: "Review",
    status: "settled",
    environment: "local",
  },
  {
    id: "mobile-sheets",
    repository: "shadcnblocks/admin",
    title: "Validate responsive workspace sheets",
    branch: "review/mobile-sheets",
    pullRequest: 542,
    provider: "Review",
    status: "settled",
    environment: "remote",
  },
  {
    id: "prompt-blocks",
    repository: "shadcnblocks/admin",
    title: "Add structured prompt editor blocks",
    branch: "feat/prompt-blocks",
    pullRequest: 537,
    provider: "Code",
    status: "settled",
    environment: "local",
  },
  {
    id: "hydration-audit",
    repository: "shadcnblocks/admin",
    title: "Audit Radix hydration warnings",
    branch: "review/hydration-audit",
    pullRequest: 531,
    provider: "Review",
    status: "settled",
    environment: "local",
  },
];

function formatElapsed(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m`;
}

function getVerticalScrollMask(scrollTop: number, maxScroll: number) {
  const fadeDistance = 24;
  const topFade = Math.max(0, Math.min(1, scrollTop / fadeDistance));
  const bottomFade = Math.max(
    0,
    Math.min(1, (maxScroll - scrollTop) / fadeDistance),
  );

  return `linear-gradient(to bottom, rgba(0,0,0,${
    1 - topFade
  }) 0, black ${fadeDistance}px, black calc(100% - ${fadeDistance}px), rgba(0,0,0,${
    1 - bottomFade
  }) 100%)`;
}

function bindVerticalScrollMask(root: HTMLDivElement | null) {
  const viewport = root?.querySelector<HTMLElement>(
    '[data-slot="scroll-area-viewport"]',
  );
  if (!viewport) return;

  const updateMask = () => {
    const maxScroll = Math.max(
      0,
      viewport.scrollHeight - viewport.clientHeight,
    );
    const mask = getVerticalScrollMask(viewport.scrollTop, maxScroll);
    viewport.style.maskImage = mask;
    viewport.style.webkitMaskImage = mask;
  };

  updateMask();
  viewport.addEventListener("scroll", updateMask, { passive: true });

  const observer = new ResizeObserver(updateMask);
  observer.observe(viewport);
  const content = viewport.firstElementChild;
  if (content instanceof HTMLElement) observer.observe(content);

  return () => {
    viewport.removeEventListener("scroll", updateMask);
    observer.disconnect();
    viewport.style.removeProperty("mask-image");
    viewport.style.removeProperty("-webkit-mask-image");
  };
}

function SessionStatusIcon({ status }: { status: SessionStatus }) {
  if (status === "working") {
    return (
      <CircleDashed className="text-muted-foreground size-3.5 shrink-0 animate-spin" />
    );
  }
  if (status === "monitoring") {
    return (
      <span className="relative grid size-3.5 shrink-0 place-items-center">
        <span className="bg-foreground/20 absolute size-2 animate-ping rounded-full" />
        <span className="bg-foreground/65 size-1.5 rounded-full" />
      </span>
    );
  }
  return <Circle className="text-muted-foreground size-3.5 shrink-0" />;
}

function SessionStatusLabel({
  status,
  elapsedSeconds = 0,
}: {
  status: SessionStatus;
  elapsedSeconds?: number;
}) {
  const [ticks, setTicks] = React.useState(0);
  React.useEffect(() => {
    if (status !== "working" && status !== "monitoring") return;
    const timer = setInterval(() => setTicks((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [status]);
  if (status === "ready" || status === "settled") return null;
  return (
    <span className="text-muted-foreground ml-auto shrink-0 text-[10px] font-medium tabular-nums">
      {status === "working" ? "Working" : "Monitoring"}{" "}
      {formatElapsed(elapsedSeconds + ticks)}
    </span>
  );
}

function SessionRow({
  session,
  active,
  onPin,
  onSettle,
}: {
  session: CodingSession;
  active: boolean;
  onPin: () => void;
  onSettle: () => void;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={active}
        className="group/session-row h-[52px]"
      >
        <div data-ai-sidebar-row title={session.title}>
          <span className="flex size-4 shrink-0 items-center justify-center">
            <SessionStatusIcon status={session.status} />
          </span>

          <span className="min-w-0 flex-1">
            <span className="flex min-w-0 items-center gap-2">
              <span
                className={cn(
                  "min-w-0 flex-1 truncate text-sm leading-5 font-normal",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {session.title}
              </span>
              <SessionStatusLabel
                status={session.status}
                elapsedSeconds={session.elapsedSeconds}
              />
              {session.status === "ready" ? (
                <span className="text-muted-foreground shrink-0 text-[10px]">
                  43m
                </span>
              ) : null}
            </span>
            <span className="text-muted-foreground mt-0.5 flex min-w-0 items-center gap-1 text-xs leading-4">
              <GitBranch className="size-3 shrink-0" strokeWidth={1.8} />
              <span className="min-w-0 flex-1 truncate" title={session.branch}>
                {projectLabel(session.repository, session.branch)}
              </span>
              {session.pullRequest ? (
                <span className="text-muted-foreground flex shrink-0 items-center gap-0.5">
                  <GitPullRequest className="size-3" />#{session.pullRequest}
                </span>
              ) : null}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="-mr-1 size-5 opacity-0 group-hover/session-row:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
                    aria-label={`Actions for ${session.title}`}
                  >
                    <Ellipsis className="size-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuLabel className="truncate text-xs">
                    {session.title}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={onPin}>
                    <Pin /> {session.pinned ? "Unpin" : "Pin"}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy /> Copy branch
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={onSettle}>
                    <Archive /> Settle
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </span>
          </span>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function projectLabel(repository: string, branch: string) {
  const project = repository.split("/").at(-1) ?? repository;
  return `${project} · ${branch}`;
}

function SettledSessionRow({
  session,
  onUnsettle,
}: {
  session: CodingSession;
  onUnsettle: () => void;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild className="group/session-row h-[52px]">
        <div data-ai-sidebar-row title={session.title}>
          <span className="flex size-4 shrink-0 items-center justify-center">
            <Archive className="text-muted-foreground size-3.5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="text-muted-foreground block truncate text-sm leading-5 font-normal">
              {session.title}
            </span>
            <span className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs leading-4">
              <GitBranch className="size-3 shrink-0" strokeWidth={1.8} />
              <span className="min-w-0 flex-1 truncate">
                {projectLabel(session.repository, session.branch)}
              </span>
            </span>
          </span>
          <span className="shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-5 opacity-0 group-hover/session-row:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
                  aria-label={`Actions for ${session.title}`}
                >
                  <Ellipsis className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onSelect={onUnsettle}>
                  <Archive /> Unsettle
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy /> Copy branch
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </span>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AiCodingSessionsSidebar() {
  const [sessions, setSessions] = React.useState(initialSessions);
  const [query, setQuery] = React.useState("");
  const [project, setProject] = React.useState("All projects");
  const [settledOpen, setSettledOpen] = React.useState(false);

  const projects = [
    "All projects",
    "shadcnblocks/admin",
    "shadcnblocks/marketing",
  ];
  const visibleSessions = sessions.filter((session) => {
    const matchesProject =
      project === "All projects" || session.repository === project;
    const searchText =
      `${session.repository} ${session.title} ${session.branch}`.toLowerCase();
    return matchesProject && searchText.includes(query.toLowerCase());
  });
  const pinned = visibleSessions.filter(
    (session) => session.pinned && session.status !== "settled",
  );
  const active = visibleSessions.filter(
    (session) => !session.pinned && session.status !== "settled",
  );
  const settled = visibleSessions.filter(
    (session) => session.status === "settled",
  );

  function patchSession(id: string, patch: Partial<CodingSession>) {
    setSessions((current) =>
      current.map((session) =>
        session.id === id ? { ...session, ...patch } : session,
      ),
    );
  }

  function addDraft() {
    setSessions((current) => [
      {
        id: `draft-${Date.now()}`,
        repository: project === "All projects" ? "shadcnblocks/admin" : project,
        title: "Untitled coding session",
        branch: "main",
        provider: "Code",
        status: "ready",
        environment: "local",
      },
      ...current,
    ]);
  }

  return (
    <div className="flex h-full min-h-0 flex-col pb-2">
      <AiConversationSidebarSection label="Actions">
        <AiConversationSidebarItem
          icon={SquarePen}
          label="New session"
          onClick={addDraft}
        />
      </AiConversationSidebarSection>

      <div className="shrink-0">
        <div className="mt-px flex flex-col gap-px">
          <label className="bg-sidebar-accent/45 focus-within:bg-sidebar-accent mx-2 flex h-8 items-center rounded-lg px-2 transition-colors">
            <span className="flex size-4 shrink-0 items-center justify-center">
              <Search
                className="text-muted-foreground size-4"
                strokeWidth={1.8}
              />
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search sessions"
              aria-label="Search coding sessions"
              className="placeholder:text-muted-foreground ml-2 min-w-0 flex-1 bg-transparent text-sm font-normal outline-none"
            />
          </label>

          <div className="mx-2 flex h-8 items-center gap-px rounded-lg">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground focus-visible:bg-sidebar-accent data-[state=open]:bg-sidebar-accent h-8 min-w-0 flex-1 justify-start gap-0 rounded-lg px-2 text-sm font-normal focus-visible:ring-0"
                >
                  <span className="flex size-4 shrink-0 items-center justify-center">
                    <Folder className="size-4" strokeWidth={1.8} />
                  </span>
                  <span className="ml-2 min-w-0 flex-1 truncate text-left">
                    {project}
                  </span>
                  <ChevronDown className="text-muted-foreground size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-48 rounded-md p-1"
              >
                <DropdownMenuLabel className="text-muted-foreground px-2 py-1 text-[11px] font-medium">
                  Project scope
                </DropdownMenuLabel>
                {projects.map((item) => (
                  <DropdownMenuItem
                    key={item}
                    onSelect={() => setProject(item)}
                    className={cn(
                      "text-muted-foreground focus:text-foreground h-8 gap-2 rounded-md px-2 py-0 text-[12px] [&>svg]:size-3.5",
                      item === project && "bg-accent/60 text-foreground",
                    )}
                  >
                    {item === "All projects" ? <FolderOpen /> : <Folder />}
                    <span className="min-w-0 flex-1 truncate">{item}</span>
                    {item === project ? (
                      <Check className="text-muted-foreground ml-auto" />
                    ) : null}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="icon-sm"
              className="focus-visible:bg-sidebar-accent size-8 rounded-lg focus-visible:ring-0"
              aria-label="Add project"
            >
              <Plus className="size-4" strokeWidth={1.8} />
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea
        ref={bindVerticalScrollMask}
        className="mt-3 min-h-0 flex-1 [&>[data-slot=scroll-area-viewport]>div]:!block"
      >
        <div className="pb-4">
          {pinned.length ? (
            <AiConversationSidebarSection
              label="Pinned"
              action={
                <span className="text-muted-foreground mr-2 text-xs tabular-nums">
                  {pinned.length}
                </span>
              }
            >
              {pinned.map((session) => (
                <SessionRow
                  key={session.id}
                  session={session}
                  active={session.id === "billing-migration"}
                  onPin={() =>
                    patchSession(session.id, { pinned: !session.pinned })
                  }
                  onSettle={() =>
                    patchSession(session.id, { status: "settled" })
                  }
                />
              ))}
            </AiConversationSidebarSection>
          ) : null}

          {active.length ? (
            <AiConversationSidebarSection
              label="Sessions"
              action={
                <span className="text-muted-foreground mr-2 text-xs tabular-nums">
                  {active.length}
                </span>
              }
            >
              {active.map((session) => (
                <SessionRow
                  key={session.id}
                  session={session}
                  active={session.id === "billing-migration"}
                  onPin={() =>
                    patchSession(session.id, { pinned: !session.pinned })
                  }
                  onSettle={() =>
                    patchSession(session.id, { status: "settled" })
                  }
                />
              ))}
            </AiConversationSidebarSection>
          ) : null}

          {settled.length ? (
            <AiConversationSidebarSection
              label="Settled"
              action={
                <button
                  type="button"
                  aria-label={
                    settledOpen
                      ? "Collapse settled sessions"
                      : "Expand settled sessions"
                  }
                  aria-expanded={settledOpen}
                  onClick={() => setSettledOpen((open) => !open)}
                  className="hover:bg-sidebar-accent mr-1 flex h-7 items-center gap-1 rounded-md px-1.5 transition-colors"
                >
                  <span className="text-xs tabular-nums">{settled.length}</span>
                  {settledOpen ? (
                    <ChevronDown className="size-3.5" />
                  ) : (
                    <ChevronRight className="size-3.5" />
                  )}
                </button>
              }
            >
              {settledOpen ? (
                <>
                  {settled.map((session) => (
                    <SettledSessionRow
                      key={session.id}
                      session={session}
                      onUnsettle={() =>
                        patchSession(session.id, { status: "ready" })
                      }
                    />
                  ))}
                </>
              ) : null}
            </AiConversationSidebarSection>
          ) : null}

          {!visibleSessions.length ? (
            <div className="text-muted-foreground px-4 py-12 text-center text-xs">
              No sessions match this scope.
            </div>
          ) : null}
        </div>
      </ScrollArea>
    </div>
  );
}
