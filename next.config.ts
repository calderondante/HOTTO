import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Isolate production builds from an existing development server's caches.
  distDir: process.env.HOTTO_BUILD_DIR || ".next",
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
