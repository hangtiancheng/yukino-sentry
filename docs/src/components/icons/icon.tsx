import { unsafeHTML } from "lit/directives/unsafe-html.js";

import activity from "lucide-static/icons/activity.svg?raw";
import arrowRight from "lucide-static/icons/arrow-right.svg?raw";
import arrowUp from "lucide-static/icons/arrow-up.svg?raw";
import arrowUpRight from "lucide-static/icons/arrow-up-right.svg?raw";
import boxes from "lucide-static/icons/boxes.svg?raw";
import braces from "lucide-static/icons/braces.svg?raw";
import bug from "lucide-static/icons/bug.svg?raw";
import camera from "lucide-static/icons/camera.svg?raw";
import check from "lucide-static/icons/check.svg?raw";
import chevronDown from "lucide-static/icons/chevron-down.svg?raw";
import component from "lucide-static/icons/component.svg?raw";
import copy from "lucide-static/icons/copy.svg?raw";
import database from "lucide-static/icons/database.svg?raw";
import eye from "lucide-static/icons/eye.svg?raw";
import fileCode from "lucide-static/icons/file-code.svg?raw";
import filter from "lucide-static/icons/filter.svg?raw";
import fingerprint from "lucide-static/icons/fingerprint.svg?raw";
import gauge from "lucide-static/icons/gauge.svg?raw";
import globe from "lucide-static/icons/globe.svg?raw";
import layers from "lucide-static/icons/layers.svg?raw";
import memoryStick from "lucide-static/icons/memory-stick.svg?raw";
import menu from "lucide-static/icons/menu.svg?raw";
import moon from "lucide-static/icons/moon.svg?raw";
import mousePointerClick from "lucide-static/icons/mouse-pointer-click.svg?raw";
import network from "lucide-static/icons/network.svg?raw";
import packageIcon from "lucide-static/icons/package.svg?raw";
import plug from "lucide-static/icons/plug.svg?raw";
import puzzle from "lucide-static/icons/puzzle.svg?raw";
import radio from "lucide-static/icons/radio.svg?raw";
import refreshCw from "lucide-static/icons/refresh-cw.svg?raw";
import route from "lucide-static/icons/route.svg?raw";
import scanEye from "lucide-static/icons/scan-eye.svg?raw";
import send from "lucide-static/icons/send.svg?raw";
import server from "lucide-static/icons/server.svg?raw";
import shieldCheck from "lucide-static/icons/shield-check.svg?raw";
import sparkles from "lucide-static/icons/sparkles.svg?raw";
import sun from "lucide-static/icons/sun.svg?raw";
import terminal from "lucide-static/icons/terminal.svg?raw";
import timer from "lucide-static/icons/timer.svg?raw";
import triangleAlert from "lucide-static/icons/triangle-alert.svg?raw";
import wandSparkles from "lucide-static/icons/wand-sparkles.svg?raw";
import waypoints from "lucide-static/icons/waypoints.svg?raw";
import wifi from "lucide-static/icons/wifi.svg?raw";
import x from "lucide-static/icons/x.svg?raw";
import zap from "lucide-static/icons/zap.svg?raw";

export const ICONS: Record<string, string> = {
  activity,
  "arrow-right": arrowRight,
  "arrow-up": arrowUp,
  "arrow-up-right": arrowUpRight,
  boxes,
  braces,
  bug,
  camera,
  check,
  "chevron-down": chevronDown,
  component,
  copy,
  database,
  eye,
  "file-code": fileCode,
  filter,
  fingerprint,
  gauge,
  globe,
  layers,
  "memory-stick": memoryStick,
  menu,
  moon,
  "mouse-pointer-click": mousePointerClick,
  network,
  package: packageIcon,
  plug,
  puzzle,
  radio,
  "refresh-cw": refreshCw,
  route,
  "scan-eye": scanEye,
  send,
  server,
  "shield-check": shieldCheck,
  sparkles,
  sun,
  terminal,
  timer,
  "triangle-alert": triangleAlert,
  "wand-sparkles": wandSparkles,
  waypoints,
  wifi,
  x,
  zap,
};

/**
 * Prepares a raw lucide-static SVG string for rendering via `unsafeHTML`.
 * Strips the license comment, optionally resizes the intrinsic 24px box and
 * merges Tailwind classes into the svg's own class attribute.
 */
export function icon(svg: string, className?: string, size?: number): string {
  let out = svg.replace(/<!--[^>]*-->\s*/g, "");
  if (size !== undefined) {
    out = out
      .replace(/width="24"/, `width="${size}"`)
      .replace(/height="24"/, `height="${size}"`);
  }
  if (className) {
    out = out.replace(/class="lucide[^"]*"/, `class="lucide ${className}"`);
  }
  return out;
}

export interface IconProps {
  readonly name: string;
  readonly className?: string;
  readonly strokeWidth?: number;
}

export function Icon({ name, className, strokeWidth }: IconProps) {
  let svg = icon(ICONS[name]!, className);
  if (strokeWidth !== undefined) {
    svg = svg.replace(/stroke-width="[^"]*"/, `stroke-width="${strokeWidth}"`);
  }
  return unsafeHTML(svg);
}
