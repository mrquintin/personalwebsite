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
      run: async ({ toast }) => {
        toast("· download started");
        const a = document.createElement("a");
        a.href = "/resume.pdf"; a.download = "michael-quintin-cv.pdf";
        document.body.appendChild(a); a.click(); a.remove();
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
      title: "Open LinkedIn", context: "linkedin.com/in/michaelquintin ↗",
      run: ({ close }) => { window.open("https://linkedin.com/in/michaelquintin", "_blank", "noopener"); close(); } },
    { id: "ext.thesescodex", kind: "action", section: "External",
      title: "Open thesescodex.com", context: "thesescodex.com ↗",
      run: ({ close }) => { window.open("https://thesescodex.com", "_blank", "noopener"); close(); } },
  ];
}
