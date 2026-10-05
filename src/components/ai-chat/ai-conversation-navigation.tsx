"use client";

import { GitBranch } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { AiSidebarSectionSearch } from "@/components/ai-chat/ai-sidebar-section-search";
import {
  primaryItems,
  recentChats,
  workflows,
  workspaces,
} from "@/components/ai-chat/ai-workspace-navigation-data";
import { GlideMenu } from "@/components/ai-chat/glide-menu";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function AiConversationSidebarMenu({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <GlideMenu
      rowSelector='[data-sidebar="menu-button"]'
      className="group/conversation-sidebar-glide relative"
      highlightClassName="bg-sidebar-accent inset-x-0 rounded-md"
    >
      <SidebarMenu
        className={cn(
          "relative [&_[data-active=true]]:group-hover/conversation-sidebar-glide:bg-transparent [&_[data-sidebar=menu-button]]:hover:bg-transparent",
          className,
        )}
      >
        {children}
      </SidebarMenu>
    </GlideMenu>
  );
}

export function AiConversationSidebarSection({
  label,
  action,
  children,
  className,
}: {
  label: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <SidebarGroup className={cn("shrink-0", className)}>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      {action ? (
        <div className="absolute top-2 right-2 flex h-8 items-center">
          {action}
        </div>
      ) : null}
      <SidebarGroupContent>
        <AiConversationSidebarMenu>{children}</AiConversationSidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AiConversationSidebarItem({
  active = false,
  count,
  href,
  icon: Icon,
  iconClassName,
  label,
  onClick,
}: {
  active?: boolean;
  count?: string;
  href?: string;
  icon?: React.ElementType;
  iconClassName?: string;
  label: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      {Icon ? <Icon className={iconClassName} aria-hidden="true" /> : null}
      <span>{label}</span>
    </>
  );
  return (
    <SidebarMenuItem>
      {href ? (
        <SidebarMenuButton asChild data-ai-sidebar-row isActive={active}>
          <Link href={href} aria-current={active ? "page" : undefined}>
            {content}
          </Link>
        </SidebarMenuButton>
      ) : (
        <SidebarMenuButton
          type="button"
          data-ai-sidebar-row
          isActive={active}
          onClick={onClick}
          title={label}
        >
          {content}
        </SidebarMenuButton>
      )}
      {count ? (
        <SidebarMenuBadge className="text-muted-foreground tabular-nums">
          {count}
        </SidebarMenuBadge>
      ) : null}
    </SidebarMenuItem>
  );
}

export function AiConversationNavigation({
  activePrimary,
  activeRecent,
  activeWorkflow,
}: {
  activePrimary?: string;
  activeRecent?: string;
  activeWorkflow?: string;
}) {
  const [query, setQuery] = React.useState("");
  const visibleChats = recentChats.filter((chat) =>
    chat.label.toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <>
      <AiConversationSidebarSection label="Actions">
        {primaryItems.map((item) => (
          <AiConversationSidebarItem
            key={item.label}
            {...item}
            active={item.label === activePrimary}
          />
        ))}
      </AiConversationSidebarSection>
      <AiConversationSidebarSection label="Workspaces">
        {workspaces.map((item) => (
          <AiConversationSidebarItem key={item.label} {...item} />
        ))}
      </AiConversationSidebarSection>
      <SidebarGroup className="shrink-0">
        <AiSidebarSectionSearch
          label="Chats"
          searchLabel="Search chats"
          closeLabel="Close chat search"
          query={query}
          onQueryChange={setQuery}
        />
        <SidebarGroupContent>
          <AiConversationSidebarMenu>
            {visibleChats.map((chat) => (
              <AiConversationSidebarItem
                key={chat.label}
                {...chat}
                active={chat.label === activeRecent}
              />
            ))}
          </AiConversationSidebarMenu>
          {visibleChats.length === 0 ? (
            <p
              role="status"
              className="text-muted-foreground px-2 py-3 text-xs"
            >
              No chats found.
            </p>
          ) : null}
        </SidebarGroupContent>
      </SidebarGroup>
      <AiConversationSidebarSection label="Workflows">
        {workflows.map((workflow) => (
          <AiConversationSidebarItem
            key={workflow.label}
            {...workflow}
            icon={GitBranch}
            active={workflow.label === activeWorkflow}
          />
        ))}
      </AiConversationSidebarSection>
    </>
  );
}
