export async function getNewsFromMediastack(category: string) {
  const apiKey = process.env.MEDIASTACK_KEY;
  const response = await fetch(`http://api.mediastack.com/v1/news?access_key=${apiKey}&languages=en&categories=${category}`);

  if (!response.ok) throw new Error('Failed to fetch from Mediastack');

  const data: { data: MediastackArticle[] } = await response.json();

  return data.data.map((article) => ({
    title: article.title,
    description: article.description,
    url: article.url,
    image: article.image || '',
    publishedAt: article.published_at,
    source: article.source,
  }));
}

interface MediastackArticle {
  title: string;
  description: string;
  url: string;
  image: string | null;
  published_at: string;
  source: string;
}
