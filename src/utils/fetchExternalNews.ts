import { NewsItem } from '../types';

// واجهة لتتناسب مع استجابة NewsAPI
interface NewsApiArticle {
  title: string | null;
  description: string | null;
  content: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string | null;
  source: { name: string };
  author: string | null;
}

export async function fetchExternalNews(): Promise<NewsItem[]> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return [];
  }

  const url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    const validNewsItems = data.articles
      .map((article: NewsApiArticle) => {
        if (!article.url) {
          return null;
        }
        return {
          title: article.title,
          description: article.description,
          content: article.content,
          url: article.url,
          image_url: article.urlToImage,
          published_at: article.publishedAt,
          source: article.source.name,
          author: article.author,
        };
      })
      .filter(Boolean);

    return validNewsItems;
  } catch {
    return [];
  }
}
