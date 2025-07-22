import { NextResponse } from 'next/server';
import { supabase } from '@utils/supabaseClient';

export async function GET() {
  try {
    // تحقق من الاتصال بقاعدة البيانات
    const { error: dbError } = await supabase.from('categories').select('id').limit(1);
    // تحقق من متغيرات البيئة
    const envStatus = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL || !!process.env.SUPABASE_URL,
      supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || !!process.env.SUPABASE_ANON_KEY || !!process.env.SUPABASE_KEY || !!process.env.supabaseKey,
      refreshNewsToken: !!process.env.REFRESH_NEWS_TOKEN,
    };
    return NextResponse.json({
      db: dbError ? 'error' : 'ok',
      env: envStatus,
      error: dbError ? dbError.message : null
    });
  } catch (err) {
    return NextResponse.json({ error: 'System status check failed', details: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
} 