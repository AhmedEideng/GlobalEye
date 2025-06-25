import Link from 'next/link';
import { fetchNews } from './utils/fetchNews';
import SearchBar from './components/SearchBar';
import ReloadButton from './components/ReloadButton';

interface Article {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: { name: string };
  category?: string;
}

export default async function HomePage() {
  let articles: Article[] = [];
  let featuredArticle: Article | null = null;
  let error: string | null = null;

  try {
    const newsData = await fetchNews('general');
    if (newsData && newsData.length > 0) {
      featuredArticle = {
        ...newsData[0],
        description: newsData[0].description || '',
        urlToImage: newsData[0].urlToImage || '',
      } as Article;
      articles = newsData.slice(1, 13).map((a) => ({
        ...a,
        description: a.description || '',
        urlToImage: a.urlToImage || '',
      })) as Article[];
    } else {
      error = 'No news available at the moment. Please check your API settings.';
    }
  } catch (err) {
    error = 'Failed to load news. Please try again.';
  }

  if (error) {
    return (
      <div className="error">
        <h2>Error loading news</h2>
        <p>{error}</p>
        <div style={{ marginTop: '20px' }}>
          <p><strong>To ensure the site works:</strong></p>
          <ul style={{ textAlign: 'left', marginTop: '10px' }}>
            <li>Make sure you added your API key in .env.local</li>
            <li>Check your API key validity</li>
            <li>Check your internet connection</li>
          </ul>
        </div>
        <ReloadButton>Retry</ReloadButton>
      </div>
    );
  }

  if (!featuredArticle && articles.length === 0) {
    return (
      <div className="error">
        <h2>No news available</h2>
        <p>No news articles found at the moment. Please check your API settings.</p>
        <ReloadButton>Retry</ReloadButton>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Search Section */}
      <div className="search-container">
        <SearchBar />
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
            <div className="article-category">Breaking News</div>
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
          {/* Latest News Section */}
          {articles.length > 0 && (
            <section>
              <div className="section-header">
                <h2 className="section-title">Latest News</h2>
                <Link href="/world" className="btn btn-secondary">View All</Link>
              </div>
              
              <div className="news-grid">
                {articles.slice(0, 6).map((article, index) => (
                  <article key={index} className="article-card">
                    <img 
                      src={article.urlToImage || '/placeholder-news.jpg'} 
                      alt={article.title}
                      className="article-image"
                    />
                    <div className="article-content">
                      <div className="article-category">World News</div>
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

          {/* More News Section */}
          {articles.length > 6 && (
            <section>
              <div className="section-header">
                <h2 className="section-title">More News</h2>
              </div>
              
              <div className="news-grid">
                {articles.slice(6, 12).map((article, index) => (
                  <article key={index} className="article-card">
                    <img 
                      src={article.urlToImage || '/placeholder-news.jpg'} 
                      alt={article.title}
                      className="article-image"
                    />
                    <div className="article-content">
                      <div className="article-category">News</div>
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
          {/* Trending News */}
          {articles.length > 0 && (
            <div className="sidebar-widget">
              <h3 className="widget-title">Trending News</h3>
              <ul className="trending-list">
                {articles.slice(0, 5).map((article, index) => (
                  <li key={index} className="trending-item">
                    <Link 
                      href={`/article/${encodeURIComponent(article.url)}`}
                      className="trending-link"
                    >
                      {article.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Latest Updates */}
          {articles.length > 5 && (
            <div className="sidebar-widget">
              <h3 className="widget-title">Latest Updates</h3>
              <ul className="trending-list">
                {articles.slice(5, 10).map((article, index) => (
                  <li key={index} className="trending-item">
                    <Link 
                      href={`/article/${encodeURIComponent(article.url)}`}
                      className="trending-link"
                    >
                      {article.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 