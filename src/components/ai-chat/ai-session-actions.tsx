"use client";

import { Download, MoreHorizontal, RotateCcw, Trash2 } from "lucide-react";

import { ThemeSwitch } from "@/components/theme-switch";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AiSessionActions({
  transcript,
  onClear,
  onReset,
  suggestionsEnabled,
  onSuggestionsChange,
}: {
  transcript: string;
  onClear: () => void;
  onReset?: () => void;
  suggestionsEnabled?: boolean;
  onSuggestionsChange?: (enabled: boolean) => void;
}) {
  function downloadTranscript() {
    const url = URL.createObjectURL(
      new Blob([transcript], { type: "text/markdown;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "conversation.md";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="text-muted-foreground flex shrink-0 items-center gap-1.5 px-3">
      <ThemeSwitch triggerClassName="text-foreground size-9 scale-100 rounded-lg" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-9"
            aria-label="Session actions"
            title="Session actions"
          >
            <MoreHorizontal aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          {onReset && (
            <>
              <DropdownMenuItem onSelect={onReset}>
                <RotateCcw aria-hidden="true" /> Reset demo
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem
            disabled={!transcript}
            onSelect={downloadTranscript}
          >
            <Download aria-hidden="true" /> Export conversation
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={!transcript}
            variant="destructive"
            onSelect={onClear}
          >
            <Trash2 aria-hidden="true" /> Clear conversation
          </DropdownMenuItem>
          {onSuggestionsChange ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={suggestionsEnabled}
                onCheckedChange={onSuggestionsChange}
              >
                Prompt suggestions
              </DropdownMenuCheckboxItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
