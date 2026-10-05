"use client";

import {
  Check,
  Code2,
  Copy,
  FileDiff,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import * as React from "react";

import { AiCodeView } from "@/components/ai-chat/ai-code-view";
import {
  type AiDemoCodeFile,
  aiDemoFiles,
} from "@/components/ai-chat/ai-coding-demo-data";
import { AiRepositoryTree } from "@/components/ai-chat/ai-repository-tree";
import { Button } from "@/components/ui/button";
import { recordValue } from "@/lib/record-value";
import { cn } from "@/lib/utils";

export type AiCodePanelMode = "code" | "diff";

interface AiCodeArtifactPanelProps {
  mode: AiCodePanelMode;
  onClose: () => void;
  onModeChange: (mode: AiCodePanelMode) => void;
  onSelectFile: (path: string) => void;
  selectedFile: string;
}

function FileStats({ file }: { file: AiDemoCodeFile }) {
  if (file.additions === 0 && file.deletions === 0) return null;

  return (
    <span className="flex shrink-0 items-center gap-1.5 text-[11px] tabular-nums">
      <span className="text-emerald-600">+{file.additions}</span>
      {file.deletions ? (
        <span className="text-red-500">−{file.deletions}</span>
      ) : null}
    </span>
  );
}

const changedFiles = Object.values(aiDemoFiles).filter(
  (file) => file.status !== "unchanged",
);
const repositoryStats = {
  additions: changedFiles.reduce((total, file) => total + file.additions, 0),
  deletions: changedFiles.reduce((total, file) => total + file.deletions, 0),
  files: changedFiles.length,
};

function RepositorySummary() {
  return (
    <div
      className="text-muted-foreground flex h-8 shrink-0 items-center gap-2 border-t px-2.5 text-[10px]"
      aria-label={`${repositoryStats.files} changed files, ${repositoryStats.additions} additions, ${repositoryStats.deletions} deletions`}
    >
      <FileDiff className="size-3 shrink-0" aria-hidden="true" />
      <span>{repositoryStats.files} files</span>
      <span className="font-mono text-emerald-600 tabular-nums">
        +{repositoryStats.additions}
      </span>
      <span className="font-mono text-red-500 tabular-nums">
        −{repositoryStats.deletions}
      </span>
      <span
        className="ml-auto size-1.5 rounded-full bg-emerald-500"
        title="Workspace ready"
        aria-hidden="true"
      />
    </div>
  );
}

export function AiCodeArtifactPanel({
  mode,
  onClose,
  onModeChange,
  onSelectFile,
  selectedFile,
}: AiCodeArtifactPanelProps) {
  const [treeOpen, setTreeOpen] = React.useState(
    () =>
      typeof window === "undefined" ||
      window.matchMedia("(min-width: 640px)").matches,
  );
  const [copied, setCopied] = React.useState(false);
  const copyTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    [],
  );
  const file =
    recordValue(aiDemoFiles, selectedFile) ?? Object.values(aiDemoFiles)[0];

  return (
    <section
      aria-label="Code workspace"
      className="bg-background flex h-full min-h-0 min-w-0 flex-1 flex-col"
    >
      <header className="flex h-10 shrink-0 items-center gap-1 border-b px-2">
        <Button
          variant="ghost"
          size="icon-sm"
          className="size-7"
          aria-label={
            treeOpen ? "Hide repository tree" : "Show repository tree"
          }
          onClick={() => setTreeOpen((current) => !current)}
        >
          {treeOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
        </Button>

        <div className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto">
          <Button
            variant={mode === "code" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 rounded-md px-2 text-xs font-normal"
            onClick={() => onModeChange("code")}
          >
            <Code2 aria-hidden="true" />
            Code
          </Button>
          <Button
            variant={mode === "diff" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 rounded-md px-2 text-xs font-normal"
            onClick={() => onModeChange("diff")}
          >
            <FileDiff aria-hidden="true" />
            Changes
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          className="size-7"
          aria-label="Copy file path"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(selectedFile);
              setCopied(true);
              if (copyTimer.current) clearTimeout(copyTimer.current);
              copyTimer.current = setTimeout(() => setCopied(false), 1400);
            } catch {
              /* Clipboard access may be unavailable. */
            }
          }}
        >
          {copied ? <Check className="text-emerald-600" /> : <Copy />}
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="size-7"
          aria-label="Close code workspace"
          onClick={onClose}
        >
          <X />
        </Button>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside
          className={cn(
            "flex min-h-0 w-56 shrink-0 flex-col border-r bg-[#f7f7f7] transition-[width,opacity] duration-200 dark:bg-[#141415]",
            treeOpen
              ? "opacity-100"
              : "w-0 overflow-hidden border-r-0 opacity-0",
          )}
        >
          <div className="min-h-0 flex-1">
            <AiRepositoryTree
              selectedFile={selectedFile}
              onSelectFile={onSelectFile}
            />
          </div>
          <RepositorySummary />
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="bg-muted/10 flex h-9 shrink-0 items-center gap-2 border-b px-3">
            <span className="text-muted-foreground min-w-0 flex-1 truncate font-mono text-[11px]">
              {selectedFile}
            </span>
            <FileStats file={file} />
          </div>

          <div className="bg-background min-h-0 flex-1 overflow-hidden">
            <AiCodeView file={file} mode={mode} />
          </div>
        </div>
      </div>
    </section>
  );
}
