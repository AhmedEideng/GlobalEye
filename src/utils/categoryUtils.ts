import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_KEY || '';

// Create Supabase client
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

/**
 * Fetch a category by slug from the categories table
 * @param slug Category slug
 * @returns Category data or null
 */
export async function getCategoryBySlug(slug: string) {
  if (!supabase) {
    console.error('Supabase client not available');
    return null;
  }
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error || !data) return null;
  return data;
}

/**
 * Add a new category if it doesn't exist (by slug)
 * @param slug Category slug
 * @param name Category name (optional)
 * @returns Category data after adding
 */
export async function addCategoryIfNotExists(slug: string, name?: string) {
  if (!supabase) {
    console.error('Supabase client not available');
    return null;
  }
  
  // Try to fetch the category first
  const category = await getCategoryBySlug(slug);
  if (category) return category;
  // Add the category
  const { data, error } = await supabase
    .from('categories')
    .insert([{ slug, name: name || slug }])
    .select()
    .single();
  if (error || !data) return null;
  return data;
}

/**
 * Get or add a category and return the id (by slug)
 * @param slug Category slug
 * @param name Category name (optional)
 * @returns category_id or null
 */
export async function getOrAddCategoryId(slug: string, name?: string): Promise<number|null> {
  const category = await addCategoryIfNotExists(slug, name);
  return category ? category.id : null;
}

/**
 * Fetch all categories from the categories table
 * @returns Array of categories or []
 */
export async function fetchAllCategories() {
  if (!supabase) {
    console.error('Supabase client not available');
    return [];
  }
  
  const { data, error } = await supabase
    .from('categories')
    .select('*');
  if (error || !data) return [];
  return data;
} 