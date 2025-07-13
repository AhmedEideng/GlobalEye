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
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
const GUARDIAN_KEY = process.env.GUARDIAN_KEY;
const MEDIASTACK_KEY = process.env.MEDIASTACK_KEY;

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
 * Fetches news articles for a given category from the database or APIs, sorted from newest to oldest.
 * If no recent news in the DB, fetches from APIs and saves to DB.
 * @param category - The news category (default: 'general')
 * @returns Promise<NewsArticle[]>
 */
export async function fetchNews(category: string = 'general'): Promise<NewsArticle[]> {
  // Check cache first
  const cached = newsCache.get(category);
  if (cached) return cached;

  // 1. Fetch latest news from the database (e.g., last hour)
  const { data: dbArticles, error } = await supabase
    .from('news')
    .select('*, categories(name)')
    .eq('category_id', await getOrAddCategoryId(category))
    .order('published_at', { ascending: false })
    .limit(50);

  // If we find recent news (e.g., published within the last hour), return it immediately
  if (!error && dbArticles && dbArticles.length > 0) {
    const now = new Date();
    const latest = new Date(dbArticles[0].published_at);
    const diffMinutes = (now.getTime() - latest.getTime()) / (1000 * 60);
    if (diffMinutes < 60) { // Less than an hour
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
  }

  // 2. If no recent news, fetch from external APIs and update the database
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
  const all = results.filter(Boolean).flat().filter((article): article is NewsArticle => article !== null && article !== undefined) as NewsArticle[];
  // ====== Merge similar news into unique and long articles ======
  const groups = groupSimilarArticles(all, 0.5); // threshold can be adjusted as needed
  const mergedArticles = groups.map(group => mergeArticlesGroup(group));
  mergedArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  if (mergedArticles.length > 0) {
    await saveArticlesToSupabase(mergedArticles, category);
  }

  // Fetch latest news from the database after update
  const { data: freshDbArticles, error: freshError } = await supabase
    .from('news')
    .select('*, categories(name)')
    .eq('category_id', await getOrAddCategoryId(category))
    .order('published_at', { ascending: false })
    .limit(50);

  if (!freshError && freshDbArticles && freshDbArticles.length > 0) {
    const result = freshDbArticles.map((article: NewsWithCategory) => ({
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

  // Fallback: Fetch or add the category and get its id
  const { data: oldArticles, error: oldError } = await supabase
    .from('news')
    .select('*, categories(name)')
    .eq('category_id', await getOrAddCategoryId(category))
    .order('published_at', { ascending: true })
    .limit(50);
  if (!oldError && oldArticles && oldArticles.length > 0) {
    const result = oldArticles.map((article: NewsWithCategory) => ({
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
    // Fetch or add the category and get its id
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

// ====== Text Similarity & Merging Utilities ======
// Calculate Jaccard similarity between two word sets
function jaccardSimilarity(a: string, b: string): number {
  const setA = new Set(a.toLowerCase().split(/\W+/));
  const setB = new Set(b.toLowerCase().split(/\W+/));
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

// Jaro-Winkler (pure JS)
function jaroWinklerSimilarity(s1: string, s2: string): number {
  // Jaro distance
  const m = Math.max(s1.length, s2.length);
  if (m === 0) return 1;
  const matchWindow = Math.floor(Math.max(s1.length, s2.length) / 2) - 1;
  const s1Matches = new Array(s1.length).fill(false);
  const s2Matches = new Array(s2.length).fill(false);
  let matches = 0;
  for (let i = 0; i < s1.length; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, s2.length);
    for (let j = start; j < end; j++) {
      if (!s2Matches[j] && s1[i] === s2[j]) {
        s1Matches[i] = true;
        s2Matches[j] = true;
        matches++;
        break;
      }
    }
  }
  if (matches === 0) return 0;
  let t = 0;
  let k = 0;
  for (let i = 0; i < s1.length; i++) {
    if (s1Matches[i]) {
      while (!s2Matches[k]) k++;
      if (s1[i] !== s2[k]) t++;
      k++;
    }
  }
  t = t / 2;
  const jaro = (matches / s1.length + matches / s2.length + (matches - t) / matches) / 3;
  // Winkler boost
  let l = 0;
  while (l < 4 && s1[l] && s2[l] && s1[l] === s2[l]) l++;
  return jaro + l * 0.1 * (1 - jaro);
}

// Function to group similar news into groups
function groupSimilarArticles(articles: NewsArticle[], threshold = 0.5): NewsArticle[][] {
  const groups: NewsArticle[][] = [];
  const used = new Array(articles.length).fill(false);
  for (let i = 0; i < articles.length; i++) {
    if (used[i]) continue;
    const currentArticle = articles[i];
    if (!currentArticle) continue;
    
    const group = [currentArticle];
    used[i] = true;
    for (let j = i + 1; j < articles.length; j++) {
      if (used[j]) continue;
      const compareArticle = articles[j];
      if (!compareArticle) continue;
      
      // Similarity based on title + content
      const simTitle = jaccardSimilarity(currentArticle.title, compareArticle.title);
      const simContent = jaroWinklerSimilarity(
        (currentArticle.content || '') + ' ' + (currentArticle.description || ''),
        (compareArticle.content || '') + ' ' + (compareArticle.description || '')
      );
      if (simTitle > threshold || simContent > threshold) {
        group.push(compareArticle);
        used[j] = true;
      }
    }
    groups.push(group);
  }
  return groups;
}

function extractSummary(content: string, maxSentences = 3): string {
  // Split text into sentences
  const sentences = content.match(/[^.!؟\n]+[.!؟]?/g) || [];
  if (sentences.length <= maxSentences) return content;
  // Calculate word frequency
  const wordCounts: Record<string, number> = {};
  const words = content.toLowerCase().split(/\W+/).filter(Boolean);
  words.forEach(w => { wordCounts[w] = (wordCounts[w] || 0) + 1; });
  // Evaluate each sentence based on sum of word frequencies and length
  const scored = sentences.map(s => {
    const sWords = s.toLowerCase().split(/\W+/).filter(Boolean);
    const score = sWords.reduce((sum, w) => sum + (wordCounts[w] || 0), 0) + sWords.length;
    return { s, score };
  });
  // Sort sentences by score
  scored.sort((a, b) => b.score - a.score);
  // Take the best sentences
  const summary = scored.slice(0, maxSentences).map(x => x.s.trim()).join(' ');
  return summary;
}

// Merge news texts in one group into a long and unique article
function mergeArticlesGroup(group: NewsArticle[]): NewsArticle {
  if (group.length === 1) return group[0]!;
  if (group.length === 0) {
    // Return a default article if group is empty
    return {
      source: { id: null, name: 'Unknown' },
      author: null,
      title: '',
      description: null,
      url: '',
      urlToImage: null,
      publishedAt: new Date().toISOString(),
      content: null,
      slug: '',
      category: 'general'
    };
  }
  // Merge titles (take the most frequent or the longest)
  const title = group.map(a => a.title).sort((a, b) => b.length - a.length)[0] || '';
  // Merge descriptions
  const description = group.map(a => a.description).filter(Boolean).join(' | ');
  // Merge content (remove smart repetition of paragraphs)
  const allContents = group.map(a => a.content || '').join('\n\n');
  const paragraphs = allContents.split(/\n+/).map(p => p.trim()).filter(Boolean);
  // Remove very similar paragraphs using Jaro-Winkler
  const uniqueParagraphs: string[] = [];
  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i] ?? '';
    // If the paragraph is very similar to a previous one (>0.88) skip it
    if (uniqueParagraphs.filter(Boolean).some(up => jaroWinklerSimilarity(up, para) > 0.88)) continue;
    uniqueParagraphs.push(para);
  }
  // Sort paragraphs: longest first (or later chronologically if timestamps are available)
  uniqueParagraphs.sort((a, b) => b.length - a.length);
  const content = uniqueParagraphs.join('\n\n');
  // ====== Add news summary at the end of the article ======
  const summary = extractSummary(content, 3);
  let contentWithSummary = content + '\n\nSummary: ' + summary;
  // ====== Add sources list at the end of the article ======
  const sourcesList = group
    .map(a => `- [${a.source.name || 'Source'}](${a.url})`)
    .filter((v, i, arr) => arr.indexOf(v) === i) // Remove duplicates
    .join('\n');
  contentWithSummary += `\n\nSources:\n${sourcesList}`;
  // Take the first available image
  const urlToImage = group.find(a => a.urlToImage)?.urlToImage || null;
  // Take the first link (or combine sources)
  const url = group[0]?.url || '';
  // Take the first author
  const author = group.find(a => a.author)?.author || null;
  // Take the latest publication date
  const publishedAt = group.map(a => a.publishedAt).sort().reverse()[0] || '';
  // Combine source names
  const sourceNames = Array.from(new Set(group.map(a => a.source.name)));
  const source = { id: null, name: sourceNames.join(' + ') };
  // Use slug from longest title
  const slug = group.map(a => a.slug).sort((a, b) => b.length - a.length)[0] || '';
  // Take the category
  const category = group[0]?.category || 'general';
  return { source, author, title, description, url, urlToImage, publishedAt, content: contentWithSummary, slug, category };
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