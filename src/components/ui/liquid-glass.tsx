"use client";

import { createElement, useEffect, useId, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Liquid Glass — real backdrop refraction (Chromium) using an SVG displacement filter whose
 * map is generated for the element's exact size and corner radius, with a slight RGB split
 * for chromatic dispersion. Other browsers fall back to frosted blur via the `.liquid` class.
 */

let support: boolean | null = null;
export function liquidSupported() {
  if (support !== null) return support;
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  const chromium = /Chrome\/|Chromium\//.test(ua) && !/Firefox\//.test(ua);
  const reduce = window.matchMedia("(prefers-reduced-transparency: reduce)").matches;
  support = chromium && !reduce && typeof CSS !== "undefined" && CSS.supports("backdrop-filter", "url(#x)");
  return support;
}

const cache = new Map<string, string>();

/** Build a displacement map: R/G encode a pixel offset that pulls the backdrop inward along the bezel. */
export function makeLiquidMap(w: number, h: number, radius: number, bezel: number, depth: number) {
  const key = [w, h, radius, bezel, depth].map((v) => Math.round(v)).join("x");
  const hit = cache.get(key);
  if (hit) return hit;
  const W = Math.max(16, Math.min(320, Math.round(w / 2)));
  const H = Math.max(16, Math.min(320, Math.round((h / w) * W)));
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(W, H);
  const hw = w / 2;
  const hh = h / 2;
  const r = Math.min(radius, hw, hh);
  const sdf = (x: number, y: number) => {
    const qx = Math.abs(x) - hw + r;
    const qy = Math.abs(y) - hh + r;
    return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
  };
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const x = ((i + 0.5) / W) * w - hw;
      const y = ((j + 0.5) / H) * h - hh;
      const d = sdf(x, y);
      let dx = 0;
      let dy = 0;
      if (d < 1 && d > -bezel) {
        const e = 0.75;
        let nx = sdf(x + e, y) - sdf(x - e, y);
        let ny = sdf(x, y + e) - sdf(x, y - e);
        const l = Math.hypot(nx, ny) || 1;
        nx /= l;
        ny /= l;
        const t = Math.min(1, Math.max(0, 1 + d / bezel));
        // convex-lens profile: gentle inside, steep at the rim
        const m = Math.pow(t, 2.6) * depth;
        dx = -nx * m;
        dy = -ny * m;
      }
      const k = (j * W + i) * 4;
      img.data[k] = 128 + Math.max(-127, Math.min(127, (dx / w) * 255));
      img.data[k + 1] = 128 + Math.max(-127, Math.min(127, (dy / h) * 255));
      img.data[k + 2] = 128;
      img.data[k + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const url = c.toDataURL();
  cache.set(key, url);
  return url;
}

type Props = {
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  radius?: number;
  bezel?: number;
  depth?: number;
  blur?: number;
  dispersion?: number;
} & Record<string, unknown>;

export function LiquidGlass({ as = "div", className, style, children, radius = 999, bezel = 16, depth = 14, blur = 2, dispersion = 0.08, ...rest }: Props) {
  const ref = useRef<HTMLElement>(null);
  const raw = useId();
  const id = `lg${raw.replace(/[^a-zA-Z0-9]/g, "")}`;
  const [map, setMap] = useState<string | null>(null);

  useEffect(() => {
    if (!liquidSupported() || !ref.current) return;
    const el = ref.current;
    let raf = 0;
    let last = "";
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      if (r.width < 8 || r.height < 8) return;
      const w = Math.round(r.width / 4) * 4;
      const h = Math.round(r.height / 4) * 4;
      const k = `${w}x${h}`;
      if (k === last) return;
      last = k;
      setMap(makeLiquidMap(w, h, radius, bezel, depth));
    };
    const ro = new ResizeObserver(() => {
      if (!raf) raf = requestAnimationFrame(update);
    });
    ro.observe(el);
    update();
    return () => {
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [radius, bezel, depth]);

  const filterStyle: CSSProperties | undefined = map
    ? { backdropFilter: `url(#${id}) blur(${blur}px) saturate(185%) brightness(1.08)` }
    : undefined;

  return createElement(
    as,
    { ref, className: cn("liquid", className), style: { ...style, ...filterStyle }, ...rest },
    map ? (
      <svg width="0" height="0" style={{ position: "absolute", pointerEvents: "none" }} aria-hidden focusable="false">
        <filter id={id} x="0" y="0" width="1" height="1" primitiveUnits="objectBoundingBox" colorInterpolationFilters="sRGB">
          <feImage href={map} x="0" y="0" width="1" height="1" preserveAspectRatio="none" result="map" />
          <feDisplacementMap in="SourceGraphic" in2="map" scale={1 + dispersion} xChannelSelector="R" yChannelSelector="G" result="dR" />
          <feColorMatrix in="dR" type="matrix" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="r" />
          <feDisplacementMap in="SourceGraphic" in2="map" scale={1} xChannelSelector="R" yChannelSelector="G" result="dG" />
          <feColorMatrix in="dG" type="matrix" values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0" result="g" />
          <feDisplacementMap in="SourceGraphic" in2="map" scale={1 - dispersion} xChannelSelector="R" yChannelSelector="G" result="dB" />
          <feColorMatrix in="dB" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0" result="b" />
          <feBlend in="r" in2="g" mode="screen" result="rg" />
          <feBlend in="rg" in2="b" mode="screen" />
        </filter>
      </svg>
    ) : null,
    children,
  );
}
