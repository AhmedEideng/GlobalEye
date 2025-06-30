import HomeClient from '../app/components/HomeClient';

interface Article {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: { name: string };
  category?: string;
}

interface HomePageProps {
  articles: Article[];
  featuredArticle: Article | null;
  error: string | null;
}

export default function HomePage({ articles, featuredArticle, error }: HomePageProps) {
  return <HomeClient articles={articles} featuredArticle={featuredArticle} error={error} />;
}

export async function getServerSideProps() {
  let articles: Article[] = [];
  let featuredArticle: Article | null = null;
  let error: string | null = null;
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/news?category=general`);
    const data = await res.json();
    if (data.articles && data.articles.length > 0) {
      featuredArticle = {
        ...data.articles[0],
        description: data.articles[0].description || '',
        urlToImage: data.articles[0].urlToImage || '',
      } as Article;
      articles = data.articles.slice(1, 31).map((a: Article) => ({
        ...a,
        description: a.description || '',
        urlToImage: a.urlToImage || '',
      })) as Article[];
    } else {
      error = 'No news available at the moment. Please check your API settings.';
    }
  } catch {
    error = 'Failed to load news. Please try again.';
  }
  return {
    props: {
      articles,
      featuredArticle,
      error,
    },
  };
} 