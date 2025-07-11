import { useState, useEffect } from 'react';
import Image from 'next/image';
import { NewsArticle, sendAnalyticsEvent } from '@utils/fetchNews';
import { cleanImageUrl } from '@utils/cleanImageUrl';
import { useAuth } from '@hooks/useAuth';
import { addFavorite, removeFavorite, isFavorite } from '@services/favorites';
import Head from 'next/head';

/**
 * ArticleHeader component displays the main image, title, author, source, and published date for an article.
 * @param article - NewsArticle object containing article data
 */
export default function ArticleHeader({ article }: { article: NewsArticle }) {
  const { user } = useAuth();
  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      isFavorite(user.id, article.slug).then(setFavorite);
    }
  }, [user, article.slug]);

  const handleToggleFavorite = async () => {
    if (!user) return;
    setLoading(true);
    if (favorite) {
      await removeFavorite(user.id, article.slug);
      setFavorite(false);
      sendAnalyticsEvent('favorite_remove', { slug: article.slug, category: article.category, source: article.source?.name || '' });
    } else {
      await addFavorite(user.id, article.slug);
      setFavorite(true);
      sendAnalyticsEvent('favorite_add', { slug: article.slug, category: article.category, source: article.source?.name || '' });
    }
    setLoading(false);
  };

  // توليد structured data (JSON-LD)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    image: article.urlToImage ? [article.urlToImage] : undefined,
    author: article.author ? [{ '@type': 'Person', name: article.author }] : undefined,
    publisher: {
      '@type': 'Organization',
      name: article.source?.name || 'مصدر',
      logo: {
        '@type': 'ImageObject',
        url: '/favicon.ico.jpg',
      },
    },
    mainEntityOfPage: article.url,
    url: article.url,
    // المصادر الإضافية (إن وجدت) في نهاية المقال
  };

  return (
    <>
      <Head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </Head>
      {/* Main Image */}
      {article.urlToImage && (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-6">
          <Image
            src={cleanImageUrl(article.urlToImage) || '/placeholder-news.jpg'}
            alt={article.title}
            fill
            className="object-cover w-full h-full"
            priority
            sizes="100vw"
          />
        </div>
      )}
      {/* Title & Meta */}
      <div className="flex items-center gap-2 mb-4">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight break-words text-balance w-full">
          {article.title}
        </h1>
        {user && (
          <button
            onClick={handleToggleFavorite}
            disabled={loading}
            className={`ml-2 p-2 rounded-full border transition ${favorite ? 'bg-red-100 border-red-300' : 'bg-gray-100 border-gray-200 hover:bg-gray-200'}`}
            title={favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {favorite ? (
              <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" /></svg>
            ) : (
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.682l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>
            )}
          </button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-500">
        <span className="font-semibold text-red-600">{article.source.name}</span>
        {article.author && (
          <span className="flex items-center gap-1 text-gray-700 bg-gray-100 rounded px-2 py-1">
            <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-4.418 0-8 1.79-8 4v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2c0-2.21-3.582-4-8-4z"/></svg>
            <span className="font-medium">{article.author}</span>
          </span>
        )}
        <span>{formatDate(article.publishedAt)}</span>
      </div>
    </>
  );
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
} 