import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { ConditionalChatWidget } from "@/components/ConditionalChatWidget";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ипотека Мурабаха — исламское финансирование жилья",
  description:
    "Приобретение жилья по нормам шариата: прозрачная отсроченная цена и сопровождение банка.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${inter.className} min-h-screen antialiased`}>
        <Providers>{children}</Providers>
        <ConditionalChatWidget />
        <SpeedInsights />
      </body>
    </html>
  );
}
