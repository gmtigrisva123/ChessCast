import { cn } from "@/lib/utils";

/** Aurora backdrop: soft blurred gradient blobs drifting slowly. */
export function Aurora({ tone = "violet", className }: { tone?: "violet" | "ember" | "teal"; className?: string }) {
  const c =
    tone === "ember"
      ? ["rgba(255,138,76,0.28)", "rgba(255,107,154,0.22)", "rgba(139,124,255,0.18)"]
      : tone === "teal"
        ? ["rgba(62,230,224,0.22)", "rgba(77,141,255,0.24)", "rgba(139,124,255,0.18)"]
        : ["rgba(109,92,255,0.32)", "rgba(77,141,255,0.22)", "rgba(62,230,224,0.16)"];
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 -z-0 overflow-hidden", className)}>
      <div className="absolute left-1/2 top-[-30%] h-[70vh] w-[90vw] -translate-x-1/2 animate-aurora rounded-full blur-[110px]" style={{ background: `radial-gradient(closest-side, ${c[0]}, transparent)` }} />
      <div className="absolute right-[-10%] top-[-10%] h-[50vh] w-[50vw] animate-aurora rounded-full blur-[110px] [animation-delay:-6s]" style={{ background: `radial-gradient(closest-side, ${c[1]}, transparent)` }} />
      <div className="absolute left-[-10%] top-[10%] h-[45vh] w-[40vw] animate-aurora rounded-full blur-[110px] [animation-delay:-12s]" style={{ background: `radial-gradient(closest-side, ${c[2]}, transparent)` }} />
      <div className="dot-grid absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_top,#000_10%,transparent_65%)]" />
    </div>
  );
}
