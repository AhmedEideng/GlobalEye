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
export async function forceRefreshNews(category: string = 'general') {
  newsCache.delete(category);
  return await fetchNews(category);
}

/**
 * Fetches news articles for a given category from the database only, sorted from newest to oldest.
 * @param category - The news category (default: 'general')
 * @returns Promise<NewsArticle[]>
 */
export async function fetchNews(category: string = 'general'): Promise<NewsArticle[]> {
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
      const regex = new RegExp(`\\b${kw.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
      count += (text.match(regex) || []).length;
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
export async function fetchRelatedNews(currentArticle: NewsArticle, category: string = 'general'): Promise<NewsArticle[]> {
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
    const titleSearch = slug.replace(/-/g, ' ').replace(/\d+$/, '').trim();
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

// Enhanced function to update all articles with slugs
/**
 * Updates all articles in the DB with improved slugs if needed.
 * @returns Promise<{ success: boolean, message?: string, error?: string }>
 */
export async function updateAllArticlesWithSlugs() {
  try {
    // Fetch all articles from database
    const { data: allArticles, error: fetchError } = await supabase
      .from('news')
      .select('*')
      .order('published_at', { ascending: false });
    
    if (fetchError) {
      return { success: false, error: fetchError.message };
    }
    
    if (!allArticles || allArticles.length === 0) {
      return { success: true, message: "No articles found in database" };
    }
    
    // Filter articles that need slug updates
    const articlesNeedingSlugs = allArticles.filter(article => 
      !article.slug || 
      article.slug === '' || 
      article.slug === 'null' ||
      article.slug.length < 5 // Very short slugs might be incorrect
    );
    
    // Also check for slugs that might need improvement
    const articlesWithPoorSlugs = allArticles.filter(article => 
      article.slug && 
      article.slug !== '' && 
      article.slug !== 'null' &&
      (article.slug.includes('undefined') || 
       article.slug.includes('null') ||
       article.slug.length > 100) // Very long slugs
    );
    
    const allArticlesToUpdate = [...articlesNeedingSlugs, ...articlesWithPoorSlugs];
    
    if (allArticlesToUpdate.length === 0) {
      return { success: true, message: "All articles already have good slugs" };
    }
    
    // Update each article with improved slug
    const updates = allArticlesToUpdate.map(article => {
      const newSlug = generateSlug(article.title, article.url);
      
      return {
        id: article.id,
        slug: newSlug
      };
    });
    
    // Update database
    const { error: updateError } = await supabase
      .from('news')
      .upsert(updates, { onConflict: 'id' });
    
    if (updateError) {
      return { success: false, error: updateError.message };
    }
    
    return { 
      success: true, 
      message: `Updated ${updates.length} articles with slugs`,
      details: {
        articlesNeedingSlugs: articlesNeedingSlugs.length,
        articlesWithPoorSlugs: articlesWithPoorSlugs.length,
        totalUpdated: updates.length
      }
    };
    
  } catch {
    return { success: false, error: 'Unknown error' };
  }
}

// Function to check slug status in database
export async function checkSlugsStatus() {
  try {
    const { data: allArticles, error: fetchError } = await supabase
      .from('news')
      .select('id, title, slug, published_at')
      .order('published_at', { ascending: false });
    
    if (fetchError) {
      return { success: false, error: fetchError.message };
    }
    
    if (!allArticles || allArticles.length === 0) {
      return { success: true, message: "No articles found in database" };
    }
    
    const totalArticles = allArticles.length;
    const articlesWithSlugs = allArticles.filter(article => 
      article.slug && article.slug !== '' && article.slug !== 'null'
    ).length;
    
    const articlesWithoutSlugs = totalArticles - articlesWithSlugs;
    
    const articlesWithPoorSlugs = allArticles.filter(article => 
      article.slug && 
      article.slug !== '' && 
      article.slug !== 'null' &&
      (article.slug.includes('undefined') || 
       article.slug.includes('null') ||
       article.slug.length > 100 ||
       article.slug.length < 5)
    ).length;
    
    return {
      success: true,
      stats: {
        totalArticles,
        articlesWithSlugs,
        articlesWithoutSlugs,
        articlesWithPoorSlugs,
        percentageWithSlugs: Math.round((articlesWithSlugs / totalArticles) * 100)
      }
    };
    
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Function to improve specific slug
export async function improveSpecificSlug(articleId: string) {
  try {
    const { data: article, error: fetchError } = await supabase
      .from('news')
      .select('*')
      .eq('id', articleId)
      .single();
    
    if (fetchError || !article) {
      return { success: false, error: "Article not found" };
    }
    
    const newSlug = generateSlug(article.title, article.url);
    
    const { error: updateError } = await supabase
      .from('news')
      .update({ slug: newSlug })
      .eq('id', articleId);
    
    if (updateError) {
      return { success: false, error: updateError.message };
    }
    
    return { 
      success: true, 
      message: "Slug improved successfully",
      oldSlug: article.slug,
      newSlug: newSlug
    };
    
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Enhanced function to generate slug from title or URL
function generateSlug(title: string, url: string): string {
  // Clean title and remove special characters
  if (title && title.trim()) {
    const cleanTitle = title
      .toLowerCase()
      .trim()
      // Remove special characters
      .replace(/[^\w\s-]/g, '')
      // Replace multiple spaces and dashes with single dash
      .replace(/[\s\-]+/g, '-')
      // Remove dashes from start and end
      .replace(/^-+|-+$/g, '')
      // Limit maximum length
      .slice(0, 50);
    
    // If title is empty after cleaning, use hash from URL
    if (!cleanTitle) {
      return `article-${Math.abs(hashCode(url)).toString()}`;
    }
    
    // Add hash from URL to ensure uniqueness
    const urlHash = Math.abs(hashCode(url)).toString().slice(0, 8);
    return `${cleanTitle}-${urlHash}`;
  }
  
  // If no title, use hash from URL
  return `article-${Math.abs(hashCode(url)).toString()}`;
}

// Simple hash function
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