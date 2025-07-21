export async function getNewsFromGNews(category: string) {
  const apiKey = process.env.GNEWS_KEY;
  const url = `https://gnews.io/api/v4/top-headlines?topic=${category}&token=${apiKey}&lang=en`;

  const res = await fetch(url);
  const data = await res.json();

  return data.articles.map((article: any) => ({
    source: 'GNews',
    title: article.title,
    description: article.description,
    url: article.url,
    image: article.image,
    publishedAt: article.publishedAt,
  }));
}
