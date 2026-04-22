"use client";
import { useEffect, useMemo, useRef } from "react";
import type { ExperienceContext } from "@/lib/experience-config";
import { useHvm } from "@/stores/hivemindExperience";
import {
  AUDIT_RUN, AUDIT_HEADER, AUDIT_SAMPLE_JSONL,
  FIDUCIARY_DISCLAIMER, EXPORT_PREVIEW_CAPTION, EXPORT_DISABLED_TOOLTIP,
  type AuditEventType,
} from "@/lib/hivemind/auditScript";

const ALL_TYPES: AuditEventType[] = ["proposal","critique","revision","cluster_formed","practicality_score","veto","pass","output"];

export default function AuditMode({ ctx, regime }: { ctx: ExperienceContext; regime: "narrow" | "standard" | "wide" }) {
  const selectedId = useHvm((s) => s.audit.selectedEventId);
  const filters = useHvm((s) => s.audit.filters);
  const contextOpen = useHvm((s) => s.audit.contextOpen);
  const exportOpen = useHvm((s) => s.audit.exportOpen);
  const select = useHvm((s) => s.selectAuditEvent);
  const setFilters = useHvm((s) => s.setAuditFilters);
  const toggleContext = useHvm((s) => s.toggleAuditContext);
  const toggleExport = useHvm((s) => s.toggleAuditExport);

  const events = useMemo(() => {
    return AUDIT_RUN.events.filter((e) => {
      if (filters.eventTypes.size > 0 && !filters.eventTypes.has(e.type)) return false;
      if (filters.round !== "all" && e.round !== filters.round) return false;
      if (filters.agentId !== "all" && e.speakerId !== filters.agentId) return false;
      if (filters.substring && !e.bodyText.toLowerCase().includes(filters.substring.toLowerCase())) return false;
      return true;
    });
  }, [filters]);

  const selected = AUDIT_RUN.events.find((e) => e.id === selectedId) ?? AUDIT_RUN.events[0];

  // J/K navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "j") {
        const i = events.findIndex((x) => x.id === selectedId);
        if (i >= 0 && i < events.length - 1) select(events[i + 1].id);
      } else if (e.key === "k") {
        const i = events.findIndex((x) => x.id === selectedId);
        if (i > 0) select(events[i - 1].id);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [events, selectedId, select]);

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: regime === "wide" ? "65% 35%" : "1fr",
      gap: 0, height: "100%", overflow: "hidden",
    }}>
      {/* TIMELINE */}
      <section style={{ borderRight: regime === "wide" ? "var(--border-hair)" : "none", overflow: "auto" }}>
        <header style={{ padding: "var(--s-3)", borderBottom: "var(--border-hair)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-mute)" }}>
            <span>{AUDIT_RUN.id}</span>
            <span>{AUDIT_RUN.clientTag}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-dim)", marginTop: 2 }}>
            <span>{AUDIT_RUN.startedAtIso}</span>
            <span>{AUDIT_RUN.totalEvents} events · {AUDIT_RUN.durationSec}s · {AUDIT_RUN.verdict}</span>
          </div>
        </header>

        <FilterBar filters={filters} onChange={(next) => { setFilters(next); ctx.announce(`Filter changed. ${events.length} events shown.`); }} />

        <ol style={{ display: "flex", flexDirection: "column" }}>
          {events.map((e) => {
            const active = e.id === selectedId;
            return (
              <li key={e.id}
                onClick={() => { select(e.id); ctx.announce(`Event ${e.id} selected.`); }}
                style={{
                  padding: "4px 8px", cursor: "pointer",
                  borderLeft: active ? "1px solid var(--accent)" : "1px solid transparent",
                  background: active ? "var(--bg-2)" : "transparent",
                  display: "grid",
                  gridTemplateColumns: "60px 50px 80px 90px 1fr",
                  gap: "8px", fontSize: "11px",
                }}>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--fg-dim)" }}>t+{e.tVirtualSec.toFixed(1)}s</span>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--fg-mute)" }}>{e.round}</span>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent-dim)", textTransform: "uppercase", fontSize: "9px", letterSpacing: "0.1em" }}>{e.type.replace("_", " ")}</span>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--fg-dim)" }}>{e.speakerId}</span>
                <span style={{ fontFamily: "var(--font-serif)", color: "var(--fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {e.bodyText.slice(0, 80)}{e.bodyText.length > 80 ? "…" : ""}
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      {/* RIGHT COLUMN */}
      <aside style={{ display: "flex", flexDirection: "column", overflow: "auto" }}>
        {selected && (
          <EventCard event={selected} contextOpen={contextOpen} onToggleContext={toggleContext} />
        )}

        <ExportPreview open={exportOpen} onToggle={toggleExport} />
      </aside>
    </div>
  );
}

type AuditFilters = ReturnType<typeof useHvm.getState>["audit"]["filters"];

function FilterBar({ filters, onChange }: { filters: AuditFilters; onChange: (next: AuditFilters) => void }) {
  return (
    <div style={{ padding: "var(--s-2) var(--s-3)", borderBottom: "var(--border-hair)", display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
      {ALL_TYPES.map((t) => {
        const on = filters.eventTypes.has(t);
        return (
          <button key={t} type="button"
            aria-pressed={on}
            onClick={() => {
              const next = new Set(filters.eventTypes);
              if (on) next.delete(t); else next.add(t);
              onChange({ ...filters, eventTypes: next });
            }}
            style={{
              padding: "2px 6px", fontFamily: "var(--font-mono)", fontSize: "9px",
              border: "var(--border-hair)",
              background: on ? "var(--bg-3)" : "transparent",
              color: on ? "var(--accent)" : "var(--fg-mute)",
              cursor: "pointer", letterSpacing: "0.08em",
            }}>{t.replace("_", " ")}</button>
        );
      })}
      <input value={filters.substring}
        onChange={(e) => onChange({ ...filters, substring: e.target.value })}
        placeholder="filter transcript by substring"
        style={{
          marginLeft: "auto", padding: "3px 6px",
          background: "var(--bg-0)", color: "var(--fg)",
          border: "var(--border-hair)", fontFamily: "var(--font-mono)", fontSize: "11px",
          minWidth: 180,
        }} />
    </div>
  );
}

function EventCard({ event, contextOpen, onToggleContext }: { event: typeof AUDIT_RUN.events[number]; contextOpen: boolean; onToggleContext: () => void }) {
  const ref = useRef<HTMLPreElement | null>(null);
  function copyId() {
    navigator.clipboard?.writeText(event.id).catch(() => {});
  }
  return (
    <article style={{ padding: "var(--s-3)", borderBottom: "var(--border-hair)" }}>
      <header>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-mute)", letterSpacing: "0.1em" }}>EVENT</div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: 4 }}>
          <code ref={ref} style={{ fontFamily: "var(--font-mono)", color: "var(--fg)" }}>{event.id}</code>
          <button type="button" onClick={copyId} aria-label="copy event id"
            style={{ background: "transparent", color: "var(--fg-mute)", cursor: "pointer", padding: 0, fontSize: "11px" }}>copy</button>
        </div>
      </header>
      <Field k="round">{event.round}</Field>
      <Field k="type">{event.type}</Field>
      <Field k="speakerId">{event.speakerId}</Field>
      {event.targetSpeakerId && <Field k="targetSpeakerId">{event.targetSpeakerId}</Field>}
      <Field k="tVirtualSec">{event.tVirtualSec.toFixed(2)}</Field>
      <Field k="tWallClockIso">{event.tWallClockIso}</Field>
      {event.parentEventId && <Field k="parentEventId">{event.parentEventId}</Field>}
      <Field k="payloadHash">{event.payloadHash}</Field>
      <div style={{ marginTop: "var(--s-3)" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-mute)", letterSpacing: "0.1em" }}>BODY</div>
        <p style={{ fontFamily: "var(--font-serif)", fontSize: "13px", color: "var(--fg)", marginTop: 4 }}>{event.bodyText}</p>
      </div>
      <details open={contextOpen} onToggle={onToggleContext} style={{ marginTop: "var(--s-3)" }}>
        <summary style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-mute)", cursor: "pointer", letterSpacing: "0.1em" }}>
          RETRIEVED CONTEXT ({event.retrievedContext.length})
        </summary>
        {event.retrievedContext.length === 0 ? (
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-mute)", marginTop: 4 }}>
            — Monitor events do not retrieve context.
          </p>
        ) : (
          <ul style={{ marginTop: 4 }}>
            {event.retrievedContext.map((c, i) => (
              <li key={i} style={{ marginBottom: 8 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--accent-dim)" }}>
                  [EXCERPT {i + 1}] {c.documentName} (p. {c.sourcePage})
                </div>
                <p style={{ fontFamily: "var(--font-serif)", fontSize: "12px", color: "var(--fg-dim)", marginTop: 2 }}>{c.textExcerpt}</p>
              </li>
            ))}
          </ul>
        )}
      </details>
    </article>
  );
}

function Field({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "8px", padding: "2px 0", fontFamily: "var(--font-mono)", fontSize: "11px" }}>
      <span style={{ color: "var(--fg-mute)" }}>{k}</span>
      <span style={{ color: "var(--fg)" }}>{children}</span>
    </div>
  );
}

function ExportPreview({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <details open={open} onToggle={onToggle} style={{ padding: "var(--s-3)" }}>
      <summary style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-mute)", cursor: "pointer", letterSpacing: "0.12em" }}>
        EXPORT PREVIEW · {FIDUCIARY_DISCLAIMER.split(".")[0]}.
      </summary>
      <div style={{ marginTop: "var(--s-3)" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg)" }}>
          <div>FORMAT:           {AUDIT_HEADER.format}</div>
          <div>SCHEMA VERSION:   {AUDIT_HEADER.schemaVersion}</div>
          <div>OWNERSHIP:        {AUDIT_HEADER.ownership}</div>
        </div>

        <p style={{ marginTop: "var(--s-3)", fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "12px", color: "var(--fg-dim)" }}>
          {FIDUCIARY_DISCLAIMER}
        </p>

        <pre style={{
          marginTop: "var(--s-3)", padding: "var(--s-2)",
          background: "var(--bg-0)", border: "var(--border-hair)",
          fontFamily: "var(--font-mono)", fontSize: "10px",
          color: "var(--fg-dim)", whiteSpace: "pre-wrap", maxHeight: 200, overflow: "auto",
        }}>{AUDIT_SAMPLE_JSONL.join("\n")}</pre>

        <p style={{ marginTop: "var(--s-2)", fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "11px", color: "var(--fg-dim)" }}>
          Sample excerpt: body text trimmed to fit. Production .jsonl files carry full utterances.
        </p>

        <p style={{ marginTop: "var(--s-3)", fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "12px", color: "var(--fg-dim)" }}>
          {EXPORT_PREVIEW_CAPTION}
        </p>

        <button type="button" disabled aria-disabled="true"
          title={EXPORT_DISABLED_TOOLTIP}
          style={{
            marginTop: "var(--s-3)", padding: "6px 12px",
            fontFamily: "var(--font-mono)", fontSize: "11px",
            border: "var(--border-hair)", background: "transparent",
            color: "var(--fg-mute)", cursor: "not-allowed", letterSpacing: "0.1em",
          }}>EXPORT (disabled)</button>
      </div>
    </details>
  );
}
