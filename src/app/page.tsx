import HomeClient from './components/HomeClient';

interface Article {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: { name: string };
  category?: string;
}

export const revalidate = 900;

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
  let articles: Article[] = [];
  let featuredArticle: Article | null = null;
  let error: string | null = null;
  try {
    const res = await fetch('http://localhost:3000/api/news?category=general', { cache: 'no-store' });
    const data = await res.json();
    if (data.articles && data.articles.length > 0) {
      featuredArticle = {
        ...data.articles[0],
        description: data.articles[0].description || '',
        urlToImage: data.articles[0].urlToImage || '',
      } as Article;
      articles = data.articles.slice(1, 31).map((a: Article) => ({
        ...a,
        description: a.description || '',
        urlToImage: a.urlToImage || '',
      })) as Article[];
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