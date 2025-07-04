import CategoryClient from './CategoryClient';

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const { category } = params;
  return <CategoryClient category={category} />;
} 