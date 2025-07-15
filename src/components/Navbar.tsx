"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LoginButton from '@components/LoginButton';
import React, { useRef, useEffect } from 'react';

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

interface NavbarProps {
  isMenuOpen: boolean;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  style?: React.CSSProperties;
}

export default function Navbar({ isMenuOpen, setIsMenuOpen, style }: NavbarProps) {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  // إغلاق القائمة عند الضغط خارجها في وضع الجوال
  useEffect(() => {
    if (!isMenuOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen, setIsMenuOpen]);

  return (
    <div className="navbar-container flex items-center justify-between py-2 px-4 bg-white fixed left-0 w-full z-50 top-0" style={style}>
      {/* Mobile menu button and logo left (mobile only) */}
      <div className="flex-1 flex items-center gap-2 md:hidden">
        <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
          <span className="block w-6 h-0.5 bg-gray-800 mb-1"></span>
          <span className="block w-6 h-0.5 bg-gray-800 mb-1"></span>
          <span className="block w-6 h-0.5 bg-gray-800"></span>
        </button>
        <Link href="/" className="site-logo flex items-center text-2xl font-extrabold select-none text-red-600 tracking-tight drop-shadow-lg ml-2">
          <svg className="w-7 h-7 mr-1" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="url(#paint0_linear)"/><defs><linearGradient id="paint0_linear" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop stopColor="#dc2626"/><stop offset="1" stopColor="#f59e42"/></linearGradient></defs></svg>
          Global<span className="text-red-600">Eye</span>
        </Link>
      </div>
      {/* Logo on desktop */}
      <div className="hidden md:flex flex-1 justify-start">
        <Link href="/" className="site-logo flex items-center text-3xl font-extrabold select-none text-red-600 tracking-tight drop-shadow-lg">
          <svg className="w-8 h-8 mr-2" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="url(#paint0_linear)"/><defs><linearGradient id="paint0_linear" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop stopColor="#dc2626"/><stop offset="1" stopColor="#f59e42"/></linearGradient></defs></svg>
          <span className="text-red-600">Global</span><span className="text-gradient-eye">Eye</span>
        </Link>
      </div>
      {/* Navigation menu */}
      <ul className="nav-menu hidden md:flex gap-2 items-center rounded-full px-2 py-1 overflow-x-hidden max-w-full ml-auto">
        {categories.map((category) => (
          <li key={category.name} className="nav-item">
            <Link
              href={category.path}
              className={`nav-link px-4 py-2 font-medium transition-colors duration-200 ${pathname === category.path ? 'text-red-600' : 'text-gray-700 hover:text-red-600'}`}
            >
              {category.label}
            </Link>
          </li>
        ))}
      </ul>
      {/* Login button left (always last) */}
      <div className="flex items-center gap-4 ml-2">
        <LoginButton onLoginClick={() => setIsMenuOpen(false)} />
      </div>
      {/* Mobile sidebar */}
      {isMenuOpen && (
        <div className="mobile-nav fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 flex justify-start">
          <div ref={menuRef} className="bg-white w-80 h-full p-6 flex flex-col shadow-lg rounded-r-2xl relative overflow-y-auto">
            {/* Logo at the top */}
            <div className="mb-6 pb-4 border-b border-gray-200">
              <Link href="/" className="site-logo flex items-center text-2xl font-extrabold select-none text-red-600 tracking-tight drop-shadow-lg" onClick={() => setIsMenuOpen(false)}>
                <svg className="w-8 h-8 mr-2" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="url(#paint0_linear)"/><defs><linearGradient id="paint0_linear" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop stopColor="#dc2626"/><stop offset="1" stopColor="#f59e42"/></linearGradient></defs></svg>
                <span className="text-red-600">Global</span><span className="text-gradient-eye">Eye</span>
              </Link>
            </div>
            
            {/* Login button */}
            <div className="mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center justify-center">
                <LoginButton onLoginClick={() => setIsMenuOpen(false)} />
              </div>
            </div>
            
            {/* Categories */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">Categories</h3>
              <ul className="mobile-nav-menu flex flex-col gap-1">
                {categories.map((category) => (
                  <li key={category.name} className="mobile-nav-item">
                    <Link
                      href={category.path}
                      className={`mobile-nav-link px-4 py-3 font-medium transition-colors duration-200 rounded-lg ${pathname === category.path ? 'text-red-600 bg-red-50' : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {category.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Legal Pages */}
            <div className="mt-auto">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">Legal Pages</h3>
              <ul className="flex flex-col gap-1">
                <li>
                  <Link
                    href="/about"
                    className="mobile-nav-link px-4 py-3 font-medium transition-colors duration-200 rounded-lg text-gray-700 hover:text-red-600 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="mobile-nav-link px-4 py-3 font-medium transition-colors duration-200 rounded-lg text-gray-700 hover:text-red-600 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-and-conditions"
                    className="mobile-nav-link px-4 py-3 font-medium transition-colors duration-200 rounded-lg text-gray-700 hover:text-red-600 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact-us"
                    className="mobile-nav-link px-4 py-3 font-medium transition-colors duration-200 rounded-lg text-gray-700 hover:text-red-600 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 