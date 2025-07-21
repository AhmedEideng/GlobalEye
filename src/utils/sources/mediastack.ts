import { Article } from '@/app/utils/types';

export async function getMediastackNews(category: string): Promise<Article[]> {
  const API_KEY = process.env.MEDIASTACK_KEY;
  if (!API_KEY) return [];

  const url = `http://api.mediastack.com/v1/news?access_key=${API_KEY}&categories=${category}&languages=en&limit=20`;
  const res = await fetch(url);
  const json = await res.json();

  return (json.data || []).map((item: any) => ({
    title: item.title,
    description: item.description,
    content: item.description,
    url: item.url,
    urlToImage: item.image,
    publishedAt: item.published_at,
    source: { name: item.source },
    author: item.author,
  }));
}
