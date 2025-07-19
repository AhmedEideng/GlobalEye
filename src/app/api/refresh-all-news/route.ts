import { NextRequest, NextResponse } from 'next/server';
import { fetchExternalNews, ExternalNewsArticle } from '@utils/fetchExternalNews';
import { saveNewsToSupabase } from '@utils/saveNewsToSupabase';
import { NewsArticle } from '@utils/fetchNews';
import { getOrAddCategoryId } from '@utils/categoryUtils';
import { logSnagEvent } from '@utils/logsnag';
import { ContentQualityService } from '@utils/contentQualityService';

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

// Supported categories
const supportedCategories = [
  'general',
  'business', 
  'sports',
  'technology',
  'health',
  'science',
  'entertainment'
];

// Helper function to convert ExternalNewsArticle to NewsArticle
function convertToNewsArticle(externalArticle: ExternalNewsArticle, category: string): NewsArticle {
  // Create a unique slug from the title and published date
  const slug = generateUniqueSlug(externalArticle.title, externalArticle.publishedAt);

  return {
    ...externalArticle,
    slug,
    category
  };
}

// Helper function to generate unique slugs
function generateUniqueSlug(title: string, publishedAt: string): string {
  // Clean the title
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .substring(0, 80); // Limit length
  
  // Add timestamp for uniqueness
  const timestamp = new Date(publishedAt).getTime();
  const shortTimestamp = timestamp.toString().slice(-8); // Last 8 digits
  
  return `${cleanTitle}-${shortTimestamp}`;
}

export async function GET(request: NextRequest) {
  try {
    // Check rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json({
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
        retryAfter: RATE_LIMIT_WINDOW / 1000
      }, { status: 429 });
    }

    const results: Array<{ category: string; count: number; success: boolean; qualityStats?: Record<string, unknown> }> = [];
    const errors: string[] = [];
    let total = 0;
    const totalQualityStats = {
      total: 0,
      passed: 0,
      failed: 0,
      averageScore: 0,
      scoreDistribution: {} as Record<string, number>
    };

    // Process categories in parallel for better performance
    const categoryPromises = supportedCategories.map(async (category) => {
      try {
        const externalArticles = await fetchExternalNews(category);
        
        // Apply quality filtering
        const qualityStats = ContentQualityService.getQualityStats(externalArticles);
        const filteredArticles = ContentQualityService.filterLowQualityArticles(externalArticles);
        
        const category_id = await getOrAddCategoryId(category);
        
        if (!category_id) {
          throw new Error(`Failed to get category ID for ${category}`);
        }

        // Convert ExternalNewsArticle to NewsArticle
        const articles: NewsArticle[] = filteredArticles.map(article => 
          convertToNewsArticle(article, category)
        );

        // Get the result from saveNewsToSupabase
        const saveResult = await saveNewsToSupabase(articles, category);
        
        // Update total quality stats
        totalQualityStats.total += qualityStats.total;
        totalQualityStats.passed += qualityStats.passed;
        totalQualityStats.failed += qualityStats.failed;
        
        return {
          category,
          count: saveResult.newArticles, // Use new articles count instead of total
          success: saveResult.success,
          qualityStats: {
            total: qualityStats.total,
            passed: qualityStats.passed,
            failed: qualityStats.failed,
            averageScore: qualityStats.averageScore,
            filteredCount: filteredArticles.length
          },
          saveStats: {
            newArticles: saveResult.newArticles,
            duplicates: saveResult.duplicates,
            errors: saveResult.errors.length
          }
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

    // Calculate overall quality stats
    if (totalQualityStats.total > 0) {
      totalQualityStats.averageScore = totalQualityStats.passed / totalQualityStats.total;
    }

    await logSnagEvent("✅ انتهاء تحديث الأخبار", `تم حفظ ${total} مقال في Supabase (جودة: ${(totalQualityStats.averageScore * 100).toFixed(1)}%)`);

    return NextResponse.json({
      success: true,
      message: `تم تحديث الأخبار (${total}) مقال`,
      details: results,
      qualityStats: totalQualityStats,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await logSnagEvent("❌ خطأ عام في تحديث الأخبار", errorMessage);
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
