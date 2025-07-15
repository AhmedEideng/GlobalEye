// fetchExternalNews.ts

export type ExternalNewsArticle = {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
};

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
const GUARDIAN_API_KEY = process.env.GUARDIAN_API_KEY;
const MEDIASTACK_KEY = process.env.MEDIASTACK_KEY;

export async function fetchExternalNews(category: string = 'general'): Promise<ExternalNewsArticle[]> {
  // جلب من جميع المصادر بالتوازي
  const [newsapi, gnews, guardian, mediastack] = await Promise.all([
    fetchFromNewsAPI(category),
    fetchFromGNews(category),
    fetchFromGuardian(category),
    fetchFromMediastack(category),
  ]);
  // دمج النتائج وإزالة التكرار حسب url
  const all = [...newsapi, ...gnews, ...guardian, ...mediastack];
  const unique = all.filter((article, idx, arr) =>
    article.url && arr.findIndex(a => a.url === article.url) === idx
  );
  return unique;
}

// إعادة تسمية الدالة القديمة لجلب NewsAPI فقط
async function fetchFromNewsAPI(category: string = 'general'): Promise<ExternalNewsArticle[]> {
  if (!NEWS_API_KEY) return [];
  const url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&pageSize=20&apiKey=${NEWS_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.articles || []).map((article: any) => ({
    source: { id: article.source?.id || null, name: article.source?.name || 'Unknown' },
    author: article.author || null,
    title: article.title || '',
    description: article.description || null,
    url: article.url || '',
    urlToImage: article.urlToImage || null,
    publishedAt: article.publishedAt || '',
    content: article.content || null,
  }));
}

export async function fetchFromGNews(category: string = 'general'): Promise<ExternalNewsArticle[]> {
  if (!GNEWS_API_KEY) return [];
  const url = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&country=us&max=20&apikey=${GNEWS_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.articles || []).map((article: any) => ({
    source: { id: null, name: article.source?.name || 'GNews' },
    author: article.author || null,
    title: article.title || '',
    description: article.description || null,
    url: article.url || '',
    urlToImage: article.image || null,
    publishedAt: article.publishedAt || '',
    content: article.content || null,
  }));
}

export async function fetchFromGuardian(category: string = 'general'): Promise<ExternalNewsArticle[]> {
  if (!GUARDIAN_API_KEY) return [];
  const url = `https://content.guardianapis.com/search?section=${category}&show-fields=all&page-size=20&api-key=${GUARDIAN_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.response?.results || []).map((article: any) => ({
    source: { id: 'guardian', name: 'The Guardian' },
    author: article.fields?.byline || null,
    title: article.webTitle || '',
    description: article.fields?.trailText || null,
    url: article.webUrl || '',
    urlToImage: article.fields?.thumbnail || null,
    publishedAt: article.webPublicationDate || '',
    content: article.fields?.bodyText || null,
  }));
}

export async function fetchFromMediastack(category: string = 'general'): Promise<ExternalNewsArticle[]> {
  if (!MEDIASTACK_KEY) return [];
  const url = `http://api.mediastack.com/v1/news?access_key=${MEDIASTACK_KEY}&categories=${category}&languages=en&countries=us&limit=20`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.data || []).map((article: any) => ({
    source: { id: null, name: article.source || 'Mediastack' },
    author: article.author || null,
    title: article.title || '',
    description: article.description || null,
    url: article.url || '',
    urlToImage: article.image || null,
    publishedAt: article.published_at || '',
    content: null,
  }));
} 