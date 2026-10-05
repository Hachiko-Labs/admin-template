"use client";

import { Folder, Menu, MessageSquare } from "lucide-react";
import * as React from "react";

import {
  AiSidebarGlideGroup,
  AiSidebarRow,
  AiSidebarSectionHeader,
} from "@/components/ai-chat/ai-navigation-sidebar";
import { GlideMenu } from "@/components/ai-chat/glide-menu";
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
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface ComposerNavigationItem {
  active?: boolean;
  icon: React.ElementType;
  label: string;
}

interface AiComposerNavigationProps {
  navigationItems: ComposerNavigationItem[];
  recentSessions: string[];
  workspaces: string[];
}

export function AiComposerMobileHeader({
  children,
  workspaceName = "AI workspace",
  workspaceSwitcher,
}: {
  children: React.ReactNode;
  workspaceName?: string;
  workspaceSwitcher?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="bg-background fixed inset-x-0 top-0 z-20 flex h-12 items-center gap-1 border-b px-3 md:hidden">
      <SidebarTrigger className="size-8 shrink-0" />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Open workspace navigation"
          >
            <Menu aria-hidden="true" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="bg-sidebar text-sidebar-foreground flex w-60 flex-col gap-0 overscroll-contain p-0 sm:max-w-60 [&>button]:top-5 [&>button]:right-3 [&>button]:z-10"
          onClick={(event) => {
            if (
              !(
                event.target instanceof HTMLElement ||
                event.target instanceof SVGElement
              )
            )
              return;
            if (event.target.closest("[data-ai-sidebar-row]")) {
              setOpen(false);
            }
          }}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Workspace navigation</SheetTitle>
            <SheetDescription>
              Browse workspace actions, workspaces, and recent chats.
            </SheetDescription>
          </SheetHeader>
          {workspaceSwitcher ? (
            <div className="flex h-[var(--ai-workspace-header-height,3.5rem)] shrink-0 items-center p-2 pr-10">
              {workspaceSwitcher}
            </div>
          ) : (
            <div className="flex h-12 shrink-0 items-center border-b px-4">
              <span className="text-[13px] font-semibold">{workspaceName}</span>
            </div>
          )}
          <SidebarContent className="gap-0 px-0 pb-3">
            {children}
          </SidebarContent>
        </SheetContent>
      </Sheet>
      <span className="truncate px-1 text-[13px] font-medium">
        {workspaceName}
      </span>
    </div>
  );
}

export function AiComposerNavigation({
  navigationItems,
  recentSessions,
  workspaces,
}: AiComposerNavigationProps) {
  return (
    <>
      <AiSidebarGlideGroup className="pt-1.5">
        {navigationItems.map((item) => (
          <AiSidebarRow
            key={item.label}
            active={item.active}
            icon={item.icon}
            label={item.label}
          />
        ))}
      </AiSidebarGlideGroup>

      <div className="mt-3">
        <AiSidebarSectionHeader>Workspaces</AiSidebarSectionHeader>
        <AiSidebarGlideGroup>
          {workspaces.map((workspace) => (
            <AiSidebarRow key={workspace} icon={Folder} label={workspace} />
          ))}
        </AiSidebarGlideGroup>
      </div>

      <div className="mt-3">
        <AiSidebarSectionHeader>Chats</AiSidebarSectionHeader>
        <AiSidebarGlideGroup>
          {recentSessions.map((session) => (
            <AiSidebarRow key={session} label={session} textOnly />
          ))}
        </AiSidebarGlideGroup>
      </div>
    </>
  );
}

function SecondarySidebarGlideMenu({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GlideMenu
      rowSelector='[data-sidebar="menu-button"]'
      className="group/secondary-sidebar-glide"
      highlightClassName="bg-sidebar-accent inset-x-0 rounded-md"
    >
      <SidebarMenu className="relative [&_[data-active=true]]:group-hover/secondary-sidebar-glide:bg-transparent [&_[data-sidebar=menu-button]]:hover:bg-transparent">
        {children}
      </SidebarMenu>
    </GlideMenu>
  );
}

export function AiComposerSecondaryNavigation({
  navigationItems,
  recentSessions,
  workspaces,
}: AiComposerNavigationProps) {
  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Actions</SidebarGroupLabel>
        <SecondarySidebarGlideMenu>
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                type="button"
                isActive={item.active}
                tooltip={item.label}
                aria-current={item.active ? "page" : undefined}
              >
                <item.icon aria-hidden="true" />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SecondarySidebarGlideMenu>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Workspaces</SidebarGroupLabel>
        <SecondarySidebarGlideMenu>
          {workspaces.map((workspace) => (
            <SidebarMenuItem key={workspace}>
              <SidebarMenuButton type="button" tooltip={workspace}>
                <Folder aria-hidden="true" />
                <span>{workspace}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SecondarySidebarGlideMenu>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Chats</SidebarGroupLabel>
        <SecondarySidebarGlideMenu>
          {recentSessions.map((session) => (
            <SidebarMenuItem key={session}>
              <SidebarMenuButton type="button" tooltip={session}>
                <MessageSquare aria-hidden="true" />
                <span>{session}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SecondarySidebarGlideMenu>
      </SidebarGroup>
    </>
  );
}
