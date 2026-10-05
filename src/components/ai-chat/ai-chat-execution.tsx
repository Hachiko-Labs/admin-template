"use client";

import { LoaderCircle, Play, RotateCw } from "lucide-react";
import * as React from "react";

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
  Sandbox,
  SandboxContent,
  SandboxHeader,
  type SandboxState,
  SandboxTabContent,
  SandboxTabs,
  SandboxTabsBar,
  SandboxTabsList,
  SandboxTabsTrigger,
} from "@/components/ai-elements/sandbox";
import {
  StackTrace,
  StackTraceActions,
  StackTraceContent,
  StackTraceCopyButton,
  StackTraceError,
  StackTraceErrorMessage,
  StackTraceErrorType,
  StackTraceExpandButton,
  StackTraceFrames,
  StackTraceHeader,
} from "@/components/ai-elements/stack-trace";
import {
  Test,
  TestError,
  TestErrorMessage,
  TestResults,
  TestResultsContent,
  TestResultsDuration,
  TestResultsHeader,
  TestResultsProgress,
  TestResultsSummary,
  type TestResultsSummaryData,
  type TestResultStatus,
  TestSuite,
  TestSuiteContent,
  TestSuiteName,
  TestSuiteStats,
} from "@/components/ai-elements/test-results";
import { Button } from "@/components/ui/button";

export interface AiChatSandboxPart {
  type: "sandbox";
  code: string;
  detail?: string;
  filename: string;
  id: string;
  language?: string;
  output?: string;
  retryLabel?: string;
  state: SandboxState;
  title: string;
}

export interface AiChatTestCaseData {
  duration?: number;
  error?: string;
  name: string;
  status: TestResultStatus;
}

export interface AiChatTestSuiteData {
  name: string;
  status: TestResultStatus;
  tests: AiChatTestCaseData[];
}

export interface AiChatTestResultsPart {
  type: "test-results";
  id: string;
  suites: AiChatTestSuiteData[];
  summary: TestResultsSummaryData;
}

export interface AiChatStackTracePart {
  type: "stack-trace";
  defaultOpen?: boolean;
  id: string;
  trace: string;
}

function suiteStats(suite: AiChatTestSuiteData) {
  return suite.tests.reduce(
    (stats, test) => {
      stats[test.status] += 1;
      return stats;
    },
    { failed: 0, passed: 0, running: 0, skipped: 0 },
  );
}

export function AiChatSandbox({
  onRetry,
  part,
}: {
  onRetry?: (part: AiChatSandboxPart) => void;
  part: AiChatSandboxPart;
}) {
  const running = part.state === "input-available";
  const failed = part.state === "output-error";
  const defaultTab = part.state === "input-streaming" ? "code" : "output";

  return (
    <Sandbox>
      <SandboxHeader
        title={part.title}
        detail={part.detail}
        state={part.state}
      />
      <SandboxContent>
        <SandboxTabs key={`${part.id}-${defaultTab}`} defaultValue={defaultTab}>
          <SandboxTabsBar>
            <SandboxTabsList>
              <SandboxTabsTrigger value="code">Code</SandboxTabsTrigger>
              <SandboxTabsTrigger value="output">Output</SandboxTabsTrigger>
            </SandboxTabsList>
            {onRetry && failed ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2.5 text-xs"
                onClick={() => onRetry(part)}
              >
                <RotateCw aria-hidden="true" />
                {part.retryLabel ?? "Rerun"}
              </Button>
            ) : running ? (
              <span
                className="text-muted-foreground mr-1 flex items-center gap-1.5 text-[11px]"
                role="status"
              >
                <LoaderCircle
                  className="size-3 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
                Running tests
              </span>
            ) : (
              <span className="text-muted-foreground mr-1 flex items-center gap-1.5 text-[11px]">
                <Play className="size-3" aria-hidden="true" />
                {part.state === "output-available" ? "Exit 0" : "Preparing"}
              </span>
            )}
          </SandboxTabsBar>
          <SandboxTabContent value="code">
            <CodeBlock
              code={part.code}
              filename={part.filename}
              language={part.language ?? "text"}
              showLineNumbers
              className="rounded-none border-0"
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
          </SandboxTabContent>
          <SandboxTabContent value="output">
            <pre className="min-h-44 max-w-full overflow-auto bg-zinc-950 p-4 font-mono text-[11px] leading-5 whitespace-pre-wrap text-zinc-300">
              {part.output ?? (running ? "Starting test runner…" : "No output")}
            </pre>
          </SandboxTabContent>
        </SandboxTabs>
      </SandboxContent>
    </Sandbox>
  );
}

export function AiChatTestResults({ part }: { part: AiChatTestResultsPart }) {
  return (
    <TestResults summary={part.summary} aria-label="Test results">
      <TestResultsHeader>
        <TestResultsSummary />
        <TestResultsDuration />
      </TestResultsHeader>
      <TestResultsContent>
        <TestResultsProgress />
        {part.suites.map((suite) => {
          const stats = suiteStats(suite);
          return (
            <TestSuite
              key={suite.name}
              name={suite.name}
              status={suite.status}
              defaultOpen={suite.status !== "passed"}
            >
              <TestSuiteName>
                <span className="min-w-0 truncate">{suite.name}</span>
                <TestSuiteStats {...stats} />
              </TestSuiteName>
              <TestSuiteContent>
                {suite.tests.map((test) => (
                  <div key={test.name}>
                    <Test
                      name={test.name}
                      status={test.status}
                      duration={test.duration}
                    />
                    {test.error ? (
                      <TestError>
                        <TestErrorMessage>{test.error}</TestErrorMessage>
                      </TestError>
                    ) : null}
                  </div>
                ))}
              </TestSuiteContent>
            </TestSuite>
          );
        })}
      </TestResultsContent>
    </TestResults>
  );
}

export function AiChatStackTrace({ part }: { part: AiChatStackTracePart }) {
  return (
    <StackTrace trace={part.trace} defaultOpen={part.defaultOpen}>
      <StackTraceHeader>
        <StackTraceError>
          <div>
            <StackTraceErrorType />
            <StackTraceErrorMessage />
          </div>
        </StackTraceError>
        <StackTraceActions>
          <StackTraceCopyButton />
          <StackTraceExpandButton />
        </StackTraceActions>
      </StackTraceHeader>
      <StackTraceContent>
        <StackTraceFrames />
      </StackTraceContent>
    </StackTrace>
  );
}
