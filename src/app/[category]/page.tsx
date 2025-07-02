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

export const revalidate = 120;

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  const { category } = params;
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

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const { category } = params;
  const categoryLabel = categoryLabels[category] || category;
  let articles: Article[] = [];
  let error: string | null = null;
  try {
    const res = await fetch(`http://localhost:3000/api/news?category=${category}`, { next: { revalidate: 120 } });
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
      <div className="category-header text-center mb-10">
        <h1
          className="category-title text-6xl md:text-7xl font-extrabold mb-2 tracking-tight inline-block relative text-red-700"
          style={{
            fontFamily: `'Playfair Display', 'Merriweather', serif`,
            textShadow: '0 2px 16px rgba(220,38,38,0.10)',
          }}
        >
          {categoryLabel}
          <span className="block h-1 w-16 mx-auto mt-2 bg-gradient-to-r from-red-600 via-red-400 to-yellow-400 rounded-full"></span>
        </h1>
        <p className="category-description text-lg md:text-xl text-gray-500 mt-3 font-medium max-w-2xl mx-auto">
          Stay updated with the latest, most important, and trending news in <span className="text-red-600 font-semibold">{categoryLabel}</span> from trusted sources around the world.
        </p>
      </div>

      {featuredArticle && (
        <article className="featured-article">
          <div className="relative w-full h-[320px] md:h-[420px] lg:h-[500px] rounded-xl overflow-hidden mb-4">
            <img
              src={featuredArticle.urlToImage || '/placeholder-news.jpg'}
              alt={featuredArticle.title}
              className="featured-image object-cover w-full h-full"
              style={{ objectFit: 'cover' }}
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          </div>
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