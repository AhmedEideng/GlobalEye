import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Supabase environment variables are missing' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const supabaseAdmin = supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : supabase;

  try {
    // مثال: إعداد الفئات في جدول categories
    const categories = [
      { name: 'world' },
      { name: 'Business' },
      { name: 'Sports' },
      { name: 'Entertainment' },
      { name: 'Health' },
      { name: 'Science' },
      { name: 'Technology' },
      { name: 'Politics' },
      
      // أضف فئات أخرى حسب الحاجة
    ];

    const { error } = await supabaseAdmin.from('categories').upsert(categories, { onConflict: 'name' });

    if (error) {
      return NextResponse.json({ error: `Supabase error: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ message: 'Categories set up successfully' });
  } catch {
    return NextResponse.json({ error: 'Failed to set up categories' }, { status: 500 });
  }
}
