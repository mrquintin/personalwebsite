"use client";
import { useState } from "react";
import clsx from "clsx";

export type Field = {
  name: string;
  label: string;
  type: "text" | "email" | "textarea" | "select";
  required?: boolean;
  placeholder?: string;
  options?: string[];
  span?: 1 | 2;
};

type Props = {
  source: "demo" | "investor" | "waitlist";
  fields: Field[];
  submitLabel: string;
  successTitle: string;
  successBody: string;
  fallbackEmail?: string;
};

export default function Form({
  source, fields, submitLabel, successTitle, successBody,
  fallbackEmail = "contact@nashlab.ai",
}: Props) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setErr(null);
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, string> = { source };
    for (const [k, v] of fd.entries()) payload[k] = String(v);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (!res.ok || !j.ok) throw new Error(j.error || "submit failed");
      setDone(true);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "submit failed");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div
        className="rounded-2xl p-8"
        style={{ border: "1px solid #4a4055", background: "rgba(196,182,224,0.05)" }}
      >
        <div className="eyebrow eyebrow-accent">RECEIVED</div>
        <h3 className="display text-2xl mt-3">{successTitle}</h3>
        <p className="mt-3 text-paper-muted leading-relaxed">{successBody}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-ink-500 bg-ink-800 p-6 md:p-8"
    >
      <div className="grid grid-cols-2 gap-4">
        {fields.map((f) => (
          <label
            key={f.name}
            className={clsx("flex flex-col gap-1.5", f.span === 2 ? "col-span-2" : "col-span-2 md:col-span-1")}
          >
            <span className="font-mono text-[11px] uppercase tracking-wider text-paper-dim">
              {f.label}{f.required ? " *" : ""}
            </span>
            {f.type === "textarea" ? (
              <textarea
                name={f.name}
                required={f.required}
                placeholder={f.placeholder}
                rows={5}
                className="bg-ink-900 border border-ink-500 rounded px-3 py-2 text-sm focus:outline-none focus:border-theory transition-colors"
              />
            ) : f.type === "select" ? (
              <select
                name={f.name}
                required={f.required}
                className="bg-ink-900 border border-ink-500 rounded px-3 py-2 text-sm focus:outline-none focus:border-theory transition-colors"
                defaultValue=""
              >
                <option value="" disabled>{f.placeholder ?? "Select…"}</option>
                {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input
                type={f.type}
                name={f.name}
                required={f.required}
                placeholder={f.placeholder}
                className="bg-ink-900 border border-ink-500 rounded px-3 py-2 text-sm focus:outline-none focus:border-theory transition-colors"
              />
            )}
          </label>
        ))}
      </div>

      {err && <p className="mt-4 text-sm text-veto">{err}</p>}

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={busy}
          className="bg-paper text-ink-900 text-sm px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {busy ? "Sending…" : submitLabel}
        </button>
        <span className="text-xs text-paper-dim">
          or email{" "}
          <a
            className="text-paper underline decoration-ink-500 hover:decoration-paper"
            href={`mailto:${fallbackEmail}?subject=${encodeURIComponent(`[${source}] inquiry`)}`}
          >
            {fallbackEmail}
          </a>
        </span>
      </div>
    </form>
  );
}
