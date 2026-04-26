import DossierHeader from "@/components/dossier/Header";
import MetadataPane from "@/components/dossier/MetadataPane";
import ArtifactsBlock from "@/components/dossier/ArtifactsBlock";
import ThesisBlock from "./ThesisBlock";
import DemoReceiver from "./DemoReceiver";
import CapabilityGrid from "./CapabilityGrid";
import WorkflowStrip from "./WorkflowStrip";
import project from "@/content/projects/hivemind";
import thesis from "@/content/projects/hivemind/thesis";
import demo from "@/content/projects/hivemind/demo";
import capabilities from "@/content/projects/hivemind/capabilities";
import workflow from "@/content/projects/hivemind/workflow";
import press from "@/content/projects/hivemind/press";

// Body of the Hivemind dossier — consumed by both /hivemind (mode=route)
// and the landing accordion's HVM panel (mode=panel) via ExperienceHost.
export default function HivemindDossier() {
  return (
    <div className="dossier" style={{ padding: "var(--s-5)" }}>
      <DossierHeader
        title="HIVEMIND"
        tagline={project.tagline}
        breadcrumb="~/projects/hivemind/README"
        classification="public"
      />
      <section id="overview" className="dossier-grid" style={{ marginBottom: "var(--s-7)" }}>
        <MetadataPane project={project} />
        <ThesisBlock thesis={thesis.thesis} mechanism={thesis.mechanism} moat={thesis.moat} />
      </section>
      <section id="demo" style={{ marginBottom: "var(--s-7)" }}>
        <DemoReceiver source={demo} />
      </section>
      <section id="capabilities" style={{ marginBottom: "var(--s-7)" }}>
        <h2 style={{ fontFamily: "var(--font-mono)", color: "var(--fg-mute)", marginBottom: "var(--s-3)" }}>
          ── CAPABILITIES ──
        </h2>
        <CapabilityGrid items={capabilities} />
      </section>
      <section id="workflow" style={{ marginBottom: "var(--s-7)" }}>
        <h2 style={{ fontFamily: "var(--font-mono)", color: "var(--fg-mute)", marginBottom: "var(--s-3)" }}>
          ── WORKFLOW ──
        </h2>
        <WorkflowStrip steps={workflow} />
      </section>
      <section id="press">
        <ArtifactsBlock items={press} />
      </section>
      <footer style={{ marginTop: "var(--s-7)", fontFamily: "var(--font-mono)", color: "var(--fg-dim)", fontSize: "var(--t-base-size)" }}>
        Interested operators, investors, and design partners:{" "}
        <a href="mailto:michael@hivemind.ai?subject=HIVEMIND" style={{ color: "var(--fg-hi)" }}>
          michael@hivemind.ai
        </a>{" "}— subject: HIVEMIND / {`{YOUR CONTEXT}`}
      </footer>
    </div>
  );
}
