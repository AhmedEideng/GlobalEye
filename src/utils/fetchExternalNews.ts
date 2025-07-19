// ← أضيفي هذا في أعلى الملف
import { logSnagEvent } from '@utils/logsnag';

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

// Validate API keys
const NEWS_API_KEY = process.env.NEWS_API_KEY?.trim();
const GNEWS_API_KEY = process.env.GNEWS_API_KEY?.trim();
const GUARDIAN_API_KEY = process.env.GUARDIAN_API_KEY?.trim();
const MEDIASTACK_KEY = process.env.MEDIASTACK_KEY?.trim();

// Helper function to validate API key format
const isValidApiKey = (key: string | undefined): boolean => {
  return typeof key === 'string' && key.length > 0 && key !== 'undefined';
};

export async function fetchExternalNews(category = 'general'): Promise<ExternalNewsArticle[]> {
  let newsapi: ExternalNewsArticle[] = [];
  let gnews: ExternalNewsArticle[] = [];
  let guardian: ExternalNewsArticle[] = [];
  let mediastack: ExternalNewsArticle[] = [];

  // Only fetch from APIs with valid keys
  if (isValidApiKey(NEWS_API_KEY)) {
    try { 
      newsapi = await fetchFromNewsAPI(category); 
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.debug('NewsAPI fetch failed:', error);
      }
    }
  }
  
  if (isValidApiKey(GNEWS_API_KEY)) {
    try { 
      gnews = await fetchFromGNews(category); 
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.debug('GNews fetch failed:', error);
      }
    }
  }
  
  if (isValidApiKey(GUARDIAN_API_KEY)) {
    try { 
      guardian = await fetchFromGuardian(category); 
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.debug('Guardian fetch failed:', error);
      }
    }
  }
  
  if (isValidApiKey(MEDIASTACK_KEY)) {
    try { 
      mediastack = await fetchFromMediastack(category); 
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.debug('Mediastack fetch failed:', error);
      }
    }
  }

  const all = [...newsapi, ...gnews, ...guardian, ...mediastack];
  const unique = all.filter((article, idx, arr) =>
    article.url && arr.findIndex(a => a.url === article.url) === idx
  );
  return unique;
}

async function fetchFromNewsAPI(category: string): Promise<ExternalNewsArticle[]> {
  if (!NEWS_API_KEY) return [];
  const url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&pageSize=20&apiKey=${NEWS_API_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("NewsAPI response not ok");
    const data = await res.json();

    await logSnagEvent("NewsAPI ✅", `تم جلب ${data.articles.length} خبر من NewsAPI (${category})`);

    return (data.articles || []).map((article: Record<string, unknown>) => ({
      source: {
        id: typeof article.source === 'object' && article.source && 'id' in article.source ? (article.source as Record<string, unknown>).id as string ?? null : null,
        name: typeof article.source === 'object' && article.source && 'name' in article.source ? (article.source as Record<string, unknown>).name as string ?? 'Unknown' : 'Unknown',
      },
      author: article.author as string ?? null,
      title: article.title as string ?? '',
      description: article.description as string ?? null,
      url: article.url as string ?? '',
      urlToImage: article.urlToImage as string ?? null,
      publishedAt: article.publishedAt as string ?? '',
      content: article.content as string ?? null,
    }));
  } catch (error: unknown) {
    await logSnagEvent("NewsAPI ❌", `فشل جلب أخبار ${category}: ${error instanceof Error ? error.message : error}`);
    return [];
  }
}

export async function fetchFromGNews(category: string): Promise<ExternalNewsArticle[]> {
  if (!GNEWS_API_KEY) return [];
  const url = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&country=us&max=20&apikey=${GNEWS_API_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("GNews response not ok");
    const data = await res.json();

    await logSnagEvent("GNews ✅", `تم جلب ${data.articles.length} خبر من GNews (${category})`);

    return (data.articles || []).map((article: Record<string, unknown>) => ({
      source: {
        id: null,
        name: typeof article.source === 'object' && article.source && 'name' in article.source
          ? (article.source as Record<string, unknown>).name as string ?? 'GNews'
          : 'GNews',
      },
      author: article.author as string ?? null,
      title: article.title as string ?? '',
      description: article.description as string ?? null,
      url: article.url as string ?? '',
      urlToImage: article.image as string ?? null,
      publishedAt: article.publishedAt as string ?? '',
      content: article.content as string ?? null,
    }));
  } catch (error: unknown) {
    await logSnagEvent("GNews ❌", `فشل جلب أخبار ${category}: ${error instanceof Error ? error.message : error}`);
    return [];
  }
}

export async function fetchFromGuardian(category: string): Promise<ExternalNewsArticle[]> {
  if (!GUARDIAN_API_KEY) return [];
  const url = `https://content.guardianapis.com/search?section=${category}&show-fields=all&page-size=20&api-key=${GUARDIAN_API_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Guardian response not ok");
    const data = await res.json();

    await logSnagEvent("Guardian ✅", `تم جلب ${data.response?.results?.length || 0} خبر من Guardian (${category})`);

    return (data.response?.results || []).map((article: Record<string, unknown>) => ({
      source: { id: 'guardian', name: 'The Guardian' },
      author: typeof article.fields === 'object' && article.fields && 'byline' in article.fields
        ? (article.fields as Record<string, unknown>).byline as string ?? null
        : null,
      title: article.webTitle as string ?? '',
      description: typeof article.fields === 'object' && article.fields && 'trailText' in article.fields
        ? (article.fields as Record<string, unknown>).trailText as string ?? null
        : null,
      url: article.webUrl as string ?? '',
      urlToImage: typeof article.fields === 'object' && article.fields && 'thumbnail' in article.fields
        ? (article.fields as Record<string, unknown>).thumbnail as string ?? null
        : null,
      publishedAt: article.webPublicationDate as string ?? '',
      content: typeof article.fields === 'object' && article.fields && 'bodyText' in article.fields
        ? (article.fields as Record<string, unknown>).bodyText as string ?? null
        : null,
    }));
  } catch (error: unknown) {
    await logSnagEvent("Guardian ❌", `فشل جلب أخبار ${category}: ${error instanceof Error ? error.message : error}`);
    return [];
  }
}

export async function fetchFromMediastack(category: string): Promise<ExternalNewsArticle[]> {
  if (!MEDIASTACK_KEY) return [];
  const url = `http://api.mediastack.com/v1/news?access_key=${MEDIASTACK_KEY}&categories=${category}&languages=en&countries=us&limit=20`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Mediastack response not ok");
    const data = await res.json();

    await logSnagEvent("Mediastack ✅", `تم جلب ${data.data?.length || 0} خبر من Mediastack (${category})`);

    return (data.data || []).map((article: Record<string, unknown>) => ({
      source: { id: null, name: article.source as string ?? 'Mediastack' },
      author: article.author as string ?? null,
      title: article.title as string ?? '',
      description: article.description as string ?? null,
      url: article.url as string ?? '',
      urlToImage: article.image as string ?? null,
      publishedAt: article.published_at as string ?? '',
      content: null,
    }));
  } catch (error: unknown) {
    await logSnagEvent("Mediastack ❌", `فشل جلب أخبار ${category}: ${error instanceof Error ? error.message : error}`);
    return [];
  }
}
