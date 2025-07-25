export async function fetchNewsFromNewsAPI(category: string) {
  const apiKey = process.env.NEWSAPI_KEY || process.env.NEXT_PUBLIC_NEWS_API_KEY;
  const response = await fetch(`https://newsapi.org/v2/top-headlines?category=${category}&language=en&apiKey=${apiKey}`);
  if (!response.ok) throw new Error('Failed to fetch from NewsAPI');
  const data: NewsAPIResponse = await response.json();
  return data.articles.map((article) => ({
    title: article.title,
    description: article.description || '',
    url: article.url,
    urlToImage: article.urlToImage || '',
    publishedAt: article.publishedAt,
    source: { name: 'NewsAPI' },
    author: undefined,
  }));
}

interface NewsAPIResponse {
  articles: {
    title: string;
    description?: string;
    url: string;
    urlToImage?: string;
    publishedAt?: string;
  }[];
}
