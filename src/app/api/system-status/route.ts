import { NextResponse } from 'next/server';
import { supabase } from '@utils/supabaseClient';

export async function GET() {
  try {
    // Check database connection
    const { error: dbError } = await supabase.from('categories').select('id').limit(1);
    // Check environment variables
    const envStatus = {
      supabaseUrl: !!process.env.SUPABASE_URL,
      supabaseKey: !!process.env.SUPABASE_KEY,
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