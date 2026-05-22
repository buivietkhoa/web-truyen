import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "Mọt Chạm",
  description: "Website đọc truyện Mọt Chạm",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={cormorantGaramond.variable}>
      <body>{children}</body>
    </html>
  );
}
