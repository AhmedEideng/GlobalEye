import { Article } from '@/utils/types';

export async function getGuardianNews(category: string): Promise<Article[]> {
  const API_KEY = process.env.GUARDIAN_KEY;
  if (!API_KEY) return [];

  const url = `https://content.guardianapis.com/search?q=${category}&api-key=${API_KEY}&show-fields=all`;
  const res = await fetch(url);
  const json = await res.json();

  return (json.response.results || []).map((item: any) => ({
    title: item.webTitle,
    description: item.fields?.trailText || null,
    content: item.fields?.bodyText || null,
    url: item.webUrl,
    urlToImage: item.fields?.thumbnail || null,
    publishedAt: item.webPublicationDate,
    source: { name: 'The Guardian' },
    author: item.fields?.byline || null,
  }));
}
