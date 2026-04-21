import type { Metadata } from "next";
import DossierHeader from "@/components/dossier/Header";
import IdentityBlock from "@/components/about/IdentityBlock";
import BeliefsList from "@/components/about/BeliefsList";
import WorkLedger from "@/components/about/WorkLedger";
import Colophon from "@/components/about/Colophon";
import identity from "@/content/about/identity";
import Biography from "@/content/about/biography.mdx";
import beliefs from "@/content/about/beliefs";
import colophon from "@/content/about/colophon";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "About",
  description: "Operator. Writer. Founder of Hivemind.",
};

export default function AboutPage() {
  return (
    <div className="dossier">
      <DossierHeader
        title="MICHAEL QUINTIN"
        tagline="Operator · writer · founder."
        breadcrumb="~/about/README"
        classification="public"
      />

      <section style={{ marginBottom: "var(--s-7)" }}>
        <IdentityBlock {...identity} />
      </section>

      <section style={{ marginBottom: "var(--s-7)" }}>
        <h2 style={{ fontFamily: "var(--font-mono)", color: "var(--fg-mute)", marginBottom: "var(--s-3)" }}>── BIOGRAPHY ──</h2>
        <div className="synopsis">
          <Biography />
        </div>
      </section>

      <section style={{ marginBottom: "var(--s-7)" }}>
        <h2 style={{ fontFamily: "var(--font-mono)", color: "var(--fg-mute)", marginBottom: "var(--s-3)" }}>── BELIEFS · WORKING STYLE ──</h2>
        <BeliefsList items={beliefs} />
      </section>

      <section style={{ marginBottom: "var(--s-7)" }}>
        <h2 style={{ fontFamily: "var(--font-mono)", color: "var(--fg-mute)", marginBottom: "var(--s-3)" }}>── WORK LEDGER ──</h2>
        <WorkLedger />
      </section>

      <section style={{ marginBottom: "var(--s-7)" }}>
        <h2 style={{ fontFamily: "var(--font-mono)", color: "var(--fg-mute)", marginBottom: "var(--s-3)" }}>── WRITING ──</h2>
        <div style={{ fontFamily: "var(--font-mono)", color: "var(--fg-dim)" }}>writing ........................ coming soon</div>
      </section>

      <section style={{ marginBottom: "var(--s-7)" }}>
        <p style={{ fontFamily: "var(--font-mono)", color: "var(--fg-dim)" }}>
          Direct: <a href="mailto:michael@hivemind.ai" style={{ color: "var(--fg-hi)" }}>michael@hivemind.ai</a>
          {" · LinkedIn: "}
          <a href="https://www.linkedin.com/in/michael-quintin-5555b4283/" style={{ color: "var(--fg)" }}>
            /in/michael-quintin-5555b4283
          </a>
          {" · X: "}
          <a href="https://x.com/quintinpublic" style={{ color: "var(--fg)" }}>
            @quintinpublic
          </a>
          {" · GitHub: "}
          <a href="https://github.com/mrquintin" style={{ color: "var(--fg)" }}>/mrquintin</a>
        </p>
      </section>

      <Colophon {...colophon} buildVersion={process.env.NEXT_PUBLIC_BUILD_VERSION ?? "0.3.1"} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Person",
        name: identity.name,
        jobTitle: identity.roles.join(", "),
        url: "https://personalwebsite-beta-nine.vercel.app/about",
        sameAs: identity.channels.filter(c => c.href.startsWith("http")).map(c => c.href),
      }} />
    </div>
  );
}
