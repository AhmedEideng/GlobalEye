// src/app/utils/saveNewsToSupabase.ts

import { supabase } from './supabaseClient';
import { NewsArticle } from './fetchNews';
import { logSnagEvent } from './logsnag';

export async function saveNewsToSupabase(articles: NewsArticle[], category: string): Promise<{ success: boolean; count: number; errors: string[] }> {
  if (!articles || articles.length === 0) {
    // eslint-disable-next-line no-console
    console.debug('No articles to save.');
    return { success: true, count: 0, errors: [] };
  }

  const errors: string[] = [];
  let savedCount = 0;

  try {
    // Get category ID from categories table
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category)
      .single();

    if (categoryError || !categoryData) {
      // eslint-disable-next-line no-console
      console.debug('Category ID is missing.');
      return { success: false, count: 0, errors: ['Category not found'] };
    }

    const categoryId = categoryData.id;

    // Map articles to database format
    const mapped = articles.map(article => ({
      title: article.title,
      description: article.description,
      content: article.content,
      url: article.url,
      url_to_image: article.urlToImage,
      published_at: article.publishedAt ? new Date(article.publishedAt) : null,
      source_name: article.source?.name || '',
      source_id: article.source?.id || null,
      author: article.author,
      slug: article.slug,
      category_id: categoryId,
      category: category,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    // eslint-disable-next-line no-console
    console.debug(`Saving ${mapped.length} articles to Supabase...`);

    // Upsert articles to database
    const { error } = await supabase
      .from('news')
      .upsert(mapped, {
        onConflict: 'slug',
        ignoreDuplicates: false
      });

    if (error) {
      // eslint-disable-next-line no-console
      console.debug('Supabase upsert error:', error.message || error);
      errors.push(`Database error: ${error.message}`);
      return { success: false, count: 0, errors };
    }

    savedCount = mapped.length;
    // eslint-disable-next-line no-console
    console.debug('Articles saved successfully to Supabase.');

    // Log success to LogSnag
    await logSnagEvent('✅ Articles Saved', `Saved ${savedCount} articles for ${category}`);

    return { success: true, count: savedCount, errors: [] };

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    // eslint-disable-next-line no-console
    console.debug('Exception in saveNewsToSupabase:', err);
    errors.push(`Exception: ${errorMessage}`);
    return { success: false, count: savedCount, errors };
  }
}
