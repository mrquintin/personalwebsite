import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/shell/SiteHeader";
import SiteFooter from "@/components/shell/SiteFooter";
import ThemeInit from "@/components/shell/ThemeInit";
import MobileDrawer from "@/components/shell/MobileDrawer";
import { NavToggleProvider } from "@/components/shell/useNavToggle";
import { JsonLd, personSchema, websiteSchema } from "@/components/seo/JsonLd";
import identity from "@/content/about/identity";
import footerLinks from "@/content/site/footer";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.SITE_URL ??
  "https://personalwebsite-beta-nine.vercel.app";

const SITE_DESCRIPTION =
  "Michael Quintin — founder of Hivemind and author of Purposeless Efficiency. Tools and writing for clear thinking under uncertainty.";

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

const fontSerif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: identity.name, template: `%s — ${identity.name}` },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: identity.name,
    url: SITE_URL,
    title: identity.name,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: identity.name,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

const SAME_AS = footerLinks.external
  .filter((l) => /^https?:\/\//.test(l.href))
  .map((l) => l.href);

const SITE_LD = websiteSchema({
  url: SITE_URL,
  name: identity.name,
  description: SITE_DESCRIPTION,
});

const PERSON_LD = personSchema({
  name: identity.fullName,
  jobTitle: identity.currentRole,
  url: SITE_URL,
  sameAs: SAME_AS,
  description: identity.summary,
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${fontMono.variable} ${fontSerif.variable}`}>
      <head>
        <ThemeInit />
        <JsonLd data={SITE_LD} />
        <JsonLd data={PERSON_LD} />
      </head>
      <body>
        <NavToggleProvider>
          <SiteHeader />
          <MobileDrawer />
          <main id="main">{children}</main>
          <SiteFooter />
        </NavToggleProvider>
      </body>
    </html>
  );
}
