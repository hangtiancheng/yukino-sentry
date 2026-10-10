import { useEffect, useMemo, useRef, useState } from "react";
import { Replayer } from "@rrweb/replay";
import "@rrweb/replay/dist/style.css";
import { unzipScreenRecord } from "@yukino.js/sentry/plugins";
import { RotateCcw } from "lucide-react";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBytes, formatDateTime } from "@/lib/stats";
import type { ReportEvent } from "@/lib/log-types";
import { cn } from "@/lib/utils";

type ReplayEvents = ConstructorParameters<typeof Replayer>[0];

const MAX_RECORDINGS = 10;
const MAX_PLAYER_HEIGHT = 360;

const metaEventSchema = z.object({
  type: z.literal(4),
  data: z.object({ width: z.number(), height: z.number() }),
});

const replayEventSchema = z.looseObject({
  type: z.number(),
  timestamp: z.number(),
});

function isReplayEvents(value: unknown): value is ReplayEvents {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    value.every((item) => replayEventSchema.safeParse(item).success)
  );
}

function recordKey(event: ReportEvent, index: number): string {
  return event.payload?.id ?? `${event.timestamp}-${index}`;
}

function rawRecordOf(event: ReportEvent): string | undefined {
  const payload = event.payload;
  if (typeof payload?.event === "string" && payload.event !== "")
    return payload.event;
  if (typeof payload?.events === "string" && payload.events !== "")
    return payload.events;
  return undefined;
}

function payloadSizeOf(event: ReportEvent): number {
  const raw = rawRecordOf(event);
  return typeof raw === "string" ? Math.round((raw.length * 3) / 4) : 0;
}

export function ScreenRecordCard({ events }: { events: ReportEvent[] }) {
  const recordings = useMemo(
    () =>
      events
        .filter((event) => event.type === "ScreenRecord")
        .slice(-MAX_RECORDINGS)
        .reverse(),
    [events],
  );

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const replayerRef = useRef<Replayer | null>(null);

  const selected =
    recordings.find(
      (event, index) => recordKey(event, index) === selectedKey,
    ) ?? null;
  const selectedRaw = selected ? (rawRecordOf(selected) ?? null) : null;

  interface DecodeState {
    readonly raw: string | null;
    readonly events: ReplayEvents | null;
    readonly failed: boolean;
  }

  const [decodeState, setDecodeState] = useState<DecodeState>({
    raw: null,
    events: null,
    failed: false,
  });
  if (decodeState.raw !== selectedRaw) {
    setDecodeState({ raw: selectedRaw, events: null, failed: false });
  }

  useEffect(() => {
    if (selectedRaw === null) return;
    let cancelled = false;
    unzipScreenRecord(selectedRaw)
      .then((decoded) => {
        if (cancelled) return;
        const events = isReplayEvents(decoded) ? decoded : null;
        setDecodeState({ raw: selectedRaw, events, failed: events === null });
      })
      .catch(() => {
        if (!cancelled) {
          setDecodeState({ raw: selectedRaw, events: null, failed: true });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [selectedRaw]);

  const replayEvents = decodeState.events;
  const decodeError =
    selectedKey !== null && decodeState.failed
      ? "Unable to decode this recording (needs at least 2 rrweb events)"
      : null;

  useEffect(() => {
    if (!replayEvents) return;
    const container = containerRef.current;
    if (!container) return;

    const meta = replayEvents
      .map((event) => metaEventSchema.safeParse(event))
      .find((parsed) => parsed.success)?.data;
    const recordedWidth = meta?.data.width ?? 1280;
    const recordedHeight = meta?.data.height ?? 720;
    const availableWidth = container.clientWidth || 640;
    const scale = Math.min(
      availableWidth / recordedWidth,
      MAX_PLAYER_HEIGHT / recordedHeight,
      1,
    );

    let replayer: Replayer | null = null;
    try {
      replayer = new Replayer(replayEvents, {
        root: container,
        mouseTail: false,
      });
      replayer.play();
      replayerRef.current = replayer;

      container.style.height = `${Math.ceil(recordedHeight * scale)}px`;
      const wrapper = container.querySelector<HTMLElement>(".replayer-wrapper");
      if (wrapper) {
        wrapper.style.transform = `scale(${scale})`;
        wrapper.style.transformOrigin = "top left";
        wrapper.style.position = "absolute";
        wrapper.style.left = "0";
        wrapper.style.top = "0";
      }
    } catch {
      container.replaceChildren();
      container.textContent =
        "Unable to replay this recording (no full snapshot in window)";
      container.style.padding = "12px";
    }

    return () => {
      replayerRef.current = null;
      if (replayer) {
        try {
          replayer.pause();
          replayer.destroy();
        } catch {}
      }
      container.replaceChildren();
      container.style.height = "";
      container.style.padding = "";
    };
  }, [replayEvents]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Screen Recordings</CardTitle>
        <CardDescription>
          Rolling rrweb windows reported around errors and failed requests —
          click a row to replay
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {recordings.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No screen recordings reported
          </p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Time</TableHead>
                  <TableHead>Page</TableHead>
                  <TableHead className="w-24 text-right">Events</TableHead>
                  <TableHead className="w-24 text-right">Size</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recordings.map((event, index) => {
                  const key = recordKey(event, index);
                  return (
                    <TableRow
                      key={key}
                      className={cn(
                        "cursor-pointer",
                        key === selectedKey && "bg-muted/60",
                      )}
                      onClick={() => setSelectedKey(key)}
                    >
                      <TableCell className="text-muted-foreground text-xs tabular-nums">
                        {formatDateTime(event.timestamp)}
                      </TableCell>
                      <TableCell className="max-w-0">
                        <span
                          className="block truncate font-mono text-xs"
                          title={event.url}
                        >
                          {event.url || "-"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-xs tabular-nums">
                        <Badge variant="outline">
                          {event.payload?.eventCount ?? "-"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-xs tabular-nums">
                        {formatBytes(payloadSizeOf(event))}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {selectedKey === null ? (
              <p className="text-muted-foreground text-sm">
                Select a recording above to replay it
              </p>
            ) : decodeError ? (
              <p className="text-destructive text-sm">{decodeError}</p>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => replayerRef.current?.play(0)}
                >
                  <RotateCcw data-icon="inline-start" />
                  Replay
                </Button>
                <span className="text-muted-foreground text-xs">
                  Playback is scaled to fit the card
                </span>
              </div>
            )}
            <div
              ref={containerRef}
              className={cn(
                "bg-muted/30 relative w-full overflow-hidden rounded-md border",
                (selectedKey === null || decodeError) && "hidden",
              )}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
