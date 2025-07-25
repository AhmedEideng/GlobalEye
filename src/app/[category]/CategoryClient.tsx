"use client";

import React from 'react';
import OptimizedImage from '@components/OptimizedImage';
import { sendAnalyticsEvent } from '@utils/fetchNews';
import Link from 'next/link';
import HomeFeatured from '@components/HomeFeatured';
import HomeNewsGrid from '@components/HomeNewsGrid';
import { NewsArticle, formatDate, getImageUrl } from '@utils/fetchNews';
import SafeText from '@components/SafeText';
import { useAuth } from '@hooks/useAuth';
import { useRouter } from 'next/navigation';
import { isFavorite, addFavorite, removeFavorite } from '@/services/favorites';
import { trackEvent } from '@/utils/analytics';

// Professional error logger for category client
function logCategoryError(...args: unknown[]) {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.error('[CategoryClient]', ...args);
  }
  // In production, you can send errors to a monitoring service here
}

interface Article {
  title: string;
  description: string | null;
  url: string;
  image_url: string | null;
  published_at: string;
  source: { name: string };
  category?: string; // category name/label
  category_id?: number | null; // category numeric id
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

interface CategoryClientProps {
  category: string;
  initialFeatured?: NewsArticle | null;
  initialArticles?: NewsArticle[];
  initialSuggested?: NewsArticle[];
}

// Move helpers outside the component
function toArticle(newsArticle: NewsArticle): Article {
  const hasCategoryId = (obj: unknown): obj is { category_id: number } =>
    typeof (obj as { category_id?: unknown }).category_id === 'number';
  return {
    title: newsArticle.title,
    description: newsArticle.description,
    url: newsArticle.url,
    image_url: newsArticle.image_url,
    published_at: newsArticle.published_at,
    source: { name: newsArticle.source?.name || '' },
    category: newsArticle.category,
    category_id: hasCategoryId(newsArticle) ? newsArticle.category_id : null,
    slug: newsArticle.slug,
    author: newsArticle.author
  };
}

function renderSuggestedArticle(article: Article, idx: number, favStates: Record<string, boolean>, favLoading: string | null, handleToggleFavorite: (slug: string) => void): React.ReactNode {
  const formattedDate = formatDate(article.published_at);
  return (
    <React.Fragment key={article.slug || idx}>
      <Link
        href={`/article/${article.slug}`}
        className="article-card group transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl rounded-xl bg-white shadow-md overflow-hidden relative"
        onClick={() => trackEvent('view_article', { slug: article.slug, title: article.title, category: article.category })}
      >
        <div className="relative w-full h-48 overflow-hidden">
          <OptimizedImage
            src={getImageUrl(article.image_url)}
            alt={article.title}
            fill
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
          {/* Favorite button */}
          <button
            type="button"
            className="absolute top-2 right-2 z-10 bg-white/80 rounded-full p-2 shadow hover:bg-yellow-100 transition-opacity opacity-0 group-hover:opacity-100"
            title={favStates[article.slug] ? 'Remove from favorites' : 'Add to favorites'}
            onClick={e => { e.preventDefault(); e.stopPropagation(); handleToggleFavorite(article.slug); }}
            disabled={favLoading === article.slug}
          >
            {favStates[article.slug] ? (
              <span role="img" aria-label="favorite">⭐</span>
            ) : (
              <span role="img" aria-label="not favorite">☆</span>
            )}
          </button>
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
}

export default function CategoryClient({ 
  category, 
  initialFeatured, 
  initialArticles, 
  initialSuggested 
}: CategoryClientProps) {
  const categoryLabel = categoryLabels[category] || category;
  const [articles, setArticles] = React.useState<Article[]>(initialArticles?.map(toArticle) || []);
  const [suggestedArticles, setSuggestedArticles] = React.useState<Article[]>(initialSuggested?.map(toArticle) || []);
  const [featured, setFeatured] = React.useState<Article | null>(initialFeatured ? toArticle(initialFeatured) : null);
  const [loading, setLoading] = React.useState(false);
  const [timeout, setTimeoutReached] = React.useState(false);
  const [lastRotation, setLastRotation] = React.useState<number>(Date.now());
  const [hasNewNews, setHasNewNews] = React.useState(false);
  const pendingArticlesRef = React.useRef<Article[]>([]);
  const latestSlugRef = React.useRef<string>(articles[0]?.slug || "");
  const { user } = useAuth();
  const router = useRouter();
  const [favStates, setFavStates] = React.useState<Record<string, boolean>>({});
  const [favLoading, setFavLoading] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<{ msg: string; key: number } | null>(null);

  // Function to fetch rotated news
  const fetchRotatedNews = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/news-rotation?category=${category}`, {
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        const newFeatured = data.data.featured ? toArticle(data.data.featured) : null;
        const newArticles = data.data.mainArticles?.map(toArticle) || [];
        const newSuggested = data.data.suggestedArticles?.map(toArticle) || [];
        
        setFeatured(newFeatured);
        setArticles(newArticles);
        setSuggestedArticles(newSuggested);
        setLastRotation(data.lastUpdate || Date.now());
        
        // Track category visit when news rotates
        sendAnalyticsEvent('view_category', { category });
      }
    } catch (error) {
      logCategoryError('Failed to fetch rotated news:', error);
      // Keep existing data if rotation fails
      // لا يوجد fallback لجلب من API خارجي بعد الآن
    } finally {
      setLoading(false);
    }
  }, [category]);

  // تحديث تلقائي كل دقيقة (Polling)
  React.useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/news-rotation?category=${category}`, {
          cache: 'no-store',
          headers: { 'Accept': 'application/json' },
        });
        if (!response.ok) return;
        const data = await response.json();
        if (data.success && data.data) {
          const newArticles = data.data.mainArticles?.map(toArticle) || [];
          const newFirstSlug = newArticles[0]?.slug;
          if (newFirstSlug && latestSlugRef.current && newFirstSlug !== latestSlugRef.current) {
            pendingArticlesRef.current = newArticles;
            setHasNewNews(true);
          }
        }
      } catch (error) {
        // if (process.env.NODE_ENV === 'development') {
        //   console.error(error);
        // }
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [category]);

  const handleShowNewNews = () => {
    setArticles([...pendingArticlesRef.current]);
    latestSlugRef.current = pendingArticlesRef.current[0]?.slug || "";
    setHasNewNews(false);
  };

  React.useEffect(() => {
    const t = setTimeout(() => setTimeoutReached(true), 5000);
    return () => clearTimeout(t);
  }, []);

  // Check for rotation every 3 hours (3 * 60 * 60 * 1000 ms)
  React.useEffect(() => {
    const checkRotation = () => {
      const now = Date.now();
      const threeHours = 3 * 60 * 60 * 1000;
      
      if (now - lastRotation >= threeHours) {
        fetchRotatedNews();
      }
    };

    // Check immediately
    checkRotation();
    
    // Set up interval to check every hour
    const interval = setInterval(checkRotation, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [lastRotation, fetchRotatedNews]);

  // Initial load if no data provided
  React.useEffect(() => {
    if (!initialFeatured && !initialArticles?.length) {
      fetchRotatedNews();
    }
  }, [fetchRotatedNews, initialFeatured, initialArticles?.length]);

  // Limit to first 52 articles only
  const limitedArticles = articles.slice(0, 52);
  const mainArticles = limitedArticles.slice(0, 51);
  const suggested = suggestedArticles.slice(0, 40);

  // Convert Article[] to NewsArticle[] for components
  const toNewsArticle = (a: Article): NewsArticle => ({
    source: { id: null, name: a.source?.name || '' },
    author: a.author || '',
    title: a.title,
    description: a.description || '',
    url: a.url,
    image_url: a.image_url || '',
    published_at: a.published_at,
    content: '',
    slug: a.slug,
    category: a.category || '',
  });

  const featuredNews = featured ? toNewsArticle(featured) : null;
  const mainNews = mainArticles.map(toNewsArticle);
  const suggestedNews = suggested.map(toNewsArticle);

  React.useEffect(() => {
    if (!user) {
      setFavStates({});
      return;
    }
    (async () => {
      const favs: Record<string, boolean> = {};
      for (const article of [...mainNews, ...suggestedNews]) {
        favs[article.slug] = await isFavorite(user.id, article.slug);
      }
      setFavStates(favs);
    })();
    // Track view_category event
    trackEvent('view_category', { category });
  }, [user, mainNews, suggestedNews, category]);

  const handleToggleFavorite = React.useCallback(async (slug: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
    setFavLoading(slug);
    if (favStates[slug]) {
      await removeFavorite(user.id, slug);
      setFavStates((prev) => ({ ...prev, [slug]: false }));
      setToast({ msg: 'Removed from favorites', key: Date.now() });
      trackEvent('remove_from_favorites', { slug });
    } else {
      await addFavorite(user.id, slug);
      setFavStates((prev) => ({ ...prev, [slug]: true }));
      setToast({ msg: 'Added to favorites', key: Date.now() });
      trackEvent('add_to_favorites', { slug });
    }
    setFavLoading(null);
  }, [user, favStates, router]);

  const handleRefresh = React.useCallback(() => {
    window.location.reload();
  }, []);

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
        <button className="btn btn-primary" onClick={handleRefresh}>Refresh Page</button>
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
          onClick={handleRefresh}
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="category-page max-w-screen-xl mx-auto px-2 sm:px-4">
      {toast && (
        <div key={toast.key} className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in">
          {toast.msg}
        </div>
      )}
      {hasNewNews && (
        <div className="bg-yellow-100 border-b border-yellow-300 text-yellow-900 px-4 py-2 text-center cursor-pointer sticky top-0 z-50 flex items-center justify-center gap-2 animate-fade-in">
          <span>🟡 New articles are available</span>
          <button onClick={handleShowNewNews} className="bg-yellow-300 hover:bg-yellow-400 text-yellow-900 font-bold px-3 py-1 rounded transition ml-2">Refresh now</button>
        </div>
      )}
      <div className="category-header text-center mb-6">
        <h1
          className="category-title text-3xl sm:text-4xl md:text-6xl font-extrabold mb-2 tracking-tight text-red-700 break-words"
          style={{
            fontFamily: 'Playfair Display, Merriweather, serif',
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
      {suggestedNews.length > 0 ? (
        <section className="mt-12 bg-gradient-to-br from-gray-100 via-white to-gray-50 rounded-2xl p-6 shadow-lg">
          <div className="mb-4">
            <h2 className="text-2xl font-extrabold mb-2 text-red-800 flex items-center gap-2">
              <span role="img" aria-label="newspaper">📰</span>
              Suggested Articles
            </h2>
            <p className="text-gray-500 text-base border-b pb-2">More news you might like</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {suggestedNews.map((article, idx) => renderSuggestedArticle(article, idx, favStates, favLoading, handleToggleFavorite))}
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
    </div>
  );
} 