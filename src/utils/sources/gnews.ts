export async function fetchNewsFromGEnews(category: string) {
  const apiKey = process.env.GNEWS_KEY || process.env.NEXT_PUBLIC_GNEWS_API_KEY;
  const response = await fetch(`https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&token=${apiKey}`);
  if (!response.ok) throw new Error('Failed to fetch from GNews');
  const data: GNewsResponse = await response.json();
  return data.articles.map((article) => ({
    title: article.title,
    description: article.description || '',
    url: article.url,
    urlToImage: article.image || '',
    publishedAt: article.publishedAt,
    source: { name: 'GNews' },
    author: undefined,
  }));
}

interface GNewsResponse {
  articles: {
    title: string;
    description?: string;
    url: string;
    image?: string;
    publishedAt?: string;
  }[];
}
