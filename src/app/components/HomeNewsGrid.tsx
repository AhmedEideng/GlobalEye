import Link from "next/link";
import { NewsArticle } from "../utils/fetchNews";
import OptimizedImage from "./OptimizedImage";

export default function HomeNewsGrid({ articles }: { articles: NewsArticle[] }) {
  if (!articles?.length) return null;
  return (
    <section className="mb-12">
      <div className="section-header flex flex-col sm:flex-row items-center justify-between mb-4 gap-2">
        <h2 className="section-title text-lg sm:text-xl font-bold">أحدث الأخبار</h2>
        <Link href="/world" className="btn btn-secondary">عرض كل الأخبار</Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {articles.map((article, idx) => (
          <Link
            key={article.slug + idx}
            href={`/article/${article.slug}`}
            className="group block bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-100 hover:-translate-y-1"
          >
            <div className="relative w-full h-48 overflow-hidden">
              <OptimizedImage
                src={article.urlToImage || "/placeholder-news.jpg"}
                alt={article.title}
                fill
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                sizes="100vw"
              />
            </div>
            <div className="p-4">
              <div className="article-category text-xs text-red-600 font-bold mb-1">{article.source?.name}</div>
              <h3 className="article-title text-lg font-bold mb-2 line-clamp-2">{article.title}</h3>
              <p className="article-excerpt text-gray-600 text-sm mb-2 line-clamp-2">{article.description}</p>
              <div className="article-meta text-xs flex flex-wrap gap-2 text-gray-400">
                <span>{new Date(article.publishedAt).toLocaleDateString('ar-EG')}</span>
                {article.author && <span>بواسطة {article.author}</span>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
} 