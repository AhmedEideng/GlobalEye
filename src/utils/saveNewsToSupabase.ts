import { createClient } from '@supabase/supabase-js';
import { NewsItem } from '../types';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;
if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL or SUPABASE_KEY is not set');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function saveNewsToSupabase(newsItems: NewsItem[]): Promise<void> {
  if (!newsItems.length) {
    console.warn('No news items to save');
    return;
  }

  try {
    const validNewsItems = newsItems.filter(item => {
      if (!item.url) {
        console.warn('Skipping news item with missing URL:', item.title);
        return false;
      }
      return true;
    });

    console.log('Attempting to save news items:', validNewsItems.length);

    // التحقق من slugs الموجودة لتجنب التعارض
    const slugs = validNewsItems
      .map(item => 
        item.title
          ? `${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now()}`
          : null
      )
      .filter(Boolean);
    console.log('Generated slugs:', slugs);

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
        { onConflict: 'url' } // التعامل مع تعارض url فقط
      );

    if (error) {
      console.error('Supabase error details:', error);
      throw new Error(`Supabase error: ${error.message}`);
    }
    console.log('News saved successfully:', validNewsItems.length);
  } catch (error) {
    console.error('Error saving news to Supabase:', error);
  }
}
