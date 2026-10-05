"use client";
import {
  Check,
  CircleHelp,
  Download,
  Minus,
  TriangleAlert,
} from "lucide-react";
import * as React from "react";

import { AiWorkspaceShell } from "@/components/ai-chat/ai-workspace-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { recordValue } from "@/lib/record-value";
import { cn } from "@/lib/utils";

type Position = "supports" | "conflicts" | "qualifies" | "absent";
type Evidence = { position: Position; quote: string; note: string };
const columns = ["Customer interviews", "Support review", "Design proposal"];
const rows: { claim: string; evidence: Evidence[] }[] = [
  {
    claim: "Import a document before introducing collaboration",
    evidence: [
      {
        position: "supports",
        quote:
          "Participants wanted something worth sharing before they invited a colleague.",
        note: "The interview sample favors content before invitations.",
      },
      {
        position: "qualifies",
        quote:
          "People joining an established team already had shared content waiting for them.",
        note: "The proposed sequence may only fit people creating a new workspace.",
      },
      {
        position: "supports",
        quote:
          "Begin with a document, then offer sharing as the next useful action.",
        note: "The proposal follows the same sequence; it is a hypothesis, not independent validation.",
      },
    ],
  },
  {
    claim: "Require a team invitation to finish setup",
    evidence: [
      {
        position: "conflicts",
        quote:
          "Solo participants wanted to explore before deciding who else should join.",
        note: "A required invitation prevents these participants from completing setup.",
      },
      {
        position: "conflicts",
        quote:
          "Individual accounts asked how to skip the team invitation step.",
        note: "Support notes identify friction with mandatory invitations.",
      },
      {
        position: "supports",
        quote:
          "The initial concept makes one teammate invitation the last required setup step.",
        note: "This earlier design concept conflicts with the observed needs. Resolve before implementation.",
      },
    ],
  },
  {
    claim: "Show document visibility before sending invitations",
    evidence: [
      {
        position: "supports",
        quote:
          "Before sharing, participants checked whether others could see the whole workspace.",
        note: "Audience uncertainty appears at the sharing decision.",
      },
      {
        position: "supports",
        quote:
          "Questions about private versus shared files recur in invitation requests.",
        note: "Support themes reinforce the need for explicit permission language.",
      },
      {
        position: "supports",
        quote: "Show an audience preview alongside the invitation action.",
        note: "The proposal addresses the same visibility concern.",
      },
    ],
  },
  {
    claim: "A guided tour improves first-week retention",
    evidence: [
      {
        position: "absent",
        quote: "",
        note: "Interviews did not measure first-week retention or compare guided tours.",
      },
      {
        position: "absent",
        quote: "",
        note: "Support themes contain no retention measurements.",
      },
      {
        position: "qualifies",
        quote:
          "A short tour might help unfamiliar users; test it against learning through real work.",
        note: "This is a testable hypothesis. It does not establish a retention benefit.",
      },
    ],
  },
];
const labels: Record<Position, string> = {
  supports: "Supports",
  conflicts: "Conflicts",
  qualifies: "Qualifies",
  absent: "No evidence",
};
const icons = {
  supports: Check,
  conflicts: TriangleAlert,
  qualifies: CircleHelp,
  absent: Minus,
};
function verdict(row: (typeof rows)[number]) {
  return row.evidence.some((e) => e.position === "conflicts")
    ? "Conflict"
    : row.evidence.every((e) => e.position === "supports")
      ? "Agreement"
      : row.evidence.some((e) => e.position === "absent")
        ? "Evidence gap"
        : "Qualified";
}

export function AiEvidenceComparisonMatrixScreen() {
  const [filter, setFilter] = React.useState("All claims");
  const [reviewed, setReviewed] = React.useState<string[]>([]);
  const [selection, setSelection] = React.useState({
    claim: rows[1].claim,
    column: 0,
  });
  const selectedRow = rows.find((row) => row.claim === selection.claim)!;
  const visible = rows.filter(
    (row) => filter === "All claims" || verdict(row) === filter,
  );
  function exportMatrix() {
    const text = [
      "# Onboarding evidence comparison",
      "Fictional demo evidence; not live research.",
      ...rows.map(
        (row) =>
          `## ${row.claim}\n${verdict(row)}\n${row.evidence.map((e, i) => `- ${columns[i]}: ${labels[e.position]}. ${e.note}${e.quote ? `\n  > ${e.quote}` : ""}`).join("\n")}`,
      ),
    ].join("\n\n");
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/markdown;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "evidence-comparison.md";
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <AiWorkspaceShell
      headerTitle="Evidence comparison"
      hideNavigationSidebar
      headerActions={
        <>
          <Badge variant="outline">Demo evidence</Badge>
          <Button size="sm" variant="outline" onClick={exportMatrix}>
            <Download />
            Export matrix
          </Button>
        </>
      }
    >
      <div className="flex-1 overflow-auto p-6 lg:p-9">
        <div className="mb-5 max-w-2xl">
          <p className="text-muted-foreground mb-3 text-xs font-medium tracking-widest uppercase">
            Onboarding study / Evidence review
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Where do the sources agree?
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Scan the pattern. Select a claim to read the sources together.
          </p>
        </div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-1" aria-label="Filter claims">
            {[
              "All claims",
              "Conflict",
              "Agreement",
              "Qualified",
              "Evidence gap",
            ].map((item) => (
              <Button
                key={item}
                size="sm"
                variant={filter === item ? "secondary" : "ghost"}
                aria-pressed={filter === item}
                onClick={() => {
                  setFilter(item);
                  const first = rows.find(
                    (row) => item === "All claims" || verdict(row) === item,
                  );
                  if (first) setSelection({ claim: first.claim, column: 0 });
                }}
              >
                {item}
              </Button>
            ))}
          </div>
          <p className="text-muted-foreground text-xs" aria-live="polite">
            {reviewed.length} of 12 cells reviewed
          </p>
        </div>
        <div className="max-h-[460px] overflow-auto rounded-lg border">
          <table className="w-full min-w-[840px] border-collapse text-sm">
            <caption className="sr-only">
              Onboarding claims and supporting or conflicting evidence from
              three demo sources
            </caption>
            <thead>
              <tr className="bg-muted/40 border-b">
                <th
                  scope="col"
                  className="bg-background sticky top-0 left-0 z-20 w-[30%] px-4 py-3 text-left font-medium"
                >
                  Claim / assessment
                </th>
                {columns.map((column, i) => (
                  <th
                    key={column}
                    scope="col"
                    className="bg-background sticky top-0 z-10 border-l px-4 py-3 text-left font-medium"
                  >
                    <span className="text-muted-foreground mb-2 block font-mono text-xs">
                      {i === 2
                        ? "PROPOSAL · NOT INDEPENDENT EVIDENCE"
                        : `OBSERVED SOURCE 0${i + 1}`}
                    </span>
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.claim} className="border-b last:border-b-0">
                  <th
                    scope="row"
                    className={cn(
                      "bg-background sticky left-0 z-10 px-4 py-3 text-left align-top font-normal",
                      selection.claim === row.claim && "bg-accent",
                    )}
                  >
                    <span className="block max-w-60 leading-6 font-medium">
                      {row.claim}
                    </span>
                    <Badge
                      variant="outline"
                      className="mt-2 text-[10px] font-normal"
                    >
                      {verdict(row)}
                    </Badge>
                  </th>
                  {row.evidence.map((e, i) => {
                    const Icon = icons[e.position];
                    const key = `${row.claim}-${i}`;
                    return (
                      <td key={i} className="border-l p-2 align-top">
                        <button
                          aria-label={`Inspect ${columns[i]} for ${row.claim}`}
                          aria-pressed={
                            selection.claim === row.claim &&
                            selection.column === i
                          }
                          onClick={() =>
                            setSelection({ claim: row.claim, column: i })
                          }
                          className={cn(
                            "hover:bg-muted focus-visible:outline-ring flex min-h-24 w-full flex-col rounded-md p-3 text-left transition-colors focus-visible:outline-2",
                            e.position === "conflicts" && "bg-destructive/5",
                            selection.claim === row.claim &&
                              selection.column === i &&
                              "ring-1 ring-blue-500/50",
                          )}
                        >
                          <span
                            className={cn(
                              "flex items-center gap-2 text-xs font-medium",
                              e.position === "conflicts" && "text-destructive",
                            )}
                          >
                            <Icon className="size-4" />
                            {labels[e.position]}
                            {reviewed.includes(key) && (
                              <span className="text-muted-foreground ml-auto text-[10px]">
                                Reviewed
                              </span>
                            )}
                          </span>
                          <span className="text-muted-foreground mt-2 line-clamp-2 text-xs leading-5">
                            {e.quote || e.note}
                          </span>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <section
          className="mt-5 rounded-xl border"
          aria-label="Selected claim evidence"
        >
          <div className="bg-muted/20 flex flex-wrap items-center justify-between gap-2 border-b px-5 py-3">
            <div>
              <p className="text-muted-foreground mb-1 text-[10px] tracking-wider uppercase">
                Read the sources together
              </p>
              <h2 className="text-sm font-semibold">{selectedRow.claim}</h2>
            </div>
            <Badge variant="outline">{verdict(selectedRow)}</Badge>
          </div>
          <div className="grid divide-y lg:grid-cols-3 lg:divide-x lg:divide-y-0">
            {selectedRow.evidence.map((e, i) => {
              const Icon = icons[e.position];
              const key = `${selectedRow.claim}-${i}`;
              return (
                <article
                  key={key}
                  className={cn(
                    "flex flex-col p-5",
                    selection.column === i && "bg-blue-500/5",
                  )}
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h3 className="text-xs font-medium">{columns[i]}</h3>
                    <span
                      className={cn(
                        "flex items-center gap-1 text-[10px]",
                        e.position === "conflicts" && "text-destructive",
                      )}
                    >
                      <Icon className="size-3" />
                      {labels[e.position]}
                    </span>
                  </div>
                  {e.quote ? (
                    <blockquote className="border-l-2 pl-3 text-[13px] leading-6">
                      {e.quote}
                    </blockquote>
                  ) : null}
                  <p className="text-muted-foreground mt-3 text-xs leading-5">
                    {e.note}
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="mt-3 self-start text-xs"
                    aria-label={`Mark ${columns[i]} as reviewed`}
                    disabled={reviewed.includes(key)}
                    onClick={() =>
                      setReviewed((current) =>
                        current.includes(key) ? current : [...current, key],
                      )
                    }
                  >
                    {reviewed.includes(key) ? (
                      <>
                        <Check /> Reviewed
                      </>
                    ) : (
                      "Mark as reviewed"
                    )}
                  </Button>
                </article>
              );
            })}
          </div>
        </section>
        <div className="text-muted-foreground mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs">
          {Object.entries(labels).map(([key, label]) => {
            const Icon = recordValue(icons, key);
            if (!Icon) return null;
            return (
              <span key={key} className="flex items-center gap-2">
                <Icon className="size-3.5" />
                {label}
              </span>
            );
          })}
        </div>
        <p className="text-muted-foreground mt-6 max-w-2xl text-xs leading-5">
          Agreement shows alignment within this sample, not proof. The design
          proposal is a hypothesis and is not independent research evidence.
        </p>
      </div>
    </AiWorkspaceShell>
  );
}
