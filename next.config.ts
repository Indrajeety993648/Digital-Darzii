import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [],
    localPatterns: [
      {
        pathname: "/uploads/**",
      },
      {
        pathname: "/results/**",
      },
      {
        pathname: "/templates/**",
      },
      {
        pathname: "/showcase/**",
      },
    ],
  },
};

export default nextConfig;
