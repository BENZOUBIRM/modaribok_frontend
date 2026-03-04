import type { NextConfig } from "next";

const API_BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") ||
  "http://localhost:8081";

const nextConfig: NextConfig = {
  /* Proxy image requests to the Spring Boot backend */
  async rewrites() {
    return [
      {
        source: "/api/images/:path*",
        destination: `${API_BACKEND_URL}/api/images/:path*`,
      },
    ];
  },
};

export default nextConfig;
