// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for Vercel
  output: 'standalone',
  
  // Base path for deployment
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  
  // Asset prefix for CDN
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',
  
  // Add trailing slash to all paths
  trailingSlash: true,
  
  // Enable React strict mode
  reactStrictMode: true,
  
  // Disable TypeScript type checking during build (handled by CI)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Disable ESLint during build (handled by CI)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Image optimization configuration
  images: {
    unoptimized: true, // Disable optimization for static export
    domains: [],
  },
  
  // Configure page extensions
  pageExtensions: ['tsx', 'ts', 'jsx', 'js', 'mjs'],
  
  // Environment variables that should be exposed to the client
  env: {
    NEXT_PUBLIC_APP_ENV: process.env.NODE_ENV || 'development',
  },
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Important: return the modified config
    return config;
  },
  
  // API route configuration
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
