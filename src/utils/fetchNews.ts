import { createClient } from '@supabase/supabase-js';
import { getOrAddCategoryId } from './categoryUtils';
import { LRUCache } from 'lru-cache';

// إزالة استيراد supabase من supabaseClient
// import { supabase } from '@utils/supabaseClient';

// تعريف نوع NewsArticle
export type NewsArticle = {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  image_url: string | null;
  published_at: string;
  content: string | null;
  slug: string;
  category: string;
};

// تعريف نوع NewsWithCategory
interface NewsWithCategory {
  source_name: string;
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  image_url: string | null;
  published_at: string;
  content: string | null;
  slug: string;
  categories?: { name: string };
}

// إعدادات الكاش
const CACHE_TTL = Number(process.env.CACHE_TTL) || 300; // 5 دقايق
const newsCache = new LRUCache<string, NewsArticle[]>({
  max: 32,
  ttl: 1000 * CACHE_TTL,
});

/**
 * تحديث يدوي للأخبار (تفريغ الكاش وجلب جديد)
 * @param category - الفئة (افتراضي: 'general')
 * @returns Promise<NewsArticle[]>
 */
export async function forceRefreshNews(category = 'general') {
  newsCache.delete(category);
  return await fetchNews(category);
}

/**
 * جلب الأخبار من قاعدة البيانات حسب الفئة
 * @param category - الفئة (افتراضي: 'general')
 * @param limit - عدد المقالات (افتراضي: 50)
 * @param offset - عدد المقالات اللي هتتخطاها (افتراضي: 0)
 * @returns Promise<NewsArticle[]>
 */
export async function fetchNews(category = 'general', limit = 50, offset = 0): Promise<NewsArticle[]> {
  // إنشاء عميل Supabase داخل الدالة
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL or SUPABASE_ANON_KEY is not set');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // فحص الكاش (للإعدادات الافتراضية بس)
  if (limit === 50 && offset === 0) {
    const cached = newsCache.get(category);
    if (cached) return cached;
  }

  // جلب الأخبار من قاعدة البيانات
  const { data: dbArticles, error } = await supabase
    .from('news')
    .select('*, categories(name)')
    .eq('category_id', await getOrAddCategoryId(category))
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (!error && dbArticles && dbArticles.length > 0) {
    const result = dbArticles.map((article: NewsWithCategory) => ({
      source: { id: null, name: article.source_name },
      author: article.author,
      title: article.title,
      description: article.description,
      url: article.url,
      image_url: article.image_url,
      published_at: article.published_at,
      content: article.content,
      slug: article.slug,
      category: article.categories?.name || category,
    }) as NewsArticle);

    // تخزين في الكاش للإعدادات الافتراضية
    if (limit === 50 && offset === 0) {
      newsCache.set(category, result);
    }

    return result;
  }

  return [];
}

// قائمة الكلمات المفتاحية لكل فئة
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  business: ['business', 'market', 'economy', 'finance', 'stock', 'trade', 'investment', 'bank', 'currency', 'بورصة', 'اقتصاد', 'مال', 'تجارة', 'استثمار', 'مصرف', 'عملة'],
  technology: ['technology', 'tech', 'ai', 'software', 'hardware', 'internet', 'robot', 'gadget', 'app', 'تكنولوجيا', 'برمجيات', 'ذكاء اصطناعي', 'إنترنت', 'روبوت'],
  sports: ['sport', 'football', 'basketball', 'tennis', 'match', 'goal', 'league', 'championship', 'olympic', 'رياضة', 'كرة', 'مباراة', 'هدف', 'دوري', 'بطولة', 'أولمبياد'],
  entertainment: ['entertainment', 'movie', 'music', 'celebrity', 'film', 'drama', 'actor', 'تسلية', 'فيلم', 'موسيقى', 'مشاهير', 'دراما'],
  health: ['health', 'medical', 'doctor', 'hospital', 'covid', 'virus', 'صحة', 'طبي', 'طبيب', 'مستشفى', 'فيروس', 'علاج'],
  science: ['science', 'research', 'study', 'discovery', 'space', 'astronomy', 'علم', 'بحث', 'دراسة', 'اكتشاف', 'فضاء', 'فلك'],
  politics: ['politics', 'government', 'election', 'president', 'minister', 'parliament', 'سياسة', 'حكومة', 'انتخابات', 'رئيس', 'وزير', 'برلمان'],
  world: ['world', 'international', 'global', 'عالم', 'دولي', 'عالمي'],
  general: []
};

// تصنيف ذكي بناءً على الكلمات المفتاحية
export function detectCategory(article: NewsArticle): string {
  const text = `${article.title} ${article.description || ''} ${article.content || ''}`.toLowerCase();
  let bestCategory = 'general';
  let maxCount = 0;
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let count = 0;
    for (const kw of keywords) {
      const regex = new RegExp(`\\b${kw.replace(/[-/\\^$*+?.()|[\]{}]/gu, '\\$&')}\\b`, 'giu');
      const matches = [...text.matchAll(regex)];
      count += matches.length;
    }
    if (count > maxCount) {
      maxCount = count;
      bestCategory = cat;
    }
  }
  return bestCategory;
}

/**
 * جلب الأخبار المرتبطة من نفس الفئة
 * @param currentArticle - المقال الحالي
 * @param category - الفئة
 * @returns Promise<NewsArticle[]>
 */
export async function fetchRelatedNews(currentArticle: NewsArticle, category = 'general'): Promise<NewsArticle[]> {
  try {
    const articles = await fetchNews(category);
    return articles
      .filter(article => article.url !== currentArticle.url)
      .slice(0, 40);
  } catch {
    return [];
  }
}

/**
 * دالة تصحيح لفحص محتويات قاعدة البيانات
 */
export async function debugDatabaseContents() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL or SUPABASE_ANON_KEY is not set');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data, error } = await supabase
      .from('news')
      .select('title, slug, category')
      .order('published_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Debug error:', error.message);
      return;
    }

    data?.forEach(article => {
      console.log('Article:', article);
    });
  } catch {
    console.error('Failed to debug database contents');
  }
}

/**
 * جلب مقال بناءً على slug
 * @param slug - معرف المقال
 * @returns Promise<NewsArticle | null>
 */
export async function getArticleBySlug(slug: string): Promise<NewsArticle | null> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL or SUPABASE_ANON_KEY is not set');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

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
        image_url: data.image_url,
        published_at: data.published_at,
        content: data.content,
        slug: data.slug,
        category: data.category || 'general',
      };
    }

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
        image_url: article.image_url,
        published_at: article.published_at,
        content: article.content,
        slug: article.slug,
        category: article.category || 'general',
      };
    }

    const titleSearch = slug.replace(/-/gu, ' ').replace(/\d+$/u, '').trim();
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
        image_url: article.image_url,
        published_at: article.published_at,
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

/**
 * ترتيب المقالات بناءً على تفضيلات المستخدم
 */
export function sortArticlesByUserPreferences(articles: NewsArticle[], favoriteSlugs: string[]): NewsArticle[] {
  if (!favoriteSlugs || favoriteSlugs.length === 0) return articles;
  const favoriteCategories = Array.from(new Set(
    articles.filter(a => favoriteSlugs.includes(a.slug)).map(a => a.category)
  ));
  return [
    ...articles.filter(a => favoriteCategories.includes(a.category)),
    ...articles.filter(a => !favoriteCategories.includes(a.category)),
  ];
}

/**
 * إرسال حدث إلى Google Analytics
 */
export function sendAnalyticsEvent(eventName: string, params: Record<string, unknown> = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}

/**
 * تهيئة التاريخ
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * جلب رابط صورة صالح
 */
export function getImageUrl(url?: string | null): string {
  return url?.trim() || '';
}

/**
 * حساب تشابه Jaccard بين نصين
 */
export function jaccardSimilarity(str1: string, str2: string): number {
  const set1 = new Set(str1.toLowerCase().split(/\s+/));
  const set2 = new Set(str2.toLowerCase().split(/\s+/));
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return union.size === 0 ? 1 : intersection.size / union.size;
  }
