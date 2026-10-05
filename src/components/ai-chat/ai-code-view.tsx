"use client";

import { parseDiffFromFile, preloadHighlighter } from "@pierre/diffs";
import { File, FileDiff } from "@pierre/diffs/react";
import { useTheme } from "next-themes";
import * as React from "react";

import type { AiDemoCodeFile } from "@/components/ai-chat/ai-coding-demo-data";

const sharedOptions = {
  disableFileHeader: true,
  overflow: "scroll" as const,
  theme: { dark: "pierre-dark-soft", light: "pierre-light-soft" },
  tokenizeMaxLineLength: 800,
  unsafeCSS: `
    :host {
      min-height: 100%;
      background: var(--diffs-bg);
      --diffs-font-family: var(--font-mono);
      --diffs-font-size: 13px;
      --diffs-line-height: 20px;
    }
    pre {
      height: 100%;
      min-height: 100%;
      overflow-y: auto;
      overscroll-behavior: contain;
      scrollbar-gutter: stable;
      scrollbar-width: thin;
    }
    [data-code] {
      height: max-content;
      min-height: 100%;
      align-self: start;
    }
    [data-gutter],
    [data-content] {
      min-height: 100%;
    }
    [data-gutter] {
      background-color: var(--diffs-bg-context);
      border-right: 1px solid var(--diffs-bg-separator);
    }
  `,
};

interface AiCodeViewProps {
  file: AiDemoCodeFile;
  mode: "code" | "diff";
  compact?: boolean;
}

export function AiCodeView({ file, mode, compact = false }: AiCodeViewProps) {
  const { resolvedTheme } = useTheme();
  const [ready, setReady] = React.useState(false);
  const [splitDiff, setSplitDiff] = React.useState(
    () =>
      typeof window === "undefined" ||
      window.matchMedia("(min-width: 700px)").matches,
  );
  const { previous, current: currentFile } = file;
  const fileDiff = React.useMemo(
    () => parseDiffFromFile(previous, currentFile),
    [previous, currentFile],
  );

  React.useEffect(() => {
    const query = window.matchMedia("(min-width: 700px)");
    const update = () => setSplitDiff(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  React.useEffect(() => {
    let active = true;
    setReady(false);

    void preloadHighlighter({
      langs: [file.current.name.endsWith(".tsx") ? "tsx" : "typescript"],
      preferredHighlighter: "shiki-js",
      themes: ["pierre-dark-soft", "pierre-light-soft"],
    })
      .catch(() => undefined)
      .finally(() => {
        if (active) setReady(true);
      });

    return () => {
      active = false;
    };
  }, [file]);

  if (!ready) {
    return (
      <div className="space-y-2 p-4" aria-label="Preparing code view">
        {Array.from({ length: 12 }, (_, index) => (
          <div
            key={index}
            className="bg-muted h-3 animate-pulse rounded-sm"
            style={{ width: `${48 + ((index * 17) % 45)}%` }}
          />
        ))}
      </div>
    );
  }

  if (mode === "diff" && file.status !== "unchanged") {
    return (
      <FileDiff
        fileDiff={fileDiff}
        disableWorkerPool
        options={{
          ...sharedOptions,
          diffStyle: compact ? "unified" : splitDiff ? "split" : "unified",
          unsafeCSS: compact
            ? `${sharedOptions.unsafeCSS}
                :host, pre, [data-code], [data-gutter], [data-content] { min-height: 0; }
                pre, [data-code] { height: auto; }
              `
            : sharedOptions.unsafeCSS,
          themeType: resolvedTheme === "dark" ? "dark" : "light",
          diffIndicators: "bars",
          expandUnchanged: false,
          hunkSeparators: "line-info",
        }}
        className={compact ? "block min-w-full" : "block h-full min-w-full"}
      />
    );
  }

  const code = (
    <File
      file={file.current}
      disableWorkerPool
      options={{
        ...sharedOptions,
        themeType: resolvedTheme === "dark" ? "dark" : "light",
      }}
      className="block h-full min-w-full"
    />
  );

  // An unchanged file has no hunks to diff; show its source with a note instead of an empty panel.
  if (mode === "diff") {
    return (
      <div className="flex h-full min-w-full flex-col">
        <p className="text-muted-foreground shrink-0 border-b px-4 py-2 text-xs">
          No changes in this file
        </p>
        <div className="min-h-0 flex-1">{code}</div>
      </div>
    );
  }

  return code;
}
