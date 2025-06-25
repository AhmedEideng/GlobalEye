import Link from 'next/link';
import { fetchNews } from '../utils/fetchNews';

interface Article {
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: { name: string };
  category?: string;
}

interface CategoryPageProps {
  params: {
    category: string;
  };
}

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

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = params.category;
  const categoryLabel = categoryLabels[category] || category;

  let articles: Article[] = [];
  let error: string | null = null;

  try {
    articles = await fetchNews(category);
    if (!articles || articles.length === 0) {
      error = `No news available in the "${categoryLabel}" category. Please try again.`;
    }
  } catch (err) {
    error = 'Failed to load news. Please try again.';
  }

  const featuredArticle = articles.length > 0 ? articles[0] : null;
  const restArticles = articles.length > 1 ? articles.slice(1) : [];

  if (error) {
    return (
      <div className="error">
        <h2>Error loading {categoryLabel} news</h2>
        <p>{error}</p>
        <div style={{ marginTop: '20px' }}>
          <Link href="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!featuredArticle && restArticles.length === 0) {
    return (
      <div className="error">
        <h2>No news in {categoryLabel}</h2>
        <p>No news found in this category at the moment.</p>
        <div style={{ marginTop: '20px' }}>
          <Link href="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
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
          <img 
            src={featuredArticle.urlToImage || '/placeholder-news.jpg'} 
            alt={featuredArticle.title}
            className="featured-image"
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
          {restArticles.length > 0 && (
            <section>
              <div className="section-header">
                <h2 className="section-title">All {categoryLabel} News</h2>
                <span className="article-count">{restArticles.length} articles</span>
              </div>
              
              <div className="news-grid">
                {restArticles.map((article, index) => (
                  <article key={index} className="article-card">
                    <img 
                      src={article.urlToImage || '/placeholder-news.jpg'} 
                      alt={article.title}
                      className="article-image"
                    />
                    <div className="article-content">
                      <div className="article-category">{categoryLabel.toUpperCase()}</div>
                      <h3 className="article-title">
                        <Link href={`/article/${encodeURIComponent(article.url)}`}>
                          {article.title}
                        </Link>
                      </h3>
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

        {/* Sidebar */}
        <div className="sidebar">
          {/* Category Info */}
          <div className="sidebar-widget">
            <h3 className="widget-title">About {categoryLabel}</h3>
            <p>Get the latest news and updates in {categoryLabel} from trusted sources around the world.</p>
          </div>

          {/* Related Categories */}
          <div className="sidebar-widget">
            <h3 className="widget-title">Other Categories</h3>
            <ul className="trending-list">
              {Object.entries(categoryLabels).map(([key, label]) => (
                key !== category && (
                  <li key={key} className="trending-item">
                    <Link href={`/${key}`} className="trending-link">
                      {label}
                    </Link>
                  </li>
                )
              ))}
            </ul>
          </div>

          {/* Back to Home */}
          <div className="sidebar-widget">
            <h3 className="widget-title">Back to Home</h3>
            <Link href="/" className="btn btn-primary" style={{ width: '100%' }}>
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 