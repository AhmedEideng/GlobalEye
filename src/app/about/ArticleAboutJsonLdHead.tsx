"use client";
import Head from 'next/head';
import { sanitizeText } from '@/utils/sanitizeText';

export default function ArticleAboutJsonLdHead() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": sanitizeText("About Us | GlobalEye News"),
    "description": sanitizeText("Learn more about GlobalEye News, our mission, and our team dedicated to delivering trusted global news coverage."),
    "url": "https://globaleye.live/about",
    "mainEntityOfPage": "https://globaleye.live/about",
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