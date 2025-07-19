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

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 2,
  delayMs: 1000,
  backoffMultiplier: 2
};

// Helper function for retry logic
async function fetchWithRetry<T>(
  fetchFn: () => Promise<T>, 
  sourceName: string, 
  category: string,
  retryCount = 0
): Promise<T> {
  try {
    return await fetchFn();
  } catch (error) {
    if (retryCount < RETRY_CONFIG.maxRetries) {
      const delay = RETRY_CONFIG.delayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, retryCount);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      if (process.env.NODE_ENV === 'development') {
        console.debug(`${sourceName} retry ${retryCount + 1}/${RETRY_CONFIG.maxRetries} for ${category}`);
      }
      
      return fetchWithRetry(fetchFn, sourceName, category, retryCount + 1);
    }
    
    await logSnagEvent(`${sourceName} ❌`, `فشل نهائي بعد ${RETRY_CONFIG.maxRetries} محاولات: ${error instanceof Error ? error.message : error}`);
    throw error;
  }
}

export async function fetchExternalNews(category = 'general'): Promise<ExternalNewsArticle[]> {
  const startTime = Date.now();
  
  // Prepare fetch promises for all valid sources
  const fetchPromises: Promise<ExternalNewsArticle[]>[] = [];
  
  if (isValidApiKey(NEWS_API_KEY)) {
    fetchPromises.push(
      fetchWithRetry(
        () => fetchFromNewsAPI(category),
        'NewsAPI',
        category
      ).catch(() => [])
    );
  }
  
  if (isValidApiKey(GNEWS_API_KEY)) {
    fetchPromises.push(
      fetchWithRetry(
        () => fetchFromGNews(category),
        'GNews',
        category
      ).catch(() => [])
    );
  }
  
  if (isValidApiKey(GUARDIAN_API_KEY)) {
    fetchPromises.push(
      fetchWithRetry(
        () => fetchFromGuardian(category),
        'Guardian',
        category
      ).catch(() => [])
    );
  }
  
  if (isValidApiKey(MEDIASTACK_KEY)) {
    fetchPromises.push(
      fetchWithRetry(
        () => fetchFromMediastack(category),
        'Mediastack',
        category
      ).catch(() => [])
    );
  }

  // Execute all fetches in parallel
  const results = await Promise.allSettled(fetchPromises);
  
  // Extract successful results
  const allArticles: ExternalNewsArticle[] = [];
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      allArticles.push(...result.value);
    }
  });

  // Remove duplicates based on URL
  const unique = allArticles.filter((article, idx, arr) =>
    article.url && arr.findIndex(a => a.url === article.url) === idx
  );

  const duration = Date.now() - startTime;
  await logSnagEvent("📊 جلب الأخبار", `تم جلب ${unique.length} مقال فريد من ${fetchPromises.length} مصدر في ${duration}ms (${category})`);

  return unique;
}

async function fetchFromNewsAPI(category: string): Promise<ExternalNewsArticle[]> {
  if (!NEWS_API_KEY) return [];
  const url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&pageSize=20&apiKey=${NEWS_API_KEY}`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'GlobalEye-News/1.0'
      }
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`NewsAPI HTTP ${res.status}: ${errorText}`);
    }
    
    const data = await res.json();

    if (data.status === 'error') {
      throw new Error(`NewsAPI error: ${data.message}`);
    }

    await logSnagEvent("NewsAPI ✅", `تم جلب ${data.articles?.length || 0} خبر من NewsAPI (${category})`);

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
    throw error;
  }
}

export async function fetchFromGNews(category: string): Promise<ExternalNewsArticle[]> {
  if (!GNEWS_API_KEY) return [];
  const url = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&country=us&max=20&apikey=${GNEWS_API_KEY}`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'GlobalEye-News/1.0'
      }
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`GNews HTTP ${res.status}: ${errorText}`);
    }
    
    const data = await res.json();

    if (data.errors) {
      throw new Error(`GNews error: ${JSON.stringify(data.errors)}`);
    }

    await logSnagEvent("GNews ✅", `تم جلب ${data.articles?.length || 0} خبر من GNews (${category})`);

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
    throw error;
  }
}

export async function fetchFromGuardian(category: string): Promise<ExternalNewsArticle[]> {
  if (!GUARDIAN_API_KEY) return [];
  const url = `https://content.guardianapis.com/search?section=${category}&show-fields=all&page-size=20&api-key=${GUARDIAN_API_KEY}`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'GlobalEye-News/1.0'
      }
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Guardian HTTP ${res.status}: ${errorText}`);
    }
    
    const data = await res.json();

    if (data.response?.status === 'error') {
      throw new Error(`Guardian error: ${data.response.message}`);
    }

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
    throw error;
  }
}

export async function fetchFromMediastack(category: string): Promise<ExternalNewsArticle[]> {
  if (!MEDIASTACK_KEY) return [];
  const url = `http://api.mediastack.com/v1/news?access_key=${MEDIASTACK_KEY}&categories=${category}&languages=en&countries=us&limit=20`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'GlobalEye-News/1.0'
      }
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Mediastack HTTP ${res.status}: ${errorText}`);
    }
    
    const data = await res.json();

    if (data.error) {
      throw new Error(`Mediastack error: ${data.error.info || data.error.message}`);
    }

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
    throw error;
  }
}
