import { Article } from '@/utils/types';

export async function getGNews(category: string): Promise<Article[]> {
  const API_KEY = process.env.GNEWS_KEY;
  if (!API_KEY) return [];

  const url = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&apikey=${API_KEY}`;
  const res = await fetch(url);
  const json = await res.json();

  return (json.articles || []).map((article: any) => ({
    title: article.title,
    description: article.description,
    content: article.content,
    url: article.url,
    urlToImage: article.image,
    publishedAt: article.publishedAt,
    source: { name: article.source.name },
    author: article.author,
  }));
}
