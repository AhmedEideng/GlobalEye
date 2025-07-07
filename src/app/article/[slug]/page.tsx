import { getArticleBySlug, NewsArticle } from '../../utils/fetchNews';
import ArticleClient from './ArticleClient';

export const revalidate = 120;

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article: NewsArticle | null = await getArticleBySlug(slug);
  return <ArticleClient article={article} slug={slug} />;
} 