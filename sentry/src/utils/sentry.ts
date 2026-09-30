import type { IDeviceInfo, IOptions, ISentry } from "../types";

import { DEFAULT_OPTIONS, UNKNOWN } from "../constants";
import { BoundedSet } from "./data-structures.js";

import { UAParser } from "ua-parser-js";

declare global {
  var __sentry__: ISentry | undefined;
}

function getLanguage(): string {
  return "navigator" in globalThis
    ? globalThis.navigator.language || UNKNOWN
    : UNKNOWN;
}

function getScreenResolution(): string {
  if (!("screen" in globalThis)) {
    return UNKNOWN;
  }
  return `${globalThis.screen.width}x${globalThis.screen.height}`;
}

function collectDeviceInfo(): IDeviceInfo {
  const res = new UAParser().getResult();
  return {
    browserName: res.browser.name ?? UNKNOWN,
    browserVersion: res.browser.version ?? UNKNOWN,
    osName: res.os.name ?? UNKNOWN,
    osVersion: res.os.version ?? UNKNOWN,
    userAgent: res.ua,
    deviceModel: res.device.model ?? UNKNOWN,
    deviceType: res.device.type ?? UNKNOWN,
    language: getLanguage(),
    screenResolution: getScreenResolution(),
  };
}

class Sentry implements ISentry {
  codeErrors = new BoundedSet<string>(1000);

  options: IOptions = { ...DEFAULT_OPTIONS };

  shouldScreenRecord = false;

  #deviceInfo: IDeviceInfo | null = null;

  get deviceInfo(): IDeviceInfo {
    this.#deviceInfo ??= collectDeviceInfo();
    return this.#deviceInfo;
  }

  setOptions(newOptions: Partial<IOptions>) {
    this.options = {
      ...this.options,
      ...newOptions,
    };
  }
}

const sentry = new Sentry();
globalThis.__sentry__ = sentry;

export default sentry;
