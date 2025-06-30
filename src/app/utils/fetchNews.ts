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
};

// DEBUG: Hardcoded API keys for production troubleshooting
const NEWS_API_KEY = process.env.NEWS_API_KEY!;
const GNEWS_API_KEY = process.env.GNEWS_API_KEY!;
const GUARDIAN_KEY = process.env.GUARDIAN_KEY!;
const MEDIASTACK_KEY = process.env.MEDIASTACK_KEY!;

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

// دالة لحفظ الأخبار في Supabase
async function saveArticlesToSupabase(articles: NewsArticle[]) {
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
  }));
  // إدخال الأخبار مع تجاهل المكررات بناءً على url
  await supabase.from('news').upsert(mapped, { onConflict: 'url' });
}

export async function fetchNews(category: string = 'general'): Promise<NewsArticle[]> {
  // Only fetch directly from APIs
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
  // حفظ الأخبار في Supabase
  await saveArticlesToSupabase(unique);
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

export async function getArticleByUrl(encodedUrl: string): Promise<NewsArticle | null> {
  try {
    const decodedUrl = decodeURIComponent(encodedUrl);
    
    // Try to find the article in recent news
    const allCategories = ['general', 'business', 'technology', 'sports', 'entertainment', 'health', 'science', 'politics'];
    
    for (const category of allCategories) {
      const articles = await fetchNews(category);
      const article = articles.find(article => article.url === decodedUrl);
      if (article) {
        return article;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting article by URL:', error);
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