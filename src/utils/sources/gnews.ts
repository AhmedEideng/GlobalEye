import type { ExternalNewsArticle } from '../../../externalNewsArticle';

interface GNewsApiArticle {
  title: string;
  description?: string;
  url: string;
  image?: string;
  publishedAt?: string;
  source?: { name?: string };
  author?: string;
}

export async function fetchNewsFromGEnews(category: string): Promise<ExternalNewsArticle[]> {
  const apiKey = process.env.GNEWS_KEY;
  if (!apiKey) throw new Error('Missing GNEWS_KEY');

  const url = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&token=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();

  return data.articles.map((article: GNewsApiArticle) => ({
    title: article.title,
    description: article.description,
    url: article.url,
    urlToImage: article.image,
    publishedAt: article.publishedAt,
    source: {
      name: article.source?.name || 'GNews',
    },
    author: article.author,
  }));
}
