"use client";
import React, { useState, useRef, useEffect } from "react";
import Navbar from "@components/Navbar";
import BreakingNewsTicker from "@components/BreakingNewsTicker";

export default function BreakingNewsTickerController({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showTicker, setShowTicker] = useState(true);
  const lastScrollY = useRef(0);

  // Hide ticker on scroll down, show on scroll up (mobile only)
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth > 768) return;
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
        setShowTicker(false);
      } else {
        setShowTicker(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide ticker when mobile menu is open
  const effectiveShowTicker = showTicker && !isMenuOpen;

  return (
    <>
      <BreakingNewsTicker showTicker={effectiveShowTicker} />
      <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      {children}
    </>
  );
} 