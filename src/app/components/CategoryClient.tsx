"use client";
import OptimizedImage from './OptimizedImage';
import Link from 'next/link';

interface Article {
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: { name: string };
  category?: string;
}

export default function CategoryClient({ articles, featuredArticle, categoryLabel, error }: { articles: Article[]; featuredArticle: Article | null; categoryLabel: string; error: string | null }) {
  if (error) {
    return (
      <div className="error">
        <h2>Error loading {categoryLabel} news</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!featuredArticle && articles.length === 0) {
    return (
      <div className="error">
        <h2>No news available in {categoryLabel}</h2>
        <p>No news articles found in the {categoryLabel} category at the moment.</p>
      </div>
    );
  }

  return (
    <div className="category-page">
      {/* Category Header */}
      <div className="category-header">
        <h1 className="category-title">{categoryLabel}</h1>
        <p className="category-description">Latest news in {categoryLabel}</p>
      </div>

      {/* Featured Article */}
      {featuredArticle && (
        <article className="featured-article">
          <OptimizedImage 
            src={featuredArticle.urlToImage || '/placeholder-news.jpg'} 
            alt={featuredArticle.title}
            width={800}
            height={400}
            className="featured-image"
            priority
          />
          <div className="featured-content">
            <div className="article-category">{categoryLabel.toUpperCase()}</div>
            <h1 className="featured-title">
              <Link href={`/article/${encodeURIComponent(featuredArticle.url)}`}>
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
          {/* Articles Grid */}
          {articles.length > 0 && (
            <section>
              <div className="section-header">
                <h2 className="section-title">All {categoryLabel} News</h2>
                <span className="article-count">{articles.length} articles</span>
              </div>
              
              <div className="news-grid">
                {articles.map((article, index) => (
                  <article key={index} className="article-card">
                    <OptimizedImage 
                      src={article.urlToImage || '/placeholder-news.jpg'} 
                      alt={article.title}
                      width={400}
                      height={200}
                      className="article-image"
                    />
                    <div className="article-content">
                      <h2 className="article-title">
                        <Link href={`/article/${encodeURIComponent(article.url)}`}>{article.title}</Link>
                      </h2>
                      <p className="article-excerpt">{article.description}</p>
                      <div className="article-meta">
                        <span>{article.source.name}</span>
                        <span>{new Date(article.publishedAt).toUTCString()}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
} 