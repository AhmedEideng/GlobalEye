import { supabase } from './supabaseClient'

// نوع snake_case المناسب للجدول
interface NewsDbItem {
  title: string;
  description: string | null;
  content: string | null;
  url: string;
  url_to_image: string | null;
  published_at: string | null;
  slug: string;
  author: string | null;
  source_name: string | null;
  category_id: number | null;
  is_featured: boolean;
  views_count: number;
}

export async function saveNewsToSupabase(newsItems: NewsDbItem[]): Promise<void> {
  if (!newsItems.length) return

  const { error } = await supabase.from('news').upsert(
    newsItems,
    { onConflict: 'url' }
  )

  if (error) {
    throw new Error('Error saving news to Supabase')
  }
}
