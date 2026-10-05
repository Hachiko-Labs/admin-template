"use client";

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
} from "@/components/ui/sidebar";
import { sidebarData } from "@/data/sidebar-data";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <div className="relative">
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader className="relative h-14 shrink-0 px-2 py-1 transition-[height] duration-200 ease-linear group-data-[collapsible=icon]:h-24 group-data-[collapsible=icon]:py-2">
          <SidebarBrand className="pl-0.5" />
          <SidebarTrigger className="absolute top-3 right-2 size-8 shrink-0 transition-[top] duration-200 ease-linear group-data-[collapsible=icon]:top-14" />
        </SidebarHeader>
        <SidebarContent>
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
