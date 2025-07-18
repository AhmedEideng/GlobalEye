"use client";
import Head from 'next/head';
import { sanitizeText, sanitizeJsonLd } from '@/utils/sanitizeText';

export default function ArticleHomeJsonLdHead() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": sanitizeText("GlobalEye News"),
    "url": "https://globaleye.live/",
    "description": sanitizeText("Get the latest breaking news, world headlines, business, technology, sports, health, and more. Trusted global news coverage, real-time updates, and in-depth analysis from GlobalEye News."),
    "publisher": {
      "@type": "Organization",
      "name": sanitizeText("GlobalEye News"),
      "logo": {
        "@type": "ImageObject",
        "url": "https://globaleye.live/favicon.ico.jpg"
      }
    }
  };
  return (
    <Head>
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(jsonLd) }} 
      />
    </Head>
  );
} 