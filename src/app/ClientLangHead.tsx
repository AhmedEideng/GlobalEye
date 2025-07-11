"use client";
import { usePathname } from 'next/navigation';
import Script from 'next/script';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function ClientLangHead() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : usePathname() || '/';
  const isArabic = pathname.startsWith('/ar');
  const canonical = `https://globaleye.news${pathname}`;
  const hrefEn = `https://globaleye.news${pathname.replace(/^\/ar/, '')}`;
  const hrefAr = `https://globaleye.news/ar${pathname.replace(/^\/ar/, '')}`;

  return (
    <>
      <link rel="alternate" hrefLang="en" href={hrefEn} />
      <link rel="alternate" hrefLang="ar" href={hrefAr} />
      <link rel="canonical" href={canonical} />
      {GA_MEASUREMENT_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}');
            `}
          </Script>
        </>
      )}
    </>
  );
} 