import type { ReactNode } from "react";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <section className="container-x pb-24 pt-32 md:pt-40">
      <div className="mx-auto max-w-3xl">
        <div className="eyebrow text-lime">Pháp lý</div>
        <h1 className="mt-4 font-display text-5xl font-bold uppercase md:text-7xl">{title}</h1>
        <p className="mt-3 text-sm text-cream/45">Cập nhật lần cuối: {updated}</p>
        <div className="mt-10 space-y-8 text-[16px] leading-relaxed text-cream/75 [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:uppercase [&_h2]:text-cream [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1.5">
          {children}
        </div>
      </div>
    </section>
  );
}
