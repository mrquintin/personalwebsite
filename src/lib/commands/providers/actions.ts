import type { Command } from "../types";

const EMAIL = "michael@hivemind.ai";

export function actionCommands(): Command[] {
  return [
    { id: "action.copy-email", kind: "action", section: "Actions",
      title: "Copy email address", context: EMAIL,
      run: async ({ toast }) => {
        try {
          await navigator.clipboard.writeText(EMAIL);
          toast("✓ copied");
        } catch { toast("! clipboard permission denied"); }
      } },
    { id: "action.copy-bibtex", kind: "action", section: "Actions",
      title: "Copy BibTeX citation (Purposeless Efficiency)",
      run: async ({ toast }) => {
        const bib = `@book{quintin_pe,\n  author = {Quintin, Michael},\n  title  = {Purposeless Efficiency},\n  year   = {forthcoming},\n}`;
        try { await navigator.clipboard.writeText(bib); toast("✓ copied"); }
        catch { toast("! clipboard permission denied"); }
      } },
    { id: "action.download-resume", kind: "action", section: "Actions",
      title: "Download resume PDF", context: "/resume.pdf",
      run: async ({ toast, close }) => {
        toast("· download started");
        try {
          const res = await fetch("/resume.pdf");
          if (!res.ok) throw new Error(String(res.status));
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url; a.download = "michael-quintin-cv.pdf";
          document.body.appendChild(a); a.click(); a.remove();
          URL.revokeObjectURL(url);
          toast("✓ download ready");
        } catch {
          toast("! resume.pdf not found — pdf pending");
        }
        close();
      } },
    { id: "action.toggle-theme", kind: "action", section: "Actions",
      title: "Toggle theme (dark / light)",
      run: ({ toast }) => {
        const html = document.documentElement;
        const cur = html.getAttribute("data-theme") ?? "dark";
        const next = cur === "dark" ? "light" : "dark";
        html.setAttribute("data-theme", next);
        try { localStorage.setItem("theme", next); } catch {}
        toast(`theme: ${next}`);
      } },
    { id: "action.print", kind: "action", section: "Actions",
      title: "Print current page", context: "⌘P",
      run: () => { window.print(); } },
    { id: "ext.github", kind: "action", section: "External",
      title: "Open GitHub profile", context: "github.com/mrquintin ↗",
      run: ({ close }) => { window.open("https://github.com/mrquintin", "_blank", "noopener"); close(); } },
    { id: "ext.linkedin", kind: "action", section: "External",
      title: "Open LinkedIn", context: "linkedin.com/in/michael-quintin-5555b4283 ↗",
      run: ({ close }) => {
        window.open("https://www.linkedin.com/in/michael-quintin-5555b4283/", "_blank", "noopener");
        close();
      } },
    { id: "ext.x", kind: "action", section: "External",
      title: "Open X profile", context: "x.com/quintinpublic ↗",
      run: ({ close }) => { window.open("https://x.com/quintinpublic", "_blank", "noopener"); close(); } },
    { id: "ext.thesescodex", kind: "action", section: "External",
      title: "Open thesescodex.com", context: "thesescodex.com ↗",
      run: ({ close }) => { window.open("https://thesescodex.com", "_blank", "noopener"); close(); } },
  ];
}
