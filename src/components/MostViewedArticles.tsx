"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getMostViewedArticles } from '@/utils/updateViewsCount';
import { NewsArticle } from '@/utils/fetchNews';
import { formatDate } from '@/utils/fetchNews';

export default function MostViewedArticles() {
  const [mostViewedArticles, setMostViewedArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMostViewedArticles = async () => {
      try {
        setLoading(true);
        const articles = await getMostViewedArticles(5);
        setMostViewedArticles(articles);
      } catch (error) {
        console.error('Error loading most viewed articles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMostViewedArticles();
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">🔥 Most Viewed</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (mostViewedArticles.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
        <span className="mr-2">🔥</span>
        Most Viewed
      </h2>
      
      <div className="space-y-4">
                {mostViewedArticles.map((article, index) => (
          <Link
            key={article.slug}
            href={`/article/${article.slug}`}
            className="block group"
          >
            <article className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                    {article.title}
                  </h3>
                  
                  {article.description && (
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                      {article.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>{formatDate(article.published_at)}</span>
                    {article.views_count && (
                      <span className="flex items-center bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        <span className="mr-1">👁️</span>
                        {article.views_count.toLocaleString()} views
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <Link 
          href="/most-viewed" 
          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
        >
          View All Most Viewed →
        </Link>
      </div>
    </div>
  );
} 