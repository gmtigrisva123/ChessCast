import { cn } from "@/lib/utils";

const GLYPH: Record<string, string> = { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" };

/** Bàn cờ 2D kiểu kính mờ dựng từ FEN. */
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
    <div className={cn("grid aspect-square grid-cols-8 overflow-hidden rounded-2xl ring-1 ring-white/10 [container-type:inline-size]", className)}>
      {cells.map((c) => (
        <div
          key={c.sq}
          className={cn(
            "relative grid place-items-center",
            c.dark ? "bg-[#151726]" : "bg-[#2a2d45]",
            highlight.includes(c.sq) && "after:absolute after:inset-0 after:bg-[linear-gradient(135deg,rgba(139,124,255,0.55),rgba(62,230,224,0.35))]",
          )}
        >
          {c.piece && (
            <span
              className={cn(
                "relative z-10 select-none leading-none",
                c.piece === c.piece.toUpperCase()
                  ? "text-[#f3f1ff] [text-shadow:0_0_14px_rgba(185,176,255,0.6)]"
                  : "text-[#7b7f9c] [text-shadow:0_1px_0_rgba(0,0,0,0.6)]",
              )}
              style={{ fontSize: "9.5cqw" }}
            >
              {GLYPH[c.piece.toLowerCase()]}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
