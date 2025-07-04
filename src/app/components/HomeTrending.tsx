import Link from "next/link";
import Image from "next/image";
import { NewsArticle } from "../utils/fetchNews";

export default function HomeTrending({ articles }: { articles: NewsArticle[] }) {
  // Select 4 random articles from the top
  const trendingArticles = articles.slice(0, 4);
  
  if (!trendingArticles?.length) return null;
  
  return (
    <section className="mb-10">
      <div className="section-header">
        <h2 className="section-title text-lg sm:text-xl font-bold">Trending Now</h2>
        <Link href="/world" className="btn btn-secondary">View All</Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {trendingArticles.map((article, idx) => (
          <Link
            key={article.slug + idx}
            href={`/article/${article.slug}`}
            className="group block bg-white rounded-lg border border-gray-100 overflow-hidden transition-all duration-200 hover:-translate-y-1"
          >
            <div className="relative w-full h-32 overflow-hidden">
              <Image
                src={article.urlToImage || "/placeholder-news.jpg"}
                alt={article.title}
                width={400}
                height={128}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
            <div className="p-3">
              <div className="text-xs text-red-600 font-bold mb-1">{article.source?.name}</div>
              <h3 className="text-sm font-bold mb-1 line-clamp-2">{article.title}</h3>
              <div className="text-xs text-gray-400">
                {new Date(article.publishedAt).toLocaleDateString('en-US')}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
} 