"use client";
import Head from 'next/head';

export default function ArticlePrivacyJsonLdHead() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PrivacyPolicy",
    "name": "Privacy Policy | GlobalEye News",
    "description": "Read the privacy policy of GlobalEye News to understand how we protect your data and privacy.",
    "url": "https://globaleye.live/privacy",
    "mainEntityOfPage": "https://globaleye.live/privacy",
  };
  return (
    <Head>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </Head>
  );
} 