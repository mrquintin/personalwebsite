/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://personalwebsite-beta-nine.vercel.app",
  generateRobotsTxt: true,
  exclude: ["/styleguide", "/test"],
  robotsTxtOptions: {
    policies: [{ userAgent: "*", allow: "/" }],
  },
};
