import { ButtonLink } from "@/components/ui/button";
import { Aurora } from "@/components/ui/aurora";

export default function NotFound() {
  return (
    <section className="relative grid min-h-[86vh] place-items-center overflow-hidden pt-28 text-center">
      <Aurora />
      <div className="relative px-4">
        <div className="kicker text-fg-3">Error 404 · illegal move</div>
        <h1 className="display mt-6 text-[clamp(5rem,20vw,14rem)] leading-none">
          4<span className="serif-accent text-aurora">0</span>4
        </h1>
        <p className="mx-auto mt-4 max-w-md text-fg-2">Someone just threw Fog of War on this page. Let's get you back to the main stage.</p>
        <div className="mt-8 flex justify-center gap-3">
          <ButtonLink href="/">Back home</ButtonLink>
          <ButtonLink href="/live" variant="glass">
            Enter the Arena
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
