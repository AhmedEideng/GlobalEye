"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>GlobalEye News</h3>
          <p>Your trusted source for global news and insights. Stay informed with the latest breaking news, business updates, technology trends, and more from around the world.</p>
        </div>

        <div className="footer-section">
          <h3>News Categories</h3>
          <Link href="/world">World</Link>
          <Link href="/politics">Politics</Link>
          <Link href="/business">Business</Link>
          <Link href="/technology">Technology</Link>
          <Link href="/sports">Sports</Link>
          <Link href="/entertainment">Entertainment</Link>
          <Link href="/health">Health</Link>
          <Link href="/science">Science</Link>
        </div>

        <div className="footer-section">
          <h3>Company</h3>
          <Link href="/about">About Us</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
        </div>

        <div className="footer-section">
          <h3>Connect With Us</h3>
          <Link href="https://twitter.com/globaleyenews">Twitter</Link>
          <Link href="https://facebook.com/globaleyenews">Facebook</Link>
          <Link href="https://instagram.com/globaleyenews">Instagram</Link>
        </div>
      </div>
      <div style={{ 
        borderTop: '1px solid #333', 
        marginTop: '30px', 
        paddingTop: '20px',
        textAlign: 'center',
        color: '#999'
      }}>
        <p>© 2024 GlobalEye News. All rights reserved.</p>
      </div>
    </footer>
  );
} 