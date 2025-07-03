import Link from "next/link";
import { NewsArticle, cleanImageUrl } from "../utils/fetchNews";
import OptimizedImage from "./OptimizedImage";

export default function HomeFeatured({ article }: { article: NewsArticle }) {
  if (!article) return null;
  
  const cleanImage = cleanImageUrl(article.urlToImage);
  
  return (
    <section className="mb-10">
      <div className="relative w-full h-[320px] md:h-[420px] lg:h-[500px] rounded-2xl overflow-hidden shadow-lg">
        <OptimizedImage
          src={cleanImage || "/placeholder-news.jpg"}
          alt={article.title}
          fill
          className="object-cover w-full h-full"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8 text-white z-10 max-w-2xl">
          <div className="mb-2 text-sm font-bold uppercase tracking-widest text-red-300 drop-shadow">Featured News</div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3 drop-shadow-lg">
            <Link href={`/article/${article.slug}`}>{article.title}</Link>
          </h2>
          <p className="text-lg font-medium mb-4 drop-shadow">{article.description}</p>
          <Link href={`/article/${article.slug}`} className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-full shadow transition">
            Read More
          </Link>
        </div>
      </div>
    </section>
  );
} 