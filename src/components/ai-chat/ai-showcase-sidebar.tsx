"use client";

import { usePathname } from "next/navigation";
import * as React from "react";

import { NavGroup } from "@/components/layout/nav-group";
import { NavUser } from "@/components/layout/nav-user";
import { SidebarBrand } from "@/components/layout/sidebar-brand";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { sidebarData } from "@/data/sidebar-data";
import { getScrollMask } from "@/lib/scroll-mask";

export function AiShowcaseSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const [scrollElement, setScrollElement] =
    React.useState<HTMLDivElement | null>(null);
  const [scrollMask, setScrollMask] = React.useState("none");
  const { state } = useSidebar();
  // Composer 6 keeps its original inset layout, designed around a 64px brand header.
  const isComposer6 = usePathname() === "/ai-chat/composer-6";

  React.useEffect(() => {
    if (!scrollElement) return;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;
    setScrollMask("none");
    let currentMask: ReturnType<typeof getScrollMask> = "none";
    const updateMask = (next: typeof currentMask) => {
      if (next === currentMask) return;
      currentMask = next;
      setScrollMask(next);
    };
    const stop = () => {
      clearTimeout(idleTimer);
      updateMask("none");
    };
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        updateMask(
          getScrollMask(
            scrollElement.scrollTop,
            Math.max(
              0,
              scrollElement.scrollHeight - scrollElement.clientHeight,
            ),
          ),
        );
        clearTimeout(idleTimer);
        idleTimer = setTimeout(stop, 180);
      });
    };
    scrollElement.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(idleTimer);
      cancelAnimationFrame(frame);
      scrollElement.removeEventListener("scroll", onScroll);
    };
  }, [scrollElement, state]);

  return (
    <div className="relative" data-ai-showcase-sidebar>
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader
          style={
            isComposer6
              ? ({
                  "--ai-workspace-header-height": "4rem",
                } as React.CSSProperties)
              : undefined
          }
          className="relative h-[var(--ai-workspace-header-height,3.5rem)] shrink-0 px-2 py-[calc((var(--ai-workspace-header-height,3.5rem)_-_3rem)/2)] transition-[height] duration-200 ease-linear group-data-[collapsible=icon]:h-24 group-data-[collapsible=icon]:py-2"
        >
          <SidebarBrand className={isComposer6 ? undefined : "pl-0.5"} />
          <SidebarTrigger className="absolute top-[calc((var(--ai-workspace-header-height,3.5rem)_-_2rem)/2)] right-2 size-8 shrink-0 transition-[top] duration-200 ease-linear group-data-[collapsible=icon]:top-14" />
        </SidebarHeader>
        <SidebarContent
          ref={setScrollElement}
          style={{ maskImage: scrollMask, WebkitMaskImage: scrollMask }}
        >
          {sidebarData.navGroups.map((props) => (
            <NavGroup key={props.title} {...props} />
          ))}
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={sidebarData.user} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </div>
  );
}
