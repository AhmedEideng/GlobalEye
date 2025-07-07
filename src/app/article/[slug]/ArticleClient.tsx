"use client";
import { NewsArticle } from '../../utils/fetchNews';
import ArticleHeader from '@components/ArticleHeader';
import ArticleContent from '@components/ArticleContent';
import ShareButtons from '@components/ShareButtons';
import { useEffect } from 'react';
import { sendAnalyticsEvent } from '../../utils/fetchNews';
import Link from 'next/link';

export default function ArticleClient({ article, slug }: { article: NewsArticle | null, slug: string }) {
  useEffect(() => {
    if (article) {
      sendAnalyticsEvent('view_article', {
        slug: article.slug,
        category: article.category,
        source: article.source?.name || '',
      });
    }
  }, [article]);

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4 text-red-700">Article Not Found</h1>
        <p className="text-lg text-gray-500 mb-6">
          Sorry, we couldn&apos;t find the article you are looking for.
          <br />
          <span className="text-sm text-gray-400">Slug: {slug}</span>
        </p>
        <div className="space-y-4">
          <Link href="/world" className="btn btn-primary">Back to World News</Link>
          <br />
          <Link href="/politics" className="btn btn-secondary">Browse Politics News</Link>
          <br />
          <Link href="/world" className="btn btn-secondary">Browse World News</Link>
        </div>
      </div>
    );
  }

  return (
    <article className="w-full max-w-screen-xl mx-auto px-2 sm:px-4 py-6 md:py-10">
      <ArticleHeader article={article} />
      <ArticleContent article={article} />
      {/* Read Full Article Button */}
      <div className="flex justify-center my-8">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-full shadow transition text-base sm:text-lg"
          onClick={() => sendAnalyticsEvent('outbound_click', { url: article.url, slug: article.slug })}
        >
          Read on the official website
        </a>
      </div>
      {/* Share Buttons */}
      <ShareButtons url={`/article/${article.slug}`} title={article.title} />
    </article>
  );
} 