"use client";

import {
  Bot,
  Check,
  CheckCheck,
  ChevronRight,
  Download,
  ImageIcon,
  MessageSquare,
  Minus,
  MousePointer2,
  Plus,
  RotateCcw,
  Scan,
  SquareDashed,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import * as React from "react";

import { AiApplicationIcon } from "@/components/ai-chat/ai-application-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { downloadReviewJson } from "./ai-review-utils";
import {
  boxBetweenPoints,
  constrainReviewBox,
  draftObservation,
  draftTitle,
  initialVisualRegions,
  needsTitle,
  type ReviewBox,
  severityMeta,
  type VisualRegion,
} from "./ai-visual-inspection-data";
import { AiWorkspaceShell } from "./ai-workspace-shell";

interface LocalImage {
  name: string;
  src: string;
  width: number;
  height: number;
  regions: VisualRegion[];
}
const sample = {
  name: "Order detail · desktop",
  src: "/ai-chat/visual-inspection/order-review.png",
  width: 1452,
  height: 900,
};

export function AiVisualInspectionScreen() {
  const [sampleRegions, setSampleRegions] =
    React.useState<VisualRegion[]>(initialVisualRegions);
  const [upload, setUpload] = React.useState<LocalImage | null>(null);
  const [useUpload, setUseUpload] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState("region-1");
  const [filter, setFilter] = React.useState("all");
  const [zoom, setZoom] = React.useState(100);
  const [fitWidth, setFitWidth] = React.useState(700);
  const [drawMode, setDrawMode] = React.useState(false);
  const [draftBox, setDraftBox] = React.useState<ReviewBox | null>(null);
  const [note, setNote] = React.useState("");
  const [notice, setNotice] = React.useState("");
  const [imageError, setImageError] = React.useState(false);
  const [deleted, setDeleted] = React.useState<{
    region: VisualRegion;
    uploaded: boolean;
  } | null>(null);
  const [draftingId, setDraftingId] = React.useState<string | null>(null);
  const [draftStage, setDraftStage] = React.useState("");
  const [reviewCount, setReviewCount] = React.useState<{
    done: number;
    total: number;
  } | null>(null);
  const viewport = React.useRef<HTMLDivElement>(null);
  const startPoint = React.useRef<{ x: number; y: number } | null>(null);
  const fileInput = React.useRef<HTMLInputElement>(null);
  const noteInput = React.useRef<HTMLTextAreaElement>(null);
  const regions = useUpload && upload ? upload.regions : sampleRegions;
  const image = useUpload && upload ? upload : sample;
  const selected = regions.find((r) => r.id === selectedId);
  const visible = regions.filter(
    (r) => filter === "all" || (filter === "open" ? !r.resolved : r.resolved),
  );

  React.useEffect(() => {
    const node = viewport.current;
    if (!node) return;
    const observer = new ResizeObserver(() =>
      setFitWidth(Math.max(200, node.clientWidth - 48)),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  React.useEffect(() => {
    setImageError(false);
  }, [image.src]);
  const uploadSrc = upload?.src;
  React.useEffect(
    () => () => {
      if (uploadSrc) URL.revokeObjectURL(uploadSrc);
    },
    [uploadSrc],
  );
  const timers = React.useRef<number[]>([]);
  React.useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id));
    },
    [],
  );
  function later(ms: number, fn: () => void) {
    timers.current.push(window.setTimeout(fn, ms));
  }
  const aiBusy = draftingId !== null || reviewCount !== null;
  function applyDraft(id: string) {
    const target = regions.find((r) => r.id === id);
    if (!target) return;
    const draft = draftObservation(target);
    updateRegions((current) =>
      current.map((r) =>
        r.id === id
          ? {
              ...r,
              title: needsTitle(r.title) ? draftTitle(target) : r.title,
              observation: draft.text,
              severity: draft.severity,
            }
          : r,
      ),
    );
  }
  function runDraft(id: string) {
    if (aiBusy) return;
    select(id);
    setDraftingId(id);
    setDraftStage("Reading region…");
    later(450, () => setDraftStage("Scoring severity…"));
    later(900, () => setDraftStage("Drafting observation…"));
    later(1350, () => {
      applyDraft(id);
      setDraftingId(null);
      setDraftStage("");
      setNotice("Draft ready — revise it or resolve the region.");
    });
  }
  function reviewAll() {
    if (aiBusy) return;
    const pending = regions.filter((r) => !r.observation);
    if (regions.length === 0) {
      setNotice("Draw a region first, then run the review.");
      return;
    }
    if (pending.length === 0) {
      setNotice("Every region already has an observation.");
      return;
    }
    setReviewCount({ done: 0, total: pending.length });
    setNotice(`Reviewing 1 of ${pending.length}…`);
    pending.forEach((region, index) => {
      later(700 * (index + 1), () => {
        applyDraft(region.id);
        if (index === pending.length - 1) {
          setReviewCount(null);
          setNotice(
            `Review complete — ${pending.length} draft${pending.length === 1 ? "" : "s"} ready for revision.`,
          );
        } else {
          setReviewCount({ done: index + 1, total: pending.length });
          setNotice(`Reviewing ${index + 2} of ${pending.length}…`);
        }
      });
    });
  }

  function updateRegions(update: (current: VisualRegion[]) => VisualRegion[]) {
    if (useUpload)
      setUpload((current) =>
        current ? { ...current, regions: update(current.regions) } : current,
      );
    else setSampleRegions(update);
  }
  const detailPanel = selected ? (
    <div className="flex flex-1 flex-col px-5 py-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-muted-foreground text-[10px] font-medium tracking-widest uppercase">
          Region {regions.indexOf(selected) + 1}
        </span>
        <Button
          size="sm"
          className="h-7 text-xs"
          variant="ghost"
          onClick={() => {
            updateSelected({ resolved: !selected.resolved });
            setNotice(
              selected.resolved
                ? "Observation reopened."
                : "Observation resolved.",
            );
          }}
        >
          {selected.resolved ? <RotateCcw /> : <CheckCheck />}
          {selected.resolved ? "Reopen" : "Resolve"}
        </Button>
      </div>
      <Input
        aria-label="Region title"
        maxLength={160}
        value={selected.title}
        onChange={(e) => updateSelected({ title: e.target.value })}
        className="h-auto border-0 bg-transparent px-0 py-1 text-base font-semibold shadow-none focus-visible:ring-0"
      />
      {draftingId === selected.id ? (
        <p role="status" className="text-muted-foreground mt-4 text-xs">
          {draftStage || "Working…"}
        </p>
      ) : selected.observation ? (
        <div className="mt-4 rounded-lg border p-3.5">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium">
            <Scan className="size-3.5" />
            Design review
            {selected.severity ? (
              <span className="bg-muted rounded px-1.5 py-0.5 text-[10px] font-medium">
                {severityMeta[selected.severity].label}
              </span>
            ) : null}
            <span className="text-muted-foreground ml-auto text-[10px] font-normal">
              Local draft · editable
            </span>
          </div>
          <Textarea
            aria-label="Drafted observation"
            value={selected.observation}
            maxLength={2000}
            onChange={(e) => updateSelected({ observation: e.target.value })}
            className="text-muted-foreground min-h-24 resize-none border-0 bg-transparent px-0 text-[13px] leading-6 shadow-none focus-visible:ring-0"
          />
          <div className="mt-1 flex justify-end">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              disabled={aiBusy}
              onClick={() => runDraft(selected.id)}
            >
              <Bot data-icon="inline-start" /> Redraft
            </Button>
          </div>
        </div>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="mt-4 self-start"
          disabled={aiBusy}
          onClick={() => runDraft(selected.id)}
        >
          <Bot data-icon="inline-start" /> Draft observation
        </Button>
      )}
      <div className="mt-4 space-y-3" aria-label="Region discussion">
        {selected.notes.map((n) => (
          <div key={n.id} className="border-l-2 pl-3">
            <span className="text-muted-foreground text-[10px] font-medium">
              REVIEW NOTE
            </span>
            <p className="mt-1 text-[13px] leading-6 break-words whitespace-pre-wrap">
              {n.text}
            </p>
          </div>
        ))}
      </div>
      <form onSubmit={addNote} className="mt-5 rounded-xl border p-2 shadow-xs">
        <Textarea
          ref={noteInput}
          aria-label="Note for selected region"
          placeholder="Add a note about this region…"
          value={note}
          maxLength={4000}
          onChange={(e) => setNote(e.target.value)}
          className="min-h-20 resize-none border-0 bg-transparent px-2 text-sm shadow-none focus-visible:ring-0"
        />
        <div className="flex items-center justify-between px-1 pt-1">
          <span className="text-muted-foreground text-[10px]">
            Only attached to this region
          </span>
          <Button
            type="submit"
            size="sm"
            disabled={!note.trim() || selected.notes.length >= 500}
            className="h-7 text-xs"
          >
            Add note
          </Button>
        </div>
      </form>
      <details className="mt-5 text-xs">
        <summary className="text-muted-foreground cursor-pointer">
          Region coordinates
        </summary>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {(["x", "y", "width", "height"] as const).map((field) => (
            <label key={field} className="text-muted-foreground text-[10px]">
              {field} %
              <Input
                type="number"
                aria-label={`Region ${field}`}
                min={field === "width" || field === "height" ? 1 : 0}
                max={100}
                step={0.1}
                value={Math.round(selected.box[field] * 10) / 10}
                className="mt-1 h-8 px-2 text-xs"
                onChange={(e) =>
                  updateSelected({
                    box: constrainReviewBox({
                      ...selected.box,
                      [field]: Number(e.target.value),
                    }),
                  })
                }
              />
            </label>
          ))}
        </div>
      </details>
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground mt-4 self-start px-0 text-xs"
        onClick={() => {
          setDeleted({ region: selected, uploaded: useUpload });
          updateRegions((all) => all.filter((r) => r.id !== selectedId));
          select("");
          setNotice("Region removed.");
        }}
      >
        <Trash2 /> Remove region
      </Button>
    </div>
  ) : (
    <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-sm">
      <SquareDashed className="mb-1 size-6" />
      <p>Select a region to inspect its discussion.</p>
    </div>
  );
  const statusBar =
    notice || (deleted && deleted.uploaded === useUpload) ? (
      <div className="flex items-center justify-between gap-2 px-5 py-3 text-xs">
        <p role="status" className="text-muted-foreground">
          {notice}
        </p>
        {deleted && deleted.uploaded === useUpload ? (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 shrink-0 text-xs"
            onClick={() => {
              updateRegions((all) => [...all, deleted.region]);
              select(deleted.region.id);
              setDeleted(null);
              setNotice("Region restored.");
            }}
          >
            <RotateCcw /> Undo removal
          </Button>
        ) : notice ? (
          <button aria-label="Dismiss notice" onClick={() => setNotice("")}>
            <X className="size-3" />
          </button>
        ) : null}
      </div>
    ) : null;
  function select(id: string) {
    setSelectedId(id);
    setNote("");
  }
  function updateSelected(patch: Partial<VisualRegion>) {
    updateRegions((current) =>
      current.map((r) => (r.id === selectedId ? { ...r, ...patch } : r)),
    );
  }
  function addRegion(box: ReviewBox) {
    if (regions.length >= 250) {
      setNotice("This review has reached its 250-region limit.");
      return;
    }
    const id =
      globalThis.crypto?.randomUUID?.() ??
      `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    updateRegions((current) => [
      ...current,
      {
        id,
        title: `Region ${current.length + 1}`,
        box: constrainReviewBox(box),
        observation: "",
        notes: [],
        resolved: false,
      },
    ]);
    select(id);
    setDrawMode(false);
    setFilter("all");
    setNotice("Region added. Give it a title and add an observation.");
    requestAnimationFrame(() => noteInput.current?.focus());
  }
  function point(event: React.PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    };
  }
  function addNote(event: React.FormEvent) {
    event.preventDefault();
    if (!selected || !note.trim()) return;
    updateSelected({
      notes: [
        ...selected.notes,
        {
          id:
            globalThis.crypto?.randomUUID?.() ??
            `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
          text: note.trim(),
        },
      ],
    });
    setNote("");
    setNotice("Note added to the selected region.");
  }
  async function openImage(file?: File) {
    if (!file) return;
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
      file.size > 10 * 1024 * 1024
    ) {
      setNotice("Choose a PNG, JPEG or WebP image smaller than 10 MB.");
      return;
    }
    const src = URL.createObjectURL(file);
    const img = new window.Image();
    img.src = src;
    try {
      await img.decode();
      if (img.naturalWidth * img.naturalHeight > 25_000_000)
        throw new Error("large");
      setUpload({
        name: file.name,
        src,
        width: img.naturalWidth,
        height: img.naturalHeight,
        regions: [],
      });
      setUseUpload(true);
      setSelectedId("");
      setNote("");
      setZoom(100);
      setDeleted(null);
      setNotice(
        "Image opened locally. This upload stays in this tab; export your annotations before leaving.",
      );
    } catch {
      URL.revokeObjectURL(src);
      setNotice(
        "Could not open this image. Use a supported image under 25 megapixels.",
      );
    }
  }
  const frameWidth = (fitWidth * zoom) / 100;

  return (
    <AiWorkspaceShell
      headerIcon={<AiApplicationIcon app="inspection" />}
      hideNavigationSidebar
      headerTitle="Visual inspection"
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto xl:overflow-hidden">
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-5 py-4 md:px-7">
          <div>
            <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
              Commerce experience <ChevronRight className="size-3" /> Design
              review
            </p>
            <h1 className="mt-1.5 text-xl font-semibold tracking-tight">
              A closer look.
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInput}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              aria-label="Open an image for inspection"
              onChange={(e) => {
                void openImage(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInput.current?.click()}
            >
              <Upload /> Open image
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                downloadReviewJson("visual-review.json", {
                  version: 1,
                  image: {
                    name: image.name,
                    width: image.width,
                    height: image.height,
                  },
                  coordinateSystem: "percent",
                  regions,
                });
                setNotice(
                  "Annotations exported with image dimensions and normalized coordinates.",
                );
              }}
            >
              <Download /> Export review
            </Button>
            <Button size="sm" disabled={aiBusy} onClick={reviewAll}>
              <Bot />{" "}
              {reviewCount
                ? `Reviewing ${reviewCount.done + 1} of ${reviewCount.total}…`
                : "Review image"}
            </Button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col xl:flex-row">
          <section
            className="flex min-w-0 flex-1 flex-col"
            aria-label="Image review canvas"
          >
            <div className="flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-2 border-b px-4 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <ImageIcon className="text-muted-foreground size-4 shrink-0" />
                <select
                  aria-label="Review image"
                  value={useUpload ? "upload" : "sample"}
                  className="max-w-52 min-w-0 bg-transparent text-xs font-medium outline-offset-4"
                  onChange={(e) => {
                    setUseUpload(e.target.value === "upload");
                    select("");
                    setZoom(100);
                    setDrawMode(false);
                  }}
                >
                  <option value="sample">{sample.name}</option>
                  {upload ? (
                    <option value="upload">{upload.name}</option>
                  ) : null}
                </select>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="icon-sm"
                  variant={drawMode ? "ghost" : "secondary"}
                  aria-label="Select regions"
                  aria-pressed={!drawMode}
                  onClick={() => setDrawMode(false)}
                >
                  <MousePointer2 />
                </Button>
                <Button
                  size="icon-sm"
                  variant={drawMode ? "secondary" : "ghost"}
                  aria-label="Draw a region"
                  aria-pressed={drawMode}
                  onClick={() => {
                    setDrawMode(!drawMode);
                    setNotice(
                      "Drag across the image to select a region. Escape cancels.",
                    );
                  }}
                >
                  <SquareDashed />
                </Button>
                <span className="bg-border mx-1 h-4 w-px" />
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Zoom out"
                  disabled={zoom <= 50}
                  onClick={() => setZoom((v) => Math.max(50, v - 25))}
                >
                  <Minus />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-14 font-mono text-xs"
                  aria-label="Fit image to viewport"
                  onClick={() => {
                    setZoom(100);
                    viewport.current?.scrollTo({ left: 0, top: 0 });
                  }}
                >
                  {zoom}%
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Zoom in"
                  disabled={zoom >= 250}
                  onClick={() => setZoom((v) => Math.min(250, v + 25))}
                >
                  <Plus />
                </Button>
              </div>
            </div>
            <div
              ref={viewport}
              className="bg-muted/50 min-h-[360px] overflow-auto p-6 xl:min-h-0 xl:flex-1"
              style={{
                backgroundImage:
                  "radial-gradient(var(--border) 1px, transparent 1px)",
                backgroundSize: "18px 18px",
              }}
            >
              {imageError ? (
                <div
                  role="alert"
                  className="bg-background rounded-lg border p-6 text-sm"
                >
                  The source image could not be loaded. Open another image to
                  continue.
                </div>
              ) : (
                <div
                  className={cn(
                    "relative mx-auto bg-white shadow-sm outline-offset-4",
                    drawMode && "cursor-crosshair touch-none",
                  )}
                  data-testid="inspection-image"
                  tabIndex={0}
                  aria-label="Image canvas. Use Draw a region or Add region to annotate."
                  style={{
                    width: frameWidth,
                    aspectRatio: `${image.width} / ${image.height}`,
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      startPoint.current = null;
                      setDraftBox(null);
                      setDrawMode(false);
                    }
                  }}
                  onPointerDown={(e) => {
                    if (!drawMode || e.button !== 0) return;
                    e.preventDefault();
                    startPoint.current = point(e);
                    e.currentTarget.setPointerCapture(e.pointerId);
                  }}
                  onPointerMove={(e) => {
                    if (startPoint.current)
                      setDraftBox(
                        boxBetweenPoints(startPoint.current, point(e)),
                      );
                  }}
                  onPointerCancel={() => {
                    startPoint.current = null;
                    setDraftBox(null);
                  }}
                  onPointerUp={(e) => {
                    if (!startPoint.current) return;
                    const box = boxBetweenPoints(startPoint.current, point(e));
                    startPoint.current = null;
                    setDraftBox(null);
                    if (e.currentTarget.hasPointerCapture(e.pointerId))
                      e.currentTarget.releasePointerCapture(e.pointerId);
                    if (box) addRegion(box);
                  }}
                >
                  <Image
                    src={image.src}
                    alt={
                      useUpload
                        ? `Uploaded image: ${image.name}. Numbered regions link to observations.`
                        : "Order detail screen under review; numbered regions link to observations"
                    }
                    width={image.width}
                    height={image.height}
                    unoptimized
                    priority
                    draggable={false}
                    onError={() => setImageError(true)}
                    className="pointer-events-none h-full w-full select-none"
                  />
                  {regions.map((region, index) => (
                    <button
                      key={region.id}
                      type="button"
                      data-testid={`region-${index + 1}`}
                      aria-label={`Select region ${index + 1}: ${region.title}`}
                      aria-pressed={selectedId === region.id}
                      className={cn(
                        "absolute border transition-[background-color,box-shadow] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                        region.resolved
                          ? "border-emerald-600/60 bg-emerald-500/5"
                          : "border-blue-600/60 bg-blue-500/5",
                        selectedId === region.id && "ring-2 ring-blue-600/70",
                        drawMode && "pointer-events-none",
                      )}
                      style={{
                        left: `${region.box.x}%`,
                        top: `${region.box.y}%`,
                        width: `${region.box.width}%`,
                        height: `${region.box.height}%`,
                      }}
                      onClick={() => {
                        select(region.id);
                        setFilter("all");
                      }}
                    >
                      <span
                        className={cn(
                          "absolute -top-3 -left-3 flex size-6 items-center justify-center rounded-full border-2 border-white text-[10px] font-semibold text-white shadow-sm",
                          region.resolved ? "bg-emerald-700" : "bg-blue-600",
                        )}
                      >
                        {region.resolved ? (
                          <Check className="size-3" />
                        ) : (
                          index + 1
                        )}
                      </span>
                    </button>
                  ))}
                  {draftBox ? (
                    <div
                      className="pointer-events-none absolute border-2 border-blue-600 bg-blue-500/10"
                      style={{
                        left: `${draftBox.x}%`,
                        top: `${draftBox.y}%`,
                        width: `${draftBox.width}%`,
                        height: `${draftBox.height}%`,
                      }}
                    />
                  ) : null}
                </div>
              )}
            </div>
          </section>

          <aside
            className="flex w-full shrink-0 flex-col border-t xl:w-[360px] xl:overflow-y-auto xl:border-t-0 xl:border-l"
            aria-label="Region observations"
          >
            <div className="flex items-center justify-between px-5 pt-4 pb-3">
              <h2 className="text-sm font-semibold">
                Observations{" "}
                <span className="text-muted-foreground ml-1 font-normal">
                  {regions.length}
                </span>
              </h2>
              <Button
                size="sm"
                variant="ghost"
                disabled={regions.length >= 250}
                onClick={() =>
                  addRegion({ x: 30, y: 30, width: 30, height: 25 })
                }
              >
                <Plus /> Add region
              </Button>
            </div>
            <div
              className="flex gap-1 px-5 pb-3"
              aria-label="Filter observations"
            >
              {[
                ["all", "All"],
                ["open", "Open"],
                ["resolved", "Resolved"],
              ].map(([value, label]) => (
                <Button
                  key={value}
                  size="sm"
                  variant={filter === value ? "secondary" : "ghost"}
                  aria-pressed={filter === value}
                  onClick={() => setFilter(value)}
                  className="h-7 text-xs"
                >
                  {label}
                </Button>
              ))}
            </div>
            <div className="max-h-52 shrink-0 overflow-y-auto border-y py-1">
              {visible.length ? (
                visible.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => select(r.id)}
                    className={cn(
                      "hover:bg-muted/50 flex w-full items-center gap-3 px-5 py-3 text-left text-xs outline-offset-[-3px]",
                      selectedId === r.id && "bg-muted",
                    )}
                    aria-pressed={selectedId === r.id}
                  >
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px]",
                        r.resolved &&
                          "border-emerald-600/20 text-emerald-700 dark:text-emerald-400",
                      )}
                    >
                      {r.resolved ? (
                        <Check className="size-3" />
                      ) : (
                        regions.indexOf(r) + 1
                      )}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {r.title || "Untitled region"}
                    </span>
                    <MessageSquare className="text-muted-foreground size-3" />
                    <span className="text-muted-foreground">
                      {r.notes.length}
                    </span>
                    {r.severity ? (
                      <span className="text-muted-foreground/70 shrink-0 text-[10px]">
                        {severityMeta[r.severity].label}
                      </span>
                    ) : null}
                  </button>
                ))
              ) : (
                <p className="text-muted-foreground px-5 py-6 text-xs">
                  {regions.length
                    ? "No observations match this filter."
                    : "Draw a region or add one to start reviewing this image."}
                </p>
              )}
            </div>
            {detailPanel}
            {statusBar}
          </aside>
        </div>
      </div>
    </AiWorkspaceShell>
  );
}
