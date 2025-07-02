import { Metadata } from 'next';

interface Article {
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: { name: string };
  category?: string;
  slug: string;
}

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
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

export const revalidate = 900;

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const categoryLabel = categoryLabels[category] || category;
  const title = `${categoryLabel} | GlobalEye News`;
  const description = `Latest news and updates in ${categoryLabel}. Stay informed with trusted sources from around the world.`;
  const url = `https://globaleye.news/${category}`; // Edit this to your final site URL
  const image = '/placeholder-news.jpg';
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'GlobalEye News',
      images: [
        { url: image, width: 1200, height: 630, alt: 'GlobalEye News' }
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      site: '@globaleyenews',
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const categoryLabel = categoryLabels[category] || category;
  let articles: Article[] = [];
  let error: string | null = null;
  try {
    const res = await fetch(`http://localhost:3000/api/news?category=${category}`, { cache: 'no-store' });
    const data = await res.json();
    if (data.articles && data.articles.length > 0) {
      articles = data.articles;
    } else {
      error = `No news available in the "${categoryLabel}" category. Please try again.`;
    }
  } catch {
    error = 'Failed to load news. Please try again.';
  }
  const featuredArticle = articles.length > 0 ? articles[0] : null;
  const restArticles = articles.length > 1 ? articles.slice(1) : [];

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
      <div className="category-header">
        <h1 className="category-title">{categoryLabel}</h1>
        <p className="category-description">Latest news in {categoryLabel}</p>
      </div>

      {featuredArticle && (
        <article className="featured-article">
          <img 
            src={featuredArticle.urlToImage || '/placeholder-news.jpg'} 
            alt={featuredArticle.title}
            width={800}
            height={400}
            className="featured-image"
            style={{ width: '100%', height: 'auto' }}
          />
          <div className="featured-content">
            <div className="article-category">{categoryLabel.toUpperCase()}</div>
            <h1 className="featured-title">
              <a href={`/article/${encodeURIComponent(featuredArticle.url)}`}>{featuredArticle.title}</a>
            </h1>
            <p className="featured-excerpt">{featuredArticle.description}</p>
            <div className="article-meta">
              <span>{featuredArticle.source.name}</span>
              <span>{new Date(featuredArticle.publishedAt).toUTCString()}</span>
            </div>
          </div>
        </article>
      )}

      <div className="cnn-grid">
        <div className="main-content">
          {restArticles.length > 0 && (
            <section>
              <div className="section-header">
                <h2 className="section-title">All {categoryLabel} News</h2>
                <span className="article-count">{restArticles.length} articles</span>
              </div>
              <div className="news-grid">
                {restArticles.map((article, index) => (
                  <a key={index} href={`/article/${article.slug}`} className="block article-card transition-transform duration-200 hover:scale-105 focus:outline-none">
                    <img 
                      src={article.urlToImage || '/placeholder-news.jpg'} 
                      alt={article.title}
                      width={400}
                      height={200}
                      className="article-image"
                      style={{ width: '100%', height: 'auto' }}
                    />
                    <div className="article-content">
                      <h2 className="article-title">{article.title}</h2>
                      <p className="article-excerpt">{article.description}</p>
                      <div className="article-meta">
                        <span>{article.source.name}</span>
                        <span>{new Date(article.publishedAt).toUTCString()}</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
} 