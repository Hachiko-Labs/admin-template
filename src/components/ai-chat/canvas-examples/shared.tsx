"use client";

import {
  Download,
  MoreHorizontal,
  Redo2,
  Undo2,
  Upload,
  X,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function downloadFile(
  name: string,
  value: string,
  type = "application/json",
) {
  const url = URL.createObjectURL(new Blob([value], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function IconButton({
  label,
  icon: Icon,
  ...props
}: { label: string; icon: React.ElementType } & React.ComponentProps<
  typeof Button
>) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={label} {...props}>
          <Icon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
export function DocumentActions<T extends object>({
  undo,
  redo,
  canUndo,
  canRedo,
  value,
  onImport,
  name,
  disabled,
  compact = false,
  menuItems,
}: {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  value: T;
  onImport: (value: T) => void;
  name: string;
  disabled?: boolean;
  compact?: boolean;
  menuItems?: React.ReactNode;
}) {
  const input = React.useRef<HTMLInputElement>(null);
  return (
    <div className="flex items-center gap-0.5">
      <div
        className={
          compact ? "hidden items-center sm:flex" : "flex items-center"
        }
      >
        <IconButton
          icon={Undo2}
          label="Undo"
          disabled={disabled || !canUndo}
          onClick={undo}
        />
        <IconButton
          icon={Redo2}
          label="Redo"
          disabled={disabled || !canRedo}
          onClick={redo}
        />
      </div>
      {compact ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Workspace actions">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuGroup className="sm:hidden">
              <DropdownMenuItem disabled={disabled || !canUndo} onSelect={undo}>
                <Undo2 />
                Undo
              </DropdownMenuItem>
              <DropdownMenuItem disabled={disabled || !canRedo} onSelect={redo}>
                <Redo2 />
                Redo
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </DropdownMenuGroup>
            <DropdownMenuGroup>
              <DropdownMenuItem
                onSelect={() =>
                  downloadFile(`${name}.json`, JSON.stringify(value, null, 2))
                }
              >
                <Download />
                Export project
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={disabled}
                onSelect={() => input.current?.click()}
              >
                <Upload />
                Import project
              </DropdownMenuItem>
            </DropdownMenuGroup>
            {menuItems ? (
              <>
                <DropdownMenuSeparator />
                {menuItems}
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <>
          <IconButton
            icon={Download}
            label="Export project"
            onClick={() =>
              downloadFile(`${name}.json`, JSON.stringify(value, null, 2))
            }
          />
          <IconButton
            icon={Upload}
            label="Import project"
            disabled={disabled}
            onClick={() => input.current?.click()}
          />
        </>
      )}
      <input
        ref={input}
        className="hidden"
        type="file"
        accept=".json,application/json"
        aria-label="Import project file"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          try {
            if (file.size > 6000000) throw new Error("Too large");
            onImport(JSON.parse(await file.text()));
            toast.success("Project imported");
          } catch {
            toast.error(
              "Could not import this project. Choose a valid exported JSON file under 6 MB.",
            );
          }
        }}
      />
    </div>
  );
}
export function Inspector({
  title,
  open,
  onClose,
  children,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-sm [&>button]:hidden">
        <SheetHeader className="flex-row items-center border-b p-4">
          <div className="min-w-0 flex-1">
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>
              Inspect and edit this workspace object.
            </SheetDescription>
          </div>
          <IconButton icon={X} label="Close inspector" onClick={onClose} />
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-auto p-5">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
export function Footer({
  children,
  saved,
}: {
  children?: React.ReactNode;
  saved: string;
}) {
  return (
    <footer className="bg-background text-muted-foreground flex min-h-9 shrink-0 items-center justify-between gap-3 border-t px-4 text-[11px]">
      <span className="min-w-0 truncate">{children}</span>
      <span className="shrink-0" role="status">
        {saved}
      </span>
    </footer>
  );
}
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground text-[10px] font-medium tracking-[0.12em] uppercase">
      {children}
    </p>
  );
}
