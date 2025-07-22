import { fetchNewsFromNewsAPI } from './sources/newsapi';
import { fetchNewsFromGEnews } from './sources/gnews';
import { fetchNewsFromTheguardian } from './sources/theguardian';
import { fetchNewsFromMediastack } from './sources/mediastack';
import type { ExternalNewsArticle } from '../../externalNewsArticle';

export async function fetchExternalNews(category: string): Promise<ExternalNewsArticle[]> {
  try {
    const results = await Promise.allSettled([
      fetchNewsFromGEnews(category),
      fetchNewsFromNewsAPI(category),
      fetchNewsFromTheguardian(category),
      fetchNewsFromMediastack(category),
    ]);

    const allNews = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => (r as PromiseFulfilledResult<ExternalNewsArticle[]>).value);

    // تصفية الأخبار المنشورة خلال آخر 24 ساعة فقط
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const recentNews = allNews.filter(item => {
      if (!item.publishedAt) return false;
      const published = new Date(item.publishedAt).getTime();
      return !isNaN(published) && (now - published) < oneDayMs;
    });

    // إزالة التكرار بناءً على url أو title (داخل نفس الدفعة)
    const uniqueNews = recentNews.filter((item, index, self) =>
      index === self.findIndex((t) => t.url === item.url || t.title.trim() === item.title.trim())
    );

    return uniqueNews;
  } catch {
    return [];
  }
}
