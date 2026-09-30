export function isRecord(
  value: unknown,
): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null;
}

export function getPayloads(call: readonly unknown[]): readonly unknown[] {
  const body = call[1];
  if (typeof body !== "string") {
    return [];
  }
  const parsed: unknown = JSON.parse(body);
  if (!Array.isArray(parsed)) {
    return [];
  }
  return parsed
    .map((item) => (isRecord(item) ? item.payload : null))
    .filter((payload) => payload !== null);
}

export function findPayload(
  payloads: readonly unknown[],
  name: string,
): Readonly<Record<string, unknown>> | null {
  for (const payload of payloads) {
    if (isRecord(payload) && payload.name === name) {
      return payload;
    }
  }
  return null;
}
