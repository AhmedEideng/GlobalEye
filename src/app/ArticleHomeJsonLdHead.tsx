"use client";
import Head from 'next/head';

export default function ArticleHomeJsonLdHead() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "GlobalEye News",
    "url": "https://globaleye.live/",
    "description": "Get the latest breaking news, world headlines, business, technology, sports, health, and more. Trusted global news coverage, real-time updates, and in-depth analysis from GlobalEye News.",
    "publisher": {
      "@type": "Organization",
      "name": "GlobalEye News",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/[^\x00-\x7F]/g, '') }} 
      />
    </Head>
  );
} 