import { NextResponse } from 'next/server';
import { fetchExternalNews } from '@/app/utils/fetchExternalNews';
import { saveNewsToSupabase } from '@/app/utils/saveNewsToSupabase';
import { supabase } from '@/app/utils/supabaseClient';
import { getOrAddCategoryId } from '@/app/utils/categoryUtils';

export async function GET() {
  try {
    // جلب جميع التصنيفات من جدول categories
    const { data: categories, error } = await supabase
      .from('categories')
      .select('name');

    if (error || !categories) {
      return NextResponse.json({
        success: false,
        message: 'فشل في جلب التصنيفات من قاعدة البيانات',
        error: error?.message,
      }, { status: 500 });
    }

    let total = 0;
    for (const cat of categories) {
      const category = cat.name;
      try {
        const articles = await fetchExternalNews(category);
        const category_id = await getOrAddCategoryId(category);
        if (!category_id) {
          console.error(`لم يتم العثور على category_id للتصنيف: ${category}`);
          continue;
        }
        await saveNewsToSupabase(articles, category_id);
        total += articles.length;
      } catch (err) {
        console.error(`Error fetching or saving category "${category}":`, err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `تم تحديث الأخبار لجميع التصنيفات (${categories.length})`,
      total_articles: total,
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      message: `خطأ عام أثناء التحديث: ${err}`,
    }, { status: 500 });
  }
}