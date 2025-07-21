import type { ExternalNewsArticle } from '@/types';

export async function fetchNewsFromGEnews(category: string): Promise<ExternalNewsArticle[]> {
  const apiKey = process.env.GNEWS_KEY;
  if (!apiKey) throw new Error('Missing GNEWS_KEY');

  const url = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&token=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();

  return data.articles.map((article: unknown) => ({
    title: article.title,
    description: article.description,
    url: article.url,
    image: article.image,
    publishedAt: article.publishedAt,
    source: {
      name: article.source?.name || 'GNews',
    },
    author: article.author,
  }));
}
