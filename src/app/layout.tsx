import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/mona-sans/standard.css";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "@fontsource-variable/geist-mono";
import "./globals.css";
import { Providers } from "@/components/layout/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "ChessCast — Every game deserves a stage",
    template: "%s · ChessCast",
  },
  description: site.description,
  keywords: ["chess", "live chess", "AI commentary", "Chaos Cards", "Chess Royale", "Chess Court", "chess streaming", "entertainment"],
  openGraph: {
    title: "ChessCast — Every game deserves a stage",
    description: site.description,
    url: site.url,
    siteName: "ChessCast",
    locale: "en_US",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "ChessCast", description: site.description },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#04040a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh text-fg antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-full focus:bg-fg focus:px-4 focus:py-2 focus:text-void">
          Skip to content
        </a>
        <Providers>
          <Navbar />
          <main id="main" className="relative">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
