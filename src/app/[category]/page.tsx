import CategoryClient from './CategoryClient';
import CategoryServer from './CategoryServer';
import ArticleCategoryJsonLdHead from './ArticleCategoryJsonLdHead';
import type { Metadata } from 'next';

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

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  const label = categoryLabels[params.category] || params.category;
  return {
    title: `${label} News | GlobalEye News`,
    description: `Latest updates and top stories in ${label} from trusted sources around the world.`
  };
}

export default async function Page({ params }: { params: { category: string } }) {
  const { category } = params;
  if (category === 'favicon.ico') {
    // يمكنك إرجاع صفحة خطأ أو إعادة توجيه أو null
    return <div style={{padding: 40, textAlign: 'center', color: 'red'}}>Invalid category</div>;
  }
  
  // Fetch rotated news data from server
  const { featured, articles, suggestedArticles } = await CategoryServer({ category });

  return (
    <>
      <ArticleCategoryJsonLdHead category={category} />
      <CategoryClient 
        category={category}
        initialFeatured={featured}
        initialArticles={articles}
        initialSuggested={suggestedArticles}
      />
    </>
  );
} 