import { createClient } from '@supabase/supabase-js';
import { NewsItem } from '../types';
import { getOrAddCategoryId } from './categoryUtils';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

// Check environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase environment variables not defined, using fallback values');
}

// Create Supabase client only if environment variables are available
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function saveNewsToSupabase(newsItems: NewsItem[]): Promise<void> {
  if (!newsItems.length) {
    return;
  }

  // Check if Supabase client is available
  if (!supabase) {
    console.error('Supabase client not available - cannot save news');
    throw new Error('Database connection not configured');
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

  // Process news items to get category IDs
  const processedItems = await Promise.all(
    validNewsItems.map(async (item, index) => {
      let categoryId = null;
      
      // Try to get category ID if category is specified
      if (item.category) {
        try {
          categoryId = await getOrAddCategoryId(item.category.toLowerCase(), item.category);
          console.log(`📋 Linked article "${item.title}" to category "${item.category}" (ID: ${categoryId})`);
        } catch (error) {
          console.error(`❌ Error getting category ID for "${item.category}":`, error);
        }
      }

      return {
        title: item.title,
        description: item.description,
        content: item.content,
        url: item.url,
        image_url: item.image_url,
        published_at: item.published_at ? new Date(item.published_at).toISOString().replace('Z', '') : null,
        author: item.author,
        category: item.category || 'general',
        slug: item.title
          ? `${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now() + index}`
          : null,
        category_id: categoryId,
        source_name: item.source_name || 'GlobalEye News',
        is_featured: false,
        views_count: 0,
      };
    })
  );

  const { error } = await supabase
    .from('news')
    .upsert(processedItems, { onConflict: 'url' });

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  console.log(`✅ Successfully saved ${processedItems.length} news items with category relationships`);
}
