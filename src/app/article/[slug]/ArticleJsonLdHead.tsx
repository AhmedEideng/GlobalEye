"use client";
import Head from 'next/head';
import { NewsArticle } from '@utils/fetchNews';
import { sanitizeText, sanitizeJsonLd } from '@/utils/sanitizeText';

export default function ArticleJsonLdHead({ article }: { article: NewsArticle | null }) {
  if (!article) return null;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": sanitizeText(article.title),
    "image": [article.urlToImage || 'https://globaleye.live/placeholder-news.jpg'],
    "datePublished": article.publishedAt,
    "author": article.author ? [{ "@type": "Person", "name": sanitizeText(article.author) }] : undefined,
    "publisher": {
      "@type": "Organization",
      "name": sanitizeText(article.source?.name || 'GlobalEye News'),
      "logo": {
        "@type": "ImageObject",
        "url": 'https://globaleye.live/favicon.ico.jpg',
      },
    },
    "mainEntityOfPage": `https://globaleye.live/article/${article.slug}`,
    "url": `https://globaleye.live/article/${article.slug}`,
    "description": sanitizeText(article.description || article.title),
  };
  return (
    <Head>
      {/* skipcq: JS-0440 - Usage of dangerouslySetInnerHTML is required for SEO JSON-LD and is sanitized. */}
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(jsonLd) }} 
      />
    </Head>
  );
} 