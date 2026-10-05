"use client";

import pierreDarkSoft from "@pierre/theme/pierre-dark-soft";
import pierreLightSoft from "@pierre/theme/pierre-light-soft";
import {
  type GitStatusEntry,
  themeToTreeStyles,
  type TreeThemeInput,
  type TreeThemeStyles,
} from "@pierre/trees";
import { FileTree, useFileTree } from "@pierre/trees/react";
import { GitBranch, MessageCircle, Search } from "lucide-react";
import { useTheme } from "next-themes";
import type { CSSProperties } from "react";
import * as React from "react";

import {
  type AiDemoCodeFile,
  aiDemoFiles,
  aiDemoGitStatus,
  aiDemoTreePaths,
} from "@/components/ai-chat/ai-coding-demo-data";

// These are the layout overrides used by Diffshub. Colors are intentionally
// absent: they are generated from the active Pierre Shiki theme below.
const densityStyles: CSSProperties &
  Record<`--trees-${string}`, string | number> = {
  "--trees-density-override": 0.8,
  "--trees-padding-inline-override": 8,
  "--trees-git-renamed-color-override": "light-dark(#007aff, #007aff)",
};

// Copied from Diffshub's BASE_FILE_TREE_OPTIONS. The built-in search stays
// collapsed until the toolbar button opens it, folder status dots are removed,
// and folder labels receive the same contrast upgrade as the reference app.
const treeLayoutStyles = `
  [data-file-tree-search-container][data-open='false'] {
    display: none;
  }
  [data-file-tree-search-container] {
    padding-bottom: 12px;
    margin-bottom: 12px;
    margin-right: 4px;
    border-bottom: 1px solid var(--trees-border-color);
    padding-inline-start: 1px;
    padding-inline-end: 5px;
  }
  [data-file-tree-virtualized-scroll='true'] {
    padding-inline-start: 0;
    padding-inline-end: 2px;
    margin-inline-end: 2px;
  }
  [data-item-contains-git-change='true'] > [data-item-section='git'] {
    display: none;
  }
  [data-item-type='folder'] {
    color: color-mix(in lab, light-dark(#000, #fff) 25%, var(--trees-fg));
    font-weight: 500;
  }
`;

function createDiffshubTreeTheme(theme: TreeThemeInput): TreeThemeStyles {
  const styles = themeToTreeStyles(theme);
  const themeColors = theme.colors ?? {};

  // Diffshub reconciles the dim sideBar.foreground against its higher-contrast
  // chrome foreground. For Pierre Soft this resolves to editor.foreground.
  const foreground = themeColors["editor.foreground"] ?? theme.fg;
  if (foreground) {
    styles.color = foreground;
    styles["--trees-theme-sidebar-fg"] = foreground;
  }

  return styles;
}

const lightTreeTheme = createDiffshubTreeTheme(pierreLightSoft);
const darkTreeTheme = createDiffshubTreeTheme(pierreDarkSoft);
const preserveInputOrder = () => 0;

interface AiRepositoryTreeProps {
  files?: Record<string, AiDemoCodeFile>;
  gitStatus?: GitStatusEntry[];
  onSelectFile: (path: string) => void;
  paths?: string[];
  repositoryName?: string;
  selectedFile: string;
}

export function AiRepositoryTree({
  files = aiDemoFiles,
  gitStatus = aiDemoGitStatus,
  onSelectFile,
  paths = aiDemoTreePaths,
  repositoryName = "shadcn-analytics",
  selectedFile,
}: AiRepositoryTreeProps) {
  const { resolvedTheme } = useTheme();
  const latest = React.useRef({ files, selectedFile, onSelectFile });
  // The tree model retains its initial callback; keep its event inputs current.
  // eslint-disable-next-line react-hooks/refs
  latest.current = { files, selectedFile, onSelectFile };
  const { model } = useFileTree({
    paths,
    flattenEmptyDirectories: true,
    initialExpansion: "open",
    initialSelectedPaths: [selectedFile],
    presorted: true,
    sort: preserveInputOrder,
    search: true,
    gitStatus,
    itemHeight: 24,
    stickyFolders: true,
    unsafeCSS: treeLayoutStyles,
    onSelectionChange: (paths) => {
      const { files, selectedFile, onSelectFile } = latest.current;
      const nextPath = paths.at(-1);
      if (nextPath && nextPath in files && nextPath !== selectedFile) {
        onSelectFile(nextPath);
      }
    },
  });

  React.useEffect(() => {
    const currentSelection = model.getSelectedPaths();
    if (currentSelection.includes(selectedFile)) return;

    for (const path of currentSelection) model.getItem(path)?.deselect();
    model.getItem(selectedFile)?.select();
    model.scrollToPath(selectedFile, { focus: false, offset: "nearest" });
  }, [model, selectedFile]);

  const treeTheme = resolvedTheme === "dark" ? darkTreeTheme : lightTreeTheme;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-9 shrink-0 items-center gap-1 border-b px-2">
        <button
          type="button"
          className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-7 items-center justify-center rounded-md transition-colors"
          aria-label="Repository branches"
        >
          <GitBranch className="size-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-7 items-center justify-center rounded-md transition-colors"
          aria-label="Review conversations"
        >
          <MessageCircle className="size-3.5" aria-hidden="true" />
        </button>
        <span className="text-muted-foreground min-w-0 flex-1 truncate px-1 text-[11px]">
          {repositoryName}
        </span>
        <button
          type="button"
          className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-7 items-center justify-center rounded-md transition-colors"
          aria-label="Search repository files"
          onClick={() => model.openSearch()}
        >
          <Search className="size-3.5" aria-hidden="true" />
        </button>
      </div>
      <FileTree
        model={model}
        aria-label="Repository files"
        className="ml-3 block min-h-0 w-[calc(100%-0.75rem)] flex-1 overflow-auto overscroll-contain"
        style={{ ...treeTheme, ...densityStyles }}
      />
    </div>
  );
}
