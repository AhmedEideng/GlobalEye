import { fetchNews, NewsArticle, formatDate, getImageUrl } from '@utils/fetchNews';
import HomeFeatured from '@components/HomeFeatured';
import HomeNewsGrid from '@components/HomeNewsGrid';
import type { Metadata } from 'next';
import ArticleHomeJsonLdHead from './ArticleHomeJsonLdHead';
import Link from 'next/link';
import Image from 'next/image';
import React from 'react'; // Added missing import for React
import SafeText from '@components/SafeText';

export const revalidate = 180; // 3 minutes - will be overridden by rotation system

// Professional error logger for home page
function logHomeError(...args: unknown[]) {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.error('[HomePage]', ...args);
  }
  // In production, you can send errors to a monitoring service here
}

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

// Function to fetch rotated news
async function fetchRotatedNews(): Promise<{
  featured: NewsArticle | null;
  articles: NewsArticle[];
  suggestedArticles: NewsArticle[];
}> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/news-rotation?category=general`, {
      next: { revalidate: 180 }, // 3 minutes cache
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('fetchRotatedNews API response:', data);
    if (data && data.success && data.data && typeof data.data === 'object') {
      return {
        featured: data.data.featured || null,
        articles: data.data.mainArticles || [],
        suggestedArticles: data.data.suggestedArticles || []
      };
    }
    // إذا كانت الاستجابة لا تحتوي على الحقول المطلوبة، أعد قيم فارغة بدل رمي خطأ
    return {
      featured: null,
      articles: [],
      suggestedArticles: []
    };
  } catch (error) {
    logHomeError('Failed to fetch rotated news:', error);
    // Fallback to direct fetch
    const allArticles: NewsArticle[] = await fetchNews(); // الآن تجلب فقط من Supabase
    const sortedArticles = allArticles;
    const featured = sortedArticles[0] || null;
    const restArticles = featured ? sortedArticles.filter(a => a.slug !== featured.slug) : sortedArticles;
    const articles = restArticles.slice(0, 51);
    const suggestedArticles = restArticles.slice(0, 40);
    
    return {
      featured,
      articles,
      suggestedArticles
    };
  }
}

// Move renderSuggestedArticle outside HomePage to avoid calling useCallback in an async function
const renderSuggestedArticle = (article: NewsArticle, idx: number) => {
  // Memoize date formatting to avoid creating new Date objects on every render
  const formattedDate = formatDate(article.publishedAt);

  return (
    <React.Fragment key={article.slug || idx}>
      <Link
        href={`/article/${article.slug}`}
        className="article-card group transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl rounded-xl bg-white shadow-md overflow-hidden"
      >
        <div className="relative w-full h-48 overflow-hidden">
          <Image
            src={getImageUrl(article.urlToImage)}
            alt={article.title}
            fill
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-4">
          <div className="article-category text-xs font-bold mb-1 bg-red-600 text-white rounded-full px-3 py-1 inline-block"><SafeText fallback="Unknown Source">{article.source?.name}</SafeText></div>
          <h3 className="article-title text-lg font-bold mb-2 line-clamp-2 group-hover:text-red-700 transition-colors duration-200"><SafeText fallback="Untitled">{article.title}</SafeText></h3>
          <p className="article-excerpt text-gray-600 text-sm mb-2 line-clamp-2"><SafeText fallback="No description available">{article.description}</SafeText></p>
          <div className="article-meta text-xs flex flex-wrap gap-2 text-gray-400">
            <span className="flex items-center gap-1 text-gray-400">{formattedDate}</span>
            {article.author && <span>by <SafeText fallback="Unknown Author">{article.author}</SafeText></span>}
          </div>
        </div>
      </Link>
    </React.Fragment>
  );
};

export default async function HomePage() {
  // Fetch rotated news with automatic 3-hour rotation
  const { featured, articles, suggestedArticles } = await fetchRotatedNews();

  return (
    <>
      <ArticleHomeJsonLdHead />
      <main>
          {featured && <HomeFeatured article={featured} />}
          {articles.length > 0 && <HomeNewsGrid articles={articles} />}
          {/* قسم الأخبار المقترحة */}
          {suggestedArticles.length > 0 ? (
            <section className="mt-12 bg-gradient-to-br from-gray-100 via-white to-gray-50 rounded-2xl p-6 shadow-lg">
              <div className="mb-4">
                <h2 className="text-3xl font-extrabold mb-2 text-red-800 flex items-center gap-2">
                  <span role="img" aria-label="newspaper">📰</span>
                  Selected Articles for You
                </h2>
                <p className="text-gray-500 text-base border-b pb-2">We select the latest and most important news from our trusted sources for you</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {suggestedArticles.map(renderSuggestedArticle)}
              </div>
            </section>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-500 py-12">
              <span className="text-4xl mb-4">📰</span>
              <div className="text-lg font-semibold mb-2">No suggested articles found.</div>
              <div className="mb-6">Try browsing other categories or check back later for more suggestions.</div>
              <Link href="/" className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-full transition">Back to Home</Link>
            </div>
          )}
        </main>
    </>
  );
} 