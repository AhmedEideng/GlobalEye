import { NextRequest, NextResponse } from 'next/server';
import { fetchExternalNews } from '@utils/fetchExternalNews';
import { saveNewsToSupabase } from '@utils/saveNewsToSupabase';
import { getOrAddCategoryId } from '@utils/categoryUtils';
import { logSnagEvent } from '@utils/logsnag';

// Rate limiting cache
const rateLimitCache = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS = 10; // Max 10 requests per 5 minutes

// Helper function to check rate limit
function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitCache.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitCache.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= MAX_REQUESTS) {
    return false;
  }
  
  record.count++;
  return true;
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Rate limit exceeded. Please try again later.' 
        },
        { status: 429 }
      );
    }

    // Validate request headers for security
    const userAgent = request.headers.get('user-agent');
    if (!userAgent || userAgent.includes('bot')) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid request' 
        },
        { status: 403 }
      );
    }

    const supportedCategories = [
      'general',
      'business',
      'sports',
      'technology',
      'health',
      'science',
      'entertainment',
    ];

    let total = 0;
    const results: { category: string; count: number; success: boolean }[] = [];
    const errors: string[] = [];

    await logSnagEvent("🔄 بدء تحديث الأخبار", "بدأ تحديث الأخبار من جميع المصادر");

    // Process categories in parallel for better performance
    const categoryPromises = supportedCategories.map(async (category) => {
      try {
        const articles = await fetchExternalNews(category);
        const category_id = await getOrAddCategoryId(category);
        
        if (!category_id) {
          throw new Error(`Failed to get category ID for ${category}`);
        }

        await saveNewsToSupabase(articles, category_id);
        
        return {
          category,
          count: articles.length,
          success: true
        };
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        errors.push(`${category}: ${errorMessage}`);
        
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error(`Error with category "${category}":`, err);
        }
        
        await logSnagEvent(`❌ خطأ في ${category}`, errorMessage);
        
        return {
          category,
          count: 0,
          success: false
        };
      }
    });

    const categoryResults = await Promise.all(categoryPromises);
    
    categoryResults.forEach(result => {
      results.push(result);
      if (result.success) {
        total += result.count;
      }
    });

    await logSnagEvent("✅ انتهاء تحديث الأخبار", `تم حفظ ${total} مقال في Supabase`);

    return NextResponse.json({
      success: true,
      message: `تم تحديث الأخبار (${total}) مقال`,
      details: results,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    await logSnagEvent("❌ خطأ عام في تحديث الأخبار", errorMessage);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
