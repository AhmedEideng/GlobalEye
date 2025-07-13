"use client";
import Link from 'next/link';
import { FaNewspaper, FaSync } from 'react-icons/fa';
import { useBreakingNews, BreakingNewsItem } from '@hooks/useBreakingNews';
import { useWindowSize } from '@hooks/useWindowSize';
import { useEffect, useState } from 'react';

export default function BreakingNewsTicker({ showTicker = true }: { showTicker?: boolean }) {
  const { news, loading, error, refreshNews } = useBreakingNews();
  const { width } = useWindowSize();
  const [currentIndex, setCurrentIndex] = useState(0);

  let newsCount = 5;
  if (width < 500) newsCount = 1;
  else if (width < 700) newsCount = 2;
  else if (width < 900) newsCount = 3;
  else if (width < 1200) newsCount = 4;

  // Auto-scroll through news items
  useEffect(() => {
    if (news.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % news.length);
    }, 5000); // Change news every 5 seconds

    return () => clearInterval(interval);
  }, [news.length]);

  if (!showTicker) return null;

  return (
    <div className="breaking-news-ticker bg-red-800 text-white w-full overflow-hidden relative fixed left-0 top-16 md:top-20 z-30">
      <div 
        className="ticker-container flex items-center py-2 px-4"
      >
        {/* Breaking News Label */}
        <div className="breaking-label flex items-center gap-2 mr-4 flex-shrink-0">
          <FaNewspaper className="text-yellow-300 animate-pulse" />
          <span className="breaking-label-text font-bold text-sm uppercase tracking-wider">
            Breaking News
          </span>
        </div>

        {/* Ticker Content */}
        <div className="ticker-content flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-300"></div>
              <span className="ml-2 text-sm">Loading breaking news...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-2">
              <span className="text-sm text-yellow-200">Failed to load breaking news</span>
              <button 
                onClick={refreshNews}
                className="ml-2 p-1 hover:text-yellow-300 transition-colors"
                aria-label="Retry loading breaking news"
              >
                <FaSync className="w-3 h-3" />
              </button>
            </div>
          ) : news.length > 0 ? (
            <div className="ticker-items-container overflow-hidden">
              <div 
                className="ticker-items flex items-center transition-transform duration-1000 ease-in-out"
                style={{
                  transform: `translateX(-${currentIndex * 100}%)`,
                  width: `${news.length * 100}%`
                }}
              >
                {news.slice(0, newsCount).map((newsItem: BreakingNewsItem, index: number) => (
                  <div
                    key={newsItem.id || `news-${newsItem.url}`}
                    className="ticker-item flex-shrink-0 flex items-center"
                    style={{ width: `${100 / news.length}%` }}
                  >
                    {/* Yellow dot at the start of each news */}
                    <div className="separator-dot mr-2 flex-shrink-0">
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
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-2">
              <span className="text-sm text-yellow-200">No breaking news available</span>
            </div>
          )}
        </div>
      </div>

      {/* Gradient overlay for smooth edges */}
      <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-red-800 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-red-800 to-transparent pointer-events-none" />
    </div>
  );
} 