import { FcGoogle } from "react-icons/fc";
import {
  SiAnthropic,
  SiFigma,
  SiGithub,
  SiGitlab,
  SiGmail,
  SiGooglecalendar,
  SiGoogledrive,
  SiJira,
  SiLinear,
  SiNotion,
  SiOpenai,
  SiSentry,
  SiSlack,
  SiVercel,
  SiZendesk,
} from "react-icons/si";

export const connectors = [
  {
    id: "openai",
    name: "OpenAI",
    description: "Run reasoning and language models",
    category: "Models",
    icon: SiOpenai,
    connected: false,
    recommended: true,
  },
  {
    id: "anthropic",
    name: "Anthropic",
    description: "Bring Claude into agent runs",
    category: "Models",
    icon: SiAnthropic,
    connected: false,
    recommended: true,
  },
  {
    id: "github",
    name: "GitHub",
    description: "Read repositories and review pull requests",
    category: "Development",
    icon: SiGithub,
    connected: true,
    recommended: true,
  },
  {
    id: "slack",
    name: "Slack",
    description: "Search channels and deliver team updates",
    category: "Communication",
    icon: SiSlack,
    connected: true,
    recommended: true,
  },
  {
    id: "figma",
    name: "Figma",
    description: "Inspect design files and component libraries",
    category: "Design",
    icon: SiFigma,
    connected: true,
    recommended: true,
  },
  {
    id: "notion",
    name: "Notion",
    description: "Find team knowledge and project notes",
    category: "Knowledge",
    icon: SiNotion,
    connected: true,
    recommended: true,
  },
  {
    id: "linear",
    name: "Linear",
    description: "Track issues, cycles, and product decisions",
    category: "Planning",
    icon: SiLinear,
    connected: false,
    recommended: true,
  },
  {
    id: "vercel",
    name: "Vercel",
    description: "Inspect deployments and preview builds",
    category: "Development",
    icon: SiVercel,
    connected: false,
    recommended: true,
  },
  {
    id: "drive",
    name: "Google Drive",
    description: "Search documents in selected folders",
    category: "Knowledge",
    icon: SiGoogledrive,
    connected: true,
  },
  {
    id: "gmail",
    name: "Gmail",
    description: "Read threads and prepare draft replies",
    category: "Communication",
    icon: SiGmail,
    connected: false,
  },
  {
    id: "calendar",
    name: "Google Calendar",
    description: "Read events and find a time to meet",
    category: "Communication",
    icon: SiGooglecalendar,
    connected: false,
  },
  {
    id: "gemini",
    name: "Google Gemini",
    description: "Use multimodal models in your workspace",
    category: "Models",
    icon: FcGoogle,
    connected: false,
  },
  {
    id: "gitlab",
    name: "GitLab",
    description: "Review merge requests and pipeline results",
    category: "Development",
    icon: SiGitlab,
    connected: false,
  },
  {
    id: "jira",
    name: "Jira",
    description: "Find tickets and follow sprint progress",
    category: "Planning",
    icon: SiJira,
    connected: false,
  },
  {
    id: "zendesk",
    name: "Zendesk",
    description: "Surface patterns in customer conversations",
    category: "Customer support",
    icon: SiZendesk,
    connected: true,
  },
  {
    id: "sentry",
    name: "Sentry",
    description: "Read errors and investigate affected releases",
    category: "Monitoring",
    icon: SiSentry,
    connected: false,
  },
];
export type Connector = (typeof connectors)[number];
export const categories = [
  "All",
  "Connected",
  "Models",
  "Development",
  "Design",
  "Knowledge",
  "Planning",
  "Communication",
  "Customer support",
  "Monitoring",
];
export const agentNames = [
  "Customer signal analyst",
  "Release reviewer",
  "Knowledge curator",
  "Support coordinator",
];
export type StudioSkill = {
  id: string;
  name: string;
  description: string;
  category: string;
  author: string;
  updated: string;
  agents: string[];
  instructions: string;
};
export const initialSkills: StudioSkill[] = [
  {
    id: "signal-clustering",
    name: "signal-clustering",
    description: "Group customer feedback into evidence-backed themes.",
    category: "Research",
    author: "Maya",
    updated: "2h ago",
    agents: [agentNames[0], agentNames[3]],
    instructions:
      "Group feedback by the underlying need. Link every theme to its source. Separate recurring patterns from one-off requests.",
  },
  {
    id: "opportunity-scoring",
    name: "opportunity-scoring",
    description: "Rank opportunities by reach, impact, and confidence.",
    category: "Strategy",
    author: "Alex",
    updated: "Yesterday",
    agents: [agentNames[0]],
    instructions:
      "Score each opportunity on reach, impact, confidence, and effort. State assumptions and show the evidence behind the score.",
  },
  {
    id: "release-review",
    name: "release-review",
    description: "Review a change for regressions and rollout risks.",
    category: "Engineering",
    author: "Sam",
    updated: "3d ago",
    agents: [agentNames[1]],
    instructions:
      "Review the diff against its intent. Identify regressions, missing coverage, and rollout risks. Prioritize actionable findings.",
  },
  {
    id: "source-check",
    name: "source-check",
    description: "Verify claims against the original material.",
    category: "Research",
    author: "Maya",
    updated: "4d ago",
    agents: [agentNames[0], agentNames[2]],
    instructions:
      "Check every material claim against the original source. Preserve context and flag conflicts instead of choosing silently.",
  },
  {
    id: "concise-writing",
    name: "concise-writing",
    description: "Turn detailed findings into a clear decision brief.",
    category: "Writing",
    author: "Jordan",
    updated: "1w ago",
    agents: [agentNames[2], agentNames[3]],
    instructions:
      "Lead with the decision. Use plain language, preserve uncertainties, and end with concrete next steps.",
  },
  {
    id: "ticket-triage",
    name: "ticket-triage",
    description: "Identify urgency and route support requests.",
    category: "Support",
    author: "Alex",
    updated: "1w ago",
    agents: [agentNames[3]],
    instructions:
      "Identify the customer issue, urgency, and next owner. Escalate account security and payment disputes for human review.",
  },
];
export const skillPacks = [
  {
    name: "Customer intelligence",
    description: "From scattered feedback to a clear next step.",
    label: "Research & strategy",
    ids: ["signal-clustering", "opportunity-scoring", "source-check"],
    pattern: "circles",
  },
  {
    name: "Engineering review",
    description: "Ship changes with evidence and confidence.",
    label: "Development",
    ids: ["release-review", "source-check"],
    pattern: "grid",
  },
  {
    name: "Support operations",
    description: "Triage quickly. Keep the human in the loop.",
    label: "Customer experience",
    ids: ["ticket-triage", "concise-writing"],
    pattern: "lines",
  },
];
