import { fetchNewsFromnewsapi } from './sources/newsapi';
import { fetchNewsFromgenews } from './sources/gnews';
import { fetchNewsFromguardian } from './sources/theguardian';
import { fetchNewsFrommediastack } from './sources/mediastack';

// ✅ إضافة تعريف ExternalNewsArticle
export interface ExternalNewsArticle {
  title: string;
  description: string;
  content?: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source: {
    name: string;
    url?: string;
  };
  category?: string;
  country?: string;
  language?: string;
}

// ✅ الدالة المسؤولة عن جلب الأخبار من كل المصادر
export async function fetchExternalNewsFromAllSources(category: string): Promise<ExternalNewsArticle[]> {
  const [newsApiArticles, gnewsArticles, guardianArticles, mediastackArticles] = await Promise.all([
    fetchNewsFromNewsAPI(category),
    fetchNewsFromGNews(category),
    fetchNewsFromGuardian(category),
    fetchNewsFromMediastack(category),
  ]);

  const allArticles = [
    ...newsApiArticles,
    ...gnewsArticles,
    ...guardianArticles,
    ...mediastackArticles,
  ];

  return allArticles;
}
