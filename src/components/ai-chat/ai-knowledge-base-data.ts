export interface KbSection {
  heading?: string;
  paragraphs: string[];
}

export interface KbFollowup {
  short: string;
  question: string;
  answer: string;
}

export interface KbDoc {
  id: string;
  title: string;
  source: string;
  authors: string;
  date: string;
  pages: number;
  minutes: number;
  progress: number;
  read: boolean;
  starred: boolean;
  keywords: string[];
  related: string[];
  intro: string;
  keyPassage: string;
  tldr: string;
  whyItMatters: string;
  sections: KbSection[];
  followups: KbFollowup[];
}

export interface KbTurn {
  id: string;
  role: "user" | "assistant" | "context";
  text: string;
}

export const kbDocs: KbDoc[] = [
  {
    id: "refund-policy",
    title: "Refund policy",
    source: "Support playbook",
    authors: "M. Okafor · Support",
    date: "June 2026",
    pages: 12,
    minutes: 8,
    progress: 0.75,
    read: false,
    starred: true,
    keywords: ["Refunds", "Support", "Policy"],
    related: ["pricing-memo", "incident-postmortem"],
    intro:
      "When money moves back to a customer, speed and clarity matter more than process. This policy sets the window, the approvers, and the exact words to use.",
    keyPassage:
      "Refunds within 30 days of purchase are approved automatically up to $500. Anything older or larger needs a lead's sign-off in the ticket, with the reason quoted back to the customer.",
    tldr: "Under 30 days and under $500, refund immediately with no approval. Older or larger refunds need a lead's sign-off recorded in the ticket.",
    whyItMatters:
      "Refund tickets are the most visible support interaction. A slow refund reads as distrust; this policy trades a small fraud risk for response time.",
    sections: [
      {
        heading: "1. The 30-day window",
        paragraphs: [
          "The window opens at purchase, not delivery. Digital goods and physical shipments follow the same clock so agents never have to compute two timelines on a live ticket.",
          "Edge cases — preorders, backorders, gift purchases — anchor to the charge date on the receipt. When the receipt is ambiguous, the newer date wins.",
        ],
      },
      {
        heading: "2. Approvals",
        paragraphs: [
          "Leads approve in the ticket thread, never in a side channel. The approval must quote the reason so a future audit can reconstruct the decision without chasing chat logs.",
          "Repeat refunds to the same customer within 90 days route to a lead regardless of amount.",
        ],
      },
    ],
    followups: [
      {
        short: "Refund window?",
        question: "What is the refund window?",
        answer:
          "30 days from purchase for everything. Under $500 inside the window is automatic; older or larger needs a lead's sign-off quoted in the ticket.",
      },
      {
        short: "Repeat refunds?",
        question: "What about repeat refunds?",
        answer:
          "A second refund to the same customer within 90 days always routes to a lead, whatever the amount. The policy assumes the first refund may have missed the real problem.",
      },
      {
        short: "Preorders?",
        question: "How do preorders work?",
        answer:
          "Preorders anchor to the charge date on the receipt, not the ship date. If the receipt is ambiguous, use the newer date.",
      },
    ],
  },
  {
    id: "onboarding-runbook",
    title: "Onboarding runbook",
    source: "People ops",
    authors: "D. Kim · People",
    date: "May 2026",
    pages: 18,
    minutes: 14,
    progress: 0.4,
    read: false,
    starred: false,
    keywords: ["Onboarding", "Runbook", "Ops"],
    related: ["security-checklist", "expense-guidelines"],
    intro:
      "The first week decides how fast a hire becomes a contributor. This runbook assigns every day-one task an owner so nothing waits on hallway knowledge.",
    keyPassage:
      "Every new hire ships something to production by day three, paired with their buddy. Access, laptop, and introductions are preconditions, never the goal.",
    tldr: "Day three production ship with a buddy. Everything else — laptop, access, intros — exists to unblock that, not to fill the week.",
    whyItMatters:
      "Hires who ship early ask better questions and build context from real code instead of slide decks. The runbook protects that outcome against process creep.",
    sections: [
      {
        heading: "1. Before day one",
        paragraphs: [
          "The buddy is assigned a week early and owns the checklist: laptop imaged, accounts provisioned, first ticket picked and scoped small.",
          "The hiring manager writes the day-three ship goal in the offer-acceptance week, while the role is still concrete.",
        ],
      },
      {
        heading: "2. The buddy contract",
        paragraphs: [
          "Buddies pair at least two hours a day for the first two weeks. Pairing time is calendar time, not spare time — it survives meeting conflicts.",
          "If the buddy goes on leave, ownership transfers explicitly in the runbook thread. There is no implicit backup.",
        ],
      },
    ],
    followups: [
      {
        short: "Day-three ship?",
        question: "What is the day-three ship rule?",
        answer:
          "Every hire ships to production by day three, paired with their buddy. Access and setup are preconditions for it, never the week's goal.",
      },
      {
        short: "Buddy duties?",
        question: "What does the buddy do?",
        answer:
          "At least two hours of pairing a day for two weeks, scheduled as real calendar time. Leave transfers ownership explicitly in the runbook thread.",
      },
      {
        short: "First ticket?",
        question: "Who picks the first ticket?",
        answer:
          "The buddy picks it a week before day one and scopes it small. The hiring manager writes the day-three goal even earlier.",
      },
    ],
  },
  {
    id: "security-checklist",
    title: "Security review checklist",
    source: "Engineering",
    authors: "S. Rao · Engineering",
    date: "July 2026",
    pages: 9,
    minutes: 6,
    progress: 1,
    read: true,
    starred: false,
    keywords: ["Security", "Review", "Engineering"],
    related: ["onboarding-runbook", "incident-postmortem"],
    intro:
      "Every launch passes this checklist. It is deliberately short: items that never fail were removed so the ones that matter get attention.",
    keyPassage:
      "Secrets live in the vault, never in code, config, or chat. A launch is blocked until the secret scan passes on the release branch.",
    tldr: "No secrets outside the vault, period. The release branch must pass the secret scan or the launch does not ship.",
    whyItMatters:
      "Leaked credentials are the one failure mode that is both common and entirely preventable. The checklist makes it a gate, not a guideline.",
    sections: [
      {
        heading: "1. Secrets and access",
        paragraphs: [
          "Service accounts get the narrowest scope that works, reviewed quarterly. Human access expires by default and is renewed on request.",
          "Third-party integrations are inventoried with their data access listed. Anything unlisted is treated as a finding.",
        ],
      },
      {
        heading: "2. Release gates",
        paragraphs: [
          "The secret scan, dependency audit, and migration dry-run must all pass on the exact commit being released — not on main, not yesterday.",
          "Exceptions need a dated waiver from the security owner with a remediation ticket linked.",
        ],
      },
    ],
    followups: [
      {
        short: "Secrets rule?",
        question: "What is the secrets rule?",
        answer:
          "Secrets live only in the vault — never code, config, or chat. The release branch must pass the secret scan or launch is blocked.",
      },
      {
        short: "Exceptions?",
        question: "Can checklist items be waived?",
        answer:
          "Yes, with a dated waiver from the security owner and a linked remediation ticket. Exceptions expire; they are not precedents.",
      },
      {
        short: "Third parties?",
        question: "How are integrations handled?",
        answer:
          "Every integration is inventoried with its data access listed. Anything unlisted counts as a finding, not an oversight.",
      },
    ],
  },
  {
    id: "pricing-memo",
    title: "Pricing memo",
    source: "Finance",
    authors: "L. Chen · Finance",
    date: "April 2026",
    pages: 15,
    minutes: 11,
    progress: 0,
    read: false,
    starred: false,
    keywords: ["Pricing", "GTM", "Finance"],
    related: ["refund-policy", "expense-guidelines"],
    intro:
      "How we charge, why each tier exists, and what discount authority each role holds. Written to end pricing debates in sales threads.",
    keyPassage:
      "Discounts above 15% need finance sign-off. Anything a rep concedes lives in the quote notes, because the next renewal negotiates against this deal, not the list price.",
    tldr: "Reps can discount up to 15% alone. Beyond that needs finance, and every concession must be written into the quote notes for renewal season.",
    whyItMatters:
      "Undocumented discounts compound at renewal. This memo makes the quote notes the system of record so renewals start from reality.",
    sections: [
      {
        heading: "1. Tiers and anchors",
        paragraphs: [
          "Three tiers, no custom middle. The middle tier is the anchor and should win most deals; if it does not, the tiers are wrong, not the reps.",
          "Annual billing is the default quote. Monthly is available at list and exists to lose comparisons gracefully.",
        ],
      },
      {
        heading: "2. Discount authority",
        paragraphs: [
          "Reps hold 15%, managers 25%, finance beyond that. Multi-year prepay can stack one extra band with finance approval.",
          "Discounts trade for something: term length, logo rights, or a case study. A discount for nothing is a price cut wearing a costume.",
        ],
      },
    ],
    followups: [
      {
        short: "Discount limits?",
        question: "Who can discount what?",
        answer:
          "Reps 15%, managers 25%, finance beyond. Multi-year prepay can add one band with finance approval — and every concession goes in the quote notes.",
      },
      {
        short: "Why quote notes?",
        question: "Why do concessions go in the quote notes?",
        answer:
          "Because renewals negotiate against the last deal, not list price. Undocumented discounts compound silently at renewal.",
      },
      {
        short: "Monthly billing?",
        question: "When is monthly billing quoted?",
        answer:
          "Annual is the default. Monthly exists at list price to lose comparisons gracefully, not to win them.",
      },
    ],
  },
  {
    id: "incident-postmortem",
    title: "Checkout outage postmortem",
    source: "Engineering",
    authors: "S. Rao · Engineering",
    date: "August 2026",
    pages: 11,
    minutes: 9,
    progress: 0.6,
    read: false,
    starred: true,
    keywords: ["Incident", "Postmortem", "Checkout"],
    related: ["security-checklist", "refund-policy"],
    intro:
      "Forty-one minutes of failed checkouts on August 14. What broke, what the timeline was, and the three fixes that prevent recurrence.",
    keyPassage:
      "The retry storm, not the deploy, caused the outage. A capped backoff with jitter would have held the failure to one region instead of cascading it globally.",
    tldr: "A deploy exposed a latent retry bug; unthrottled retries cascaded one region's failure worldwide. Fix: capped backoff with jitter plus per-region circuit breakers.",
    whyItMatters:
      "Every future reliability discussion references this incident. The lesson is architectural: retries are load, and unbounded load is an outage waiting for a trigger.",
    sections: [
      {
        heading: "1. Timeline",
        paragraphs: [
          "14:02 — deploy reaches the first region. Error budgets start burning within four minutes, but the alert threshold assumes a single-region fault.",
          "14:19 — retries from the affected region saturate the shared queue and the failure goes global. 14:43 — traffic shed, rollback complete.",
        ],
      },
      {
        heading: "2. Fixes",
        paragraphs: [
          "Capped exponential backoff with jitter on all checkout retries, enforced by the shared client library so services cannot opt out by accident.",
          "Per-region circuit breakers with independent error budgets, plus an alert threshold that counts regions, not just error rate.",
        ],
      },
    ],
    followups: [
      {
        short: "Root cause?",
        question: "What caused the outage?",
        answer:
          "Not the deploy itself — the retry storm it triggered. Unthrottled retries turned one region's failure into a global cascade over 41 minutes.",
      },
      {
        short: "The fixes?",
        question: "What are the three fixes?",
        answer:
          "Capped backoff with jitter in the shared client, per-region circuit breakers with independent budgets, and region-counting alert thresholds.",
      },
      {
        short: "Detection gap?",
        question: "Why was detection slow?",
        answer:
          "The alert threshold assumed single-region faults, so a burning error budget did not page until the failure had already gone global at 14:19.",
      },
    ],
  },
  {
    id: "expense-guidelines",
    title: "Expense guidelines",
    source: "Finance",
    authors: "L. Chen · Finance",
    date: "March 2026",
    pages: 7,
    minutes: 5,
    progress: 1,
    read: true,
    starred: false,
    keywords: ["Expenses", "Finance", "Policy"],
    related: ["onboarding-runbook", "pricing-memo"],
    intro:
      "Spend like it is your money, document like it is the company's. Two pages of rules and five of examples.",
    keyPassage:
      "Receipts are required above $25. Below that, a one-line description suffices — the finance team would rather read a sentence than chase a coffee receipt.",
    tldr: "Over $25 needs a receipt; under $25 needs one honest sentence. Reports are due within 30 days of month end.",
    whyItMatters:
      "Expense friction scales with headcount. These thresholds keep finance reviewable without turning every coffee into paperwork.",
    sections: [
      {
        heading: "1. Thresholds",
        paragraphs: [
          "Travel, client meals, and equipment follow the same $25 receipt rule. Anything above $500 needs pre-approval in the request thread.",
          "Reports close 30 days after month end. Late reports pause new pre-approvals until filed.",
        ],
      },
      {
        heading: "2. Judgment calls",
        paragraphs: [
          "When in doubt, write the sentence you would want to read in an audit. Vague descriptions get the report bounced; honest ones pass.",
          "Team events need a headcount and a per-person cost in the notes. No exceptions — this is the most common bounce reason.",
        ],
      },
    ],
    followups: [
      {
        short: "Receipt rule?",
        question: "When do I need a receipt?",
        answer:
          "Above $25. Below that, one honest sentence beats a coffee receipt — finance prefers reading to chasing.",
      },
      {
        short: "Pre-approval?",
        question: "What needs pre-approval?",
        answer:
          "Anything above $500, approved in the request thread first. Late reports pause further pre-approvals.",
      },
      {
        short: "Team events?",
        question: "What do team events need?",
        answer:
          "Headcount plus per-person cost in the notes, no exceptions. Missing it is the most common bounce reason.",
      },
    ],
  },
];

export function kbDocById(id: string): KbDoc {
  return kbDocs.find((d) => d.id === id) ?? kbDocs[0];
}

/** Local keyword match of a question to a doc's scripted follow-ups. */
export function kbMatchAnswer(doc: KbDoc, question: string): string {
  const words = question
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 3);
  let best: KbFollowup | null = null;
  let bestScore = 0;
  for (const f of doc.followups) {
    const hay = `${f.question} ${f.short} ${f.answer}`.toLowerCase();
    const score = words.filter((w) => hay.includes(w)).length;
    if (score > bestScore) {
      bestScore = score;
      best = f;
    }
  }
  if (best && bestScore > 0) return best.answer;
  return `I can answer from “${doc.title}” about: ${doc.followups.map((f) => f.short.toLowerCase()).join(", ")}. Pick one, or ask about another document in the library.`;
}

/** Scripted plain-terms explanation of a doc's key passage. No model calls. */
export function kbExplain(doc: KbDoc): string {
  return `${doc.tldr} ${doc.whyItMatters} The highlighted passage in the reader is the source — everything above traces back to it.`;
}

export function kbCitation(doc: KbDoc): string {
  return `${doc.title}. ${doc.source}, ${doc.date}. Company knowledge base.`;
}
