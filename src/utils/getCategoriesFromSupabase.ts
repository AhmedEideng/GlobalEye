import { createClient } from '@supabase/supabase-js'

// إعداد الاتصال بـ Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // أو تستخدم `SUPABASE_ANON_KEY` إذا لم تكن بحاجة لصلاحيات كاملة
const supabase = createClient(supabaseUrl, supabaseKey)

export async function getCategoriesFromSupabase() {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name')

  if (error) {
    console.error('خطأ في جلب التصنيفات من Supabase:', error)
    throw new Error('فشل في جلب التصنيفات')
  }

  return data || []
}
