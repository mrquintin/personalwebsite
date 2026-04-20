import type { Metadata } from "next";
import DossierHeader from "@/components/dossier/Header";
import MetadataPane from "@/components/dossier/MetadataPane";
import TitleBlock from "@/components/projects/book/TitleBlock";
import ProgressLine from "@/components/projects/book/ProgressLine";
import Pillars from "@/components/projects/book/Pillars";
import Excerpt from "@/components/projects/book/Excerpt";
import Arc from "@/components/projects/book/Arc";
import NotifyRow from "@/components/projects/book/NotifyRow";
import project from "@/content/projects/purposeless-efficiency";
import progress from "@/content/projects/purposeless-efficiency/progress";
import pillars from "@/content/projects/purposeless-efficiency/pillars";
import arc from "@/content/projects/purposeless-efficiency/arc";
import Preface from "@/content/projects/purposeless-efficiency/preface.mdx";

export const metadata: Metadata = {
  title: "PRP · Purposeless Efficiency",
  description: "Book I — corporatism, gamification, incumbency, complacency, economic revolution.",
};

export default function PurposelessPage() {
  return (
    <div className="dossier pe-book">
      <DossierHeader
        code="PRP"
        title="PURPOSELESS EFFICIENCY"
        tagline="Book I of the series · manuscript in progress"
        breadcrumb="~/projects/purposeless-efficiency/manuscript"
        classification="public"
      />

      <section id="cover" className="dossier-grid" style={{ marginBottom: "var(--s-6)" }}>
        <div>
          <TitleBlock
            title="Purposeless Efficiency"
            author="MICHAEL QUINTIN"
            subtitle="Book I · on corporatism, gamification, incumbency, complacency, and economic revolution"
          />
        </div>
        <div className="metadata-pane">
          <Row k="SERIES"  v="Five volumes" />
          <Row k="VOLUME"  v="I of V" />
          <Row k="STATUS"  v={`Manuscript · MS v${progress.msVersion} · ${progress.words.toLocaleString()} / ${progress.target.toLocaleString()} words`} />
          <Row k="UPDATED" v={project.updatedISO} />
          <Row k="FORMATS" v="digital · print (planned)" />
          <Row k="RIGHTS"  v="All rights reserved" />
          <Row k="ORDER"   v="(not yet available — join the list)" />
        </div>
      </section>

      <section id="progress">
        <ProgressLine words={progress.words} target={progress.target} msVersion={progress.msVersion} />
      </section>

      <section id="synopsis" style={{ margin: "var(--s-7) 0" }}>
        <h2 className="pe-title-mono" style={{ color: "var(--fg-mute)" }}>── PREFACE ──</h2>
        <article className="pe-prose" style={{ marginTop: "var(--s-4)" }}>
          <Preface />
        </article>
      </section>

      <section id="pillars" style={{ marginBottom: "var(--s-7)" }}>
        <h2 className="pe-title-mono" style={{ color: "var(--fg-mute)" }}>── THE FIVE PILLARS ──</h2>
        <div style={{ marginTop: "var(--s-4)" }}>
          <Pillars items={pillars} />
        </div>
      </section>

      <section id="excerpt" style={{ marginBottom: "var(--s-7)" }}>
        <h2 className="pe-title-mono" style={{ color: "var(--fg-mute)" }}>── EXCERPT ──</h2>
        <div style={{ marginTop: "var(--s-4)" }}>
          <Excerpt paragraphs={undefined} />
        </div>
      </section>

      <section id="arc" style={{ marginBottom: "var(--s-7)" }}>
        <h2 className="pe-title-mono" style={{ color: "var(--fg-mute)" }}>── THE FIVE-BOOK ARC ──</h2>
        <div style={{ marginTop: "var(--s-4)" }}>
          <Arc items={arc} />
        </div>
      </section>

      <section id="notify" style={{ marginBottom: "var(--s-7)" }}>
        <NotifyRow email="michael@hivemind.ai" />
      </section>

      <section id="citation" style={{ marginBottom: "var(--s-7)" }}>
        <h2 className="pe-title-mono" style={{ color: "var(--fg-mute)" }}>── CITATION ──</h2>
        <pre style={{ fontFamily: "var(--font-mono)", color: "var(--fg)", whiteSpace: "pre-wrap", marginTop: "var(--s-3)" }}>
{`Quintin, M. (forthcoming). Purposeless Efficiency.
Book I of a five-volume series.`}
        </pre>
        <pre style={{ fontFamily: "var(--font-mono)", color: "var(--fg-dim)", whiteSpace: "pre-wrap", marginTop: "var(--s-3)" }}>
{`@book{quintin_pe,
  author = {Quintin, Michael},
  title  = {Purposeless Efficiency},
  year   = {forthcoming},
}`}
        </pre>
      </section>

      <span className="pe-folio" style={{ display: "none" }}>
        I · Purposeless Efficiency · Michael Quintin
      </span>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="row">
      <span className="k">{k}</span>
      <span className="v">{v}</span>
    </div>
  );
}
