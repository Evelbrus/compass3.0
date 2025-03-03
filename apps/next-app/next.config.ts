import type { NextConfig } from 'next';
const path = require('path');
const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin();

// Заголовки безопасности, которые будут применяться ко всем маршрутам
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

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

  // Добавляем настройку заголовков
  async headers() {
    return [
      {
        // Применяем ко всем маршрутам
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // Отдельно настраиваем Content-Security-Policy для API
        source: '/api/:path*',
        headers: [
          ...securityHeaders,
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'none'; style-src 'self'",
          },
        ],
      },
    ];
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
      '@socket': path.resolve(__dirname, 'src/lib/websocket/websocket-client.ts'),
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
