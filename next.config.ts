import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import bundleAnalyzer from "@next/bundle-analyzer";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pkg = require("./package.json");

const withMDX = createMDX({});
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
});

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  env: {
    NEXT_PUBLIC_BUILD_VERSION: pkg.version,
  },
  redirects: async () => [
    { source: "/hivemind", destination: "/projects/hivemind", permanent: true },
    { source: "/purposeless-efficiency", destination: "/projects/purposeless-efficiency", permanent: true },
    { source: "/theseus", destination: "/projects/theseus", permanent: true },
  ],
};

export default withBundleAnalyzer(withMDX(nextConfig));
