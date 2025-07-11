import { fetchNews, NewsArticle, sortArticlesByUserPreferences } from './utils/fetchNews';
import HomeFeatured from '@components/HomeFeatured';
import HomeNewsGrid from '@components/HomeNewsGrid';
import BreakingNewsTickerController from '@components/BreakingNewsTickerController';
import type { Metadata } from 'next';
import ArticleHomeJsonLdHead from './ArticleHomeJsonLdHead';

export const revalidate = 180; // 3 دقائق

export const metadata: Metadata = {
  title: 'GlobalEye News | Breaking News, World Updates & Live Coverage',
  description: 'Get the latest breaking news, world headlines, business, technology, sports, health, and more. Trusted global news coverage, real-time updates, and in-depth analysis from GlobalEye News.',
  alternates: { canonical: 'https://globaleye.live/' },
  openGraph: {
    title: 'GlobalEye News | Breaking News, World Updates & Live Coverage',
    description: 'Get the latest breaking news, world headlines, business, technology, sports, health, and more. Trusted global news coverage, real-time updates, and in-depth analysis from GlobalEye News.',
    url: 'https://globaleye.live/',
    siteName: 'GlobalEye News',
    images: [
      { url: '/placeholder-news.jpg', width: 1200, height: 630, alt: 'GlobalEye News' }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GlobalEye News | Breaking News, World Updates & Live Coverage',
    description: 'Get the latest breaking news, world headlines, business, technology, sports, health, and more. Trusted global news coverage, real-time updates, and in-depth analysis from GlobalEye News.',
    images: ['/placeholder-news.jpg'],
    site: '@globaleyenews',
  },
};

export default async function HomePage() {
  // جلب الأخبار من السيرفر
  const allArticles: NewsArticle[] = await fetchNews();
  // ترتيب الأخبار (بدون تخصيص مستخدم هنا)
  const sortedArticles = allArticles;
  const featured = sortedArticles[0] || null;
  const restArticles = featured ? sortedArticles.filter(a => a.slug !== featured.slug) : sortedArticles;
  const articles = restArticles.slice(0, 51); // 51 خبر بجانب الرئيسي ليكون المجموع 52

  return (
    <>
      <ArticleHomeJsonLdHead />
      <BreakingNewsTickerController>
        <main>
          {featured && <HomeFeatured article={featured} />}
          {articles.length > 0 && <HomeNewsGrid articles={articles} />}
        </main>
      </BreakingNewsTickerController>
    </>
  );
} 