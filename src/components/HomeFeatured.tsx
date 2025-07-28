import Link from "next/link";
import { NewsArticle } from '@utils/fetchNews';
import { getImageUrl } from '@utils/fetchNews';
import UniversalImage from './UniversalImage';
import { useAuth } from '@hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isFavorite, addFavorite, removeFavorite } from '@/services/favorites';

export default function HomeFeatured({ article }: { article: NewsArticle }) {
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

  if (!article) return null;
  
  return (
    <>
      {toast && (
        <div key={toast.key} className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in">
          {toast.msg}
        </div>
      )}
      <section className="mb-8 sm:mb-10">
        <div className="article-card relative w-full h-[220px] sm:h-[320px] md:h-[420px] lg:h-[500px] rounded-2xl overflow-hidden" style={{ height: 'min(60vw, 420px)', minHeight: '180px' }}>
          <UniversalImage
            src={getImageUrl(article.image_url)}
            alt={article.title}
            fill
            priority={true}
            className="object-cover w-full h-full"
            fallbackSrc="/placeholder-news.jpg"
          />
          {/* Favorite button */}
          <button
            type="button"
            className="absolute top-3 right-3 z-20 bg-white/80 rounded-full p-2 shadow hover:bg-gray-100 transition"
            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
            onClick={handleToggleFavorite}
            disabled={favLoading}
          >
            {isFav ? (
              <span role="img" aria-label="favorite">⭐</span>
            ) : (
              <span role="img" aria-label="not favorite">☆</span>
            )}
          </button>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 p-4 sm:p-8 text-white z-10 max-w-2xl">
            <div className="mb-2 text-xs sm:text-sm font-bold uppercase tracking-widest text-red-300 drop-shadow">Featured News</div>
            <h2 className="text-2xl md:text-3xl font-extrabold mb-3 drop-shadow-lg">
              <Link href={`/article/${article.slug}`}>{article.title}</Link>
            </h2>
            <p className="text-sm sm:text-lg font-medium mb-4 drop-shadow">{article.description}</p>
            <Link href={`/article/${article.slug}`} className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold px-4 sm:px-6 py-2 sm:py-3 rounded-full transition">
              Read More
            </Link>
          </div>
        </div>
      </section>
    </>
  );
} 