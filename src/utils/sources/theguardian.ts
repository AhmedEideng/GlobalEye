export async function fetchNewsFromTheguardian(category: string) {
  const apiKey = process.env.GUARDIAN_KEY;
  const response = await fetch(`https://content.guardianapis.com/search?q=${category}&api-key=${apiKey}&show-fields=thumbnail,trailText`);

  if (!response.ok) throw new Error('Failed to fetch from The Guardian');

  const data: GuardianResponse = await response.json();

  return data.response.results.map((article) => ({
    title: article.webTitle,
    description: article.fields?.trailText || '',
    url: article.webUrl,
    image: article.fields?.thumbnail || '',
    publishedAt: article.webPublicationDate,
    source: 'The Guardian',
  }));
}

interface GuardianResponse {
  response: {
    results: {
      webTitle: string;
      webUrl: string;
      webPublicationDate: string;
      fields?: {
        thumbnail?: string;
        trailText?: string;
      };
    }[];
  };
}
