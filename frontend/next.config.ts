import type { NextConfig } from "next";

// URL backend cho rewrite proxy
// Sử dụng NEXT_PUBLIC_API_URL (đã có) để lấy backend URL
// Local dev: NEXT_PUBLIC_API_URL=http://localhost:3001/api
// Production: NEXT_PUBLIC_API_URL=https://tutorbackend-2e8a.onrender.com/api
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
// Strip /api suffix để làm base URL cho rewrite
// Dùng 127.0.0.1 thay vì localhost để tránh IPv6 resolve → HTTP 500
const BACKEND_URL = API_URL.replace(/\/+$/, '').replace(/\/api$/, '').replace('localhost', '127.0.0.1');

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
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
