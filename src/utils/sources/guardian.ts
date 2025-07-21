export async function getNewsFromGuardian(category: string) {
  const apiKey = process.env.GUARDIAN_KEY;
  const response = await fetch(`https://content.guardianapis.com/search?q=${category}&api-key=${apiKey}&show-fields=thumbnail,trailText`);

  if (!response.ok) throw new Error('Failed to fetch from Guardian');

  const data = await response.json();

  return data.response.results.map((article: any) => ({
    title: article.webTitle,
    description: article.fields?.trailText || '',
    url: article.webUrl,
    image: article.fields?.thumbnail || '',
    publishedAt: article.webPublicationDate,
    source: 'The Guardian',
  }));
}
