import { NewsArticle } from './gnews';

export async function getNewsFromNewsAPI(category: string): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWSAPI_KEY;
  if (!apiKey) throw new Error('Missing NEWSAPI_KEY');

  const response = await fetch(`https://newsapi.org/v2/top-headlines?category=${category}&language=en&apiKey=${apiKey}`);
  if (!response.ok) throw new Error('Failed to fetch from NewsAPI');

  const data = await response.json();

  return data.articles.map((article: any) => ({
    title: article.title,
    description: article.description,
    url: article.url,
    image: article.urlToImage ?? null,
    publishedAt: article.publishedAt,
    source: 'NewsAPI',
  }));
}
