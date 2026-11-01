import { ButtonLink } from "@/components/ui/button";
import { Aurora } from "@/components/ui/aurora";

export default function NotFound() {
  return (
    <section className="relative grid min-h-[86vh] place-items-center overflow-hidden pt-28 text-center">
      <Aurora />
      <div className="relative px-4">
        <div className="kicker text-fg-3">Lỗi 404 · nước đi không hợp lệ</div>
        <h1 className="display mt-6 text-[clamp(5rem,20vw,14rem)] leading-none">
          4<span className="serif-accent text-aurora">0</span>4
        </h1>
        <p className="mx-auto mt-4 max-w-md text-fg-2">Trang này vừa bị ai đó ném Sương Mù Chiến Trường. Quay lại sân khấu chính nhé.</p>
        <div className="mt-8 flex justify-center gap-3">
          <ButtonLink href="/">Về trang chủ</ButtonLink>
          <ButtonLink href="/live" variant="glass">
            Vào Arena
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
