export type DeliverableKind = "document" | "data";
export type DeliverableFormat = "markdown" | "csv" | "json" | "text";
export interface DeliverableSession {
  id: string;
  title: string;
  prompt: string;
  answer: string;
}
export interface DeliverableFile {
  id: string;
  name: string;
  title: string;
  description: string;
  sessionId: string;
  format: DeliverableFormat;
  kind: DeliverableKind;
  createdAt: string;
  displayTime: string;
  content: string;
  rows?: string[][];
}
export const deliverableSessions: DeliverableSession[] = [
  {
    id: "launch-kit",
    title: "Prepare the onboarding pilot",
    prompt:
      "Put together the files we need to run the onboarding pilot: a plan, a customer invitation, and a cohort tracker.",
    answer:
      "The pilot kit is ready: a plan with the decision gate, an invitation explaining the two-week commitment, and a tracker for the two cohorts.\n\nEach file is ready to review and download.",
  },
  {
    id: "research-handoff",
    title: "Hand off the research findings",
    prompt:
      "Turn the onboarding research into a short handoff. Include the findings, a checklist configuration, and the open questions for our next review.",
    answer:
      "I’ve organized the handoff into three files: a findings brief, a checklist configuration, and the open questions.\n\nThe brief separates observations from next steps. The configuration is a draft for engineering review, and the questions capture what we still need to learn.",
  },
];
export function encodeDeliverableCsv(rows: string[][]) {
  return (
    rows
      .map((row) =>
        row
          .map((value) =>
            /[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value,
          )
          .join(","),
      )
      .join("\r\n") + "\r\n"
  );
}
const cohortRows = [
  ["Cohort", "Workspaces", "Owner", "Start", "Review", "Status"],
  ["Pilot A", "10", "Maya Chen", "Sep 14", "Sep 28", "Ready"],
  ["Pilot B", "10", "Alex Rivera", "Sep 21", "Oct 5", "Pending first review"],
  [
    "Expansion",
    "TBD",
    "Maya Chen",
    "After pilot",
    "Before enablement",
    "Not approved",
  ],
];
export const deliverableFiles: DeliverableFile[] = [
  {
    id: "pilot-plan",
    name: "onboarding-pilot.md",
    title: "Onboarding pilot",
    description: "Cohort, responsibilities, and the decision to expand.",
    sessionId: "launch-kit",
    format: "markdown",
    kind: "document",
    createdAt: "2026-09-06T10:42:00",
    displayTime: "10:42 AM",
    content: `# Onboarding pilot

A two-week test of a shorter path to the first shared result.

## The plan

Invite 20 new workspaces in two cohorts. Keep the existing setup flow available, and introduce the checklist behind a workspace flag. Review the first cohort before enabling the second.

## What we want to learn

- Can teams create a project, invite a teammate, and finish a shared task?
- Which step causes people to pause or ask for help?
- Does the shorter flow preserve the controls larger teams need?

## Responsibilities

| Owner | Responsibility |
| --- | --- |
| Product | Select cohorts and decide whether to expand |
| Engineering | Feature flag, event tracking, and fallback |
| Support | Review questions and identify confusing steps |

## Decision gate

Track first shared task completion within seven days, time to first shared result, and setup-related support requests. Pause expansion if required controls become inaccessible or support requests increase.

A faster setup alone is not enough to expand. The product owner reviews the evidence before each new cohort.
`,
  },
  {
    id: "pilot-invitation",
    name: "pilot-invitation.md",
    title: "An invitation to the pilot",
    description: "Customer email with the pilot window and a clear next step.",
    sessionId: "launch-kit",
    format: "markdown",
    kind: "document",
    createdAt: "2026-09-06T10:40:00",
    displayTime: "10:40 AM",
    content: `# Help us improve your first week

**Subject:** Join a two-week onboarding pilot

Hi there,

We’re inviting a small group of teams to try a shorter path to their first shared task.

For two weeks, your workspace can try a checklist for creating a project, inviting a teammate, and completing a shared task. Your existing setup flow will remain available.

We’ll ask which steps felt clear and where you needed help. You can leave the pilot at any time.

Reply with your workspace name if you’d like to join. We’ll confirm the start date and share a short guide before enabling the pilot.

Thanks,  
The product team
`,
  },
  {
    id: "cohort-tracker",
    name: "cohort-tracker.csv",
    title: "Pilot cohort tracker",
    description: "Two cohorts, owners, dates, and an explicit expansion gate.",
    sessionId: "launch-kit",
    format: "csv",
    kind: "data",
    createdAt: "2026-09-06T10:38:00",
    displayTime: "10:38 AM",
    content: encodeDeliverableCsv(cohortRows),
    rows: cohortRows,
  },
  {
    id: "research-brief",
    name: "first-week-findings.md",
    title: "First-week findings",
    description: "Observed friction and the next questions to test.",
    sessionId: "research-handoff",
    format: "markdown",
    kind: "document",
    createdAt: "2026-09-06T09:55:00",
    displayTime: "9:55 AM",
    content: `# First-week findings

A fictional research handoff for the onboarding team.

## Three places teams need help

1. **Import recovery.** Teams want to understand which rows failed without restarting the entire import.
2. **Inviting a teammate.** People are unsure what an invited teammate will be able to see and change.
3. **Finding the first shared task.** Completing setup does not always lead to a useful shared result.

## What to test next

Give import errors a recoverable state. Explain teammate access before sending an invitation. Make the first shared task explicit in the checklist.

## Limits

These observations are prepared demo content, not measurements from real users. Validate the hypotheses with a small pilot before expanding the flow.
`,
  },
  {
    id: "checklist-config",
    name: "pilot-checklist.json",
    title: "Pilot checklist configuration",
    description: "A draft configuration for engineering review.",
    sessionId: "research-handoff",
    format: "json",
    kind: "data",
    createdAt: "2026-09-06T09:52:00",
    displayTime: "9:52 AM",
    content:
      JSON.stringify(
        {
          name: "onboarding-pilot",
          enabled: false,
          cohortLimit: 20,
          durationDays: 14,
          fallback: "existing-setup",
          steps: [
            { id: "create-project", label: "Create a project", required: true },
            {
              id: "invite-teammate",
              label: "Invite a teammate",
              required: true,
            },
            {
              id: "shared-task",
              label: "Complete a shared task",
              required: true,
            },
          ],
          expansionRequires: "product-owner-review",
        },
        null,
        2,
      ) + "\n",
  },
  {
    id: "open-questions",
    name: "open-questions.txt",
    title: "Questions for the next review",
    description: "Unresolved ownership, access, and measurement questions.",
    sessionId: "research-handoff",
    format: "text",
    kind: "document",
    createdAt: "2026-09-06T09:48:00",
    displayTime: "9:48 AM",
    content:
      "QUESTIONS FOR THE NEXT REVIEW\n\n1. Who owns recovery when an import is only partly successful?\n2. Which permission details should appear before an invitation is sent?\n3. What counts as a useful shared task for different kinds of teams?\n4. Which events let us distinguish setup completion from a shared result?\n5. Who can pause the pilot, and how quickly can the old flow be restored?\n\nOwner: Maya Chen\nNext review: September 11\nStatus: Open for discussion\n",
  },
];
export const deliverableMimeTypes: Record<DeliverableFormat, string> = {
  markdown: "text/markdown;charset=utf-8",
  csv: "text/csv;charset=utf-8",
  json: "application/json;charset=utf-8",
  text: "text/plain;charset=utf-8",
};
export function deliverableBytes(file: Pick<DeliverableFile, "content">) {
  return new TextEncoder().encode(file.content).byteLength;
}
export function formatDeliverableBytes(bytes: number) {
  return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
}
export function filterDeliverables(
  files: DeliverableFile[],
  query: string,
  kind: string,
  sessionId: string,
  sort: string,
) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return files
    .filter(
      (file) =>
        (kind === "all" || file.kind === kind) &&
        (sessionId === "all" || file.sessionId === sessionId) &&
        words.every((word) =>
          `${file.name} ${file.title} ${file.description} ${deliverableSessions.find((session) => session.id === file.sessionId)?.title ?? ""}`
            .toLowerCase()
            .includes(word),
        ),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.name.localeCompare(b.name)
        : b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id),
    );
}
export function answerDeliverableQuestion(
  question: string,
  sessionId: string,
  selectedId: string | null,
) {
  const files = deliverableFiles.filter((file) => file.sessionId === sessionId);
  const selected = files.find((file) => file.id === selectedId);
  if (/where|which|find|list|files|deliverable|output/i.test(question))
    return `This conversation produced **${files.length} files**:\n\n${files.map((file) => `- **${file.name}** — ${file.description}`).join("\n\n")}\n\nOpen a file in the cabinet to preview it or download the original.`;
  if (/summari|summary|explain|what|review/i.test(question) && selected)
    return `**${selected.name}**\n\n${selected.description}\n\n${selected.format === "csv" ? `The tracker contains ${selected.rows!.length - 1} rows. Expansion remains not approved until the pilot review.` : selected.format === "json" ? "This draft is disabled by default. It limits the pilot to 20 workspaces for 14 days, keeps the existing setup as a fallback, and requires product-owner review before expansion." : selected.format === "text" ? "The open questions cover import recovery, invitation permissions, the first shared task, tracking, and who can pause the pilot." : selected.id === "pilot-plan" ? "Run two cohorts over two weeks, retain the existing setup flow, and review shared-task completion and support requests before expanding. Product owns the decision; engineering owns the flag and fallback." : selected.id === "pilot-invitation" ? "This email explains the two-week pilot, preserves the existing setup flow, and asks customers to reply with their workspace name. It has not been sent." : "The brief highlights import recovery, invitation access, and reaching a first shared task. These are fictional demo observations; the suggested next step is a small pilot."}`;
  return selected
    ? "This demo can list the files from this conversation or summarize the selected deliverable. Try “Summarize this file.”"
    : "Choose a file from this conversation to ask about its contents, or ask me to list the deliverables. These replies use prepared demo content.";
}
