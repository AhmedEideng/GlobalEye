export async function getNewsFromNewsApi(category: string) {
  const apiKey = process.env.NEWSAPI_KEY;
  const url = `https://newsapi.org/v2/top-headlines?category=${category}&apiKey=${apiKey}&language=en`;

  const res = await fetch(url);
  const data = await res.json();

  return data.articles.map((article: any) => ({
    source: 'NewsAPI',
    title: article.title,
    description: article.description,
    url: article.url,
    image: article.urlToImage,
    publishedAt: article.publishedAt,
  }));
}
