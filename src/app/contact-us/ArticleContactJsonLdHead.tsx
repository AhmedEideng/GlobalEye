"use client";
import Head from 'next/head';

export default function ArticleContactJsonLdHead() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact Us | GlobalEye News",
    "description": "Contact GlobalEye News for inquiries, feedback, or support. We value your input and are here to help.",
    "url": "https://globaleye.live/contact-us",
    "mainEntityOfPage": "https://globaleye.live/contact-us",
  };
  return (
    <Head>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </Head>
  );
} 