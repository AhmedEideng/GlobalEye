export async function getNewsFromMediastack(category: string) {
  const apiKey = process.env.MEDIASTACK_KEY;
  const url = `http://api.mediastack.com/v1/news?access_key=${apiKey}&categories=${category}&languages=en&limit=10`;

  const res = await fetch(url);
  const data = await res.json();

  return data.data.map((article: any) => ({
    source: 'Mediastack',
    title: article.title,
    description: article.description,
    url: article.url,
    image: article.image,
    publishedAt: article.published_at,
  }));
}
