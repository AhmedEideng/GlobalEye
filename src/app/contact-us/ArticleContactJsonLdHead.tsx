"use client";
import Head from 'next/head';
import { sanitizeText, sanitizeJson } from '@/utils/sanitizeText';

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
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: sanitizeJson(jsonLd) }} 
      />
    </Head>
  );
} 