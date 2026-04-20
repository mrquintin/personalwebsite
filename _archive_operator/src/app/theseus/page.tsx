import type { Metadata } from "next";
import DossierHeader from "@/components/dossier/Header";
import ArtifactsBlock from "@/components/dossier/ArtifactsBlock";
import ThesisCard from "@/components/projects/theseus/ThesisCard";
import PrincipleGraph from "@/components/projects/theseus/PrincipleGraph";
import NoosphereConsole from "@/components/projects/theseus/NoosphereConsole";
import PrinciplesList from "@/components/projects/theseus/PrinciplesList";
import ExportPrinciples from "@/components/projects/theseus/ExportPrinciples";
import thesis from "@/content/projects/theseus/thesis";
import principles from "@/content/projects/theseus/principles";
import feed from "@/content/projects/theseus/noosphere-feed";
import Methodology from "@/content/projects/theseus/methodology.mdx";

export const metadata: Metadata = {
  title: "THS · Theseus",
  description: "A knowledge system for monitoring ideological contradiction.",
};

export default function TheseusPage() {
  return (
    <div className="dossier">
      <DossierHeader
        code="THS"
        title="THESEUS"
        tagline="A knowledge system for monitoring ideological contradiction."
        breadcrumb="~/projects/theseus/README"
        classification="public"
      />

      <section style={{ marginBottom: "var(--s-6)" }}>
        <ThesisCard claim={thesis.claim} method={thesis.method} role={thesis.role} />
      </section>

      <section id="principles-graph" style={{ marginBottom: "var(--s-7)" }}>
        <h2 style={{ fontFamily: "var(--font-mono)", color: "var(--fg-mute)", marginBottom: "var(--s-3)" }}>
          ── PRINCIPLE GRAPH ──
        </h2>
        <PrincipleGraph principles={principles} />
      </section>

      <section id="noosphere" style={{ marginBottom: "var(--s-7)" }}>
        <h2 style={{ fontFamily: "var(--font-mono)", color: "var(--fg-mute)", marginBottom: "var(--s-3)" }}>
          ── NOOSPHERE ──
        </h2>
        <NoosphereConsole feed={feed} viewing={3} />
      </section>

      <section id="principles" style={{ marginBottom: "var(--s-7)" }}>
        <h2 style={{ fontFamily: "var(--font-mono)", color: "var(--fg-mute)", marginBottom: "var(--s-3)" }}>
          ── FIRST PRINCIPLES ({principles.length}) ──
        </h2>
        <PrinciplesList principles={principles} />
        <ExportPrinciples principles={principles} />
      </section>

      <section id="methodology" style={{ marginBottom: "var(--s-7)" }}>
        <h2 style={{ fontFamily: "var(--font-mono)", color: "var(--fg-mute)", marginBottom: "var(--s-3)" }}>
          ── METHODOLOGY ──
        </h2>
        <div className="synopsis">
          <Methodology />
        </div>
      </section>

      <ArtifactsBlock items={[
        { kind: "live app",  label: "thesescodex.com", href: "https://thesescodex.com", glyph: "ext" },
        { kind: "paper",     label: "(pdf — pending)", href: "#",                       glyph: "ext" },
        { kind: "source",    label: "(github — pending)", href: "#",                    glyph: "ext" },
        { kind: "contact",   label: "michael@hivemind.ai", href: "mailto:michael@hivemind.ai", glyph: "mail" },
      ]} />
    </div>
  );
}
