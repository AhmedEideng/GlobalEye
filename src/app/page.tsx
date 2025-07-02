import HomeClient from './components/HomeClient';
import { fetchAllNews, NewsArticle } from './utils/fetchNews';

export const revalidate = 120;

export async function generateMetadata() {
  const title = 'GlobalEye News | Latest World News, Business, Tech, Sports, Entertainment';
  const description = 'Stay updated with the latest breaking news, business, technology, sports, entertainment, and more from around the world. Your trusted source for global news.';
  const url = 'https://globaleye.news/';
  const image = '/placeholder-news.jpg';
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'GlobalEye News',
      images: [
        { url: image, width: 1200, height: 630, alt: 'GlobalEye News' }
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      site: '@globaleyenews',
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
  };
}

export default async function HomePage() {
  let articles: NewsArticle[] = [];
  let featuredArticle: NewsArticle | null = null;
  let error: string | null = null;
  try {
    const allArticles = await fetchAllNews();
    if (allArticles && allArticles.length > 0) {
      featuredArticle = {
        ...allArticles[0],
        description: allArticles[0].description || '',
        urlToImage: allArticles[0].urlToImage || '',
      };
      articles = allArticles.slice(1, 31).map((a) => ({
        ...a,
        description: a.description || '',
        urlToImage: a.urlToImage || '',
      }));
    } else {
      error = 'No news available at the moment. Please check your API settings.';
    }
  } catch {
    error = 'Failed to load news. Please try again.';
  }
  return <HomeClient articles={articles} featuredArticle={featuredArticle} error={error} />;
  // Debug log for troubleshooting
  console.log("DEBUG: Rendering articles", articles);
} 