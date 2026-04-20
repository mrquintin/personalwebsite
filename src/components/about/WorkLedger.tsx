import Link from "next/link";
import { loadProjects } from "@/lib/projects/loader";

export default function WorkLedger({ showAll = false }: { showAll?: boolean }) {
  const projects = loadProjects().filter((p) => showAll ? true : p.status !== "archived");
  return (
    <ul style={{ fontFamily: "var(--font-mono)", fontSize: "var(--t-sm-size)" }}>
      {projects.map((p) => (
        <li key={p.slug} style={{ padding: "4px 0", display: "grid", gridTemplateColumns: "60px 200px 1fr", gap: "var(--s-3)" }}>
          <Link href={p.customPage ?? `/projects/${p.slug}`} style={{ color: "var(--accent-dim)" }}>{p.code}</Link>
          <span style={{ color: "var(--fg)" }}>{p.title}</span>
          <span style={{ color: "var(--fg-dim)" }}>{p.tagline}</span>
        </li>
      ))}
    </ul>
  );
}
