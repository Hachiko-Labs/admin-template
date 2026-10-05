"use client";

import type { LucideIcon } from "lucide-react";
import { X } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type ArtifactProps = React.ComponentProps<"section">;

export function Artifact({ className, ...props }: ArtifactProps) {
  return (
    <section
      className={cn(
        "bg-background flex min-w-0 flex-col overflow-hidden rounded-xl border shadow-xs",
        className,
      )}
      {...props}
    />
  );
}

export type ArtifactHeaderProps = React.ComponentProps<"header">;

export function ArtifactHeader({ className, ...props }: ArtifactHeaderProps) {
  return (
    <header
      className={cn(
        "bg-muted/35 flex min-h-12 items-center justify-between gap-3 border-b px-3 py-2.5 sm:px-4",
        className,
      )}
      {...props}
    />
  );
}

export type ArtifactTitleProps = React.ComponentProps<"p">;

export function ArtifactTitle({ className, ...props }: ArtifactTitleProps) {
  return <p className={cn("text-sm font-medium", className)} {...props} />;
}

export type ArtifactDescriptionProps = React.ComponentProps<"p">;

export function ArtifactDescription({
  className,
  ...props
}: ArtifactDescriptionProps) {
  return (
    <p
      className={cn("text-muted-foreground text-xs leading-5", className)}
      {...props}
    />
  );
}

export type ArtifactActionsProps = React.ComponentProps<"div">;

export function ArtifactActions({ className, ...props }: ArtifactActionsProps) {
  return (
    <div
      className={cn("flex shrink-0 items-center gap-0.5", className)}
      {...props}
    />
  );
}

export type ArtifactActionProps = React.ComponentProps<typeof Button> & {
  icon?: LucideIcon;
  label: string;
  tooltip?: string;
};

export function ArtifactAction({
  children,
  className,
  icon: Icon,
  label,
  size = "icon-sm",
  tooltip,
  variant = "ghost",
  ...props
}: ArtifactActionProps) {
  const button = (
    <Button
      type="button"
      aria-label={label}
      className={cn("text-muted-foreground size-7", className)}
      size={size}
      variant={variant}
      {...props}
    >
      {Icon ? <Icon aria-hidden="true" /> : children}
    </Button>
  );

  if (!tooltip) return button;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export type ArtifactCloseProps = Omit<ArtifactActionProps, "icon" | "label"> & {
  label?: string;
};

export function ArtifactClose({
  label = "Close artifact",
  tooltip = "Close",
  ...props
}: ArtifactCloseProps) {
  return <ArtifactAction icon={X} label={label} tooltip={tooltip} {...props} />;
}

export type ArtifactContentProps = React.ComponentProps<"div">;

export function ArtifactContent({ className, ...props }: ArtifactContentProps) {
  return <div className={cn("min-w-0 flex-1", className)} {...props} />;
}
