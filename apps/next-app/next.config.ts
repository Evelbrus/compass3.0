import type { NextConfig } from 'next';
const path = require('path');
const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    formats: ['image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/socket.io/:path*',
        destination: 'https://operator.garage.kg/socket.io/:path*',
      },
    ];
  },
  experimental: {
    optimizeCss: true,
    serverActions: {
      bodySizeLimit: '3mb',
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@socket': path.resolve(__dirname, 'src/socket.js'),
      '@app': path.resolve(__dirname, '../../packages/app'),
      '@pages': path.resolve(__dirname, '../../packages/pages'),
      '@widgets': path.resolve(__dirname, '../../packages/widgets'),
      '@features': path.resolve(__dirname, '../../packages/features'),
      '@entities': path.resolve(__dirname, '../../packages/entities'),
      '@shared': path.resolve(__dirname, '../../packages/shared'),
    };
    return config;
  },
};

module.exports = withNextIntl(nextConfig);
