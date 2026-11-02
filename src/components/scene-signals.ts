import type { HostId } from "@/lib/hosts";

/**
 * Mutable bridges between the scroll / pointer handlers and the WebGL scenes.
 *
 * They live in their own dependency-free module on purpose. The sections that
 * write to them are server-rendered, while the scenes that read them are loaded
 * with `dynamic(..., { ssr: false })`. Exporting a signal from its scene module
 * would make that static import pull the whole Three.js graph into the server
 * bundle and undo the `ssr: false`.
 */
export const heroSignal = { progress: 0, mx: 0, my: 0 };
export const storySignal = { progress: 0, speaking: null as HostId | null };
export const warpSignal = { speed: 0 };
export const morphSignal = { t: 0, mx: 0, my: 0 };
