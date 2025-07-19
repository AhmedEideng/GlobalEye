"use client";
import Head from 'next/head';
import { sanitizeText, sanitizeJsonLd } from '@/utils/sanitizeText';

export default function ArticleTermsJsonLdHead() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TermsOfService",
    "name": sanitizeText("Terms and Conditions | GlobalEye News"),
    "description": sanitizeText("Read the terms and conditions for using GlobalEye News and our services."),
    "url": "https://globaleye.live/terms-and-conditions",
    "mainEntityOfPage": "https://globaleye.live/terms-and-conditions",
  };
  return (
    <Head>
      {/* skipcq: JS-0440 - JSON-LD structured data requires dangerouslySetInnerHTML for SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(jsonLd) }} />
    </Head>
  );
} 