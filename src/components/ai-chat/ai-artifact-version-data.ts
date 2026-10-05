export interface ArtifactSection {
  id: string;
  title: string;
  text: string;
}
export interface ArtifactSnapshot {
  title: string;
  subtitle: string;
  sections: ArtifactSection[];
}
export interface ArtifactRevision {
  id: string;
  number: number;
  label: string;
  note: string;
  savedAt: string;
  author: string;
  parentId?: string;
  restoredFromId?: string;
  snapshot: ArtifactSnapshot;
}
export interface VersionedArtifact {
  id: string;
  filename: string;
  category: string;
  revisions: ArtifactRevision[];
}

const objective: ArtifactSection = {
  id: "objective",
  title: "Objective",
  text: "Help new teams reach their first shared result with less setup. The new onboarding checklist focuses on creating a project, inviting one teammate, and completing one shared task.",
};
const owners: ArtifactSection = {
  id: "owners",
  title: "Owners",
  text: "Product owns the decision to expand the rollout. Engineering owns the feature flag and event tracking. Support reviews the first-week questions and reports confusing steps.",
};
const pilotRollout: ArtifactSection = {
  id: "rollout",
  title: "Rollout",
  text: "Start with 20 new workspaces for two weeks. Keep the checklist behind a workspace flag and review session recordings before inviting a second cohort. Existing teams stay on their current flow.",
};
const metrics: ArtifactSection = {
  id: "metrics",
  title: "Success measures",
  text: "Track the share of teams that complete a shared task within seven days, time to first shared result, and support requests about setup. Compare with the previous onboarding flow; a faster setup alone is not enough to expand.",
};
const fallback: ArtifactSection = {
  id: "fallback",
  title: "Fallback and decision gate",
  text: "Keep the current setup flow available throughout the pilot. Pause expansion if teams lose access to required controls or support requests increase. The product owner reviews the evidence before each new cohort.",
};

export const initialVersionedArtifacts: VersionedArtifact[] = [
  {
    id: "rollout-brief",
    filename: "onboarding-rollout.md",
    category: "Product / Release plan",
    revisions: [
      {
        id: "brief-v1",
        number: 1,
        label: "First draft",
        note: "Established the rollout goal and owners.",
        savedAt: "10:02 AM",
        author: "Shadcnblocks AI",
        snapshot: {
          title: "Onboarding rollout",
          subtitle: "A shorter path to the first shared result",
          sections: [
            objective,
            {
              id: "rollout",
              title: "Rollout",
              text: "Introduce the new checklist to new teams after the next release. Start with a small group, gather feedback, and expand when the experience is stable.",
            },
            {
              id: "metrics",
              title: "Success measures",
              text: "Measure checklist completion and the time teams spend in setup. Review support questions after launch.",
            },
            owners,
          ],
        },
      },
      {
        id: "brief-v2",
        number: 2,
        label: "Pilot plan",
        note: "Defined the cohort, success measures, and fallback.",
        savedAt: "10:18 AM",
        author: "Maya Chen",
        parentId: "brief-v1",
        snapshot: {
          title: "Onboarding rollout",
          subtitle: "A two-week pilot with a clear decision gate",
          sections: [objective, pilotRollout, metrics, fallback, owners],
        },
      },
      {
        id: "brief-v3",
        number: 3,
        label: "Expanded launch",
        note: "Broadened the rollout and added a launch announcement.",
        savedAt: "10:42 AM",
        author: "Shadcnblocks AI",
        parentId: "brief-v2",
        snapshot: {
          title: "Onboarding rollout",
          subtitle: "A shorter setup for every new workspace",
          sections: [
            objective,
            {
              id: "rollout",
              title: "Rollout",
              text: "Enable the checklist for all new workspaces in the next release. Review the first week of usage and follow up with teams that do not complete the checklist. Existing teams stay on their current flow.",
            },
            metrics,
            {
              id: "announcement",
              title: "Launch announcement",
              text: "Publish the release note on launch day and send a short product email to new workspace owners. Link to the checklist and explain how to invite a teammate.",
            },
            owners,
          ],
        },
      },
    ],
  },
  {
    id: "customer-email",
    filename: "pilot-invitation.md",
    category: "Communications / Customer email",
    revisions: [
      {
        id: "email-v1",
        number: 1,
        label: "Initial invitation",
        note: "A short invitation to try the new onboarding flow.",
        savedAt: "9:30 AM",
        author: "Shadcnblocks AI",
        snapshot: {
          title: "Try a simpler start",
          subtitle: "A new way to set up your workspace",
          sections: [
            {
              id: "greeting",
              title: "Opening",
              text: "Hi there, we are trying a shorter onboarding flow and would love your feedback.",
            },
            {
              id: "body",
              title: "Invitation",
              text: "The new checklist guides you through creating a project, inviting a teammate, and finishing a shared task. Let us know if you would like to try it.",
            },
            {
              id: "closing",
              title: "Next step",
              text: "Reply to this email and we will enable the experience for your workspace.",
            },
          ],
        },
      },
      {
        id: "email-v2",
        number: 2,
        label: "Clearer next step",
        note: "Explained the pilot window and what feedback we need.",
        savedAt: "9:46 AM",
        author: "Maya Chen",
        parentId: "email-v1",
        snapshot: {
          title: "Help us improve your first week",
          subtitle: "Join a two-week onboarding pilot",
          sections: [
            {
              id: "greeting",
              title: "Opening",
              text: "Hi there, we are inviting a small group of teams to try a shorter path to their first shared task.",
            },
            {
              id: "body",
              title: "Invitation",
              text: "For two weeks, your workspace can try a checklist for creating a project, inviting a teammate, and completing a shared task. Your existing setup flow will remain available. We will ask which steps were clear and where you needed help.",
            },
            {
              id: "closing",
              title: "Next step",
              text: "Reply with your workspace name if you would like to join. We will confirm the start date and share a short guide before enabling the pilot.",
            },
          ],
        },
      },
    ],
  },
];

export function currentArtifactRevision(artifact: VersionedArtifact) {
  return artifact.revisions[artifact.revisions.length - 1];
}
export function artifactSnapshotEqual(
  a: ArtifactSnapshot,
  b: ArtifactSnapshot,
) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function restoreArtifactRevision(
  artifacts: VersionedArtifact[],
  artifactId: string,
  sourceId: string,
  expectedCurrentId: string,
  savedAt = "Just now",
) {
  const artifact = artifacts.find((item) => item.id === artifactId);
  if (!artifact) return artifacts;
  const current = currentArtifactRevision(artifact);
  const source = artifact.revisions.find(
    (revision) => revision.id === sourceId,
  );
  if (
    !source ||
    current.id !== expectedCurrentId ||
    artifactSnapshotEqual(source.snapshot, current.snapshot)
  )
    return artifacts;
  const number = current.number + 1;
  const revision: ArtifactRevision = {
    id: `${artifact.id}-v${number}`,
    number,
    label: `Restored from v${source.number}`,
    note: `Restored v${source.number} as a new version. All earlier versions are preserved.`,
    savedAt,
    author: "You",
    parentId: current.id,
    restoredFromId: source.id,
    snapshot: structuredClone(source.snapshot),
  };
  return artifacts.map((item) =>
    item.id === artifact.id
      ? { ...item, revisions: [...item.revisions, revision] }
      : item,
  );
}

export interface ArtifactDifference {
  id: string;
  title: string;
  before?: string;
  after?: string;
  kind: "added" | "removed" | "changed" | "unchanged";
}
export function compareArtifactSnapshots(
  before: ArtifactSnapshot,
  after: ArtifactSnapshot,
): ArtifactDifference[] {
  const beforeItems = [
    { id: "document-title", title: "Title", text: before.title },
    { id: "document-subtitle", title: "Subtitle", text: before.subtitle },
    ...before.sections,
  ];
  const afterItems = [
    { id: "document-title", title: "Title", text: after.title },
    { id: "document-subtitle", title: "Subtitle", text: after.subtitle },
    ...after.sections,
  ];
  const ids = [
    ...beforeItems.map((section) => section.id),
    ...afterItems.flatMap((section) => {
      if (!!beforeItems.some((item) => item.id === section.id)) return [];

      return [section.id];
    }),
  ];
  const differences: ArtifactDifference[] = ids.map((id) => {
    const previous = beforeItems.find((section) => section.id === id);
    const next = afterItems.find((section) => section.id === id);
    // Include a renamed heading in the comparison instead of silently treating its body as unchanged.
    const renamed = previous && next && previous.title !== next.title;
    const oldText = previous
      ? renamed
        ? `${previous.title}\n${previous.text}`
        : previous.text
      : undefined;
    const newText = next
      ? renamed
        ? `${next.title}\n${next.text}`
        : next.text
      : undefined;
    return {
      id,
      title: next?.title ?? previous!.title,
      before: oldText,
      after: newText,
      kind: !previous
        ? "added"
        : !next
          ? "removed"
          : oldText === newText
            ? "unchanged"
            : "changed",
    };
  });
  const commonBefore = before.sections.filter((section) =>
    after.sections.some((item) => item.id === section.id),
  );
  const commonAfter = after.sections.filter((section) =>
    before.sections.some((item) => item.id === section.id),
  );
  if (
    commonBefore.map((item) => item.id).join("|") !==
    commonAfter.map((item) => item.id).join("|")
  )
    differences.push({
      id: "section-order",
      title: "Section order",
      before: commonBefore.map((item) => item.title).join(" → "),
      after: commonAfter.map((item) => item.title).join(" → "),
      kind: "changed",
    });
  return differences;
}

export interface WordChange {
  text: string;
  kind: "same" | "added" | "removed";
}
export function artifactWordChanges(
  before: string,
  after: string,
): WordChange[] {
  const left = before.match(/\s+|[^\s]+/g) ?? [];
  const right = after.match(/\s+|[^\s]+/g) ?? [];
  const table = Array.from(
    { length: left.length + 1 },
    () => new Uint16Array(right.length + 1),
  );
  for (let i = left.length - 1; i >= 0; i--)
    for (let j = right.length - 1; j >= 0; j--)
      table[i][j] =
        left[i] === right[j]
          ? table[i + 1][j + 1] + 1
          : Math.max(table[i + 1][j], table[i][j + 1]);
  const chunks: WordChange[] = [];
  function add(text: string, kind: WordChange["kind"]) {
    const last = chunks[chunks.length - 1];
    if (last?.kind === kind) last.text += text;
    else chunks.push({ text, kind });
  }
  let i = 0,
    j = 0;
  while (i < left.length || j < right.length) {
    if (i < left.length && j < right.length && left[i] === right[j]) {
      add(left[i++], "same");
      j++;
    } else if (
      i < left.length &&
      (j === right.length || table[i + 1][j] >= table[i][j + 1])
    )
      add(left[i++], "removed");
    else add(right[j++], "added");
  }
  return chunks;
}

export function artifactMarkdown(revision: ArtifactRevision) {
  return `# ${revision.snapshot.title}\n\n${revision.snapshot.subtitle}\n\n${revision.snapshot.sections.map((section) => `## ${section.title}\n\n${section.text}`).join("\n\n")}\n`;
}
export function artifactDownloadName(
  artifact: VersionedArtifact,
  revision: ArtifactRevision,
) {
  return artifact.filename.replace(/\.md$/, `-v${revision.number}.md`);
}
