"use client";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { NewsArticle } from "@/utils/fetchNews";
import CategoryClient from "./CategoryClient";
import { PageLoadingSpinner } from "@/components/LoadingSpinner";
import { logger } from "@/utils/logger";

// Cache for category data
const categoryCache = new Map<string, { articles: NewsArticle[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default function CategoryPage() {
  const params = useParams();
  const category = params.category as string;
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState<string>("");

  // Memoize category name
  const displayName = useMemo(() => {
    if (!category) return "";
    return category.charAt(0).toUpperCase() + category.slice(1);
  }, [category]);

  useEffect(() => {
    const loadCategoryNews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!category) {
          setError('Category not found');
          setLoading(false);
          return;
        }

        setCategoryName(displayName);

        // Clear cache for different categories to ensure fresh data
        if (categoryCache.size > 10) {
          // Clear old cache entries if too many
          const now = Date.now();
          for (const [key, value] of categoryCache.entries()) {
            if (now - value.timestamp > CACHE_DURATION) {
              categoryCache.delete(key);
            }
          }
        }

        // Check cache first
        const cached = categoryCache.get(category);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          setArticles(cached.articles);
          setLoading(false);
          logger.info(`Using cached data for category: ${category}`);
          return;
        }

        // Fetch fresh data
        logger.info(`Fetching fresh data for category: ${category}`);
        const response = await fetch(`/api/news-rotation?category=${category.toLowerCase()}&limit=20`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const fetchedArticles = data.data.mainArticles || data.data.suggestedArticles || data.data || [];
            setArticles(fetchedArticles);
            
            // Cache the result
            categoryCache.set(category, {
              articles: fetchedArticles,
              timestamp: Date.now()
            });
            
            logger.info(`Fetched ${fetchedArticles.length} articles for category ${category}`);
          } else {
            setArticles([]);
            logger.info(`No articles found for category ${category}`);
          }
        } else {
          logger.error(`API error for category ${category}:`, response.status);
          setError('Failed to load category news');
        }
      } catch (err) {
        logger.error(`Error loading category ${category}:`, err);
        setError('Failed to load category news');
      } finally {
        setLoading(false);
      }
    };
    
    loadCategoryNews();
  }, [category, displayName]);

  // Display error message
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Category</h1>
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

  // Display loading screen
  if (loading) {
    return <PageLoadingSpinner />;
  }

  return (
    <CategoryClient 
      articles={articles} 
      categoryName={categoryName} 
    />
  );
} 