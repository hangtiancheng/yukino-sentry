/**
 * Copyright (c) 2026 hangtiancheng
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { EventType, type IPub, type ISub, type TEventHandler } from "../types";
import { sentryLogger } from "../utils";
import type { Cleanup } from "../utils/decorate-prop.js";

const event2handlers = new Map<EventType, Set<TEventHandler>>();

export const pub: IPub = (type, data) => {
  const handlers = event2handlers.get(type);
  if (!handlers) {
    return;
  }
  for (const handler of handlers) {
    try {
      handler(data);
    } catch (err) {
      sentryLogger.error("Error executing event handler", err);
    }
  }
};

export const sub: ISub = (type, handler) => {
  const handlers = event2handlers.get(type);
  if (!handlers) {
    event2handlers.set(type, new Set([handler]));
    return () => {
      event2handlers.get(type)?.delete(handler);
    };
  }
  handlers.add(handler);
  return () => {
    handlers.delete(handler);
  };
};

export const clearSubscriptions: Cleanup = () => {
  event2handlers.clear();
};
