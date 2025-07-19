"use client";
import { useAuth } from '@hooks/useAuth';
import { getFavorites, removeFavorite } from '../../services/favorites';
import { fetchNews, NewsArticle, formatDate, getImageUrl } from '@utils/fetchNews';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import OptimizedImage from '@components/OptimizedImage';
import { sendAnalyticsEvent } from '@utils/fetchNews';
import React from 'react';
import SafeText from '@components/SafeText';

export default function FavoritesPage() {
  const { user, loading } = useAuth();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [favLoading, setFavLoading] = useState(true);

  const handleRemove = React.useCallback(async (slug: string) => {
    if (!user) return;
    try {
      setArticles((prev) => prev.filter((a) => a.slug !== slug)); // Optimistic update
      await removeFavorite(user.id, slug);
    } catch (error) {
      // Revert optimistic update on error
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.debug('Failed to remove favorite:', error);
      }
    }
  }, [user]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;
      try {
        setFavLoading(true);
        const slugs = await getFavorites(user.id);
        // جلب تفاصيل الأخبار المفضلة حسب slug
        const allNews = await fetchNews();
        setArticles(allNews.filter((a: NewsArticle) => slugs.includes(a.slug)));
        sendAnalyticsEvent('favorites_view', { userId: user.id });
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.debug('Failed to fetch favorites:', error);
        }
      } finally {
        setFavLoading(false);
      }
    };
    if (user) fetchFavorites().catch(() => {});
  }, [user]);

  if (loading || favLoading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-lg">Loading...</div>;
  }

  if (!user) {
    return <div className="min-h-[60vh] flex items-center justify-center text-lg">Please login to view your favorites.</div>;
  }

  const handleRemoveCb = React.useCallback((slug: string) => handleRemove(slug), [handleRemove]);

  return (
    <main className="max-w-3xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Your Favorite Articles</h1>
      {articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-gray-500 py-12">
          <span className="text-4xl mb-4">⭐</span>
          <div className="text-lg font-semibold mb-2">You have no favorite articles yet.</div>
          <div className="mb-6">Start exploring and add articles to your favorites!</div>
          <Link href="/">
            <a className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-full transition">Back to Home</a>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {articles.map((article) => {
            // Format date outside of the callback to avoid hooks rules violation
            const formattedDate = formatDate(article.publishedAt);

            return (
              <div key={article.slug || article.url} className="relative group">
                <Link href={`/article/${article.slug}`} className="article-card">
                  <div className="relative w-full h-40 overflow-hidden">
                    <OptimizedImage
                      src={getImageUrl(article.urlToImage)}
                      alt={article.title}
                      fill
                      className="object-cover w-full h-full"
                      sizes="100vw"
                    />
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-red-600 font-bold mb-1"><SafeText fallback="Unknown Source">{article.source?.name}</SafeText></div>
                    <h3 className="text-lg font-bold mb-1 line-clamp-2 break-words text-balance"><SafeText fallback="Untitled">{article.title}</SafeText></h3>
                    <div className="text-xs text-gray-400">{formattedDate}</div>
                  </div>
                </Link>
                <button
                  onClick={() => handleRemoveCb(article.slug)}
                  className="absolute top-2 right-2 z-10 bg-white/80 rounded-full p-2 shadow hover:bg-red-100 transition-opacity opacity-0 group-hover:opacity-100"
                  title="Remove from favorites"
                >
                  <span role="img" aria-label="remove">🗑️</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
} 