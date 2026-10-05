"use client";

import { Search, X } from "lucide-react";
import * as React from "react";

import { SidebarGroupLabel } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function AiSidebarSectionSearch({
  label,
  searchLabel,
  closeLabel,
  query,
  onQueryChange,
}: {
  label: string;
  searchLabel: string;
  closeLabel: string;
  query: string;
  onQueryChange: (query: string) => void;
}) {
  const [open, setOpen] = React.useState(query.length > 0);
  const searchId = React.useId();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function closeSearch() {
    setOpen(false);
    onQueryChange("");
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  return (
    <form
      role="search"
      className="relative mb-1 h-8"
      onSubmit={(event) => event.preventDefault()}
    >
      <SidebarGroupLabel
        aria-hidden={open}
        className={cn(
          "absolute inset-0 pr-9 transition-[opacity,transform] duration-180",
          open
            ? "pointer-events-none -translate-x-1 opacity-0"
            : "translate-x-0 opacity-100",
        )}
      >
        {label}
      </SidebarGroupLabel>
      <button
        ref={triggerRef}
        type="button"
        aria-label={searchLabel}
        aria-controls={searchId}
        aria-expanded={open}
        aria-hidden={open}
        inert={open}
        onClick={() => setOpen(true)}
        className={cn(
          "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground focus-visible:ring-ring absolute top-0 right-0 flex size-8 items-center justify-center rounded-lg transition-[opacity,background-color,color,transform] duration-180 outline-none focus-visible:ring-2 active:scale-[0.96]",
          open ? "pointer-events-none opacity-0" : "opacity-100",
        )}
      >
        <Search className="size-4" strokeWidth={1.8} aria-hidden="true" />
      </button>
      <div
        aria-hidden={!open}
        inert={!open}
        className={cn(
          "bg-sidebar-accent text-muted-foreground focus-within:text-foreground absolute top-0 right-0 flex h-8 items-center overflow-hidden rounded-lg shadow-[0_0_0_1px_var(--sidebar-border)] transition-[width,opacity] duration-180",
          open
            ? "pointer-events-auto w-full opacity-100"
            : "pointer-events-none w-7 opacity-0",
        )}
      >
        <Search
          className="ml-2 size-[15px] shrink-0"
          strokeWidth={1.8}
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          id={searchId}
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              event.stopPropagation();
              closeSearch();
            }
          }}
          placeholder={searchLabel}
          aria-label={searchLabel}
          className="placeholder:text-muted-foreground ml-1.5 min-w-0 flex-1 bg-transparent text-[13px] font-medium outline-none [&::-webkit-search-cancel-button]:appearance-none"
        />
        <button
          type="button"
          aria-label={closeLabel}
          onClick={closeSearch}
          className="hover:bg-border focus-visible:ring-ring flex size-8 shrink-0 items-center justify-center rounded-lg transition-[background-color,color,transform] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-inset active:scale-[0.96]"
        >
          <X className="size-4" strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}
