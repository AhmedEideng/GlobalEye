"use client";
import Link from "next/link";
import { NewsArticle, cleanImageUrl } from "../utils/fetchNews";
import OptimizedImage from "./OptimizedImage";

export default function HomeNewsGrid({ articles }: { articles: NewsArticle[] }) {
  if (!articles?.length) return null;
  return (
    <section className="mb-12">
      <div className="section-header flex flex-col sm:flex-row items-center justify-between mb-4 gap-2">
        <h2 className="section-title text-lg sm:text-xl font-bold">Latest News</h2>
        <Link href="/world" className="btn btn-secondary">View All News</Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {articles.map((article, idx) => {
          const cleanImage = cleanImageUrl(article.urlToImage);
          return (
            <Link
              key={article.slug + idx}
              href={`/article/${article.slug}`}
              className="group block bg-white rounded-xl border border-gray-100 overflow-hidden transition-all duration-200 hover:-translate-y-1"
            >
              <div className="relative w-full h-48 overflow-hidden">
                <OptimizedImage
                  src={cleanImage || "/placeholder-news.jpg"}
                  alt={article.title}
                  fill
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  sizes="100vw"
                />
              </div>
              <div className="p-4">
                <div className="article-category text-xs font-bold mb-1 bg-red-600 text-white rounded-full px-3 py-1 inline-block">{article.source?.name}</div>
                <h3 className="article-title text-lg font-bold mb-2 line-clamp-2">{article.title}</h3>
                <p className="article-excerpt text-gray-600 text-sm mb-2 line-clamp-2">{article.description}</p>
                <div className="article-meta text-xs flex flex-wrap gap-2 text-gray-400">
                  <span className="flex items-center gap-1 text-gray-400"><svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>{new Date(article.publishedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
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