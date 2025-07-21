'use server';

import { createClient } from '@supabase/supabase-js';
import { getOrAddCategoryId } from '@/utils/categoryUtils';
import { Article } from './types';

// إنشاء عميل Supabase عادي
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function saveNewsToSupabase(category: string, articles: Article[]) {
  for (const article of articles) {
    const categoryId = await getOrAddCategoryId(category);

    if (!article.url) continue; // تجاهل المقالات بدون رابط

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
