import { closeSync, openSync, readSync } from "node:fs";

const NEWLINE = 0x0a;

export interface TailSnapshot {
  lines: number;
  events: unknown[];
}

export function parseJsonlLine(line: string, events: unknown[]): 0 | 1 {
  const trimmed = line.trim();
  if (trimmed === "") return 0;
  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (Array.isArray(parsed)) events.push(...parsed);
    else if (parsed !== null && typeof parsed === "object") events.push(parsed);
  } catch {}
  return 1;
}

export class ActiveLogTailer {
  private name: string | null = null;
  private consumedUpTo = 0;
  private remainder: Buffer = Buffer.alloc(0);
  private lines = 0;
  private events: unknown[] = [];

  public read(name: string, fullPath: string, size: number): TailSnapshot {
    if (this.name !== name || size < this.consumedUpTo) {
      this.resetTo(name);
    }
    if (size > this.consumedUpTo) {
      this.ingest(fullPath, this.consumedUpTo, size);
    }
    return { lines: this.lines, events: this.events };
  }

  public clear(): void {
    this.resetTo(null);
  }

  private resetTo(name: string | null): void {
    this.name = name;
    this.consumedUpTo = 0;
    this.remainder = Buffer.alloc(0);
    this.lines = 0;
    this.events = [];
  }

  private ingest(fullPath: string, from: number, to: number): void {
    const length = to - from;
    let buf = Buffer.allocUnsafe(length);
    const fd = openSync(fullPath, "r");
    try {
      const bytesRead = readSync(fd, buf, 0, length, from);
      buf = buf.subarray(0, bytesRead);
    } finally {
      closeSync(fd);
    }
    this.consumedUpTo = from + buf.length;

    const chunk = this.remainder.length
      ? Buffer.concat([this.remainder, buf])
      : buf;
    const lastNewline = chunk.lastIndexOf(NEWLINE);
    if (lastNewline === -1) {
      this.remainder = Buffer.from(chunk);
      return;
    }
    this.remainder = Buffer.from(chunk.subarray(lastNewline + 1));
    const complete = chunk.subarray(0, lastNewline).toString("utf-8");
    for (const line of complete.split("\n")) {
      this.lines += parseJsonlLine(line, this.events);
    }
  }
}
