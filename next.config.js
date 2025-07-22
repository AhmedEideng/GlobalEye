// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require('next-pwa');

const pwaConfig = {
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|svg|gif|webp)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    {
      urlPattern: /^https:\/\/.*\/api\/news/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'news-api',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 15 * 60, // 15 minutes
        },
      },
    },
    {
      urlPattern: /^https:\/\/.*\/api\/news-rotation/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'news-rotation-api',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 5 * 60, // 5 minutes
        },
      },
    },
  ],
};

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
      { protocol: 'https', hostname: 'www.rollingstone.com' },
      { protocol: 'https', hostname: 'media.pitchfork.com' },
      { protocol: 'https', hostname: 'platform.theverge.com' },
      { protocol: 'https', hostname: 'dmn-dallas-news-prod.cdn.arcpublishing.com' },
      { protocol: 'https', hostname: 'cdn.mos.cms.futurecdn.net' },
      { protocol: 'https', hostname: 'a1.espncdn.com' },
      { protocol: 'https', hostname: 'ichef.bbci.co.uk' },
      { protocol: 'https', hostname: 'www.mercurynews.com' },
      { protocol: 'https', hostname: 'cdn.nba.com' },
      { protocol: 'https', hostname: 'i.guim.co.uk' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 300, // 5 minutes
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['react-icons'],
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.highperformanceformat.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "img-src 'self' data: blob: https: http:",
              "media-src 'self' https:",
              "connect-src 'self' https: wss:",
              "frame-src 'self' https:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              "upgrade-insecure-requests"
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = {
  output: 'standalone',
  ...withPWA({ ...nextConfig, pwa: pwaConfig })
}; 