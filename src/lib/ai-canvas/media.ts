import { z } from "zod";

export const podcastImage = "/ai-chat/canvas-media/podcast-studio.png";
export const sampleTranscript = `00:00  You don't need a studio to start a podcast. Today we'll set up a recording space using the equipment you already have.

00:42  Start with the room. Curtains, a rug, and a shelf of books reduce the echo before you buy another microphone.

02:18  Keep the microphone a hand's width from your mouth. Speak slightly across it, rather than directly into it, to soften plosives.

04:06  Record a thirty-second test. Listen for fans, keyboard noise, and clipping. Turn the input gain down before the loudest moment.

06:35  Build a repeatable setup. Mark the mic position, save your recording settings, and keep a short checklist beside the desk.

08:02  Your first episode doesn't need to be perfect. A clear idea, a comfortable guest, and understandable audio are enough to begin.`;

export const mediaNodeSchema = z.object({
  id: z.string().min(1),
  kind: z.enum([
    "source",
    "transcript",
    "titles",
    "thumbnail",
    "description",
    "publish",
    "prompt",
    "clip",
  ]),
  title: z.string().max(150),
  text: z.string().max(12000),
  x: z.number().finite(),
  y: z.number().finite(),
  width: z.number().min(180).max(900),
  height: z.number().min(120).max(1000),
  variant: z.enum(["amber", "mint", "paper"]).default("amber"),
  motion: z.enum(["push", "slide", "pull"]).default("push"),
});
export const mediaDocumentSchema = z.object({
  version: z.literal(1),
  workflow: z.enum(["youtube", "video"]),
  sourceUrl: z.string().max(2000),
  sourceImage: z.string().max(3000000),
  videoTitle: z.string().max(200),
  chosenThumbnail: z.string(),
  nodes: z.array(mediaNodeSchema).min(1).max(30),
  edges: z
    .array(z.object({ id: z.string(), source: z.string(), target: z.string() }))
    .max(80),
  ready: z.array(z.string()).max(30),
});
export type MediaDocument = z.infer<typeof mediaDocumentSchema>;
export type MediaBlock = z.infer<typeof mediaNodeSchema>;
export type MediaWorkflow = MediaDocument["workflow"];
const node = (
  id: string,
  kind: MediaBlock["kind"],
  title: string,
  text: string,
  x: number,
  y: number,
  width: number,
  height: number,
  extra: Partial<MediaBlock> = {},
) =>
  mediaNodeSchema.parse({
    id,
    kind,
    title,
    text,
    x,
    y,
    width,
    height,
    ...extra,
  });
const edge = (source: string, target: string) => ({
  id: `${source}:${target}`,
  source,
  target,
});
const youtubeNodes = [
  node(
    "source",
    "source",
    "Podcast setup.mp4",
    "Sample episode · 08:24",
    0,
    220,
    330,
    380,
  ),
  node(
    "transcript",
    "transcript",
    "Transcript",
    sampleTranscript,
    425,
    105,
    360,
    590,
  ),
  node(
    "titles",
    "titles",
    "Title ideas",
    "Record your first podcast—with the gear you have\n3 fixes that make a budget mic sound better\nYour room matters more than your microphone",
    890,
    0,
    380,
    245,
  ),
  node(
    "thumb-1",
    "thumbnail",
    "Thumbnail / 01",
    "START YOUR\nPODCAST",
    890,
    345,
    340,
    260,
  ),
  node(
    "thumb-2",
    "thumbnail",
    "Thumbnail / 02",
    "BETTER AUDIO\nFOR $0",
    1300,
    345,
    340,
    260,
    { variant: "mint" },
  ),
  node(
    "description",
    "description",
    "Description & chapters",
    "Start recording with the equipment you already have. In this episode: room treatment, microphone placement, gain, and a repeatable recording checklist.\n\n00:00 Start with what you have\n00:42 Treat the room\n02:18 Place the microphone\n04:06 Record a test\n06:35 Save your setup",
    890,
    715,
    380,
    310,
  ),
  node(
    "publish",
    "publish",
    "YouTube preview",
    "Studio Notes · 8:24",
    1300,
    0,
    340,
    280,
  ),
];
const videoNodes = [
  node(
    "source",
    "source",
    "Podcast / source frame",
    "One source. Three camera directions.",
    0,
    295,
    275,
    410,
  ),
  node(
    "prompt-1",
    "prompt",
    "01 / Slow push in",
    "Keep the speaker and studio unchanged. Start at a medium portrait crop and move slowly toward the microphone. One continuous shot, no cuts.",
    415,
    0,
    310,
    230,
  ),
  node("clip-1", "clip", "01 / Push in", "9:16 · 6 seconds", 865, 0, 225, 315),
  node(
    "prompt-2",
    "prompt",
    "02 / Slide left",
    "Preserve the speaker, microphone, and warm studio lighting. Move the camera gently to the left. Keep the face in frame throughout.",
    415,
    385,
    310,
    230,
    { motion: "slide" },
  ),
  node(
    "clip-2",
    "clip",
    "02 / Slide left",
    "9:16 · 6 seconds",
    865,
    385,
    225,
    315,
    { motion: "slide" },
  ),
  node(
    "prompt-3",
    "prompt",
    "03 / Pull back",
    "Begin with a tight close-up and slowly reveal more of the recording setup. Preserve the expression and microphone position. No scene changes.",
    415,
    770,
    310,
    230,
    { motion: "pull" },
  ),
  node(
    "clip-3",
    "clip",
    "03 / Pull back",
    "9:16 · 6 seconds",
    865,
    770,
    225,
    315,
    { motion: "pull" },
  ),
  node(
    "refine",
    "prompt",
    "Refine / closer framing",
    "Use the second result as the reference. Tighten the frame and make the movement more subtle. Keep the same lighting and background.",
    1210,
    385,
    310,
    230,
  ),
  node(
    "final",
    "clip",
    "04 / Refined take",
    "9:16 · 6 seconds",
    1660,
    385,
    225,
    315,
  ),
];
export const mediaExamples: Record<MediaWorkflow, MediaDocument> = {
  youtube: mediaDocumentSchema.parse({
    version: 1,
    workflow: "youtube",
    sourceUrl: "",
    sourceImage: podcastImage,
    videoTitle: youtubeNodes[2].text.split("\n")[0],
    chosenThumbnail: "thumb-1",
    nodes: youtubeNodes,
    edges: [
      edge("source", "transcript"),
      ...["titles", "thumb-1", "thumb-2", "description"].map((id) =>
        edge("transcript", id),
      ),
      edge("titles", "publish"),
      edge("thumb-1", "publish"),
    ],
    ready: youtubeNodes.map((n) => n.id),
  }),
  video: mediaDocumentSchema.parse({
    version: 1,
    workflow: "video",
    sourceUrl: "",
    sourceImage: podcastImage,
    videoTitle: "Podcast camera variations",
    chosenThumbnail: "",
    nodes: videoNodes,
    edges: [1, 2, 3]
      .flatMap((i) => [
        edge("source", `prompt-${i}`),
        edge(`prompt-${i}`, `clip-${i}`),
        edge("source", `clip-${i}`),
      ])
      .concat([edge("clip-2", "refine"), edge("refine", "final")]),
    ready: videoNodes.map((n) => n.id),
  }),
};
export function downstream(doc: MediaDocument, id: string): string[] {
  const found = new Set<string>();
  const visit = (source: string) => {
    for (const e of doc.edges.filter((item) => item.source === source))
      if (!found.has(e.target)) {
        found.add(e.target);
        visit(e.target);
      }
  };
  visit(id);
  return [...found];
}
export function connectionError(
  doc: MediaDocument,
  source: string,
  target: string,
): string | null {
  const from = doc.nodes.find((n) => n.id === source),
    to = doc.nodes.find((n) => n.id === target);
  if (
    !from ||
    !to ||
    source === target ||
    downstream(doc, target).includes(source)
  )
    return "That connection would create a loop.";
  if (doc.edges.some((e) => e.source === source && e.target === target))
    return "These objects are already connected.";
  const compatible: Record<MediaBlock["kind"], MediaBlock["kind"][]> = {
    source: ["transcript", "prompt", "clip"],
    transcript: ["titles", "thumbnail", "description"],
    titles: ["publish"],
    thumbnail: ["publish"],
    description: ["publish"],
    publish: [],
    prompt: ["clip"],
    clip: ["prompt"],
  };
  return compatible[from.kind].includes(to.kind)
    ? null
    : "Connect a source to a compatible input.";
}
export function executionOrder(doc: MediaDocument, ids: string[]): string[] {
  for (const id of ids) {
    const block = doc.nodes.find((n) => n.id === id);
    if (!block) throw new Error("A canvas object is missing.");
    const inputKinds = doc.edges
      .filter((e) => e.target === id)
      .map((e) => doc.nodes.find((n) => n.id === e.source)?.kind);
    const required: Partial<Record<MediaBlock["kind"], MediaBlock["kind"][]>> =
      {
        transcript: ["source"],
        titles: ["transcript"],
        thumbnail: ["transcript"],
        description: ["transcript"],
        publish: ["titles", "thumbnail"],
        clip: ["prompt"],
      };
    if (
      required[block.kind]?.some((kind) => !inputKinds.includes(kind)) ||
      (block.kind === "prompt" &&
        !inputKinds.some((kind) => kind === "source" || kind === "clip"))
    )
      throw new Error(
        `${block.title} needs its connected input before it can run.`,
      );
  }
  const remaining = new Set(ids),
    result: string[] = [];
  const finished = new Set(doc.ready.filter((id) => !remaining.has(id)));
  while (remaining.size) {
    const id = [...remaining].find((candidate) =>
      doc.edges
        .filter((e) => e.target === candidate)
        .every((e) => finished.has(e.source)),
    );
    if (!id)
      throw new Error("An input is missing or a connection forms a loop.");
    remaining.delete(id);
    finished.add(id);
    result.push(id);
  }
  return result;
}
export function validYouTubeUrl(input: string): boolean {
  try {
    const u = new URL(input);
    return (
      u.protocol === "https:" &&
      ((["youtube.com", "www.youtube.com", "m.youtube.com"].includes(
        u.hostname,
      ) &&
        ((u.pathname === "/watch" &&
          /^[\w-]{11}$/.test(u.searchParams.get("v") || "")) ||
          /^\/(shorts|embed)\/[\w-]{11}\/?$/.test(u.pathname))) ||
        (u.hostname === "youtu.be" && /^\/[\w-]{11}\/?$/.test(u.pathname)))
    );
  } catch {
    return false;
  }
}
