import { fetchNews, NewsArticle } from '@utils/fetchNews';

// Professional error logger for category server
function logCategoryServerError(...args: unknown[]) {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.error('[CategoryServer]', ...args);
  }
  // In production, you can send errors to a monitoring service here
}

// Function to fetch rotated news for categories
async function fetchRotatedCategoryNews(category: string): Promise<{
  featured: NewsArticle | null;
  articles: NewsArticle[];
  suggestedArticles: NewsArticle[];
}> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/news-rotation?category=${category}`, {
      next: { revalidate: 180 }, // 3 minutes cache
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      return {
        featured: data.data.featured || null,
        articles: data.data.mainArticles || [],
        suggestedArticles: data.data.suggestedArticles || []
      };
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    logCategoryServerError(`Failed to fetch rotated news for category ${category}:`, error);
    // Fallback to direct fetch
    const allArticles: NewsArticle[] = await fetchNews(category); // الآن تجلب فقط من Supabase
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

export default async function CategoryServer({ category }: { category: string }) {
  // Fetch rotated news with automatic 3-hour rotation for this category
  const { featured, articles, suggestedArticles } = await fetchRotatedCategoryNews(category);

  return {
    featured,
    articles,
    suggestedArticles,
    category
  };
} 