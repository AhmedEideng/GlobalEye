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

// نوع يمثل صف الأخبار من قاعدة البيانات
interface NewsRow {
  source_id: string | null;
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
    return (data.articles || []).map((article: NewsAPIArticle) => ({
      source: { id: article.source?.id || null, name: article.source?.name || 'Unknown' },
      author: article.author || null,
      title: article.title || '',
      description: article.description || null,
      url: article.url || '',
      urlToImage: article.urlToImage || null,
      publishedAt: article.publishedAt || '',
      content: article.content || null
    }));
  } catch { return []; }
}

async function fetchFromGNews(category: string): Promise<NewsArticle[]> {
  if (!GNEWS_API_KEY) return [];
  try {
    const url = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&country=us&max=20&apikey=${GNEWS_API_KEY}`;
    const res = await fetch(url, { next: { revalidate: 900 }, headers: { 'User-Agent': 'GlobalEye-News/1.0' } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.articles || []).map((article: GNewsArticle) => ({
      source: { id: null, name: article.source?.name || 'GNews' },
      author: article.author || null,
      title: article.title || '',
      description: article.description || null,
      url: article.url || '',
      urlToImage: article.image || null,
      publishedAt: article.publishedAt || '',
      content: article.content || null
    }));
  } catch { return []; }
}

async function fetchFromGuardian(category: string): Promise<NewsArticle[]> {
  if (!GUARDIAN_KEY) return [];
  try {
    const url = `https://content.guardianapis.com/search?section=${category}&show-fields=all&page-size=20&api-key=${GUARDIAN_KEY}`;
    const res = await fetch(url, { next: { revalidate: 900 }, headers: { 'User-Agent': 'GlobalEye-News/1.0' } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.response?.results || []).map((article: GuardianArticle) => ({
      source: { id: 'guardian', name: 'The Guardian' },
      author: article.fields?.byline || null,
      title: article.webTitle || '',
      description: article.fields?.trailText || null,
      url: article.webUrl || '',
      urlToImage: article.fields?.thumbnail || null,
      publishedAt: article.webPublicationDate || '',
      content: article.fields?.bodyText || null
    }));
  } catch { return []; }
}

async function fetchFromMediastack(category: string): Promise<NewsArticle[]> {
  if (!MEDIASTACK_KEY) return [];
  try {
    const url = `http://api.mediastack.com/v1/news?access_key=${MEDIASTACK_KEY}&categories=${category}&languages=en&countries=us&limit=20`;
    const res = await fetch(url, { next: { revalidate: 900 }, headers: { 'User-Agent': 'GlobalEye-News/1.0' } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data || []).map((article: MediastackArticle) => ({
      source: { id: null, name: article.source || 'Mediastack' },
      author: article.author || null,
      title: article.title || '',
      description: article.description || null,
      url: article.url || '',
      urlToImage: article.image || null,
      publishedAt: article.published_at || '',
      content: null
    }));
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

// دالة مساعدة لتوليد slug من العنوان أو الرابط
function generateSlug(title: string, url: string): string {
  // استخدم العنوان إذا كان متاحاً، وإلا استخدم hash من الرابط
  if (title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) + '-' + Math.abs(hashCode(url)).toString();
  }
  return Math.abs(hashCode(url)).toString();
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

// دالة لحفظ الأخبار في Supabase
async function saveArticlesToSupabase(articles: NewsArticle[], category: string) {
  if (!articles.length) return;
  // تجهيز البيانات لتتوافق مع الجدول
  const mapped = articles.map(article => ({
    title: article.title,
    description: article.description,
    url: article.url,
    url_to_image: article.urlToImage,
    published_at: article.publishedAt ? new Date(article.publishedAt) : null,
    content: article.content,
    source_name: article.source.name,
    source_id: article.source.id,
    author: article.author,
    slug: generateSlug(article.title, article.url),
    category,
  }));
  // إدخال الأخبار مع تجاهل المكررات بناءً على url
  await supabase.from('news').upsert(mapped, { onConflict: 'url' });
}

export async function fetchNews(category: string = 'general'): Promise<NewsArticle[]> {
  // Try to fetch news from Supabase first
  const { data: dbArticles, error } = await supabase
    .from('news')
    .select('*')
    .eq('category', category)
    .order('published_at', { ascending: false })
    .limit(30);

  // If we have recent news in the DB, return it
  if (!error && dbArticles && dbArticles.length > 0) {
    return dbArticles.map((article: NewsRow) => ({
      source: { id: article.source_id, name: article.source_name },
      author: article.author,
      title: article.title,
      description: article.description,
      url: article.url,
      urlToImage: article.url_to_image,
      publishedAt: article.published_at,
      content: article.content,
      slug: article.slug,
    }));
  }

  // Otherwise, fetch from APIs and upsert
  // Each source is fetched with a 3-second timeout
  const sources = [
    { fn: fetchFromNewsAPI },
    { fn: fetchFromGNews },
    { fn: fetchFromGuardian },
    { fn: fetchFromMediastack },
  ];
  const promises = sources.map(({ fn }) =>
    withTimeout(
      fn(category),
      3000
    )
  );
  const results = await Promise.all(promises);
  // Ignore sources that failed or timed out
  const all = results.filter(Boolean).flat() as NewsArticle[];
  const unique = all.filter((item, idx, arr) => arr.findIndex(a => a.url === item.url) === idx);
  unique.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  // حفظ الأخبار في Supabase مع category
  await saveArticlesToSupabase(unique, category);
  console.log("DEBUG: fetchNews result", unique);
  return unique;
}

export async function fetchRelatedNews(currentArticle: NewsArticle, category: string = 'general'): Promise<NewsArticle[]> {
  try {
    // Get news from the same category, excluding the current article
    const articles = await fetchNews(category);
    return articles
      .filter(article => article.url !== currentArticle.url)
      .slice(0, 6); // Return up to 6 related articles
  } catch (error) {
    console.error('Failed to fetch related news:', error);
    return [];
  }
}

export async function getArticleBySlug(slug: string): Promise<NewsArticle | null> {
  try {
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
      };
    }
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

export async function fetchAllNews(): Promise<NewsArticle[]> {
  const { data: dbArticles, error } = await supabase
    .from('news')
    .select('*')
    .order('published_at', { ascending: false });

  if (!error && dbArticles && dbArticles.length > 0) {
    return dbArticles.map((article: NewsRow) => ({
      source: { id: article.source_id, name: article.source_name },
      author: article.author,
      title: article.title,
      description: article.description,
      url: article.url,
      urlToImage: article.url_to_image,
      publishedAt: article.published_at,
      content: article.content,
      slug: article.slug,
    }));
  }
  return [];
} 