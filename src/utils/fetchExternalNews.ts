import { Article } from './types';

export async function fetchExternalNews(): Promise<{ [category: string]: Article[] }> {
  const categories = ['politics', 'business', 'sports', 'technology', 'health'];
  const allNews: { [category: string]: Article[] } = {};

  for (const category of categories) {
    const responses: Article[] = [];

    // GNews API
    try {
      const gnews = await fetch(
        `https://gnews.io/api/v4/top-headlines?lang=en&topic=${category}&token=${process.env.GNEWS_KEY}`
      );
      const gnewsData = await gnews.json();
      if (gnewsData.articles) {
        responses.push(
          ...gnewsData.articles.map((a: any) => ({
            title: a.title,
            description: a.description,
            content: a.content,
            url: a.url,
            urlToImage: a.image,
            publishedAt: a.publishedAt,
            source: { name: a.source?.name || 'GNews' },
            author: a.author,
          }))
        );
      }
    } catch (err) {
      console.error('GNews error:', err);
    }

    // NewsAPI
    try {
      const newsapi = await fetch(
        `https://newsapi.org/v2/top-headlines?category=${category}&apiKey=${process.env.NEWSAPI_KEY}`
      );
      const newsapiData = await newsapi.json();
      if (newsapiData.articles) {
        responses.push(
          ...newsapiData.articles.map((a: any) => ({
            title: a.title,
            description: a.description,
            content: a.content,
            url: a.url,
            urlToImage: a.urlToImage,
            publishedAt: a.publishedAt,
            source: { name: a.source?.name || 'NewsAPI' },
            author: a.author,
          }))
        );
      }
    } catch (err) {
      console.error('NewsAPI error:', err);
    }

    // The Guardian
    try {
      const guardian = await fetch(
        `https://content.guardianapis.com/search?section=${category}&api-key=${process.env.GUARDIAN_KEY}&show-fields=all`
      );
      const guardianData = await guardian.json();
      if (guardianData.response?.results) {
        responses.push(
          ...guardianData.response.results.map((a: any) => ({
            title: a.webTitle,
            description: a.fields?.trailText,
            content: a.fields?.bodyText,
            url: a.webUrl,
            urlToImage: a.fields?.thumbnail,
            publishedAt: a.webPublicationDate,
            source: { name: 'The Guardian' },
            author: a.fields?.byline,
          }))
        );
      }
    } catch (err) {
      console.error('Guardian error:', err);
    }

    // MediaStack
    try {
      const mediastack = await fetch(
        `http://api.mediastack.com/v1/news?access_key=${process.env.MEDIASTACK_KEY}&categories=${category}&languages=en`
      );
      const mediastackData = await mediastack.json();
      if (mediastackData.data) {
        responses.push(
          ...mediastackData.data.map((a: any) => ({
            title: a.title,
            description: a.description,
            content: null,
            url: a.url,
            urlToImage: a.image,
            publishedAt: a.published_at,
            source: { name: a.source || 'MediaStack' },
            author: a.author,
          }))
        );
      }
    } catch (err) {
      console.error('MediaStack error:', err);
    }

    allNews[category] = responses;
  }

  return allNews;
}
