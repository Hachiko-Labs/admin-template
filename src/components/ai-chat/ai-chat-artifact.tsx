"use client";

import {
  Check,
  Copy,
  Download,
  FileCode2,
  LoaderCircle,
  PackageOpen,
  RefreshCw,
} from "lucide-react";
import * as React from "react";

import {
  Artifact,
  ArtifactAction,
  ArtifactActions,
  ArtifactClose,
  ArtifactContent,
  ArtifactDescription,
  ArtifactHeader,
  ArtifactTitle,
} from "@/components/ai-elements/artifact";
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockFilename,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@/components/ai-elements/code-block";
import {
  FileTree,
  FileTreeFile,
  FileTreeFolder,
} from "@/components/ai-elements/file-tree";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface AiChatArtifactFile {
  code: string;
  language?: string;
  path: string;
}

export interface AiChatArtifactPart {
  type: "artifact";
  description?: string;
  files: AiChatArtifactFile[];
  id: string;
  status?: "error" | "generated" | "generating";
  title: string;
}

interface ArtifactTreeNode {
  children: ArtifactTreeNode[];
  file?: AiChatArtifactFile;
  name: string;
  path: string;
}

function buildTree(files: AiChatArtifactFile[]) {
  const root: ArtifactTreeNode = {
    children: [],
    name: "root",
    path: "",
  };

  for (const file of files) {
    const parts = file.path.split("/").filter(Boolean);
    let current = root;

    parts.forEach((name, index) => {
      const path = parts.slice(0, index + 1).join("/");
      let child = current.children.find((item) => item.name === name);
      if (!child) {
        child = { children: [], name, path };
        current.children.push(child);
      }
      if (index === parts.length - 1) child.file = file;
      current = child;
    });
  }

  return root.children;
}

function getExpandedFolders(nodes: ArtifactTreeNode[]) {
  const paths = new Set<string>();

  function visit(node: ArtifactTreeNode) {
    if (!node.file) paths.add(node.path);
    node.children.forEach(visit);
  }

  nodes.forEach(visit);
  return paths;
}

function ArtifactTreeNodes({ nodes }: { nodes: ArtifactTreeNode[] }) {
  return nodes.map((node) =>
    node.file ? (
      <FileTreeFile key={node.path} name={node.name} path={node.path} />
    ) : (
      <FileTreeFolder key={node.path} name={node.name} path={node.path}>
        <ArtifactTreeNodes nodes={node.children} />
      </FileTreeFolder>
    ),
  );
}

function fileName(path: string) {
  return path.split("/").at(-1) ?? "artifact.txt";
}

function downloadFile(file: AiChatArtifactFile) {
  const blob = new Blob([file.code], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName(file.path);
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function ArtifactStatus({ status }: { status: AiChatArtifactPart["status"] }) {
  if (!status) return null;

  return (
    <Badge
      variant="secondary"
      className="h-5 gap-1 rounded-md px-1.5 text-[10px] font-normal"
    >
      {status === "generating" ? (
        <LoaderCircle
          className="size-3 animate-spin motion-reduce:animate-none"
          aria-hidden="true"
        />
      ) : status === "generated" ? (
        <Check className="size-3 text-emerald-600" aria-hidden="true" />
      ) : null}
      {status === "generating"
        ? "Generating"
        : status === "error"
          ? "Needs attention"
          : "Generated"}
    </Badge>
  );
}

interface AiChatArtifactProps {
  onRegenerate?: (part: AiChatArtifactPart) => void;
  part: AiChatArtifactPart;
}

export function AiChatArtifact({ onRegenerate, part }: AiChatArtifactProps) {
  const [dismissed, setDismissed] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const copyTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const tree = React.useMemo(() => buildTree(part.files), [part.files]);
  const expanded = React.useMemo(() => getExpandedFolders(tree), [tree]);
  const [selectedPath, setSelectedPath] = React.useState(
    () => part.files[0]?.path ?? "",
  );
  const selectedFile =
    part.files.find((file) => file.path === selectedPath) ?? part.files[0];

  React.useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    [],
  );

  React.useEffect(() => {
    if (!part.files.some((file) => file.path === selectedPath)) {
      setSelectedPath(part.files[0]?.path ?? "");
    }
  }, [part.files, selectedPath]);

  async function copySelectedFile() {
    if (!selectedFile || !navigator.clipboard?.writeText) return;
    try {
      await navigator.clipboard.writeText(selectedFile.code);
    } catch {
      return;
    }
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 1600);
  }

  if (dismissed) {
    return (
      <div className="bg-muted/20 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs">
        <PackageOpen
          className="text-muted-foreground size-4"
          aria-hidden="true"
        />
        <span className="min-w-0 flex-1 truncate">{part.title} closed</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => setDismissed(false)}
        >
          Reopen
        </Button>
      </div>
    );
  }

  return (
    <Artifact aria-label={`${part.title} generated artifact`}>
      <ArtifactHeader>
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <ArtifactTitle className="truncate">{part.title}</ArtifactTitle>
            <ArtifactStatus status={part.status} />
          </div>
          {part.description ? (
            <ArtifactDescription className="truncate">
              {part.description}
            </ArtifactDescription>
          ) : null}
        </div>
        <ArtifactActions>
          <ArtifactAction
            icon={copied ? Check : Copy}
            label={copied ? "Selected file copied" : "Copy selected file"}
            tooltip={copied ? "Copied" : "Copy selected file"}
            className={copied ? "text-emerald-600" : undefined}
            onClick={copySelectedFile}
            disabled={!selectedFile}
          />
          <ArtifactAction
            icon={RefreshCw}
            label="Regenerate artifact"
            tooltip="Regenerate"
            onClick={() => onRegenerate?.(part)}
            disabled={!onRegenerate || part.status === "generating"}
          />
          <ArtifactAction
            icon={Download}
            label="Download selected file"
            tooltip="Download selected file"
            onClick={() => {
              if (selectedFile) downloadFile(selectedFile);
            }}
            disabled={!selectedFile}
          />
          <ArtifactClose onClick={() => setDismissed(true)} />
        </ArtifactActions>
      </ArtifactHeader>

      <ArtifactContent className="grid min-h-0 sm:grid-cols-[12rem_minmax(0,1fr)]">
        <div className="bg-muted/10 flex max-h-44 min-w-0 flex-col overflow-hidden border-b sm:max-h-none sm:border-r sm:border-b-0">
          <div className="min-h-0 flex-1 overflow-auto p-2">
            <div className="text-muted-foreground flex h-7 items-center gap-2 px-1.5 text-[10px] font-medium tracking-wide uppercase">
              <FileCode2 className="size-3.5" aria-hidden="true" />
              {part.files.length} files
            </div>
            <FileTree
              className="bg-transparent"
              defaultExpanded={expanded}
              selectedPath={selectedFile?.path}
              onSelect={setSelectedPath}
            >
              <ArtifactTreeNodes nodes={tree} />
            </FileTree>
          </div>
          <div
            className="text-muted-foreground flex h-8 shrink-0 items-center gap-2 border-t px-2.5 text-[10px]"
            aria-label={`${part.files.length} generated files, artifact ready`}
          >
            <FileCode2 className="size-3 shrink-0" aria-hidden="true" />
            <span>{part.files.length} generated</span>
            <span
              className="ml-auto size-1.5 rounded-full bg-emerald-500"
              title="Artifact ready"
              aria-hidden="true"
            />
          </div>
        </div>

        {selectedFile ? (
          <CodeBlock
            key={selectedFile.path}
            code={selectedFile.code}
            filename={selectedFile.path}
            language={selectedFile.language ?? "text"}
            showLineNumbers
            className="rounded-none border-0"
          >
            <CodeBlockHeader>
              <CodeBlockTitle>
                <FileCode2 className="size-3.5" aria-hidden="true" />
                <CodeBlockFilename />
              </CodeBlockTitle>
              <CodeBlockActions>
                <span className="text-muted-foreground mr-1 text-[10px] uppercase">
                  {selectedFile.language ?? "text"}
                </span>
                <CodeBlockCopyButton />
              </CodeBlockActions>
            </CodeBlockHeader>
            <CodeBlockContent />
          </CodeBlock>
        ) : (
          <div className="text-muted-foreground flex min-h-56 items-center justify-center text-xs">
            No generated files
          </div>
        )}
      </ArtifactContent>
    </Artifact>
  );
}
