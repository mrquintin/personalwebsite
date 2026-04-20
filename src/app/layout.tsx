import type { Metadata } from "next";
import "./globals.css";
import Shell from "@/components/shell/Shell";

const VERSION = process.env.NEXT_PUBLIC_BUILD_VERSION ?? "0.3.1";

export const metadata: Metadata = {
  title: { default: "Michael Quintin", template: "%s — Michael Quintin" },
  description: "Operator. Writer. Founder of Hivemind.",
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
      </body>
    </html>
  );
}
