import { fetchNews, NewsArticle } from './utils/fetchNews';
import HomeFeatured from '@components/HomeFeatured';
import HomeNewsGrid from '@components/HomeNewsGrid';
import BreakingNewsTickerController from '@components/BreakingNewsTickerController';
import type { Metadata } from 'next';
import ArticleHomeJsonLdHead from './ArticleHomeJsonLdHead';
import Link from 'next/link';
import Image from 'next/image';

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
  const suggestedArticles = restArticles.slice(0, 40); // 40 خبر مقترح

  return (
    <>
      <ArticleHomeJsonLdHead />
      <BreakingNewsTickerController>
        <main>
          {featured && <HomeFeatured article={featured} />}
          {articles.length > 0 && <HomeNewsGrid articles={articles} />}
          {/* قسم الأخبار المقترحة */}
          {suggestedArticles.length > 0 && (
            <section className="mt-12 bg-gradient-to-br from-gray-100 via-white to-gray-50 rounded-2xl p-6 shadow-lg">
              <div className="mb-4">
                <h2 className="text-3xl font-extrabold mb-2 text-red-800 flex items-center gap-2">
                  <span role="img" aria-label="newspaper">📰</span>
                  Selected Articles for You
                </h2>
                <p className="text-gray-500 text-base border-b pb-2">We select the latest and most important news from our trusted sources for you</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {suggestedArticles.map((article, idx) => (
                  <Link
                    key={article.slug + idx}
                    href={`/article/${article.slug}`}
                    className="article-card group transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl rounded-xl bg-white shadow-md overflow-hidden"
                  >
                    <div className="relative w-full h-48 overflow-hidden">
                      <Image
                        src={article.urlToImage || "/placeholder-news.jpg"}
                        alt={article.title}
                        fill
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <div className="article-category text-xs font-bold mb-1 bg-red-600 text-white rounded-full px-3 py-1 inline-block">{article.source?.name}</div>
                      <h3 className="article-title text-lg font-bold mb-2 line-clamp-2 group-hover:text-red-700 transition-colors duration-200">{article.title}</h3>
                      <p className="article-excerpt text-gray-600 text-sm mb-2 line-clamp-2">{article.description}</p>
                      <div className="article-meta text-xs flex flex-wrap gap-2 text-gray-400">
                        <span className="flex items-center gap-1 text-gray-400">{new Date(article.publishedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        {article.author && <span>by {article.author}</span>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </main>
      </BreakingNewsTickerController>
    </>
  );
} 