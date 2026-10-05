export const agentIdentity = {
  name: "Mira",
  role: "Customer operations partner",
  description:
    "Tracks customer handoffs, flags account changes, and prepares the team’s next steps.",
};
export const agentRoutines = [
  {
    id: "brief",
    title: "Team pulse",
    description:
      "A concise morning readout of account changes, open decisions, and today's handoffs.",
    schedule: "Weekdays · 08:30",
    time: "08:30",
    enabled: true,
  },
  {
    id: "handoff",
    title: "New account handoff",
    description:
      "Checks new accounts for missing context and prepares a handoff for the account owner.",
    schedule: "When an account is created",
    time: "On event",
    enabled: true,
  },
  {
    id: "feedback",
    title: "Customer signal check",
    description:
      "Groups recent feedback into themes and flags accounts that may need a closer look.",
    schedule: "Daily · 12:00",
    time: "12:00",
    enabled: true,
  },
  {
    id: "weekly",
    title: "Friday wrap-up",
    description:
      "Collects the week's outcomes and outstanding follow-ups into a shared team note.",
    schedule: "Fridays · 16:00",
    time: "16:00",
    enabled: false,
  },
];
export const agentApplications = [
  {
    name: "Slack",
    detail: "Read updates and draft team messages",
    initials: "S",
    enabled: true,
  },
  {
    name: "Linear",
    detail: "Read issues and prepare follow-ups",
    initials: "L",
    enabled: true,
  },
  {
    name: "HubSpot",
    detail: "Read account records and owners",
    initials: "H",
    enabled: true,
  },
  {
    name: "Notion",
    detail: "Read and draft workspace documents",
    initials: "N",
    enabled: false,
  },
];
export const agentSkills = [
  {
    name: "Account research",
    description:
      "Bring account history, recent conversations, and open questions into one brief.",
    enabled: true,
  },
  {
    name: "Signal synthesis",
    description:
      "Find recurring themes in feedback without losing the source context.",
    enabled: true,
  },
  {
    name: "Handoff writing",
    description:
      "Prepare a clear summary with an owner, next step, and supporting links.",
    enabled: true,
  },
  {
    name: "Weekly reporting",
    description:
      "Compare this week's progress with the previous week and highlight changes.",
    enabled: false,
  },
];
export type AgentActivityKind = "threads" | "workflows" | "checks" | "tasks";
export type AgentDetailActivity = {
  id: string;
  time: string;
  title: string;
  source: string;
  kind: AgentActivityKind;
  prompt: string;
  response: string;
  duration?: string;
};
export const agentDetailActivities: AgentDetailActivity[] = [
  {
    id: "a1",
    time: "10:24",
    title: "Prepared the Northstar handoff",
    source: "HubSpot",
    kind: "tasks",
    prompt: "Check the new Northstar account and prepare the owner handoff.",
    response:
      "The account has an owner and a kickoff date. Added the implementation notes and flagged one missing billing contact for review.",
  },
  {
    id: "a2",
    time: "10:12",
    title: "Grouped onboarding feedback",
    source: "Linear",
    kind: "checks",
    prompt:
      "Look for recurring friction in this morning's onboarding feedback.",
    response:
      "Found three mentions of invite permissions across eight issues. Linked the examples to the existing onboarding follow-up.",
  },
  {
    id: "a3",
    time: "09:46",
    title: "Re: Acme rollout questions",
    source: "Slack",
    kind: "threads",
    prompt: "What is still open before the Acme rollout?",
    response:
      "Two items remain: confirming the workspace owner and approving the import sample. Both have named owners and are due Thursday.",
  },
  {
    id: "brief",
    time: "08:30",
    title: "Team pulse completed",
    source: "Workflow",
    kind: "workflows",
    duration: "12.8s",
    prompt:
      "Summarize account changes, open handoffs, and decisions the customer team needs to make today.",
    response:
      "Reviewed 18 account updates and 6 open handoffs. Two accounts need an owner check, one kickoff moved to Thursday, and all urgent follow-ups have an assigned owner. A draft brief is ready for the team to review.",
  },
  {
    id: "a5",
    time: "08:18",
    title: "Checked the integration heartbeat",
    source: "HubSpot",
    kind: "checks",
    prompt: "Confirm the latest account sync completed successfully.",
    response:
      "The latest sync finished at 08:16. All 24 changed records were received and no retry is needed.",
  },
  {
    id: "a6",
    time: "08:05",
    title: "Updated the renewal watchlist",
    source: "HubSpot",
    kind: "tasks",
    prompt: "Review accounts renewing in the next 30 days.",
    response:
      "Added two accounts to the watchlist. Both have a recent customer conversation and an assigned renewal owner.",
  },
  {
    id: "a7",
    time: "07:52",
    title: "Re: Wednesday customer review",
    source: "Slack",
    kind: "threads",
    prompt: "Prepare the context for today's customer review.",
    response:
      "Collected the account summary, current milestones, and three questions from the account team into a review outline.",
  },
  {
    id: "a8",
    time: "07:40",
    title: "Account context refreshed",
    source: "Workflow",
    kind: "workflows",
    duration: "9.4s",
    prompt: "Refresh the account context used by the morning brief.",
    response:
      "Refreshed account ownership, upcoming milestones, and open escalations for 18 active accounts.",
  },
];
