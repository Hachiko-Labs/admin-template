"use client";

import { ArrowDown } from "lucide-react";

import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
  useMessageScrollerVisibility,
} from "@/components/ui/message-scroller";
import { cn } from "@/lib/utils";

export interface AiConversationOutlineItem {
  id: string;
  label: string;
}

interface AiConversationScrollerProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  itemized?: boolean;
  outlineItems?: AiConversationOutlineItem[];
  showScrollButton?: boolean;
}

interface AiConversationTurnProps {
  children: React.ReactNode;
  className?: string;
  id: string;
}

export function AiConversationTurn({
  children,
  className,
  id,
}: AiConversationTurnProps) {
  return (
    <MessageScrollerItem
      messageId={id}
      scrollAnchor
      className={cn("flex min-w-0 flex-col gap-9", className)}
    >
      {children}
    </MessageScrollerItem>
  );
}

function ConversationOutline({
  items,
}: {
  items: AiConversationOutlineItem[];
}) {
  const { scrollToMessage } = useMessageScroller();
  const { currentAnchorId, visibleMessageIds } = useMessageScrollerVisibility();
  const activeId = currentAnchorId ?? visibleMessageIds[0] ?? items[0]?.id;

  return (
    <nav
      aria-label="Conversation outline"
      className="absolute top-1/2 left-2 z-10 flex -translate-y-1/2 flex-col items-start gap-0.5 py-1.5"
    >
      {items.map((item) => {
        const active = item.id === activeId;
        const visible = visibleMessageIds.includes(item.id);

        return (
          <button
            key={item.id}
            type="button"
            aria-label={`Jump to ${item.label}`}
            aria-current={active ? "step" : undefined}
            title={item.label}
            className="group flex h-3 w-5 items-center justify-start rounded-full focus-visible:outline-none"
            onClick={() =>
              scrollToMessage(item.id, {
                align: "start",
                behavior: "smooth",
                scrollMargin: 16,
              })
            }
          >
            <span
              className={cn(
                "block h-0.5 rounded-full transition-[width,background-color]",
                active
                  ? "bg-foreground w-4"
                  : visible
                    ? "bg-foreground/45 w-3"
                    : "bg-foreground/20 group-hover:bg-foreground/40 w-3",
              )}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </nav>
  );
}

export function AiConversationScroller({
  children,
  className,
  contentClassName,
  itemized = false,
  outlineItems,
  showScrollButton = true,
}: AiConversationScrollerProps) {
  return (
    <MessageScrollerProvider autoScroll defaultScrollPosition="start">
      <MessageScroller className={cn("min-h-0 flex-1", className)}>
        <MessageScrollerViewport aria-label="Conversation messages">
          <MessageScrollerContent
            className={cn("min-h-full gap-0", contentClassName)}
          >
            {itemized ? (
              children
            ) : (
              <MessageScrollerItem
                messageId="conversation-content"
                scrollAnchor
                className="min-h-full"
              >
                {children}
              </MessageScrollerItem>
            )}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        {outlineItems?.length ? (
          <ConversationOutline items={outlineItems} />
        ) : null}
        {showScrollButton ? (
          <MessageScrollerButton
            direction="end"
            className="bottom-3 shadow-md"
            aria-label="Scroll to latest message"
          >
            <ArrowDown aria-hidden="true" />
          </MessageScrollerButton>
        ) : null}
      </MessageScroller>
    </MessageScrollerProvider>
  );
}
