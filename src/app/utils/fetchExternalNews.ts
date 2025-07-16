// src/app/utils/fetchExternalNews.ts

export interface ExternalNewsArticle {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
const GUARDIAN_API_KEY = process.env.GUARDIAN_API_KEY;
const MEDIASTACK_KEY = process.env.MEDIASTACK_KEY;

export async function fetchExternalNews(category: string = 'general'): Promise<ExternalNewsArticle[]> {
  let newsapi: ExternalNewsArticle[] = [];
  let gnews: ExternalNewsArticle[] = [];
  let guardian: ExternalNewsArticle[] = [];
  let mediastack: ExternalNewsArticle[] = [];

  try { newsapi = await fetchFromNewsAPI(category); } catch {}
  try { gnews = await fetchFromGNews(category); } catch {}
  try { guardian = await fetchFromGuardian(category); } catch {}
  try { mediastack = await fetchFromMediastack(category); } catch {}

  const all = [...newsapi, ...gnews, ...guardian, ...mediastack];
  const unique = all.filter((article, idx, arr) =>
    article.url && arr.findIndex(a => a.url === article.url) === idx
  );
  return unique;
}

async function fetchFromNewsAPI(category: string = 'general'): Promise<ExternalNewsArticle[]> {
  if (!NEWS_API_KEY) return [];
  const url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&pageSize=20&apiKey=${NEWS_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.articles || []).map((article: Record<string, unknown>) => ({
    source: { id: (article.source as any)?.id ?? null, name: (article.source as any)?.name ?? 'Unknown' },
    author: article.author as string || null,
    title: article.title as string || '',
    description: article.description as string || null,
    url: article.url as string || '',
    urlToImage: article.urlToImage as string || null,
    publishedAt: article.publishedAt as string || '',
    content: article.content as string || null,
  }));
}

export async function fetchFromGNews(category: string = 'general'): Promise<ExternalNewsArticle[]> {
  if (!GNEWS_API_KEY) return [];
  const url = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&country=us&max=20&apikey=${GNEWS_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.articles || []).map((article: Record<string, unknown>) => ({
    source: { id: null, name: (article.source as any)?.name ?? 'GNews' },
    author: article.author as string || null,
    title: article.title as string || '',
    description: article.description as string || null,
    url: article.url as string || '',
    urlToImage: article.image as string || null,
    publishedAt: article.publishedAt as string || '',
    content: article.content as string || null,
  }));
}

export async function fetchFromGuardian(category: string = 'general'): Promise<ExternalNewsArticle[]> {
  if (!GUARDIAN_API_KEY) return [];
  const url = `https://content.guardianapis.com/search?section=${category}&show-fields=all&page-size=20&api-key=${GUARDIAN_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.response?.results || []).map((article: Record<string, unknown>) => ({
    source: { id: 'guardian', name: 'The Guardian' },
    author: (article.fields as any)?.byline ?? null,
    title: article.webTitle as string || '',
    description: (article.fields as any)?.trailText ?? null,
    url: article.webUrl as string || '',
    urlToImage: (article.fields as any)?.thumbnail ?? null,
    publishedAt: article.webPublicationDate as string || '',
    content: (article.fields as any)?.bodyText ?? null,
  }));
}

export async function fetchFromMediastack(category: string = 'general'): Promise<ExternalNewsArticle[]> {
  if (!MEDIASTACK_KEY) return [];
  const url = `http://api.mediastack.com/v1/news?access_key=${MEDIASTACK_KEY}&categories=${category}&languages=en&countries=us&limit=20`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.data || []).map((article: Record<string, unknown>) => ({
    source: { id: null, name: article.source as string || 'Mediastack' },
    author: article.author as string || null,
    title: article.title as string || '',
    description: article.description as string || null,
    url: article.url as string || '',
    urlToImage: article.image as string || null,
    publishedAt: article.published_at as string || '',
    content: null,
  }));
}
