import type { NextConfig } from "next";
import createMDX from "@next/mdx";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pkg = require("./package.json");

const withMDX = createMDX({});

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  env: {
    NEXT_PUBLIC_BUILD_VERSION: pkg.version,
  },
};

export default withMDX(nextConfig);
