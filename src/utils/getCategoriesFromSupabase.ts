import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || process.env.supabaseKey || ''
)

export interface Category {
  id: string
  name: string
}

const ALLOWED_CATEGORIES = [
  'general', 'business', 'technology', 'sports', 'entertainment', 'health', 'science', 'politics', 'world'
];

export async function getCategoriesFromSupabase(): Promise<Category[]> {
  try {
    const { data, error } = await supabase.from('categories').select('*')

    if (error || !data) {
      throw new Error()
    }

    // فلترة الفئات غير المنطقية
    return (data as Category[]).filter(cat =>
      ALLOWED_CATEGORIES.includes(cat.name.toLowerCase())
    );
  } catch {
    return []
  }
}
