"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LoginButton from '@components/LoginButton';
import React, { useRef, useEffect, useState } from 'react';

const categories = [
  { name: 'home', path: '/', label: 'Home' },
  { name: 'world', path: '/world', label: 'World' },
  { name: 'business', path: '/business', label: 'Business' },
  { name: 'technology', path: '/technology', label: 'Technology' },
  { name: 'sports', path: '/sports', label: 'Sports' },
  { name: 'entertainment', path: '/entertainment', label: 'Entertainment' },
  { name: 'health', path: '/health', label: 'Health' },
  { name: 'science', path: '/science', label: 'Science' },
  { name: 'politics', path: '/politics', label: 'Politics' },
  { name: 'general', path: '/general', label: 'General' }
];

interface NavbarProps {
  isMenuOpen: boolean;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  style?: React.CSSProperties;
}

export default function Navbar({ isMenuOpen, setIsMenuOpen, style }: NavbarProps) {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  const handleMenuToggle = React.useCallback(() => setIsMenuOpen((prev) => !prev), [setIsMenuOpen]);
  const handleMenuClose = React.useCallback(() => setIsMenuOpen(false), [setIsMenuOpen]);

  // Close menu when clicking outside in mobile mode
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

  // Monitor scrolling to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' 
        : 'bg-white/90 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Side - Mobile Menu Button */}
          <div className="lg:hidden">
            <button 
              className="relative w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex flex-col items-center justify-center"
              onClick={handleMenuToggle} 
              aria-label="Toggle menu"
            >
              <span className={`block w-5 h-0.5 bg-gray-700 transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1' : ''}`}></span>
              <span className={`block w-5 h-0.5 bg-gray-700 transition-all duration-300 mt-1 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-5 h-0.5 bg-gray-700 transition-all duration-300 mt-1 ${isMenuOpen ? '-rotate-45 -translate-y-1' : ''}`}></span>
            </button>
          </div>

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                GlobalEye
              </span>
              <span className="text-xs text-gray-500 font-medium">World News</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.path}
                className={`relative px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 group ${
                  pathname === category.path 
                    ? 'text-red-600 bg-red-50 shadow-sm' 
                    : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                }`}
              >
                <span>{category.label}</span>
                {pathname === category.path && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-600 rounded-full"></div>
                )}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Login Button */}
            <LoginButton onLoginClick={handleMenuClose} />
          </div>
        </div>
      </div>
      
      {/* Mobile sidebar */}
      {isMenuOpen && (
        <div className="lg:hidden fixed top-0 left-0 w-full h-full bg-black/50 backdrop-blur-sm z-[60]">
          <div ref={menuRef} className="absolute top-0 left-0 w-80 h-full bg-white shadow-2xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <Link href="/" className="flex items-center space-x-3" onClick={handleMenuClose}>
                  <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                      GlobalEye
                    </div>
                    <div className="text-xs text-gray-500">World News</div>
                  </div>
                </Link>
                <button 
                  onClick={handleMenuClose}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {/* Categories */}
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
                    Categories
                  </h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <Link
                        key={category.name}
                        href={category.path}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                          pathname === category.path 
                            ? 'text-red-600 bg-red-50 border border-red-100' 
                            : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                        }`}
                        onClick={handleMenuClose}
                      >
                        <span>{category.label}</span>
                        {pathname === category.path && (
                          <div className="ml-auto w-2 h-2 bg-red-600 rounded-full"></div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="px-4 py-2">
                  <div className="h-px bg-gray-200"></div>
                </div>

                {/* Quick Actions */}
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
                    Quick Actions
                  </h3>
                  <div className="space-y-2">
                    <Link
                      href="/favorites"
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:text-red-600 hover:bg-gray-50 transition-all duration-200"
                      onClick={handleMenuClose}
                    >
                      <span className="text-xl">⭐</span>
                      <span>Favorites</span>
                    </Link>

                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-100">
                <div className="flex items-center justify-center">
                  <LoginButton onLoginClick={handleMenuClose} />
                </div>
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    © 2024 GlobalEye. All rights reserved
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 