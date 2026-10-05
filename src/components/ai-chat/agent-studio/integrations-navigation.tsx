"use client";

import {
  Activity,
  BookOpen,
  Code2,
  Cpu,
  Headphones,
  LayoutGrid,
  ListTodo,
  MessagesSquare,
  Palette,
  Plug,
} from "lucide-react";

import {
  AiConversationSidebarItem,
  AiConversationSidebarMenu,
  AiConversationSidebarSection,
} from "@/components/ai-chat/ai-conversation-navigation";
import { AiSidebarSectionSearch } from "@/components/ai-chat/ai-sidebar-section-search";
import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";

import { categories, connectors } from "./studio-data";

const categoryIcons = [
  Cpu,
  Code2,
  Palette,
  BookOpen,
  ListTodo,
  MessagesSquare,
  Headphones,
  Activity,
];
export function IntegrationsNavigation({
  category = "All",
  query = "",
  connectedCount = 6,
  onCategoryChange = () => {},
  onQueryChange = () => {},
}: {
  category?: string;
  query?: string;
  connectedCount?: number;
  onCategoryChange?: (value: string) => void;
  onQueryChange?: (value: string) => void;
}) {
  return (
    <>
      <SidebarGroup className="shrink-0">
        <AiSidebarSectionSearch
          label="Connections"
          searchLabel="Search integrations"
          closeLabel="Close integration search"
          query={query}
          onQueryChange={onQueryChange}
        />
        <SidebarGroupContent>
          <AiConversationSidebarMenu>
            <AiConversationSidebarItem
              label="All connections"
              icon={LayoutGrid}
              active={category === "All"}
              count={String(connectors.length)}
              onClick={() => onCategoryChange("All")}
            />
            <AiConversationSidebarItem
              label="Connected"
              icon={Plug}
              active={category === "Connected"}
              count={String(connectedCount)}
              onClick={() => onCategoryChange("Connected")}
            />
          </AiConversationSidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <AiConversationSidebarSection label="Categories">
        {categories.slice(2).map((name, index) => (
          <AiConversationSidebarItem
            key={name}
            label={name}
            icon={categoryIcons[index]}
            active={category === name}
            onClick={() => onCategoryChange(name)}
          />
        ))}
      </AiConversationSidebarSection>
    </>
  );
}
