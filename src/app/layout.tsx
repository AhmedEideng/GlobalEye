import Footer from '@components/Footer';
import "./globals.css";
import type { Metadata, Viewport } from "next";
import PwaInstallToast from '@components/PwaInstallToast';
import DynamicHeader from '@components/DynamicHeader';
import Script from 'next/script';
import BreakingNewsTickerController from '@components/BreakingNewsTickerController';
import ClientLangHead from './ClientLangHead';

export const metadata = {
  metadataBase: new URL('https://globaleye.live'),
  title: "GlobalEye News - Your Trusted Source for Global News",
  description: "Stay informed with the latest breaking news, business updates, technology trends, sports coverage, and more from around the world.",
  keywords: "news, global news, breaking news, business news, technology news, sports news, world news",
  authors: [{ name: "GlobalEye News" }],
  robots: "index, follow",
  icons: {
    icon: '/favicon.ico.jpg',
    shortcut: '/favicon.ico.jpg',
    apple: '/favicon.ico.jpg',
  },
  openGraph: {
    title: "GlobalEye News",
    description: "Your trusted source for global news and insights",
    type: "website",
    locale: "en_US",
    url: 'https://globaleye.live',
    images: [
      { url: '/placeholder-news.jpg', width: 1200, height: 630, alt: 'GlobalEye News' }
    ],
    siteName: 'GlobalEye News',
  },
  twitter: {
    card: "summary_large_image",
    title: "GlobalEye News",
    description: "Your trusted source for global news and insights",
    images: ['/placeholder-news.jpg'],
    site: '@globaleyenews',
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // لا تستخدم window أو usePathname هنا
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <ClientLangHead />
        {/* Meta tags الخاصة فقط */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico.jpg" />
        <meta name="theme-color" content="#0a0a0a" />
      </head>
      <body suppressHydrationWarning>
        <PwaInstallToast />
        {/* CNN Style Header */}
        <header className="cnn-header">
          {/* Top Bar */}
          {/* Removed black bar with breaking news text */}
          {/* Main Header - Hidden to avoid duplication with DynamicHeader */}
          {/* <div className="header-main">
            <div className="cnn-logo">
              <span>Global</span>Eye
            </div>
          </div> */}
        </header>
        {/* Dynamic Header - disappears on scroll down, appears on scroll up */}
        <DynamicHeader />
        {/* Navigation */}
        <nav className="cnn-nav">
          <div className="nav-container"></div>
        </nav>
        {/* BreakingNewsTickerController wraps all content for ticker and navbar on all pages */}
        <BreakingNewsTickerController>
          {/* Main Content */}
          <div className="main-container max-w-screen-xl mx-auto px-2 sm:px-4 pt-4 pb-8 w-full">
            {children}
          </div>
          {/* Footer */}
          <Footer />
        </BreakingNewsTickerController>
      </body>
    </html>
  );
} 