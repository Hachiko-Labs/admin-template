import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Message, MessageContent } from "@/components/ui/message";

export function AiUserMessage({ children }: { children: React.ReactNode }) {
  return (
    <Message align="end">
      <MessageContent>
        <Bubble
          align="end"
          variant="muted"
          className="max-w-[88%] md:max-w-[72%]"
        >
          <BubbleContent className="border-0 leading-6">
            {children}
          </BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  );
}
