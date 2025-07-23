import { NewsItem } from '../types';

export async function fetchExternalNews(): Promise<NewsItem[]> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    console.error('Error: NEWS_API_KEY is not set in environment variables');
    return [];
  }

  const url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    console.log('Fetched articles:', data.articles.length); // تسجيل عدد الأخبار المجلوبة

    const validNewsItems = data.articles
      .map((article: any) => {
        if (!article.url) {
          console.warn('Skipping article with missing URL:', article.title);
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
      .filter(Boolean); // إزالة العناصر null

    console.log('Valid news items after filtering:', validNewsItems.length);
    return validNewsItems;
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}
