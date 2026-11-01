import { ScrollText } from "../ui/reveal";

export function Manifesto() {
  return (
    <section className="shell py-24 md:py-40">
      <ScrollText
        className="display mx-auto max-w-5xl text-center text-[clamp(1.9rem,4.2vw,3.6rem)] leading-[1.12]"
        text="Cờ vua có hơn sáu trăm triệu người chơi, nhưng gần như không ván nào được xem. ChessCast biến từng ván vô danh thành một show có nhân vật, có kịch tính, và có bạn ở hàng ghế đầu — với quyền bẻ lái câu chuyện."
      />
    </section>
  );
}
