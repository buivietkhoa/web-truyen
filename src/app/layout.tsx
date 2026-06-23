import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { absoluteUrl, defaultSiteDescription, defaultSiteName, getSiteUrl } from "@/lib/seo";
import { getSiteSetting } from "@/lib/site-settings";

const openSans = Open_Sans({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-open-sans",
});

export async function generateMetadata(): Promise<Metadata> {
  const setting = await getSiteSetting();
  const siteName = setting.siteName || defaultSiteName;
  const description = setting.siteDesc || defaultSiteDescription;

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description,
    alternates: {
      canonical: absoluteUrl("/"),
    },
    icons: setting.logoUrl ? { icon: setting.logoUrl } : undefined,
    openGraph: {
      type: "website",
      locale: "vi_VN",
      siteName,
      title: siteName,
      description,
      url: absoluteUrl("/"),
      images: setting.logoUrl ? [{ url: setting.logoUrl, alt: siteName }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description,
      images: setting.logoUrl ? [setting.logoUrl] : undefined,
    },
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
    <html lang="vi" className={openSans.variable} style={siteStyle} suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
