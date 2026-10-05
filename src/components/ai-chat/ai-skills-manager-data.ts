export type ManagedSkill = {
  id: string;
  name: string;
  description: string;
  author: string;
  category: "Writing" | "Analysis" | "Operations";
  instructions: string;
  installed: boolean;
  enabled: boolean;
  added: string;
};
export const managedSkills: ManagedSkill[] = [
  {
    id: "weekly-brief",
    name: "Weekly brief",
    description:
      "Turn project updates into a short, decision-ready team brief.",
    author: "Workspace team",
    category: "Writing",
    instructions:
      "Collect the supplied project updates.\n\nGroup them into progress, decisions needed, and next steps. Keep the brief under 500 words. Name an owner for each next step when one is provided. Flag missing context instead of guessing.",
    installed: true,
    enabled: true,
    added: "10 Sep",
  },
  {
    id: "data-quality",
    name: "Data quality review",
    description:
      "Check a dataset for missing values, duplicates, and unexpected changes.",
    author: "Priya Shah",
    category: "Analysis",
    instructions:
      "Review the provided schema and data sample.\n\nCheck completeness, uniqueness, and consistency. Report the affected fields and example records. Separate confirmed issues from checks that need more data.",
    installed: true,
    enabled: true,
    added: "11 Sep",
  },
  {
    id: "meeting-notes",
    name: "Meeting follow-ups",
    description:
      "Extract decisions and clearly assigned actions from meeting notes.",
    author: "Workspace team",
    category: "Operations",
    instructions:
      "Read the meeting transcript or notes.\n\nSummarize the decisions, then list actions with owners and due dates. Preserve uncertainty when a date or owner was not agreed. Finish with unresolved questions.",
    installed: true,
    enabled: true,
    added: "12 Sep",
  },
  {
    id: "release-notes",
    name: "Release notes",
    description:
      "Translate engineering changes into clear product announcements.",
    author: "Jonas Weber",
    category: "Writing",
    instructions:
      "Use the supplied pull requests and release summary.\n\nGroup changes into new features, improvements, and fixes. Explain the user benefit in plain language. Avoid promising behavior not supported by the source material.",
    installed: true,
    enabled: false,
    added: "13 Sep",
  },
  {
    id: "customer-themes",
    name: "Customer feedback themes",
    description:
      "Find recurring patterns in customer conversations and link each theme to supporting examples.",
    author: "Maya Chen",
    category: "Analysis",
    instructions:
      "Read the supplied customer feedback.\n\nGroup related observations into themes. Include supporting examples and note how often each theme appears. Separate requests from confirmed problems and avoid treating a small sample as representative.",
    installed: false,
    enabled: false,
    added: "Today",
  },
  {
    id: "decision-record",
    name: "Decision record",
    description:
      "Capture the context, alternatives, and trade-offs behind an important team decision.",
    author: "Workspace team",
    category: "Writing",
    instructions:
      "Create a decision record from the supplied discussion.\n\nUse these sections: Context, Options considered, Decision, Trade-offs, and Follow-up. Clearly mark a proposed decision if final approval has not been given.",
    installed: false,
    enabled: false,
    added: "Today",
  },
  {
    id: "handoff-check",
    name: "Project handoff",
    description:
      "Prepare a handoff that gives the next owner the context, open questions, and next steps.",
    author: "Alex Morgan",
    category: "Operations",
    instructions:
      "Review the supplied project context.\n\nWrite a concise handoff with the goal, current state, key links, unresolved risks, and next steps. Identify missing access or ownership details without inventing them.",
    installed: false,
    enabled: false,
    added: "Yesterday",
  },
  {
    id: "metric-commentary",
    name: "Metric commentary",
    description:
      "Explain what changed in a report, why it might matter, and what should be checked next.",
    author: "Priya Shah",
    category: "Analysis",
    instructions:
      "Compare the supplied current and previous reporting periods.\n\nDescribe material changes using absolute and relative values. Keep observations separate from possible explanations. Call out changes in definitions or sample size.",
    installed: false,
    enabled: false,
    added: "Yesterday",
  },
];
