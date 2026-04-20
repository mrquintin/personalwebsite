"use client";
export default function DownloadActions() {
  return (
    <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--t-xs-size)", color: "var(--fg-mute)" }} data-affordance>
      [ <button onClick={() => window.print()} style={{ color: "var(--fg)" }}>⌘P print</button> ]
      {"  "}
      [ <a href="/resume.pdf" download style={{ color: "var(--fg)" }}>⬇ download pdf</a> ]
      {"  "}
      [ <button onClick={() => navigator.clipboard.writeText(window.location.href)} style={{ color: "var(--fg)" }}>copy link</button> ]
    </span>
  );
}
