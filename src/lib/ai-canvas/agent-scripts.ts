import type { AgentActivity, AgentScenarioId, AgentTask } from "./agents";

/** Authored showcase dialogue. These commands and results are never executed. */
export type AgentScript = {
  provider: "codex" | "claude" | "grok";
  output: string;
  steps: AgentActivity[];
};

const researchOutput = `## Onboarding flow

The primary journey is **invite → accept → join the workspace**.

- Default new invitations to Member. Make Admin an explicit choice.
- Keep pending invitations in the team table with a “Resend invite” action.
- Flag duplicate emails before submission and preserve valid entries.
- Show expired invitations separately from delivery failures.

The invite dialog should return focus to its trigger after closing. On mobile, keep the role selector beside each email and the submit action visible.`;
const designOutput = `## Invite experience

Added an invitation dialog with email entry, per-person roles, and inline validation.

- Empty, validating, sending, success, and partial-failure states.
- Pending invitations share the team table’s columns and row actions.
- A successful invite announces “Invitation sent” and adds a pending row.
- Small screens use a full-width dialog with a persistent submit action.

Changed: src/features/team/invite-dialog.tsx, invitation-row.tsx, and team-settings.tsx.

Ready for the accessibility and permissions review.`;
const reviewOutput = `## Review complete

The flow covers the research requirements and is ready for handoff.

✓ Member is the default role; only owners can invite an Admin.
✓ Duplicate and invalid emails have actionable inline errors.
✓ Focus returns to the Invite people button; status updates are announced.
✓ Pending, expired, and failed invitations have distinct actions.
✓ The dialog works at 375px without horizontal scrolling.

One follow-up: add an invitation-expiry timestamp to the pending row’s tooltip.`;

export const codexTeamScripts: Record<AgentTask["role"], AgentScript> = {
  Research: {
    provider: "codex",
    output: researchOutput,
    steps: [
      {
        id: "intro",
        kind: "message",
        text: "I’ll trace the existing team flow and collect the states the invitation dialog needs.",
      },
      {
        id: "read",
        kind: "command",
        text: "rg -n 'invite|pending|role' src/features/team",
        status: "run",
      },
      {
        id: "read",
        kind: "command",
        text: "rg -n 'invite|pending|role' src/features/team",
        status: "ok",
        output:
          "team-settings.tsx:42  Invite people\ninvitation-row.tsx:18  status: pending | accepted | expired\npermissions.ts:9  owner | admin | member",
      },
      {
        id: "findings",
        kind: "message",
        text: "The team table already supports pending rows. The missing pieces are duplicate-email handling, expiry, and an explicit Admin permission check.",
      },
      { id: "output", kind: "message", text: researchOutput },
    ],
  },
  Design: {
    provider: "codex",
    output: designOutput,
    steps: [
      {
        id: "intro",
        kind: "message",
        text: "I’ll reuse the team settings layout and build the invite dialog with the existing Field, Select, and Dialog components.",
      },
      {
        id: "read",
        kind: "command",
        text: "Read src/features/team/team-settings.tsx",
        status: "ok",
        output:
          "Existing page: team table, role badges, row actions, Invite people trigger.",
      },
      {
        id: "edit",
        kind: "command",
        text: "Edited src/features/team/invite-dialog.tsx",
        status: "run",
      },
      {
        id: "edit",
        kind: "command",
        text: "Edited src/features/team/invite-dialog.tsx",
        status: "ok",
        output:
          '+ <DialogTitle>Invite people</DialogTitle>\n+ <FieldLabel>Email address</FieldLabel>\n+ <Select defaultValue="member">…</Select>\n+ <Button disabled={isSending}>Send invitations</Button>',
      },
      {
        id: "check",
        kind: "command",
        text: "pnpm test -- invite-dialog",
        status: "ok",
        output:
          "✓ rejects invalid and duplicate emails\n✓ preserves valid entries after a partial failure\n✓ restores focus when the dialog closes\n12 passed · 0 failed",
      },
      { id: "output", kind: "message", text: designOutput },
    ],
  },
  Review: {
    provider: "codex",
    output: reviewOutput,
    steps: [
      {
        id: "inputs",
        kind: "message",
        text: "I have the onboarding findings and the invitation implementation. I’ll check the edge cases, role boundaries, and keyboard flow.",
      },
      {
        id: "diff",
        kind: "command",
        text: "git diff -- src/features/team",
        status: "ok",
        output: "3 files changed · 184 insertions · 22 deletions",
      },
      {
        id: "check",
        kind: "command",
        text: "pnpm test -- team-accessibility team-permissions",
        status: "run",
      },
      {
        id: "check",
        kind: "command",
        text: "pnpm test -- team-accessibility team-permissions",
        status: "ok",
        output:
          "✓ owner-only Admin invitations\n✓ keyboard navigation and focus restoration\n✓ 375px layout and error announcements\n18 passed · 0 failed",
      },
      { id: "output", kind: "message", text: reviewOutput },
    ],
  },
};

/** Follow-ups are authored branches, never generated or executed. */
export function followUpScript(
  task: AgentTask,
  prompt: string,
  scenario: AgentScenarioId = "mixed",
): AgentScript {
  if (scenario === "codex") {
    const output = /mobile|responsive|small.screen/i.test(prompt)
      ? "For mobile, keep the email and role controls in a single column, use the full dialog width, and pin Send invitations above the keyboard. Preserve partially entered emails when the dialog is dismissed."
      : /accessib|keyboard|focus|screen.reader/i.test(prompt)
        ? "The dialog needs an accessible title, a labelled email field, errors associated with each input, and an aria-live status for submission. Escape closes the dialog and restores focus to Invite people."
        : task.role === "Research"
          ? "Prioritize the first successful invitation. Keep Member as the default role, explain pending status in the team table, and make retrying a failed invitation possible without starting over."
          : task.role === "Design"
            ? "The next change is an invitation-expiry tooltip on pending rows. I’d reuse the table’s existing tooltip pattern and keep Resend invite in the row action menu."
            : "The handoff is clear. Keep the invitation-expiry tooltip as a small follow-up; the primary invitation, validation, and permissions flows are covered.";
    return {
      provider: "codex",
      output,
      steps: [
        {
          id: "ack",
          kind: "message",
          text: "I’ll focus this pass on the onboarding flow.",
        },
        { id: "output", kind: "message", text: output },
      ],
    };
  }
  const mobile = /mobile|responsive|small.screen|narrow|fix|label/i.test(
    prompt,
  );
  const accessibility = /accessib|keyboard|focus|screen.reader/i.test(prompt);
  const output = mobile
    ? task.role === "Design"
      ? "Updated the narrow layout: Estimated next invoice stays beside the amount at every width. The usage cards stack, and changing the billing period clears the previous estimate until the new period is ready. Ready for Grok to recheck."
      : task.role === "Review"
        ? "Rechecked the narrow layout after Codex’s update. The Estimate label stays attached to the amount at 375px. Zero usage, overages, and stale-period responses still pass. No remaining blockers in this scripted review."
        : "For mobile, keep the billing period and Estimate label next to the amount. Stack usage cards, keep plan limits visible, and let owners reach invoice history without opening the upgrade flow. I’ll pass those constraints to Codex."
    : accessibility
      ? "Label the billing-period selector, announce loading and error states, and expose usage as text alongside the meter. Keep keyboard focus on the selected period while the estimate refreshes."
      : task.role === "Research"
        ? "The owner needs three answers: usage so far, estimated next invoice, and what an upgrade changes. Keep confirmed charges separate, explain overages, and avoid making invoice history depend on an upgrade."
        : task.role === "Design"
          ? "I’ll keep the estimate label visible at narrow widths and add a regression case for a period switch while loading. Then I’ll hand the updated overview back to Grok."
          : "The next check is the narrow-layout estimate label. Once Codex keeps it beside the amount, recheck zero usage and a billing-period switch before closing the handoff.";
  const ack =
    task.provider === "claude"
      ? "I’ll walk through the billing constraints and update the handoff."
      : task.provider === "grok"
        ? "Checking the billing edge cases against the latest handoff."
        : "I’ll update the overview and check the affected states.";
  return {
    provider: task.provider,
    output,
    steps: [
      { id: "ack", kind: "message", text: ack },
      {
        id: "check",
        kind: "command",
        text: "Check · billing overview follow-up",
        status: "ok",
        output:
          "Estimate label, billing period, and usage states checked in this scripted pass.",
      },
      { id: "output", kind: "message", text: output },
    ],
  };
}

/** Authored cross-provider handoff for the public billing showcase. */
export const mixedAgentScenario = {
  title: "Ship a usage and billing dashboard",
  brief:
    "Help a workspace owner understand usage, forecast the next invoice, and choose whether to change plans.",
  agents: [
    {
      provider: "claude",
      role: "Research",
      title: "Map billing decisions",
      prompt:
        "Review the billing journey. Identify the questions a workspace owner must answer before changing plans.",
      presentation: [
        "ClaudeMessage",
        "ClaudeTodoList",
        "ClaudeToolCall",
        "ClaudeThinking",
      ],
      script: {
        provider: "claude",
        output:
          "Lead with current usage, the billing period, and a clearly labelled estimate. Explain overages before offering an upgrade. Keep invoice history and payment issues available without interrupting the primary decision.",
        steps: [
          {
            id: "plan",
            kind: "message",
            text: "I’ll map the owner’s decisions first, then check which numbers the current billing page exposes. That should keep the design focused on clarity before conversion.",
          },
          {
            id: "read",
            kind: "tool",
            text: "Read · src/features/billing/billing-page.tsx",
            status: "ok",
            output:
              "Read 146 lines. Found plan summary, usage meter, invoice history, and payment method.",
          },
          {
            id: "findings",
            kind: "message",
            text: "There are three questions to answer: what have I used, what will I pay, and what changes if I upgrade? The current page mixes confirmed charges with the forecast. I’d separate those before adding another chart.",
          },
        ],
      } satisfies AgentScript,
    },
    {
      provider: "codex",
      role: "Design",
      title: "Build the usage overview",
      prompt:
        "Implement the billing overview using the research findings and existing dashboard components.",
      presentation: ["CodexHeader", "CodexExec", "CodexDiff", "CodexPrompt"],
      script: {
        provider: "codex",
        output:
          "Added usage cards, a billing-period selector, and an estimated-invoice breakdown. Confirmed charges and forecasts are separated. Empty, loading, and over-limit states are covered.",
        steps: [
          {
            id: "intro",
            kind: "message",
            text: "I’ll separate the estimate from confirmed charges, then add the usage and overage states.",
          },
          {
            id: "edit",
            kind: "command",
            text: "Edited src/features/billing/usage-overview.tsx",
            status: "ok",
            output:
              '+ <UsageSummary period={period} />\n+ <InvoiceEstimate label="Estimated next invoice" />\n+ <OverageNotice usage={usage} limit={plan.limit} />',
          },
          {
            id: "test",
            kind: "command",
            text: "pnpm test -- billing-overview",
            status: "ok",
            output: "16 passed · 0 failed",
          },
        ],
      } satisfies AgentScript,
    },
    {
      provider: "grok",
      role: "Review",
      title: "Check the billing edge cases",
      prompt:
        "Review the completed overview. Check estimates, over-limit states, zero usage, and changes between billing periods.",
      presentation: [
        "GrokStatus",
        "GrokTool",
        "GrokWrite",
        "GrokWorking",
        "GrokPrompt",
      ],
      script: {
        provider: "grok",
        output:
          "The totals are consistent. One fix before handoff: keep the Estimate label visible in the narrow layout. Zero usage, overages, and billing-period changes all pass the review.",
        steps: [
          {
            id: "intro",
            kind: "message",
            text: "I’m checking the cases that make a billing screen misleading: zero usage, overages, and a period change halfway through loading.",
          },
          {
            id: "check",
            kind: "command",
            text: "Run tests/billing-edge-cases.test.ts",
            status: "ok",
            output:
              "Zero usage: pass\nOver-limit estimate: pass\nStale period response: pass\nNarrow layout: Estimate label hidden",
          },
          {
            id: "finding",
            kind: "message",
            text: "One issue: the mobile layout hides “Estimate” but leaves the price. That can read like a confirmed charge. Keep the label next to the amount; the rest of the flow is consistent.",
          },
        ],
      } satisfies AgentScript,
    },
  ],
} as const;

export function scriptForTask(
  task: AgentTask,
  scenario: AgentScenarioId = "mixed",
): AgentScript {
  if (scenario === "codex") return structuredClone(codexTeamScripts[task.role]);
  const template = mixedAgentScenario.agents.find(
    (agent) => agent.role === task.role,
  )!.script;
  const steps: AgentActivity[] = template.steps.map((step) => ({ ...step }));
  if (task.role === "Design")
    steps.unshift({
      id: "handoff-in",
      kind: "tool",
      text: "Received Claude’s billing requirements",
      status: "ok",
      output:
        "Separate estimates from confirmed charges. Cover zero usage, overages, and period changes.",
    });
  if (task.role === "Review")
    steps.unshift({
      id: "handoff-in",
      kind: "tool",
      text: "Received Codex’s implementation + Claude’s requirements",
      status: "ok",
      output:
        "Usage overview, invoice estimate, and billing-period states are ready for review.",
    });
  steps.push({ id: "output", kind: "message", text: template.output });
  steps.push({
    id: "handoff-out",
    kind: "tool",
    status: "ok",
    text:
      task.role === "Research"
        ? "Handoff → Codex"
        : task.role === "Design"
          ? "Handoff → Grok"
          : "Review → Codex",
    output:
      task.role === "Review"
        ? "Keep the Estimate label visible on mobile. Send Codex a follow-up to apply the change."
        : "The next terminal can use this output when its dependencies finish.",
  });
  return { provider: task.provider, output: template.output, steps };
}
