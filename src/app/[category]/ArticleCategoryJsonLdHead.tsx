"use client";
import Head from 'next/head';
import { sanitizeText, sanitizeJson } from '@/utils/sanitizeText';

const categoryLabels: { [key: string]: string } = {
  'world': 'World News',
  'politics': 'Politics',
  'business': 'Business',
  'technology': 'Technology',
  'sports': 'Sports',
  'entertainment': 'Entertainment',
  'health': 'Health',
  'science': 'Science'
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
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: sanitizeJson(jsonLd) }} 
      />
    </Head>
  );
} 