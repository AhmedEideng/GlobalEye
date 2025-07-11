"use client";

import React from 'react';
import Image from 'next/image';
import { sendAnalyticsEvent, fetchRelatedNews } from '../utils/fetchNews';
import Link from 'next/link';

// Helper function to generate slug (updated version)
function generateSlug(title: string, url: string): string {
  // Clean the title and remove special characters
  if (title && title.trim()) {
    const cleanTitle = title
      .toLowerCase()
      .trim()
      // Remove Arabic characters and special characters
      .replace(/[^\w\s-]/g, '')
      // Replace multiple spaces and dashes with a single dash
      .replace(/[\s\-]+/g, '-')
      // Remove dashes from the beginning and end
      .replace(/^-+|-+$/g, '')
      // Set the maximum length
      .slice(0, 50);
    
    // If the title is empty after cleaning, use hash from URL
    if (!cleanTitle) {
      return `article-${Math.abs(hashCode(url)).toString()}`;
    }
    
    // Add hash from URL to ensure uniqueness
    const urlHash = Math.abs(hashCode(url)).toString().slice(0, 8);
    return `${cleanTitle}-${urlHash}`;
  }
  
  // If there is no title, use hash from URL
  return `article-${Math.abs(hashCode(url)).toString()}`;
}

function hashCode(str: string): number {
  let hash = 0, i, chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

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
    console.log('بدء جلب الأخبار للتصنيف:', category);
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/news?category=${category}`, {
          cache: 'default', // Use browser cache
          headers: {
            'Accept': 'application/json',
          }
        });
        console.log('تم استلام الرد من API:', response.status);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('تم جلب البيانات:', data);
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
      } catch (err) {
        console.error('خطأ أثناء جلب الأخبار:', err);
        throw new Error('Failed to load news. Please try again.');
      } finally {
        setLoading(false);
        console.log('انتهى جلب الأخبار للتصنيف:', category);
      }
    };
    fetchData();
  }, [category, categoryLabel]);

  // حدد أول 52 خبر فقط
  const limitedArticles = articles.slice(0, 52);
  const featuredArticle = limitedArticles.length > 0 ? limitedArticles[0] : null;
  const restArticles = limitedArticles.length > 1 ? limitedArticles.slice(1) : [];

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
        <h2 className="text-2xl font-bold text-red-700 mb-4">حدثت مشكلة في تحميل الأخبار</h2>
        <p className="text-gray-600 mb-6">استغرق التحميل وقتًا طويلاً. حاول تحديث الصفحة أو تحقق من اتصالك بالإنترنت.</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>تحديث الصفحة</button>
      </div>
    );
  }

  if (!featuredArticle && articles.length === 0) {
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

      {featuredArticle && (
        <a href={`/article/${featuredArticle.slug || generateSlug(featuredArticle.title, featuredArticle.url)}`} className="article-card block featured-article mb-6 group cursor-pointer">
          <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden group-hover:opacity-90 transition-opacity duration-200">
            <Image
              src={featuredArticle.urlToImage || '/placeholder-news.svg'}
              alt={featuredArticle.title}
              fill
              className="object-cover w-full h-full"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          </div>
          <div className="featured-content">
            <div className="article-category">{categoryLabel.toUpperCase()}</div>
            <h1 className="featured-title text-xl sm:text-2xl md:text-3xl font-bold mb-2">
              {featuredArticle.title}
            </h1>
            <p className="featured-excerpt text-base sm:text-lg mb-2">{featuredArticle.description}</p>
            <div className="article-meta text-xs sm:text-sm flex flex-wrap gap-2 text-gray-500">
              <span>{featuredArticle.source.name}</span>
              <span>{new Date(featuredArticle.publishedAt).toLocaleDateString('en-GB')}</span>
            </div>
          </div>
        </a>
      )}

      {restArticles.length > 0 && (
        <section>
          <div className="section-header flex flex-col sm:flex-row items-center justify-between mb-4 gap-2">
            <h2 className="section-title text-lg sm:text-xl font-bold">All {categoryLabel} News</h2>
            <span className="article-count text-xs text-gray-400">{restArticles.length} articles</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
            {restArticles.map((article, index) => (
                <a key={index} href={`/article/${article.slug || generateSlug(article.title, article.url)}`} className="article-card group">
                  <div className="relative w-full h-48 overflow-hidden">
                    <Image
                      src={article.urlToImage || '/placeholder-news.svg'}
                      alt={article.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex flex-col justify-between h-full p-4">
                    <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-700 transition-colors duration-200">{article.title}</h2>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">{article.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-2 border-t border-gray-100">
                      <span className="truncate max-w-[60%]">{article.source.name}</span>
                      <span>{new Date(article.publishedAt).toLocaleDateString('en-GB')}</span>
                    </div>
                  </div>
                </a>
            ))}
          </div>
        </section>
      )}
      
      {/* Suggested Articles Section */}
      {suggestedArticles.length > 0 && (
        <section className="mt-12">
          <div className="section-header flex flex-col sm:flex-row items-center justify-between mb-6 gap-2">
            <h2 className="section-title text-xl sm:text-2xl font-bold">Suggested Articles</h2>
            <span className="article-count text-xs text-gray-400">{suggestedArticles.length} articles</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {suggestedArticles.map((article, idx) => (
              <Link
                key={article.slug + idx}
                href={`/article/${article.slug}`}
                className="article-card group"
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
                  <h3 className="article-title text-lg font-bold mb-2 line-clamp-2">{article.title}</h3>
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
    </div>
  );
} 