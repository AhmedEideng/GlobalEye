"use client";
import Head from 'next/head';
import { sanitizeText } from '@/utils/sanitizeText';

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/[^\x00-\x7F]/g, '') }} />
    </Head>
  );
} 