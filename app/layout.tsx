import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const DESCRIPTION =
  "Hivemind is a multi-agent AI that replaces consulting engagements with peer-reviewed, auditable strategic analysis.";

export const metadata: Metadata = {
  metadataBase: new URL("https://nashlab.ai"),
  title: { default: "The Nash Lab — Hivemind", template: "%s | The Nash Lab" },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "The Nash Lab",
    title: "The Nash Lab — Hivemind",
    description: DESCRIPTION,
    url: "/",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "The Nash Lab" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Nash Lab — Hivemind",
    description: DESCRIPTION,
    images: ["/api/og"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ink-900 text-paper noise">
        <Nav />
        <main className="relative z-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
