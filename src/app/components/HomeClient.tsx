"use client";
import SearchBar from './SearchBar';
import OptimizedImage from './OptimizedImage';
import Link from 'next/link';

interface Article {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: { name: string };
  category?: string;
  slug: string;
}

export default function HomeClient({ articles, featuredArticle, error }: { articles: Article[]; featuredArticle: Article | null; error: string | null }) {
  if (error) {
    return (
      <div className="error">
        <h2>Error Loading News</h2>
        <p>{error}</p>
        <div style={{ marginTop: '20px' }}>
          <p><strong>To ensure the site works:</strong></p>
          <ul style={{ textAlign: 'left', marginTop: '10px' }}>
            <li>Make sure you added your API key in .env.local</li>
            <li>Check your API key validity</li>
            <li>Check your internet connection</li>
          </ul>
        </div>
        <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  if (!featuredArticle && articles.length === 0) {
    return (
      <div className="error">
        <h2>No news available</h2>
        <p>No news articles found at the moment. Please check your API settings.</p>
        <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Featured Article */}
      {featuredArticle && (
        <article className="featured-article">
          <div className="relative w-full h-[320px] md:h-[420px] lg:h-[500px] rounded-xl overflow-hidden mb-4">
            <OptimizedImage
              src={featuredArticle.urlToImage || '/placeholder-news.jpg'}
              alt={featuredArticle.title}
              fill
              className="featured-image object-cover w-full h-full"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          </div>
          <div className="featured-content">
            <div className="article-category">Breaking News</div>
            <h1 className="featured-title">
              <Link href={`/article/${featuredArticle.slug}`}>
                {featuredArticle.title}
              </Link>
            </h1>
            <p className="featured-excerpt">{featuredArticle.description}</p>
            <div className="article-meta">
              <span>{featuredArticle.source.name}</span>
              <span>{new Date(featuredArticle.publishedAt).toUTCString()}</span>
            </div>
          </div>
        </article>
      )}

      {/* Main Content Grid */}
      <div className="cnn-grid">
        {/* Main Content */}
        <div className="main-content">
          {/* Latest News Section */}
          {articles.length > 0 && (
            <section>
              <div className="section-header">
                <h2 className="section-title">Latest News</h2>
                <Link href="/world" className="btn btn-secondary">View All</Link>
              </div>
              <div className="news-grid">
                {articles.map((article, index) => (
                  <Link key={index} href={`/article/${article.slug}`} className="block article-card transition-transform duration-200 hover:scale-105 focus:outline-none">
                    <OptimizedImage 
                      src={article.urlToImage || '/placeholder-news.jpg'} 
                      alt={article.title}
                      width={400}
                      height={200}
                      className="article-image"
                    />
                    <div className="article-content">
                      <h2 className="article-title">{article.title}</h2>
                      <p className="article-excerpt">{article.description}</p>
                      <div className="article-meta">
                        <span>{article.source.name}</span>
                        <span>{new Date(article.publishedAt).toUTCString()}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
} 