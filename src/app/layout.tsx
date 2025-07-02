import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import PwaInstallToast from "./components/PwaInstallToast";
import DynamicHeader from "./components/DynamicHeader";
import SearchBar from "./components/SearchBar";

export const metadata: Metadata = {
  metadataBase: new URL('https://globaleye.news'),
  title: "GlobalEye News - Your Trusted Source for Global News",
  description: "Stay informed with the latest breaking news, business updates, technology trends, sports coverage, and more from around the world.",
  keywords: "news, global news, breaking news, business news, technology news, sports news, world news",
  authors: [{ name: "GlobalEye News" }],
  robots: "index, follow",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = 'en';
  const dir = 'ltr';
  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <PwaInstallToast />
        {/* CNN Style Header */}
        <header className="cnn-header">
          {/* Top Bar */}
          <div className="header-top bg-black text-white w-full">
            <div className="header-top-content px-4 py-2">
              <div className="font-semibold tracking-wide">Breaking News: Stay informed with the latest global updates</div>
            </div>
          </div>
          {/* Main Header - Hidden to avoid duplication with DynamicHeader */}
          {/* <div className="header-main">
            <div className="cnn-logo">
              <span>Global</span>Eye
            </div>
            <AuthButtons />
          </div> */}
        </header>
        {/* Dynamic Header - disappears on scroll down, appears on scroll up */}
        <DynamicHeader />
        {/* Navigation */}
        <nav className="cnn-nav">
          <div className="nav-container">
            <Navbar />
          </div>
        </nav>
        {/* SearchBar below Navbar */}
        <div className="w-full bg-white border-b border-gray-100 py-3">
          <SearchBar />
        </div>
        {/* Main Content */}
        <div className="main-container">
          {children}
        </div>
        {/* Footer */}
        <Footer />
      </body>
    </html>
  );
} 