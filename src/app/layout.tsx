import Footer from '@components/Footer';
import "./globals.css";
import type { Metadata, Viewport } from "next";
import PwaInstallToast from '@components/PwaInstallToast';
import DynamicHeader from '@components/DynamicHeader';
import Script from 'next/script';

export const metadata: Metadata = {
  metadataBase: new URL('https://globaleye.news'),
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
  },
  twitter: {
    card: "summary_large_image",
    title: "GlobalEye News",
    description: "Your trusted source for global news and insights",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = 'en';
  const dir = 'ltr';

  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
      <head>
        {/* SEO Meta Tags */}
        <title>Global Eye - News from Everywhere</title>
        <meta name="description" content="Global Eye provides you with the latest news from around the world in one place." />
        <meta property="og:title" content="Global Eye - News from Everywhere" />
        <meta property="og:description" content="Global Eye provides you with the latest news from around the world in one place." />
        <meta property="og:image" content="https://globaleye.live/placeholder-news.jpg" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Global Eye - News from Everywhere" />
        <meta name="twitter:description" content="Global Eye provides you with the latest news from around the world in one place." />
        <meta name="twitter:image" content="https://globaleye.live/placeholder-news.jpg" />
        {/* Google Analytics */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
        {/* PWA Meta Tags */}
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
        {/* Main Content */}
        <div className="main-container max-w-screen-xl mx-auto px-2 sm:px-4 pt-4 pb-8 w-full">
          {children}
        </div>
        {/* Footer */}
        <Footer />
      </body>
    </html>
  );
} 