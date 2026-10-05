"use client";

import {
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  PanelRightClose,
  PanelRightOpen,
  RotateCcw,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { AiArtifactReviewConversation } from "@/components/ai-chat/ai-artifact-review-conversation";
import {
  type ArtifactDifference,
  artifactDownloadName,
  artifactMarkdown,
  artifactSnapshotEqual,
  artifactWordChanges,
  compareArtifactSnapshots,
  currentArtifactRevision,
  initialVersionedArtifacts,
  restoreArtifactRevision,
} from "@/components/ai-chat/ai-artifact-version-data";
import { AiCodingWorkspace } from "@/components/ai-chat/ai-coding-workspace";
import { AiWorkspaceShell } from "@/components/ai-chat/ai-workspace-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function DifferenceText({
  difference,
  side,
}: {
  difference: ArtifactDifference;
  side: "before" | "after";
}) {
  const value = difference[side];
  if (value === undefined)
    return (
      <p className="text-muted-foreground text-sm italic">
        No section in this version
      </p>
    );
  const chunks = artifactWordChanges(
    difference.before ?? "",
    difference.after ?? "",
  );
  return (
    <p className="text-sm leading-7 whitespace-pre-wrap">
      {chunks.map((chunk, index) => {
        if (
          (side === "before" && chunk.kind === "added") ||
          (side === "after" && chunk.kind === "removed")
        )
          return null;
        if (chunk.kind === "removed")
          return (
            <del
              key={index}
              className="bg-destructive/10 text-destructive decoration-destructive/50"
            >
              {chunk.text}
            </del>
          );
        if (chunk.kind === "added")
          return (
            <ins
              key={index}
              className="bg-success/10 text-success no-underline"
            >
              {chunk.text}
            </ins>
          );
        return <React.Fragment key={index}>{chunk.text}</React.Fragment>;
      })}
    </p>
  );
}

export function AiArtifactVersionScreen() {
  const [artifacts, setArtifacts] = React.useState(initialVersionedArtifacts);
  const [artifactId, setArtifactId] = React.useState("rollout-brief");
  const [selectedId, setSelectedId] = React.useState("brief-v3");
  const [baselineId, setBaselineId] = React.useState("brief-v2");
  const [reviewSession, setReviewSession] = React.useState(0);
  const [panelOpen, setPanelOpen] = React.useState(true);
  const [view, setView] = React.useState("compare");
  const [changesOnly, setChangesOnly] = React.useState(true);
  const [changeIndex, setChangeIndex] = React.useState(-1);
  const rows = React.useRef(new Map<string, HTMLElement>());
  const artifact = artifacts.find((item) => item.id === artifactId)!;
  const current = currentArtifactRevision(artifact);
  const selected = artifact.revisions.find((item) => item.id === selectedId)!;
  const baseline = artifact.revisions.find((item) => item.id === baselineId)!;
  const differences = compareArtifactSnapshots(
    baseline.snapshot,
    selected.snapshot,
  );
  const changed = differences.filter((item) => item.kind !== "unchanged");
  const matchesCurrent = artifactSnapshotEqual(
    current.snapshot,
    selected.snapshot,
  );

  function selectVersion(id: string) {
    setSelectedId(id);
    setBaselineId(
      id === current.id
        ? artifact.revisions[Math.max(0, artifact.revisions.length - 2)].id
        : current.id,
    );
    setChangeIndex(-1);
  }
  function restore() {
    const next = restoreArtifactRevision(
      artifacts,
      artifact.id,
      selected.id,
      current.id,
    );
    if (next === artifacts) return;
    setArtifacts(next);
    setSelectedId(
      currentArtifactRevision(next.find((item) => item.id === artifact.id)!).id,
    );
    setBaselineId(current.id);
    setChangeIndex(-1);
    toast.success(`Restored v${selected.number} as v${current.number + 1}`, {
      description: "All earlier versions are still available.",
    });
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(artifactMarkdown(selected));
      toast.success(`Copied v${selected.number}`);
    } catch {
      toast.error("Couldn't copy. Download this version instead.");
    }
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([artifactMarkdown(selected)], {
        type: "text/markdown;charset=utf-8",
      }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = artifactDownloadName(artifact, selected);
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function jump(direction: number) {
    const next =
      changeIndex < 0
        ? direction > 0
          ? 0
          : changed.length - 1
        : (changeIndex + direction + changed.length) % changed.length;
    setChangeIndex(next);
    const row = rows.current.get(changed[next].id);
    row?.scrollIntoView({ block: "center", behavior: "smooth" });
    row?.focus({ preventScroll: true });
  }
  const artifactPanel = (
    <Tabs
      value={view}
      onValueChange={setView}
      className="@container/versions flex min-h-0 min-w-0 flex-1 flex-col gap-0"
    >
      <header className="flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-2 border-b px-3 py-2">
        <Select value={selected.id} onValueChange={selectVersion}>
          <SelectTrigger
            aria-label="Version history"
            className="h-8 w-28 border-0 bg-transparent shadow-none"
          >
            <SelectValue>
              v{selected.number}
              {selected.id === current.id ? " · latest" : ""}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {[...artifact.revisions].reverse().map((revision) => (
                <SelectItem key={revision.id} value={revision.id}>
                  v{revision.number} · {revision.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1">
          <TabsList aria-label="Artifact view">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="compare">Compare</TabsTrigger>
          </TabsList>
          {selected.id !== current.id && (
            <Button
              size="sm"
              variant="outline"
              disabled={matchesCurrent}
              onClick={restore}
            >
              {matchesCurrent
                ? "Matches current"
                : `Restore as v${current.number + 1}`}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Copy version ${selected.number}`}
            onClick={copy}
          >
            <Copy />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Download version ${selected.number}`}
            onClick={download}
          >
            <Download />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Close artifact"
            onClick={() => setPanelOpen(false)}
          >
            <PanelRightClose />
          </Button>
        </div>
      </header>
      <TabsContent
        value="preview"
        className="mt-0 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden"
      >
        <ScrollArea className="bg-muted/30 min-h-0 flex-1">
          <div className="px-4 py-6 sm:px-8 sm:py-8">
            <article className="bg-background mx-auto max-w-3xl rounded-xl border px-6 py-8 sm:px-12 sm:py-12">
              <p className="text-muted-foreground text-xs">
                {artifact.category}
              </p>
              <h1 className="mt-5 text-3xl leading-tight font-semibold tracking-tight">
                {selected.snapshot.title}
              </h1>
              <p className="text-muted-foreground mt-3 text-base leading-7">
                {selected.snapshot.subtitle}
              </p>
              <div className="mt-8 space-y-7 border-t pt-8">
                {selected.snapshot.sections.map((section) => (
                  <section key={section.id}>
                    <h2 className="text-sm font-semibold">{section.title}</h2>
                    <p className="text-muted-foreground mt-2 text-sm leading-7">
                      {section.text}
                    </p>
                  </section>
                ))}
              </div>
              <p className="text-muted-foreground mt-10 border-t pt-5 text-xs">
                {artifact.filename} · Version {selected.number}
              </p>
            </article>
          </div>
        </ScrollArea>
      </TabsContent>
      <TabsContent
        value="compare"
        className="mt-0 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden"
      >
        <ScrollArea className="bg-muted/30 min-h-0 flex-1">
          <div className="px-4 py-6 sm:px-8 sm:py-8">
            <div className="bg-background @container/comparison mx-auto max-w-3xl overflow-hidden rounded-xl border">
              <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">Compare</span>
                  <Select
                    value={baselineId}
                    onValueChange={(id) => {
                      setBaselineId(id);
                      setChangeIndex(-1);
                    }}
                  >
                    <SelectTrigger
                      aria-label="Compare from version"
                      className="h-7 w-16 border-0 bg-transparent px-1 shadow-none"
                    >
                      <SelectValue>v{baseline.number}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {artifact.revisions.map((revision) => (
                          <SelectItem key={revision.id} value={revision.id}>
                            v{revision.number} · {revision.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <span className="text-muted-foreground text-xs">
                    → v{selected.number}
                  </span>
                  <p
                    className="text-muted-foreground ml-2 text-[11px]"
                    aria-live="polite"
                  >
                    {changed.length} changes
                    {changeIndex >= 0
                      ? ` · ${changeIndex + 1} of ${changed.length}`
                      : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="changes-only"
                    checked={changesOnly}
                    onCheckedChange={(checked) =>
                      setChangesOnly(checked === true)
                    }
                    className="size-3.5"
                  />
                  <Label htmlFor="changes-only" className="text-xs">
                    Changes only
                  </Label>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    disabled={!changed.length}
                    aria-label="Previous change"
                    onClick={() => jump(-1)}
                  >
                    <ChevronUp />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    disabled={!changed.length}
                    aria-label="Next change"
                    onClick={() => jump(1)}
                  >
                    <ChevronDown />
                  </Button>
                </div>
              </div>
              {!changed.length && (
                <div className="bg-background mb-4 rounded-lg border px-6 py-10 text-center">
                  <h2 className="text-sm font-medium">
                    No changes between these versions
                  </h2>
                  <p className="text-muted-foreground mt-2 text-xs">
                    Choose another version to compare its content.
                  </p>
                </div>
              )}
              <div className="divide-y">
                {differences
                  .filter((item) => !changesOnly || item.kind !== "unchanged")
                  .map((difference) => (
                    <section
                      key={difference.id}
                      tabIndex={-1}
                      ref={(node) => {
                        if (node) rows.current.set(difference.id, node);
                        else rows.current.delete(difference.id);
                      }}
                      className="bg-background focus:ring-ring overflow-hidden outline-none focus:ring-2 focus:ring-inset"
                    >
                      <header className="flex items-center justify-between gap-3 px-5 pt-5 pb-2">
                        <h2 className="text-xs font-medium">
                          {difference.title}
                        </h2>
                        <Badge
                          variant="outline"
                          className="text-[10px] capitalize"
                        >
                          {difference.kind}
                        </Badge>
                      </header>
                      <div className="grid @[500px]/comparison:grid-cols-2">
                        <div className="border-b p-4 @[500px]/comparison:border-r @[500px]/comparison:border-b-0">
                          <p className="text-muted-foreground mb-3 text-[11px]">
                            FROM · v{baseline.number}
                          </p>
                          <DifferenceText
                            difference={difference}
                            side="before"
                          />
                        </div>
                        <div className="p-4">
                          <p className="text-muted-foreground mb-3 text-[11px]">
                            TO · v{selected.number}
                          </p>
                          <DifferenceText
                            difference={difference}
                            side="after"
                          />
                        </div>
                      </div>
                    </section>
                  ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
  return (
    <AiWorkspaceShell
      headerTitle="Artifact review"
      hideNavigationSidebar
      headerActions={
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPanelOpen((value) => !value)}
          >
            <PanelRightOpen />
            {panelOpen ? "Hide artifact" : "Open artifact"}
          </Button>
          <span className="text-muted-foreground hidden text-xs sm:inline">
            Demo · saved in this session
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Reset version demo"
            onClick={() => {
              setReviewSession((value) => value + 1);
              setArtifacts(initialVersionedArtifacts);
              setArtifactId("rollout-brief");
              setSelectedId("brief-v3");
              setBaselineId("brief-v2");
              setView("compare");
              setChangeIndex(-1);
              setChangesOnly(true);
            }}
          >
            <RotateCcw />
          </Button>
        </>
      }
    >
      <AiCodingWorkspace
        defaultPanelWidthPercent={60}
        codePanelOpen={panelOpen}
        onCodePanelOpenChange={setPanelOpen}
        panelTitle="Artifact review"
        codePanel={artifactPanel}
        chat={
          <AiArtifactReviewConversation
            key={`${artifact.id}-${reviewSession}`}
            artifact={artifact}
            selected={selected}
            baseline={baseline}
            current={current}
            onCompare={() => {
              setView("compare");
              setPanelOpen(true);
            }}
          />
        }
      />
    </AiWorkspaceShell>
  );
}
