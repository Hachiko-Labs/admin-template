"use client";

import { RotateCcw } from "lucide-react";

import { AiChatMessage } from "@/components/ai-chat/ai-chat-message";
import type {
  MockChatMessage,
  MockChatStatus,
} from "@/components/ai-chat/use-mock-chat";
import { BrandMark } from "@/components/logo";
import { Button } from "@/components/ui/button";

export function AiMockChatTurns({
  messages,
  status,
  onRetry,
}: {
  messages: MockChatMessage[];
  status: MockChatStatus;
  onRetry: () => void;
}) {
  return (
    <>
      {messages.map((message, index) => (
        <div key={message.id} data-mock-role={message.role}>
          {message.role === "assistant" && !message.text ? (
            <div className="text-muted-foreground flex items-center gap-3 text-sm">
              <BrandMark size="sm" />
              <span role="status">
                {message.stopped ? "Response stopped." : "Thinking…"}
              </span>
              {message.stopped &&
                status === "ready" &&
                index === messages.length - 1 && (
                  <Button variant="ghost" size="sm" onClick={onRetry}>
                    <RotateCcw />
                    Retry
                  </Button>
                )}
            </div>
          ) : (
            <AiChatMessage
              message={{
                id: message.id,
                role: message.role,
                parts: [{ type: "text", text: message.text }],
              }}
              assistantAvatar={
                <div className="flex size-8 items-center justify-center rounded-lg border">
                  <BrandMark size="sm" />
                </div>
              }
              assistantHeader={
                <span className="mb-1 block text-[13px] font-medium">
                  Shadcnblocks AI
                </span>
              }
              actions={
                message.role === "assistant" &&
                index === messages.length - 1 &&
                status === "ready" ? (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={onRetry}>
                      <RotateCcw />
                      Retry
                    </Button>
                    <span className="text-muted-foreground text-xs">
                      {message.stopped ? "Stopped · " : ""}Simulated reply
                    </span>
                  </div>
                ) : undefined
              }
            />
          )}
        </div>
      ))}
    </>
  );
}
