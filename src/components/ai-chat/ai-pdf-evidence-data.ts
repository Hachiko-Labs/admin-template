import pageManifest from "../../../public/ai-chat/pdf-evidence/pages.json" with { type: "json" };

export const evidencePages = pageManifest;
export const evidencePdfUrl = "/ai-chat/pdf-evidence/first-week-research.pdf";
export const evidenceDocumentTitle = "Where new teams get stuck";
export type EvidencePassage =
  (typeof evidencePages)[number]["blocks"][number] & { page: number };
export const evidencePassages: EvidencePassage[] = evidencePages.flatMap(
  (page) => page.blocks.map((block) => ({ ...block, page: page.number })),
);

export function findEvidencePassage(id: string) {
  return evidencePassages.find((passage) => passage.id === id);
}

export function parseEvidencePage(input: string, current: number) {
  const value = Number(input.trim());
  return input.trim() && Number.isInteger(value)
    ? Math.max(1, Math.min(evidencePages.length, value))
    : current;
}

export function searchEvidence(query: string) {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return evidencePassages.filter((passage) => {
    const content = `${passage.title} ${passage.text}`.toLowerCase();
    return words.every((word) => content.includes(word));
  });
}

export interface EvidenceClaim {
  text: string;
  passageId: string;
}
export interface EvidenceAnswer {
  intro: string;
  claims: EvidenceClaim[];
}
export const initialEvidenceAnswer: EvidenceAnswer = {
  intro: "Three handoffs are worth fixing before adding more onboarding steps:",
  claims: [
    {
      text: "Teams reach advanced settings before their first shared result. Eight of the 12 observed teams did this, and six needed help understanding what was required.",
      passageId: "setup-friction",
    },
    {
      text: "An invitation needs a concrete next step. Five teams invited someone without sharing or assigning a task in that session.",
      passageId: "invitation-friction",
    },
    {
      text: "Import recovery needs to make partial success clear. Three teams restarted an upload because they could not tell which rows had been saved.",
      passageId: "recovery-friction",
    },
  ],
};

export function answerEvidenceQuestion(question: string): EvidenceAnswer {
  const query = question.toLowerCase();
  if (/limit|confiden|enterprise|sample|prove|retention/.test(query))
    return {
      intro:
        "Treat these findings as directions for a pilot, not proof of an activation lift.",
      claims: [
        {
          text: "The sample covers small, first-time teams. It does not represent enterprise administrators, returning teams, or long-term retention.",
          passageId: "scope",
        },
        {
          text: "The study followed 12 teams and used observed sessions plus interviews; it is not a population estimate.",
          passageId: "study",
        },
      ],
    };
  if (/pilot|test|measure|next|recommend|rollout/.test(query))
    return {
      intro: "The report proposes a small pilot with a decision checkpoint:",
      claims: [
        {
          text: "Run a two-week pilot in 20 new workspaces. Measure first shared task completion within seven days, time to first result, and setup-related support requests.",
          passageId: "pilot",
        },
        {
          text: "Continue only if confusion falls without hiding required controls. Keep the current setup flow available during the pilot.",
          passageId: "decision",
        },
      ],
    };
  if (/import|row|recover|upload/.test(query))
    return {
      intro: "The problem is uncertainty after a partial import.",
      claims: [initialEvidenceAnswer.claims[2]],
    };
  if (/invit|teammate|handoff/.test(query))
    return {
      intro: "An invitation alone does not create a shared next step.",
      claims: [initialEvidenceAnswer.claims[1]],
    };
  if (/setup|friction|stuck|finding|summary/.test(query))
    return initialEvidenceAnswer;
  return {
    intro:
      "This demo has prepared answers about setup friction, invitations, import recovery, the pilot, and study limitations. Try one of those topics, or search the report to inspect the original passages.",
    claims: [],
  };
}
