import type { Metadata } from "next";
import { LegalPage } from "@/components/ui/legal";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Điều khoản sử dụng" };

export default function TermsPage() {
  return (
    <LegalPage title="Điều khoản sử dụng" updated="01/11/2026">
      <p>Chào mừng bạn đến với ChessCast. Khi sử dụng nền tảng, bạn đồng ý với các điều khoản dưới đây. Bản này là bản tóm tắt cho giai đoạn ra mắt và sẽ được hoàn thiện cùng đơn vị tư vấn pháp lý.</p>
      <div>
        <h2>1. Dịch vụ</h2>
        <p>ChessCast cung cấp trải nghiệm xem và chơi cờ vua có bình luận AI, Chaos Cards, Chess Court, Chess Royale và các tính năng giải trí liên quan.</p>
      </div>
      <div id="coin" className="scroll-mt-28">
        <h2>2. Chaos Coins &amp; vật phẩm ảo</h2>
        <ul>
          <li>Chaos Coins là vật phẩm giải trí ảo, chỉ dùng trong ChessCast.</li>
          <li>Coin không có giá trị quy đổi thành tiền, không thể rút, chuyển nhượng hay bán lại.</li>
          <li>Coin không bao giờ được dùng để đặt cược vào kết quả trận đấu. ChessCast không cung cấp bất kỳ hình thức cá cược nào.</li>
          <li>Coin đã sử dụng cho Chaos Cards hoặc tip không được hoàn lại, trừ trường hợp lá bài không kích hoạt được.</li>
        </ul>
      </div>
      <div>
        <h2>3. Gói thành viên</h2>
        <p>Gói Fan Pro và Chaos Lord được gia hạn tự động theo chu kỳ đã chọn. Bạn có thể huỷ bất kỳ lúc nào; quyền lợi giữ nguyên đến hết chu kỳ đã thanh toán.</p>
      </div>
      <div>
        <h2>4. Hành vi người dùng</h2>
        <ul>
          <li>Không gian lận, dùng engine khi thi đấu hoặc lạm dụng lỗi hệ thống.</li>
          <li>Nội dung tip và chat không được xúc phạm, quấy rối hay phân biệt đối xử. Host AI sẽ từ chối các yêu cầu vi phạm.</li>
          <li>Hình phạt Chess Court chỉ là thử thách giải trí, không gây thiệt hại vật chất cho người chơi.</li>
        </ul>
      </div>
      <div>
        <h2>5. Liên hệ</h2>
        <p>
          Mọi thắc mắc vui lòng gửi về <a href={`mailto:${site.emails.support}`}>{site.emails.support}</a>.
        </p>
      </div>
    </LegalPage>
  );
}
