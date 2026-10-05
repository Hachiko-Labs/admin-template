"use client";

import {
  Bot,
  Check,
  FileCode2,
  FileText,
  type LucideIcon,
  Package,
  Plus,
  X,
} from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";

import { AiChatComposerAction } from "@/components/ai-chat/ai-chat-composer";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

interface AiChatContextItem {
  description: string;
  icon: LucideIcon;
  id: string;
  label: string;
  meta: string;
}

const contextItems: AiChatContextItem[] = [
  {
    id: "composer-source",
    label: "ai-chat-composer.tsx",
    description: "Shared composer primitives and keyboard submit behavior.",
    icon: FileCode2,
    meta: "Component",
  },
  {
    id: "package-manifest",
    label: "package.json",
    description: "Project scripts, dependencies, and runtime requirements.",
    icon: Package,
    meta: "Project file",
  },
  {
    id: "frontend-agent",
    label: "Frontend agent",
    description: "Delegate focused UI implementation and visual verification.",
    icon: Bot,
    meta: "Agent",
  },
  {
    id: "design-guidelines",
    label: "Design guidelines",
    description:
      "Spacing, typography, accessibility, and interaction standards.",
    icon: FileText,
    meta: "Document",
  },
];

export function AiChatAddContextAction() {
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [attachedItems, setAttachedItems] = React.useState<AiChatContextItem[]>(
    [],
  );
  const panelId = React.useId();
  const panelRef = React.useRef<HTMLDivElement>(null);
  const listboxRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLSpanElement>(null);

  const focusTrigger = React.useCallback(() => {
    window.requestAnimationFrame(() => {
      triggerRef.current?.querySelector("button")?.focus();
    });
  }, []);

  const closePicker = React.useCallback(() => {
    setOpen(false);
    focusTrigger();
  }, [focusTrigger]);

  const attachItem = React.useCallback(
    (item: AiChatContextItem) => {
      setAttachedItems((current) =>
        current.some((attached) => attached.id === item.id)
          ? current
          : [...current, item],
      );
      closePicker();
    },
    [closePicker],
  );

  React.useLayoutEffect(() => {
    if (!open) return;

    setActiveIndex(0);
    const panelElement = panelRef.current;
    const anchorElement = triggerRef.current?.closest("form");
    if (!panelElement || !anchorElement) return;
    const positionedPanel = panelElement;
    const positionedAnchor = anchorElement;

    function updatePosition() {
      const anchorRect = positionedAnchor.getBoundingClientRect();
      const visualViewport = window.visualViewport;
      const viewportLeft = visualViewport?.offsetLeft ?? 0;
      const viewportTop = visualViewport?.offsetTop ?? 0;
      const viewportWidth = visualViewport?.width ?? window.innerWidth;
      const viewportHeight = visualViewport?.height ?? window.innerHeight;
      const viewportPadding = 8;
      const gap = 8;

      if (
        anchorRect.bottom <= viewportTop ||
        anchorRect.top >= viewportTop + viewportHeight ||
        anchorRect.right <= viewportLeft ||
        anchorRect.left >= viewportLeft + viewportWidth
      ) {
        setOpen(false);
        return;
      }

      const width = Math.min(
        anchorRect.width,
        viewportWidth - viewportPadding * 2,
      );
      const maxLeft = Math.max(
        viewportLeft + viewportPadding,
        viewportLeft + viewportWidth - width - viewportPadding,
      );
      const left = Math.min(
        Math.max(anchorRect.left, viewportLeft + viewportPadding),
        maxLeft,
      );

      positionedPanel.style.left = `${left}px`;
      positionedPanel.style.width = `${width}px`;

      const headerHeight =
        positionedPanel.firstElementChild?.getBoundingClientRect().height ?? 0;
      const spaceBelow =
        viewportTop +
        viewportHeight -
        anchorRect.bottom -
        gap -
        viewportPadding;
      const spaceAbove = anchorRect.top - viewportTop - gap - viewportPadding;
      const minimumUsableHeight = headerHeight + 72;
      const side =
        spaceBelow >= minimumUsableHeight || spaceBelow >= spaceAbove
          ? "bottom"
          : "top";
      const availableHeight = side === "bottom" ? spaceBelow : spaceAbove;
      const maxPanelHeight = Math.max(
        80,
        Math.min(viewportHeight - viewportPadding * 2, availableHeight),
      );
      const maxListboxHeight = Math.max(
        40,
        Math.min(256, maxPanelHeight - headerHeight),
      );
      positionedPanel.style.maxHeight = `${maxPanelHeight}px`;
      if (listboxRef.current) {
        listboxRef.current.style.maxHeight = `${maxListboxHeight}px`;
      }

      const panelHeight = positionedPanel.offsetHeight;
      const desiredTop =
        side === "bottom"
          ? anchorRect.bottom + gap
          : anchorRect.top - gap - panelHeight;
      const maxTop = Math.max(
        viewportTop + viewportPadding,
        viewportTop + viewportHeight - panelHeight - viewportPadding,
      );
      const top = Math.min(
        Math.max(desiredTop, viewportTop + viewportPadding),
        maxTop,
      );

      positionedPanel.dataset.side = side;
      positionedPanel.style.top = `${top}px`;
      positionedPanel.style.visibility = "visible";
    }

    updatePosition();
    listboxRef.current?.focus({ preventScroll: true });

    const resizeObserver = new ResizeObserver(updatePosition);
    resizeObserver.observe(positionedAnchor);
    resizeObserver.observe(positionedPanel);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    window.visualViewport?.addEventListener("resize", updatePosition);
    window.visualViewport?.addEventListener("scroll", updatePosition);

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (
        panelRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      )
        return;
      setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      window.visualViewport?.removeEventListener("resize", updatePosition);
      window.visualViewport?.removeEventListener("scroll", updatePosition);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  React.useLayoutEffect(() => {
    if (!open) return;
    document
      .getElementById(`${panelId}-option-${contextItems[activeIndex].id}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open, panelId]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % contextItems.length);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(
        (current) => (current - 1 + contextItems.length) % contextItems.length,
      );
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      attachItem(contextItems[activeIndex]);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      closePicker();
    }
  }

  return (
    <>
      <span
        ref={triggerRef}
        className="no-scrollbar flex min-w-7 flex-1 items-center gap-1 overflow-x-auto"
      >
        <AiChatComposerAction
          label="Add context"
          type="button"
          aria-controls={panelId}
          aria-expanded={open}
          className="shrink-0"
          onClick={() => setOpen((current) => !current)}
        >
          <Plus aria-hidden="true" />
        </AiChatComposerAction>

        {attachedItems.map((item) => {
          const Icon = item.icon;
          return (
            <span
              key={item.id}
              className="bg-muted text-foreground flex h-7 max-w-44 shrink-0 items-center gap-1.5 rounded-lg px-2 text-[11px]"
            >
              <Icon className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{item.label}</span>
              <button
                type="button"
                aria-label={`Remove ${item.label} context`}
                className="text-muted-foreground hover:text-foreground -mr-1 flex size-5 shrink-0 items-center justify-center rounded-md"
                onClick={() =>
                  setAttachedItems((current) =>
                    current.filter((attached) => attached.id !== item.id),
                  )
                }
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            </span>
          );
        })}
      </span>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={panelRef}
              tabIndex={-1}
              id={panelId}
              role="dialog"
              aria-label="Add context"
              onBlur={(event) => {
                const nextTarget = event.relatedTarget;
                if (
                  nextTarget instanceof Node &&
                  (event.currentTarget.contains(nextTarget) ||
                    triggerRef.current?.contains(nextTarget))
                )
                  return;
                setOpen(false);
              }}
              style={{
                left: 0,
                top: 0,
                visibility: "hidden",
                width: 0,
              }}
              className="bg-popover fixed z-[100] max-h-[calc(100dvh-1rem)] overflow-hidden rounded-xl border text-left shadow-lg outline-none"
            >
              <div
                tabIndex={-1}
                className="flex items-center justify-between border-b px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-foreground/90 text-xs font-normal">
                    Add context
                  </p>
                  <p className="text-muted-foreground/80 truncate text-[11px]">
                    Files, documents, and agents
                  </p>
                </div>
                <KbdGroup>
                  <Kbd>↑</Kbd>
                  <Kbd>↓</Kbd>
                  <Kbd>Enter</Kbd>
                </KbdGroup>
              </div>

              <div
                ref={listboxRef}
                role="listbox"
                aria-label="Available context"
                aria-multiselectable="true"
                aria-activedescendant={`${panelId}-option-${contextItems[activeIndex].id}`}
                tabIndex={0}
                onKeyDown={handleKeyDown}
                className="max-h-[min(16rem,calc(100dvh-4.5rem))] space-y-0.5 overflow-y-auto p-1"
              >
                {contextItems.map((item, index) => {
                  const Icon = item.icon;
                  const attached = attachedItems.some(
                    (attachedItem) => attachedItem.id === item.id,
                  );
                  return (
                    <button
                      key={item.id}
                      id={`${panelId}-option-${item.id}`}
                      type="button"
                      role="option"
                      aria-selected={attached}
                      tabIndex={-1}
                      onMouseEnter={() => setActiveIndex(index)}
                      onFocus={() => setActiveIndex(index)}
                      onClick={() => attachItem(item)}
                      className={cn(
                        "grid w-full grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-2.5 rounded-lg px-2 py-2 text-left outline-none",
                        index === activeIndex && "bg-muted",
                      )}
                    >
                      <span className="bg-muted/60 flex size-7 items-center justify-center rounded-md">
                        <Icon
                          className="text-muted-foreground size-4"
                          strokeWidth={1.5}
                          aria-hidden="true"
                        />
                      </span>
                      <span className="min-w-0">
                        <span className="text-foreground/90 block text-xs font-normal">
                          {item.label}
                        </span>
                        <span className="text-muted-foreground/80 block truncate text-[11px]">
                          {item.description}
                        </span>
                      </span>
                      <span className="text-muted-foreground/80 flex items-center gap-2 text-[11px] font-normal">
                        {attached ? (
                          <Check className="size-3.5" aria-hidden="true" />
                        ) : null}
                        {item.meta}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
