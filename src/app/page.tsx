"use client";
import { useEffect, useState } from "react";
import { getCategoriesFromSupabase } from "@/utils/getCategoriesFromSupabase";
import HomeNewsGrid from "@/components/HomeNewsGrid";
import HomeFeatured from "@/components/HomeFeatured";
import { Category } from "@/utils/getCategoriesFromSupabase";
import { NewsArticle } from "@/utils/fetchNews";
import { PageLoadingSpinner } from "@/components/LoadingSpinner";
import { logger } from "@/utils/logger";
import SuggestedArticles from "@/components/SuggestedArticles";

// Default categories based on new structure
const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'World' },
  { id: '2', name: 'Business' },
  { id: '3', name: 'Technology' },
  { id: '4', name: 'Sports' },
  { id: '5', name: 'Entertainment' },
  { id: '6', name: 'Health' },
  { id: '7', name: 'Science' },
  { id: '8', name: 'Politics' },
  { id: '9', name: 'General' }
];

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newsByCategory, setNewsByCategory] = useState<Record<string, NewsArticle[]>>({});
  const [featuredArticle, setFeaturedArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [timeout, setTimeoutReached] = useState(false);

  // Fetch categories and news
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setLoadingProgress(0);
        setError(null);
        
        // Set timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          setTimeoutReached(true);
          setLoading(false);
          setError('Loading timeout - please refresh the page');
        }, 30000); // 30 seconds timeout

        // Fetch categories
        let cats: Category[] = [];
        try {
          logger.info('Fetching categories from Supabase...');
          cats = await getCategoriesFromSupabase();
          logger.info('Categories fetched:', cats);
          setLoadingProgress(30);
        } catch (err) {
          logger.error('Error fetching categories:', err);
          // Use default categories if connection fails
          cats = DEFAULT_CATEGORIES;
          logger.info('Using default categories:', cats);
        }
        setCategories(cats);
        setLoadingProgress(50);

        // Fetch news from API
        const newsData: Record<string, NewsArticle[]> = {};
        const totalCategories = cats.length;
        let allArticles: NewsArticle[] = [];
        
        for (let i = 0; i < cats.length; i++) {
          const cat = cats[i];
          try {
            logger.info(`Fetching news for category: ${cat.name}`);
            const response = await fetch(`/api/news-rotation?category=${cat.name.toLowerCase()}&limit=10`);
            
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.data) {
                // Try to get articles from different possible structures
                const articles = data.data.mainArticles || data.data.suggestedArticles || data.data || [];
                newsData[cat.name] = articles;
                allArticles = [...allArticles, ...articles];
                logger.info(`Fetched ${articles.length} articles for category ${cat.name}`);
              } else {
                newsData[cat.name] = [];
                logger.info(`No news for category ${cat.name}`);
              }
            } else {
              logger.error(`API call error for category ${cat.name}:`, response.status);
              newsData[cat.name] = [];
            }
          } catch (err) {
            logger.error(`Error fetching news for category ${cat.name}:`, err);
            newsData[cat.name] = [];
          }
          
          // Update loading progress
          const progress = 50 + ((i + 1) / totalCategories) * 50;
          setLoadingProgress(progress);
        }
        
        // Set featured article (first article from World category or first available)
        if (allArticles.length > 0) {
          const worldArticles = newsData['World'] || [];
          const featured = worldArticles.length > 0 ? worldArticles[0] : allArticles[0];
          setFeaturedArticle(featured);
        }
        
        setNewsByCategory(newsData);
        setLoading(false);
        clearTimeout(timeoutId);
        logger.info('All data loaded successfully');
      } catch (err) {
        logger.error('General error loading data:', err);
        setError('Failed to load data - please refresh the page');
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Display error message
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-bold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Display loading screen with progress bar
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-6"></div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">GlobalEye News</h2>
          <p className="text-gray-600 mb-4">Loading news...</p>
          
          {/* Progress bar */}
          <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
            <div 
              className="bg-red-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">{Math.round(loadingProgress)}%</p>
          
          {timeout && (
            <p className="text-sm text-red-500 mt-2">Taking longer than expected...</p>
          )}
        </div>
      </div>
    );
  }

  // Main content
  return (
    <main className="container mx-auto px-4 py-8">
      {/* Featured Article Section */}
      {featuredArticle && (
        <HomeFeatured article={featuredArticle} />
      )}

      {/* Categories Sections */}
      {categories.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📰</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">GlobalEye News</h1>
          <p className="text-gray-600">No categories available at the moment</p>
        </div>
      ) : (
        categories.map((cat: Category) => {
          const articles = newsByCategory[cat.name] || [];
          if (articles.length === 0) return null;
          
          return (
            <section key={cat.id} className="mb-12">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{cat.name}</h2>
                <div className="w-20 h-1 bg-red-600 rounded"></div>
              </div>
              <HomeNewsGrid articles={articles} />
            </section>
          );
        })
      )}

      {/* Suggested Articles Section */}
      <SuggestedArticles category="world" limit={8} />
    </main>
  );
} 