import type {
  TokenizerRequest,
  TokenizerResult,
  TokenPiece,
} from "./tokenizer-types";

// Keep vocabulary loading and BPE work off the UI thread. Each import is cached
// by the browser, and only the encoding selected by the user is loaded.
self.addEventListener(
  "message",
  async (event: MessageEvent<TokenizerRequest>) => {
    const { sequence, encoding, mode, input } = event.data;
    try {
      const api =
        encoding === "o200k_base"
          ? await import("gpt-tokenizer/encoding/o200k_base")
          : await import("gpt-tokenizer/encoding/cl100k_base");
      let ids: number[];
      if (mode === "encode") {
        ids = api.encode(input, { disallowedSpecial: new Set() });
      } else {
        let parsed: unknown;
        try {
          parsed = input.trim()
            ? JSON.parse(input.trim().startsWith("[") ? input : `[${input}]`)
            : [];
        } catch {
          throw new Error(
            "Enter a JSON array or comma-separated list of token IDs.",
          );
        }
        if (
          !Array.isArray(parsed) ||
          parsed.length > 10000 ||
          !parsed.every(
            (id) => Number.isInteger(id) && id >= 0 && id < api.vocabularySize,
          )
        )
          throw new Error(
            `Use up to 10,000 integer token IDs between 0 and ${api.vocabularySize - 1}.`,
          );
        ids = parsed.map((id) => Number(id));
      }
      const text = api.decode(ids);
      const pieces: TokenPiece[] = [];
      let group: number[] = [];
      let startIndex = 0;
      for (let index = 0; index < ids.length; index++) {
        if (!group.length) startIndex = index;
        group.push(ids[index]);
        const decoded = api.decode(group);
        // A UTF-8 character can span several BPE tokens. Group those fragments
        // so the visual preview does not introduce replacement characters.
        if (
          !decoded.endsWith("\uFFFD") ||
          group.length >= 8 ||
          index === ids.length - 1
        ) {
          pieces.push({ ids: group, text: decoded, index: startIndex });
          group = [];
        }
      }
      self.postMessage({
        sequence,
        ids,
        pieces,
        text,
      } satisfies TokenizerResult);
    } catch (cause) {
      self.postMessage({
        sequence,
        ids: [],
        pieces: [],
        text: "",
        error:
          cause instanceof Error
            ? cause.message
            : "Unable to process this input.",
      } satisfies TokenizerResult);
    }
  },
);
