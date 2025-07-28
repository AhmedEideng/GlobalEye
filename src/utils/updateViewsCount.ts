import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

// Create Supabase client
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

/**
 * Update article view count
 * @param articleId Article ID
 * @returns Promise<boolean>
 */
export async function updateArticleViews(articleId: number): Promise<boolean> {
  if (!supabase) {
    console.error('Supabase client not available');
    return false;
  }

  try {
    // First get current view count
    const { data: currentArticle } = await supabase
      .from('news')
      .select('views_count')
      .eq('id', articleId)
      .single();

    if (!currentArticle) {
      console.error('Article not found');
      return false;
    }

    // Update with new count
    const { error } = await supabase
      .from('news')
      .update({ views_count: (currentArticle.views_count || 0) + 1 })
      .eq('id', articleId);

    if (error) {
      console.error('Error updating view count:', error);
      return false;
    }

    console.log(`✅ Updated view count for article ${articleId}`);
    return true;
  } catch (error) {
    console.error('Error updating view count:', error);
    return false;
  }
}

/**
 * Get featured articles
 * @param limit Number of articles to return
 * @returns Promise<any[]>
 */
export async function getFeaturedArticles(limit = 5): Promise<any[]> {
  if (!supabase) {
    console.error('Supabase client not available');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('is_featured', true)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching featured articles:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching featured articles:', error);
    return [];
  }
}

/**
 * Get most viewed articles
 * @param limit Number of articles to return
 * @returns Promise<any[]>
 */
export async function getMostViewedArticles(limit = 10): Promise<any[]> {
  if (!supabase) {
    console.error('Supabase client not available');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('views_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching most viewed articles:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching most viewed articles:', error);
    return [];
  }
}

/**
 * Toggle article featured status
 * @param articleId Article ID
 * @param isFeatured Featured status
 * @returns Promise<boolean>
 */
export async function toggleArticleFeatured(articleId: number, isFeatured: boolean): Promise<boolean> {
  if (!supabase) {
    console.error('Supabase client not available');
    return false;
  }

  try {
    const { error } = await supabase
      .from('news')
      .update({ is_featured: isFeatured })
      .eq('id', articleId);

    if (error) {
      console.error('Error toggling featured status:', error);
      return false;
    }

    console.log(`✅ Updated featured status for article ${articleId} to ${isFeatured}`);
    return true;
  } catch (error) {
    console.error('Error toggling featured status:', error);
    return false;
  }
} 