import { createClient } from '@supabase/supabase-js';
import { NewsItem } from '../types';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL or SUPABASE_ANON_KEY is not set');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function saveNewsToSupabase(newsItems: NewsItem[]): Promise<void> {
  if (!newsItems.length) {
    return;
  }

  const validNewsItems = newsItems.filter(item => {
    if (!item.url) {
      return false;
    }
    return true;
  });

  if (!validNewsItems.length) {
    return;
  }

  const { error } = await supabase
    .from('news')
    .upsert(
      validNewsItems.map((item, index) => ({
        title: item.title,
        description: item.description,
        content: item.content,
        url: item.url,
        image_url: item.image_url,
        published_at: item.published_at ? new Date(item.published_at).toISOString().replace('Z', '') : null,
        source: item.source,
        author: item.author,
        slug: item.title
          ? `${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now() + index}`
          : null,
        category_id: null,
        is_featured: false,
        views_count: 0,
      })),
      { onConflict: 'url' }
    );

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }
}
