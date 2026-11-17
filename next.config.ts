import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Front end only: export plain HTML/CSS/JS to `out/` for static hosting (deployed on Vercel).
  output: "export",
  // Each route becomes a folder with index.html, which every static host serves without rewrites.
  trailingSlash: true,
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
