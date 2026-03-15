import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      // Allow MinIO images over HTTP (EC2 deployment)
      {
        protocol: "http",
        hostname: "**",
        pathname: "/**",
      },
    ],
  },

  async rewrites() {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://backend:8000/api/v1";

    // Extract the base origin (without /api/v1 path)
    let backendOrigin: string;
    try {
      const url = new URL(apiUrl);
      backendOrigin = url.origin;
    } catch {
      backendOrigin = "http://backend:8000";
    }

    return [
      // Proxy all API calls to the backend
      {
        source: "/api/v1/:path*",
        destination: `${backendOrigin}/api/v1/:path*`,
      },
      // Proxy MinIO storage requests through the backend origin
      {
        source: "/api/storage/:path*",
        destination: `${backendOrigin}/:path*`,
      },
    ];
  },
};

export default nextConfig;