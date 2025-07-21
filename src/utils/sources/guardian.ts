export async function getNewsFromGuardian(category: string) {
  const apiKey = process.env.GUARDIAN_KEY;
  const url = `https://content.guardianapis.com/search?section=${category}&api-key=${apiKey}&show-fields=all`;

  const res = await fetch(url);
  const data = await res.json();

  return data.response.results.map((article: any) => ({
    source: 'The Guardian',
    title: article.webTitle,
    description: article.fields?.trailText || '',
    url: article.webUrl,
    image: article.fields?.thumbnail || '',
    publishedAt: article.webPublicationDate,
  }));
}
