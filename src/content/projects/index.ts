export type ProjectIndexEntry = {
  slug: "hivemind" | "purposeless-efficiency" | "theseus";
  code: string;
  title: string;
  tagline: string;
  status: "in-progress" | "shipped" | "exploration";
};

export const projects: ProjectIndexEntry[] = [
  {
    slug: "hivemind",
    code: "HVM",
    title: "Hivemind",
    tagline: "Strategic analytical software.",
    status: "in-progress",
  },
  {
    slug: "purposeless-efficiency",
    code: "PRP",
    title: "Purposeless Efficiency",
    tagline: "Book I — efficiency severed from purpose.",
    status: "in-progress",
  },
  {
    slug: "theseus",
    code: "THS",
    title: "Theseus",
    tagline: "A knowledge system for monitoring ideological contradiction.",
    status: "shipped",
  },
];
