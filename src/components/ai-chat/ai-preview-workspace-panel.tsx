"use client";

import {
  Check,
  Code2,
  Copy,
  Maximize2,
  Minimize2,
  Monitor,
  X,
} from "lucide-react";
import * as React from "react";

import { AiAppPreview } from "@/components/ai-chat/ai-app-preview";
import { AiCodeView } from "@/components/ai-chat/ai-code-view";
import type { AiDemoCodeFile } from "@/components/ai-chat/ai-coding-demo-data";
import {
  aiMarketingFiles,
  aiMarketingGitStatus,
  aiMarketingTreePaths,
} from "@/components/ai-chat/ai-marketing-demo-data";
import { AiRepositoryTree } from "@/components/ai-chat/ai-repository-tree";
import { Button } from "@/components/ui/button";
import { recordValue } from "@/lib/record-value";
import { cn } from "@/lib/utils";

export type AiPreviewPanelMode = "preview" | "code";

interface AiPreviewWorkspacePanelProps {
  expanded: boolean;
  mode: AiPreviewPanelMode;
  onClose: () => void;
  onExpandedChange: (expanded: boolean) => void;
  onModeChange: (mode: AiPreviewPanelMode) => void;
  onSelectFile: (path: string) => void;
  selectedFile: string;
}

function FileStats({ file }: { file: AiDemoCodeFile }) {
  return (
    <span className="flex gap-1.5 text-[10px] tabular-nums">
      <span className="text-emerald-600">+{file.additions}</span>
      {file.deletions ? (
        <span className="text-red-500">−{file.deletions}</span>
      ) : null}
    </span>
  );
}

export function AiPreviewWorkspacePanel({
  expanded,
  mode,
  onClose,
  onExpandedChange,
  onModeChange,
  onSelectFile,
  selectedFile,
}: AiPreviewWorkspacePanelProps) {
  const [copied, setCopied] = React.useState(false);
  const file =
    recordValue(aiMarketingFiles, selectedFile) ??
    Object.values(aiMarketingFiles)[0];

  return (
    <section
      aria-label="Preview workspace"
      className="bg-background flex h-full min-h-0 min-w-0 flex-1 flex-col"
    >
      <header className="flex h-10 shrink-0 items-center gap-0.5 border-b px-2">
        <div className="hidden min-w-0 flex-1 items-center gap-2 px-1 sm:flex">
          <Monitor className="text-muted-foreground size-3.5 shrink-0" />
          <span className="truncate text-xs font-medium">
            {mode === "preview" ? "Mainline landing page" : selectedFile}
          </span>
          <span className="text-muted-foreground shrink-0 text-[10px]">
            Ready
          </span>
        </div>
        <Button
          variant={mode === "preview" ? "secondary" : "ghost"}
          size="sm"
          className="h-7 rounded-md px-2 text-xs font-normal"
          onClick={() => onModeChange("preview")}
        >
          <Monitor aria-hidden="true" />
          Preview
        </Button>
        <Button
          variant={mode === "code" ? "secondary" : "ghost"}
          size="sm"
          className="h-7 rounded-md px-2 text-xs font-normal"
          onClick={() => onModeChange("code")}
        >
          <Code2 aria-hidden="true" />
          Code
        </Button>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-sm"
            className="hidden size-7 min-[980px]:inline-flex"
            aria-label={expanded ? "Restore conversation" : "Expand workspace"}
            onClick={() => onExpandedChange(!expanded)}
          >
            {expanded ? <Minimize2 /> : <Maximize2 />}
          </Button>
          {mode !== "preview" ? (
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-7"
              aria-label="Copy file path"
              onClick={async () => {
                await navigator.clipboard
                  ?.writeText(selectedFile)
                  .catch(() => undefined);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1200);
              }}
            >
              {copied ? <Check className="text-emerald-600" /> : <Copy />}
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-7"
            aria-label="Close preview workspace"
            onClick={onClose}
          >
            <X />
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside
          className={cn(
            "flex min-h-0 w-56 shrink-0 flex-col border-r bg-[#f7f7f7] transition-[width,opacity] dark:bg-[#141415]",
            mode === "code"
              ? "opacity-100"
              : "w-0 overflow-hidden border-r-0 opacity-0",
          )}
        >
          <AiRepositoryTree
            files={aiMarketingFiles}
            gitStatus={aiMarketingGitStatus}
            paths={aiMarketingTreePaths}
            repositoryName="mainline-marketing"
            selectedFile={selectedFile}
            onSelectFile={(path) => {
              onSelectFile(path);
              onModeChange("code");
            }}
          />
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {mode === "preview" ? (
            <AiAppPreview />
          ) : (
            <>
              <div className="bg-muted/10 flex h-9 shrink-0 items-center gap-2 border-b px-3">
                <span className="text-muted-foreground min-w-0 flex-1 truncate font-mono text-[11px]">
                  {selectedFile}
                </span>
                <FileStats file={file} />
              </div>
              <div className="min-h-0 flex-1 overflow-hidden">
                <AiCodeView file={file} mode={mode} />
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
