import { NextRequest, NextResponse } from 'next/server';
import { fetchNews, NewsArticle } from '../../utils/fetchNews';

// Professional error logger for rotation API
function logRotationError(...args: unknown[]) {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.error('[NewsRotation]', ...args);
  }
  // In production, you can send errors to a monitoring service here
}

// Cache for rotation data
const rotationCache = new Map<string, { articles: NewsArticle[], lastUpdate: number }>();
const ROTATION_INTERVAL = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'general';
    
    // Check if we need to rotate news
    const now = Date.now();
    const cached = rotationCache.get(category);
    
    if (cached && (now - cached.lastUpdate) < ROTATION_INTERVAL) {
      // Return cached rotation if within 3-hour interval
      return NextResponse.json({
        success: true,
        data: cached.articles,
        lastUpdate: cached.lastUpdate,
        nextRotation: cached.lastUpdate + ROTATION_INTERVAL
      });
    }
    
    // Fetch fresh news for rotation
    const allArticles = await fetchNews(category); // الآن تجلب فقط من Supabase
    
    if (!allArticles || allArticles.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No articles available for rotation'
      }, { status: 404 });
    }
    
    // Sort articles by publication date (newest first)
    const sortedArticles = allArticles.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    
    // Select featured article (first one) and rest
    const featured = sortedArticles[0];
    if (!featured) {
      return NextResponse.json({
        success: false,
        error: 'No featured article available'
      }, { status: 404 });
    }
    const restArticles = sortedArticles.filter(a => a.slug !== featured.slug);
    const mainArticles = restArticles.slice(0, 51); // 51 articles + 1 featured = 52 total
    const suggestedArticles = restArticles.slice(0, 40);
    
    const rotationData = {
      featured,
      mainArticles,
      suggestedArticles,
      totalCount: sortedArticles.length,
      category
    };
    
    // Cache the rotation data
    rotationCache.set(category, {
      articles: sortedArticles,
      lastUpdate: now
    });
    
    return NextResponse.json({
      success: true,
      data: rotationData,
      lastUpdate: now,
      nextRotation: now + ROTATION_INTERVAL,
      cacheKey: `${category}_${Math.floor(now / ROTATION_INTERVAL)}`
    });
    
  } catch (error) {
    logRotationError('News rotation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to rotate news'
    }, { status: 500 });
  }
}

// Force rotation endpoint for testing
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'general';
    
    // Clear cache to force rotation
    rotationCache.delete(category);
    
    // Fetch fresh data
    const response = await GET(request);
    return response;
    
  } catch (error) {
    logRotationError('Force rotation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to force rotation'
    }, { status: 500 });
  }
} 