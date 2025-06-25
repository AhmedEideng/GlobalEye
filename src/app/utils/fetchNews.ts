export interface NewsArticle {
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
}

const NEWS_API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY;
const GNEWS_API_KEY = process.env.NEXT_PUBLIC_GNEWS_API_KEY;
const GUARDIAN_KEY = process.env.NEXT_PUBLIC_GUARDIAN_KEY;
const MEDIASTACK_KEY = process.env.NEXT_PUBLIC_MEDIASTACK_KEY;

async function fetchFromNewsAPI(category: string): Promise<NewsArticle[]> {
  if (!NEWS_API_KEY) return [];
  try {
    const url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&pageSize=20&apiKey=${NEWS_API_KEY}`;
    const res = await fetch(url, { next: { revalidate: 300 }, headers: { 'User-Agent': 'GlobalEye-News/1.0' } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.articles || []).map((article: any) => ({
      source: { id: article.source?.id || null, name: article.source?.name || 'Unknown' },
      author: article.author,
      title: article.title,
      description: article.description,
      url: article.url,
      urlToImage: article.urlToImage,
      publishedAt: article.publishedAt,
      content: article.content
    }));
  } catch { return []; }
}

async function fetchFromGNews(category: string): Promise<NewsArticle[]> {
  if (!GNEWS_API_KEY) return [];
  try {
    const url = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&country=us&max=20&apikey=${GNEWS_API_KEY}`;
    const res = await fetch(url, { next: { revalidate: 300 }, headers: { 'User-Agent': 'GlobalEye-News/1.0' } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.articles || []).map((article: any) => ({
      source: { id: null, name: article.source?.name || 'GNews' },
      author: article.author,
      title: article.title,
      description: article.description,
      url: article.url,
      urlToImage: article.image,
      publishedAt: article.publishedAt,
      content: article.content
    }));
  } catch { return []; }
}

async function fetchFromGuardian(category: string): Promise<NewsArticle[]> {
  if (!GUARDIAN_KEY) return [];
  try {
    const url = `https://content.guardianapis.com/search?section=${category}&show-fields=all&page-size=20&api-key=${GUARDIAN_KEY}`;
    const res = await fetch(url, { next: { revalidate: 300 }, headers: { 'User-Agent': 'GlobalEye-News/1.0' } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.response?.results || []).map((article: any) => ({
      source: { id: 'guardian', name: 'The Guardian' },
      author: article.fields?.byline || null,
      title: article.webTitle,
      description: article.fields?.trailText || null,
      url: article.webUrl,
      urlToImage: article.fields?.thumbnail || null,
      publishedAt: article.webPublicationDate,
      content: article.fields?.bodyText || null
    }));
  } catch { return []; }
}

async function fetchFromMediastack(category: string): Promise<NewsArticle[]> {
  if (!MEDIASTACK_KEY) return [];
  try {
    const url = `http://api.mediastack.com/v1/news?access_key=${MEDIASTACK_KEY}&categories=${category}&languages=en&countries=us&limit=20`;
    const res = await fetch(url, { next: { revalidate: 300 }, headers: { 'User-Agent': 'GlobalEye-News/1.0' } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data || []).map((article: any) => ({
      source: { id: null, name: article.source || 'Mediastack' },
      author: article.author,
      title: article.title,
      description: article.description,
      url: article.url,
      urlToImage: article.image,
      publishedAt: article.published_at,
      content: null
    }));
  } catch { return []; }
}

export async function fetchNews(category: string = 'general'): Promise<NewsArticle[]> {
  const [newsapi, gnews, guardian, mediastack] = await Promise.all([
    fetchFromNewsAPI(category),
    fetchFromGNews(category),
    fetchFromGuardian(category),
    fetchFromMediastack(category)
  ]);
  const all = [...newsapi, ...gnews, ...guardian, ...mediastack];
  const unique = all.filter((item, idx, arr) => arr.findIndex(a => a.url === item.url) === idx);
  unique.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
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

// كود اختبار مؤقت للطرفية فقط
if (require.main === module) {
  (async () => {
    const news = await fetchNews('general');
    console.log('عدد الأخبار:', news.length);
    console.log('أول 5 أخبار:', news.slice(0, 5));
  })();
} 