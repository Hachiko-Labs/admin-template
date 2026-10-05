"use client";

import { Menu, PanelLeft, Settings2 } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { AiConversationNavigation } from "@/components/ai-chat/ai-conversation-navigation";
import { aiTeams, AiTeamSwitcher } from "@/components/ai-chat/ai-team-switcher";
import type { AiWorkspaceShellProps } from "@/components/ai-chat/ai-workspace-shell";
import { ThemeSwitch } from "@/components/theme-switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

function ConversationSettings() {
  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/original/settings">
              <Settings2 aria-hidden="true" />
              <span>Workspace settings</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}

export function AiConversationShell({
  activePrimary,
  activeRecent,
  activeWorkflow,
  children,
  header,
  headerActions,
  headerCenter,
  headerTitle,
  hideSidebarFooter,
  sidebarContent,
  sidebarScrollMode = "content",
}: Omit<AiWorkspaceShellProps, "hideNavigationSidebar"> & {
  sidebarScrollMode?: "content" | "nested";
}) {
  const [secondaryOpen, setSecondaryOpen] = React.useState(true);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [teams, setTeams] = React.useState(aiTeams);
  const [team, setTeam] = React.useState(aiTeams[0].id);

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

  const workspaceHeader = (
    <div className="flex w-full min-w-0 items-center gap-1">
      <div className="min-w-0 flex-1">
        <AiTeamSwitcher
          teams={teams}
          value={team}
          onValueChange={setTeam}
          onAddTeam={(name) => {
            const newTeam = { id: crypto.randomUUID(), name };
            setTeams((current) => [...current, newTeam]);
            setTeam(newTeam.id);
          }}
        />
      </div>
      <ThemeSwitch triggerClassName="size-8 shrink-0 scale-100 rounded-lg" />
    </div>
  );
  const navigation = (
    <>
      <SidebarHeader className="flex h-[var(--ai-workspace-header-height,3.5rem)] shrink-0 justify-center">
        {workspaceHeader}
      </SidebarHeader>
      <SidebarContent
        className={cn(
          "min-h-0 gap-0 overscroll-y-contain pb-3",
          sidebarScrollMode === "nested" && "overflow-hidden",
        )}
      >
        {sidebarContent ?? (
          <AiConversationNavigation
            activePrimary={activePrimary}
            activeRecent={activeRecent}
            activeWorkflow={activeWorkflow}
          />
        )}
      </SidebarContent>
      {!hideSidebarFooter ? <ConversationSettings /> : null}
    </>
  );

  return (
    <div
      data-ai-conversation-shell
      className="bg-background flex h-svh w-full overflow-hidden font-sans tracking-[-0.15px]"
    >
      <a
        href="#ai-workspace-content"
        className="bg-background focus:ring-ring sr-only z-50 rounded-md px-3 py-2 text-sm focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:ring-2"
      >
        Skip to main content
      </a>
      <Sidebar
        id="ai-workspace-navigation"
        collapsible="none"
        aria-label="AI workspace navigation"
        className={cn(
          "hidden w-[234px] shrink-0 border-r",
          secondaryOpen && "md:flex",
        )}
      >
        {navigation}
      </Sidebar>
      <SidebarInset className="min-h-0 min-w-0 overflow-hidden">
        {header !== undefined ? (
          header
        ) : (
          <header className="grid h-12 shrink-0 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-1 px-3 shadow-[inset_0_-1px_0_var(--border)] md:h-[var(--ai-workspace-header-height,3.5rem)] md:gap-2">
            <div className="flex min-w-0 items-center gap-1 md:gap-2">
              <SidebarTrigger className="size-8 shrink-0 md:hidden" />
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0 md:hidden"
                    aria-label="Open workspace navigation"
                  >
                    <Menu aria-hidden="true" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="bg-sidebar text-sidebar-foreground flex w-60 flex-col gap-0 overscroll-contain p-0 sm:max-w-60 [&>[data-sidebar=header]]:pr-10 [&>button]:top-5 [&>button]:right-3 [&>button]:z-10"
                  onClick={(event) => {
                    const target = event.target;
                    if (target instanceof Element && target.closest("a[href]"))
                      setMobileOpen(false);
                  }}
                >
                  <SheetHeader className="sr-only">
                    <SheetTitle>Workspace navigation</SheetTitle>
                    <SheetDescription>
                      Browse conversation actions, workspaces, and history.
                    </SheetDescription>
                  </SheetHeader>
                  {navigation}
                </SheetContent>
              </Sheet>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="hidden size-7 shrink-0 md:inline-flex"
                aria-label="Toggle AI workspace navigation"
                aria-controls="ai-workspace-navigation"
                aria-expanded={secondaryOpen}
                onClick={() => setSecondaryOpen((open) => !open)}
              >
                <PanelLeft aria-hidden="true" />
              </Button>
              <Separator
                orientation="vertical"
                className="mr-2 hidden h-4 md:block"
              />
              <span className="truncate text-[13px] font-medium md:text-sm">
                {headerTitle}
              </span>
            </div>
            <div className="flex shrink-0 items-center justify-center gap-1">
              {headerCenter}
            </div>
            <div className="flex shrink-0 items-center gap-1 justify-self-end">
              {headerActions}
            </div>
          </header>
        )}
        <div id="ai-workspace-content" className="flex min-h-0 flex-1 flex-col">
          {children}
        </div>
      </SidebarInset>
    </div>
  );
}
