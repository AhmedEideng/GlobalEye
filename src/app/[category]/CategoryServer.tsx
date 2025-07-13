import { NewsArticle } from '../utils/fetchNews';
import Image from 'next/image';

const categoryLabels: { [key: string]: string } = {
  'world': 'World News',
  'politics': 'Politics',
  'business': 'Business',
  'technology': 'Technology',
  'sports': 'Sports',
  'entertainment': 'Entertainment',
  'health': 'Health',
  'science': 'Science'
};

export default function CategoryServer({ category, articles }: { category: string, articles: NewsArticle[] }) {
  const categoryLabel = categoryLabels[category] || category;
  // Limit to first 52 articles only
  const limitedArticles = articles.slice(0, 52);
  const featuredArticle = limitedArticles.length > 0 ? limitedArticles[0] : null;
  const restArticles = limitedArticles.length > 1 ? limitedArticles.slice(1) : [];

  if (!featuredArticle && articles.length === 0) {
    return (
      <div className="error text-center py-8">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">No news available in {categoryLabel}</h2>
        <p className="text-gray-600 mb-6">No news articles found in the {categoryLabel} category at the moment.</p>
        <a className="btn btn-primary" href={`/${category}`}>Refresh</a>
      </div>
    );
  }

  return (
    <div className="category-page max-w-screen-xl mx-auto px-2 sm:px-4">
      {/* <AdsterraBanner728x90 /> */}
      <div className="category-header text-center mb-6">
        <h1
          className="category-title text-3xl sm:text-4xl md:text-6xl font-extrabold mb-2 tracking-tight text-red-700 break-words"
          style={{
            fontFamily: `'Playfair Display', 'Merriweather', serif`,
            textShadow: '0 2px 16px rgba(220,38,38,0.10)',
          }}
        >
          {categoryLabel}
          <span className="block h-1 w-16 mx-auto mt-2 bg-gradient-to-r from-red-600 via-red-400 to-yellow-400 rounded-full"></span>
        </h1>
        <p className="category-description text-base sm:text-lg md:text-xl text-gray-500 mt-3 font-medium max-w-2xl mx-auto">
          Stay updated with the latest, most important, and trending news in <span className="text-red-600 font-semibold">{categoryLabel}</span> from trusted sources around the world.
        </p>
      </div>

      {featuredArticle && (
        <a href={`/article/${featuredArticle.slug}`} className="article-card block featured-article mb-6 group cursor-pointer">
          <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden group-hover:opacity-90 transition-opacity duration-200">
            <Image
              src={featuredArticle.urlToImage || '/placeholder-news.svg'}
              alt={featuredArticle.title}
              fill
              className="object-cover w-full h-full"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          </div>
          <div className="featured-content">
            <div className="article-category">{categoryLabel.toUpperCase()}</div>
            <h1 className="featured-title text-xl sm:text-2xl md:text-3xl font-bold mb-2">
              {featuredArticle.title}
            </h1>
            <p className="featured-excerpt text-base sm:text-lg mb-2">{featuredArticle.description}</p>
            <div className="article-meta text-xs sm:text-sm flex flex-wrap gap-2 text-gray-500">
              <span>{featuredArticle.source.name}</span>
              <span>{new Date(featuredArticle.publishedAt).toLocaleDateString('en-GB')}</span>
            </div>
          </div>
        </a>
      )}

      {restArticles.length > 0 && (
        <section>
          <div className="section-header flex flex-col sm:flex-row items-center justify-between mb-4 gap-2">
            <h2 className="section-title text-lg sm:text-xl font-bold">All {categoryLabel} News</h2>
            <span className="article-count text-xs text-gray-400">{restArticles.length} articles</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
            {restArticles.map((article, index) => (
                <a key={article.slug || `article-${index}-${article.url}`} href={`/article/${article.slug}`} className="article-card group">
                  <div className="relative w-full h-48 overflow-hidden">
                    <Image
                      src={article.urlToImage || '/placeholder-news.svg'}
                      alt={article.title}
                      fill
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className="flex flex-col justify-between h-full p-4">
                    <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-700 transition-colors duration-200">{article.title}</h2>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">{article.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-2 border-t border-gray-100">
                      <span className="truncate max-w-[60%]">{article.source.name}</span>
                      <span>{new Date(article.publishedAt).toLocaleDateString('en-GB')}</span>
                    </div>
                  </div>
                </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
} 