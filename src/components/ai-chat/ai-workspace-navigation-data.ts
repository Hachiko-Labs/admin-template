import {
  Blocks,
  FileStack,
  Folder,
  LayoutTemplate,
  SquarePen,
} from "lucide-react";

export const primaryItems = [
  { icon: SquarePen, label: "New chat", href: "/ai-chat/composer-1" },
  { icon: Blocks, label: "Skill library", href: "/ai-chat/skill-library" },
  {
    icon: LayoutTemplate,
    label: "Agent workspace",
    href: "/ai-chat/agent-detail",
  },
];

export const workspaces = [
  { icon: Folder, label: "AI admin screens", href: "/ai-chat/composer-1" },
  {
    icon: FileStack,
    label: "Commerce workspace",
    href: "/ai-chat/embedded-commerce-copilot",
  },
];

export const recentChats = [
  {
    label: "Map agent approval states",
    href: "/ai-chat/conversation-1",
  },
  {
    label: "Review product table density",
    href: "/ai-chat/conversation-2",
  },
  {
    label: "Choose campaign direction",
    href: "/ai-chat/conversation-3",
  },
  {
    label: "Summarize weekly kickoff",
    href: "/ai-chat/conversation-4",
  },
  {
    label: "Build revenue overview",
    href: "/ai-chat/conversation-5",
  },
  {
    label: "Preview marketing page",
    href: "/ai-chat/conversation-7",
  },
  {
    label: "Synthesize recording",
    href: "/ai-chat/conversation-8",
  },
  {
    label: "Plan billing webhook migration",
    href: "/ai-chat/conversation-9",
  },
  {
    label: "Research bulk action feedback",
    href: "/ai-chat/conversation-10",
  },
  {
    label: "Generate admin bulk actions",
    href: "/ai-chat/conversation-11",
  },
  {
    label: "Verify generated bulk actions",
    href: "/ai-chat/conversation-12",
  },
  {
    label: "Queue product review follow-ups",
    href: "/ai-chat/conversation-13",
  },
  {
    label: "Review and commit verified changes",
    href: "/ai-chat/conversation-14",
  },
  {
    label: "Triage support backlog",
    href: "/ai-chat/conversation-15",
  },
  {
    label: "Compare response versions",
    href: "/ai-chat/conversation-16",
  },
  {
    label: "Review release blockers",
    href: "/ai-chat/conversation-17",
  },
  {
    label: "Review component ownership",
    href: "/ai-chat/conversation-18",
  },
  {
    label: "Recover billing retry session",
    href: "/ai-chat/conversation-19",
  },
  {
    label: "Compact checkout migration context",
    href: "/ai-chat/conversation-20",
  },
];

export const workflows = [
  { label: "Design release workflow", href: "/ai-chat/workflow-1" },
  { label: "Observe live agent run", href: "/ai-chat/workflow-2" },
  { label: "Review multi-agent handoff", href: "/ai-chat/workflow-3" },
];
