'use server';

import { createClient } from '@/utils/supabase/server';
import { getOrAddCategoryId } from './getOrAddCategoryId';
import { Article } from './types'; // ← استخدام النوع الجديد

export async function saveNewsToSupabase(category: string, articles: Article[]) {
  const supabase = createClient();

  for (const article of articles) {
    const categoryId = await getOrAddCategoryId(category);

    // تجاهل المقالات بدون رابط (url مطلوب في قاعدة البيانات)
    if (!article.url) continue;

    const { data: existing, error: fetchError } = await supabase
      .from('news')
      .select('id')
      .eq('url', article.url)
      .maybeSingle();

    if (fetchError) {
      console.error('Fetch Error:', fetchError.message);
      continue;
    }

    if (!existing) {
      const { error: insertError } = await supabase.from('news').insert({
        title: article.title || null,
        description: article.description || null,
        content: article.content || null,
        url: article.url,
        url_to_image: article.urlToImage || null,
        published_at: article.publishedAt || null,
        source_name: article.source?.name || null,
        author: article.author || null,
        category_id: categoryId,
      });

      if (insertError) {
        console.error('Insert Error:', insertError.message);
      }
    }
  }
}
