"use client";
import Link from "next/link";
import { NewsArticle } from '@utils/fetchNews';
import { cleanImageUrl } from '@utils/cleanImageUrl';
import Image from "next/image";
import React from "react";

const HomeNewsGrid = React.memo(({ articles }: { articles: NewsArticle[] }) => {
  const renderArticle = React.useCallback((article: NewsArticle, idx: number) => {
    const cleanImage = cleanImageUrl(article.urlToImage);
    return (
      <Link
        key={article.slug || `article-${idx}-${article.url}`}
        href={`/article/${article.slug}`}
        className="article-card group"
      >
        <div className="relative w-full h-48 overflow-hidden">
          <Image
            src={cleanImage || "/placeholder-news.jpg"}
            alt={article.title}
            fill
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading={idx < 6 ? "eager" : "lazy"}
          />
        </div>
        <div className="p-4">
          <div className="article-category text-xs font-bold mb-1 bg-red-600 text-white rounded-full px-3 py-1 inline-block">
            {article.source?.name}
          </div>
          <h3 className="article-title text-lg font-bold mb-2 line-clamp-2">
            {article.title}
          </h3>
          <p className="article-excerpt text-gray-600 text-sm mb-2 line-clamp-2">
            {article.description}
          </p>
          <div className="article-meta text-xs flex flex-wrap gap-2 text-gray-400">
            <span className="flex items-center gap-1 text-gray-400">
              {new Date(article.publishedAt).toLocaleDateString('en-GB', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
              })}
            </span>
            {article.author && <span>by {article.author}</span>}
          </div>
        </div>
      </Link>
    );
  }, []);

  if (!articles?.length) return null;

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