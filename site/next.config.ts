import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations (temporarily reduced for debugging)
  experimental: {
    optimizePackageImports: ['framer-motion', 'd3-geo', 'topojson-client'],
  },
  
  // Image optimizations
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Enable compression
  compress: true,
  
  // Simplified webpack config for debugging
  webpack: (config, { dev, isServer }) => {
    // Only basic optimizations in development
    if (!dev && !isServer) {
      config.optimization.sideEffects = false;
    }
    
    return config;
  },
  
  // Headers for better caching
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
