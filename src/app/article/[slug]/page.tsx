import { getArticleBySlug, NewsArticle } from '../../utils/fetchNews';
import OptimizedImage from '../../components/OptimizedImage';
import { NewsReactions } from '../../components/NewsReactions';
import ShareButtons from '../../components/ShareButtons';
import Link from 'next/link';

export const revalidate = 120;

interface ArticlePageProps {
  params: { slug: string };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = params;
  const article: NewsArticle | null = await getArticleBySlug(slug);

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4 text-red-700">Article Not Found</h1>
        <p className="text-lg text-gray-500 mb-6">Sorry, we couldn&apos;t find the article you are looking for.</p>
        <Link href="/" className="btn btn-primary">Back to Home</Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto px-4 py-10">
      {/* Main Image */}
      {article.urlToImage && (
        <div className="relative w-full h-[320px] md:h-[420px] lg:h-[500px] rounded-xl overflow-hidden mb-8">
          <OptimizedImage
            src={article.urlToImage}
            alt={article.title}
            fill
            className="object-cover w-full h-full"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        </div>
      )}
      {/* Title & Meta */}
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900 leading-tight">
        {article.title}
      </h1>
      <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-500">
        <span className="font-semibold text-red-600">{article.source.name}</span>
        <span>{article.author && <span>By {article.author}</span>}</span>
        <span>{new Date(article.publishedAt).toLocaleString()}</span>
      </div>
      {/* Description */}
      {article.description && (
        <p className="text-lg text-gray-700 mb-6 font-medium">{article.description}</p>
      )}
      {/* Content */}
      {article.content && (
        <div className="prose prose-lg max-w-none mb-8 text-gray-900 dark:text-gray-100">
          {article.content}
        </div>
      )}
      {/* Share Buttons */}
      <ShareButtons title={article.title} url={`/article/${article.slug}`} />
      {/* Reactions */}
      <NewsReactions articleUrl={article.url} />
    </article>
  );
} 