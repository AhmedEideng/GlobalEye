import CategoryClient from './CategoryClient';

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  return <CategoryClient category={category} />;
} 