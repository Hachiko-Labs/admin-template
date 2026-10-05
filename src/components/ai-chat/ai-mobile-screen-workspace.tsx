"use client";

import * as React from "react";

import { AiApplicationIcon } from "@/components/ai-chat/ai-application-icon";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AiCodeView } from "./ai-code-view";
import type { AiDemoCodeFile } from "./ai-coding-demo-data";
import { AiMobilePreviewScreen } from "./ai-mobile-preview-screen";
import { AiReviewArtifactWorkspace } from "./ai-review-artifact-workspace";
import { AiWorkspaceShell } from "./ai-workspace-shell";
import styles from "./mobile-screen-workspace.module.css";

const deviceWidth = 390;

function MobileScreenPreview() {
  const viewport = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(0);

  React.useEffect(() => {
    const element = viewport.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / deviceWidth);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.phone} aria-label="Interactive mobile chat preview">
      <span className={styles.volumeButton} aria-hidden="true" />
      <span className={styles.sideButton} aria-hidden="true" />
      <div className={styles.screen}>
        <div ref={viewport} className="bg-background size-full overflow-hidden">
          <div
            className={styles.device}
            style={{
              transform: `scale(${scale})`,
              visibility: scale ? "visible" : "hidden",
            }}
          >
            <AiMobilePreviewScreen />
          </div>
        </div>
      </div>
      <span className={styles.camera} aria-hidden="true" />
      <span className={styles.topHighlight} aria-hidden="true" />
    </div>
  );
}

export function AiMobileScreenWorkspace({ source }: { source: string }) {
  const [mode, setMode] = React.useState("code");
  const file = React.useMemo<AiDemoCodeFile>(
    () => ({
      current: { name: "ai-mobile-preview-screen.tsx", contents: source },
      previous: { name: "ai-mobile-preview-screen.tsx", contents: "" },
      additions: source.trimEnd().split("\n").length,
      deletions: 0,
      status: "added",
    }),
    [source],
  );

  return (
    <AiWorkspaceShell
      headerIcon={<AiApplicationIcon app="mobile" />}
      headerTitle="Mobile screen workspace"
      hideNavigationSidebar
    >
      <AiReviewArtifactWorkspace
        storageKey="review-mobile-notes-v1"
        context={
          <div className="flex flex-col gap-5">
            <div className="bg-background rounded-xl border p-4 text-sm leading-relaxed">
              Review the mobile chat flow. Keep messages readable and the
              composer within reach.
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Try a starter prompt, send a message, or open the conversation
              menu in the preview.
            </p>
          </div>
        }
      >
        <Tabs value={mode} onValueChange={setMode} className={styles.artifact}>
          <header className="flex h-10 shrink-0 items-center justify-between gap-2 border-b px-3">
            <TabsList aria-label="Workspace view" className="h-7 p-0.5">
              <TabsTrigger value="preview" className="h-6 px-2 py-0 text-xs">
                Preview
              </TabsTrigger>
              <TabsTrigger value="code" className="h-6 px-2 py-0 text-xs">
                Source
              </TabsTrigger>
              <TabsTrigger value="diff" className="h-6 px-2 py-0 text-xs">
                Changes
              </TabsTrigger>
            </TabsList>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMode("preview")}
              aria-label="Show mobile preview"
            >
              Show preview
            </Button>
          </header>
          <TabsContent value={mode} className={styles.panels} data-view={mode}>
            <section aria-label="Screen source" className={styles.source}>
              <div className="flex h-8 shrink-0 items-center border-b px-4">
                <span className="truncate font-mono text-xs">
                  ai-mobile-preview-screen.tsx
                </span>
              </div>
              <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
                <AiCodeView
                  file={file}
                  mode={mode === "diff" ? "diff" : "code"}
                />
              </div>
            </section>
            <section
              aria-label="Mobile mock preview"
              className={styles.preview}
            >
              <div className="flex h-8 shrink-0 items-center border-b px-4 text-xs font-medium">
                Mobile chat
              </div>
              <div className={styles.stage}>
                <MobileScreenPreview />
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </AiReviewArtifactWorkspace>
    </AiWorkspaceShell>
  );
}
