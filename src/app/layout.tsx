import Footer from '@components/Footer';
import "./globals.css";
import PwaInstallToast from '@components/PwaInstallToast';
import DynamicHeader from '@components/DynamicHeader';
import BreakingNewsTickerController from '@components/BreakingNewsTickerController';
import ClientLangHead from './ClientLangHead';
import { AdsterraBanner320x50 } from '@components/AdsterraAds';

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <ClientLangHead />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico.jpg" />
        <meta name="theme-color" content="#0a0a0a" />
      </head>
      <body suppressHydrationWarning>
        <PwaInstallToast />
        <header className="cnn-header"></header>
        <DynamicHeader />
        <nav className="cnn-nav">
          <div className="nav-container"></div>
        </nav>
        <BreakingNewsTickerController>
          <div className="main-container max-w-screen-xl mx-auto px-2 sm:px-4 pt-4 pb-8 w-full">
            {children}
          </div>
          <Footer />
        </BreakingNewsTickerController>
        {/* Sticky mobile ad */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000, display: 'flex', justifyContent: 'center' }}>
          <AdsterraBanner320x50 style={{ maxWidth: '100vw' }} />
        </div>
      </body>
    </html>
  );
} 