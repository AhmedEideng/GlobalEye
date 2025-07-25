"use client";
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import Head from 'next/head';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function ClientLangHead() {
  const pathname = usePathname() || '/';
  const canonical = `https://globaleye.live${pathname}`;
  const hrefEn = `https://globaleye.live${pathname.replace(/^\/ar/, '')}`;
  const hrefAr = `https://globaleye.live/ar${pathname.replace(/^\/ar/, '')}`;

  return (
    <Head>
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
    </Head>
  );
} 