// Structured-data helpers + injector. Keep this module dependency-free
// (no React-only imports beyond the script element) so it can be reused
// from server components and tested directly.

type Schema = Record<string, unknown>;

export function JsonLd({ data }: { data: Schema | Schema[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function websiteSchema({
  url,
  name,
  description,
}: {
  url: string;
  name: string;
  description: string;
}): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url,
    name,
    description,
  };
}

export function personSchema({
  name,
  jobTitle,
  url,
  sameAs,
  description,
}: {
  name: string;
  jobTitle: string;
  url: string;
  sameAs: string[];
  description: string;
}): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    jobTitle,
    url,
    sameAs,
    description,
  };
}

export function articleSchema({
  url,
  headline,
  description,
  authorName,
  authorUrl,
  about,
}: {
  url: string;
  headline: string;
  description: string;
  authorName: string;
  authorUrl: string;
  about?: string;
}): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline,
    description,
    author: {
      "@type": "Person",
      name: authorName,
      url: authorUrl,
    },
    ...(about
      ? {
          about: {
            "@type": "Thing",
            name: about,
          },
        }
      : {}),
  };
}

export function profilePageSchema({
  url,
  personName,
  jobTitle,
  description,
  sameAs,
}: {
  url: string;
  personName: string;
  jobTitle: string;
  description: string;
  sameAs: string[];
}): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url,
    mainEntity: {
      "@type": "Person",
      name: personName,
      jobTitle,
      url,
      sameAs,
      description,
    },
  };
}
