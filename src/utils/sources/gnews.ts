// تعريف نوع Article
type GNewsArticle = {
  title: string;
  description: string;
  url: string;
  image: string;
  publishedAt: string;
};

export async function getNewsFromGNews(category: string) {
  const apiKey = process.env.GNEWS_KEY;
  const response = await fetch(`https://gnews.io/api/v4/top-headlines?topic=${category}&lang=en&token=${apiKey}`);

  if (!response.ok) throw new Error('Failed to fetch from GNews');

  const data = await response.json();

  return data.articles.map((article: GNewsArticle) => ({
    title: article.title,
    description: article.description,
    url: article.url,
    image: article.image,
    publishedAt: article.publishedAt,
    source: 'GNews',
  }));
}
