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
      {/* زر تسجيل الدخول يمين */}
      <div className="flex-1 flex justify-end md:hidden">
        <AuthButtons />
      </div>
      {/* اسم الموقع وسط */}
      <div className="flex-1 flex justify-center md:hidden">
        <Link href="/" className="site-logo flex items-center text-2xl font-extrabold select-none bg-gradient-to-r from-red-600 via-yellow-500 to-red-700 bg-clip-text text-transparent tracking-tight drop-shadow-lg">
          <svg className="w-7 h-7 mr-1" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="url(#paint0_linear)"/><defs><linearGradient id="paint0_linear" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop stop-color="#dc2626"/><stop offset="1" stop-color="#f59e42"/></linearGradient></defs></svg>
          GlobalEye
        </Link>
      </div>
      {/* زر القائمة يسار */}
      <div className="flex-1 flex justify-start md:hidden">
        <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
          <span className="block w-6 h-0.5 bg-gray-800 mb-1"></span>
          <span className="block w-6 h-0.5 bg-gray-800 mb-1"></span>
          <span className="block w-6 h-0.5 bg-gray-800"></span>
        </button>
      </div>
      {/* الشعار والدخول في الديسكتوب */}
      <div className="hidden md:flex flex-1 justify-start">
        <Link href="/" className="site-logo flex items-center text-3xl font-extrabold select-none bg-gradient-to-r from-red-600 via-yellow-500 to-red-700 bg-clip-text text-transparent tracking-tight drop-shadow-lg">
          <svg className="w-8 h-8 mr-2" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="url(#paint0_linear)"/><defs><linearGradient id="paint0_linear" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop stop-color="#dc2626"/><stop offset="1" stop-color="#f59e42"/></linearGradient></defs></svg>
          GlobalEye
        </Link>
      </div>
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
      <div className="ml-4 hidden md:flex">
        <AuthButtons />
      </div>
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