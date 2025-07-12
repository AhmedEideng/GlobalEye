"use client";
import Head from 'next/head';
import { sanitizeText } from '@/utils/sanitizeText';

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/[^\x00-\x7F]/g, '') }} />
    </Head>
  );
} 