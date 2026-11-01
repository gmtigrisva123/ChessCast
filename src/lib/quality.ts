const params = () => (typeof window === "undefined" ? new URLSearchParams() : new URLSearchParams(window.location.search));

/** `?hq` pins every 3D scene to maximum quality (useful for captures and demos). */
export function pinnedHighQuality() {
  return params().has("hq");
}

/** `?lq` forces the lightweight path (no transmission/depth-of-field). */
export function pinnedLowQuality() {
  return params().has("lq");
}
