import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { ChatWidget } from "@/components/ChatWidget";

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
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
        <ChatWidget />
      </body>
    </html>
  );
}
