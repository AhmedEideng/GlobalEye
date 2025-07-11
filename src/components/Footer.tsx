"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer bg-black text-white pt-10 pb-4">
      <div className="footer-content flex flex-col md:flex-row md:justify-between gap-8 max-w-6xl mx-auto px-4">
        <div className="footer-section mb-6 md:mb-0">
          <h3 className="text-xl font-bold mb-2">GlobalEye News</h3>
          <p className="text-gray-300">Your trusted source for global news and insights. Stay informed with the latest breaking news, business updates, technology trends, and more from around the world.</p>
        </div>

        <div className="footer-section mb-6 md:mb-0">
          <h3 className="text-xl font-bold mb-2">News Categories</h3>
          <div className="flex flex-col gap-1 mt-2">
            <Link href="/world" className="hover:text-red-500 transition-colors">World</Link>
            <Link href="/politics" className="hover:text-red-500 transition-colors">Politics</Link>
            <Link href="/business" className="hover:text-red-500 transition-colors">Business</Link>
            <Link href="/technology" className="hover:text-red-500 transition-colors">Technology</Link>
            <Link href="/sports" className="hover:text-red-500 transition-colors">Sports</Link>
            <Link href="/entertainment" className="hover:text-red-500 transition-colors">Entertainment</Link>
            <Link href="/health" className="hover:text-red-500 transition-colors">Health</Link>
            <Link href="/science" className="hover:text-red-500 transition-colors">Science</Link>
          </div>
        </div>

        <div className="footer-section mb-6 md:mb-0">
          <h3 className="text-xl font-bold mb-2">Company</h3>
          <div className="flex flex-col gap-1 mt-2">
            <Link href="/about" className="hover:text-red-500 transition-colors">About Us</Link>
            <Link href="/about/team" className="hover:text-red-500 transition-colors">Our Editorial Team</Link>
            <Link href="/privacy" className="hover:text-red-500 transition-colors">Privacy Policy</Link>
            <Link href="/terms-and-conditions" className="hover:text-red-500 transition-colors">Terms and Conditions</Link>
            <Link href="/contact-us" className="hover:text-red-500 transition-colors">Contact Us</Link>
          </div>
        </div>

        <div className="footer-section">
          <h3 className="text-xl font-bold mb-2">Contact</h3>
          <Link href="/contact-us" className="hover:text-red-500 transition-colors">info@globaleye.live</Link>
        </div>
      </div>
      <div style={{ 
        borderTop: '1px solid #333', 
        marginTop: '30px', 
        paddingTop: '20px',
        textAlign: 'center',
        color: '#999'
      }}>
        <p>© 2025 GlobalEye News. All rights reserved.</p>
      </div>
    </footer>
  );
} 