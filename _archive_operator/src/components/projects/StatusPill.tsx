import type { ProjectStatus } from "@/lib/projects/types";

const CLASS: Record<ProjectStatus, string> = {
  active:   "pill pill-active",
  draft:    "pill pill-draft",
  shipping: "pill pill-shipping",
  shipped:  "pill pill-shipped",
  archived: "pill pill-archived",
};

export default function StatusPill({ status }: { status: ProjectStatus }) {
  return <span className={CLASS[status]}>{status}</span>;
}
