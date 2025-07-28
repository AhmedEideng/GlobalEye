"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { NewsArticle, getImageUrl, formatDate } from '@/utils/fetchNews';
import UniversalImage from './UniversalImage';
import SafeText from './SafeText';
import { useAuth } from '@/hooks/useAuth';
import { isFavorite, addFavorite, removeFavorite } from '@/services/favorites';
import { useRouter } from 'next/navigation';

interface SuggestedArticlesProps {
  currentArticle?: NewsArticle;
  category?: string;
  limit?: number;
}

export default function SuggestedArticles({ 
  currentArticle, 
  category = 'general', 
  limit = 8 
}: SuggestedArticlesProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [suggestedArticles, setSuggestedArticles] = useState<NewsArticle[]>([]);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [loadingFav, setLoadingFav] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; key: number } | null>(null);

  // Fetch suggested articles
  useEffect(() => {
    const fetchSuggestedArticles = async () => {
      try {
        // If we have a current article, fetch related articles
        if (currentArticle) {
          const response = await fetch(`/api/news-rotation?category=${category}&limit=${limit + 1}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              const articles = data.data.mainArticles || data.data.suggestedArticles || data.data || [];
              // Filter out the current article
              const filtered = articles.filter((article: NewsArticle) => article.slug !== currentArticle.slug);
              setSuggestedArticles(filtered.slice(0, limit));
            }
          }
        } else {
          // Fetch general articles for the category
          const response = await fetch(`/api/news-rotation?category=${category}&limit=${limit}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              const articles = data.data.mainArticles || data.data.suggestedArticles || data.data || [];
              setSuggestedArticles(articles);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching suggested articles:', error);
      }
    };

    fetchSuggestedArticles();
  }, [currentArticle, category, limit]);

  // Load favorites
  useEffect(() => {
    if (!user) {
      setFavorites({});
      return;
    }
    
    const loadFavorites = async () => {
      const favs: Record<string, boolean> = {};
      for (const article of suggestedArticles) {
        favs[article.slug] = await isFavorite(user.id, article.slug);
      }
      setFavorites(favs);
    };
    
    loadFavorites();
  }, [user, suggestedArticles]);

  const handleToggleFavorite = async (slug: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
    setLoadingFav(slug);
    if (favorites[slug]) {
      await removeFavorite(user.id, slug);
      setFavorites((prev) => ({ ...prev, [slug]: false }));
      setToast({ msg: 'Removed from favorites', key: Date.now() });
    } else {
      await addFavorite(user.id, slug);
      setFavorites((prev) => ({ ...prev, [slug]: true }));
      setToast({ msg: 'Added to favorites', key: Date.now() });
    }
    setLoadingFav(null);
  };

  const renderArticle = (article: NewsArticle, idx: number) => {
    const imageSrc = getImageUrl(article.image_url);
    const formattedDate = formatDate(article.published_at);
    
    return (
      <Link
        key={article.slug || idx}
        href={`/article/${article.slug}`}
        className="article-card group relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      >
        <div className="relative w-full h-48 overflow-hidden">
          <UniversalImage
            src={imageSrc}
            alt={article.title}
            fill
            priority={idx < 4}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            fallbackSrc="/placeholder-news.jpg"
          />
          {/* Favorite button */}
          <button
            type="button"
            className="absolute top-2 right-2 z-10 bg-white/80 rounded-full p-2 shadow hover:bg-gray-100 transition-opacity opacity-0 group-hover:opacity-100"
            title={favorites[article.slug] ? 'Remove from favorites' : 'Add to favorites'}
            onClick={e => { e.preventDefault(); e.stopPropagation(); handleToggleFavorite(article.slug); }}
            disabled={loadingFav === article.slug}
          >
            {favorites[article.slug] ? (
              <span role="img" aria-label="favorite">⭐</span>
            ) : (
              <span role="img" aria-label="not favorite">☆</span>
            )}
          </button>
        </div>
        <div className="p-4">
          <div className="article-category text-xs font-bold mb-1 bg-red-600 text-white rounded-full px-3 py-1 inline-block">
            <SafeText fallback="Unknown Source">{article.source?.name}</SafeText>
          </div>
          <h3 className="article-title text-lg font-bold mb-2 line-clamp-2 text-gray-900 group-hover:text-red-600 transition-colors">
            <SafeText fallback="Untitled">{article.title}</SafeText>
          </h3>
          <p className="article-excerpt text-gray-600 text-sm mb-2 line-clamp-2">
            <SafeText fallback="No description available">{article.description}</SafeText>
          </p>
          <div className="article-meta text-xs flex flex-wrap gap-2 text-gray-400">
            <span className="flex items-center gap-1 text-gray-400">
              {formattedDate}
            </span>
            {article.author && <span>by <SafeText fallback="Unknown Author">{article.author}</SafeText></span>}
          </div>
        </div>
      </Link>
    );
  };

  if (suggestedArticles.length === 0) {
    return null;
  }

  return (
    <>
      {toast && (
        <div key={toast.key} className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in">
          {toast.msg}
        </div>
      )}
      
      <section className="mt-12 bg-gradient-to-br from-gray-100 via-white to-gray-50 rounded-2xl p-6 shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold mb-2 text-red-800 flex items-center gap-2">
            <span role="img" aria-label="newspaper">📰</span>
            {currentArticle ? 'Related Articles' : 'Suggested Articles'}
          </h2>
          <p className="text-gray-500 text-base border-b pb-2">
            {currentArticle ? 'More news you might like' : `Latest ${category} news`}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {suggestedArticles.map(renderArticle)}
        </div>
      </section>
    </>
  );
} 