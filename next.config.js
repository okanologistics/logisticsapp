/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: { 
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Optimize for Vercel deployment
  compress: true,
  generateEtags: true,
  poweredByHeader: false,
  experimental: {
    serverActions: {
      allowedOrigins: ['*.vercel.app', 'okanologistics.com', '*.okanologistics.com']
    }
  },
  // Environment variables validation
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  }
};

module.exports = nextConfig;
