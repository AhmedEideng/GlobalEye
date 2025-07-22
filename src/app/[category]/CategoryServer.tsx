import { fetchNews, NewsArticle } from '@utils/fetchNews';
// import { logSnagEvent } from '@utils/logsnag'; // تم الحذف لأنه غير مستخدم

// Professional error logger for category server
function logCategoryServerError(...args: unknown[]) {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.debug('[CategoryServer]', ...args);
  }
  // In production, you can send errors to a monitoring service here
}

export async function fetchCategoryNews(category: string): Promise<{
  featured: NewsArticle | null;
  articles: NewsArticle[];
  suggestedArticles: NewsArticle[];
}> {
  try {
    // استخدم عنوان مطلق عند التنفيذ على الخادم
    const isServer = typeof window === 'undefined';
    const baseUrl = isServer
      ? (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002')
      : '';
    const url = `${baseUrl}/api/news-rotation?category=${category}`;
    const response = await fetch(url, {
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
    const allArticles: NewsArticle[] = await fetchNews();
    const categoryArticles = allArticles.filter(article => article.category === category);
    const sortedArticles = categoryArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
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
  const { featured, articles, suggestedArticles } = await fetchCategoryNews(category);

  return {
    featured,
    articles,
    suggestedArticles,
    category
  };
} 