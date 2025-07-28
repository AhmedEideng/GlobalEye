import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const envVars = {
      SUPABASE_URL: process.env.SUPABASE_URL ? 'defined' : 'undefined',
      SUPABASE_KEY: process.env.SUPABASE_KEY ? 'defined' : 'undefined',
      NODE_ENV: process.env.NODE_ENV || 'development',
      CACHE_TTL: process.env.CACHE_TTL || '3600'
    };

    const allDefined = envVars.SUPABASE_URL === 'defined' && envVars.SUPABASE_KEY === 'defined';

    return NextResponse.json({
      success: allDefined,
      environment: envVars,
      message: allDefined ? 'All required environment variables are defined' : 'Some environment variables are missing'
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to check environment variables',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 