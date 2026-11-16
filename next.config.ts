import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: "http://localhost:8080/api/auth/:path*",
      },
      {
        source: "/users/:path*",
        destination: "http://localhost:8080/users/:path*",
      },
      {
        source: "/api/register",
        destination: "http://localhost:8080/api/register",
      },

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
