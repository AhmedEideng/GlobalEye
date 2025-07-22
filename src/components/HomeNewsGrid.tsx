"use client";
import Link from "next/link";
import { NewsArticle } from '@utils/fetchNews';
import { getImageUrl } from '@utils/fetchNews';
import { formatDate } from '@utils/fetchNews';
import React from "react";
import SafeText from './SafeText';
import OptimizedImage from './OptimizedImage';

const HomeNewsGrid = React.memo(({ articles }: { articles: NewsArticle[] }) => {
  const renderArticle = React.useCallback((article: NewsArticle, idx: number) => {
    const imageSrc = getImageUrl(article.urlToImage);
    // Format date outside of the callback to avoid hooks rules violation
    const formattedDate = formatDate(article.publishedAt);
    return (
      <Link
        key={article.slug || idx}
        href={`/article/${article.slug}`}
        className="article-card group"
      >
        <div className="relative w-full h-48 overflow-hidden">
          {imageSrc && (
            <OptimizedImage
              src={imageSrc}
              alt={article.title}
              fill
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={idx < 6}
            />
          )}
        </div>
        <div className="p-4">
          <div className="article-category text-xs font-bold mb-1 bg-red-600 text-white rounded-full px-3 py-1 inline-block">
            <SafeText fallback="Unknown Source">{article.source?.name}</SafeText>
          </div>
          <h3 className="article-title text-lg font-bold mb-2 line-clamp-2">
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
  }, []);

  if (!articles?.length) {
    return (
      <div className="flex flex-col items-center justify-center text-gray-500 py-12">
        <span className="text-4xl mb-4">📰</span>
        <div className="text-lg font-semibold mb-2">No articles found.</div>
        <div className="mb-6">Try searching for something else or browse other categories.</div>
        <Link href="/" className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-full transition">Back to Home</Link>
      </div>
    );
  }

  return (
    <section className="mt-12 bg-gradient-to-br from-gray-100 via-white to-gray-50 rounded-2xl p-6 shadow-lg">
      <div className="mb-4">
        <h2 className="text-3xl font-extrabold mb-2 text-red-800 flex items-center gap-2">
          <span role="img" aria-label="newspaper">📰</span>
          Latest News
        </h2>
        <p className="text-gray-500 text-base border-b pb-2">
          Stay updated with the latest breaking news from around the world
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {articles.map(renderArticle)}
      </div>
    </section>
  );
});

HomeNewsGrid.displayName = 'HomeNewsGrid';

export default HomeNewsGrid; 