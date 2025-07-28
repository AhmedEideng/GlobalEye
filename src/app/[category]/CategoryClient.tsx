"use client";

import React, { useMemo, useCallback } from 'react';
import UniversalImage from '@components/UniversalImage';
import { sendAnalyticsEvent } from '@utils/fetchNews';
import Link from 'next/link';
import { NewsArticle, getImageUrl, formatDate } from '@utils/fetchNews';
import SafeText from '@components/SafeText';
import SourceNameText from '@components/SourceNameText';

import SimpleSourceName from '@components/SimpleSourceName';

import { useAuth } from '@hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isFavorite, addFavorite, removeFavorite } from '@/services/favorites';
import SuggestedArticles from '@components/SuggestedArticles';

export default function CategoryClient({ articles, categoryName }: { articles: NewsArticle[], categoryName: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [loadingFav, setLoadingFav] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; key: number } | null>(null);

  // Memoize articles to prevent unnecessary re-renders
  const memoizedArticles = useMemo(() => articles, [articles]);

  useEffect(() => {
    if (!user) {
      setFavorites({});
      return;
    }
    
    // Load favorites in batches to avoid blocking the UI
    const loadFavorites = async () => {
      const favs: Record<string, boolean> = {};
      const batchSize = 10;
      
      for (let i = 0; i < memoizedArticles.length; i += batchSize) {
        const batch = memoizedArticles.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (article) => {
            favs[article.slug] = await isFavorite(user.id, article.slug);
          })
        );
        
        // Update state in batches to keep UI responsive
        if (i === 0) {
          setFavorites(favs);
        } else {
          setFavorites(prev => ({ ...prev, ...favs }));
        }
      }
    };
    
    loadFavorites();
  }, [user, memoizedArticles]);

  const handleToggleFavorite = useCallback(async (slug: string) => {
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
  }, [user, router, favorites]);

  // Memoize the render function to prevent unnecessary re-renders
  const renderArticle = useCallback((article: NewsArticle, idx: number) => {
    const imageSrc = getImageUrl(article.image_url);
    const formattedDate = formatDate(article.published_at);
    
    return (
      <Link
        key={article.slug || idx}
        href={`/article/${article.slug}`}
        className="article-card group relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        onClick={() => sendAnalyticsEvent('view_article', { slug: article.slug, title: article.title, category: article.category })}
      >
        <div className="relative w-full h-48 overflow-hidden">
          <UniversalImage
            src={imageSrc}
            alt={article.title}
            fill
            priority={idx < 4} // Prioritize first 4 images
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
                  <div className="article-category text-xs font-bold mb-1 bg-gray-600 text-white rounded-full px-3 py-1 inline-block">
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
  }, [favorites, loadingFav, handleToggleFavorite]);

  // Memoize the featured article (first article)
  const featuredArticle = useMemo(() => {
    return memoizedArticles.length > 0 ? memoizedArticles[0] : null;
  }, [memoizedArticles]);

  // Memoize the remaining articles (all except first)
  const remainingArticles = useMemo(() => {
    return memoizedArticles.length > 1 ? memoizedArticles.slice(1) : [];
  }, [memoizedArticles]);

  // Memoize the featured article render function
  const renderFeaturedArticle = useCallback((article: NewsArticle) => {
    const imageSrc = getImageUrl(article.image_url);
    const formattedDate = formatDate(article.published_at);
    
    return (
      <Link
        key={article.slug}
        href={`/article/${article.slug}`}
        className="featured-article group relative bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
        onClick={() => sendAnalyticsEvent('view_article', { slug: article.slug, title: article.title, category: article.category })}
      >
        <div className="relative w-full h-80 md:h-96 overflow-hidden">
          <UniversalImage
            src={imageSrc}
            alt={article.title}
            fill
            priority={true}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
            fallbackSrc="/placeholder-news.jpg"
          />
          {/* Featured badge */}
                  {/* Removed featured badge */}
          {/* Favorite button */}
          <button
            type="button"
            className="absolute top-4 right-4 z-10 bg-white/80 rounded-full p-2 shadow hover:bg-gray-100 transition-opacity opacity-0 group-hover:opacity-100"
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
        <div className="p-6">
          {/* Debug component - remove after fixing */}
          
          
                  {/* Removed red category badge */}
          <h2 className="article-title text-2xl md:text-3xl font-bold mb-4 line-clamp-3 text-gray-900 group-hover:text-red-600 transition-colors">
            <SafeText fallback="Untitled">{article.title}</SafeText>
          </h2>
          <p className="article-excerpt text-gray-600 text-lg mb-4 line-clamp-3">
            <SafeText fallback="No description available">{article.description}</SafeText>
          </p>
          <div className="article-meta text-sm flex flex-wrap gap-3 text-gray-400">
            <span className="flex items-center gap-1 text-gray-400">
              {formattedDate}
            </span>
            {article.author && <span>by <SafeText fallback="Unknown Author">{article.author}</SafeText></span>}
          </div>
        </div>
      </Link>
    );
  }, [favorites, loadingFav, handleToggleFavorite]);

  // Memoize the articles grid to prevent unnecessary re-renders
  const articlesGrid = useMemo(() => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {remainingArticles.map(renderArticle)}
    </div>
  ), [remainingArticles, renderArticle]);

  return (
    <>
      {toast && (
        <div key={toast.key} className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in">
          {toast.msg}
        </div>
      )}
      <div className="category-page max-w-screen-xl mx-auto px-2 sm:px-4">


        {memoizedArticles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📰</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No {categoryName} News Available</h2>
            <p className="text-gray-600 mb-6">
              We couldn&apos;t find any {categoryName.toLowerCase()} news at the moment.
            </p>
            <a 
              href="/" 
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-bold"
            >
              Back to Homepage
            </a>
          </div>
        ) : (
          <div>
            {/* Featured Article */}
            {featuredArticle && (
              <div className="mb-8">
                {renderFeaturedArticle(featuredArticle)}
              </div>
            )}
            
            {/* Remaining Articles */}
            {remainingArticles.length > 0 && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    More {categoryName} Articles
                  </h2>
                </div>
                {articlesGrid}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Suggested Articles Section */}
      <SuggestedArticles category={categoryName.toLowerCase()} limit={8} />
    </>
  );
} 