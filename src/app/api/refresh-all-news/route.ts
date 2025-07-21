// src/app/api/refresh-all-news/route.ts

import { NextResponse } from 'next/server';
import { fetchExternalNews } from '@/utils/fetchExternalNews';
import { saveNewsToSupabase } from '@/utils/saveNewsToSupabase';
import { getOrAddCategoryId } from '@/utils/categoryHelpers';
import { createClient } from '@/utils/server';

export const dynamic = 'force-dynamic'; // لمنع التخزين المؤقت عند تنفيذ الكرون

export async function GET() {
  try {
    const supabase = createClient();

    // جلب كل التصنيفات من قاعدة البيانات
    const { data: categories, error: catError } = await supabase.from('categories').select('*');
    if (catError) throw catError;

    if (!categories || categories.length === 0) {
      return NextResponse.json({ message: 'No categories found in database' }, { status: 404 });
    }

    const allSavedNews = [];

    for (const category of categories) {
      const categoryName = category.name;
      const categoryId = category.id;

      // جلب أخبار كل تصنيف
      const externalNews = await fetchExternalNews(categoryName);
      if (!externalNews || externalNews.length === 0) continue;

      // تخزين الأخبار مع ربطها بالتصنيف الصحيح
      const saved = await saveNewsToSupabase(externalNews, categoryId);
      allSavedNews.push(...saved);
    }

    return NextResponse.json({
      message: 'News refreshed successfully for all categories.',
      totalSaved: allSavedNews.length,
    });
  } catch (error) {
    console.error('[refresh-all-news ERROR]', error);
    return NextResponse.json({ error: 'Failed to refresh news' }, { status: 500 });
  }
}
