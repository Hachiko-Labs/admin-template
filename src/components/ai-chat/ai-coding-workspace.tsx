"use client";

import * as React from "react";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface AiCodingWorkspaceProps {
  chat: React.ReactNode;
  codePanel: React.ReactNode;
  codePanelOpen: boolean;
  codePanelExpanded?: boolean;
  defaultPanelWidthPercent?: number;
  onCodePanelOpenChange: (open: boolean) => void;
  panelTitle?: string;
}

function useCompactCodingWorkspace() {
  const [compact, setCompact] = React.useState(false);

  React.useEffect(() => {
    const query = window.matchMedia("(max-width: 979px)");
    const update = () => setCompact(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return compact;
}

export function AiCodingWorkspace({
  chat,
  codePanel,
  codePanelOpen,
  codePanelExpanded = false,
  defaultPanelWidthPercent = 52,
  onCodePanelOpenChange,
  panelTitle = "Code workspace",
}: AiCodingWorkspaceProps) {
  const compact = useCompactCodingWorkspace();
  const rowRef = React.useRef<HTMLDivElement>(null);
  const [panelWidth, setPanelWidth] = React.useState<number | null>(null);

  const startResize = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const row = rowRef.current;
      if (!row) return;

      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      const rowRect = row.getBoundingClientRect();

      const resize = (clientX: number) => {
        const nextWidth = rowRect.right - clientX;
        const maxWidth = Math.max(360, rowRect.width - 320);
        setPanelWidth(Math.min(maxWidth, Math.max(360, nextWidth)));
      };

      const onMove = (moveEvent: PointerEvent) => resize(moveEvent.clientX);
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [],
  );

  return (
    <div ref={rowRef} className="flex min-h-0 flex-1 overflow-hidden">
      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col",
          codePanelExpanded && "hidden",
        )}
      >
        {chat}
      </div>

      {codePanelOpen && !compact ? (
        <>
          {!codePanelExpanded ? (
            <div
              role="separator"
              aria-label={`Resize ${panelTitle.toLowerCase()}`}
              aria-orientation="vertical"
              tabIndex={0}
              className="group bg-border relative z-10 hidden w-px shrink-0 cursor-col-resize outline-none min-[980px]:block"
              onPointerDown={startResize}
              onKeyDown={(event) => {
                if (event.key !== "ArrowLeft" && event.key !== "ArrowRight")
                  return;
                event.preventDefault();
                const rowWidth = rowRef.current?.clientWidth ?? 1000;
                const currentWidth =
                  panelWidth ?? rowWidth * (defaultPanelWidthPercent / 100);
                const delta = event.key === "ArrowLeft" ? 24 : -24;
                setPanelWidth(
                  Math.min(
                    Math.max(360, rowWidth - 320),
                    Math.max(360, currentWidth + delta),
                  ),
                );
              }}
            >
              <span className="before:bg-border group-hover:before:bg-primary/55 group-focus-visible:before:bg-primary/65 absolute inset-y-0 -left-2 w-4 before:absolute before:inset-y-0 before:left-1/2 before:w-px before:-translate-x-1/2 before:transition-colors" />
            </div>
          ) : null}
          <div
            className={cn(
              "hidden min-h-0 min-w-[360px] min-[980px]:flex",
              codePanelExpanded ? "min-w-0 flex-1" : "shrink-0",
            )}
            style={
              codePanelExpanded
                ? undefined
                : {
                    width:
                      panelWidth === null
                        ? `${defaultPanelWidthPercent}%`
                        : panelWidth,
                  }
            }
          >
            {codePanel}
          </div>
        </>
      ) : null}

      <Sheet
        open={codePanelOpen && compact}
        onOpenChange={onCodePanelOpenChange}
      >
        <SheetContent
          side="right"
          className="h-dvh w-screen max-w-none gap-0 p-0 sm:max-w-none [&>button]:hidden"
        >
          <SheetTitle className="sr-only">{panelTitle}</SheetTitle>
          {codePanel}
        </SheetContent>
      </Sheet>
    </div>
  );
}
