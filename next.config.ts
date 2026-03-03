import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    const backendUrl = new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1');
    const backendHost = backendUrl.hostname;
    const backendProtocol = backendUrl.protocol;

    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendProtocol}//${backendHost}:8000/api/v1/:path*`,
      },
      {
        source: '/api/storage/:path*',
        destination: `${backendProtocol}//${backendHost}:9000/:path*`,
      },
    ];
  },
};

export default nextConfig;
