"use client";

import { ArrowUpRight } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Adapted from Vercel AI Elements with click/tap behavior for mobile support.
// https://elements.ai-sdk.dev/components/inline-citation
export interface InlineCitationSourceData {
  description?: string;
  excerpt?: string;
  id: string | number;
  title: string;
  url: string;
}

function safeHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

function hostname(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return "source";
  }
}

export type InlineCitationProps = React.ComponentPropsWithoutRef<"span">;

export function InlineCitation({ className, ...props }: InlineCitationProps) {
  return (
    <span
      className={cn("group/citation leading-inherit inline", className)}
      {...props}
    />
  );
}

export type InlineCitationTextProps = React.ComponentPropsWithoutRef<"span">;

export function InlineCitationText({
  className,
  ...props
}: InlineCitationTextProps) {
  return (
    <span
      className={cn(
        "decoration-muted-foreground/45 group-hover/citation:decoration-foreground/70 underline decoration-dotted underline-offset-4 transition-colors",
        className,
      )}
      {...props}
    />
  );
}

export type InlineCitationCardProps = React.ComponentProps<typeof Popover>;

export function InlineCitationCard(props: InlineCitationCardProps) {
  return <Popover {...props} />;
}

export interface InlineCitationCardTriggerProps extends Omit<
  React.ComponentProps<typeof Button>,
  "children"
> {
  sources: InlineCitationSourceData[];
}

export function InlineCitationCardTrigger({
  className,
  sources,
  ...props
}: InlineCitationCardTriggerProps) {
  const firstSource = sources.find((source) => safeHttpUrl(source.url));
  const extraSources = Math.max(0, sources.length - 1);

  return (
    <PopoverTrigger asChild>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className={cn(
          "mx-1 inline-flex h-5 translate-y-px rounded-full px-2 align-baseline text-[10px] font-normal shadow-none",
          className,
        )}
        {...props}
      >
        {firstSource ? hostname(firstSource.url) : "source"}
        {extraSources ? ` +${extraSources}` : null}
      </Button>
    </PopoverTrigger>
  );
}

export type InlineCitationCardBodyProps = React.ComponentProps<
  typeof PopoverContent
>;

export function InlineCitationCardBody({
  className,
  ...props
}: InlineCitationCardBodyProps) {
  return (
    <PopoverContent
      align="start"
      sideOffset={6}
      className={cn("w-[min(22rem,calc(100vw-2rem))] p-0", className)}
      {...props}
    />
  );
}

export interface InlineCitationSourceProps extends React.ComponentPropsWithoutRef<"div"> {
  source: InlineCitationSourceData;
}

export function InlineCitationSource({
  className,
  source,
  ...props
}: InlineCitationSourceProps) {
  const href = safeHttpUrl(source.url);

  return (
    <div className={cn("space-y-2 p-3", className)} {...props}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{source.title}</p>
          <p className="text-muted-foreground truncate text-xs">
            {hostname(source.url)}
          </p>
        </div>
        {href ? (
          <Button asChild variant="ghost" size="icon-sm" className="shrink-0">
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open ${source.title}`}
            >
              <ArrowUpRight aria-hidden="true" />
            </a>
          </Button>
        ) : null}
      </div>
      {source.description ? (
        <p className="text-muted-foreground text-xs leading-5">
          {source.description}
        </p>
      ) : null}
      {source.excerpt ? (
        <blockquote className="border-l-2 pl-3 text-xs leading-5">
          {source.excerpt}
        </blockquote>
      ) : null}
    </div>
  );
}
