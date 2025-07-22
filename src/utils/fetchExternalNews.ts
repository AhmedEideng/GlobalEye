import { fetchNewsFromNewsAPI } from './sources/newsapi';
import { fetchNewsFromGEnews } from './sources/gnews';
import { fetchNewsFromTheguardian } from './sources/theguardian';
import { fetchNewsFromMediastack } from './sources/mediastack';
import type { ExternalNewsArticle } from './types/externalNewsArticle';

export async function fetchExternalNews(category: string): Promise<ExternalNewsArticle[]> {
  try {
    const [gnews, newsapi, guardian, mediastack] = await Promise.all([
      fetchNewsFromGEnews(category),
      fetchNewsFromNewsAPI(category),
      fetchNewsFromTheguardian(category),
      fetchNewsFromMediastack(category),
    ]);

    const allNews = [...gnews, ...newsapi, ...guardian, ...mediastack];

    const uniqueNews = allNews.filter((item, index, self) =>
      index === self.findIndex((t) => t.url === item.url)
    );

    return uniqueNews;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching external news:', error);
    return [];
  }
}
