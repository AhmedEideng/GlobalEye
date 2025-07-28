"use client";
import { useEffect, useState } from "react";
import { NewsArticle, getImageUrl, formatDate } from '@/utils/fetchNews';
import { useAuth } from '@/hooks/useAuth';
import { getFavorites } from '@/services/favorites';
import SafeText from '@/components/SafeText';
import UniversalImage from '@/components/UniversalImage';
import Link from 'next/link';
import { removeFavorite } from '@/services/favorites';

export default function FavoritesPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const favArticles = await getFavorites(user.id);
        setFavorites(favArticles);
      } catch (err) {
        setError('Failed to load favorites');
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [user]);

  const handleRemoveFavorite = async (slug: string) => {
    if (!user) return;
    
    try {
      await removeFavorite(user.id, slug);
      setFavorites(prev => prev.filter(article => article.slug !== slug));
    } catch (err) {
      console.error('Failed to remove favorite:', err);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h1>
          <p className="text-gray-600 mb-4">Please log in to view your favorites</p>
          <Link 
            href="/login" 
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-bold"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-6"></div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Loading Favorites</h2>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-bold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Favorites</h1>
        <div className="w-20 h-1 bg-red-600 rounded mb-4"></div>
        <p className="text-gray-600">
          Your saved articles and favorite news
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⭐</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Favorites Yet</h2>
          <p className="text-gray-600 mb-6">
            You haven&apos;t saved any articles to your favorites yet.
          </p>
          <Link 
            href="/" 
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-bold"
          >
            Browse News
          </Link>
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {favorites.length} Favorite Articles
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {favorites.map((article, idx) => {
              const imageSrc = getImageUrl(article.image_url);
              const formattedDate = formatDate(article.published_at);
              
              return (
                <div key={article.slug} className="article-card group relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <Link href={`/article/${article.slug}`}>
                    <div className="relative w-full h-48 overflow-hidden">
                      {imageSrc && (
                        <UniversalImage
                          src={imageSrc}
                          alt={article.title}
                          fill
                          priority={idx < 4}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                      {/* Remove favorite button */}
                      <button
                        type="button"
                        className="absolute top-2 right-2 z-10 bg-white/80 rounded-full p-2 shadow hover:bg-red-100 transition-opacity opacity-0 group-hover:opacity-100"
                        title="Remove from favorites"
                        onClick={e => { e.preventDefault(); e.stopPropagation(); handleRemoveFavorite(article.slug); }}
                      >
                        <span role="img" aria-label="remove favorite">🗑️</span>
                      </button>
                    </div>
                  </Link>
                  <div className="p-4">
                    <div className="article-category text-xs font-bold mb-1 bg-red-600 text-white rounded-full px-3 py-1 inline-block">
                      <SafeText fallback="Unknown Source">{article.source?.name}</SafeText>
                    </div>
                    <Link href={`/article/${article.slug}`}>
                      <h3 className="article-title text-lg font-bold mb-2 line-clamp-2 text-gray-900 group-hover:text-red-600 transition-colors">
                        <SafeText fallback="Untitled">{article.title}</SafeText>
                      </h3>
                    </Link>
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
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
} 