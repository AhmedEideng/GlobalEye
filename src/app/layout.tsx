import { ThemeToggle } from "./components/ThemeToggle";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import HeaderAuthButtons from "./components/HeaderAuthButtons";

export const metadata: Metadata = {
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
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {/* CNN Style Header */}
        <header className="cnn-header">
          {/* Top Bar */}
          <div className="header-top">
            <div className="header-top-content">
              <div>Breaking News: Stay informed with the latest global updates</div>
              <div className="header-controls">
                {/* <ThemeToggle /> */}
              </div>
            </div>
          </div>
          {/* Main Header */}
          <div className="header-main">
            <div className="cnn-logo">
              <span>Global</span>Eye
            </div>
            <HeaderAuthButtons />
          </div>
        </header>
        {/* Navigation */}
        <nav className="cnn-nav">
          <div className="nav-container">
            <Navbar />
          </div>
        </nav>
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