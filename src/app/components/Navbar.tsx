"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from 'react';

const categories = [
  { name: 'Home', path: '/' },
  { name: 'World', path: '/world' },
  { name: 'Politics', path: '/politics' },
  { name: 'Business', path: '/business' },
  { name: 'Technology', path: '/technology' },
  { name: 'Sports', path: '/sports' },
  { name: 'Entertainment', path: '/entertainment' },
  { name: 'Health', path: '/health' },
  { name: 'Science', path: '/science' }
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="navbar-container">
      <ul className="nav-menu flex gap-4 items-center">
        {categories.filter(c => c.name !== 'Home').map((category) => (
          <li key={category.name} className="nav-item">
            <Link
              href={category.path}
              className={`nav-link ${pathname === category.path ? 'active' : ''}`}
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
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
              {categories.filter(c => c.name !== 'Home').map((category) => (
                <li key={category.name} className="mobile-nav-item">
                  <Link
                    href={category.path}
                    className={`mobile-nav-link ${pathname === category.path ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
} 