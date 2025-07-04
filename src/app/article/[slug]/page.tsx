'use client';
import { getArticleBySlug, NewsArticle } from '../../utils/fetchNews';
import OptimizedImage from '../../components/OptimizedImage';
import Link from 'next/link';
import { fetchRelatedNews, cleanImageUrl, detectCategory } from '../../utils/fetchNews';
import { useState } from 'react';

export const revalidate = 120;

export default async function ArticlePage({ params }: { params: Promise<Record<string, string>> }) {
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
      <ShareButtons url={`/article/${article.slug}`} title={article.title} />

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

function ShareButtons({ url, title }: { url: string, title: string }) {
  const [copied, setCopied] = useState(false);
  const fullUrl = typeof window !== 'undefined' ? window.location.origin + url : url;
  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="flex gap-3 mt-6 mb-8 items-center justify-center">
      {/* WhatsApp */}
      <a href={`https://wa.me/?text=${encodeURIComponent(title + ' ' + fullUrl)}`} target="_blank" rel="noopener noreferrer" title="Share on WhatsApp">
        <svg className="w-7 h-7 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M20.52 3.48A12 12 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.16 1.6 5.97L0 24l6.22-1.63A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52zM12 22c-1.85 0-3.66-.5-5.23-1.44l-.37-.22-3.69.97.99-3.59-.24-.37A9.94 9.94 0 0 1 2 12C2 6.48 6.48 2 12 2c2.54 0 4.93.99 6.74 2.8A9.94 9.94 0 0 1 22 12c0 5.52-4.48 10-10 10zm5.2-7.6c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.18.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.62-.47-.16-.01-.36-.01-.56-.01-.2 0-.52.07-.8.34-.28.28-1.08 1.06-1.08 2.58 0 1.52 1.1 2.99 1.25 3.2.15.21 2.16 3.3 5.23 4.5.73.3 1.3.48 1.75.61.74.23 1.41.2 1.94.12.59-.09 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.2-.53-.34z"/></svg>
      </a>
      {/* Telegram */}
      <a href={`https://t.me/share/url?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer" title="Share on Telegram">
        <svg className="w-7 h-7 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12c0 6.627 5.373 12 12 12s12-5.373 12-12C24 5.373 18.627 0 12 0zm5.707 8.293l-2.828 8.485c-.213.64-.77.822-1.312.573l-3.637-2.687-1.754-.844-2.41-.793c-.524-.172-.533-.414.11-.608l9.36-2.88c.524-.172.82.127.675.608z"/></svg>
      </a>
      {/* Copy Link */}
      <button onClick={handleCopy} title="Copy link" className="focus:outline-none">
        <svg className="w-7 h-7 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      </button>
      {copied && <span className="text-xs text-green-600 ml-2 animate-pulse">Copied!</span>}
    </div>
  );
} 