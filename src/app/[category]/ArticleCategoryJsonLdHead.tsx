"use client";
import Head from 'next/head';
import { sanitizeText, sanitizeJsonLd } from '@/utils/sanitizeText';

const categoryLabels: { [key: string]: string } = {
  'world': 'World News',
  'business': 'Business',
  'technology': 'Technology',
  'sports': 'Sports',
  'entertainment': 'Entertainment',
  'health': 'Health',
  'science': 'Science',
  'politics': 'Politics',
  'general': 'General'
};

export default function ArticleCategoryJsonLdHead({ category }: { category: string }) {
  const label = categoryLabels[category] || category;
  const url = `https://globaleye.live/${category}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": sanitizeText(label),
    "description": sanitizeText(`Stay updated with the latest, most important, and trending news in ${label} from trusted sources around the world.`),
    "url": url,
    "mainEntityOfPage": url,
  };
  return (
    <Head>
      {/* skipcq: JS-0440 - JSON-LD structured data requires dangerouslySetInnerHTML for SEO */}
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(jsonLd) }} 
      />
    </Head>
  );
} 