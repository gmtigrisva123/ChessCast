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

## Ghi chú vận hành

### Secret không được lọt vào bundle

`@opennextjs/cloudflare` sinh `.open-next/cloudflare/next-env.mjs` chứa **cả** map
`production` lẫn `development`. Next chỉ đọc map `production` khi chạy thật, nhưng
mọi giá trị trong `.env.development.local` vẫn bị nhúng nguyên văn vào `worker.js`
upload lên Cloudflare.

Vì vậy `npm run preview` / `npm run deploy` đi qua `scripts/cf-build.mjs`: nó tạm
ẩn `.env.development.local` trong lúc build rồi trả lại (kể cả khi build lỗi).
Quy ước đặt biến:

| File | Nạp khi nào | Chứa gì |
| --- | --- | --- |
| `.env.local` | dev + build production | chỉ `NEXT_PUBLIC_*` không nhạy cảm |
| `.env.development.local` | chỉ `npm run dev` | secret dùng cho máy local |
| `.env.production.local` | chỉ build production | `NEXT_PUBLIC_SITE_URL` thật |

Secret khi chạy production **chỉ** đến từ `npx wrangler secret put`.
Kiểm tra lại bất cứ lúc nào:

```bash
npx wrangler deploy --dry-run --outdir /tmp/cf-audit && grep -rl 'sb_secret_\|sk_live_\|sk_test_' /tmp/cf-audit
```

### Giữ Three.js ra khỏi bundle server

Mọi scene WebGL đều nạp bằng `dynamic(() => import(...), { ssr: false })`. Cạm bẫy:
nếu cùng file đó **cũng** được import tĩnh để lấy một giá trị nhỏ, import tĩnh sẽ
thắng — Next kéo cả module cùng toàn bộ đồ thị Three.js vào bundle server và
evaluate lúc SSR, khiến `ssr: false` mất tác dụng. Hậu quả đo được: `handler.mjs`
phình lên 6.4 MB và Worker trả `503 / error code 1102` ở khoảng 10% request.

Vì vậy các object cầu nối (`heroSignal`, `storySignal`, `warpSignal`,
`morphSignal`) nằm ở `src/components/scene-signals.ts` — module không phụ thuộc gì.
**Đừng export giá trị dùng ở phía server từ một module có import Three.js.**

Kiểm tra sau mỗi lần thêm scene mới:

```bash
grep -rl 'WebGLRenderer\|BufferGeometry\|EffectComposer' .open-next/server-functions/
```

Không ra kết quả nào là đạt.

### Deploy trên macOS < 13.5

`opennextjs-cloudflare deploy` khởi tạo Miniflare, mà `workerd` yêu cầu macOS 13.5+
(trên macOS 12 nó chết vì thiếu symbol `libc++`). Dự án này dùng
`defineCloudflareConfig()` trống — không có incremental cache KV/R2 — nên bước
cache-population của OpenNext không có việc gì làm, và deploy thẳng bằng wrangler
là tương đương:

```bash
npm run build && npx opennextjs-cloudflare build && OPEN_NEXT_DEPLOY=1 npx wrangler deploy
```

Biến `OPEN_NEXT_DEPLOY` khiến wrangler bỏ qua việc tự uỷ quyền ngược lại cho
`opennextjs-cloudflare deploy`.
