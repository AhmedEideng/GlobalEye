export async function getNewsFromNewsAPI(category: string) {
  const apiKey = process.env.NEWSAPI_KEY;
  const response = await fetch(`https://newsapi.org/v2/top-headlines?category=${category}&language=en&apiKey=${apiKey}`);

  if (!response.ok) throw new Error('Failed to fetch from NewsAPI');

  const data = await response.json();

  return data.articles.map((article: any) => ({
    title: article.title,
    description: article.description,
    url: article.url,
    image: article.urlToImage,
    publishedAt: article.publishedAt,
    source: 'NewsAPI',
  }));
}
