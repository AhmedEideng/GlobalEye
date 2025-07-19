"use client";
import Head from 'next/head';
import { sanitizeText, sanitizeJsonLd } from '@/utils/sanitizeText';

export default function ArticlePrivacyJsonLdHead() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PrivacyPolicy",
    "name": sanitizeText("Privacy Policy | GlobalEye News"),
    "description": sanitizeText("Read the privacy policy of GlobalEye News to understand how we protect your data and privacy."),
    "url": "https://globaleye.live/privacy",
    "mainEntityOfPage": "https://globaleye.live/privacy",
  };
  return (
    <Head>
      {/* skipcq: JS-0440 - Usage of dangerouslySetInnerHTML is required for SEO JSON-LD and is sanitized. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(jsonLd) }} />
    </Head>
  );
} 