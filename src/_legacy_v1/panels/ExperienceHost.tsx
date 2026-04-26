"use client";
import {
  useEffect, useMemo, useRef, useState, useCallback, type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import ExperienceScaffold, { type ScaffoldHandle } from "./ExperienceScaffold";
import FixturePicker from "./FixturePicker";
import { STORAGE_KEY } from "./ExperienceDossierToggle";
import {
  EXPERIENCE_REGISTRY,
  type ExperienceContext,
  type ExperienceMode,
  type ProjectId,
} from "@/lib/experience-config";

type Props = {
  projectId: ProjectId;
  name: string;
  synopsis: string;
  mode: ExperienceMode;
  dossier: ReactNode;
  prefersDense?: boolean;
};

// `load` is resolved client-side from the registry to avoid passing a
// function across the server→client boundary.
export default function ExperienceHost({
  projectId, name, synopsis, mode, dossier, prefersDense = false,
}: Props) {
  const load = EXPERIENCE_REGISTRY[projectId]?.load;
  // Default view: EXPERIENCE if a loader exists, otherwise DOSSIER.
  // sessionStorage overrides on subsequent visits within the session.
  const initialView: "experience" | "dossier" = load ? "experience" : "dossier";
  const [view, setView] = useState<"experience" | "dossier">(initialView);

  // Hydrate the toggle from sessionStorage once on mount.
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY(projectId));
      if (stored === "experience" || stored === "dossier") {
        // If no loader, force dossier regardless of stored value.
        setView(load ? stored : "dossier");
      }
    } catch { /* sessionStorage unavailable */ }
  }, [projectId, load]);

  const onViewChange = useCallback((v: "experience" | "dossier") => {
    setView(v);
    try { sessionStorage.setItem(STORAGE_KEY(projectId), v); } catch {}
  }, [projectId]);

  // ResizeObserver-driven host width
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hostWidthPx, setHostWidthPx] = useState<number>(0);
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    setHostWidthPx(el.getBoundingClientRect().width);
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setHostWidthPx(e.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // prefers-reduced-motion
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // Scaffold handle exposes the announce() function we forward into the
  // experience context.
  const scaffoldRef = useRef<ScaffoldHandle | null>(null);
  const announce = useCallback((msg: string) => {
    scaffoldRef.current?.announce(msg);
  }, []);

  const ctx: ExperienceContext = useMemo(() => ({
    mode, hostWidthPx, reducedMotion, announce, prefersDense,
  }), [mode, hostWidthPx, reducedMotion, announce, prefersDense]);

  // Lazy-load the experience component only when the EXPERIENCE view is
  // selected at least once. Keep the dynamic component memoized.
  const ExperienceComponent = useMemo(() => {
    if (!load) return null;
    return dynamic(load, {
      ssr: false,
      loading: () => (
        <div className="exp-loading">
          initialising · {name.toLowerCase().replace(/\s+/g, "-")}
          <span className="cursor-blink"> _</span>
        </div>
      ),
    });
  }, [load, name]);

  const experienceSlot = ExperienceComponent
    ? (hostWidthPx > 0
        ? <ExperienceComponent ctx={ctx} />
        : <div className="exp-loading">measuring host…</div>)
    : (
      <div className="exp-loading">
        experience surface in progress — see <button
          type="button"
          onClick={() => onViewChange("dossier")}
          style={{ color: "var(--accent)", background: "transparent", padding: 0, cursor: "pointer", textDecoration: "underline" }}
        >dossier</button> for now.
      </div>
    );

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", display: "flex" }}>
      <ExperienceScaffold
        ref={scaffoldRef}
        projectId={projectId}
        name={name}
        synopsis={synopsis}
        mode={mode}
        hostWidthPx={hostWidthPx}
        view={view}
        onViewChange={onViewChange}
        experienceSlot={experienceSlot}
        dossierSlot={dossier}
      />
      <FixturePicker />
    </div>
  );
}
