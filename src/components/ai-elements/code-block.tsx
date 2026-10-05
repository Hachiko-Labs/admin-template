"use client";

import {
  type FileContents,
  preloadHighlighter,
  type SupportedLanguages,
} from "@pierre/diffs";
import { File } from "@pierre/diffs/react";
import { Check, Copy, FileCode2 } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CodeBlockContextValue {
  code: string;
  filename: string;
  language: SupportedLanguages;
  showLineNumbers: boolean;
}

const CodeBlockContext = React.createContext<CodeBlockContextValue | null>(
  null,
);

function useCodeBlock() {
  const context = React.useContext(CodeBlockContext);
  if (!context) throw new Error("CodeBlock components must be used together");
  return context;
}

export type CodeBlockProps = Omit<React.ComponentProps<"div">, "children"> & {
  children?: React.ReactNode;
  code: string;
  filename?: string;
  language?: SupportedLanguages;
  showLineNumbers?: boolean;
};

export function CodeBlock({
  children,
  className,
  code,
  filename = "code.txt",
  language = "text",
  showLineNumbers = false,
  ...props
}: CodeBlockProps) {
  const value = React.useMemo(
    () => ({ code, filename, language, showLineNumbers }),
    [code, filename, language, showLineNumbers],
  );

  return (
    <CodeBlockContext.Provider value={value}>
      <div
        className={cn(
          "bg-background flex min-w-0 flex-col overflow-hidden rounded-lg border",
          className,
        )}
        data-language={language}
        {...props}
      >
        {children ?? <CodeBlockContent />}
      </div>
    </CodeBlockContext.Provider>
  );
}

export type CodeBlockHeaderProps = React.ComponentProps<"div">;

export function CodeBlockHeader({ className, ...props }: CodeBlockHeaderProps) {
  return (
    <div
      className={cn(
        "bg-muted/25 flex h-9 shrink-0 items-center justify-between gap-2 border-b px-2.5",
        className,
      )}
      {...props}
    />
  );
}

export type CodeBlockTitleProps = React.ComponentProps<"div">;

export function CodeBlockTitle({
  children,
  className,
  ...props
}: CodeBlockTitleProps) {
  return (
    <div
      className={cn(
        "text-muted-foreground flex min-w-0 items-center gap-2 text-xs",
        className,
      )}
      {...props}
    >
      {children ?? <FileCode2 className="size-3.5" aria-hidden="true" />}
    </div>
  );
}

export type CodeBlockFilenameProps = React.ComponentProps<"span">;

export function CodeBlockFilename({
  children,
  className,
  ...props
}: CodeBlockFilenameProps) {
  const { filename } = useCodeBlock();

  return (
    <span
      className={cn("min-w-0 truncate font-mono text-[11px]", className)}
      {...props}
    >
      {children ?? filename}
    </span>
  );
}

export type CodeBlockActionsProps = React.ComponentProps<"div">;

export function CodeBlockActions({
  className,
  ...props
}: CodeBlockActionsProps) {
  return (
    <div
      className={cn("flex shrink-0 items-center gap-0.5", className)}
      {...props}
    />
  );
}

export type CodeBlockCopyButtonProps = React.ComponentProps<typeof Button> & {
  onCopy?: () => void;
  onError?: (error: Error) => void;
  timeout?: number;
};

export function CodeBlockCopyButton({
  children,
  className,
  onCopy,
  onError,
  timeout = 1600,
  ...props
}: CodeBlockCopyButtonProps) {
  const { code } = useCodeBlock();
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  async function copy() {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API is unavailable");
      }
      await navigator.clipboard.writeText(code);
      setCopied(true);
      onCopy?.();
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), timeout);
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={copied ? "Code copied" : "Copy code"}
      className={cn("text-muted-foreground size-7", className)}
      onClick={copy}
      {...props}
    >
      {children ??
        (copied ? (
          <Check className="text-emerald-600" aria-hidden="true" />
        ) : (
          <Copy aria-hidden="true" />
        ))}
    </Button>
  );
}

export type CodeBlockContentProps = React.ComponentProps<"div"> & {
  fillHeight?: boolean;
  viewportHeight?: number;
};

export function CodeBlockContent({
  className,
  fillHeight = false,
  viewportHeight,
  ...props
}: CodeBlockContentProps) {
  const { code, filename, language, showLineNumbers } = useCodeBlock();
  const { resolvedTheme } = useTheme();
  const [ready, setReady] = React.useState(false);
  const file = React.useMemo<FileContents>(
    () => ({ contents: code, lang: language, name: filename }),
    [code, filename, language],
  );

  React.useEffect(() => {
    let active = true;
    setReady(false);

    void preloadHighlighter({
      langs: [language],
      preferredHighlighter: "shiki-js",
      themes: ["pierre-dark-soft", "pierre-light-soft"],
    })
      .catch(() => undefined)
      .finally(() => {
        if (active) setReady(true);
      });

    return () => {
      active = false;
    };
  }, [language]);

  return (
    <div
      className={cn("bg-background min-h-0 min-w-0 flex-1", className)}
      {...props}
    >
      {ready ? (
        <File
          file={file}
          disableWorkerPool
          options={{
            disableFileHeader: true,
            disableLineNumbers: !showLineNumbers,
            overflow: "scroll",
            theme: {
              dark: "pierre-dark-soft",
              light: "pierre-light-soft",
            },
            themeType: resolvedTheme === "dark" ? "dark" : "light",
            tokenizeMaxLineLength: 800,
            unsafeCSS: `
              :host {
                display: block;
                min-height: 100%;
                background: var(--diffs-bg);
                --diffs-font-family: var(--font-mono);
                --diffs-font-size: 12px;
                --diffs-line-height: 20px;
              }
              pre {
                height: ${viewportHeight ? `${viewportHeight}px` : "auto"};
                max-height: ${viewportHeight ? `${viewportHeight}px` : fillHeight ? "none" : "24rem"};
                min-height: ${fillHeight ? "0" : "14rem"};
                overflow: auto;
                overscroll-behavior: ${viewportHeight ? "auto" : "contain"};
                scrollbar-gutter: stable;
                scrollbar-width: thin;
              }
              [data-code] {
                min-height: ${fillHeight ? "0" : "14rem"};
                padding-block: 12px;
              }
              [data-gutter] {
                background-color: var(--diffs-bg-context);
                border-right: 1px solid var(--diffs-bg-separator);
              }
            `,
          }}
          className="block min-h-56 min-w-full"
        />
      ) : (
        <div className="min-h-56 space-y-2 p-4" aria-label="Preparing code">
          {Array.from({ length: 9 }, (_, index) => (
            <div
              key={index}
              className="bg-muted h-3 animate-pulse rounded-sm motion-reduce:animate-none"
              style={{ width: `${52 + ((index * 19) % 42)}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
