"use client";

import React from 'react';
import Image from 'next/image';
import { sendAnalyticsEvent, fetchRelatedNews } from '../utils/fetchNews';
import Link from 'next/link';
import HomeFeatured from '@components/HomeFeatured';
import HomeNewsGrid from '@components/HomeNewsGrid';
import { NewsArticle } from '../utils/fetchNews';

interface Article {
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: { name: string };
  category?: string;
  slug: string;
  author?: string | null;
}

const categoryLabels: { [key: string]: string } = {
  'world': 'World News',
  'politics': 'Politics',
  'business': 'Business',
  'technology': 'Technology',
  'sports': 'Sports',
  'entertainment': 'Entertainment',
  'health': 'Health',
  'science': 'Science'
};

export default function CategoryClient({ category }: { category: string }) {
  const categoryLabel = categoryLabels[category] || category;
  const [articles, setArticles] = React.useState<Article[]>([]);
  const [suggestedArticles, setSuggestedArticles] = React.useState<Article[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [timeout, setTimeoutReached] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setTimeoutReached(true), 5000);
    return () => clearTimeout(t);
  }, []);

  React.useEffect(() => {
    setLoading(true);
    // Removed all console.log and console.error lines
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/news?category=${category}`, {
          cache: 'default', // Use browser cache
          headers: {
            'Accept': 'application/json',
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.articles && data.articles.length > 0) {
          setArticles(data.articles);
          // Track category visit when page loads
          sendAnalyticsEvent('view_category', { category });
          // Fetch suggested articles from the same category
          if (data.articles.length > 0) {
            const firstArticle = data.articles[0];
            const relatedArticles = await fetchRelatedNews(firstArticle, category);
            setSuggestedArticles(relatedArticles.slice(0, 20)); // Get up to 20 suggested articles
          }
        } else {
          throw new Error(`No news available in the "${categoryLabel}" category. Please try again.`);
        }
      } catch {
        throw new Error('Failed to load news. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [category, categoryLabel]);

  // Limit to first 52 articles only
  const limitedArticles = articles.slice(0, 52);
  const featured = limitedArticles[0] || null;
  const restArticles = featured ? limitedArticles.filter(a => a.slug !== featured.slug) : limitedArticles;
  const mainArticles = restArticles.slice(0, 51);
  const suggested = suggestedArticles.slice(0, 40);

  // تحويل Article[] إلى NewsArticle[] بإضافة content فارغ إذا لم يكن موجودًا
  const toNewsArticle = (a: Article): NewsArticle => ({
    source: { id: null, name: a.source?.name || '' },
    author: a.author || '',
    title: a.title,
    description: a.description || '',
    url: a.url,
    urlToImage: a.urlToImage || '',
    publishedAt: a.publishedAt,
    content: '',
    slug: a.slug,
    category: a.category || '',
  });
  const featuredNews = featured ? toNewsArticle(featured) : null;
  const mainNews = mainArticles.map(toNewsArticle);
  const suggestedNews = suggested.map(toNewsArticle);

  if (loading && !timeout) {
    return (
      <div className="loading flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading {categoryLabel} news...</h2>
          <p className="text-gray-500 mt-2">Please wait while we fetch the latest updates</p>
        </div>
      </div>
    );
  }
  if (loading && timeout) {
    return (
      <div className="error text-center py-8">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Failed to load news</h2>
        <p className="text-gray-600 mb-6">Loading took too long. Try refreshing the page or check your internet connection.</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Refresh Page</button>
      </div>
    );
  }

  if (!featured && articles.length === 0) {
    return (
      <div className="error text-center py-8">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">No news available in {categoryLabel}</h2>
        <p className="text-gray-600 mb-6">No news articles found in the {categoryLabel} category at the moment.</p>
        <button 
          className="btn btn-primary"
          onClick={() => window.location.reload()}
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="category-page max-w-screen-xl mx-auto px-2 sm:px-4">
      {/* <AdsterraBanner728x90 /> */}
      <div className="category-header text-center mb-6">
        <h1
          className="category-title text-3xl sm:text-4xl md:text-6xl font-extrabold mb-2 tracking-tight text-red-700 break-words"
          style={{
            fontFamily: `'Playfair Display', 'Merriweather', serif`,
            textShadow: '0 2px 16px rgba(220,38,38,0.10)',
          }}
        >
          {categoryLabel}
          <span className="block h-1 w-16 mx-auto mt-2 bg-gradient-to-r from-red-600 via-red-400 to-yellow-400 rounded-full"></span>
        </h1>
        <p className="category-description text-base sm:text-lg md:text-xl text-gray-500 mt-3 font-medium max-w-2xl mx-auto">
          Stay updated with the latest, most important, and trending news in <span className="text-red-600 font-semibold">{categoryLabel}</span> from trusted sources around the world.
        </p>
      </div>

      {/* Featured Article */}
      {featuredNews && <HomeFeatured article={featuredNews} />}
      {/* Main News Grid */}
      {mainNews.length > 0 && <HomeNewsGrid articles={mainNews} />}
      {/* Suggested Articles Section */}
      {suggestedNews.length > 0 && (
        <section className="mt-12 bg-gradient-to-br from-gray-100 via-white to-gray-50 rounded-2xl p-6 shadow-lg">
          <div className="mb-4">
            <h2 className="text-3xl font-extrabold mb-2 text-red-800 flex items-center gap-2">
              <span role="img" aria-label="newspaper">📰</span>
              Selected Articles for You
            </h2>
            <p className="text-gray-500 text-base border-b pb-2">We select the latest and most important news from our trusted sources for you</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {suggestedNews.map((article, idx) => (
              <React.Fragment key={article.slug || `suggested-${idx}-${article.url}`}> 
                <Link
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
              </React.Fragment>
            ))}
          </div>
        </section>
      )}
    </div>
  );
} 