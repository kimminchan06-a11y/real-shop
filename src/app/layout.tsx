import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crypto Commerce | USDT Direct Pay",
  description:
    "실시간 참고 환율과 명확한 결제 안내를 제공하는 Crypto Commerce 쇼핑몰 UI 테스트 페이지입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
