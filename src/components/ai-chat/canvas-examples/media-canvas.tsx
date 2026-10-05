"use client";

import {
  Handle,
  type Node,
  type NodeProps,
  Panel,
  Position,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Check,
  Copy,
  FileText,
  Focus,
  Hand,
  Link2,
  Minus,
  MousePointer2,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Save,
  Square,
  Trash2,
  Upload,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { AiApplicationIcon } from "@/components/ai-chat/ai-application-icon";
import { AiEditorHeaderContent } from "@/components/ai-chat/ai-editor-header-content";
import { Canvas } from "@/components/ai-elements/canvas";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import {
  connectionError,
  downstream,
  executionOrder,
  type MediaBlock,
  type MediaDocument,
  mediaDocumentSchema,
  mediaExamples,
  type MediaWorkflow,
  podcastImage,
  sampleTranscript,
  validYouTubeUrl,
} from "@/lib/ai-canvas/media";
import { cn } from "@/lib/utils";

import { AiWorkspaceShell } from "../ai-workspace-shell";
import { DocumentActions, downloadFile, IconButton, Inspector } from "./shared";
import { useLocalDocument } from "./use-local-document";

const labels: Record<MediaBlock["kind"], string> = {
  source: "Source",
  transcript: "Transcript",
  titles: "Titles",
  thumbnail: "Thumbnail",
  description: "Description",
  publish: "YouTube preview",
  prompt: "Prompt",
  clip: "Motion preview",
};
const portColors: Record<MediaBlock["kind"], string> = {
  source: "var(--chart-2)",
  transcript: "var(--chart-1)",
  titles: "var(--chart-1)",
  thumbnail: "var(--chart-2)",
  description: "var(--chart-1)",
  publish: "var(--chart-2)",
  prompt: "var(--chart-3)",
  clip: "var(--chart-2)",
};
const palettes = {
  amber: { bg: "#e9b45f", fg: "#241b11" },
  mint: { bg: "#b1decd", fg: "#112d26" },
  paper: { bg: "#eee9dc", fg: "#1e242b" },
};

type MediaNodeData = {
  block: MediaBlock;
  doc: MediaDocument;
  active: boolean;
  ready: boolean;
  busy: boolean;
  inspect: (id: string) => void;
  patch: (id: string, text: string) => void;
  run: (id?: string) => void;
  choose: (id: string) => void;
  chooseTitle: (title: string) => void;
  link: (url: string) => void;
  upload: () => void;
};
type MediaNode = Node<MediaNodeData, "media">;

function RunProgress() {
  const bar = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const animation = bar.current?.animate(
      [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
      { duration: 1100, fill: "forwards", easing: "linear" },
    );
    return () => animation?.cancel();
  }, []);
  return (
    <div className="bg-muted h-1 overflow-hidden rounded-full">
      <div ref={bar} className="bg-primary h-full origin-left" />
    </div>
  );
}

/** A local camera-motion study. Animation runs in the browser compositor. */
function MotionPreview({
  src,
  motion,
  title,
}: {
  src: string;
  motion: MediaBlock["motion"];
  title: string;
}) {
  const picture = React.useRef<HTMLImageElement>(null),
    progress = React.useRef<HTMLDivElement>(null);
  const animation = React.useRef<Animation | null>(null),
    progressAnimation = React.useRef<Animation | null>(null);
  const [playing, setPlaying] = React.useState(false);
  React.useEffect(
    () => () => {
      animation.current?.cancel();
      progressAnimation.current?.cancel();
    },
    [],
  );
  function toggle() {
    if (animation.current?.playState === "running") {
      animation.current.pause();
      progressAnimation.current?.pause();
      setPlaying(false);
      return;
    }
    if (animation.current?.playState === "paused") {
      animation.current.play();
      progressAnimation.current?.play();
      setPlaying(true);
      return;
    }
    const frames =
      motion === "slide"
        ? [
            { transform: "scale(1.16) translateX(3%)" },
            { transform: "scale(1.16) translateX(-3%)" },
          ]
        : motion === "pull"
          ? [{ transform: "scale(1.26)" }, { transform: "scale(1)" }]
          : [{ transform: "scale(1)" }, { transform: "scale(1.22)" }];
    animation.current?.cancel();
    progressAnimation.current?.cancel();
    animation.current = picture.current!.animate(frames, {
      duration: 6000,
      fill: "forwards",
      easing: "linear",
    });
    progressAnimation.current = progress.current!.animate(
      [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
      { duration: 6000, fill: "forwards", easing: "linear" },
    );
    animation.current.onfinish = () => setPlaying(false);
    setPlaying(true);
  }
  return (
    <div className="relative h-full overflow-hidden rounded-md bg-black">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={picture}
        src={src}
        alt={title}
        draggable={false}
        className="size-full object-cover object-[60%_center]"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-3 pt-10 pb-3 text-white">
        <div className="flex items-center justify-between">
          <button
            className="nodrag nopan flex size-8 items-center justify-center rounded-full bg-white/15 hover:bg-white/25"
            onClick={toggle}
            aria-label={`${playing ? "Pause" : "Play"} ${title}`}
          >
            {playing ? (
              <Pause className="size-4" />
            ) : (
              <Play className="size-4" />
            )}
          </button>
          <span className="font-mono text-[10px]">
            6s ·{" "}
            {motion === "slide"
              ? "slide"
              : motion === "pull"
                ? "pull back"
                : "push in"}
          </span>
        </div>
        <div className="mt-2 h-0.5 overflow-hidden bg-white/25">
          <div
            ref={progress}
            className="h-full origin-left scale-x-0 bg-white"
          />
        </div>
      </div>
    </div>
  );
}

function Thumbnail({ block, image }: { block: MediaBlock; image: string }) {
  const palette = palettes[block.variant];
  return (
    <div
      className="relative aspect-video w-full overflow-hidden"
      style={{ background: palette.bg, color: palette.fg }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt="Podcast host at the microphone"
        draggable={false}
        className="absolute inset-y-0 right-0 h-full w-[56%] object-cover object-[61%_center]"
      />
      <div
        className="absolute inset-y-0 left-0 w-[66%]"
        style={{
          background: `linear-gradient(90deg, ${palette.bg} 68%, transparent)`,
        }}
      />
      <div className="absolute inset-y-0 left-0 flex w-[62%] flex-col justify-center px-[6%]">
        <span className="mb-3 text-[8px] font-bold tracking-[.18em]">
          STUDIO NOTES
        </span>
        <p className="text-[31px] leading-[.98] font-black tracking-[-.055em] whitespace-pre-line">
          {block.text}
        </p>
        <span className="mt-4 w-fit rounded-sm border border-current px-1.5 py-0.5 text-[8px] font-semibold">
          EPISODE 01
        </span>
      </div>
    </div>
  );
}

function SourceNode({ data }: { data: MediaNodeData }) {
  const [url, setUrl] = React.useState(data.doc.sourceUrl);
  const youtube = data.doc.workflow === "youtube";
  return (
    <div className="bg-card flex h-full flex-col overflow-hidden rounded-md border">
      <div
        className={cn(
          "relative min-h-0 flex-1 overflow-hidden",
          youtube && "max-h-[200px]",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={data.doc.sourceImage}
          alt="Podcast source frame"
          className="size-full object-cover object-[60%_center]"
          draggable={false}
        />
        <span className="absolute right-2 bottom-2 rounded bg-black/75 px-1.5 py-0.5 font-mono text-[10px] text-white">
          {youtube ? "08:24" : "SOURCE FRAME"}
        </span>
      </div>
      {youtube ? (
        <div className="nodrag nopan flex flex-col gap-2 p-3">
          <p className="text-xs font-medium">Recording your first podcast</p>
          <p className="text-muted-foreground text-[10px]">
            Sample episode · paste a URL to try the workflow
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              data.link(url);
            }}
            className="flex gap-1"
          >
            <Input
              aria-label="YouTube video URL"
              placeholder="Paste YouTube URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-8 min-w-0 text-xs"
              disabled={data.busy}
            />
            <Button
              type="submit"
              size="icon-sm"
              variant="outline"
              disabled={data.busy}
              aria-label="Use YouTube URL"
            >
              <Link2 />
            </Button>
          </form>
          <Button
            size="sm"
            onClick={() => data.run("transcript")}
            disabled={data.busy}
          >
            <FileText data-icon="inline-start" />
            Transcribe video
          </Button>
        </div>
      ) : (
        <div className="nodrag flex items-center justify-between gap-2 px-3 py-2">
          <span className="text-muted-foreground text-[10px]">
            Reference image
          </span>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Replace source image"
            onClick={data.upload}
            disabled={data.busy}
          >
            <Upload />
          </Button>
        </div>
      )}
    </div>
  );
}

function MediaCard({ data, selected }: NodeProps<MediaNode>) {
  const { block, doc } = data;
  const output = [
    "thumbnail",
    "titles",
    "description",
    "publish",
    "clip",
  ].includes(block.kind);
  const chosen =
    doc.nodes.find((n) => n.id === doc.chosenThumbnail) ??
    doc.nodes.find((n) => n.kind === "thumbnail");
  return (
    <article
      className="relative flex size-full flex-col"
      aria-label={`${labels[block.kind]}: ${block.title}`}
    >
      <div className="media-drag text-muted-foreground flex h-7 shrink-0 cursor-grab items-center justify-between gap-2 text-[10px] active:cursor-grabbing">
        <span className="flex min-w-0 items-center gap-1.5 truncate">
          <span
            className="size-1.5 shrink-0 rounded-full"
            style={{ background: portColors[block.kind] }}
          />
          {block.title}
        </span>
        <button
          className="nodrag hover:text-foreground rounded p-1"
          aria-label={`Inspect ${block.title}`}
          onClick={() => data.inspect(block.id)}
        >
          <ArrowUpRight className="size-3.5" />
        </button>
      </div>
      <div
        className={cn(
          "relative min-h-0 flex-1 rounded-md",
          selected && "ring-ring ring-offset-background ring-2 ring-offset-2",
        )}
      >
        {block.kind !== "source" && (
          <Handle
            type="target"
            position={Position.Left}
            className="!border-background !size-3.5 !border-2"
            style={{ background: portColors[block.kind] }}
            aria-label={`Input to ${block.title}`}
          />
        )}
        {block.kind !== "publish" && (
          <Handle
            type="source"
            position={Position.Right}
            className="!border-background !size-3.5 !border-2"
            style={{ background: portColors[block.kind] }}
            aria-label={`Output from ${block.title}`}
          />
        )}
        {block.kind === "source" ? (
          <SourceNode key={doc.sourceUrl} data={data} />
        ) : block.kind === "clip" ? (
          <MotionPreview
            key={`${doc.sourceImage}:${block.motion}`}
            src={doc.sourceImage}
            motion={block.motion}
            title={block.title}
          />
        ) : block.kind === "thumbnail" ? (
          <div className="bg-card flex h-full flex-col overflow-hidden rounded-md border">
            <Thumbnail block={block} image={doc.sourceImage} />
            <div className="nodrag mt-auto flex items-center justify-between gap-2 px-3 py-2">
              <span className="text-muted-foreground text-[10px]">
                1280 × 720
              </span>
              <Button
                size="sm"
                variant={
                  doc.chosenThumbnail === block.id ? "secondary" : "ghost"
                }
                onClick={() => data.choose(block.id)}
                disabled={!data.ready || data.busy}
              >
                {doc.chosenThumbnail === block.id ? (
                  <Check data-icon="inline-start" />
                ) : null}
                {doc.chosenThumbnail === block.id
                  ? "Selected"
                  : "Use thumbnail"}
              </Button>
            </div>
          </div>
        ) : block.kind === "publish" ? (
          <div className="bg-card flex h-full flex-col overflow-hidden rounded-md border">
            {chosen && <Thumbnail block={chosen} image={doc.sourceImage} />}
            <div className="flex gap-2 p-3">
              <span className="bg-muted flex size-7 shrink-0 items-center justify-center rounded-full text-[9px] font-bold">
                SN
              </span>
              <div>
                <p className="text-xs leading-4 font-medium">
                  {doc.videoTitle}
                </p>
                <p className="text-muted-foreground mt-1 text-[10px]">
                  Studio Notes · Preview
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-card flex h-full flex-col overflow-hidden rounded-md border">
            <div className="text-muted-foreground flex items-center justify-between border-b px-3 py-2 text-[9px] tracking-wider uppercase">
              <span>{labels[block.kind]}</span>
              <span>
                {block.kind === "transcript"
                  ? "EN · sample"
                  : block.kind === "prompt"
                    ? "Text → video"
                    : "From transcript"}
              </span>
            </div>
            {block.kind === "titles" ? (
              <div className="nodrag flex flex-col gap-1 p-2">
                {block.text
                  .split("\n")
                  .filter(Boolean)
                  .map((title, i) => (
                    <button
                      key={`${i}:${title}`}
                      onClick={() => data.chooseTitle(title)}
                      disabled={!data.ready || data.busy}
                      className={cn(
                        "hover:bg-muted flex items-start gap-2 rounded p-2 text-left text-xs leading-5 disabled:opacity-50",
                        doc.videoTitle === title && "bg-muted",
                      )}
                    >
                      <span className="text-muted-foreground shrink-0 font-mono text-[9px]">
                        0{i + 1}
                      </span>
                      <span>{title}</span>
                      {doc.videoTitle === title && (
                        <Check className="mt-1 ml-auto size-3 shrink-0" />
                      )}
                    </button>
                  ))}
              </div>
            ) : (
              <textarea
                className={cn(
                  "nodrag nopan nowheel focus-visible:ring-ring min-h-0 flex-1 resize-none bg-transparent p-3 text-xs leading-relaxed outline-none focus-visible:ring-1",
                  block.kind === "prompt" && "font-mono text-[11px] leading-5",
                )}
                aria-label={`${labels[block.kind]} text: ${block.title}`}
                value={block.text}
                disabled={data.busy}
                onChange={(e) => data.patch(block.id, e.target.value)}
                maxLength={12000}
              />
            )}
            {block.kind === "prompt" && (
              <div className="text-muted-foreground flex items-center justify-between border-t px-3 py-2 font-mono text-[9px]">
                <span>9:16</span>
                <span>6s</span>
                <span>{block.motion}</span>
              </div>
            )}
          </div>
        )}
        {data.active && (
          <div className="bg-background/95 absolute inset-x-2 bottom-2 flex flex-col gap-2 rounded border p-3 shadow-sm">
            <span className="text-xs">
              {block.kind === "transcript"
                ? "Transcribing sample episode…"
                : block.kind === "clip"
                  ? "Preparing motion preview…"
                  : "Preparing sample output…"}
            </span>
            <RunProgress />
          </div>
        )}
        {!data.ready && !data.active && output && (
          <div className="bg-background/95 absolute inset-x-2 bottom-2 flex items-center justify-between gap-2 rounded border px-3 py-2">
            <span className="text-muted-foreground text-[10px]">
              {data.busy ? "Waiting for inputs" : "Inputs changed"}
            </span>
            {!data.busy && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => data.run(block.id)}
              >
                Update
              </Button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
const nodeTypes = { media: MediaCard };

async function downloadThumbnail(block: MediaBlock, src: string) {
  const image = new Image();
  image.src = src;
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext("2d")!;
  const palette = palettes[block.variant];
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, 1280, 720);
  const cropWidth = image.height * 0.996;
  const left = Math.max(0, (image.width - cropWidth) * 0.61);
  ctx.drawImage(
    image,
    left,
    0,
    Math.min(cropWidth, image.width - left),
    image.height,
    563,
    0,
    717,
    720,
  );
  const gradient = ctx.createLinearGradient(0, 0, 845, 0);
  gradient.addColorStop(0, palette.bg);
  gradient.addColorStop(0.68, palette.bg);
  gradient.addColorStop(1, `${palette.bg}00`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 845, 720);
  ctx.fillStyle = palette.fg;
  ctx.font = "700 24px Arial";
  ctx.fillText("STUDIO NOTES", 77, 170);
  ctx.font = "900 112px Arial";
  block.text
    .split("\n")
    .slice(0, 4)
    .forEach((line, i) => ctx.fillText(line, 77, 320 + i * 110, 690));
  ctx.font = "700 24px Arial";
  ctx.fillText("EPISODE 01", 77, 630);
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = `${block.id}.png`;
  a.click();
}

function MediaCanvasInner({ workflow }: { workflow: MediaWorkflow }) {
  const { doc, store, ready, saved, canUndo, canRedo } = useLocalDocument(
    `shadcnblocks-media-${workflow}-v1`,
    mediaExamples[workflow],
    mediaDocumentSchema,
  );
  const flow = useReactFlow<MediaNode>();
  const [inspecting, setInspecting] = React.useState<string | null>(null),
    [active, setActive] = React.useState<string | null>(null),
    [pan, setPan] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null),
    upload = React.useRef<HTMLInputElement>(null);
  const busy = active !== null;
  const selected = doc.nodes.find((n) => n.id === inspecting);
  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  function patch(id: string, values: Partial<MediaBlock>) {
    store.change((d) => {
      const stale = downstream(d, id);
      return {
        ...d,
        nodes: d.nodes.map((n) => (n.id === id ? { ...n, ...values } : n)),
        ready: d.ready.filter((item) => !stale.includes(item)),
      };
    });
  }
  function stop() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setActive(null);
    toast("Demo paused. Completed outputs are saved.");
  }
  function run(id?: string) {
    if (busy || !ready) return;
    try {
      const ids = id
        ? [id, ...downstream(doc, id)]
        : doc.nodes.filter((n) => n.kind !== "source").map((n) => n.id);
      const order = executionOrder(doc, ids);
      if (!order.length) return;
      store.change((d) => ({
        ...d,
        ready: d.ready.filter((item) => !ids.includes(item)),
      }));
      let index = 0;
      const next = () => {
        const target = order[index];
        if (!target) {
          setActive(null);
          timer.current = null;
          toast.success(
            workflow === "youtube"
              ? "Content is ready to review"
              : "Motion previews are ready",
          );
          return;
        }
        setActive(target);
        timer.current = setTimeout(() => {
          store.change(
            (d) => ({
              ...d,
              ready: [...new Set([...d.ready, target])],
              nodes: d.nodes.map((n) =>
                n.id === target && n.kind === "transcript" && !n.text.trim()
                  ? { ...n, text: sampleTranscript }
                  : n,
              ),
            }),
            false,
          );
          index++;
          next();
        }, 1150);
      };
      next();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Check the connected inputs.",
      );
    }
  }
  function link(url: string) {
    if (!validYouTubeUrl(url.trim())) {
      toast.error("Enter a valid HTTPS YouTube video URL.");
      return;
    }
    store.change((d) => ({
      ...d,
      sourceUrl: url.trim(),
      ready: ["source"],
      nodes: d.nodes.map((n) =>
        n.kind === "transcript" ? { ...n, text: "" } : n,
      ),
    }));
    toast("Video linked. This demo uses the bundled podcast transcript.");
  }
  function choose(id: string) {
    store.change((d) => ({
      ...d,
      chosenThumbnail: id,
      edges: [
        ...d.edges.filter(
          (e) =>
            !(
              e.target === "publish" &&
              d.nodes.find((n) => n.id === e.source)?.kind === "thumbnail"
            ),
        ),
        { id: `${id}:publish`, source: id, target: "publish" },
      ],
    }));
  }
  function addBranch() {
    const doc = store.getSnapshot().doc;
    if (busy || doc.nodes.length > 27) return;
    const baseId = `branch-${globalThis.crypto?.randomUUID?.().slice(0, 8) ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`}`;
    let id = baseId;
    let suffix = 1;
    while (doc.nodes.some((node) => node.id === id || node.id === `${id}-clip`))
      id = `${baseId}-${suffix++}`;
    if (workflow === "youtube") {
      const template = doc.nodes.find((n) => n.kind === "thumbnail")!;
      store.change((d) => ({
        ...d,
        nodes: [
          ...d.nodes,
          {
            ...template,
            id,
            title: `Thumbnail / ${d.nodes.filter((n) => n.kind === "thumbnail").length + 1}`,
            text: "RECORD YOUR\nFIRST EPISODE",
            variant: "paper",
            y: Math.max(...d.nodes.map((n) => n.y + n.height)) + 90,
            x: 890,
          },
        ],
        edges: [
          ...d.edges,
          { id: `transcript:${id}`, source: "transcript", target: id },
        ],
      }));
    } else {
      const source = selected?.kind === "clip" ? selected.id : "source";
      const y = Math.max(...doc.nodes.map((n) => n.y + n.height)) + 100;
      const prompt: MediaBlock = {
        ...mediaExamples.video.nodes[1],
        id,
        title: "New camera direction",
        text: "Describe the camera movement. Keep the subject and source lighting consistent.",
        x: 415,
        y,
      };
      const clip = {
        ...mediaExamples.video.nodes[2],
        id: `${id}-clip`,
        title: "New motion preview",
        x: 865,
        y,
      };
      store.change((d) => ({
        ...d,
        nodes: [...d.nodes, prompt, clip],
        edges: [
          ...d.edges,
          { id: `${source}:${id}`, source, target: id },
          { id: `${id}:${clip.id}`, source: id, target: clip.id },
        ],
      }));
    }
    setInspecting(id);
  }
  const nodes: MediaNode[] = doc.nodes.map((block) => ({
    id: block.id,
    type: "media",
    position: { x: block.x, y: block.y },
    style: { width: block.width, height: block.height },
    dragHandle: ".media-drag",
    data: {
      block,
      doc,
      ready: doc.ready.includes(block.id),
      active: active === block.id,
      busy,
      inspect: setInspecting,
      patch: (id, text) => patch(id, { text }),
      run,
      choose,
      chooseTitle: (videoTitle) => store.change((d) => ({ ...d, videoTitle })),
      link,
      upload: () => upload.current?.click(),
    },
  }));
  const edges = doc.edges.map((e) => ({
    ...e,
    type: "default",
    animated: e.target === active,
    style: {
      stroke:
        portColors[doc.nodes.find((n) => n.id === e.source)?.kind ?? "prompt"],
      strokeWidth: 1.25,
      opacity: 0.8,
    },
  }));
  const title = workflow === "youtube" ? "YouTube content" : "Video variations";
  return (
    <AiWorkspaceShell
      hideNavigationSidebar
      headerTitle={title}
      header={
        <header className="flex h-[var(--ai-workspace-header-height,3.5rem)] shrink-0 items-center gap-2 px-3 shadow-[inset_0_-1px_0_var(--border)]">
          <AiEditorHeaderContent>
            <SidebarTrigger className="shrink-0 md:hidden" />
            <AiApplicationIcon
              app={workflow === "youtube" ? "youtube" : "variations"}
            />
            <h1 className="shrink-0 text-sm font-semibold">{title}</h1>
            <span className="text-muted-foreground ml-1 hidden truncate border-l pl-3 text-xs lg:block">
              {workflow === "youtube"
                ? "Podcast setup"
                : "Podcast / camera directions"}
            </span>
            <div className="ml-auto flex items-center gap-1">
              <DocumentActions
                compact
                undo={() => store.undo()}
                redo={() => store.redo()}
                canUndo={canUndo}
                canRedo={canRedo}
                value={doc}
                onImport={(value) => {
                  const imported = mediaDocumentSchema.parse(value);
                  if (imported.workflow !== workflow)
                    throw new Error("Choose a project for this workflow");
                  store.replace(imported);
                }}
                name={`${workflow}-canvas`}
                disabled={busy || !ready}
              />
              <IconButton
                label="Save canvas"
                icon={Save}
                onClick={() => {
                  store.flush();
                  toast.success("Canvas saved");
                }}
                disabled={!ready}
                className="hidden sm:inline-flex"
              />
              <IconButton
                label="Reset example"
                icon={RotateCcw}
                onClick={() => {
                  store.replace(mediaExamples[workflow]);
                  requestAnimationFrame(() =>
                    flow.fitView({ padding: 0.08, duration: 250 }),
                  );
                }}
                disabled={busy || !ready}
                className="hidden sm:inline-flex"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={addBranch}
                disabled={busy || !ready}
                className="hidden sm:inline-flex"
              >
                <Plus data-icon="inline-start" />
                {workflow === "youtube" ? "Thumbnail" : "Branch"}
              </Button>
              <Button
                size="sm"
                onClick={() => (busy ? stop() : run())}
                disabled={!ready}
              >
                {busy ? (
                  <Square data-icon="inline-start" />
                ) : (
                  <Play data-icon="inline-start" />
                )}
                {busy ? "Stop" : "Run demo"}
              </Button>
            </div>
          </AiEditorHeaderContent>
        </header>
      }
    >
      <div className="relative min-h-0 flex-1">
        <Canvas<MediaNode>
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitViewOptions={{ padding: 0.08, minZoom: 0.25, maxZoom: 0.95 }}
          minZoom={0.2}
          maxZoom={1.8}
          nodesDraggable={!busy && !pan}
          nodesConnectable={!busy}
          panOnDrag={pan ? true : [1, 2]}
          selectionOnDrag={!pan}
          deleteKeyCode={null}
          onNodeDoubleClick={(_, node) => setInspecting(node.id)}
          onNodeDragStart={() => store.checkpoint()}
          onNodesChange={(changes) => {
            if (busy) return;
            const positions = changes.filter(
              (c) => c.type === "position" && c.position,
            );
            if (positions.length)
              store.change(
                (d) => ({
                  ...d,
                  nodes: d.nodes.map((n) => {
                    const c = positions.find(
                      (p) => p.type === "position" && p.id === n.id,
                    );
                    return c?.type === "position" && c.position
                      ? { ...n, x: c.position.x, y: c.position.y }
                      : n;
                  }),
                }),
                false,
              );
          }}
          onConnect={(c) => {
            const error = connectionError(doc, c.source, c.target);
            if (error) {
              toast.error(error);
              return;
            }
            store.change((d) => ({
              ...d,
              edges: [
                ...d.edges,
                {
                  id: `${c.source}:${c.target}`,
                  source: c.source,
                  target: c.target,
                },
              ],
              ready: d.ready.filter(
                (id) =>
                  id !== c.target && !downstream(d, c.target).includes(id),
              ),
            }));
          }}
        >
          <Panel position="top-left" className="!m-3">
            <div className="bg-background flex flex-col gap-1 rounded-lg border p-1 shadow-sm">
              <IconButton
                label="Select and move"
                icon={MousePointer2}
                onClick={() => setPan(false)}
                variant={!pan ? "secondary" : "ghost"}
              />
              <IconButton
                label="Pan canvas"
                icon={Hand}
                onClick={() => setPan(true)}
                variant={pan ? "secondary" : "ghost"}
              />
              <IconButton
                label={
                  workflow === "youtube"
                    ? "Add thumbnail branch"
                    : "Add video branch"
                }
                icon={Plus}
                onClick={addBranch}
                disabled={busy}
              />
              <IconButton
                label="Replace source image"
                icon={Upload}
                onClick={() => upload.current?.click()}
                disabled={busy}
              />
            </div>
          </Panel>
          <Panel position="bottom-left" className="!m-3">
            <div className="bg-background flex items-center gap-1 rounded-lg border p-1 shadow-sm">
              <IconButton
                label="Zoom out"
                icon={Minus}
                onClick={() => flow.zoomOut()}
              />
              <IconButton
                label="Fit canvas"
                icon={Focus}
                onClick={() => flow.fitView({ padding: 0.08, duration: 250 })}
              />
              <IconButton
                label="Zoom in"
                icon={Plus}
                onClick={() => flow.zoomIn()}
              />
            </div>
          </Panel>
          <Panel position="bottom-right" className="!m-3 sm:hidden">
            <Select onValueChange={setInspecting}>
              <SelectTrigger
                className="bg-background w-44"
                aria-label="Inspect canvas object"
              >
                <SelectValue placeholder="Inspect an object" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {doc.nodes.map((n) => (
                    <SelectItem key={n.id} value={n.id}>
                      {n.title}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Panel>
        </Canvas>
      </div>
      <footer className="text-muted-foreground flex h-7 shrink-0 items-center justify-between gap-3 border-t px-3 text-[10px]">
        <span>
          {busy
            ? `${labels[doc.nodes.find((n) => n.id === active)?.kind ?? "prompt"]} in progress`
            : "Scripted demo · sample media"}
          <span className="hidden sm:inline">
            {" "}
            · Drag headings · connect ports
          </span>
        </span>
        <span role="status">
          {saved === "Saved on this device" ? "Saved locally" : saved}
        </span>
      </footer>
      <input
        ref={upload}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        aria-label="Upload source image"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          if (
            file.size > 2000000 ||
            !["image/png", "image/jpeg", "image/webp"].includes(file.type)
          ) {
            toast.error("Choose a PNG, JPEG, or WebP under 2 MB.");
            return;
          }
          const reader = new FileReader();
          reader.onload = () =>
            store.change((d) => ({
              ...d,
              sourceImage: String(reader.result),
              ready: [
                "source",
                ...d.nodes
                  .filter(
                    (n) =>
                      n.kind === "transcript" ||
                      n.kind === "titles" ||
                      n.kind === "description",
                  )
                  .map((n) => n.id),
              ],
            }));
          reader.readAsDataURL(file);
        }}
      />
      <Inspector
        title={selected?.title ?? "Canvas object"}
        open={Boolean(selected)}
        onClose={() => setInspecting(null)}
      >
        {selected && (
          <>
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <span
                className="size-2 rounded-full"
                style={{ background: portColors[selected.kind] }}
              />
              {labels[selected.kind]} ·{" "}
              {doc.ready.includes(selected.id) ? "Ready" : "Inputs changed"}
            </div>
            {selected.kind === "clip" ? (
              <div className="mx-auto h-96 w-56">
                <MotionPreview
                  key={`${doc.sourceImage}:${selected.motion}`}
                  src={doc.sourceImage}
                  motion={selected.motion}
                  title={`${selected.title} enlarged`}
                />
              </div>
            ) : selected.kind === "thumbnail" ? (
              <Thumbnail block={selected} image={doc.sourceImage} />
            ) : null}
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="media-node-title">Name</FieldLabel>
                <Input
                  id="media-node-title"
                  value={selected.title}
                  onChange={(e) =>
                    patch(selected.id, { title: e.target.value })
                  }
                  disabled={busy}
                  maxLength={150}
                />
              </Field>
              {selected.kind !== "source" &&
                selected.kind !== "publish" &&
                selected.kind !== "clip" && (
                  <Field>
                    <FieldLabel htmlFor="media-node-content">
                      {selected.kind === "thumbnail"
                        ? "Headline"
                        : selected.kind === "transcript"
                          ? "Transcript"
                          : "Content"}
                    </FieldLabel>
                    <Textarea
                      id="media-node-content"
                      value={selected.text}
                      onChange={(e) =>
                        patch(selected.id, { text: e.target.value })
                      }
                      disabled={busy}
                      rows={8}
                      maxLength={12000}
                    />
                  </Field>
                )}
              {(selected.kind === "prompt" || selected.kind === "clip") && (
                <Field>
                  <FieldLabel>Camera movement</FieldLabel>
                  <Select
                    value={selected.motion}
                    onValueChange={(motion) => {
                      const nextMotion = (
                        ["push", "slide", "pull"] as const
                      ).find((value) => value === motion);
                      if (!nextMotion) return;
                      patch(selected.id, {
                        motion: nextMotion,
                      });
                      if (selected.kind === "prompt")
                        for (const e of doc.edges.filter(
                          (item) => item.source === selected.id,
                        ))
                          patch(e.target, {
                            motion: nextMotion,
                          });
                    }}
                    disabled={busy}
                  >
                    <SelectTrigger aria-label="Camera movement">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="push">Slow push in</SelectItem>
                        <SelectItem value="slide">Slide left</SelectItem>
                        <SelectItem value="pull">Pull back</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              )}
              {selected.kind === "thumbnail" && (
                <Field>
                  <FieldLabel>Color treatment</FieldLabel>
                  <Select
                    value={selected.variant}
                    onValueChange={(variant) => {
                      const nextVariant = (
                        ["amber", "mint", "paper"] as const
                      ).find((value) => value === variant);
                      if (!nextVariant) return;
                      patch(selected.id, {
                        variant: nextVariant,
                      });
                    }}
                    disabled={busy}
                  >
                    <SelectTrigger aria-label="Thumbnail color">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="amber">Amber</SelectItem>
                        <SelectItem value="mint">Mint</SelectItem>
                        <SelectItem value="paper">Paper</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </FieldGroup>
            {selected.kind === "source" && (
              <>
                <p className="text-muted-foreground text-xs">
                  {doc.sourceUrl || "Bundled sample source"}
                </p>
                <Button
                  variant="outline"
                  onClick={() => upload.current?.click()}
                  disabled={busy}
                >
                  <Upload data-icon="inline-start" />
                  Replace image
                </Button>
                <Button
                  variant="ghost"
                  onClick={() =>
                    store.change((d) => ({ ...d, sourceImage: podcastImage }))
                  }
                  disabled={busy}
                >
                  Use sample image
                </Button>
              </>
            )}
            <div className="flex flex-col gap-2">
              {selected.kind === "thumbnail" && (
                <Button
                  onClick={() =>
                    downloadThumbnail(selected, doc.sourceImage).catch(() =>
                      toast.error("The thumbnail could not be exported."),
                    )
                  }
                  disabled={!doc.ready.includes(selected.id) || busy}
                >
                  <ArrowDownToLine data-icon="inline-start" />
                  Download thumbnail
                </Button>
              )}
              {["transcript", "titles", "description", "prompt"].includes(
                selected.kind,
              ) && (
                <>
                  <Button
                    variant="outline"
                    onClick={() =>
                      navigator.clipboard
                        .writeText(selected.text)
                        .then(() => toast.success("Copied"))
                        .catch(() =>
                          toast.error(
                            "Clipboard unavailable. Use download instead.",
                          ),
                        )
                    }
                  >
                    <Copy data-icon="inline-start" />
                    Copy text
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      downloadFile(
                        `${selected.id}.txt`,
                        selected.text,
                        "text/plain",
                      )
                    }
                  >
                    <ArrowDownToLine data-icon="inline-start" />
                    Download text
                  </Button>
                </>
              )}
              {selected.kind !== "source" && (
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => {
                    run(selected.id);
                    setInspecting(null);
                  }}
                >
                  <Play data-icon="inline-start" />
                  Run from this object
                </Button>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium">Connected inputs</p>
              {doc.edges
                .filter((e) => e.target === selected.id)
                .map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between rounded border px-3 py-2 text-xs"
                  >
                    <button
                      onClick={() => setInspecting(e.source)}
                      className="text-left hover:underline"
                    >
                      {doc.nodes.find((n) => n.id === e.source)?.title}
                    </button>
                    <IconButton
                      label={`Disconnect ${e.source} from ${selected.id}`}
                      icon={Minus}
                      disabled={busy}
                      onClick={() =>
                        store.change((d) => ({
                          ...d,
                          edges: d.edges.filter((item) => item.id !== e.id),
                          ready: d.ready.filter(
                            (id) =>
                              id !== selected.id &&
                              !downstream(d, selected.id).includes(id),
                          ),
                        }))
                      }
                    />
                  </div>
                ))}
              {!doc.edges.some((e) => e.target === selected.id) && (
                <p className="text-muted-foreground text-xs">
                  Source object · no upstream inputs
                </p>
              )}
            </div>
            {selected.id.startsWith("branch-") && (
              <Button
                variant="ghost"
                disabled={busy}
                onClick={() => {
                  const remove = [
                    selected.id,
                    ...downstream(doc, selected.id),
                  ].filter((id) => id.startsWith("branch-"));
                  store.change((d) => ({
                    ...d,
                    nodes: d.nodes.filter((n) => !remove.includes(n.id)),
                    edges: d.edges.filter(
                      (e) =>
                        !remove.includes(e.source) &&
                        !remove.includes(e.target),
                    ),
                    ready: d.ready.filter((id) => !remove.includes(id)),
                  }));
                  setInspecting(null);
                }}
              >
                <Trash2 data-icon="inline-start" />
                Remove branch
              </Button>
            )}
          </>
        )}
      </Inspector>
    </AiWorkspaceShell>
  );
}
export function MediaCanvas({ workflow }: { workflow: MediaWorkflow }) {
  return (
    <ReactFlowProvider key={workflow}>
      <MediaCanvasInner workflow={workflow} />
    </ReactFlowProvider>
  );
}
