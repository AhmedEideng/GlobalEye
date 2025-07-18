import { supabase } from '@utils/supabaseClient';

/**
 * Fetch a category by name from the categories table
 * @param name Category name
 * @returns Category data or null
 */
export async function getCategoryByName(name: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .ilike('name', name)
    .single();
  if (error || !data) return null;
  return data;
}

/**
 * Add a new category if it doesn't exist
 * @param name Category name
 * @returns Category data after adding
 */
export async function addCategoryIfNotExists(name: string) {
  // Try to fetch the category first
  const category = await getCategoryByName(name);
  if (category) return category;
  // Add the category
  const { data, error } = await supabase
    .from('categories')
    .insert([{ name }])
    .select()
    .single();
  if (error || !data) return null;
  return data;
}

/**
 * Get or add a category and return the id
 * @param name Category name
 * @returns category_id or null
 */
export async function getOrAddCategoryId(name: string): Promise<number|null> {
  const category = await addCategoryIfNotExists(name);
  return category ? category.id : null;
}

/**
 * Fetch all categories from the categories table
 * @returns Array of categories or []
 */
export async function fetchAllCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*');
  if (error || !data) return [];
  return data;
} 