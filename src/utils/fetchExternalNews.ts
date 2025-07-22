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

    const uniqueNews = allNews.filter((item, index, self) =>
      index === self.findIndex((t) => t.url === item.url)
    );

    return uniqueNews;
  } catch (error) {
    return [];
  }
}
