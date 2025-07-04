import { fetchNews } from './utils/fetchNews';
import { NewsArticle } from './utils/fetchNews';
import HomeFeatured from './components/HomeFeatured';
import HomeNewsGrid from './components/HomeNewsGrid';

export const revalidate = 300;

export default async function HomePage() {
  let articles: NewsArticle[] = [];
  let featuredArticle: NewsArticle | null = null;

  try {
    const allArticles = await fetchNews();
    if (allArticles && allArticles.length > 0) {
      featuredArticle = allArticles[0];
      articles = allArticles.slice(0, 50); // 50 articles for sections
    }
  } catch {
    // Removed unused error variable
  }

  return (
    <main>
      {featuredArticle && <HomeFeatured article={featuredArticle} />}
      {articles.length > 0 && <HomeNewsGrid articles={articles.slice(0, 12)} />}
    </main>
  );
} 