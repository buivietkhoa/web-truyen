import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import NavigationProgress from "@/components/layout/NavigationProgress";
import PageVisitTracker from "@/components/layout/PageVisitTracker";
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
    verification: {
      google: "LPbrMBMwjsYqs2SKs3H85MhIRwwFgYZQAVQ0pLt5MpI",
    },
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
      <body suppressHydrationWarning>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(t===null&&d)){document.documentElement.setAttribute('data-theme','dark');}}catch(e){}})();`,
          }}
        />
        <NavigationProgress />
        <PageVisitTracker />
        {children}
      </body>
    </html>
  );
}
