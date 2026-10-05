"use client";

import {
  Check,
  Copy,
  Download,
  Hash,
  LetterText,
  Loader2,
  Type,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { downloadFile } from "./platform-data";
import { NoResults, PlatformPage, PlatformSelect } from "./platform-ui";
import type {
  TokenEncoding,
  TokenizerRequest,
  TokenizerResult,
} from "./tokenizer-types";

const examples = {
  "Support prompt":
    "You are a helpful support assistant. Answer the customer’s question using the provided knowledge base. If you’re unsure, ask a clarifying question.\n\nCustomer: How do I invite my team to a workspace?",
  Code: 'function greet(name: string) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet("world"));',
  Multilingual:
    "Hello, world! Bonjour le monde ! नमस्ते दुनिया! こんにちは世界 🌍\nLanguage connects us.",
  "Structured data":
    '{\n  "project": "Support copilot",\n  "enabled": true,\n  "tools": ["file_search", "create_ticket"],\n  "max_turns": 12\n}',
};

export function TokenizerScreen() {
  const [encoding, setEncoding] = useState<TokenEncoding>("o200k_base");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState(examples["Support prompt"]);
  const [sample, setSample] = useState("Support prompt");
  const [result, setResult] = useState<TokenizerResult | null>(null);
  const [pending, setPending] = useState(true);
  const [workerError, setWorkerError] = useState("");
  const [selected, setSelected] = useState(0);
  const [whitespace, setWhitespace] = useState(false);
  const [outputTab, setOutputTab] = useState("tokens");
  const [copied, setCopied] = useState(false);
  const [budget, setBudget] = useState("4096");
  const worker = useRef<Worker | null>(null);
  const sequence = useRef(0);
  useEffect(() => {
    const instance = new Worker(
      new URL("./tokenizer.worker.ts", import.meta.url),
      { type: "module" },
    );
    worker.current = instance;
    instance.onmessage = (event: MessageEvent<TokenizerResult>) => {
      if (event.data.sequence === sequence.current) {
        setResult(event.data);
        setPending(false);
      }
    };
    instance.onerror = () => {
      setWorkerError("The tokenizer could not load. Reload the page to retry.");
      setPending(false);
    };
    return () => {
      instance.terminate();
      worker.current = null;
    };
  }, []);
  useEffect(() => {
    const current = ++sequence.current;
    const timer = setTimeout(() => {
      worker.current?.postMessage({
        sequence: current,
        encoding,
        mode,
        input,
      } satisfies TokenizerRequest);
    }, 180);
    return () => clearTimeout(timer);
  }, [input, mode, encoding]);
  function changeInput(value: string) {
    if (value !== input) {
      setInput(value);
      setPending(true);
    }
    setSelected(0);
    setCopied(false);
  }
  function changeMode(value: string) {
    if (value === mode) return;
    if (value !== "encode" && value !== "decode") return;
    setMode(value);
    setPending(true);
    changeInput(
      value === "decode"
        ? JSON.stringify(result?.ids ?? [13225, 11, 2375, 0])
        : result?.text || examples["Support prompt"],
    );
  }
  function reset() {
    if (mode !== "encode" || encoding !== "o200k_base") setPending(true);
    setMode("encode");
    setEncoding("o200k_base");
    changeInput(examples["Support prompt"]);
    setSample("Support prompt");
    setBudget("4096");
    setWhitespace(false);
    setOutputTab("tokens");
  }
  const piece =
    result?.pieces[Math.min(selected, (result?.pieces.length ?? 1) - 1)];
  const text = result?.text ?? "";
  const count = result?.ids.length ?? 0;
  const tokenBudget = Math.max(1, Number(budget) || 1);
  const error = workerError || result?.error;
  const ready = !pending && !error;
  const exportData = {
    encoding,
    text,
    tokens: result?.ids ?? [],
    token_count: count,
    character_count: [...text].length,
  };
  return (
    <PlatformPage
      title="Tokenizer"
      description="See how text becomes tokens. Compare encodings, inspect token IDs, and plan how much context your prompt needs."
      onReset={reset}
      actions={
        <Button
          variant="outline"
          disabled={!ready}
          onClick={() =>
            downloadFile(
              "tokenizer-result.json",
              JSON.stringify(exportData, null, 2),
              "application/json",
            )
          }
        >
          <Download />
          Export analysis
        </Button>
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <PlatformSelect
            label="Encoding"
            value={encoding}
            onChange={(value) => {
              if (value !== "o200k_base" && value !== "cl100k_base") return;
              setEncoding(value);
              setPending(true);
              setSelected(0);
              setCopied(false);
            }}
            options={[
              { value: "o200k_base", label: "o200k_base" },
              { value: "cl100k_base", label: "cl100k_base" },
            ]}
          />
          <Badge variant="outline">
            <span className="bg-success mr-1.5 size-1.5 rounded-full" />
            Local BPE tokenizer
          </Badge>
        </div>
        <span className="text-muted-foreground text-xs">
          Plain text only · no API calls
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          {
            title: "Tokens",
            value: count.toLocaleString("en-US"),
            detail: `Exact count for ${encoding}`,
            icon: Hash,
          },
          {
            title: "Characters",
            value: [...text].length.toLocaleString("en-US"),
            detail: "Unicode code points, including spaces",
            icon: LetterText,
          },
          {
            title: "Chars / token",
            value: count ? ([...text].length / count).toFixed(2) : "0",
            detail: "Varies with language and content",
            icon: Type,
          },
        ].map(({ title, value, detail, icon: Icon }) => (
          <Card key={title} className="shadow-none">
            <CardHeader className="flex-row items-center justify-between px-3 pt-3 pb-2 sm:px-5 sm:pt-5 sm:pb-3">
              <CardDescription className="text-[11px] sm:text-sm">
                {title}
              </CardDescription>
              <Icon className="text-muted-foreground hidden size-4 sm:block" />
            </CardHeader>
            <CardContent className="flex flex-col gap-1 px-3 pb-3 sm:px-5 sm:pb-5">
              <p className="text-xl font-semibold tracking-tight tabular-nums sm:text-3xl">
                {pending ? "…" : error ? "—" : value}
              </p>
              <p className="text-muted-foreground hidden text-xs sm:block">
                {detail}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex min-w-0 flex-col gap-5">
        <div className="grid min-w-0 items-start gap-5 xl:grid-cols-2">
          <Card className="min-w-0 shadow-none">
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Input</CardTitle>
                <CardDescription className="mt-1">
                  {mode === "encode"
                    ? "Edit text to update the token breakdown."
                    : "Paste token IDs to recover their decoded text."}
                </CardDescription>
              </div>
              <Tabs value={mode} onValueChange={changeMode}>
                <TabsList>
                  <TabsTrigger value="encode">Text → tokens</TabsTrigger>
                  <TabsTrigger value="decode">Tokens → text</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Field>
                <FieldLabel htmlFor="tokenizer-input" className="sr-only">
                  {mode === "encode"
                    ? "Text to tokenize"
                    : "Token IDs to decode"}
                </FieldLabel>
                <Textarea
                  id="tokenizer-input"
                  value={input}
                  onChange={(e) => changeInput(e.target.value)}
                  rows={7}
                  maxLength={mode === "encode" ? 20000 : 80000}
                  spellCheck={false}
                  className="min-h-48 resize-y font-mono text-sm leading-7"
                  placeholder={
                    mode === "encode"
                      ? "Type or paste text…"
                      : "[13225, 11, 2375, 0]"
                  }
                />
              </Field>
              <div className="flex flex-wrap items-center justify-between gap-3">
                {mode === "encode" ? (
                  <PlatformSelect
                    label="Load example"
                    value={sample}
                    onChange={(value) => {
                      const example = Object.entries(examples).find(
                        ([name]) => name === value,
                      );
                      if (!example) return;
                      setSample(example[0]);
                      changeInput(example[1]);
                    }}
                    options={Object.keys(examples)}
                  />
                ) : (
                  <span className="text-muted-foreground text-xs">
                    JSON array or comma-separated IDs
                  </span>
                )}
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {input.length.toLocaleString("en-US")} /{" "}
                    {mode === "encode" ? "20,000" : "80,000"}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => changeInput("")}
                    disabled={!input}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="min-w-0 shadow-none">
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Token breakdown</CardTitle>
                <CardDescription className="mt-1">
                  Hover or focus a token to inspect its ID and bytes.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="token-whitespace"
                  checked={whitespace}
                  onCheckedChange={setWhitespace}
                />
                <label
                  htmlFor="token-whitespace"
                  className="text-muted-foreground text-xs"
                >
                  Show whitespace
                </label>
              </div>
            </CardHeader>
            <CardContent className="flex min-w-0 flex-col gap-4">
              <Tabs value={outputTab} onValueChange={setOutputTab}>
                <TabsList>
                  <TabsTrigger value="tokens">Text</TabsTrigger>
                  <TabsTrigger value="ids">Token IDs</TabsTrigger>
                  <TabsTrigger value="json">JSON</TabsTrigger>
                </TabsList>
                <div className="mt-4">
                  {pending && !workerError ? (
                    <div
                      className="text-muted-foreground flex min-h-40 items-center justify-center gap-2 text-sm"
                      role="status"
                    >
                      <Loader2 className="size-4 animate-spin" />
                      Loading encoding and tokenizing…
                    </div>
                  ) : error ? (
                    <NoResults
                      title="Could not process this input"
                      description={error}
                    />
                  ) : !count ? (
                    <NoResults
                      title="Your tokens will appear here"
                      description="Enter text or load an example to explore its token breakdown."
                    />
                  ) : (
                    <>
                      <TabsContent
                        value="tokens"
                        className="bg-background rounded-xl border p-4"
                      >
                        <div
                          className="min-h-40 font-mono text-sm leading-9 break-words"
                          data-token-preview
                        >
                          {result?.pieces.slice(0, 1500).map((item, index) => (
                            <button
                              key={`${item.index}-${item.ids.join("-")}`}
                              onMouseEnter={() => setSelected(index)}
                              onFocus={() => setSelected(index)}
                              onClick={() => setSelected(index)}
                              aria-label={`Inspect token ${item.index + 1}, IDs ${item.ids.join(", ")}`}
                              aria-pressed={index === selected}
                              title={`Token ${item.index + 1} · ${item.ids.join(", ")}`}
                              className={cn(
                                "mr-1 rounded-md px-1.5 py-0.5 leading-6 break-all whitespace-pre-wrap outline-offset-2 transition-colors duration-150",
                                index === selected
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-foreground/80",
                              )}
                            >
                              {whitespace
                                ? item.text
                                    .replaceAll(" ", "·")
                                    .replaceAll("\n", "↵\n")
                                    .replaceAll("\t", "⇥")
                                : item.text || "∅"}
                            </button>
                          ))}
                        </div>
                        {ready && piece && (
                          <div
                            aria-label="Selected token details"
                            className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-dashed pt-4"
                          >
                            <code className="bg-primary text-primary-foreground max-w-full rounded-md px-2 py-1 text-xs break-all whitespace-pre-wrap">
                              {whitespace
                                ? piece.text
                                    .replaceAll(" ", "·")
                                    .replaceAll("\n", "↵\n")
                                    .replaceAll("\t", "⇥")
                                : JSON.stringify(piece.text)}
                            </code>
                            <div className="flex min-w-0 flex-wrap items-center gap-3 text-xs">
                              <span className="text-muted-foreground">
                                {piece.ids.length > 1 ? "IDs" : "ID"}{" "}
                                <code className="text-foreground break-all">
                                  {piece.ids.join(", ")}
                                </code>
                              </span>
                              <div className="flex flex-wrap items-center gap-1">
                                <span className="text-muted-foreground mr-1">
                                  UTF-8
                                </span>
                                {Array.from(
                                  new TextEncoder().encode(piece.text),
                                ).map((byte, index) => (
                                  <code
                                    key={index}
                                    className="bg-muted rounded px-1.5 py-1"
                                  >
                                    {byte.toString(16).padStart(2, "0")}
                                  </code>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        {(result?.pieces.length ?? 0) > 1500 && (
                          <p className="text-muted-foreground mt-4 text-xs">
                            Showing the first 1,500 pieces. Counts and exports
                            include the complete input.
                          </p>
                        )}
                      </TabsContent>
                      <TabsContent value="ids">
                        <pre className="bg-muted/50 max-h-72 overflow-auto rounded-lg p-4 text-xs leading-7 break-all whitespace-pre-wrap">
                          [{result?.ids.join(", ")}]
                        </pre>
                      </TabsContent>
                      <TabsContent value="json">
                        <pre className="bg-muted/50 max-h-72 overflow-auto rounded-lg p-4 text-xs leading-6">
                          {JSON.stringify(exportData, null, 2)}
                        </pre>
                      </TabsContent>
                    </>
                  )}
                </div>
              </Tabs>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
                <p className="text-muted-foreground max-w-md text-xs leading-5">
                  Some Unicode characters span multiple tokens. Their fragments
                  are grouped into one readable piece.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!ready || !count}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(
                        JSON.stringify(result?.ids),
                      );
                      setCopied(true);
                    } catch {
                      toast.error("Clipboard unavailable");
                    }
                  }}
                >
                  {copied ? <Check /> : <Copy />}
                  {copied ? "Copied" : "Copy IDs"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid items-start gap-5 md:grid-cols-2">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Selected piece</CardTitle>
              <CardDescription>
                Explore the text behind a token.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {ready && piece ? (
                <>
                  <pre className="bg-muted/60 rounded-lg border p-4 font-mono text-base break-all whitespace-pre-wrap">
                    {JSON.stringify(piece.text)}
                  </pre>
                  <dl className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-muted-foreground text-xs">
                        Position
                      </dt>
                      <dd className="mt-1 tabular-nums">{piece.index + 1}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs">
                        Tokens in piece
                      </dt>
                      <dd className="mt-1 tabular-nums">{piece.ids.length}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-muted-foreground text-xs">
                        Token IDs
                      </dt>
                      <dd className="mt-1 font-mono text-xs break-all">
                        {piece.ids.join(", ")}
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-muted-foreground text-xs">
                        Decoded UTF-8 bytes
                      </dt>
                      <dd className="mt-1 font-mono text-xs leading-6 break-all">
                        {Array.from(new TextEncoder().encode(piece.text))
                          .map((byte) => byte.toString(16).padStart(2, "0"))
                          .join(" ")}
                      </dd>
                    </div>
                  </dl>
                </>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Choose a piece in the token preview.
                </p>
              )}
            </CardContent>
          </Card>
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Prompt budget</CardTitle>
              <CardDescription>
                Compare this text against your own token limit.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Field>
                <FieldLabel htmlFor="token-budget">Token budget</FieldLabel>
                <Input
                  id="token-budget"
                  type="number"
                  min={1}
                  max={10000000}
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </Field>
              <Progress
                aria-label="Token budget used"
                value={Math.min(100, (count / tokenBudget) * 100)}
              />
              <p
                className={cn(
                  "text-xs",
                  count > tokenBudget
                    ? "text-destructive"
                    : "text-muted-foreground",
                )}
              >
                {ready
                  ? count > tokenBudget
                    ? `${(count - tokenBudget).toLocaleString("en-US")} tokens over budget`
                    : `${(tokenBudget - count).toLocaleString("en-US")} tokens remaining`
                  : "Waiting for token count…"}
              </p>
              <p className="text-muted-foreground text-xs leading-5">
                This covers plain text. Message formatting, tools, and generated
                output use additional tokens in an API request.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground text-xs leading-5 md:col-span-2">
            Powered by{" "}
            <a
              className="underline underline-offset-4"
              href="https://github.com/niieani/gpt-tokenizer"
              target="_blank"
              rel="noreferrer"
            >
              gpt-tokenizer
            </a>
            . Your text is processed in a browser worker. Special token strings
            are treated as ordinary text.
          </p>
        </div>
      </div>
    </PlatformPage>
  );
}
