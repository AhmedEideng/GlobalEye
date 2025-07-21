import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
)

export interface Category {
  id: string
  name: string
}

export async function getCategoriesFromSupabase(): Promise<Category[]> {
  try {
    const { data, error } = await supabase.from('categories').select('*')

    if (error || !data) {
      throw new Error(error?.message || 'Failed to fetch categories')
    }

    return data as Category[]
  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error getting categories:', error)
    }
    return []
  }
}
