"use client";

import {
  ArrowLeft,
  ArrowUpRight,
  Braces,
  Check,
  ChevronDown,
  Copy,
  Eye,
  FileText,
  MessageSquare,
  Play,
  RotateCcw,
  Square,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SiAnthropic } from "react-icons/si";
import { toast } from "sonner";

import { AiWorkspaceShell } from "@/components/ai-chat/ai-workspace-shell";
import {
  CodeBlock,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
} from "@/components/ai-elements/code-block";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import {
  inputFields,
  MODEL_ID,
  modelExamples,
  requestCode,
  requestSchema,
  sampleResponse,
} from "./model-detail-data";

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard");
  } catch {
    toast.error("Could not copy. Please select and copy the text.");
  }
}

export function ModelDetailScreen() {
  const [example, setExample] = useState(0);
  const [language, setLanguage] = useState("typescript");
  const [responseView, setResponseView] = useState("output");
  const [running, setRunning] = useState(false);
  const [visibleLength, setVisibleLength] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const current = modelExamples[example];

  function stop() {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setRunning(false);
  }
  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );

  function selectExample(index: number) {
    stop();
    setExample(index);
    setVisibleLength(null);
  }
  function replay() {
    stop();
    setResponseView("output");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisibleLength(null);
      return;
    }
    setVisibleLength(0);
    setRunning(true);
    let length = 0;
    timer.current = setInterval(() => {
      length = Math.min(length + 9, current.output.length);
      setVisibleLength(length);
      if (length === current.output.length) stop();
    }, 35);
  }

  return (
    <AiWorkspaceShell
      hideNavigationSidebar
      headerTitle="Model details"
      headerActions={
        <Button variant="ghost" size="sm" asChild>
          <Link href="/ai-chat/model-catalog">
            <ArrowLeft className="size-4" />
            Model catalog
          </Link>
        </Button>
      }
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1480px] px-5 py-8 sm:px-8 lg:px-10">
          <header className="border-b pb-7">
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border">
                <SiAnthropic className="size-6" />
              </div>
              <div>
                <p className="text-muted-foreground mb-1 text-xs">Anthropic</p>
                <h1 className="text-2xl font-semibold tracking-tight">
                  Claude Fable 5.1
                </h1>
              </div>
            </div>
            <button
              onClick={() => void copyText(MODEL_ID)}
              className="text-muted-foreground hover:text-foreground mt-4 inline-flex max-w-full items-center gap-2 rounded-sm text-xs focus-visible:outline-2 focus-visible:outline-offset-4"
              aria-label="Copy model ID"
            >
              <code className="truncate">{MODEL_ID}</code>
              <Copy className="size-3.5 shrink-0" />
            </button>
            <p className="text-muted-foreground mt-3 max-w-3xl text-sm leading-6">
              Built for complex coding, long-running agent workflows, and
              knowledge work. A million-token context window keeps large
              codebases and lengthy conversations within reach.
            </p>
            <div className="text-muted-foreground mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs">
              {[
                [MessageSquare, "Text generation"],
                [Eye, "Vision"],
                [Braces, "Reasoning"],
                [Wrench, "Tool use"],
                [FileText, "File input"],
              ].map(([Icon, label]) => {
                const CapabilityIcon = Icon as typeof Eye;
                return (
                  <span
                    key={String(label)}
                    className="inline-flex items-center gap-1.5"
                  >
                    <CapabilityIcon className="size-3.5" />
                    {String(label)}
                  </span>
                );
              })}
            </div>
          </header>

          <div className="grid min-w-0 gap-9 pt-7 lg:grid-cols-[minmax(0,1fr)_240px] xl:grid-cols-[minmax(0,1fr)_260px] xl:gap-10">
            <div className="min-w-0 space-y-9">
              <section aria-labelledby="quickstart-title">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 id="quickstart-title" className="text-base font-semibold">
                    Quick start
                  </h2>
                  <span className="text-muted-foreground text-xs">
                    Sample requests & responses
                  </span>
                </div>
                <div
                  className="mb-5 grid gap-2 sm:grid-cols-3"
                  role="group"
                  aria-label="Request examples"
                >
                  {modelExamples.map((item, index) => (
                    <button
                      key={item.id}
                      aria-pressed={example === index}
                      onClick={() => selectExample(index)}
                      className={cn(
                        "relative rounded-lg border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
                        example === index
                          ? "border-foreground/35 bg-muted/40"
                          : "hover:bg-muted/30",
                      )}
                    >
                      <span className="flex items-center justify-between gap-2 text-xs font-medium">
                        {item.title}
                        {example === index && (
                          <Check className="size-3.5 shrink-0" />
                        )}
                      </span>
                      <span className="text-muted-foreground mt-1.5 block text-xs leading-5">
                        {item.description}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="grid min-w-0 overflow-hidden rounded-lg border 2xl:grid-cols-2">
                  <div className="min-w-0 border-b 2xl:border-r 2xl:border-b-0">
                    <Tabs value={language} onValueChange={setLanguage}>
                      <CodeBlock
                        className="rounded-none border-0"
                        code={requestCode(example, language)}
                        language={language === "curl" ? "bash" : "typescript"}
                        filename={
                          language === "curl" ? "request.sh" : "request.ts"
                        }
                      >
                        <CodeBlockHeader className="h-12 px-3">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-medium">Request</span>
                            <TabsList className="h-7 bg-transparent p-0">
                              <TabsTrigger
                                className="px-2 text-xs"
                                value="typescript"
                              >
                                TypeScript
                              </TabsTrigger>
                              <TabsTrigger
                                className="px-2 text-xs"
                                value="curl"
                              >
                                cURL
                              </TabsTrigger>
                            </TabsList>
                          </div>
                          <CodeBlockCopyButton
                            onError={() =>
                              toast.error("Could not copy request")
                            }
                          />
                        </CodeBlockHeader>
                        <CodeBlockContent viewportHeight={360} />
                      </CodeBlock>
                    </Tabs>
                  </div>
                  <div className="min-w-0">
                    <Tabs value={responseView} onValueChange={setResponseView}>
                      <div className="bg-muted/25 flex h-12 items-center justify-between gap-2 border-b px-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-medium">Response</span>
                          <TabsList className="h-7 bg-transparent p-0">
                            <TabsTrigger
                              className="px-2 text-xs"
                              value="output"
                            >
                              Output
                            </TabsTrigger>
                            <TabsTrigger className="px-2 text-xs" value="json">
                              JSON
                            </TabsTrigger>
                          </TabsList>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Copy sample response"
                          onClick={() =>
                            void copyText(
                              responseView === "json"
                                ? sampleResponse(example)
                                : current.output,
                            )
                          }
                        >
                          <Copy className="size-3.5" />
                        </Button>
                      </div>
                      <TabsContent
                        value="output"
                        className="m-0 h-[360px] overflow-auto p-5"
                      >
                        <p className="text-sm leading-6 whitespace-pre-wrap">
                          {visibleLength === null
                            ? current.output
                            : current.output.slice(0, visibleLength)}
                          {running && (
                            <span className="bg-foreground ml-0.5 inline-block h-3.5 w-0.5 align-middle" />
                          )}
                        </p>
                      </TabsContent>
                      <TabsContent value="json" className="m-0">
                        <CodeBlock
                          code={sampleResponse(example)}
                          language="json"
                          filename="response.json"
                          className="rounded-none border-0"
                        >
                          <CodeBlockContent viewportHeight={360} />
                        </CodeBlock>
                      </TabsContent>
                    </Tabs>
                  </div>
                  <div className="bg-muted/15 flex flex-wrap items-center justify-between gap-3 border-t px-3 py-2.5 2xl:col-span-2">
                    <span className="text-muted-foreground text-xs">
                      Illustrative output · No API request is sent
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={running ? stop : replay}
                    >
                      {running ? (
                        <Square className="size-3" />
                      ) : visibleLength === null ? (
                        <Play className="size-3" />
                      ) : (
                        <RotateCcw className="size-3" />
                      )}
                      {running ? "Stop replay" : "Replay sample"}
                    </Button>
                  </div>
                </div>
                <p className="text-muted-foreground mt-3 text-xs leading-5">
                  Set API_BASE_URL and API_KEY to use these examples with your
                  workspace’s Messages API.
                </p>
              </section>

              <section aria-labelledby="api-title">
                <Tabs defaultValue="parameters">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
                    <h2 id="api-title" className="text-base font-semibold">
                      API reference
                    </h2>
                    <TabsList>
                      <TabsTrigger value="parameters">Parameters</TabsTrigger>
                      <TabsTrigger value="schema">JSON schema</TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="parameters" className="mt-0">
                    <div className="grid gap-7 lg:grid-cols-2">
                      <div>
                        <h3 className="py-4 text-sm font-medium">Input</h3>
                        <div className="divide-y">
                          {inputFields.map((field) => (
                            <div key={field.name} className="py-3 first:pt-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <code className="text-xs font-medium">
                                  {field.name}
                                </code>
                                <span className="text-muted-foreground text-xs">
                                  {field.type}
                                </span>
                                {field.required && (
                                  <span className="text-muted-foreground ml-auto text-[11px]">
                                    Required
                                  </span>
                                )}
                              </div>
                              <p className="text-muted-foreground mt-1.5 text-xs leading-5">
                                {field.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="py-4 text-sm font-medium">Output</h3>
                        <div className="divide-y">
                          {[
                            [
                              "id",
                              "string",
                              "Unique identifier for the generated message.",
                            ],
                            [
                              "content",
                              "object[]",
                              "The text and other content blocks returned by the model.",
                            ],
                            [
                              "stop_reason",
                              "string | null",
                              "Why the model stopped, such as end_turn or max_tokens.",
                            ],
                          ].map(([name, type, description]) => (
                            <div key={name} className="py-3 first:pt-0">
                              <div className="flex items-center gap-2">
                                <code className="text-xs font-medium">
                                  {name}
                                </code>
                                <span className="text-muted-foreground text-xs">
                                  {type}
                                </span>
                              </div>
                              <p className="text-muted-foreground mt-1.5 text-xs leading-5">
                                {description}
                              </p>
                            </div>
                          ))}
                          <details className="group py-3">
                            <summary className="flex cursor-pointer list-none items-center gap-2 text-xs">
                              <code className="font-medium">usage</code>
                              <span className="text-muted-foreground">
                                object
                              </span>
                              <ChevronDown className="ml-auto size-3.5 transition-transform group-open:rotate-180" />
                            </summary>
                            <p className="text-muted-foreground mt-1.5 text-xs leading-5">
                              Token counts for the completed request.
                            </p>
                            <div className="mt-3 space-y-3 border-l pl-3">
                              {["input_tokens", "output_tokens"].map((name) => (
                                <div
                                  key={name}
                                  className="flex justify-between text-xs"
                                >
                                  <code>{name}</code>
                                  <span className="text-muted-foreground">
                                    integer
                                  </span>
                                </div>
                              ))}
                            </div>
                          </details>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="schema">
                    <CodeBlock
                      code={requestSchema}
                      language="json"
                      filename="input.schema.json"
                    >
                      <CodeBlockHeader>
                        <span className="text-muted-foreground text-xs">
                          Input schema
                        </span>
                        <CodeBlockCopyButton />
                      </CodeBlockHeader>
                      <CodeBlockContent />
                    </CodeBlock>
                  </TabsContent>
                </Tabs>
              </section>
            </div>

            <aside className="min-w-0 space-y-7 border-t pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-7">
              <section>
                <h2 className="text-sm font-semibold">Pricing</h2>
                <p className="text-muted-foreground mt-1 text-xs">
                  USD per 1M tokens
                </p>
                <dl className="mt-3 divide-y">
                  {[
                    ["Input", "$10.00"],
                    ["Output", "$50.00"],
                    ["Cache read", "$0.25"],
                    ["Cache write", "$12.50"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between py-3 text-sm"
                    >
                      <dt className="text-muted-foreground">{label}</dt>
                      <dd className="font-medium tabular-nums">{value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
              <section className="border-t pt-6">
                <h2 className="text-sm font-semibold">Model specifications</h2>
                <dl className="mt-4 space-y-4">
                  {[
                    ["Context window", "1M tokens"],
                    ["Maximum output", "128K tokens"],
                    ["Adaptive thinking", "Supported"],
                    ["Architecture", "Transformer"],
                    ["API format", "Messages API"],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-muted-foreground text-xs">{label}</dt>
                      <dd className="mt-1 text-sm">{value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
              <section className="border-t pt-6">
                <h2 className="mb-3 text-sm font-semibold">Resources</h2>
                {[
                  ["Model catalog", "/ai-chat/model-catalog"],
                  ["Compare pricing", "/ai-chat/model-pricing"],
                  ["Manage API keys", "/ai-chat/api-keys"],
                ].map(([label, url]) => (
                  <Link
                    key={label}
                    href={url}
                    className="text-muted-foreground hover:text-foreground flex items-center justify-between gap-2 py-2 text-xs"
                  >
                    {label}
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                ))}
              </section>
              <p className="text-muted-foreground border-t pt-4 text-[11px] leading-5">
                Pricing snapshot · 19 September 2026. Rates may vary by
                provider.
              </p>
            </aside>
          </div>
        </div>
      </div>
    </AiWorkspaceShell>
  );
}
