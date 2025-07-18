"use client";
import { NewsArticle } from '@utils/fetchNews';
import ArticleHeader from '@components/ArticleHeader';
import ArticleContent from '@components/ArticleContent';
import ShareButtons from '@components/ShareButtons';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { sendAnalyticsEvent, fetchRelatedNews } from '@utils/fetchNews';
import Link from 'next/link';
import React from 'react';

export default function ArticleClient({ article, slug }: { article: NewsArticle | null, slug: string }) {
  const [relatedArticles, setRelatedArticles] = useState<NewsArticle[]>([]);
  const renderRelatedArticle = React.useCallback((related: NewsArticle, idx: number) => (
    <React.Fragment key={related.slug || `related-${idx}-${related.url}`}> 
      <Link
        href={`/article/${related.slug}`}
        className="article-card group transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl rounded-xl bg-white shadow-md overflow-hidden"
      >
        <div className="relative w-full h-48 overflow-hidden">
          <Image
            src={related.urlToImage || "/placeholder-news.jpg"}
            alt={related.title}
            fill
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-4">
          <div className="article-category text-xs font-bold mb-1 bg-red-600 text-white rounded-full px-3 py-1 inline-block">{related.source?.name}</div>
          <h3 className="article-title text-lg font-bold mb-2 line-clamp-2 group-hover:text-red-700 transition-colors duration-200">{related.title}</h3>
          <p className="article-excerpt text-gray-600 text-sm mb-2 line-clamp-2">{related.description}</p>
          <div className="article-meta text-xs flex flex-wrap gap-2 text-gray-400">
            <span className="flex items-center gap-1 text-gray-400">{new Date(related.publishedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            {related.author && <span>by {related.author}</span>}
          </div>
        </div>
      </Link>
    </React.Fragment>
  ), []);

  useEffect(() => {
    if (article) {
      sendAnalyticsEvent('view_article', {
        slug: article.slug,
        category: article.category,
        source: article.source?.name || '',
      });
      // Fetch related articles (at least 20) with error handling
      const fetchAndSetRelatedArticles = async () => {
        try {
          const res = await fetchRelatedNews(article, article.category);
          setRelatedArticles(res.slice(0, 20));
        } catch {
          // Optionally log or handle the error
        }
      };
      fetchAndSetRelatedArticles();
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
      {/* Suggested Articles Section */}
      {relatedArticles.length > 0 && (
        <section className="mt-12 bg-gradient-to-br from-gray-100 via-white to-gray-50 rounded-2xl p-6 shadow-lg">
          <div className="mb-4">
            <h2 className="text-2xl font-extrabold mb-2 text-red-800 flex items-center gap-2">
              <span role="img" aria-label="newspaper">📰</span>
              Related Articles
            </h2>
            <p className="text-gray-500 text-base border-b pb-2">More news you might like</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {relatedArticles.map(renderRelatedArticle)}
          </div>
        </section>
      )}
    </article>
  );
} 