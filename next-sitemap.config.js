/* eslint-disable @typescript-eslint/no-require-imports */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  "https://personalwebsite-beta-nine.vercel.app";

const PROJECT_SLUGS = ["hivemind", "purposeless-efficiency", "theseus"];

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  exclude: ["/styleguide", "/api/*"],
  changefreq: "monthly",
  priority: 0.7,
  transform: async (_config, path) => {
    let priority = 0.7;
    let changefreq = "monthly";
    if (path === "/") {
      priority = 1.0;
    } else if (path === "/projects" || path.startsWith("/projects/")) {
      priority = 0.8;
    } else if (path === "/about" || path === "/resume") {
      priority = 0.7;
    } else if (path === "/chat") {
      priority = 0.6;
      changefreq = "weekly";
    }
    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
    };
  },
  additionalPaths: async () =>
    PROJECT_SLUGS.map((slug) => ({
      loc: `/projects/${slug}`,
      changefreq: "monthly",
      priority: 0.8,
      lastmod: new Date().toISOString(),
    })),
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/", disallow: ["/styleguide", "/api/"] },
      // AI crawlers — explicit policy. Default: allow Anthropic and
      // OpenAI for indexing the public content (the user can revise);
      // block training crawlers known to ignore the site's intent.
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "CCBot", disallow: "/" },
    ],
    additionalSitemaps: [`${SITE_URL}/sitemap.xml`],
  },
};
