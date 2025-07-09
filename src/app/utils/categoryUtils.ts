import { supabase } from '@utils/supabaseClient';

/**
 * جلب قسم بالاسم من جدول categories
 * @param name اسم القسم
 * @returns بيانات القسم أو null
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
 * إضافة قسم جديد إذا لم يكن موجودًا
 * @param name اسم القسم
 * @returns بيانات القسم بعد الإضافة
 */
export async function addCategoryIfNotExists(name: string) {
  // جرب جلب القسم أولاً
  let category = await getCategoryByName(name);
  if (category) return category;
  // أضف القسم
  const { data, error } = await supabase
    .from('categories')
    .insert([{ name }])
    .select()
    .single();
  if (error || !data) return null;
  return data;
}

/**
 * جلب أو إضافة قسم وإرجاع id
 * @param name اسم القسم
 * @returns category_id أو null
 */
export async function getOrAddCategoryId(name: string): Promise<number|null> {
  const category = await addCategoryIfNotExists(name);
  return category ? category.id : null;
} 