import { supabase } from '@utils/supabaseClient';
import { getOrAddCategoryId } from './categoryUtils';

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
const NEWS_API_KEY = "7d0558972f474651bd6e8caf39ed7690";
const GNEWS_API_KEY = "0ca8e593409a10ac2edf9b4926be9896";
const GUARDIAN_KEY = "dfb1dd37-68b1-4d85-9837-62d1fe12c62d";
const MEDIASTACK_KEY = "b20e48f1cd7e3cd2ea218f4532c7fd31";

interface NewsAPIArticle {
  source?: { id?: string; name?: string };
  author?: string;
  title?: string;
  description?: string;
  url?: string;
  urlToImage?: string;
  publishedAt?: string;
  content?: string;
}

interface GNewsArticle {
  source?: { name?: string };
  author?: string;
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  publishedAt?: string;
  content?: string;
}

interface GuardianArticle {
  webTitle?: string;
  webUrl?: string;
  webPublicationDate?: string;
  fields?: {
    byline?: string;
    trailText?: string;
    thumbnail?: string;
    bodyText?: string;
  };
}

interface MediastackArticle {
  source?: string;
  author?: string;
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  published_at?: string;
}

/**
 * Fetches news articles for a given category from the database or APIs, sorted from newest to oldest.
 * If no recent news in the DB, fetches from APIs and saves to DB.
 * @param category - The news category (default: 'general')
 * @returns Promise<NewsArticle[]>
 */
export async function fetchNews(category: string = 'general'): Promise<NewsArticle[]> {
  // 1. Fetch from APIs and upsert to DB
  const sources = [
    { fn: fetchFromNewsAPI, name: 'NewsAPI' },
    { fn: fetchFromGNews, name: 'GNews' },
    { fn: fetchFromGuardian, name: 'Guardian' },
    { fn: fetchFromMediastack, name: 'Mediastack' },
  ];
  const promises = sources.map(({ fn }) =>
    withTimeout(fn(category).then(result => result), 8000)
  );
  const results = await Promise.all(promises);
  const all = results.filter(Boolean).flat() as NewsArticle[];
  const unique = all.filter((item, idx, arr) => arr.findIndex(a => a.url === item.url) === idx);
  unique.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  if (unique.length > 0) {
    await saveArticlesToSupabase(unique, category);
  }

  // 2. Always fetch the latest from DB
  const { data: dbArticles, error } = await supabase
    .from('news')
    .select('*, categories(name)')
    .eq('category_id', await getOrAddCategoryId(category))
    .order('published_at', { ascending: false })
    .limit(30);

  if (!error && dbArticles && dbArticles.length > 0) {
    return dbArticles.map((article: { [key: string]: any; categories?: { name: string } }) => ({
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
  }

  return [];
}

/**
 * Detects the category of a news article based on its content/title/description.
 * @param article - NewsArticle object
 * @returns category string
 */
export function detectCategory(article: NewsArticle): string {
  const title = article.title.toLowerCase();
  const description = article.description?.toLowerCase() || '';
  const content = article.content?.toLowerCase() || '';
  const text = `${title} ${description} ${content}`;

  if (text.includes('business') || text.includes('market') || text.includes('economy') || text.includes('finance')) {
    return 'business';
  }
  if (text.includes('technology') || text.includes('tech') || text.includes('ai') || text.includes('software')) {
    return 'technology';
  }
  if (text.includes('sport') || text.includes('football') || text.includes('basketball') || text.includes('tennis')) {
    return 'sports';
  }
  if (text.includes('entertainment') || text.includes('movie') || text.includes('music') || text.includes('celebrity')) {
    return 'entertainment';
  }
  if (text.includes('health') || text.includes('medical') || text.includes('doctor') || text.includes('hospital')) {
    return 'health';
  }
  if (text.includes('science') || text.includes('research') || text.includes('study') || text.includes('discovery')) {
    return 'science';
  }
  if (text.includes('politics') || text.includes('government') || text.includes('election') || text.includes('president')) {
    return 'politics';
  }
  
  return 'general';
}

/**
 * Saves an array of news articles to Supabase DB, filtering out incomplete articles.
 * @param articles - Array of NewsArticle
 * @param category - The news category
 */
async function saveArticlesToSupabase(articles: NewsArticle[], category: string) {
  if (!articles.length) return;

  // Filter out articles missing image, title, or content
  const filtered = articles.filter(article =>
    article.title && article.title.trim() !== '' &&
    article.urlToImage && article.urlToImage.trim() !== '' &&
    article.content && article.content.trim() !== ''
  );
  if (!filtered.length) return;

  try {
    // جلب أو إضافة القسم والحصول على id
    const categoryId = await getOrAddCategoryId(category);
    if (!categoryId) return;
    // Prepare data to match the table structure
    const mapped = filtered.map(article => {
      let finalSlug = article.slug;
      if (!finalSlug || finalSlug === '' || finalSlug === 'null') {
        finalSlug = generateSlug(article.title, article.url);
      }
      let cleanImageUrl = article.urlToImage;
      if (cleanImageUrl && cleanImageUrl.startsWith('//')) {
        cleanImageUrl = 'https:' + cleanImageUrl;
      }
      return {
        title: article.title,
        description: article.description,
        url: article.url,
        url_to_image: cleanImageUrl,
        published_at: article.publishedAt ? new Date(article.publishedAt) : null,
        content: article.content,
        source_name: article.source.name,
        author: article.author,
        slug: finalSlug,
        category_id: categoryId,
      };
    });
    // Insert articles while ignoring duplicates based on url
    await supabase.from('news').upsert(mapped, { onConflict: 'url' });
  } catch {
  }
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
      .slice(0, 15); // Return up to 15 related articles
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

function assignCategoryToArticle(
  article: NewsAPIArticle | GNewsArticle | GuardianArticle | MediastackArticle | NewsArticle,
  fallbackDetect: (_a: NewsAPIArticle | GNewsArticle | GuardianArticle | MediastackArticle | NewsArticle) => string,
  apiCategory?: string
) {
  if (apiCategory && typeof apiCategory === 'string') {
    return apiCategory.toLowerCase();
  }
  if ('category' in article && typeof (article as { category: string }).category === 'string') {
    return (article as { category: string }).category.toLowerCase();
  }
  return fallbackDetect(article);
}

async function fetchFromNewsAPI(category: string): Promise<NewsArticle[]> {
  if (!NEWS_API_KEY) return [];
  try {
    const url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&pageSize=20&apiKey=${NEWS_API_KEY}`;
    const res = await fetch(url, { next: { revalidate: 900 }, headers: { 'User-Agent': 'GlobalEye-News/1.0' } });
    if (!res.ok) return [];
    const data = await res.json();
    const articles = (data.articles || []).map((article: NewsAPIArticle) => {
      const title = article.title || '';
      const url = article.url || '';
      const slug = generateSlug(title, url);
      // @ts-expect-error - assignCategoryToArticle accepts multiple article types
      const newsCategory = assignCategoryToArticle(article, detectCategory, category);
      return {
        source: { id: article.source?.id || null, name: article.source?.name || 'Unknown' },
        author: article.author || null,
        title: title,
        description: article.description || null,
        url: url,
        urlToImage: article.urlToImage || null,
        publishedAt: article.publishedAt || '',
        content: article.content || null,
        slug: slug,
        category: newsCategory
      };
    });
    return articles;
  } catch { return []; }
}

async function fetchFromGNews(category: string): Promise<NewsArticle[]> {
  if (!GNEWS_API_KEY) return [];
  try {
    const url = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&country=us&max=20&apikey=${GNEWS_API_KEY}`;
    const res = await fetch(url, { next: { revalidate: 900 }, headers: { 'User-Agent': 'GlobalEye-News/1.0' } });
    if (!res.ok) return [];
    const data = await res.json();
    const articles = (data.articles || []).map((article: GNewsArticle) => {
      const title = article.title || '';
      const url = article.url || '';
      const slug = generateSlug(title, url);
      // @ts-expect-error - assignCategoryToArticle accepts multiple article types
      const newsCategory = assignCategoryToArticle(article, detectCategory, category);
      return {
        source: { id: null, name: article.source?.name || 'GNews' },
        author: article.author || null,
        title: title,
        description: article.description || null,
        url: url,
        urlToImage: article.image || null,
        publishedAt: article.publishedAt || '',
        content: article.content || null,
        slug: slug,
        category: newsCategory
      };
    });
    return articles;
  } catch { return []; }
}

async function fetchFromGuardian(category: string): Promise<NewsArticle[]> {
  if (!GUARDIAN_KEY) return [];
  try {
    const url = `https://content.guardianapis.com/search?section=${category}&show-fields=all&page-size=20&api-key=${GUARDIAN_KEY}`;
    const res = await fetch(url, { next: { revalidate: 900 }, headers: { 'User-Agent': 'GlobalEye-News/1.0' } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.response?.results || []).map((article: GuardianArticle) => {
      const title = article.webTitle || '';
      const url = article.webUrl || '';
      const slug = generateSlug(title, url);
      // @ts-expect-error - assignCategoryToArticle accepts multiple article types
      const newsCategory = assignCategoryToArticle(article, detectCategory, category);
      return {
        source: { id: 'guardian', name: 'The Guardian' },
        author: article.fields?.byline || null,
        title: title,
        description: article.fields?.trailText || null,
        url: url,
        urlToImage: article.fields?.thumbnail || null,
        publishedAt: article.webPublicationDate || '',
        content: article.fields?.bodyText || null,
        slug: slug,
        category: newsCategory
      };
    });
  } catch { return []; }
}

async function fetchFromMediastack(category: string): Promise<NewsArticle[]> {
  if (!MEDIASTACK_KEY) return [];
  try {
    const url = `http://api.mediastack.com/v1/news?access_key=${MEDIASTACK_KEY}&categories=${category}&languages=en&countries=us&limit=20`;
    const res = await fetch(url, { next: { revalidate: 900 }, headers: { 'User-Agent': 'GlobalEye-News/1.0' } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data || []).map((article: MediastackArticle) => {
      const title = article.title || '';
      const url = article.url || '';
      const slug = generateSlug(title, url);
      // @ts-expect-error - assignCategoryToArticle accepts multiple article types
      const newsCategory = assignCategoryToArticle(article, detectCategory, category);
      return {
        source: { id: null, name: article.source || 'Mediastack' },
        author: article.author || null,
        title: title,
        description: article.description || null,
        url: url,
        urlToImage: article.image || null,
        publishedAt: article.published_at || '',
        content: null,
        slug: slug,
        category: newsCategory
      };
    });
  } catch { return []; }
}

// Helper function to execute a promise with a timeout
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => {
      resolve(null);
    }, ms))
  ]);
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