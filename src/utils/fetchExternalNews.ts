import { fetchNewsFromNewsapi } from './sources/newsapi';
import { fetchNewsFromGEnews } from './sources/gnews';
import { fetchNewsFromTheguardian } from './sources/theguardian';
import { fetchNewsFromMediastack } from './sources/mediastack';
import type { NewsItem } from '../types';

export async function fetchExternalNews(category: string): Promise<NewsItem[]> {
  try {
    const [gnews, newsapi, guardian, mediastack] = await Promise.all([
      fetchNewsFromgenews(category),
      fetchNewsFromnewsapi(category),
      fetchNewsFromtheguardian(category),
      fetchNewsFrommediastack(category),
    ]);

    const allNews = [...gnews, ...newsapi, ...guardian, ...mediastack];

    const uniqueNews = allNews.filter((item, index, self) =>
      index === self.findIndex((t) => t.url === item.url)
    );

    return uniqueNews;
  } catch (error) {
    console.error('Error fetching external news:', error);
    return [];
  }
}
