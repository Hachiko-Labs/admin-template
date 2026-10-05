"use client";

import { ArrowUpRight, Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { cn } from "@/lib/utils";

export interface AiChatSource {
  id: string | number;
  title: string;
  url: string;
}

interface AiChatSourcesProps {
  className?: string;
  sources: AiChatSource[];
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
    return new URL(value).hostname;
  } catch {
    return value;
  }
}

export function AiChatSources({ className, sources }: AiChatSourcesProps) {
  const uniqueSources = sources
    .filter((source) => safeHttpUrl(source.url))
    .filter(
      (source, index, all) =>
        all.findIndex((candidate) => candidate.url === source.url) === index,
    );

  if (!uniqueSources.length) return null;

  const label = `Searched ${uniqueSources.length} ${
    uniqueSources.length === 1 ? "website" : "websites"
  }`;

  return (
    <div className={cn("px-1", className)}>
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="link" className="h-8 w-fit px-1.5 text-xs">
            <Globe />
            {label}
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[78svh]">
          <DrawerHeader>
            <DrawerTitle>{label}</DrawerTitle>
            <DrawerDescription>
              Sources used to prepare this response.
            </DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-6">
            <ItemGroup>
              {uniqueSources.map((source) => {
                const href = safeHttpUrl(source.url)!;
                return (
                  <Item
                    key={source.id}
                    asChild
                    variant="muted"
                    size="sm"
                    className="rounded-xl"
                  >
                    <a href={href} target="_blank" rel="noreferrer">
                      <ItemContent>
                        <ItemTitle>{source.title}</ItemTitle>
                        <ItemDescription>{hostname(href)}</ItemDescription>
                      </ItemContent>
                      <ItemActions>
                        <ArrowUpRight className="size-4" />
                      </ItemActions>
                    </a>
                  </Item>
                );
              })}
            </ItemGroup>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
