export function parseServerTiming(value: string | null): readonly string[] {
  if (!value) {
    return [];
  }
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function getServerTimingFromHeaders(
  headers: Headers | null,
): readonly string[] {
  return parseServerTiming(headers?.get("server-timing") ?? null);
}
