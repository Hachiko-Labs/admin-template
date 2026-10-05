"use client";

import { MessagesSquare, PanelLeftClose } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { GlideMenu } from "@/components/ai-chat/glide-menu";
import { cn } from "@/lib/utils";

const SIDEBAR_MOTION = {
  collapsedWidth: 52,
  copyDuration: 180,
  copyOffset: 8,
  duration: 280,
  easing: "cubic-bezier(0.16, 1, 0.3, 1)",
  expandedWidth: 234,
};

const AiSidebarContext = React.createContext({ collapsed: false });

interface AiNavigationSidebarProps extends React.ComponentProps<"aside"> {
  children: React.ReactNode;
}

export function AiNavigationSidebar({
  children,
  className,
  ...props
}: AiNavigationSidebarProps) {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <aside
      data-ai-navigation-sidebar
      data-collapsed={collapsed}
      aria-label="Workspace navigation"
      className={cn(
        "bg-sidebar text-sidebar-foreground relative h-full shrink-0 overflow-hidden border-r [font-feature-settings:'cv11','ss01'] text-[14px] leading-[1.5] transition-[width]",
        className,
      )}
      style={
        // SAFETY: these locally declared CSS custom properties contain CSS strings or numbers.
        {
          width: collapsed
            ? SIDEBAR_MOTION.collapsedWidth
            : SIDEBAR_MOTION.expandedWidth,
          transitionDuration: `${SIDEBAR_MOTION.duration}ms`,
          transitionTimingFunction: SIDEBAR_MOTION.easing,
          "--ai-sidebar-copy-duration": `${SIDEBAR_MOTION.copyDuration}ms`,
          "--ai-sidebar-copy-offset": `${SIDEBAR_MOTION.copyOffset}px`,
          "--ai-sidebar-easing": SIDEBAR_MOTION.easing,
        } as React.CSSProperties
      }
      {...props}
    >
      <div className="flex min-h-0 w-[234px] shrink-0 flex-col">
        <header className="relative h-[var(--ai-workspace-header-height,3.5rem)] shrink-0">
          <div className="ai-sidebar-workspace absolute top-[calc((var(--ai-workspace-header-height,3.5rem)_-_2rem)/2)] left-2 flex h-8 w-[174px] items-center gap-2 px-2">
            <MessagesSquare
              className="text-muted-foreground size-[18px] shrink-0"
              strokeWidth={1.8}
              aria-hidden="true"
            />
            <span className="truncate text-[13px] font-semibold">
              AI workspace
            </span>
          </div>

          <button
            type="button"
            aria-label="Collapse sidebar"
            aria-hidden={collapsed}
            inert={collapsed}
            tabIndex={collapsed ? -1 : 0}
            onClick={() => setCollapsed(true)}
            className="ai-sidebar-collapse text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-[calc((var(--ai-workspace-header-height,3.5rem)_-_2rem)/2)] right-2 flex size-8 items-center justify-center rounded-lg transition-[opacity,background-color,color] duration-150"
          >
            <PanelLeftClose className="size-[18px]" strokeWidth={1.8} />
          </button>

          <button
            type="button"
            aria-label="Expand sidebar"
            aria-hidden={!collapsed}
            tabIndex={collapsed ? 0 : -1}
            onClick={() => setCollapsed(false)}
            className="ai-sidebar-expand text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-[calc((var(--ai-workspace-header-height,3.5rem)_-_2.25rem)/2)] left-2 flex size-9 items-center justify-center rounded-lg transition-[opacity,background-color,color] duration-150"
          >
            <PanelLeftClose
              className="size-[18px] rotate-180"
              strokeWidth={1.8}
            />
          </button>
        </header>

        <AiSidebarContext.Provider value={{ collapsed }}>
          {children}
        </AiSidebarContext.Provider>
      </div>
    </aside>
  );
}

export function AiSidebarExpandedOnly({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { collapsed } = React.useContext(AiSidebarContext);

  return (
    <div
      aria-hidden={collapsed}
      inert={collapsed}
      className={cn(
        "grid transition-[grid-template-rows,opacity,transform] duration-180",
        collapsed
          ? "pointer-events-none -translate-x-2 grid-rows-[0fr] opacity-0"
          : "translate-x-0 grid-rows-[1fr] opacity-100",
        className,
      )}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

export function AiSidebarGlideGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <GlideMenu
      rowSelector="[data-ai-sidebar-row]"
      highlightClassName="ai-sidebar-glide-highlight rounded-[7px] bg-sidebar-accent"
      className={cn("group/ai-sidebar-glide flex flex-col gap-px", className)}
    >
      {children}
    </GlideMenu>
  );
}

interface AiSidebarRowProps {
  active?: boolean;
  className?: string;
  count?: string;
  href?: string;
  icon?: React.ElementType;
  label: string;
  onClick?: () => void;
  textOnly?: boolean;
}

export function AiSidebarRow({
  active = false,
  className,
  count,
  href,
  icon: Icon,
  label,
  onClick,
  textOnly = false,
}: AiSidebarRowProps) {
  const rowClassName = cn(
    "ai-sidebar-row relative z-10 mx-2 flex h-8 items-center rounded-lg px-2 text-left transition-[width,background-color,color,transform] duration-150 active:scale-[0.98]",
    active && "bg-sidebar-accent group-hover/ai-sidebar-glide:bg-transparent",
    textOnly && "ai-sidebar-text-row",
    className,
  );
  const content = (
    <>
      {Icon ? (
        <span
          className={cn(
            "flex size-5 shrink-0 items-center justify-center",
            active ? "text-foreground" : "text-muted-foreground",
          )}
        >
          <Icon className="size-[18px]" strokeWidth={1.8} aria-hidden="true" />
        </span>
      ) : null}
      <span
        className={cn(
          "ai-sidebar-copy min-w-0 flex-1 truncate text-[14px] leading-[1.5] font-medium",
          Icon && "ml-1.5",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
      </span>
      {count ? (
        <span className="ai-sidebar-copy text-muted-foreground mr-2 shrink-0 text-xs font-medium tabular-nums">
          {count}
        </span>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link
        data-ai-sidebar-row
        href={href}
        title={label}
        className={rowClassName}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      data-ai-sidebar-row
      type="button"
      title={label}
      onClick={onClick}
      className={rowClassName}
    >
      {content}
    </button>
  );
}

export function AiSidebarSectionHeader({
  action,
  children,
  className,
}: {
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "ai-sidebar-copy text-muted-foreground relative mx-2 mb-1 flex h-8 items-center gap-1.5 px-2 text-[12.5px] font-medium",
        className,
      )}
    >
      <span>{children}</span>
      {action ? <div className="ml-auto">{action}</div> : null}
    </div>
  );
}

export function AiSidebarFooterAction({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon?: React.ElementType;
  label: string;
}) {
  return (
    <div className="ai-sidebar-copy mx-2 mt-3 border-t pt-3">
      <Link
        href={href}
        className="bg-sidebar-accent hover:bg-border flex h-8 w-full items-center justify-center gap-1.5 rounded-lg text-[12.5px] font-medium transition-[background-color,transform] duration-150 active:scale-[0.98]"
      >
        {Icon ? <Icon className="size-4" strokeWidth={1.8} /> : null}
        {label}
      </Link>
    </div>
  );
}
