"use client";
import Link from "next/link";
import { NewsArticle, getImageUrl, formatDate } from '@/utils/fetchNews';
import React from "react";
import SafeText from './SafeText';
import SourceNameText from './SourceNameText';

import SimpleSourceName from './SimpleSourceName';
import UniversalImage from './UniversalImage';
import { useAuth } from '@/hooks/useAuth';
import { isFavorite, addFavorite, removeFavorite } from '@/services/favorites';
import { useRouter } from 'next/navigation';
import { trackEvent } from '@/utils/analytics';

const SkeletonCard = () => (
  <div className="animate-pulse rounded-xl bg-gray-200 shadow-md overflow-hidden">
    <div className="w-full h-48 bg-gray-300" />
    <div className="p-4">
      <div className="h-4 w-24 bg-gray-300 rounded mb-2" />
      <div className="h-6 w-3/4 bg-gray-300 rounded mb-2" />
      <div className="h-4 w-full bg-gray-200 rounded mb-2" />
      <div className="h-3 w-1/2 bg-gray-200 rounded" />
    </div>
  </div>
);

const HomeNewsGrid = React.memo(({ articles }: { articles: NewsArticle[] }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = React.useState<Record<string, boolean>>({});
  const [loadingFav, setLoadingFav] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<{ msg: string; key: number } | null>(null);

  React.useEffect(() => {
    if (!user) {
      setFavorites({});
      return;
    }
    (async () => {
      const favs: Record<string, boolean> = {};
      for (const article of articles) {
        favs[article.slug] = await isFavorite(user.id, article.slug);
      }
      setFavorites(favs);
    })();
  }, [user, articles]);

  const handleToggleFavorite = React.useCallback(async (slug: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
    setLoadingFav(slug);
    if (favorites[slug]) {
      await removeFavorite(user.id, slug);
      setFavorites((prev) => ({ ...prev, [slug]: false }));
      setToast({ msg: 'Removed from favorites', key: Date.now() });
      trackEvent('remove_from_favorites', { slug });
    } else {
      await addFavorite(user.id, slug);
      setFavorites((prev) => ({ ...prev, [slug]: true }));
      setToast({ msg: 'Added to favorites', key: Date.now() });
      trackEvent('add_to_favorites', { slug });
    }
    setLoadingFav(null);
  }, [user, router, favorites]);

  const renderArticle = React.useCallback((article: NewsArticle, idx: number) => {
    const imageSrc = getImageUrl(article.image_url);
    const formattedDate = formatDate(article.published_at);
    
    return (
      <Link
        key={article.slug || idx}
        href={`/article/${article.slug}`}
        className="article-card group relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        onClick={() => trackEvent('view_article', { slug: article.slug, title: article.title, category: article.category })}
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

          
          {/* Removed red category badge */}
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

  if (!articles?.length) {
    // Skeleton loading
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  return (
    <>
      {toast && (
        <div key={toast.key} className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in">
          {toast.msg}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {articles.map(renderArticle)}
      </div>
    </>
  );
});

HomeNewsGrid.displayName = 'HomeNewsGrid';

export default HomeNewsGrid; 