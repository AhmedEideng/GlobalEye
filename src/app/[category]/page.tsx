import { Metadata } from 'next';
import CategoryClient from '../components/CategoryClient';

interface Article {
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: { name: string };
  category?: string;
}

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

const categoryLabels: { [key: string]: string } = {
  'world': 'World News',
  'politics': 'Politics',
  'business': 'Business',
  'technology': 'Technology',
  'sports': 'Sports',
  'entertainment': 'Entertainment',
  'health': 'Health',
  'science': 'Science'
};

export const revalidate = 900;

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const categoryLabel = categoryLabels[category] || category;
  const title = `${categoryLabel} | GlobalEye News`;
  const description = `Latest news and updates in ${categoryLabel}. Stay informed with trusted sources from around the world.`;
  const url = `https://globaleye.news/${category}`; // Edit this to your final site URL
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

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const categoryLabel = categoryLabels[category] || category;
  let articles: Article[] = [];
  let error: string | null = null;
  try {
    const res = await fetch(`http://localhost:3000/api/news?category=${category}`, { cache: 'no-store' });
    const data = await res.json();
    if (data.articles && data.articles.length > 0) {
      articles = data.articles;
    } else {
      error = `No news available in the "${categoryLabel}" category. Please try again.`;
    }
  } catch {
    error = 'Failed to load news. Please try again.';
  }
  const featuredArticle = articles.length > 0 ? articles[0] : null;
  const restArticles = articles.length > 1 ? articles.slice(1) : [];
  return <CategoryClient articles={restArticles} featuredArticle={featuredArticle} categoryLabel={categoryLabel} error={error} />;
} 