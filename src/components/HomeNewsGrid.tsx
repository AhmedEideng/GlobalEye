"use client";
import Link from "next/link";
import { NewsArticle } from '@utils/fetchNews';
import { cleanImageUrl } from '@utils/cleanImageUrl';
import Image from "next/image";
import { AdsterraBanner468x60 } from './AdsterraAds';

export default function HomeNewsGrid({ articles }: { articles: NewsArticle[] }) {
  if (!articles?.length) return null;
  return (
    <section className="mb-12">
      <div className="section-header flex flex-col sm:flex-row items-center justify-between mb-4 gap-2">
        <h2 className="section-title text-lg sm:text-xl font-bold">Latest News</h2>
        <Link href="/world" className="btn btn-secondary">View All News</Link>
      </div>
      <AdsterraBanner468x60 />
      <div className="news-grid">
        {articles.map((article, idx) => {
          const cleanImage = cleanImageUrl(article.urlToImage);
          return (
            <Link
              key={article.slug || `article-${idx}-${article.url}`}
              href={`/article/${article.slug}`}
              className="article-card group"
            >
              <div className="relative w-full h-48 overflow-hidden">
                <Image
                  src={cleanImage || "/placeholder-news.jpg"}
                  alt={article.title}
                  fill
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="p-4">
                <div className="article-category text-xs font-bold mb-1 bg-red-600 text-white rounded-full px-3 py-1 inline-block">{article.source?.name}</div>
                <h3 className="article-title text-lg font-bold mb-2 line-clamp-2">{article.title}</h3>
                <p className="article-excerpt text-gray-600 text-sm mb-2 line-clamp-2">{article.description}</p>
                <div className="article-meta text-xs flex flex-wrap gap-2 text-gray-400">
                  <span className="flex items-center gap-1 text-gray-400">{new Date(article.publishedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  {article.author && <span>by {article.author}</span>}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
} 