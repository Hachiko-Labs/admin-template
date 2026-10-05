"use client";

import { Check, ChevronDown, Copy, FileCode2 } from "lucide-react";
import * as React from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

// Adapted from the composable anatomy of Vercel AI Elements Commit.
// https://elements.ai-sdk.dev/components/commit
export type CommitProps = React.ComponentProps<typeof Collapsible>;

export function Commit({
  className,
  defaultOpen = true,
  ...props
}: CommitProps) {
  return (
    <Collapsible
      className={cn(
        "bg-background group/commit not-prose overflow-hidden rounded-xl border shadow-xs",
        className,
      )}
      defaultOpen={defaultOpen}
      {...props}
    />
  );
}

export type CommitHeaderProps = React.ComponentProps<"div">;

export function CommitHeader({ className, ...props }: CommitHeaderProps) {
  return (
    <div
      className={cn("flex min-h-12 items-center gap-3 px-3 py-2", className)}
      {...props}
    />
  );
}

export type CommitAuthorProps = React.ComponentProps<"div">;

export function CommitAuthor({ className, ...props }: CommitAuthorProps) {
  return <div className={cn("shrink-0", className)} {...props} />;
}

interface CommitAuthorAvatarProps extends React.ComponentProps<typeof Avatar> {
  initials: string;
}

export function CommitAuthorAvatar({
  className,
  initials,
  ...props
}: CommitAuthorAvatarProps) {
  return (
    <Avatar className={cn("size-8 rounded-lg", className)} {...props}>
      <AvatarFallback className="rounded-lg text-[10px] font-medium">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

export type CommitInfoProps = React.ComponentProps<"div">;

export function CommitInfo({ className, ...props }: CommitInfoProps) {
  return <div className={cn("min-w-0 flex-1", className)} {...props} />;
}

export type CommitMessageProps = React.ComponentProps<"p">;

export function CommitMessage({ className, ...props }: CommitMessageProps) {
  return (
    <p
      className={cn("truncate text-[12px] leading-5 font-medium", className)}
      {...props}
    />
  );
}

export type CommitMetadataProps = React.ComponentProps<"div">;

export function CommitMetadata({ className, ...props }: CommitMetadataProps) {
  return (
    <div
      className={cn(
        "text-muted-foreground mt-0.5 flex min-w-0 items-center gap-1.5 text-[10px]",
        className,
      )}
      {...props}
    />
  );
}

export type CommitHashProps = React.ComponentProps<"code">;

export function CommitHash({ className, ...props }: CommitHashProps) {
  return <code className={cn("font-mono text-[10px]", className)} {...props} />;
}

export type CommitSeparatorProps = React.ComponentProps<"span">;

export function CommitSeparator({
  children = "·",
  className,
  ...props
}: CommitSeparatorProps) {
  return (
    <span className={className} aria-hidden="true" {...props}>
      {children}
    </span>
  );
}

export type CommitTimestampProps = React.ComponentProps<"time">;

export function CommitTimestamp({ className, ...props }: CommitTimestampProps) {
  return <time className={cn("truncate", className)} {...props} />;
}

export type CommitActionsProps = React.ComponentProps<"div">;

export function CommitActions({ className, ...props }: CommitActionsProps) {
  return (
    <div
      className={cn("flex shrink-0 items-center gap-0.5", className)}
      {...props}
    />
  );
}

interface CommitCopyButtonProps extends Omit<
  React.ComponentProps<typeof Button>,
  "onError"
> {
  hash: string;
  onCopy?: () => void;
  onError?: (error: Error) => void;
}

export function CommitCopyButton({
  className,
  hash,
  onCopy,
  onError,
  ...props
}: CommitCopyButtonProps) {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  async function copy() {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API is unavailable");
      }
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      onCopy?.();
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className={cn("text-muted-foreground size-7", className)}
      aria-label={copied ? "Commit hash copied" : "Copy commit hash"}
      onClick={copy}
      {...props}
    >
      {copied ? (
        <Check className="text-emerald-600" aria-hidden="true" />
      ) : (
        <Copy aria-hidden="true" />
      )}
    </Button>
  );
}

export type CommitTriggerProps = React.ComponentProps<typeof Button>;

export function CommitTrigger({ className, ...props }: CommitTriggerProps) {
  return (
    <CollapsibleTrigger asChild>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className={cn("text-muted-foreground size-7", className)}
        aria-label="Toggle changed files"
        {...props}
      >
        <ChevronDown
          className="transition-transform group-data-[state=open]/commit:rotate-180"
          aria-hidden="true"
        />
      </Button>
    </CollapsibleTrigger>
  );
}

export type CommitContentProps = React.ComponentProps<
  typeof CollapsibleContent
>;

export function CommitContent({ className, ...props }: CommitContentProps) {
  return (
    <CollapsibleContent
      className={cn(
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-1 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-1 border-t",
        className,
      )}
      {...props}
    />
  );
}

export type CommitFilesProps = React.ComponentProps<"div">;

export function CommitFiles({ className, ...props }: CommitFilesProps) {
  return <div className={cn("divide-y", className)} {...props} />;
}

export type CommitFileProps = React.ComponentProps<"div">;

export function CommitFile({ className, ...props }: CommitFileProps) {
  return (
    <div
      className={cn(
        "hover:bg-muted/30 flex min-h-8 min-w-0 items-center gap-2 px-3 py-1.5 transition-colors",
        className,
      )}
      {...props}
    />
  );
}

export type CommitFileInfoProps = React.ComponentProps<"div">;

export function CommitFileInfo({ className, ...props }: CommitFileInfoProps) {
  return (
    <div
      className={cn("flex min-w-0 flex-1 items-center gap-2", className)}
      {...props}
    />
  );
}

type CommitFileStatusValue = "added" | "deleted" | "modified" | "renamed";

interface CommitFileStatusProps extends React.ComponentProps<"span"> {
  status: CommitFileStatusValue;
}

const statusLabels: Record<CommitFileStatusValue, string> = {
  added: "A",
  deleted: "D",
  modified: "M",
  renamed: "R",
};

export function CommitFileStatus({
  children,
  className,
  status,
  ...props
}: CommitFileStatusProps) {
  return (
    <span
      className={cn(
        "grid size-5 shrink-0 place-items-center rounded text-[9px] font-semibold",
        status === "added" &&
          "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
        status === "modified" &&
          "bg-amber-500/10 text-amber-700 dark:text-amber-400",
        status === "deleted" && "bg-red-500/10 text-red-700 dark:text-red-400",
        status === "renamed" &&
          "bg-blue-500/10 text-blue-700 dark:text-blue-400",
        className,
      )}
      {...props}
    >
      {children ?? statusLabels[status]}
    </span>
  );
}

export type CommitFileIconProps = React.ComponentProps<typeof FileCode2>;

export function CommitFileIcon({ className, ...props }: CommitFileIconProps) {
  return (
    <FileCode2
      className={cn("text-muted-foreground size-3.5 shrink-0", className)}
      aria-hidden="true"
      {...props}
    />
  );
}

export type CommitFilePathProps = React.ComponentProps<"span">;

export function CommitFilePath({ className, ...props }: CommitFilePathProps) {
  return (
    <span
      className={cn("truncate font-mono text-[10px]", className)}
      {...props}
    />
  );
}

export type CommitFileChangesProps = React.ComponentProps<"div">;

export function CommitFileChanges({
  className,
  ...props
}: CommitFileChangesProps) {
  return (
    <div
      className={cn(
        "ml-auto flex shrink-0 items-center gap-1.5 font-mono text-[9px] tabular-nums",
        className,
      )}
      {...props}
    />
  );
}

interface CommitFileCountProps extends React.ComponentProps<"span"> {
  count: number;
}

export function CommitFileAdditions({
  className,
  count,
  ...props
}: CommitFileCountProps) {
  if (!count) return null;

  return (
    <span
      className={cn("text-emerald-700 dark:text-emerald-400", className)}
      {...props}
    >
      +{count}
    </span>
  );
}

export function CommitFileDeletions({
  className,
  count,
  ...props
}: CommitFileCountProps) {
  if (!count) return null;

  return (
    <span
      className={cn("text-red-700 dark:text-red-400", className)}
      {...props}
    >
      -{count}
    </span>
  );
}

export function CommitVerifiedMark({
  children = "Verified",
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400",
        className,
      )}
      {...props}
    >
      <Check className="size-3" aria-hidden="true" />
      {children}
    </span>
  );
}
