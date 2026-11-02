import type { ReactNode } from "react";
import { Aurora } from "./aurora";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <section className="relative pb-24 pt-36 md:pt-44">
      <Aurora />
      <div className="shell relative">
        <div className="mx-auto max-w-2xl">
          <div className="kicker text-fg-3">Legal · updated {updated}</div>
          <h1 className="display mt-4 text-5xl md:text-6xl">{title}</h1>
          <div className="mt-12 space-y-10 text-[16px] leading-[1.75] text-fg-2 [&_a]:text-violet [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-fg [&_li]:ml-5 [&_li]:list-disc [&_li]:marker:text-violet [&_ul]:space-y-2">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
