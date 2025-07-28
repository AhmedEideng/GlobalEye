import React from 'react';
import { NewsArticle, getImageUrl, formatDate } from '@/utils/fetchNews';
import SafeText from './SafeText';
import SourceNameText from './SourceNameText';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import UniversalImage from './UniversalImage';
import { useEffect, useState } from 'react';
import { isFavorite, addFavorite, removeFavorite } from '@/services/favorites';

interface ArticleHeaderProps {
  article: NewsArticle;
}

export default function ArticleHeader({ article }: ArticleHeaderProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isFav, setIsFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; key: number } | null>(null);

  useEffect(() => {
    if (user) {
      isFavorite(user.id, article.slug).then(setIsFav);
    } else {
      setIsFav(false);
    }
  }, [user, article.slug]);

  const handleToggleFavorite = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setFavLoading(true);
    if (isFav) {
      await removeFavorite(user.id, article.slug);
      setIsFav(false);
      setToast({ msg: 'Removed from favorites', key: Date.now() });
    } else {
      await addFavorite(user.id, article.slug);
      setIsFav(true);
      setToast({ msg: 'Added to favorites', key: Date.now() });
    }
    setFavLoading(false);
  };

  const imageSrc = getImageUrl(article.image_url);
  const formattedDate = formatDate(article.published_at);

  return (
    <>
      {toast && (
        <div key={toast.key} className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in">
          {toast.msg}
        </div>
      )}
      <header className="article-header mb-8">
        {/* Featured Image */}
        {imageSrc && (
          <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-6">
            <UniversalImage
              src={imageSrc}
              alt={article.title}
              fill
              priority={true}
              className="object-cover w-full h-full"
            />
            {/* Favorite button */}
            <button
              type="button"
              className="absolute top-4 right-4 z-20 bg-white/80 rounded-full p-3 shadow hover:bg-gray-100 transition"
              title={isFav ? 'Remove from favorites' : 'Add to favorites'}
              onClick={handleToggleFavorite}
              disabled={favLoading}
            >
              {isFav ? (
                <span role="img" aria-label="favorite" className="text-xl">⭐</span>
              ) : (
                <span role="img" aria-label="not favorite" className="text-xl">☆</span>
              )}
            </button>
          </div>
        )}

        {/* Article Meta */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
            {article.source?.name && (
              <span className="bg-red-600 text-white px-3 py-1 rounded-full font-bold shadow-sm">
                <SourceNameText sourceName={article.source.name} />
              </span>
            )}
            {formattedDate && (
              <span className="flex items-center gap-1">
                📅 {formattedDate}
              </span>
            )}
            {article.author && (
              <span className="flex items-center gap-1">
                👤 <SafeText fallback="Unknown Author">{article.author}</SafeText>
              </span>
            )}
          </div>

          {/* Article Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            <SafeText fallback="Untitled">{article.title}</SafeText>
          </h1>

          {/* Article Description */}
          {article.description && (
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              <SafeText fallback="No description available">{article.description}</SafeText>
            </p>
          )}
        </div>
      </header>
    </>
  );
} 