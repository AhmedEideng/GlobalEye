"use client";
import Head from 'next/head';
import { NewsArticle } from '../../utils/fetchNews';

export default function ArticleJsonLdHead({ article }: { article: NewsArticle | null }) {
  if (!article) return null;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "image": [article.urlToImage || 'https://globaleye.live/placeholder-news.jpg'],
    "datePublished": article.publishedAt,
    "author": article.author ? [{ "@type": "Person", "name": article.author }] : undefined,
    "publisher": {
      "@type": "Organization",
      "name": article.source?.name || 'GlobalEye News',
      "logo": {
        "@type": "ImageObject",
        "url": 'https://globaleye.live/favicon.ico.jpg',
      },
    },
    "mainEntityOfPage": `https://globaleye.live/article/${article.slug}`,
    "url": `https://globaleye.live/article/${article.slug}`,
    "description": article.description || article.title,
  };
  return (
    <Head>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </Head>
  );
} 