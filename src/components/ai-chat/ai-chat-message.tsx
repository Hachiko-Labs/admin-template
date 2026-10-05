"use client";

import { CheckCircle2, CircleAlert, LoaderCircle } from "lucide-react";
import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  AiChatArtifact,
  type AiChatArtifactPart,
} from "@/components/ai-chat/ai-chat-artifact";
import {
  AiChatSandbox,
  type AiChatSandboxPart,
  AiChatStackTrace,
  type AiChatStackTracePart,
  AiChatTestResults,
  type AiChatTestResultsPart,
} from "@/components/ai-chat/ai-chat-execution";
import {
  type AiChatSource,
  AiChatSources,
} from "@/components/ai-chat/ai-chat-sources";
import { AiUserMessage } from "@/components/ai-chat/ai-user-message";
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockFilename,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@/components/ai-elements/code-block";
import {
  InlineCitation,
  InlineCitationCard,
  InlineCitationCardBody,
  InlineCitationCardTrigger,
  InlineCitationSource,
  type InlineCitationSourceData,
  InlineCitationText,
} from "@/components/ai-elements/inline-citation";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import {
  Tool as AiTool,
  ToolContent as AiToolContent,
  ToolHeader as AiToolHeader,
  ToolInput as AiToolInput,
  ToolOutput as AiToolOutput,
} from "@/components/ai-elements/tool";
import { Button } from "@/components/ui/button";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ui/message";
import { cn } from "@/lib/utils";

export interface AiChatTextPart {
  type: "text";
  text: string;
}

export type AiChatCitedTextSegment =
  | { text: string; type: "text" }
  | {
      sources: InlineCitationSourceData[];
      text: string;
      type: "citation";
    };

export interface AiChatCitedTextPart {
  type: "cited-text";
  id: string;
  segments: AiChatCitedTextSegment[];
}

export interface AiChatCodePart {
  type: "code";
  code: string;
  filename: string;
  id: string;
  language?: string;
  showLineNumbers?: boolean;
}

export interface AiChatReasoningPart {
  type: "reasoning";
  id: string;
  duration?: number;
  isStreaming?: boolean;
  text: string;
}

export interface AiChatToolPart {
  type: "tool";
  id: string;
  label: string;
  detail?: string;
  error?: string;
  input?: unknown;
  output?: unknown;
  retryable?: boolean;
  state:
    | "approval-requested"
    | "approval-responded"
    | "input-streaming"
    | "input-available"
    | "output-available"
    | "output-denied"
    | "output-error";
}

export interface AiChatErrorPart {
  type: "error";
  id: string;
  message: string;
  retryLabel?: string;
  retryable?: boolean;
  title?: string;
}

export interface AiChatSourcesPart {
  type: "sources";
  sources: AiChatSource[];
}

export interface AiChatQuestionPart {
  type: "question";
  id: string;
  question: string;
  answer?: string;
  state: "pending" | "answered";
}

export interface AiChatCustomPart<TData = unknown> {
  type: "custom";
  id: string;
  name: string;
  data: TData;
}

export type AiChatMessagePart<TData = unknown> =
  | AiChatArtifactPart
  | AiChatCitedTextPart
  | AiChatCodePart
  | AiChatCustomPart<TData>
  | AiChatErrorPart
  | AiChatQuestionPart
  | AiChatReasoningPart
  | AiChatSandboxPart
  | AiChatSourcesPart
  | AiChatStackTracePart
  | AiChatTextPart
  | AiChatTestResultsPart
  | AiChatToolPart;

export interface AiChatMessageData<TData = unknown> {
  id: string;
  role: "assistant" | "user";
  parts: AiChatMessagePart<TData>[];
}

export type AiChatMessageStatus =
  | "complete"
  | "error"
  | "ready"
  | "streaming"
  | "thinking";

interface AiChatMessageProps<TData = unknown> {
  actions?: React.ReactNode;
  assistantAvatar?: React.ReactNode;
  assistantHeader?: React.ReactNode;
  className?: string;
  error?: string;
  isStreaming?: boolean;
  message: AiChatMessageData<TData>;
  onRetry?: () => void;
  onRegenerateArtifact?: (part: AiChatArtifactPart) => void;
  onRetrySandbox?: (part: AiChatSandboxPart) => void;
  onRetryPart?: (part: AiChatErrorPart | AiChatToolPart) => void;
  status?: AiChatMessageStatus;
  renderPart?: (input: {
    message: AiChatMessageData<TData>;
    part: AiChatMessagePart<TData>;
  }) => React.ReactNode | undefined;
}

function TextPart({ part }: { part: AiChatTextPart }) {
  if (!part.text.trim()) return null;

  return (
    <div className="prose prose-sm dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-7 prose-li:my-0 prose-pre:overflow-x-auto prose-pre:rounded-xl prose-pre:border prose-pre:bg-muted/40 prose-code:before:content-none prose-code:after:content-none prose-a:font-medium prose-a:underline prose-a:underline-offset-4 max-w-none px-1.5 text-[15px] leading-7 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{part.text}</ReactMarkdown>
    </div>
  );
}

function ReasoningPart({ part }: { part: AiChatReasoningPart }) {
  if (!part.text.trim()) return null;

  return (
    <Reasoning
      className="px-1.5"
      duration={part.duration}
      isStreaming={part.isStreaming}
    >
      <ReasoningTrigger />
      <ReasoningContent>{part.text}</ReasoningContent>
    </Reasoning>
  );
}

function CitedTextPart({ part }: { part: AiChatCitedTextPart }) {
  if (!part.segments.length) return null;

  return (
    <div className="px-1.5 text-[15px] leading-7">
      <p>
        {part.segments.map((segment, index) => {
          if (segment.type === "text") {
            return <React.Fragment key={index}>{segment.text}</React.Fragment>;
          }

          return (
            <InlineCitation
              key={`${segment.sources[0]?.id ?? "source"}-${index}`}
            >
              <InlineCitationText>{segment.text}</InlineCitationText>
              <InlineCitationCard>
                <InlineCitationCardTrigger sources={segment.sources} />
                <InlineCitationCardBody>
                  <div className="divide-y">
                    {segment.sources.map((source) => (
                      <InlineCitationSource key={source.id} source={source} />
                    ))}
                  </div>
                </InlineCitationCardBody>
              </InlineCitationCard>
            </InlineCitation>
          );
        })}
      </p>
    </div>
  );
}

function CodePart({ part }: { part: AiChatCodePart }) {
  if (!part.code.trim()) return null;

  return (
    <div className="px-1.5">
      <CodeBlock
        code={part.code}
        filename={part.filename}
        language={part.language ?? "text"}
        showLineNumbers={part.showLineNumbers}
      >
        <CodeBlockHeader>
          <CodeBlockTitle>
            <CodeBlockFilename />
          </CodeBlockTitle>
          <CodeBlockActions>
            <CodeBlockCopyButton />
          </CodeBlockActions>
        </CodeBlockHeader>
        <CodeBlockContent />
      </CodeBlock>
    </div>
  );
}

function RetryButton({
  label = "Retry",
  onClick,
}: {
  label?: string;
  onClick?: () => void;
}) {
  if (!onClick) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="ml-auto h-7 shrink-0 px-2 text-xs"
      onClick={onClick}
    >
      {label}
    </Button>
  );
}

function ToolPart({
  onRetry,
  part,
}: {
  onRetry?: () => void;
  part: AiChatToolPart;
}) {
  const pending =
    part.state === "input-streaming" || part.state === "input-available";
  const failed = part.state === "output-error";
  const denied = part.state === "output-denied";
  const rich = part.input !== undefined || part.output !== undefined;

  if (rich) {
    return (
      <div className="px-1.5">
        <AiTool defaultOpen={failed}>
          <AiToolHeader
            title={part.label}
            detail={part.detail}
            state={part.state}
          />
          <AiToolContent>
            {part.input !== undefined ? (
              <AiToolInput input={part.input} />
            ) : null}
            <AiToolOutput output={part.output} error={part.error} />
            {failed && part.retryable ? (
              <div className="flex justify-end">
                <RetryButton onClick={onRetry} />
              </div>
            ) : null}
          </AiToolContent>
        </AiTool>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "text-muted-foreground flex items-center gap-2 px-1.5 text-sm",
        failed && "text-destructive",
        denied && "text-orange-600",
      )}
    >
      {pending ? (
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
      ) : failed ? (
        <CircleAlert className="size-4" aria-hidden="true" />
      ) : denied ? (
        <CircleAlert className="size-4" aria-hidden="true" />
      ) : (
        <CheckCircle2 className="size-4" aria-hidden="true" />
      )}
      <span>{failed ? part.error || part.label : part.label}</span>
      {part.detail ? (
        <span className="text-muted-foreground/70 min-w-0 truncate text-xs">
          {part.detail}
        </span>
      ) : null}
      {failed && part.retryable ? <RetryButton onClick={onRetry} /> : null}
    </div>
  );
}

function ErrorPart({
  onRetry,
  part,
}: {
  onRetry?: () => void;
  part: AiChatErrorPart;
}) {
  return (
    <div
      className="border-destructive/20 bg-destructive/5 text-destructive flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm"
      role="alert"
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        {part.title ? <p className="font-medium">{part.title}</p> : null}
        <p className={cn(part.title && "text-destructive/80 text-xs")}>
          {part.message}
        </p>
      </div>
      {part.retryable ? (
        <RetryButton label={part.retryLabel} onClick={onRetry} />
      ) : null}
    </div>
  );
}

function QuestionPart({ part }: { part: AiChatQuestionPart }) {
  if (part.state !== "answered" || !part.answer) return null;

  return (
    <div className="px-1.5 text-sm">
      <span className="text-muted-foreground">{part.question}</span>{" "}
      <span className="font-medium">{part.answer}</span>
    </div>
  );
}

export function AiChatMessage<TData = unknown>({
  actions,
  assistantAvatar,
  assistantHeader,
  className,
  error,
  isStreaming = false,
  message,
  onRegenerateArtifact,
  onRetry,
  onRetryPart,
  onRetrySandbox,
  renderPart,
  status = "ready",
}: AiChatMessageProps<TData>) {
  if (message.role === "user") {
    const text = message.parts
      .filter((part): part is AiChatTextPart => part.type === "text")
      .map((part) => part.text)
      .join("");

    return <AiUserMessage>{text}</AiUserMessage>;
  }

  return (
    <Message align="start" className={className}>
      {assistantAvatar ? (
        <MessageAvatar className="self-start overflow-visible rounded-none bg-transparent">
          {assistantAvatar}
        </MessageAvatar>
      ) : null}
      <MessageContent className="gap-3">
        {assistantHeader}
        {message.parts.map((part, index) => {
          const key = "id" in part ? part.id : `${part.type}-${index}`;
          const renderedPart = renderPart?.({ message, part });
          if (renderedPart !== undefined) {
            return <div key={key}>{renderedPart}</div>;
          }

          switch (part.type) {
            case "artifact":
              return (
                <div key={key} className="px-1.5">
                  <AiChatArtifact
                    part={part}
                    onRegenerate={onRegenerateArtifact}
                  />
                </div>
              );
            case "text":
              return <TextPart key={key} part={part} />;
            case "cited-text":
              return <CitedTextPart key={key} part={part} />;
            case "code":
              return <CodePart key={key} part={part} />;
            case "reasoning":
              return <ReasoningPart key={key} part={part} />;
            case "sandbox":
              return (
                <div key={key} className="px-1.5">
                  <AiChatSandbox part={part} onRetry={onRetrySandbox} />
                </div>
              );
            case "test-results":
              return (
                <div key={key} className="px-1.5">
                  <AiChatTestResults part={part} />
                </div>
              );
            case "stack-trace":
              return (
                <div key={key} className="px-1.5">
                  <AiChatStackTrace part={part} />
                </div>
              );
            case "tool":
              return (
                <ToolPart
                  key={key}
                  part={part}
                  onRetry={
                    part.retryable && onRetryPart
                      ? () => onRetryPart(part)
                      : undefined
                  }
                />
              );
            case "error":
              return (
                <ErrorPart
                  key={key}
                  part={part}
                  onRetry={
                    part.retryable && onRetryPart
                      ? () => onRetryPart(part)
                      : undefined
                  }
                />
              );
            case "sources":
              return null;
            case "question":
              return <QuestionPart key={key} part={part} />;
            case "custom":
              return null;
          }
        })}
        {isStreaming || status === "streaming" || status === "thinking" ? (
          <div
            className="text-muted-foreground flex items-center gap-2 px-1.5 text-sm"
            role="status"
          >
            <LoaderCircle
              className="size-4 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
            {status === "thinking" ? "Thinking…" : "Generating response…"}
          </div>
        ) : null}
        {status === "error" ? (
          <div
            className="text-destructive flex items-center gap-2 rounded-xl px-1.5 text-sm"
            role="alert"
          >
            <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
            <span>{error || "The response could not be completed."}</span>
            <RetryButton onClick={onRetry} />
          </div>
        ) : null}
        {actions}
        {!isStreaming && status !== "streaming" && status !== "thinking"
          ? message.parts
              .filter(
                (part): part is AiChatSourcesPart => part.type === "sources",
              )
              .map((part, index) => (
                <AiChatSources
                  key={`sources-${index}`}
                  sources={part.sources}
                />
              ))
          : null}
      </MessageContent>
    </Message>
  );
}
