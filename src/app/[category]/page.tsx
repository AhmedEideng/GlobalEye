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