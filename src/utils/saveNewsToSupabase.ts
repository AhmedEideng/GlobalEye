import { supabase } from './supabaseClient'
import type { NewsArticle } from './fetchNews'

export async function saveNewsToSupabase(newsItems: NewsArticle[], categoryId: string): Promise<void> {
  if (!newsItems.length) return

  const { error } = await supabase.from('news').upsert(
    newsItems.map((item) => ({
      ...item,
      category_id: categoryId
    })),
    { onConflict: 'url' }
  )

  if (error) {
    throw new Error('Error saving news to Supabase')
  }
}
