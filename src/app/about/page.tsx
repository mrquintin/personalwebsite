import type { Metadata } from "next";
import AboutBody from "@/components/about/AboutBody";
import AboutHero from "@/components/about/AboutHero";
import Beliefs from "@/components/about/Beliefs";
import ColophonBlock from "@/components/about/ColophonBlock";
import Cluster from "@/components/primitives/Cluster";
import Container from "@/components/primitives/Container";
import Link from "@/components/primitives/Link";
import Stack from "@/components/primitives/Stack";
import { JsonLd, profilePageSchema } from "@/components/seo/JsonLd";
import beliefs from "@/content/about/beliefs";
import biography from "@/content/about/biography";
import colophon from "@/content/about/colophon";
import identity from "@/content/about/identity";
import footerLinks from "@/content/site/footer";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.SITE_URL ??
  "https://personalwebsite-beta-nine.vercel.app";

const ABOUT_DESCRIPTION =
  "Background, working principles, and colophon for Michael Quintin — founder of Hivemind and author of Purposeless Efficiency.";

export const metadata: Metadata = {
  title: "About",
  description: ABOUT_DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: {
    type: "profile",
    url: "/about",
    title: `About — ${identity.name}`,
    description: ABOUT_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `About — ${identity.name}`,
    description: ABOUT_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

const EXTERNAL_LABELS = new Set(["email", "linkedin", "github"]);

const SAME_AS = footerLinks.external
  .filter((l) => /^https?:\/\//.test(l.href))
  .map((l) => l.href);

const PROFILE_LD = profilePageSchema({
  url: `${SITE_URL}/about`,
  personName: identity.fullName,
  jobTitle: identity.currentRole,
  description: identity.summary,
  sameAs: SAME_AS,
});

export default function AboutPage() {
  const externalLinks = identity.channels.filter((c) =>
    EXTERNAL_LABELS.has(c.label.toLowerCase()),
  );

  return (
    <Container as="section" size="wide" className="site-page">
      <JsonLd data={PROFILE_LD} />
      <Stack gap={7}>
        <AboutHero name={identity.name} roles={identity.roles} based={identity.based} />
        <AboutBody paragraphs={biography} />
        <Beliefs items={beliefs} />
        <ColophonBlock tech={colophon.tech} type={colophon.type} tagline={colophon.tagline} />
        <Cluster gap={4} className="site-link-list">
          {externalLinks.map((c) => (
            <Link key={c.href} href={c.href} variant="subtle" external>
              {c.label}
            </Link>
          ))}
        </Cluster>
      </Stack>
    </Container>
  );
}
