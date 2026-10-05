import { z } from "zod";
function config() {
  return {
    base: process.env.AI_COMPARISON_BASE_URL,
    key: process.env.AI_COMPARISON_API_KEY,
    models: (process.env.AI_COMPARISON_MODELS ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  };
}
export async function GET() {
  const c = config();
  return Response.json({ models: c.base && c.key ? c.models : [] });
}
export async function POST(request: Request) {
  const c = config();
  if (!c.base || !c.key || !c.models.length)
    return Response.json(
      {
        error:
          "No generation provider is configured. Paste or import real responses to compare them.",
      },
      { status: 503 },
    );
  if (
    request.headers.get("origin") &&
    new URL(request.headers.get("origin")!).host !== new URL(request.url).host
  )
    return Response.json(
      { error: "Cross-origin requests are not allowed." },
      { status: 403 },
    );
  try {
    const text = await request.text();
    if (text.length > 30000)
      return Response.json({ error: "Prompt is too large." }, { status: 413 });
    const parsed = z
      .object({
        model: z.string(),
        prompt: z.string().trim().min(1).max(20000),
      })
      .safeParse(JSON.parse(text));
    if (!parsed.success || !c.models.includes(parsed.data.model))
      return Response.json(
        {
          error:
            "Choose a configured model and enter a prompt up to 20,000 characters.",
        },
        { status: 400 },
      );
    const result = await fetch(
      `${c.base.replace(/\/$/, "")}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${c.key}`,
        },
        body: JSON.stringify({
          model: parsed.data.model,
          messages: [{ role: "user", content: parsed.data.prompt }],
          stream: false,
        }),
        signal: AbortSignal.any([request.signal, AbortSignal.timeout(60000)]),
      },
    );
    if (!result.ok)
      return Response.json(
        {
          error: `Provider returned HTTP ${result.status}. Check the provider configuration or retry.`,
        },
        { status: 502 },
      );
    const body = await result.json();
    const content = body?.choices?.[0]?.message?.content;
    if (!z.string().safeParse(content).success || !content.trim())
      return Response.json(
        { error: "The provider returned no text response." },
        { status: 502 },
      );
    return Response.json({ content: content.slice(0, 100000) });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error && error.name === "TimeoutError"
            ? "The provider timed out. Retry this response."
            : "The request could not be completed. Check the provider connection.",
      },
      { status: 502 },
    );
  }
}
