import { getArticleBySlug, NewsArticle } from '../../utils/fetchNews';
import OptimizedImage from '../../components/OptimizedImage';
import { NewsReactions } from '../../components/NewsReactions';
import ShareButtons from '../../components/ShareButtons';
import Link from 'next/link';
import { fetchRelatedNews, cleanImageUrl, detectCategory } from '../../utils/fetchNews';

export const revalidate = 120;

export default async function ArticlePage({ params }: { params: Record<string, string> }) {
  const { slug } = await params;
  console.log("DEBUG: ArticlePage - Received slug from params:", slug);
  const article: NewsArticle | null = await getArticleBySlug(slug);

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4 text-red-700">Article Not Found</h1>
        <p className="text-lg text-gray-500 mb-6">
          Sorry, we couldn&apos;t find the article you are looking for.
          <br />
          <span className="text-sm text-gray-400">Slug: {slug}</span>
        </p>
        <div className="space-y-4">
        <Link href="/world" className="btn btn-primary">Back to World News</Link>
          <br />
          <Link href="/politics" className="btn btn-secondary">Browse Politics News</Link>
          <br />
          <Link href="/world" className="btn btn-secondary">Browse World News</Link>
        </div>
      </div>
    );
  }

  return (
    <article className="w-full max-w-screen-xl mx-auto px-2 sm:px-4 py-6 md:py-10">
      {/* Main Image */}
      {article.urlToImage && (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-6">
          <OptimizedImage
            src={cleanImageUrl(article.urlToImage) || '/placeholder-news.jpg'}
            alt={article.title}
            fill
            className="object-cover w-full h-full"
            priority
            sizes="100vw"
          />
        </div>
      )}
      {/* Title & Meta */}
      <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold mb-4 text-gray-900 leading-tight break-words text-balance w-full">
        {article.title}
      </h1>
      <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-500">
        <span className="font-semibold text-red-600">{article.source.name}</span>
        <span>{article.author && <span>By {article.author}</span>}</span>
        <span>{new Date(article.publishedAt).toLocaleString()}</span>
      </div>
      {/* Description */}
      {article.description && (
        <p className="text-base sm:text-lg text-gray-700 mb-6 font-medium break-words text-balance w-full">{article.description}</p>
      )}
      {/* Content */}
      {article.content && (
        <div className="prose prose-lg max-w-none w-full mb-8 text-gray-900 dark:text-gray-100 break-words text-balance">
          {article.content}
        </div>
      )}
      {/* Read Full Article Button */}
      <div className="flex justify-center my-8">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-full shadow transition text-base sm:text-lg"
        >
          Read on the official website
        </a>
      </div>
      {/* Share Buttons */}
      <ShareButtons title={article.title} url={`/article/${article.slug}`} />
      {/* Reactions */}
      <NewsReactions articleUrl={article.url} />

      {/* Related News Section */}
      <RelatedNewsSection article={article} />
    </article>
  );
}

// Related News Section Component
async function RelatedNewsSection({ article }: { article: NewsArticle }) {
  const related = await fetchRelatedNews(article, detectCategory(article));
  if (!related || related.length === 0) return null;
  return (
    <section className="mt-12">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">Related News</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {related.map((item) => (
          <Link key={item.slug} href={`/article/${item.slug}`} className="block bg-white rounded-xl border border-gray-100 overflow-hidden transition-all duration-200 hover:-translate-y-1">
            <div className="relative w-full aspect-video overflow-hidden">
              <OptimizedImage
                src={cleanImageUrl(item.urlToImage) || '/placeholder-news.jpg'}
                alt={item.title}
                fill
                className="object-cover w-full h-full"
                sizes="100vw"
              />
            </div>
            <div className="p-3">
              <div className="text-xs text-red-600 font-bold mb-1">{item.source?.name}</div>
              <h3 className="text-sm font-bold mb-1 line-clamp-2 break-words text-balance">{item.title}</h3>
              <div className="text-xs text-gray-400">{new Date(item.publishedAt).toLocaleDateString('en-US')}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
} 