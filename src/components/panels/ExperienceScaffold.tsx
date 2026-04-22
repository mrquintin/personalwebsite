"use client";
import { type ReactNode, useId, useRef, forwardRef, useImperativeHandle } from "react";
import ExperienceDossierToggle from "./ExperienceDossierToggle";
import { thresholdLabelFor, type ExperienceMode, type ProjectId } from "@/lib/experience-config";

export type ScaffoldHandle = { announce: (msg: string) => void };

type Props = {
  projectId: ProjectId;
  name: string;        // experience name (e.g., "Coherence Receiver")
  synopsis: string;    // one-line synopsis
  mode: ExperienceMode;
  hostWidthPx: number;
  view: "experience" | "dossier";
  onViewChange: (v: "experience" | "dossier") => void;
  experienceSlot: ReactNode; // body content for the EXPERIENCE view
  dossierSlot: ReactNode;    // body content for the DOSSIER view
  showFooter?: boolean;      // stretch: render the experience signature footer
};

const ExperienceScaffold = forwardRef<ScaffoldHandle, Props>(function ExperienceScaffold(
  { projectId, name, synopsis, mode, hostWidthPx, view, onViewChange, experienceSlot, dossierSlot, showFooter = true },
  ref,
) {
  const liveRef = useRef<HTMLDivElement | null>(null);
  const lastAnnounceRef = useRef<{ msg: string; t: number }>({ msg: "", t: 0 });
  const skipId = useId();

  useImperativeHandle(ref, () => ({
    announce(msg: string) {
      const now = Date.now();
      // Throttle: don't repeat the same message within 3s.
      if (msg === lastAnnounceRef.current.msg && now - lastAnnounceRef.current.t < 3000) return;
      lastAnnounceRef.current = { msg, t: now };
      if (liveRef.current) {
        // Clear and re-set so SR re-reads identical strings cleanly.
        liveRef.current.textContent = "";
        // small async to ensure SR picks up the change
        setTimeout(() => { if (liveRef.current) liveRef.current.textContent = msg; }, 30);
      }
    },
  }), []);

  const threshold = thresholdLabelFor(hostWidthPx);

  return (
    <section
      className="exp-scaffold"
      aria-label={`${name} — ${synopsis}`}
      data-mode={mode}
      data-view={view}
      data-threshold={threshold}
    >
      <a className="exp-skip" href={`#${skipId}`}>skip to interactive</a>

      <div className="exp-meta" role="presentation">
        <span className="exp-meta-name">{name}</span>
        <span aria-hidden="true">·</span>
        <span className="exp-meta-synopsis">{synopsis}</span>
        <ExperienceDossierToggle projectId={projectId} view={view} onChange={onViewChange} />
      </div>

      <div className="exp-body" id={skipId}>
        {view === "experience" ? experienceSlot : dossierSlot}
      </div>

      {showFooter && (
        <div className="exp-postroll">
          <span>experience :: <span style={{ color: "var(--fg)" }}>{name.toLowerCase()}</span></span>
          <span aria-hidden="true">·</span>
          <span>surface :: <span style={{ color: "var(--fg)" }}>{mode}</span></span>
          <span aria-hidden="true">·</span>
          <span>viewport :: <span style={{ color: "var(--fg)" }}>{threshold}</span></span>
        </div>
      )}

      {/* shared, single, polite live region for the experience */}
      <div ref={liveRef} role="status" aria-live="polite" className="sr-only" />
    </section>
  );
});

export default ExperienceScaffold;
