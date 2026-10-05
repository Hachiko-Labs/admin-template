/** Normalize thrown values before exposing an error message in the application. */
export function errorMessage(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}
