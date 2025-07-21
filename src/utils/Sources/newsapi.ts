import { Article } from '@/app/utils/types';

export async function getNewsAPI(category: string): Promise<Article[]> {
  const API_KEY = process.env.NEWSAPI_KEY;
  if (!API_KEY) return [];

  const url = `https://newsapi.org/v2/top-headlines?category=${category}&language=en&apiKey=${API_KEY}`;
  const res = await fetch(url);
  const json = await res.json();

  return (json.articles || []).map((article: any) => ({
    title: article.title,
    description: article.description,
    content: article.content,
    url: article.url,
    urlToImage: article.urlToImage,
    publishedAt: article.publishedAt,
    source: { name: article.source.name },
    author: article.author,
  }));
}
