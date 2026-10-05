"use client";

import { ChevronRight, File, Folder, FolderOpen } from "lucide-react";
import * as React from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface FileTreeContextValue {
  expandedPaths: Set<string>;
  onSelect?: (path: string) => void;
  selectedPath?: string;
  setExpanded: (path: string, open: boolean) => void;
}

const emptyPaths = new Set<string>();
const FileTreeContext = React.createContext<FileTreeContextValue>({
  expandedPaths: emptyPaths,
  setExpanded: () => undefined,
});

export type FileTreeProps = Omit<React.ComponentProps<"div">, "onSelect"> & {
  defaultExpanded?: Set<string>;
  expanded?: Set<string>;
  onExpandedChange?: (expanded: Set<string>) => void;
  onSelect?: (path: string) => void;
  selectedPath?: string;
};

export function FileTree({
  children,
  className,
  defaultExpanded = emptyPaths,
  expanded: controlledExpanded,
  onExpandedChange,
  onSelect,
  selectedPath,
  ...props
}: FileTreeProps) {
  const [internalExpanded, setInternalExpanded] =
    React.useState(defaultExpanded);
  const expandedPaths = controlledExpanded ?? internalExpanded;

  const setExpanded = React.useCallback(
    (path: string, open: boolean) => {
      const next = new Set(expandedPaths);
      if (open) next.add(path);
      else next.delete(path);
      if (!controlledExpanded) setInternalExpanded(next);
      onExpandedChange?.(next);
    },
    [controlledExpanded, expandedPaths, onExpandedChange],
  );

  const value = React.useMemo(
    () => ({ expandedPaths, onSelect, selectedPath, setExpanded }),
    [expandedPaths, onSelect, selectedPath, setExpanded],
  );

  return (
    <FileTreeContext.Provider value={value}>
      <div
        className={cn("bg-muted/15 min-w-0 font-mono text-[11px]", className)}
        role="tree"
        {...props}
      >
        {children}
      </div>
    </FileTreeContext.Provider>
  );
}

export type FileTreeIconProps = React.ComponentProps<"span">;

export function FileTreeIcon({ className, ...props }: FileTreeIconProps) {
  return <span className={cn("shrink-0", className)} {...props} />;
}

export type FileTreeNameProps = React.ComponentProps<"span">;

export function FileTreeName({ className, ...props }: FileTreeNameProps) {
  return <span className={cn("min-w-0 truncate", className)} {...props} />;
}

export type FileTreeFolderProps = Omit<React.ComponentProps<"div">, "name"> & {
  name: string;
  path: string;
};

export function FileTreeFolder({
  children,
  className,
  name,
  path,
  ...props
}: FileTreeFolderProps) {
  const { expandedPaths, setExpanded } = React.useContext(FileTreeContext);
  const open = expandedPaths.has(path);

  return (
    <Collapsible open={open} onOpenChange={(next) => setExpanded(path, next)}>
      <div
        className={className}
        role="treeitem"
        aria-selected={false}
        {...props}
      >
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="hover:bg-muted/70 focus-visible:ring-ring flex h-7 w-full items-center gap-1 rounded-md px-1.5 text-left focus-visible:ring-2 focus-visible:outline-none"
            aria-label={`${open ? "Collapse" : "Expand"} ${name}`}
          >
            <ChevronRight
              className={cn(
                "text-muted-foreground size-3.5 shrink-0 transition-transform",
                open && "rotate-90",
              )}
              aria-hidden="true"
            />
            <FileTreeIcon>
              {open ? (
                <FolderOpen
                  className="size-3.5 text-blue-500"
                  aria-hidden="true"
                />
              ) : (
                <Folder className="size-3.5 text-blue-500" aria-hidden="true" />
              )}
            </FileTreeIcon>
            <FileTreeName>{name}</FileTreeName>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent role="group">
          <div className="border-border/70 ml-3.5 border-l pl-1.5">
            {children}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export type FileTreeFileProps = Omit<React.ComponentProps<"div">, "name"> & {
  icon?: React.ReactNode;
  name: string;
  path: string;
};

export function FileTreeFile({
  children,
  className,
  icon,
  name,
  path,
  ...props
}: FileTreeFileProps) {
  const { onSelect, selectedPath } = React.useContext(FileTreeContext);
  const selected = selectedPath === path;

  function select() {
    onSelect?.(path);
  }

  return (
    <div
      className={cn(
        "hover:bg-muted/70 focus-visible:ring-ring flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-1.5 focus-visible:ring-2 focus-visible:outline-none",
        selected && "bg-muted text-foreground",
        className,
      )}
      aria-selected={selected}
      onClick={select}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          select();
        }
      }}
      role="treeitem"
      tabIndex={0}
      {...props}
    >
      {children ?? (
        <>
          <span className="size-3.5 shrink-0" aria-hidden="true" />
          <FileTreeIcon>
            {icon ?? (
              <File
                className="text-muted-foreground size-3.5"
                aria-hidden="true"
              />
            )}
          </FileTreeIcon>
          <FileTreeName>{name}</FileTreeName>
        </>
      )}
    </div>
  );
}

export type FileTreeActionsProps = React.ComponentProps<"div">;

export function FileTreeActions({
  className,
  onClick,
  onKeyDown,
  ...props
}: FileTreeActionsProps) {
  return (
    <div
      className={cn("ml-auto flex items-center gap-1", className)}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.(event);
      }}
      onKeyDown={(event) => {
        event.stopPropagation();
        onKeyDown?.(event);
      }}
      role="group"
      {...props}
    />
  );
}
