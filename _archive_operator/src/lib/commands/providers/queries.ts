import type { Command } from "../types";

export function queryCommands(buildVersion: string): Command[] {
  return [
    { id: "qry.shortcuts", kind: "query", section: "Info",
      title: "Show keyboard shortcuts", context: "F1",
      run: () => {
        window.dispatchEvent(new CustomEvent("operator:open-help"));
      } },
    { id: "qry.utc", kind: "query", section: "Info",
      title: "Current time (UTC)",
      run: ({ toast }) => {
        toast(new Date().toISOString().replace("T", " ").slice(0, 19) + "Z");
      } },
    { id: "qry.version", kind: "query", section: "Info",
      title: "Build version", context: `v${buildVersion}`,
      run: ({ toast }) => { toast(`build v${buildVersion}`); } },
  ];
}
