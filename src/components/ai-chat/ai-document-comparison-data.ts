import { recordValue } from "@/lib/record-value";

import type {
  ArtifactDifference,
  ArtifactSnapshot,
} from "./ai-artifact-version-data";

export interface ComparisonDocument {
  id: string;
  label: string;
  author: string;
  snapshot: ArtifactSnapshot;
}
const purpose = {
  id: "purpose",
  title: "Purpose",
  text: "Make the first week useful for teams joining Northstar. This guide defines the setup sequence, shared document permissions, and the point at which a team is ready to work independently.",
};
const support = {
  id: "support",
  title: "Getting help",
  text: "Use the help menu to contact the onboarding team. Include the workspace name and the step you were trying to complete. Never include passwords or private customer documents.",
};
export const comparisonDocuments: ComparisonDocument[] = [
  {
    id: "original",
    label: "Onboarding guide · Original",
    author: "Maya Chen · September 2",
    snapshot: {
      title: "Team onboarding guide",
      subtitle: "First-week working agreement",
      sections: [
        purpose,
        {
          id: "setup",
          title: "First session",
          text: "Create a workspace and invite one teammate before importing a document. A team invitation is required to complete setup. The checklist closes after the invitation is sent.",
        },
        {
          id: "visibility",
          title: "Document visibility",
          text: "Imported documents are shared with everyone in the workspace. Workspace members can edit shared documents. Review the member list before adding sensitive material.",
        },
        {
          id: "training",
          title: "Live training",
          text: "Every new team must attend a 60-minute live training session before the end of its first week. The workspace owner schedules the session for all invited members.",
        },
        {
          id: "success",
          title: "First-week check-in",
          text: "On Friday, the workspace owner reports how many invitations were sent and whether the setup checklist was completed. The onboarding team reviews the report on Monday.",
        },
        support,
      ],
    },
  },
  {
    id: "proposal",
    label: "Onboarding guide · Proposed",
    author: "Alex Rivera · September 6",
    snapshot: {
      title: "Team onboarding guide",
      subtitle: "First-week working agreement",
      sections: [
        purpose,
        {
          id: "setup",
          title: "First session",
          text: "Create a workspace and import a document before inviting a teammate. A team invitation is optional during setup. The checklist closes after the first document is ready to use.",
        },
        {
          id: "visibility",
          title: "Document visibility",
          text: "Imported documents are private to their owner. Owners choose which documents to share and whether collaborators can view or edit. Show the audience and access level before sending an invitation.",
        },
        {
          id: "success",
          title: "First-week check-in",
          text: "On Friday, the workspace owner reports whether the team completed a shared task and records any setup blockers. The onboarding team reviews the report on Monday before recommending another cohort.",
        },
        support,
        {
          id: "recovery",
          title: "If setup stalls",
          text: "Keep the imported document and save the unfinished checklist. The owner can resume from the last completed step. Offer a 15-minute office-hours session when the team asks for help.",
        },
      ],
    },
  },
];
export const comparisonNotes = {
  setup:
    "The proposal puts usable content before collaboration and removes the invitation requirement. Review whether solo users can finish setup without sending an invitation.",
  visibility:
    "The default audience changes from the whole workspace to the document owner. Confirm that the audience preview and view/edit choice appear before sharing.",
  training:
    "The mandatory hour-long session is removed. Check whether any required onboarding material still needs a separate delivery path.",
  success:
    "The check-in moves from invitation and checklist counts to a completed shared task and recorded blockers. Confirm who makes the cohort decision after Monday’s review.",
  recovery:
    "The proposal adds saved progress, resumable setup, and optional office hours. Check that a team can return without losing its imported document.",
} satisfies Record<string, string>;
export function comparisonScope(before: string, after: string, change: string) {
  return `${[before, after].sort().join(":")}:${change}`;
}
export function comparisonAnswer(
  question: string,
  difference: ArtifactDifference,
  before: ComparisonDocument,
  after: ComparisonDocument,
) {
  const context = `**${difference.title}** · ${before.label} → ${after.label}`;
  if (
    !/chang|differ|explain|impact|mean|review|check|summar|why/i.test(question)
  )
    return `${context}\n\nThis local demo can explain the selected difference and suggest a review check. Try “Explain this change” or “What should I check?”`;
  const standardDirection = before.id === "original" && after.id === "proposal";
  return `${context}\n\n**Before:** ${difference.before ?? "This section is absent."}\n\n**After:** ${difference.after ?? "This section is absent."}\n\n${standardDirection ? (recordValue(comparisonNotes, difference.id) ?? "Review the highlighted text in its document context.") : "The comparison direction has changed. Review the before and after passages above in this order."}\n\nThese are authored demo observations; the documents do not establish the author’s intent.`;
}
