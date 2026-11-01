import type { Metadata, Viewport } from "next";
import "@fontsource-variable/oswald";
import "@fontsource-variable/rubik";
import "./globals.css";
import { Providers } from "@/components/layout/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "ChessCast — Cờ vua thành show giải trí sống",
    template: "%s · ChessCast",
  },
  description: site.description,
  keywords: ["cờ vua", "chess", "livestream", "AI bình luận", "Chaos Cards", "Chess Royale", "Chess Court", "giải trí"],
  openGraph: {
    title: "ChessCast — Không chỉ xem. Can thiệp.",
    description: site.description,
    url: site.url,
    siteName: "ChessCast",
    locale: "vi_VN",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "ChessCast", description: site.description },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#121317",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="min-h-dvh bg-ink text-cream antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-full focus:bg-lime focus:px-4 focus:py-2 focus:text-ink">
          Bỏ qua tới nội dung
        </a>
        <Providers>
          <Navbar />
          <main id="main">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
