import { NextResponse } from 'next/server';
import { supabase } from '@utils/supabaseClient';
import { performanceMonitor } from '@utils/performanceMonitor';
import { logSnagEvent } from '@utils/logsnag';

export async function GET() {
  try {
    const startTime = Date.now();
    
    // Check database connection
    let dbStatus = 'unknown';
    let dbError = null;
    let categoriesCount = 0;
    let articlesCount = 0;
    
    try {
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id', { count: 'exact' });
      
      if (categoriesError) {
        dbStatus = 'error';
        dbError = categoriesError.message;
      } else {
        categoriesCount = categories?.length || 0;
        
        const { data: articles, error: articlesError } = await supabase
          .from('news')
          .select('id', { count: 'exact' });
        
        if (articlesError) {
          dbStatus = 'partial';
          dbError = articlesError.message;
        } else {
          articlesCount = articles?.length || 0;
          dbStatus = 'healthy';
        }
      }
    } catch (err) {
      dbStatus = 'error';
      dbError = err instanceof Error ? err.message : 'Unknown database error';
    }

    // Get performance stats
    const performanceStats = performanceMonitor.getStats();
    const categoryCacheStats = { size: 0, keys: [] };

    // Check environment variables
    const envStatus = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      newsApiKey: !!process.env.NEWS_API_KEY,
      gnewsApiKey: !!process.env.GNEWS_API_KEY,
      guardianApiKey: !!process.env.GUARDIAN_API_KEY,
      mediastackKey: !!process.env.MEDIASTACK_KEY,
      logsnagKey: !!process.env.LOGSNAG_API_KEY
    };

    const responseTime = Date.now() - startTime;

    const status = {
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      database: {
        status: dbStatus,
        error: dbError,
        categories: categoriesCount,
        articles: articlesCount
      },
      performance: {
        totalOperations: performanceStats.count,
        averageResponseTime: `${performanceStats.avgDuration.toFixed(2)}ms`,
        successRate: `${(performanceStats.successRate * 100).toFixed(1)}%`,
        cacheSize: categoryCacheStats.size
      },
      environment: envStatus,
      system: {
        nodeEnv: process.env.NODE_ENV || 'unknown',
        version: process.env.npm_package_version || 'unknown',
        uptime: process.uptime()
      }
    };

    // Log status check
    await logSnagEvent(
      '📊 System Status Check',
      `DB: ${dbStatus}, Articles: ${articlesCount}, Performance: ${performanceStats.successRate * 100}% success`
    );

    return NextResponse.json({
      success: true,
      status,
      message: 'System status retrieved successfully'
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await logSnagEvent('❌ System Status Error', errorMessage);
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 