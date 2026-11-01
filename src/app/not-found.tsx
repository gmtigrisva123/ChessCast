import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="container-x grid min-h-[80vh] place-items-center pt-28 text-center">
      <div>
        <div className="eyebrow text-pink">Lỗi 404 · Nước đi không hợp lệ</div>
        <h1 className="mt-4 font-display text-[28vw] font-bold leading-[0.8] text-cream md:text-[16vw]">
          4<span className="text-lime">0</span>4
        </h1>
        <p className="mx-auto mt-4 max-w-md text-cream/60">Trang này vừa bị ai đó ném thẻ Sương Mù Chiến Trường. Quay lại bàn cờ chính nhé.</p>
        <div className="mt-8 flex justify-center gap-3">
          <ButtonLink href="/">Về trang chủ</ButtonLink>
          <ButtonLink href="/live" variant="outline">
            Xem live
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
