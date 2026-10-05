"use client";

import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, RotateCcw } from "lucide-react";
import { Search } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { AiWorkspaceShell } from "@/components/ai-chat/ai-workspace-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function PlatformPage({
  title,
  description,
  actions,
  children,
  onReset,
  fullWidth = false,
  contentClassName,
  layout = "default",
}: {
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
  onReset?: () => void;
  fullWidth?: boolean;
  contentClassName?: string;
  layout?: "default" | "table-detail";
}) {
  const isTableDetail = layout === "table-detail";

  return (
    <AiWorkspaceShell
      headerTitle={title}
      hideNavigationSidebar
      headerActions={
        <>
          <Badge variant="outline">Demo workspace</Badge>
          {onReset ? (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Reset demo"
              onClick={onReset}
            >
              <RotateCcw />
            </Button>
          ) : null}
        </>
      }
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div
          className={cn(
            "mx-auto flex flex-col px-4 sm:px-8",
            isTableDetail
              ? "min-h-full gap-8 pt-12 pb-6 sm:pt-16 sm:pb-8 lg:px-10"
              : "gap-6 py-6 sm:py-8",
            !fullWidth && "max-w-7xl",
            contentClassName,
          )}
        >
          <div
            className={cn(
              "flex flex-wrap gap-4",
              isTableDetail
                ? "mx-auto max-w-2xl flex-col items-center text-center"
                : "items-start justify-between",
            )}
          >
            <div className="flex flex-col gap-1">
              <h1
                className={cn(
                  "text-2xl font-semibold tracking-tight",
                  isTableDetail && "sm:text-3xl",
                )}
              >
                {title}
              </h1>
              <p
                className={cn(
                  "text-muted-foreground max-w-2xl text-sm",
                  isTableDetail && "mt-2 leading-6 sm:text-base",
                )}
              >
                {description}
              </p>
            </div>
            {actions ? (
              <div
                className={cn(
                  "flex flex-wrap items-center gap-2",
                  isTableDetail && "mt-1",
                )}
              >
                {actions}
              </div>
            ) : null}
          </div>
          {children}
        </div>
      </div>
    </AiWorkspaceShell>
  );
}

export function PlatformSelect({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly (string | { value: string; label: string })[];
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        aria-label={label}
        className={cn("w-auto min-w-36", className)}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => {
            const item =
              option instanceof Object
                ? option
                : { value: option, label: option };
            return (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            );
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export function MetricCard({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="shadow-none">
      <CardHeader className="flex-row items-center justify-between px-5 pt-5 pb-3">
        <CardDescription>{title}</CardDescription>
        <Icon className="text-muted-foreground size-4" />
      </CardHeader>
      <CardContent className="flex flex-col gap-1 px-5 pb-5">
        <p className="text-3xl font-semibold tracking-tight tabular-nums">
          {value}
        </p>
        <p className="text-muted-foreground text-xs">{detail}</p>
      </CardContent>
    </Card>
  );
}

export function SectionHeading({
  title,
  description,
  href,
  action = "View all",
}: {
  title: string;
  description?: string;
  href?: string;
  action?: string;
}) {
  return (
    <CardHeader className="flex-row flex-wrap items-start justify-between gap-3">
      <div className="flex flex-col gap-1">
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </div>
      {href ? (
        <Button variant="ghost" size="sm" asChild>
          <Link href={href}>
            {action}
            <ArrowUpRight data-icon="inline-end" />
          </Link>
        </Button>
      ) : null}
    </CardHeader>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const good = [
    "Active",
    "Ready",
    "Completed",
    "Delivered",
    "Indexed",
    "Healthy",
    "Published",
  ].includes(status);
  const bad = ["Failed", "Revoked", "Expired"].includes(status);
  return (
    <Badge variant="outline">
      <span
        className={cn(
          "mr-1.5 size-1.5 shrink-0 rounded-full",
          good
            ? "bg-success"
            : bad
              ? "bg-destructive"
              : ["Running", "Processing", "Queued"].includes(status)
                ? "bg-chart-2"
                : "bg-muted-foreground",
        )}
      />
      {status}
    </Badge>
  );
}

export function NoResults({
  title = "No results found",
  description = "Try a different search or clear your filters.",
  onClear,
}: {
  title?: string;
  description?: string;
  onClear?: () => void;
}) {
  return (
    <Empty className="min-h-56">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Search />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {onClear ? (
        <Button variant="outline" size="sm" onClick={onClear}>
          Clear filters
        </Button>
      ) : null}
    </Empty>
  );
}
