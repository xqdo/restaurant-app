import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "مطعم الذواقة - لوحة التحكم",
  description: "نظام إدارة المطعم المتكامل",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" suppressHydrationWarning>
      <body
        className={`${cairo.variable} antialiased`}
        dir="rtl"
        style={{ direction: 'rtl' }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
