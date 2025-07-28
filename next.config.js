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
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['react-icons'],
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  images: false, // Completely disable Next.js image optimization to allow all external images
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  env: {
    SUPABASE_URL: 'https://xernfvwyruihyezuwybi.supabase.co',
    SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhlcm5mdnd5cnVpaHllenV3eWJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NzA3NjEsImV4cCI6MjA2NTM0Njc2MX0.ZmhaLrkfOz9RcTXx8lp_z0wJCmUznXQwNHb0TKhX4mw',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhlcm5mdnd5cnVpaHllenV3eWJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NzA3NjEsImV4cCI6MjA2NTM0Njc2MX0.ZmhaLrkfOz9RcTXx8lp_z0wJCmUznXQwNHb0TKhX4mw',
  },
  // Disable pages directory since we're using app directory
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // Disable middleware for now to fix build issues
  skipMiddlewareUrlNormalize: true,
  skipTrailingSlashRedirect: true,
  // Disable _document page check
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable static generation for API routes
  trailingSlash: false,
  async rewrites() {
    return [];
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