export type ProjectKind =
  | "company" | "book" | "software" | "research" | "website" | "other";

export type ProjectStatus =
  | "active" | "draft" | "shipping" | "shipped" | "archived";

export type ProjectMetadataStatus = "exploration" | "in-progress" | "shipped";

export type ProjectExternalLink = {
  label: string;
  href: string;
};

export type ProjectMetadata = {
  slug: string;
  code: string;
  title: string;
  tagline: string;
  status: ProjectMetadataStatus;
  framing: string;
  externalLinks?: ProjectExternalLink[];
  seedQuestion?: string;
};

export type ProjectVisibility = "default" | "teaser";

export type ProjectLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type Project = {
  slug: string;
  code: string;
  title: string;
  tagline: string;
  kind: ProjectKind;
  status: ProjectStatus;
  startedISO: string;
  updatedISO: string;
  stage?: string;
  links: ProjectLink[];
  summary: string;
  customPage?: string;
  mediaHeroSrc?: string;
  classification?: "public" | "restricted" | "private";
  visibility?: ProjectVisibility;
  citation?: string;
  authors?: string[];
};
