export interface DocumentSelection {
  from: number;
  to: number;
  text: string;
}
export type RevisionStyle = "concise" | "clear";
export interface DocumentRevision extends DocumentSelection {
  id: string;
  documentVersion: number;
  instruction: string;
  replacement: string;
  status: "pending" | "accepted" | "rejected";
}

const documentIntroduction =
  "A focused onboarding experience for teams that want to start working, not spend their first day configuring software.";
export const documentTitle = "Make the first week count";
export const originalRecommendation =
  "We recommend introducing a guided checklist for new teams so that they can get a useful result before they are asked to configure the entire workspace. The checklist should focus on creating one project, inviting one teammate, and completing one shared task. Advanced settings can wait until the team has a reason to use them.";
export const conciseRecommendation =
  "Help new teams get a useful result with three steps: create a project, invite a teammate, and complete a shared task. Introduce advanced settings when they become relevant.";
const paragraph = (text: string) => ({
  type: "paragraph",
  content: [{ type: "text", text }],
});
const heading = (text: string, level: number) => ({
  type: "heading",
  attrs: { level },
  content: [{ type: "text", text }],
});
export const initialWritingDocument = {
  type: "doc",
  content: [
    heading(documentTitle, 1),
    paragraph(documentIntroduction),
    heading("Recommendation", 2),
    paragraph(originalRecommendation),
    heading("What changes", 2),
    {
      type: "bulletList",
      content: [
        "Replace the setup wizard with a short, persistent checklist.",
        "Let teams start with a realistic sample project.",
        "Keep optional integrations out of the first-run path.",
      ].map((text) => ({ type: "listItem", content: [paragraph(text)] })),
    },
    heading("How we’ll know", 2),
    paragraph(
      "Measure the share of new teams that complete a shared task in their first week. Pair that with time to first result and the number of setup-related support requests.",
    ),
    heading("Rollout", 2),
    paragraph(
      "Start with a small group of new workspaces. Review their first-week experience before expanding the rollout. Keep the current setup flow available during the pilot.",
    ),
  ],
};
const recommendationStart =
  documentTitle.length +
  2 +
  documentIntroduction.length +
  2 +
  "Recommendation".length +
  2 +
  1;
export const initialWritingSelection: DocumentSelection = {
  from: recommendationStart,
  to: recommendationStart + originalRecommendation.length,
  text: originalRecommendation,
};
export const initialWritingRevision: DocumentRevision = {
  ...initialWritingSelection,
  id: "revision-1",
  documentVersion: 0,
  instruction: "Make the recommendation shorter and more direct.",
  replacement: conciseRecommendation,
  status: "pending",
};

export function proposeDocumentText(text: string, style: RevisionStyle) {
  if (text === originalRecommendation)
    return style === "concise"
      ? conciseRecommendation
      : "Give new teams a guided checklist with three steps: create a project, invite a teammate, and finish a shared task. This gives them a useful result before they configure the rest of the workspace. Introduce advanced settings only when the team needs them.";
  const direct = text
    .replace(/in order to/gi, "to")
    .replace(/at this point in time/gi, "now")
    .replace(/due to the fact that/gi, "because")
    .replace(/a number of/gi, "several")
    .replace(/it is important to note that\s*/gi, "")
    .replace(/should be able to/gi, "can")
    .replace(/in the event that/gi, "if")
    .trim();
  if (style === "clear")
    return direct ? direct[0].toUpperCase() + direct.slice(1) : text;
  const sentences = direct.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) ?? [direct];
  return sentences.length > 2
    ? sentences.slice(0, 2).join(" ").replace(/\s+/g, " ").trim()
    : direct;
}
export function canApplyDocumentRevision(
  revision: DocumentRevision,
  currentVersion: number,
  currentRangeText: string,
) {
  return (
    revision.status === "pending" &&
    revision.documentVersion === currentVersion &&
    revision.text === currentRangeText &&
    revision.replacement.trim().length > 0
  );
}
