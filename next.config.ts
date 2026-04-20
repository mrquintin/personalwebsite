import type { NextConfig } from "next";
import pkg from "./package.json" with { type: "json" };

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_VERSION: pkg.version,
  },
};

export default nextConfig;
