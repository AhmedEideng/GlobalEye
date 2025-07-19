"use client";
import Head from 'next/head';
import { sanitizeText, sanitizeJsonLd } from '@/utils/sanitizeText';

export default function ArticleContactJsonLdHead() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": sanitizeText("Contact Us | GlobalEye News"),
    "description": sanitizeText("Contact GlobalEye News for inquiries, feedback, or support. We value your input and are here to help."),
    "url": "https://globaleye.live/contact-us",
    "mainEntityOfPage": "https://globaleye.live/contact-us",
  };
  return (
    <Head>
      {/* skipcq: JS-0440 - Usage of dangerouslySetInnerHTML is required for SEO JSON-LD and is sanitized. */}
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(jsonLd) }} 
      />
    </Head>
  );
} 