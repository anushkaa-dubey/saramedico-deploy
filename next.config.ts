import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },

  async rewrites() {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

    const backendUrl = new URL(apiUrl);

    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl.origin}/api/v1/:path*`,
      },
      {
        source: "/api/storage/:path*",
        destination: `${backendUrl.origin}/:path*`,
      },
    ];
  },
};

export default nextConfig;