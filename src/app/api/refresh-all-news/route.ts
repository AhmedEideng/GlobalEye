import { NextResponse } from 'next/server';
import { fetchExternalNews } from '@/app/utils/fetchExternalNews';
import { saveNewsToSupabase } from '@/app/utils/saveNewsToSupabase';
import { getOrAddCategoryId } from '@/app/utils/categoryUtils';
import { logSnagEvent } from '@/app/utils/logsnag'; // ← أضفنا هذا

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

  await logSnagEvent("🔄 بدء تحديث الأخبار", "بدأ تحديث الأخبار من جميع المصادر");

  for (const category of supportedCategories) {
    try {
      const articles = await fetchExternalNews(category);
      const category_id = await getOrAddCategoryId(category);
      if (!category_id) continue;

      await saveNewsToSupabase(articles, category_id);
      results.push({ category, count: articles.length });
      total += articles.length;
    } catch (err: unknown) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        if (err instanceof Error) {
          console.error(`Error with category "${category}":`, err);
        } else {
          console.error(`Error with category "${category}":`, err);
        }
      }
      await logSnagEvent(`❌ خطأ في ${category}`, err instanceof Error ? err.message : "Unknown error");
    }
  }

  await logSnagEvent("✅ انتهاء تحديث الأخبار", `تم حفظ ${total} مقال في Supabase`);

  return NextResponse.json({
    success: true,
    message: `تم تحديث الأخبار (${total}) مقال`,
    details: results,
  });
}
