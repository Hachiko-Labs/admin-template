"use client";

import { GitBranch, Menu, Search, Settings2, X } from "lucide-react";
import * as React from "react";

import {
  AiNavigationSidebar,
  AiSidebarFooterAction,
  AiSidebarGlideGroup,
  AiSidebarRow,
  AiSidebarSectionHeader,
} from "@/components/ai-chat/ai-navigation-sidebar";
import {
  primaryItems,
  recentChats,
  workflows,
  workspaces,
} from "@/components/ai-chat/ai-workspace-navigation-data";
import { ThemeSwitch } from "@/components/theme-switch";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  SidebarContent,
  SidebarGroupLabel,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export interface AiWorkspaceShellProps {
  activePrimary?: string;
  activeRecent?: string;
  activeWorkflow?: string;
  children: React.ReactNode;
  header?: React.ReactNode;
  headerActions?: React.ReactNode;
  headerCenter?: React.ReactNode;
  headerTitle: string;
  headerIcon?: React.ReactNode;
  hideNavigationSidebar?: boolean;
  hideSidebarFooter?: boolean;
  sidebarContent?: React.ReactNode;
}

function WorkspaceSidebar({
  activePrimary,
  activeRecent,
  activeWorkflow,
}: Pick<
  AiWorkspaceShellProps,
  "activePrimary" | "activeRecent" | "activeWorkflow"
>) {
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const visibleRecents = recentChats.filter((chat) =>
    chat.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <>
      <div className="shrink-0 px-2 pt-2">
        <SidebarGroupLabel>Actions</SidebarGroupLabel>
      </div>
      <AiSidebarGlideGroup>
        {primaryItems.map((item) => (
          <AiSidebarRow
            key={item.label}
            active={activePrimary === item.label}
            href={item.href}
            icon={item.icon}
            label={item.label}
          />
        ))}
      </AiSidebarGlideGroup>

      <div className="mt-3">
        <AiSidebarSectionHeader>Workspaces</AiSidebarSectionHeader>
        <AiSidebarGlideGroup>
          {workspaces.map((item) => (
            <AiSidebarRow
              key={item.label}
              href={item.href}
              icon={item.icon}
              label={item.label}
            />
          ))}
        </AiSidebarGlideGroup>
      </div>

      <div className="mt-3">
        <div className="ai-sidebar-copy relative mx-2 mb-1 h-8">
          <div
            aria-hidden={searchOpen}
            className={cn(
              "text-muted-foreground absolute inset-0 flex items-center px-2 text-[12.5px] font-medium transition-[opacity,transform] duration-180",
              searchOpen
                ? "pointer-events-none -translate-x-1 opacity-0"
                : "translate-x-0 opacity-100",
            )}
          >
            <span>Chats</span>
          </div>
          <button
            type="button"
            aria-label="Search chats"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen(true)}
            className={cn(
              "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground absolute top-0 right-0 flex size-8 items-center justify-center rounded-lg transition-[opacity,background-color,color,transform] duration-180 active:scale-[0.96]",
              searchOpen ? "pointer-events-none opacity-0" : "opacity-100",
            )}
          >
            <Search className="size-4" strokeWidth={1.8} />
          </button>
          <div
            className={cn(
              "bg-sidebar-accent text-muted-foreground focus-within:text-foreground absolute top-0 right-0 flex h-8 items-center overflow-hidden rounded-lg shadow-[0_0_0_1px_var(--sidebar-border)] transition-[width,opacity] duration-180",
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
              placeholder="Search chats"
              aria-label="Search chat history"
              className="placeholder:text-muted-foreground ml-1.5 min-w-0 flex-1 bg-transparent text-[13px] font-medium outline-none"
            />
            <button
              type="button"
              aria-label="Close chat search"
              onClick={() => {
                setSearchOpen(false);
                setQuery("");
              }}
              className="hover:bg-border flex size-8 shrink-0 items-center justify-center rounded-lg transition-[background-color,color,transform] duration-150 active:scale-[0.96]"
            >
              <X className="size-4" strokeWidth={1.8} />
            </button>
          </div>
        </div>
        <AiSidebarGlideGroup>
          {visibleRecents.map((chat) => (
            <AiSidebarRow
              key={chat.label}
              active={activeRecent === chat.label}
              href={chat.href}
              label={chat.label}
              textOnly
            />
          ))}
        </AiSidebarGlideGroup>
      </div>

      <div className="mt-3">
        <AiSidebarSectionHeader>Workflows</AiSidebarSectionHeader>
        <AiSidebarGlideGroup>
          {workflows.map((workflow) => (
            <AiSidebarRow
              key={workflow.label}
              active={activeWorkflow === workflow.label}
              href={workflow.href}
              icon={GitBranch}
              label={workflow.label}
            />
          ))}
        </AiSidebarGlideGroup>
      </div>
    </>
  );
}

function WorkspaceNavigation({
  activePrimary,
  activeRecent,
  activeWorkflow,
  hideSidebarFooter,
  sidebarContent,
}: Pick<
  AiWorkspaceShellProps,
  | "activePrimary"
  | "activeRecent"
  | "activeWorkflow"
  | "hideSidebarFooter"
  | "sidebarContent"
>) {
  return (
    <>
      <SidebarContent
        className={cn("gap-0 px-0 pb-3", sidebarContent && "overflow-hidden")}
      >
        {sidebarContent ?? (
          <WorkspaceSidebar
            activePrimary={activePrimary}
            activeRecent={activeRecent}
            activeWorkflow={activeWorkflow}
          />
        )}
      </SidebarContent>

      {!hideSidebarFooter ? (
        <AiSidebarFooterAction
          href="/original/settings"
          icon={Settings2}
          label="Workspace settings"
        />
      ) : null}
    </>
  );
}

function MobileProductNavigation({
  activePrimary,
  activeRecent,
  activeWorkflow,
  hideSidebarFooter,
  sidebarContent,
}: Pick<
  AiWorkspaceShellProps,
  | "activePrimary"
  | "activeRecent"
  | "activeWorkflow"
  | "hideSidebarFooter"
  | "sidebarContent"
>) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Open product navigation"
        >
          <Menu aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="bg-sidebar text-sidebar-foreground flex w-56 flex-col gap-0 p-0 sm:max-w-56"
        onClick={(event) => {
          if (
            !(
              event.target instanceof HTMLElement ||
              event.target instanceof SVGElement
            )
          )
            return;
          if (event.target.closest("a")) setOpen(false);
        }}
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Product navigation</SheetTitle>
          <SheetDescription>Browse AI product screens.</SheetDescription>
        </SheetHeader>
        <div className="flex h-12 shrink-0 items-center border-b px-2">
          <span className="px-2 text-[13px] font-medium">Shadcnblocks AI</span>
        </div>
        <WorkspaceNavigation
          activePrimary={activePrimary}
          activeRecent={activeRecent}
          activeWorkflow={activeWorkflow}
          hideSidebarFooter={hideSidebarFooter}
          sidebarContent={sidebarContent}
        />
      </SheetContent>
    </Sheet>
  );
}

export function AiWorkspaceShell({
  activePrimary,
  activeRecent,
  activeWorkflow,
  children,
  header,
  headerActions,
  headerCenter,
  headerTitle,
  headerIcon,
  hideNavigationSidebar = false,
  hideSidebarFooter,
  sidebarContent,
}: AiWorkspaceShellProps) {
  return (
    <>
      <main className="bg-background flex h-svh w-full overflow-hidden font-sans tracking-[-0.15px]">
        <a
          href="#ai-workspace-content"
          className="bg-background focus:ring-ring sr-only z-50 rounded-md px-3 py-2 text-sm focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:ring-2"
        >
          Skip to main content
        </a>
        {!hideNavigationSidebar ? (
          <AiNavigationSidebar className="hidden md:flex">
            <WorkspaceNavigation
              activePrimary={activePrimary}
              activeRecent={activeRecent}
              activeWorkflow={activeWorkflow}
              hideSidebarFooter={hideSidebarFooter}
              sidebarContent={sidebarContent}
            />
          </AiNavigationSidebar>
        ) : null}

        <section className="flex min-w-0 flex-1 flex-col">
          {header !== undefined ? (
            header
          ) : (
            <header
              className={cn(
                "grid h-12 shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center px-3 shadow-[inset_0_-1px_0_var(--border)] md:h-[var(--ai-workspace-header-height,3.5rem)]",
                !headerIcon && "md:px-4",
              )}
            >
              {hideNavigationSidebar ? (
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <SidebarTrigger className="size-8 shrink-0 md:hidden" />
                  {headerIcon}
                  <span
                    className={cn(
                      "truncate font-medium",
                      headerIcon ? "text-sm" : "text-[13px]",
                    )}
                  >
                    {headerTitle}
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex min-w-0 flex-1 items-center gap-1 md:hidden">
                    <SidebarTrigger className="size-8 shrink-0" />
                    <MobileProductNavigation
                      activePrimary={activePrimary}
                      activeRecent={activeRecent}
                      activeWorkflow={activeWorkflow}
                      hideSidebarFooter={hideSidebarFooter}
                      sidebarContent={sidebarContent}
                    />
                    {headerIcon}
                    <span className="truncate px-1 text-[13px] font-medium">
                      {headerTitle}
                    </span>
                  </div>
                  <div className="hidden min-w-0 items-center gap-2 md:flex">
                    {headerIcon}
                    <span
                      className={cn(
                        "truncate font-medium",
                        headerIcon ? "text-sm" : "text-[13px]",
                      )}
                    >
                      {headerTitle}
                    </span>
                  </div>
                </>
              )}
              <div className="flex shrink-0 items-center justify-center gap-1">
                {headerCenter}
              </div>
              <div className="flex max-w-full min-w-0 items-center gap-1 justify-self-end">
                <div className="flex min-w-0 items-center gap-1 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&>*]:shrink-0">
                  {headerActions}
                </div>
                <ThemeSwitch triggerClassName="size-8 shrink-0 scale-100 rounded-lg" />
              </div>
            </header>
          )}

          <div
            id="ai-workspace-content"
            className="flex min-h-0 flex-1 flex-col"
          >
            {children}
          </div>
        </section>
      </main>
    </>
  );
}
