import type { Metadata } from "next";
import { Syne, Outfit } from "next/font/google";
import { CookieConsent } from "@/components/CookieConsent";
import "./globals.css";

const display = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
});

const body = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "İzden Siteler — Örnek site portalı",
  description:
    "Canlı demoları inceleyin, teklif alın. İzden Creative örnek site portalı.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${display.variable} ${body.variable} antialiased`}>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
