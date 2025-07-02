import { Metadata } from 'next';

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

export const revalidate = 120;

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  const { category } = params;
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