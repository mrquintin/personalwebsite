import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ padding: "var(--s-7)", fontFamily: "var(--font-mono)", color: "var(--fg)" }}>
      <pre style={{ whiteSpace: "pre-wrap" }}>
{`404 · file not found

$ ls -la ~/michael/
drwxr-xr-x  operator michael    ./about
drwxr-xr-x  operator michael    ./hivemind
drwxr-xr-x  operator michael    ./purposeless-efficiency
drwxr-xr-x  operator michael    ./theseus
drwxr-xr-x  operator michael    ./resume

the file you requested does not exist on this terminal.
⌘K to open the command palette. ⎋ to return home.`}
      </pre>
      <div style={{ marginTop: "var(--s-5)" }}>
        <Link href="/" style={{ color: "var(--accent)" }}>→ /</Link>
      </div>
    </div>
  );
}
