"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from 'react';
import AuthButtons from './AuthButtons';

const categories = [
  { name: 'home', path: '/', label: 'Home' },
  { name: 'world', path: '/world', label: 'World' },
  { name: 'politics', path: '/politics', label: 'Politics' },
  { name: 'business', path: '/business', label: 'Business' },
  { name: 'technology', path: '/technology', label: 'Technology' },
  { name: 'sports', path: '/sports', label: 'Sports' },
  { name: 'entertainment', path: '/entertainment', label: 'Entertainment' },
  { name: 'health', path: '/health', label: 'Health' },
  { name: 'science', path: '/science', label: 'Science' }
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="navbar-container flex items-center justify-between">
      <ul className="nav-menu flex gap-4 items-center">
        <li key="home" className="nav-item">
          <Link
            href="/"
            className={`nav-link ${pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>
        </li>
        {categories.filter(c => c.name !== 'home').map((category) => (
          <li key={category.name} className="nav-item">
            <Link
              href={category.path}
              className={`nav-link ${pathname === category.path ? 'active' : ''}`}
            >
              {category.label}
            </Link>
          </li>
        ))}
      </ul>
      {/* زر تسجيل الدخول في نهاية الشريط */}
      <div className="ml-4">
        <AuthButtons />
      </div>
      {/* Mobile Menu Button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="mobile-nav">
          <div className="flex flex-col gap-4 p-4">
            <ul className="mobile-nav-menu flex flex-col gap-2">
              <li key="home" className="mobile-nav-item">
                <Link
                  href="/"
                  className={`mobile-nav-link ${pathname === '/' ? 'active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
              </li>
              {categories.filter(c => c.name !== 'home').map((category) => (
                <li key={category.name} className="mobile-nav-item">
                  <Link
                    href={category.path}
                    className={`mobile-nav-link ${pathname === category.path ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
            {/* زر تسجيل الدخول في القائمة الجانبية */}
            <div className="mt-4">
              <AuthButtons />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 