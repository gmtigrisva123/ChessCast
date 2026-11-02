# Triển khai ChessCast: Supabase + Cloudflare

Code đã sẵn sàng. Dưới đây là phần **bạn phải tự làm trên tài khoản của bạn** (đăng ký, lấy key, chạy lệnh). Làm theo đúng thứ tự.

## 1. Supabase (đăng nhập + database)

1. Vào https://supabase.com/dashboard → **New project** → Region **Southeast Asia (Singapore)**. Lưu mật khẩu database.
2. **SQL Editor → New query** → dán toàn bộ nội dung file `supabase/migrations/0001_wallets_orders.sql` → **Run**. Sau đó làm tương tự với `supabase/migrations/0002_spend_coins.sql`.
3. **Authentication → URL Configuration**
   - Site URL: domain thật (vd. `https://chesscast.io`)
   - Redirect URLs: `http://localhost:3000/**`, `http://localhost:8787/**`, `https://*.workers.dev/**`, `https://chesscast.io/**`
4. **Project Settings → API Keys**: chép *Project URL*, *Publishable key*, *Secret key*.
5. Tạo file `.env.local` ở thư mục gốc repo:

```
NEXT_PUBLIC_SITE_URL=https://chesscast.io
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

> `SUPABASE_SECRET_KEY` **không** để trong `.env.local` khi deploy — nó được nạp bằng `wrangler secret` ở bước 2. (Chạy `npm run dev` ở máy thì có thể thêm vào `.env.local` để test.)

## 2. Cloudflare (hosting)

```bash
npm install
```
```bash
npx wrangler login
```
Nạp secret (mỗi lệnh sẽ hỏi giá trị; bỏ qua cái nào bạn chưa dùng):
```bash
npx wrangler secret put SUPABASE_SECRET_KEY
```
```bash
npx wrangler secret put STRIPE_SECRET_KEY
```
```bash
npx wrangler secret put STRIPE_WEBHOOK_SECRET
```
```bash
npx wrangler secret put ANTHROPIC_API_KEY
```
```bash
npx wrangler secret put RESEND_API_KEY
```
Chạy thử trên runtime Workers ở máy, rồi deploy:
```bash
npm run preview
```
```bash
npm run deploy
```
Site chạy tại `https://chesscast.<tài-khoản>.workers.dev`.

**Gắn domain:** Cloudflare Dashboard → **Workers & Pages → chesscast → Settings → Domains & Routes → Add → Custom domain**. Domain phải đang dùng nameserver của Cloudflare.

**Tự deploy khi push (tuỳ chọn):** Workers & Pages → chesscast → Settings → **Builds** → kết nối GitHub repo. Nhập 3 biến `NEXT_PUBLIC_*` ở mục *Build variables*.

## 3. Stripe webhook

Stripe Dashboard → Developers → Webhooks → **Add endpoint**
- URL: `https://chesscast.io/api/stripe/webhook`
- Events: `checkout.session.completed`, `customer.subscription.deleted`
- Chép *Signing secret* → `npx wrangler secret put STRIPE_WEBHOOK_SECRET`

## Hoạt động thế nào

- Chưa cấu hình Supabase → site chạy y như cũ (ví lưu trong trình duyệt).
- Có Supabase → ví hiện nút **Sign in** (magic link qua email). Người đã đăng nhập mua coin thì webhook Stripe cộng coin vào bảng `wallets` (mỗi session chỉ cộng một lần), và ví trên web đồng bộ từ server.
- Coin **tiêu** (Chaos Card, tip) được trừ ở server qua `POST /api/wallet/spend`. Giá do server tính từ bảng giá và gói của người dùng, không tin số liệu từ trình duyệt; không đủ coin thì server từ chối (402) và số dư hiển thị được sửa lại theo server.
- Thưởng bỏ phiếu Chess Court (+5) qua `POST /api/wallet/court-vote`, mỗi vụ chỉ thưởng một lần.
- Mọi biến động coin (ngoài mua Stripe) được ghi vào bảng `coin_ledger`.
