import { supabase } from '@utils/supabaseClient';
import { getOrAddCategoryId } from './categoryUtils';
import { LRUCache } from 'lru-cache';

// Remove the temporary declare module 'lru-cache' fix since types are now installed

// Temporary definition for window.gtag to avoid linter error
declare global {
  interface Window {
    gtag?: (..._args: unknown[]) => void;
  }
}

export type NewsArticle = {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
  slug: string;
  category: string;
};

// TODO: Move these to environment variables after creating .env.local file

// عرف نوع جديد لنتيجة الاستعلام مع JOIN
interface NewsWithCategory {
  source_name: string;
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  url_to_image: string | null;
  published_at: string;
  content: string | null;
  slug: string;
  categories?: { name: string };
}

// Cache duration (seconds) - configurable via environment variable
const CACHE_TTL = Number(process.env.CACHE_TTL) || 300; // 5 minutes default

// Set up internal cache for each category for CACHE_TTL seconds
const newsCache = new LRUCache<string, NewsArticle[]>({
  max: 32, // Number of cached categories
  ttl: 1000 * CACHE_TTL, // CACHE_TTL in milliseconds
});

/**
 * Manual news update function (force refresh) - can be used in future scheduling (cron job)
 * @param category - The news category (default: 'general')
 * @returns Promise<NewsArticle[]>
 */
export async function forceRefreshNews(category = 'general') {
  newsCache.delete(category);
  return await fetchNews(category);
}

/**
 * Fetches news articles for a given category from the database only, sorted from newest to oldest.
 * @param category - The news category (default: 'general')
 * @returns Promise<NewsArticle[]>
 */
export async function fetchNews(category = 'general'): Promise<NewsArticle[]> {
  // Check cache first
  const cached = newsCache.get(category);
  if (cached) return cached;

  // Fetch latest news from the database
  const { data: dbArticles, error } = await supabase
    .from('news')
    .select('*, categories(name)')
    .eq('category_id', await getOrAddCategoryId(category))
    .order('published_at', { ascending: false })
    .limit(50);

  if (!error && dbArticles && dbArticles.length > 0) {
    const result = dbArticles.map((article: NewsWithCategory) => ({
      source: { id: null, name: article.source_name },
      author: article.author,
      title: article.title,
      description: article.description,
      url: article.url,
      urlToImage: article.url_to_image,
      publishedAt: article.published_at,
      content: article.content,
      slug: article.slug,
      category: article.categories?.name || category,
    }) as NewsArticle);
    newsCache.set(category, result); // Store the result in cache
    return result;
  }

  // If no news, return an empty array (and handle it in the frontend)
  return [];
}

// Extended list of keywords for each category
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  business: ['business', 'market', 'economy', 'finance', 'stock', 'trade', 'investment', 'bank', 'currency', 'stock market', 'economy', 'money', 'trade', 'investment', 'bank', 'currency', 'بورصة', 'اقتصاد', 'مال', 'تجارة', 'استثمار', 'مصرف', 'عملة'],
  technology: ['technology', 'tech', 'ai', 'software', 'hardware', 'internet', 'robot', 'gadget', 'app', 'software', 'technology', 'artificial intelligence', 'robot', 'app', 'internet'],
  sports: ['sport', 'football', 'basketball', 'tennis', 'match', 'goal', 'league', 'championship', 'olympic', 'sport', 'football', 'basketball', 'tennis', 'match', 'goal', 'league', 'championship', 'olympic', 'رياضي', 'كرة', 'مباراة', 'هدف', 'دوري', 'بطولة', 'أولمبياد'],
  entertainment: ['entertainment', 'movie', 'music', 'celebrity', 'film', 'drama', 'actor', 'celebrity', 'film', 'music', 'actor', 'دراما', 'مشاهير'],
  health: ['health', 'medical', 'doctor', 'hospital', 'covid', 'virus', 'health', 'medical', 'doctor', 'hospital', 'covid', 'virus', 'مرض', 'صحة', 'طبيب', 'مستشفى', 'دواء', 'علاج', 'فيروس'],
  science: ['science', 'research', 'study', 'discovery', 'space', 'astronomy', 'science', 'research', 'study', 'discovery', 'space', 'astronomy', 'علم', 'بحث', 'دراسة', 'فضاء', 'اكتشاف', 'فلك'],
  politics: ['politics', 'government', 'election', 'president', 'minister', 'parliament', 'politics', 'government', 'election', 'president', 'minister', 'parliament', 'سياسة', 'حكومة', 'انتخابات', 'رئيس', 'وزير', 'برلمان'],
  world: ['world', 'international', 'global', 'world', 'international', 'global', 'دولي', 'عالمي', 'عالم', 'خارجية'],
  general: []
};

// Smart categorization based on most frequent keywords
export function detectCategory(article: NewsArticle): string {
  const text = `${article.title} ${article.description || ''} ${article.content || ''}`.toLowerCase();
  let bestCategory = 'general';
  let maxCount = 0;
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let count = 0;
    for (const kw of keywords) {
      // Support Arabic and English
      const regex = new RegExp(`\\b${kw.replace(/[-/\\^$*+?.()|[\]{}]/gu, '\\$&')}\\b`, 'giu');
      // استخدم matchAll بدلاً من match للحصول على جميع التطابقات
      const matches = [...text.matchAll(regex)];
      count += matches.length;
    }
    if (count > maxCount) {
      maxCount = count;
      bestCategory = cat;
    }
  }
  return bestCategory;
}

/**
 * Fetches related news articles from the same category, excluding the current article.
 * @param currentArticle - The current NewsArticle
 * @param category - The news category
 * @returns Promise<NewsArticle[]>
 */
export async function fetchRelatedNews(currentArticle: NewsArticle, category = 'general'): Promise<NewsArticle[]> {
  try {
    // Get news from the same category, excluding the current article
    const articles = await fetchNews(category);
    return articles
      .filter(article => article.url !== currentArticle.url)
      .slice(0, 40); // Return up to 40 related articles
  } catch {
    return [];
  }
}

// Debug function to check database contents
export async function debugDatabaseContents() {
  try {
    const { data, error } = await supabase
      .from('news')
      .select('title, slug, category')
      .order('published_at', { ascending: false })
      .limit(10);
    
    if (error) {
      return;
    }
    
    data?.forEach(() => {
    });
  } catch {
  }
}

/**
 * Gets a news article by its slug from the DB, with fallback strategies.
 * @param slug - The article slug
 * @returns Promise<NewsArticle | null>
 */
export async function getArticleBySlug(slug: string): Promise<NewsArticle | null> {
  try {
    // Strategy 1: Exact slug match
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('slug', slug)
      .limit(1)
      .single();
    
    if (!error && data) {
      return {
        source: { id: data.source_id, name: data.source_name },
        author: data.author,
        title: data.title,
        description: data.description,
        url: data.url,
        urlToImage: data.url_to_image,
        publishedAt: data.published_at,
        content: data.content,
        slug: data.slug,
        category: data.category || 'general',
      };
    }
    
    // Strategy 2: Partial slug match (first 3 words)
    const slugWords = slug.split('-').slice(0, 3).join('-');
    const { data: partialData, error: partialError } = await supabase
      .from('news')
      .select('*')
      .ilike('slug', `%${slugWords}%`)
      .limit(5);
    
    if (!partialError && partialData && partialData.length > 0) {
      const article = partialData[0];
      return {
        source: { id: null, name: article.source_name },
        author: article.author,
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.url_to_image,
        publishedAt: article.published_at,
        content: article.content,
        slug: article.slug,
        category: article.category || 'general',
      };
    }
    
    // Strategy 3: Search by title (convert slug back to title-like search)
    const titleSearch = slug.replace(/-/gu, ' ').replace(/\d+$/u, '').trim();
    const { data: titleData, error: titleError } = await supabase
      .from('news')
      .select('*')
      .ilike('title', `%${titleSearch}%`)
      .limit(5);
    
    if (!titleError && titleData && titleData.length > 0) {
      const article = titleData[0];
      return {
        source: { id: null, name: article.source_name },
        author: article.author,
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.url_to_image,
        publishedAt: article.published_at,
        content: article.content,
        slug: article.slug,
        category: article.category || 'general',
      };
    }
    
    return null;
    
  } catch {
    return null;
  }
}

/**
 * Sort articles by user preferences (by favorite categories)
 * @param articles - All articles
 * @param favoriteSlugs - List of user's favorite slugs
 * @returns List of articles sorted so that articles from the same favorite categories appear first
 */
export function sortArticlesByUserPreferences(articles: NewsArticle[], favoriteSlugs: string[]): NewsArticle[] {
  if (!favoriteSlugs || favoriteSlugs.length === 0) return articles;
  // Extract favorite categories from favorite articles
  const favoriteCategories = Array.from(new Set(
    articles.filter(a => favoriteSlugs.includes(a.slug)).map(a => a.category)
  ));
  // Sort articles so that articles from favorite categories appear first
  return [
    ...articles.filter(a => favoriteCategories.includes(a.category)),
    ...articles.filter(a => !favoriteCategories.includes(a.category)),
  ];
}

/**
 * Send custom event to Google Analytics (GA4)
 * @param eventName - Event name
 * @param params - Additional data
 */
export function sendAnalyticsEvent(eventName: string, params: Record<string, unknown> = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
} 

// Helper function to format dates consistently across the app
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
} 

// Helper function to get a valid image URL or fallback to placeholder
export function getImageUrl(url?: string | null): string {
  return url && url.trim() !== '' ? url : '/placeholder-news.jpg';
} 