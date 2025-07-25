import { createClient } from '@supabase/supabase-js';

// فحص متغيرات البيئة
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('SUPABASE_URL or SUPABASE_ANON_KEY is not set');
}

// إنشاء عميل Supabase عادي
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
