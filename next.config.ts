import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/task-api/:path*",
        destination: "http://localhost:8081/:path*",
      },
      {
        source: "/tasks/:path*",
        destination: "http://localhost:8081/tasks/:path*",
      },
    ];
  },
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  turbopack: {
    rules: {
      "globals.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
