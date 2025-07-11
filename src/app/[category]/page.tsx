import { fetchNews, NewsArticle } from '../utils/fetchNews';
import { Metadata } from 'next';
import CategoryServer from './CategoryServer';
import ArticleCategoryJsonLdHead from './ArticleCategoryJsonLdHead';

export const revalidate = 180; // 3 دقائق

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

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const label = categoryLabels[category] || category;
  const title = `${label} | GlobalEye News`;
  const description = `Stay updated with the latest, most important, and trending news in ${label} from trusted sources around the world.`;
  return {
    title,
    description,
    alternates: { canonical: `https://globaleye.live/${category}` },
    openGraph: {
      title,
      description,
      url: `https://globaleye.live/${category}`,
      siteName: 'GlobalEye News',
      images: [
        { url: '/placeholder-news.jpg', width: 1200, height: 630, alt: label }
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/placeholder-news.jpg'],
      site: '@globaleyenews',
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const articles: NewsArticle[] = await fetchNews(category);
  return <>
    <ArticleCategoryJsonLdHead category={category} />
    <CategoryServer category={category} articles={articles} />
  </>;
} 