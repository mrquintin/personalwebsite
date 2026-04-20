import type { Metadata } from "next";
import "./globals.css";
import Shell from "@/components/shell/Shell";
import { JsonLd } from "@/components/seo/JsonLd";

const VERSION = process.env.NEXT_PUBLIC_BUILD_VERSION ?? "0.3.1";
const SITE_URL = process.env.SITE_URL ?? "https://personalwebsite-beta-nine.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Michael Quintin", template: "%s — Michael Quintin" },
  description: "Operator. Writer. Founder of Hivemind.",
  openGraph: {
    type: "website",
    siteName: "Michael Quintin",
    url: SITE_URL,
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script
          // restore stored theme before paint
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t){document.documentElement.setAttribute('data-theme',t);}}catch(e){}`,
          }}
        />
      </head>
      <body>
        <Shell buildVersion={VERSION}>{children}</Shell>
        <JsonLd data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Michael Quintin",
          url: SITE_URL,
        }} />
      </body>
    </html>
  );
}
