import type { Metadata } from "next";
import DossierHeader from "@/components/dossier/Header";
import IdentityHeader from "@/components/resume/IdentityHeader";
import ExperienceList from "@/components/resume/ExperienceList";
import SkillsTable from "@/components/resume/SkillsTable";
import DownloadActions from "@/components/resume/DownloadActions";
import ArtifactsBlock from "@/components/dossier/ArtifactsBlock";
import WorkLedger from "@/components/about/WorkLedger";
import identity from "@/content/resume/identity";
import summary from "@/content/resume/summary";
import experience from "@/content/resume/experience";
import education from "@/content/resume/education";
import writing from "@/content/resume/writing";
import skills from "@/content/resume/skills";
import { COPY } from "@/content/microcopy";

export const metadata: Metadata = {
  title: "CV · Michael Quintin",
  description: "Curriculum vitae of Michael Quintin.",
};

export default function ResumePage() {
  const updated = "2026-04-12"; // TODO(michael): wire to PDF mtime when scripts/stamp-resume runs
  return (
    <div className="dossier">
      <DossierHeader
        code="CV"
        title="MICHAEL QUINTIN"
        tagline={`Curriculum vitae · last updated ${updated}`}
        breadcrumb="~/resume/CV.pdf"
        classification="public"
        rightAction={<DownloadActions />}
      />

      <IdentityHeader {...identity} />

      <section style={{ marginBottom: "var(--s-6)" }}>
        <p className="synopsis">{summary}</p>
      </section>

      <section style={{ marginBottom: "var(--s-7)" }}>
        <h2 style={{ fontFamily: "var(--font-mono)", color: "var(--fg-mute)", marginBottom: "var(--s-3)" }}>── EXPERIENCE ──</h2>
        <ExperienceList items={experience} />
      </section>

      <section style={{ marginBottom: "var(--s-7)" }}>
        <h2 style={{ fontFamily: "var(--font-mono)", color: "var(--fg-mute)", marginBottom: "var(--s-3)" }}>── PROJECTS ──</h2>
        <WorkLedger />
      </section>

      <section style={{ marginBottom: "var(--s-7)" }}>
        <h2 style={{ fontFamily: "var(--font-mono)", color: "var(--fg-mute)", marginBottom: "var(--s-3)" }}>── EDUCATION ──</h2>
        <ExperienceList items={education} />
      </section>

      {writing.length > 0 && (
        <section style={{ marginBottom: "var(--s-7)" }}>
          <h2 style={{ fontFamily: "var(--font-mono)", color: "var(--fg-mute)", marginBottom: "var(--s-3)" }}>── WRITING ──</h2>
          <ul style={{ fontFamily: "var(--font-mono)", fontSize: "var(--t-sm-size)" }}>
            {writing.map((w, i) => (
              <li key={i}>{w.date} · {w.title} <span style={{ color: "var(--fg-mute)" }}>· {w.venue}</span></li>
            ))}
          </ul>
        </section>
      )}

      <section style={{ marginBottom: "var(--s-7)" }}>
        <h2 style={{ fontFamily: "var(--font-mono)", color: "var(--fg-mute)", marginBottom: "var(--s-3)" }}>── SKILLS ──</h2>
        <SkillsTable groups={skills} />
      </section>

      <section style={{ marginBottom: "var(--s-7)" }}>
        <h2 style={{ fontFamily: "var(--font-mono)", color: "var(--fg-mute)", marginBottom: "var(--s-3)" }}>── REFERENCES ──</h2>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--t-sm-size)" }}>{COPY.resume.references}</p>
      </section>

      <ArtifactsBlock items={[
        { kind: "resume", label: "/resume.pdf", href: "/resume.pdf" },
      ]} />
    </div>
  );
}
