import { getArticleBySlug, NewsArticle } from '@utils/fetchNews';
import ArticleClient from './ArticleClient';
import ArticleJsonLdHead from './ArticleJsonLdHead';
import type { Metadata } from 'next';

export const revalidate = 120;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // Fetch the article data here (pseudo-code, adjust as needed)
  const article = await getArticleBySlug(params.slug);
  if (!article) {
    return {
      title: 'Article Not Found | GlobalEye News',
      description: 'Sorry, this article could not be found.'
    };
  }
  return {
    title: `${article.title} | GlobalEye News`,
    description: article.description?.slice(0, 160) || article.title
  };
}

export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const article: NewsArticle | null = await getArticleBySlug(slug);
  return <>
    <ArticleJsonLdHead article={article} />
    <ArticleClient article={article} slug={slug} />
  </>;
} 