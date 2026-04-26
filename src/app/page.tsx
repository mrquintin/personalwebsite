import type { Metadata } from "next";
import Bio from "@/components/landing/Bio";
import ChatPreview from "@/components/landing/ChatPreview";
import Hero from "@/components/landing/Hero";
import ProjectTeasers from "@/components/landing/ProjectTeasers";
import Container from "@/components/primitives/Container";
import Link from "@/components/primitives/Link";
import identity from "@/content/about/identity";

const HOME_DESCRIPTION =
  "Michael Quintin is the founder of Hivemind and author of Purposeless Efficiency. Tools and writing for clear thinking under uncertainty.";

export const metadata: Metadata = {
  title: "Home",
  description: HOME_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: `Home — ${identity.name}`,
    description: HOME_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `Home — ${identity.name}`,
    description: HOME_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

function ResumeCta() {
  return (
    <Container as="section" size="base" style={{ paddingTop: "var(--s-5)", paddingBottom: "var(--s-7)" }}>
      <p className="t-prose">
        <Link href="/resume" variant="underline">
          Download my resume
        </Link>
      </p>
    </Container>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <Bio />
      <ProjectTeasers />
      <ChatPreview />
      <ResumeCta />
    </>
  );
}
