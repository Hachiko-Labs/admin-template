"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { AiWorkspaceShell } from "@/components/ai-chat/ai-workspace-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import s from "./styles.module.css";

const cases = [
  {
    id: "RV-1042",
    subject: "Inviting teammates to a workspace",
    name: "Maya Chen",
    initials: "MC",
    company: "Northstar Studio",
    time: "10:42 AM",
    topic: "Workspace access",
    question:
      "I’m the owner of our design workspace, but not an organization admin. Can I invite two contractors to just this workspace?",
    answer:
      "Only organization administrators can invite new members. Ask your organization admin to open Settings → Members and send invitations to the contractors. Once they join, your admin can add them to the design workspace.",
    followup:
      "Does that mean I need to contact our IT team every time? I thought workspace owners could manage their own members.",
    source: "Invite people to a workspace",
    section: "Roles & permissions / Workspace members",
    evidence:
      "Workspace owners and organization administrators can invite people to a workspace. Owners can invite members and guests to workspaces they own. Guest access is limited to the selected workspace and does not grant access to other organization resources.",
    updated: "Sep 12, 2026",
    correction:
      "As the workspace owner, you can invite both contractors directly. Open your workspace, go to Settings → Members, and choose Invite people. Select Guest to limit their access to this workspace. You don’t need an organization administrator to do this.",
    flag: "Customer questioned the answer",
    confidence: "Source contradicts the stated permission requirement.",
  },
  {
    id: "RV-1043",
    subject: "A duplicate charge on a monthly plan",
    name: "Daniel Park",
    initials: "DP",
    company: "Forma Labs",
    time: "10:38 AM",
    topic: "Billing",
    question:
      "There are two $129 charges for our subscription this month. Can you reverse the duplicate?",
    answer:
      "I can help you check the duplicate charge. Please share the two transaction dates and the last four digits of the payment method. Don’t send your full card number. Once we confirm a duplicate settled payment, we can refund it to the original payment method.",
    followup:
      "Both are from September 17, ending in 4242. Thank you for checking.",
    source: "Duplicate subscription payments",
    section: "Billing / Refunds",
    evidence:
      "Verify both transaction IDs and confirm that both payments have settled. Refund a confirmed duplicate to the original payment method. An authorization hold is not a settled charge. Never request a full card number or card security code.",
    updated: "Sep 9, 2026",
    correction: "",
    flag: "Sampled for quality review",
    confidence:
      "Check whether the response asks for enough information to verify a duplicate.",
  },
  {
    id: "RV-1044",
    subject: "Exporting a customer report",
    name: "Leah Ortiz",
    initials: "LO",
    company: "Fieldwork",
    time: "10:31 AM",
    topic: "Data exports",
    question: "Can I export all 3,120 customers to our Tableau workspace?",
    answer:
      "Yes. Open Customers, select all records, and choose Export → Tableau. The full dataset will be sent immediately to your connected workspace.",
    followup:
      "The export is showing ‘Needs review’ instead. Is something wrong?",
    source: "Customer data export policy",
    section: "Security / Data handling",
    evidence:
      "Exports of more than 700 customer records require approval before data leaves the reporting workspace. A pending approval displays Needs review. The export resumes after an authorized reviewer approves the request.",
    updated: "Sep 15, 2026",
    correction:
      "You can request the export, but 3,120 records exceeds the 700-record approval threshold. ‘Needs review’ is expected. An authorized reviewer needs to approve it before the data is sent to Tableau.",
    flag: "Policy mismatch detected",
    confidence:
      "The answer promises an immediate export without mentioning approval.",
  },
  {
    id: "RV-1045",
    subject: "Finding a previous version of a report",
    name: "Sam Rivera",
    initials: "SR",
    company: "Common Ground",
    time: "10:24 AM",
    topic: "Documents",
    question:
      "I replaced a section of our quarterly report by mistake. Can I get yesterday’s version back?",
    answer:
      "Open the report and select Version history from the document menu. Choose yesterday’s version to preview it, then select Restore. Restoring creates a new version, so your current draft remains available in the history.",
    followup: "Found it. That’s exactly what I needed.",
    source: "Restore a document version",
    section: "Documents / Version history",
    evidence:
      "Select a saved version to preview its contents. Restore creates a new current version using the selected content. Existing versions, including the draft that was current before restoration, remain in the history.",
    updated: "Sep 7, 2026",
    correction: "",
    flag: "Sampled for quality review",
    confidence:
      "Check the restore behavior against the document history guide.",
  },
];
type Review = {
  accuracy: string;
  resolution: string;
  correction: string;
  notes: string;
  saved: boolean;
};
const empty = (): Review => ({
  accuracy: "",
  resolution: "",
  correction: "",
  notes: "",
  saved: false,
});

export function ResponseReview() {
  const [index, setIndex] = useState(0);
  const [reviews, setReviews] = useState<Record<string, Review>>({});
  const [sourceOpen, setSourceOpen] = useState(true);
  const [notice, setNotice] = useState("");
  const [finished, setFinished] = useState(false);
  const item = cases[index];
  const review = reviews[item.id] ?? empty();
  const completed = Object.values(reviews).filter((r) => r.saved).length;
  const update = (patch: Partial<Review>) => {
    setFinished(false);
    setReviews((all) => ({
      ...all,
      [item.id]: {
        ...review,
        ...patch,
        correction:
          (patch.accuracy ?? review.accuracy) === "Accurate"
            ? ""
            : (patch.correction ?? review.correction),
        saved: false,
      },
    }));
    setNotice("");
  };
  function navigate(next: number) {
    setIndex(next);
    setNotice("");
    setFinished(false);
  }
  function save() {
    if (!review.accuracy || !review.resolution) {
      setNotice("Choose an accuracy rating and a resolution before saving.");
      return;
    }
    if (review.accuracy !== "Accurate" && !review.correction.trim()) {
      setNotice("Add a corrected answer for the evaluation dataset.");
      return;
    }
    const nextReviews = {
      ...reviews,
      [item.id]: {
        ...review,
        correction: review.accuracy === "Accurate" ? "" : review.correction,
        saved: true,
      },
    };
    setReviews(nextReviews);
    const next = cases.findIndex(
      (c, i) => i > index && !nextReviews[c.id]?.saved,
    );
    const remaining =
      next >= 0 ? next : cases.findIndex((c) => !nextReviews[c.id]?.saved);
    if (remaining >= 0) {
      setIndex(remaining);
      setNotice(`${item.id} saved. Next response ready.`);
    } else {
      setFinished(true);
      setNotice(
        "All responses reviewed. Your annotations are ready to export.",
      );
    }
  }
  function exportReviews() {
    const records = cases
      .filter((c) => reviews[c.id]?.saved)
      .map((c) => ({
        id: c.id,
        input: c.question,
        output: c.answer,
        source: c.source,
        ...reviews[c.id],
        correction:
          reviews[c.id].accuracy === "Accurate" ? "" : reviews[c.id].correction,
      }));
    const url = URL.createObjectURL(
      new Blob([records.map((r) => JSON.stringify(r)).join("\n")], {
        type: "application/x-ndjson",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "support-response-reviews.jsonl";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <AiWorkspaceShell hideNavigationSidebar headerTitle="Response review">
      <div className={s.screen}>
        <header className={s.queueHeader}>
          <div>
            <Link href="/ai-chat/evaluations" className={s.breadcrumb}>
              Evaluations <span>/</span> Review queues
            </Link>
            <h1>
              Support answer quality{" "}
              <span className={s.queueBadge}>Manual review</span>
            </h1>
            <p>
              Review answers against workspace knowledge before adding them to
              the support dataset.
            </p>
          </div>
          <div className={s.progress}>
            <span>
              <strong>{completed}</strong> of {cases.length} reviewed
            </span>
            <div>
              <span style={{ width: `${(completed / cases.length) * 100}%` }} />
            </div>
          </div>
        </header>
        <div className={s.toolbar}>
          <div className={s.caseSelector}>
            <span className={s.label}>Response</span>
            <select
              aria-label="Select response"
              value={index}
              onChange={(e) => navigate(Number(e.target.value))}
            >
              {cases.map((c, i) => (
                <option key={c.id} value={i}>
                  {c.id}
                  {reviews[c.id]?.saved ? " · Reviewed" : " · To review"}
                </option>
              ))}
            </select>
            <span className={s.toolbarTopic}>{item.topic}</span>
          </div>
          <div className={s.paging}>
            <span>
              {index + 1} / {cases.length}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Previous response"
              disabled={index === 0}
              onClick={() => navigate(index - 1)}
            >
              <ArrowLeft />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Next response"
              disabled={index === cases.length - 1}
              onClick={() => navigate(index + 1)}
            >
              <ArrowRight />
            </Button>
          </div>
        </div>
        <div className={s.workspace}>
          <div className={s.evidence}>
            <div className={s.conversationHeading}>
              <div>
                <span className={s.label}>Conversation</span>
                <h2>{item.subject}</h2>
              </div>
              <span className={s.channel}>Web chat</span>
            </div>
            <div className={s.customer}>
              <span className={s.avatar}>{item.initials}</span>
              <div>
                <strong>{item.name}</strong>
                <p>{item.company}</p>
              </div>
              <time>{item.time}</time>
            </div>
            <div className={s.messages}>
              <div className={s.message}>
                <span className={s.speaker}>{item.name.split(" ")[0]}</span>
                <p>{item.question}</p>
              </div>
              <div className={s.answer}>
                <div className={s.answerHeading}>
                  <strong>Support assistant</strong>
                  <span>Answer under review</span>
                </div>
                <p>{item.answer}</p>
                <button
                  className={s.citation}
                  onClick={() => {
                    setSourceOpen(true);
                    document.getElementById("review-source")?.scrollIntoView({
                      behavior: "smooth",
                      block: "nearest",
                    });
                  }}
                >
                  <FileText size={12} /> {item.source} <span>1</span>
                </button>
              </div>
              <div className={s.message}>
                <span className={s.speaker}>{item.name.split(" ")[0]}</span>
                <p>{item.followup}</p>
              </div>
            </div>
            <section id="review-source" className={s.source}>
              <button
                className={s.sourceToggle}
                aria-expanded={sourceOpen}
                onClick={() => setSourceOpen(!sourceOpen)}
              >
                <span>
                  Source evidence <span className={s.sourceCount}>1</span>
                </span>
                <ChevronDown
                  size={14}
                  style={{
                    transform: sourceOpen ? "rotate(180deg)" : undefined,
                  }}
                />
              </button>
              {sourceOpen && (
                <div className={s.sourceBody}>
                  <div className={s.sourceTitle}>
                    <FileText size={16} />
                    <div>
                      <h3>{item.source}</h3>
                      <p>{item.section}</p>
                    </div>
                  </div>
                  <blockquote>{item.evidence}</blockquote>
                  <div className={s.sourceFooter}>
                    <span>Knowledge base</span>
                    <span>Updated {item.updated}</span>
                  </div>
                </div>
              )}
            </section>
          </div>
          <aside className={s.review} aria-label="Review response">
            <div className={s.reviewHeading}>
              <h2>Your review</h2>
              <span>{review.saved ? "Saved" : "Not submitted"}</span>
            </div>
            <div className={s.reviewContent}>
              <div className={s.reason}>
                <strong>{item.flag}</strong>
                <p>{item.confidence}</p>
              </div>
              <fieldset className={s.field}>
                <legend>Is the answer accurate?</legend>
                <p>Compare factual claims with the source.</p>
                <div className={s.options}>
                  {["Accurate", "Partly accurate", "Incorrect"].map((value) => (
                    <button
                      key={value}
                      aria-pressed={review.accuracy === value}
                      onClick={() => update({ accuracy: value })}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset className={s.field}>
                <legend>Did it resolve the request?</legend>
                <div className={s.options}>
                  {["Resolved", "Partially", "Unresolved"].map((value) => (
                    <button
                      key={value}
                      aria-pressed={review.resolution === value}
                      onClick={() => update({ resolution: value })}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </fieldset>
              {review.accuracy && review.accuracy !== "Accurate" && (
                <div className={s.field}>
                  <label htmlFor="corrected-answer">Corrected answer</label>
                  <p>This becomes the expected answer in the dataset.</p>
                  <Textarea
                    id="corrected-answer"
                    value={review.correction}
                    onChange={(e) => update({ correction: e.target.value })}
                    placeholder="Write the answer the assistant should have given…"
                    rows={5}
                  />
                  {item.correction && (
                    <button
                      className={s.textButton}
                      onClick={() => update({ correction: item.correction })}
                    >
                      Use source-based correction
                    </button>
                  )}
                </div>
              )}
              <div className={s.field}>
                <label htmlFor="review-notes">
                  Reviewer notes <span>Optional</span>
                </label>
                <Textarea
                  id="review-notes"
                  value={review.notes}
                  onChange={(e) => update({ notes: e.target.value })}
                  placeholder="What should we improve?"
                  rows={3}
                />
              </div>
              <div className={s.destination}>
                <span className={s.label}>Save to dataset</span>
                <strong>Customer support · September review</strong>
                <p>Includes the response, source, and your annotations.</p>
              </div>
            </div>
            <footer className={s.reviewFooter}>
              <p role="status">
                {notice ||
                  (review.saved
                    ? "Review saved for this response."
                    : "Your review stays editable after saving.")}
              </p>
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={cases.length === 1}
                  onClick={() => navigate((index + 1) % cases.length)}
                >
                  Skip for now
                </Button>
                {finished && review.saved ? (
                  <Button size="sm" onClick={exportReviews}>
                    Export reviews <ArrowRight />
                  </Button>
                ) : (
                  <Button size="sm" onClick={save}>
                    {review.saved ? "Save changes" : "Save and next"} <Check />
                  </Button>
                )}
              </div>
            </footer>
          </aside>
        </div>
      </div>
    </AiWorkspaceShell>
  );
}
