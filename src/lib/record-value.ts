/** Look up an own entry while retaining the table's value contract. */
export function recordValue<T>(
  table: Readonly<Record<string, T>>,
  key: string,
): T | undefined {
  return Object.hasOwn(table, key) ? table[key] : undefined;
}
