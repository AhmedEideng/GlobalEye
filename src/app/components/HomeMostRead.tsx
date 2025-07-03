import Link from "next/link";
import { NewsArticle, cleanImageUrl } from "../utils/fetchNews";
import OptimizedImage from "./OptimizedImage";

export default function HomeMostRead({ articles }: { articles: NewsArticle[] }) {
  if (!articles?.length) return null;
  // اختيار 4 أخبار من الأعلى (أو عشوائي إذا لم يوجد ترتيب views)
  const mostRead = articles.slice(0, 8).sort(() => 0.5 - Math.random()).slice(0, 4);
  return (
    <section className="mb-12">
      <div className="section-header flex items-center justify-between mb-4">
        <h2 className="section-title text-lg sm:text-xl font-bold text-blue-700">الأكثر قراءة</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {mostRead.map((article, idx) => {
          const cleanImage = cleanImageUrl(article.urlToImage);
          return (
            <Link
              key={article.slug + idx}
              href={`/article/${article.slug}`}
              className="group block bg-white rounded-xl shadow hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100 hover:-translate-y-1"
            >
              <div className="relative w-full h-32 overflow-hidden">
                <OptimizedImage
                  src={cleanImage || "/placeholder-news.jpg"}
                  alt={article.title}
                  fill
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  sizes="100vw"
                />
              </div>
              <div className="p-3">
                <h3 className="text-base font-bold mb-1 line-clamp-2 text-gray-900 group-hover:text-blue-700 transition">{article.title}</h3>
                <div className="text-xs text-gray-400">{new Date(article.publishedAt).toLocaleDateString('ar-EG')}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
} 