import { afterEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_OPTIONS } from "@/constants/index.js";
import {
  recorder,
  unzipScreenRecord,
} from "@/plugins/screen-record/recorder.js";
import type { IDataReporter } from "@/types/index.js";
import { sentry } from "@/utils/index.js";

describe("screen recording privacy with real rrweb", () => {
  let stop: (() => void) | undefined;

  afterEach(() => {
    stop?.();
    stop = undefined;
    sentry.shouldScreenRecord = false;
    sentry.setOptions(DEFAULT_OPTIONS);
    document.body.innerHTML = "";
  });

  async function capture(options: Parameters<typeof recorder>[1] = {}) {
    const send = vi
      .fn<Parameters<IDataReporter["send"]>, Promise<void>>()
      .mockResolvedValue(undefined);
    stop = await recorder(
      {
        send,
        flush: async () => {},
        flushOfflineCache: async () => {},
      },
      options,
    );
    sentry.shouldScreenRecord = true;
    document.body.appendChild(document.createElement("hr"));
    await vi.waitFor(() => expect(send).toHaveBeenCalled());
    const payload = send.mock.calls[0]?.[0];
    if (
      !payload ||
      !("event" in payload) ||
      typeof payload.event !== "string"
    ) {
      throw new Error("Expected a screen record payload");
    }
    return JSON.stringify(await unzipScreenRecord(payload.event));
  }

  it("removes synthetic text and input secrets from the decoded snapshot", async () => {
    document.body.innerHTML = `
      <p>synthetic-account-secret</p>
      <input value="synthetic-input-secret">
      <input type="password" value="synthetic-password-secret">
      <textarea>synthetic-textarea-secret</textarea>
    `;
    const events = await capture();
    expect(events).toContain('"type":2');
    expect(events).not.toContain("synthetic-account-secret");
    expect(events).not.toContain("synthetic-input-secret");
    expect(events).not.toContain("synthetic-password-secret");
    expect(events).not.toContain("synthetic-textarea-secret");
  });

  it("masks selected regions, blocks secrets and preserves allowed text", async () => {
    document.body.innerHTML = `
      <p>public-debug-label</p>
      <p class="private">synthetic-private-secret</p>
      <div data-secret><span>synthetic-blocked-secret</span></div>
      <input value="synthetic-input-secret">
    `;
    const events = await capture({
      maskTextSelector: ".private",
      blockSelector: "[data-secret]",
      maskInputFn: () => "[redacted-input]",
      maskTextFn: () => "[redacted-text]",
    });
    expect(events).toContain("public-debug-label");
    expect(events).toContain("[redacted-input]");
    expect(events).toContain("[redacted-text]");
    expect(events).not.toContain("synthetic-private-secret");
    expect(events).not.toContain("synthetic-blocked-secret");
    expect(events).not.toContain("synthetic-input-secret");
  });
});
