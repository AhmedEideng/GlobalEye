import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { NewsArticle } from '@utils/fetchNews';
import { useAuth } from '@hooks/useAuth';
import { isFavorite } from '@services/favorites';
import { sanitizeText, sanitizeJsonLd } from '../utils/sanitizeText';

export default function ArticleHeader({ article }: { article: NewsArticle }) {
  const { user } = useAuth();

  React.useEffect(() => {
    if (user) {
      const checkFavorite = async () => {
        await isFavorite(user.id, article.slug);
      };
      checkFavorite();
    }
  }, [user, article.slug]);

  // Generate structured data (JSON-LD)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: sanitizeText(article.title),
    description: sanitizeText(article.description),
    datePublished: article.publishedAt,
    image: article.urlToImage ? [article.urlToImage] : undefined,
    author: article.author ? [{ '@type': 'Person', name: sanitizeText(article.author) }] : undefined,
    publisher: {
      '@type': 'Organization',
      name: sanitizeText(article.source?.name) || 'Source',
      logo: {
        '@type': 'ImageObject',
        url: '/favicon.ico.jpg',
      },
    },
    mainEntityOfPage: article.url,
    url: article.url,
  };

  return (
    <>
      <Head>
        {/* skipcq: JS-0440 - JSON-LD structured data requires dangerouslySetInnerHTML for SEO */}
        <script 
          type="application/ld+json" 
          dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(jsonLd) }} 
        />
      </Head>
      {/* Main Image */}
      {article.urlToImage && (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-6">
          <Image
            src={article.urlToImage || '/placeholder-news.jpg'}
            alt={article.title}
            fill
            className="object-cover w-full h-full"
            priority
            sizes="100vw"
          />
        </div>
      )}
      {/* Title & Meta */}
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100 break-words">
          {sanitizeText(article.title)}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" /></svg>
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.682l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>
            <span>{new Date(article.publishedAt).toLocaleDateString('en-GB', { 
              day: '2-digit', 
              month: 'short', 
              year: 'numeric' 
            })}</span>
          </div>
          {article.author && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-4.418 0-8 1.79-8 4v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2c0-2.21-3.582-4-8-4z"/></svg>
              <span>{sanitizeText(article.author)}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
              {sanitizeText(article.source?.name)}
            </span>
          </div>
        </div>
      </div>
    </>
  );
} 