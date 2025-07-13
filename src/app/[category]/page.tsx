import CategoryClient from './CategoryClient';
import CategoryServer from './CategoryServer';
import ArticleCategoryJsonLdHead from './ArticleCategoryJsonLdHead';

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  
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