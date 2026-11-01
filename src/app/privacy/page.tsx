import type { Metadata } from "next";
import { LegalPage } from "@/components/ui/legal";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Chính sách bảo mật" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Chính sách bảo mật" updated="01/11/2026">
      <p>ChessCast tôn trọng quyền riêng tư của bạn. Chính sách này mô tả dữ liệu chúng tôi thu thập và cách sử dụng.</p>
      <div>
        <h2>1. Dữ liệu thu thập</h2>
        <ul>
          <li>Tên hiển thị, lịch sử ván đấu, clip đã lưu và số dư coin.</li>
          <li>Email khi bạn đăng ký nhận tin hoặc gửi form liên hệ.</li>
          <li>Thông tin thanh toán được xử lý trực tiếp bởi Stripe; ChessCast không lưu số thẻ.</li>
        </ul>
      </div>
      <div>
        <h2>2. Mục đích sử dụng</h2>
        <ul>
          <li>Vận hành trận đấu, bình luận AI và tính năng Chaos Cards.</li>
          <li>Tạo clip cao trào và gợi ý nội dung.</li>
          <li>Hỗ trợ khách hàng và phòng chống gian lận.</li>
        </ul>
      </div>
      <div>
        <h2>3. Bình luận AI</h2>
        <p>Để tạo bình luận, nước đi và thế cờ (không kèm thông tin cá nhân) có thể được gửi tới nhà cung cấp mô hình AI.</p>
      </div>
      <div>
        <h2>4. Quyền của bạn</h2>
        <p>
          Bạn có thể yêu cầu truy cập, chỉnh sửa hoặc xoá dữ liệu bất kỳ lúc nào qua <a href={`mailto:${site.emails.support}`}>{site.emails.support}</a>.
        </p>
      </div>
    </LegalPage>
  );
}
