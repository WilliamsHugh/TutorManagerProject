import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/dashboard/student',
        destination: '/student',
        permanent: true,
      },
      {
        source: '/dashboard/student/:path*',
        destination: '/student/:path*',
        permanent: true,
      },
    ];
  },

};

export default nextConfig;
