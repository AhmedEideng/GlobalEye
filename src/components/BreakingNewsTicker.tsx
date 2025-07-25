"use client";
import Link from 'next/link';
import { FaNewspaper, FaSync } from 'react-icons/fa';
import { useBreakingNews, BreakingNewsItem } from '@hooks/useBreakingNews';
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import React from 'react';

export default function BreakingNewsTicker({ showTicker = true }: { showTicker?: boolean }) {
  const { news, loading, error, refreshNews } = useBreakingNews();
  const [scrollPosition, setScrollPosition] = useState(0);
  const [hasNew, setHasNew] = useState(false);
  const prevNewsCount = useRef(0);

  // Memoize animation speed and max scroll calculation
  const animationConfig = useMemo(() => ({
    speed: 50, // pixels per second
    frameRate: 60,
    itemWidth: 500, // approximate width per item
    maxScroll: news.length * 500
  }), [news.length]);

  // Continuous scrolling animation with better performance
  useEffect(() => {
    if (news.length === 0) return;
    
    const interval = setInterval(() => {
      setScrollPosition((prev) => {
        const newPosition = prev + (animationConfig.speed / animationConfig.frameRate);
        return newPosition >= animationConfig.maxScroll ? 0 : newPosition;
      });
    }, 1000 / animationConfig.frameRate); // More precise timing

    return () => clearInterval(interval);
  }, [news.length, animationConfig]);

  useEffect(() => {
    if (news.length > prevNewsCount.current) {
      setHasNew(true);
      setTimeout(() => setHasNew(false), 4000);
    }
    prevNewsCount.current = news.length;
  }, [news.length]);

  const handleRetry = useCallback(() => {
    refreshNews();
  }, [refreshNews]);

  const handleTickerClick = () => {
    if (news.length > 0) {
      window.location.href = news[0].url;
    }
  };

  // Memoize ticker items to prevent unnecessary re-renders
  const tickerItems = useMemo(() => {
    return news.map((newsItem: BreakingNewsItem) => (
      <div
        key={newsItem.id || `news-${newsItem.url}`}
        className="ticker-item flex-shrink-0 flex items-center"
        style={{ width: '400px', marginRight: '100px' }}
      >
        {/* Yellow dot at the start of each news */}
        <div className="separator-dot mr-3 flex-shrink-0">
          <div className="w-3 h-3 bg-yellow-300 rounded-full"></div>
        </div>
        <Link 
          href={newsItem.url}
          className="news-link flex items-center"
        >
          <span className="news-title text-sm font-medium">
            {newsItem.title}
          </span>
        </Link>
        {/* Separator line */}
        <div className="separator-line ml-4 flex-shrink-0">
          <div className="w-px h-4 bg-yellow-300 opacity-50"></div>
        </div>
      </div>
    ));
  }, [news]);

  // Memoize loading and error states
  const tickerContent = useMemo(() => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-300"></div>
          <span className="ml-2 text-sm">Loading breaking news...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center py-2">
          <span className="text-sm text-yellow-200">Failed to load breaking news</span>
          <button 
            onClick={handleRetry}
            className="ml-2 p-1 hover:text-yellow-300 transition-colors"
            aria-label="Retry loading breaking news"
          >
            <FaSync className="w-3 h-3" />
          </button>
        </div>
      );
    }

    if (news.length === 0) {
      return (
        <div className="flex items-center justify-center py-2">
          <span className="text-sm text-yellow-200">No breaking news available</span>
        </div>
      );
    }

    return (
      <div className="ticker-items-container overflow-hidden">
        <div 
          className="ticker-items flex items-center"
          style={{
            transform: `translateX(-${scrollPosition}px)`,
            width: `${animationConfig.maxScroll}px`
          }}
        >
          {tickerItems}
        </div>
      </div>
    );
  }, [loading, error, news.length, handleRetry, scrollPosition, animationConfig.maxScroll, tickerItems]);

  if (!showTicker) return null;

  return (
    <div
      className={`breaking-news-ticker bg-red-800 text-white w-full overflow-hidden fixed left-0 top-12 md:top-16 z-30 transition-all duration-500 ${hasNew ? 'animate-pulse ring-4 ring-yellow-300' : ''}`}
      onClick={handleTickerClick}
      style={{ cursor: news.length > 0 ? 'pointer' : 'default' }}
    >
      <div className="ticker-container flex items-center py-2 px-4">
        {/* Breaking News Label */}
        <div className="breaking-label flex items-center gap-2 mr-4 flex-shrink-0">
          <FaNewspaper className="text-yellow-300 animate-pulse" />
          <span className="breaking-label-text font-bold text-sm uppercase tracking-wider">
            Breaking News
          </span>
          {news.length > 1 && (
            <span className="ml-2 bg-yellow-300 text-red-800 rounded-full px-2 py-0.5 text-xs font-bold animate-bounce">
              {news.length}
            </span>
          )}
          {hasNew && (
            <span className="ml-2 text-yellow-200 font-bold animate-bounce">New Breaking News!</span>
          )}
        </div>
        {/* Ticker Content */}
        <div className="ticker-content flex-1 overflow-hidden">
          {tickerContent}
        </div>
      </div>
      {/* Gradient overlay for smooth edges */}
      <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-red-800 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-red-800 to-transparent pointer-events-none" />
    </div>
  );
} 