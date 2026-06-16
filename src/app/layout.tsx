import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { getSiteSetting } from "@/lib/site-settings";

const openSans = Open_Sans({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-open-sans",
});

export async function generateMetadata(): Promise<Metadata> {
  const setting = await getSiteSetting();
  return {
    title: setting.siteName,
    description: setting.siteDesc,
    icons: setting.logoUrl ? { icon: setting.logoUrl } : undefined,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const setting = await getSiteSetting();
  const siteStyle = { "--site-primary": setting.primaryColor } as CSSProperties;

  return (
    <html lang="vi" className={openSans.variable} style={siteStyle}>
      <body>{children}</body>
    </html>
  );
}
