export async function fetchNewsFromMediastack(category: string) {
  const apiKey = process.env.MEDIASTACK_KEY;
  const response = await fetch(`http://api.mediastack.com/v1/news?access_key=${apiKey}&languages=en&categories=${category}`);
  if (!response.ok) throw new Error('Failed to fetch from Mediastack');
  const data: MediastackResponse = await response.json();
  return data.data.map((article) => ({
    title: article.title,
    description: article.description || '',
    url: article.url,
    urlToImage: article.image || '',
    publishedAt: article.published_at,
    source: { name: article.source || 'Mediastack' },
    author: undefined,
  }));
}

interface MediastackResponse {
  data: {
    title: string;
    description?: string;
    url: string;
    image?: string;
    published_at?: string;
    source?: string;
  }[];
}
