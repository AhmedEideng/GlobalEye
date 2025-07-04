import { supabase } from './supabaseClient';

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

// Type representing a news row from the database
interface NewsRow {
  source_name: string;
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  url_to_image: string | null;
  published_at: string;
  content: string | null;
  slug: string;
  category: string;
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
      return {
      source: { id: article.source?.id || null, name: article.source?.name || 'Unknown' },
      author: article.author || null,
        title: title,
      description: article.description || null,
        url: url,
      urlToImage: article.urlToImage || null,
      publishedAt: article.publishedAt || '',
        content: article.content || null,
        slug: slug
      };
    });
    console.log("DEBUG: NewsAPI articles with images:", articles.filter((a: NewsArticle) => a.urlToImage).length, "out of", articles.length);
    if (articles.length > 0) {
      console.log("DEBUG: First NewsAPI article image:", articles[0].urlToImage);
      console.log("DEBUG: First NewsAPI article slug:", articles[0].slug);
    }
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
      return {
      source: { id: null, name: article.source?.name || 'GNews' },
      author: article.author || null,
        title: title,
      description: article.description || null,
        url: url,
      urlToImage: article.image || null,
      publishedAt: article.publishedAt || '',
        content: article.content || null,
        slug: slug
      };
    });
    console.log("DEBUG: GNews articles with images:", articles.filter((a: NewsArticle) => a.urlToImage).length, "out of", articles.length);
    if (articles.length > 0) {
      console.log("DEBUG: First GNews article image:", articles[0].urlToImage);
      console.log("DEBUG: First GNews article slug:", articles[0].slug);
    }
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
      return {
      source: { id: 'guardian', name: 'The Guardian' },
      author: article.fields?.byline || null,
        title: title,
      description: article.fields?.trailText || null,
        url: url,
      urlToImage: article.fields?.thumbnail || null,
      publishedAt: article.webPublicationDate || '',
        content: article.fields?.bodyText || null,
        slug: slug
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
      return {
      source: { id: null, name: article.source || 'Mediastack' },
      author: article.author || null,
        title: title,
      description: article.description || null,
        url: url,
      urlToImage: article.image || null,
      publishedAt: article.published_at || '',
        content: null,
        slug: slug
      };
    });
  } catch { return []; }
}

// Helper function to execute a promise with a timeout
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => {
      console.log(`DEBUG: API request timed out after ${ms}ms`);
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

// دالة hash بسيطة
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

// Enhanced function to save articles to Supabase
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
    // Prepare data to match the table structure
    const mapped = filtered.map(article => {
      // Ensure slug exists, if not generate it
      let finalSlug = article.slug;
      if (!finalSlug || finalSlug === '' || finalSlug === 'null') {
        finalSlug = generateSlug(article.title, article.url);
        console.log("DEBUG: Generated new slug for:", article.title?.slice(0, 50), "->", finalSlug);
      } else {
        console.log("DEBUG: Using existing slug for:", article.title?.slice(0, 50), "->", finalSlug);
      }
      // Clean image URL
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
        category,
      };
    });
    console.log("DEBUG: Saving articles to DB, articles with images:", mapped.filter(a => a.url_to_image).length, "out of", mapped.length);
    // Insert articles while ignoring duplicates based on url
    const { error } = await supabase.from('news').upsert(mapped, { onConflict: 'url' });
    if (error) {
      console.error("DEBUG: Error saving articles to Supabase:", error.message || error);
    } else {
      console.log("DEBUG: Successfully saved", mapped.length, "articles to Supabase");
    }
  } catch (error) {
    console.error("DEBUG: Exception in saveArticlesToSupabase:", error);
  }
}

export async function fetchNews(category: string = 'general'): Promise<NewsArticle[]> {
  console.log(`DEBUG: fetchNews called for category: ${category}`);
  
  // Try to fetch news from Supabase first
  const { data: dbArticles, error } = await supabase
    .from('news')
    .select('*')
    .eq('category', category)
    .order('published_at', { ascending: false })
    .limit(30);

  // If we have recent news in the DB, return it
  if (!error && dbArticles && dbArticles.length > 0) {
    const mappedArticles = dbArticles.map((article: NewsRow) => ({
      source: { id: null, name: article.source_name },
      author: article.author,
      title: article.title,
      description: article.description,
      url: article.url,
      urlToImage: article.url_to_image,
      publishedAt: article.published_at,
      content: article.content,
      slug: article.slug,
    }));
    console.log(`DEBUG: fetchNews - Reading from DB for ${category}, articles with images:`, mappedArticles.filter((a: NewsArticle) => a.urlToImage).length, "out of", mappedArticles.length);
    if (mappedArticles.length > 0) {
      console.log(`DEBUG: fetchNews - First DB article image for ${category}:`, mappedArticles[0].urlToImage);
    }
    return mappedArticles;
  }

  console.log(`DEBUG: No data in DB for ${category}, fetching from APIs...`);

  // Otherwise, fetch from APIs and upsert
  // Each source is fetched with a 8-second timeout (increased from 3)
  const sources = [
    { fn: fetchFromNewsAPI, name: 'NewsAPI' },
    { fn: fetchFromGNews, name: 'GNews' },
    { fn: fetchFromGuardian, name: 'Guardian' },
    { fn: fetchFromMediastack, name: 'Mediastack' },
  ];
  
  console.log(`DEBUG: Starting API calls for ${category}...`);
  const promises = sources.map(({ fn, name }) =>
    withTimeout(
      fn(category).then(result => {
        console.log(`DEBUG: ${name} returned ${result.length} articles for ${category}`);
        return result;
      }),
      8000 // Increased timeout to 8 seconds
    )
  );
  
  const results = await Promise.all(promises);
  // Ignore sources that failed or timed out
  const all = results.filter(Boolean).flat() as NewsArticle[];
  const unique = all.filter((item, idx, arr) => arr.findIndex(a => a.url === item.url) === idx);
  unique.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  
  console.log(`DEBUG: Total unique articles for ${category}:`, unique.length);
  console.log(`DEBUG: Articles with images for ${category}:`, unique.filter(a => a.urlToImage).length);
  
  // Save articles to Supabase with category
  if (unique.length > 0) {
  await saveArticlesToSupabase(unique, category);
  }
  
  console.log(`DEBUG: fetchNews result for ${category}:`, unique.length, "articles");
  return unique;
}

export async function fetchRelatedNews(currentArticle: NewsArticle, category: string = 'general'): Promise<NewsArticle[]> {
  try {
    // Get news from the same category, excluding the current article
    const articles = await fetchNews(category);
    return articles
      .filter(article => article.url !== currentArticle.url)
      .slice(0, 15); // Return up to 15 related articles
  } catch (error) {
    console.error('Failed to fetch related news:', error);
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
      console.error("DEBUG: Error fetching database contents:", error);
      return;
    }
    
    console.log("DEBUG: Recent articles in database:");
    data?.forEach((article, index) => {
      console.log(`${index + 1}. Title: ${article.title?.slice(0, 50)}...`);
      console.log(`   Slug: ${article.slug}`);
      console.log(`   Category: ${article.category}`);
      console.log('---');
    });
  } catch (error) {
    console.error("DEBUG: Error in debugDatabaseContents:", error);
  }
}

export async function getArticleBySlug(slug: string): Promise<NewsArticle | null> {
  console.log("DEBUG: getArticleBySlug called with slug:", slug);
  
  try {
    // Strategy 1: Exact slug match
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('slug', slug)
      .limit(1)
      .single();
    
    if (!error && data) {
      console.log("DEBUG: Found article with exact slug match:", data.title);
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
      };
    }
    
    console.log("DEBUG: Exact slug match failed, trying partial match...");
    
    // Strategy 2: Partial slug match (first 3 words)
    const slugWords = slug.split('-').slice(0, 3).join('-');
    const { data: partialData, error: partialError } = await supabase
      .from('news')
      .select('*')
      .ilike('slug', `%${slugWords}%`)
      .limit(5);
    
    if (!partialError && partialData && partialData.length > 0) {
      console.log("DEBUG: Found articles with partial slug match:", partialData.length);
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
      };
    }
    
    console.log("DEBUG: Partial slug match failed, trying title search...");
    
    // Strategy 3: Search by title (convert slug back to title-like search)
    const titleSearch = slug.replace(/-/g, ' ').replace(/\d+$/, '').trim();
    const { data: titleData, error: titleError } = await supabase
      .from('news')
      .select('*')
      .ilike('title', `%${titleSearch}%`)
      .limit(5);
    
    if (!titleError && titleData && titleData.length > 0) {
      console.log("DEBUG: Found articles with title search:", titleData.length);
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
      };
    }
    
    console.log("DEBUG: All search strategies failed for slug:", slug);
    return null;
    
  } catch (error) {
    console.error('Error getting article by slug:', error);
    return null;
  }
}

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

// Enhanced function to update all existing articles with slugs
export async function updateAllArticlesWithSlugs() {
  console.log("DEBUG: Starting to update all articles with slugs...");
  try {
    // Fetch all articles from database
    const { data: allArticles, error: fetchError } = await supabase
      .from('news')
      .select('*')
      .order('published_at', { ascending: false });
    
    if (fetchError) {
      console.error("DEBUG: Error fetching articles:", fetchError);
      return { success: false, error: fetchError.message };
    }
    
    if (!allArticles || allArticles.length === 0) {
      console.log("DEBUG: No articles found in database");
      return { success: true, message: "No articles found in database" };
    }
    
    console.log(`DEBUG: Found ${allArticles.length} articles in database`);
    
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
      console.log("DEBUG: All articles already have good slugs");
      return { success: true, message: "All articles already have good slugs" };
    }
    
    console.log(`DEBUG: Found ${articlesNeedingSlugs.length} articles needing slugs`);
    console.log(`DEBUG: Found ${articlesWithPoorSlugs.length} articles with poor slugs`);
    console.log(`DEBUG: Total articles to update: ${allArticlesToUpdate.length}`);
    
    // Update each article with improved slug
    const updates = allArticlesToUpdate.map(article => {
      const newSlug = generateSlug(article.title, article.url);
      console.log(`DEBUG: Generating slug for "${article.title?.slice(0, 50)}..." -> ${newSlug}`);
      
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
      console.error("DEBUG: Error updating articles with slugs:", updateError);
      return { success: false, error: updateError.message };
    }
    
    console.log(`DEBUG: Successfully updated ${updates.length} articles with slugs`);
    return { 
      success: true, 
      message: `Updated ${updates.length} articles with slugs`,
      details: {
        articlesNeedingSlugs: articlesNeedingSlugs.length,
        articlesWithPoorSlugs: articlesWithPoorSlugs.length,
        totalUpdated: updates.length
      }
    };
    
  } catch (error) {
    console.error("DEBUG: Error in updateAllArticlesWithSlugs:", error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Function to check slug status in database
export async function checkSlugsStatus() {
  console.log("DEBUG: Checking slugs status in database...");
  try {
    const { data: allArticles, error: fetchError } = await supabase
      .from('news')
      .select('id, title, slug, published_at')
      .order('published_at', { ascending: false });
    
    if (fetchError) {
      console.error("DEBUG: Error fetching articles:", fetchError);
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
    console.error("DEBUG: Error in checkSlugsStatus:", error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Function to improve specific slug
export async function improveSpecificSlug(articleId: string) {
  console.log("DEBUG: Improving slug for article ID:", articleId);
  try {
    const { data: article, error: fetchError } = await supabase
      .from('news')
      .select('*')
      .eq('id', articleId)
      .single();
    
    if (fetchError || !article) {
      console.error("DEBUG: Error fetching article:", fetchError);
      return { success: false, error: "Article not found" };
    }
    
    const newSlug = generateSlug(article.title, article.url);
    console.log(`DEBUG: Improving slug for "${article.title}" from "${article.slug}" to "${newSlug}"`);
    
    const { error: updateError } = await supabase
      .from('news')
      .update({ slug: newSlug })
      .eq('id', articleId);
    
    if (updateError) {
      console.error("DEBUG: Error updating article slug:", updateError);
      return { success: false, error: updateError.message };
    }
    
    return { 
      success: true, 
      message: "Slug improved successfully",
      oldSlug: article.slug,
      newSlug: newSlug
    };
    
  } catch (error) {
    console.error("DEBUG: Error in improveSpecificSlug:", error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// دالة مساعدة لتنظيف روابط الصور
export function cleanImageUrl(url: string | null): string | null {
  if (!url) return null;
  
  // إصلاح الروابط التي تبدأ بـ //
  if (url.startsWith('//')) {
    return 'https:' + url;
  }
  
  // إصلاح الروابط التي تبدأ بـ http:// (تحويلها إلى https://)
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  
  return url;
} 