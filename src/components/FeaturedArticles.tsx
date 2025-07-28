"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getFeaturedArticles } from '@/utils/updateViewsCount';
import { NewsArticle } from '@/utils/fetchNews';
import { formatDate } from '@/utils/fetchNews';

export default function FeaturedArticles() {
  const [featuredArticles, setFeaturedArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedArticles = async () => {
      try {
        setLoading(true);
        const articles = await getFeaturedArticles(5);
        setFeaturedArticles(articles);
      } catch (error) {
        console.error('Error loading featured articles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedArticles();
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">🌟 Featured Articles</h2>
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

  if (featuredArticles.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
        <span className="mr-2">🌟</span>
        Featured Articles
      </h2>
      
      <div className="space-y-4">
        {featuredArticles.map((article) => (
          <Link 
            key={article.slug} 
            href={`/article/${article.slug}`}
            className="block group"
          >
            <article className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start space-x-4">
                {article.image_url && (
                  <div className="flex-shrink-0">
                    <Image
                      src={article.image_url}
                      alt={article.title}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={() => {
                        // Handle error by hiding the image container
                        const container = document.querySelector('.flex-shrink-0');
                        if (container) {
                          (container as HTMLElement).style.display = 'none';
                        }
                      }}
                    />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-red-600 transition-colors duration-200 line-clamp-2">
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
                      <span className="flex items-center">
                        <span className="mr-1">👁️</span>
                        {article.views_count} views
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
          href="/featured" 
          className="text-red-600 hover:text-red-700 font-medium text-sm"
        >
          View All Featured Articles →
        </Link>
      </div>
    </div>
  );
} 