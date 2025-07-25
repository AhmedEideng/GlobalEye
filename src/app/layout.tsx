import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ErrorBoundary from '@/components/ErrorBoundary';
import BreakingNewsTickerController from '@/components/BreakingNewsTickerController';
import ScrollToTopWrapper from '@/components/ScrollToTopWrapper';
import Footer from '@/components/Footer';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true
});

export const metadata: Metadata = {
  title: {
    default: 'GlobalEye News - Latest Breaking News, World Headlines',
    template: '%s | GlobalEye News'
  },
  description: 'Get the latest breaking news, world headlines, business, technology, sports, health, and more. Trusted global news coverage, real-time updates, and in-depth analysis from GlobalEye News.',
  keywords: ['news', 'breaking news', 'world news', 'latest news', 'global news', 'headlines', 'current events'],
  authors: [{ name: 'GlobalEye News' }],
  creator: 'GlobalEye News',
  publisher: 'GlobalEye News',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://globaleye.live'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'GlobalEye News - Latest Breaking News, World Headlines',
    description: 'Get the latest breaking news, world headlines, business, technology, sports, health, and more.',
    url: 'https://globaleye.live',
    siteName: 'GlobalEye News',
    images: [
      {
        url: '/favicon.ico.jpg',
        width: 1200,
        height: 630,
        alt: 'GlobalEye News',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GlobalEye News - Latest Breaking News, World Headlines',
    description: 'Get the latest breaking news, world headlines, business, technology, sports, health, and more.',
    images: ['/favicon.ico.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico.jpg',
    shortcut: '/favicon.ico.jpg',
    apple: '/favicon.ico.jpg',
  },
  verification: {
    google: 'your-google-verification-code',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'GlobalEye News',
    'application-name': 'GlobalEye News',
    'msapplication-TileColor': '#dc2626',
    'msapplication-TileImage': '/favicon.ico.jpg',
    'msapplication-config': '/browserconfig.xml',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico.jpg" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#dc2626" />
        <meta name="msapplication-TileColor" content="#dc2626" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="GlobalEye News" />
        <link rel="apple-touch-icon" href="/favicon.ico.jpg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="GlobalEye News" />
        <meta name="msapplication-TileImage" content="/favicon.ico.jpg" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <BreakingNewsTickerController>
            <ScrollToTopWrapper>
              <main className="min-h-screen bg-gray-50 pt-24 md:pt-28">
                {children}
              </main>
              <Footer />
            </ScrollToTopWrapper>
          </BreakingNewsTickerController>
        </ErrorBoundary>
      </body>
    </html>
  );
} 