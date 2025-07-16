import { NextResponse } from 'next/server';
import { fetchExternalNews } from '@/app/utils/fetchExternalNews';
import { saveNewsToSupabase } from '@/app/utils/saveNewsToSupabase';
import { getOrAddCategoryId } from '@/app/utils/categoryUtils';

export async function GET() {
  const supportedCategories = [
    'general',
    'business',
    'sports',
    'technology',
    'health',
    'science',
    'entertainment',
  ];

  let total = 0;
  const results: { category: string; count: number }[] = [];

  for (const category of supportedCategories) {
    try {
      const articles = await fetchExternalNews(category);
      const category_id = await getOrAddCategoryId(category);
      if (!category_id) continue;

      await saveNewsToSupabase(articles, category_id);
      results.push({ category, count: articles.length });
      total += articles.length;
    } catch (err) {
      console.error(`Error with category "${category}":`, err);
    }
  }

  return NextResponse.json({
    success: true,
    message: `تم تحديث الأخبار (${total}) مقال`,
    details: results,
  });
}
