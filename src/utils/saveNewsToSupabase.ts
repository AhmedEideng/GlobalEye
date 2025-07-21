import { createClient } from '@supabase/supabase-js'
import type { NewsItem } from './types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function saveNewsToSupabase(newsItems: NewsItem[], categoryId: string): Promise<void> {
  if (!newsItems.length) return

  const { data, error } = await supabase.from('news').upsert(
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
