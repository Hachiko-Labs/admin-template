export type TokenEncoding = "o200k_base" | "cl100k_base";
export type TokenizerRequest = {
  sequence: number;
  encoding: TokenEncoding;
  mode: "encode" | "decode";
  input: string;
};
export type TokenPiece = { ids: number[]; text: string; index: number };
export type TokenizerResult = {
  sequence: number;
  ids: number[];
  pieces: TokenPiece[];
  text: string;
  error?: string;
};
