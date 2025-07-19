import { supabase } from '@utils/supabaseClient';

/**
 * Add article to favorites
 * @param userId - User ID
 * @param slug - Article slug
 */
export async function addFavorite(userId: string, slug: string) {
  return supabase.from('favorites').upsert({ user_id: userId, article_slug: slug });
}

/**
 * Remove article from favorites
 * @param userId - User ID
 * @param slug - Article slug
 */
export async function removeFavorite(userId: string, slug: string) {
  return supabase.from('favorites').delete().eq('user_id', userId).eq('article_slug', slug);
}

/**
 * Get all favorites for a user
 * @param userId - User ID
 */
export async function getFavorites(userId: string) {
  const { data } = await supabase.from('favorites').select('article_slug').eq('user_id', userId);
  return data?.map((fav) => fav.article_slug) || [];
}

/**
 * Check if article is in favorites
 * @param userId - User ID
 * @param slug - Article slug
 */
export async function isFavorite(userId: string, slug: string) {
  const { data } = await supabase.from('favorites').select('id').eq('user_id', userId).eq('article_slug', slug).single();
  return Boolean(data);
} 