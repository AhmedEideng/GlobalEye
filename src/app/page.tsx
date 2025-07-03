import HomeFeatured from './components/HomeFeatured';
import HomeNewsGrid from './components/HomeNewsGrid';
import HomeTrending from './components/HomeTrending';
import HomeMostRead from './components/HomeMostRead';
import { fetchNews, NewsArticle } from './utils/fetchNews';

export const revalidate = 300;

export default async function HomePage() {
  let articles: NewsArticle[] = [];
  let featuredArticle: NewsArticle | null = null;
  let error: string | null = null;

  try {
    const allArticles = await fetchNews();
    if (allArticles && allArticles.length > 0) {
      featuredArticle = allArticles[0];
      articles = allArticles.slice(1, 20); // 20 خبر لاستخدامها في الأقسام
    } else {
      error = 'لا توجد أخبار متاحة حالياً.';
    }
  } catch (err) {
    error = 'حدث خطأ أثناء تحميل الأخبار.';
  }

  return (
    <main>
      {featuredArticle && <HomeFeatured article={featuredArticle} />}
      {articles.length > 0 && <HomeTrending articles={articles} />}
      {articles.length > 0 && <HomeMostRead articles={articles} />}
      {articles.length > 0 && <HomeNewsGrid articles={articles.slice(0, 12)} />}
      {error && (
        <div className="bg-red-100 text-red-800 p-6 rounded-lg text-center font-bold mt-8">
          {error}
        </div>
      )}
    </main>
  );
} 