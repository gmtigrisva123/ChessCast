import { cn } from "@/lib/utils";

const GLYPH: Record<string, string> = { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" };

/** Bàn cờ 2D gọn nhẹ dựng từ FEN. */
export function MiniBoard({ fen, highlight = [], className }: { fen: string; highlight?: string[]; className?: string }) {
  const rows = fen.split(" ")[0].split("/");
  const cells: { sq: string; piece: string | null; dark: boolean }[] = [];
  rows.forEach((row, r) => {
    let f = 0;
    for (const ch of row) {
      if (/\d/.test(ch)) {
        for (let i = 0; i < Number(ch); i++, f++) cells.push({ sq: `${"abcdefgh"[f]}${8 - r}`, piece: null, dark: (r + f) % 2 === 1 });
      } else {
        cells.push({ sq: `${"abcdefgh"[f]}${8 - r}`, piece: ch, dark: (r + f) % 2 === 1 });
        f++;
      }
    }
  });
  return (
    <div className={cn("grid aspect-square grid-cols-8 overflow-hidden rounded-xl ring-1 ring-cream/10 [container-type:inline-size]", className)}>
      {cells.map((c) => (
        <div key={c.sq} className={cn("relative grid place-items-center", c.dark ? "bg-[#2a2d36]" : "bg-[#b8b09a]", highlight.includes(c.sq) && "after:absolute after:inset-0 after:bg-pink/50")}>
          {c.piece && (
            <span
              className={cn(
                "relative z-10 select-none leading-none",
                c.piece === c.piece.toUpperCase() ? "text-[#f6f1e4] [text-shadow:0_1px_0_#000,0_0_2px_#000]" : "text-[#121317] [text-shadow:0_1px_0_rgba(255,255,255,0.25)]",
              )}
            >
              <span style={{ fontSize: "10cqw" }}>{GLYPH[c.piece.toLowerCase()]}</span>
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
