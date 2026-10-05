"use client";

import type { ReactNode } from "react";

import { AiConversationShell } from "@/components/ai-chat/ai-conversation-shell";
import { AiWorkspaceShell } from "@/components/ai-chat/ai-workspace-shell";
import { Badge } from "@/components/ui/badge";

const titles: Record<string, string> = {
  builder: "Agent builder",
  integrations: "Integrations",
  skills: "Skills workspace",
};

export function StudioShell({
  active,
  children,
  actions,
  sidebarContent,
}: {
  active: string;
  children: ReactNode;
  actions?: ReactNode;
  sidebarContent?: ReactNode;
}) {
  if (sidebarContent)
    return (
      <AiConversationShell
        headerTitle={titles[active]}
        sidebarContent={sidebarContent}
        hideSidebarFooter
        headerActions={actions}
      >
        {children}
      </AiConversationShell>
    );
  return (
    <AiWorkspaceShell
      hideNavigationSidebar
      headerTitle={titles[active] ?? "Agent Studio"}
      headerActions={
        <>
          {actions}
          <Badge variant="outline" className="text-[10px] font-normal">
            Demo workspace
          </Badge>
        </>
      }
    >
      {children}
    </AiWorkspaceShell>
  );
}
