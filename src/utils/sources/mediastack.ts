export async function getNewsFromMediastack(category: string) {
  const apiKey = process.env.MEDIASTACK_KEY;
  const response = await fetch(`http://api.mediastack.com/v1/news?access_key=${apiKey}&categories=${category}&languages=en`);

  if (!response.ok) throw new Error('Failed to fetch from Mediastack');

  const data = await response.json();

  return data.data.map((article: any) => ({
    title: article.title,
    description: article.description,
    url: article.url,
    image: article.image,
    publishedAt: article.published_at,
    source: 'Mediastack',
  }));
}
