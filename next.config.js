const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: true, // تم التعطيل نهائيًا
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
  ],
});

module.exports = withPWA({
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 300, // Increased to 5 minutes
    domains: [
      'images.unsplash.com',
      'cdn.cnn.com',
      'ichef.bbci.co.uk',
      'static01.nyt.com',
      'media.guim.co.uk',
      'your-custom-domain.com',
    ],
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['react-icons'],
  },
  // Performance improvement
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  // Improve caching
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // تم تعطيل إعدادات i18n لأنها غير مدعومة في App Router
  // i18n: {
  //   locales: ['en', 'ar'],
  //   defaultLocale: 'en',
  //   localeDetection: false
  // },
  // You can add Next.js settings here
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
          // CSP: Remove 'unsafe-eval' and restrict 'unsafe-inline' to style-src only
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.highperformanceformat.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com;",
          },
        ],
      },
    ];
  },
}); 