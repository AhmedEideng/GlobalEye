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
    <div className="navbar-container flex items-center justify-between py-2 px-4 bg-white sticky top-0 z-40">
      {/* Website logo */}
      <Link href="/" className="flex items-center text-2xl font-bold mr-6 select-none">
        <span className="text-black">Global</span><span className="text-red-600">Eye</span>
      </Link>
      {/* Section buttons */}
      <ul className="nav-menu hidden md:flex gap-2 items-center rounded-full px-2 py-1 overflow-x-hidden max-w-full">
        {categories.map((category) => (
          <li key={category.name} className="nav-item">
            <Link
              href={category.path}
              className={`nav-link px-4 py-2 rounded-full font-medium transition-colors duration-200 ${pathname === category.path ? 'bg-red-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 hover:text-red-600'}`}
            >
              {category.label}
            </Link>
          </li>
        ))}
      </ul>
      {/* Login button */}
      <div className="ml-4">
        <AuthButtons />
      </div>
      {/* Mobile menu button */}
      <button
        className="mobile-menu-btn ml-2 md:hidden"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        <span className="block w-6 h-0.5 bg-gray-800 mb-1"></span>
        <span className="block w-6 h-0.5 bg-gray-800 mb-1"></span>
        <span className="block w-6 h-0.5 bg-gray-800"></span>
      </button>
      {/* Mobile sidebar */}
      {isMenuOpen && (
        <div className="mobile-nav fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 flex justify-start">
          <div className="bg-white w-64 h-full p-6 flex flex-col gap-4 shadow-lg rounded-r-2xl">
            <Link href="/" className="flex items-center text-2xl font-bold mb-6 select-none" onClick={() => setIsMenuOpen(false)}>
              <span className="text-black">Global</span><span className="text-red-600">Eye</span>
            </Link>
            <ul className="mobile-nav-menu flex flex-col gap-2">
              {categories.map((category) => (
                <li key={category.name} className="mobile-nav-item">
                  <Link
                    href={category.path}
                    className={`mobile-nav-link px-4 py-2 rounded-full font-medium transition-colors duration-200 ${pathname === category.path ? 'bg-red-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 hover:text-red-600'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <AuthButtons />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 