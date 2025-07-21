import { createClient } from '@supabase/supabase-js'
import type { NewsItem } from './types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
)

export async function saveNewsToSupabase(newsItems: NewsItem[], categoryId: string): Promise<void> {
  try {
    const { data: existingNews } = await supabase
      .from('news')
      .select('url')
      .in('url', newsItems.map((item) => item.url))

    const existingUrls = new Set(existingNews?.map((item) => item.url))

    const newItems = newsItems.filter((item) => !existingUrls.has(item.url))

    if (newItems.length > 0) {
      await supabase.from('news').insert(
        newItems.map((item) => ({
          title: item.title,
          description: item.description,
          url: item.url,
          image_url: item.image_url,
          published_at: item.published_at,
          source: item.source,
          category_id: categoryId,
        })),
      )
    }
  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error saving news to Supabase:', error)
    }
  }
}
