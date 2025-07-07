"use client";
import Link from 'next/link';
import { FaNewspaper, FaSync } from 'react-icons/fa';
import { useBreakingNews, BreakingNewsItem } from '@hooks/useBreakingNews';

export default function BreakingNewsTicker() {
  const { news, loading, error, refreshNews } = useBreakingNews();

  return (
    <div className="breaking-news-ticker bg-red-800 text-white w-full overflow-hidden relative">
      <div 
        className="ticker-container flex items-center py-2 px-4"
      >
        {/* Breaking News Label */}
        <div className="breaking-label flex items-center gap-2 mr-4 flex-shrink-0">
          <FaNewspaper className="text-yellow-300 animate-pulse" />
          <span className="font-bold text-sm uppercase tracking-wider">
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
            <div className="ticker-items flex items-center">
              {news.slice(0, 5).map((newsItem: BreakingNewsItem) => (
                <div
                  key={newsItem.id}
                  className="ticker-item flex-shrink-0 flex items-center"
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