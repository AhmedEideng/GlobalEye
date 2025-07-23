import { getArticleBySlug, NewsArticle } from '@utils/fetchNews';
import ArticleClient from './ArticleClient';
import ArticleJsonLdHead from './ArticleJsonLdHead';

export const revalidate = 120;

export async function generateMetadata(props: unknown) {
  const { params } = props as { params: Promise<{ slug: string }> };
  const { slug } = await params;
  const article: NewsArticle | null = await getArticleBySlug(slug);
  if (!article) {
    return {
      title: 'Article Not Found | GlobalEye News',
      description: 'Sorry, we could not find the article you are looking for.',
      alternates: { canonical: `https://globaleye.live/article/${slug}` },
    };
  }
  return {
    title: `${article.title} | GlobalEye News`,
    description: article.description || article.title,
    alternates: { canonical: `https://globaleye.live/article/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.description || article.title,
      url: `https://globaleye.live/article/${article.slug}`,
      siteName: 'GlobalEye News',
      images: [
        { url: article.image_url || '/placeholder-news.jpg', width: 1200, height: 630, alt: article.title }
      ],
      locale: 'en_US',
      type: 'article',
      publishedTime: article.published_at,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description || article.title,
      images: [article.image_url || '/placeholder-news.jpg'],
      site: '@globaleyenews',
    },
  };
}

export default async function Page(props: unknown) {
  const { params } = props as { params: Promise<{ slug: string }> };
  const { slug } = await params;
  const article: NewsArticle | null = await getArticleBySlug(slug);
  return <>
    <ArticleJsonLdHead article={article} />
    <ArticleClient article={article} slug={slug} />
  </>;
} 