import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { NewsArticle } from '@/utils/fetchNews';
import { logSnagEvent } from '@/utils/logsnag';
import { measureAsyncOperation } from '@/utils/performanceMonitor';

// Make route dynamic to avoid execution during build
export const dynamic = 'force-dynamic';

// Rate limiting cache
const rateLimitCache = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 60; // Max 60 requests per minute

// Response cache for better performance
const responseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

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

function getCacheKey(category: string, limit: number, offset: number): string {
  return `${category}-${limit}-${offset}`;
}

export async function GET(request: NextRequest) {
  console.log('Calling news-rotation API');
  
  // Rate limiting by IP
  const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  if (!checkRateLimit(clientIP)) {
    console.warn('Rate limit exceeded for IP:', clientIP);
    return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
  }

  return measureAsyncOperation(
    'news-rotation-api',
    async () => {
      const { searchParams } = new URL(request.url);
      const category = searchParams.get('category') || 'general';
      const limit = parseInt(searchParams.get('limit') || '10');
      const offset = parseInt(searchParams.get('offset') || '0');

      try {

        console.log('Request parameters:', { category, limit, offset });

        // Check cache first
        const cacheKey = getCacheKey(category, limit, offset);
        const cached = responseCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          console.log('Returning cached response for:', cacheKey);
          return NextResponse.json(cached.data, {
            headers: {
              'Cache-Control': 'public, max-age=120, stale-while-revalidate=300',
              'X-Cache': 'HIT'
            }
          });
        }

        // Fetch fresh data
        console.log('Fetching fresh news for category:', category);
        let news: NewsArticle[] = [];
        try {
          news = await fetchNewsFromDatabase(category, limit, offset);
        } catch (error) {
          console.warn('Error fetching news, using fallback:', error);
          // Return empty array instead of throwing error
          news = [];
        }
        console.log('News fetched:', news.length, 'articles');

        const rotatedNews = shuffleArray([...news]);

        const featured = rotatedNews[0] || null;
        const mainArticles = featured ? rotatedNews.filter(a => a.slug !== featured.slug).slice(0, 51) : rotatedNews.slice(0, 51);
        const suggestedArticles = mainArticles.slice(0, 40);

        console.log('News processed:', {
          total: rotatedNews.length,
          featured: featured ? 'yes' : 'no',
          mainArticles: mainArticles.length,
          suggestedArticles: suggestedArticles.length
        });

        const responseData = {
          success: true,
          data: {
            featured,
            mainArticles,
            suggestedArticles
          },
          category,
          count: rotatedNews.length,
          timestamp: new Date().toISOString()
        };

        // Cache the response
        responseCache.set(cacheKey, {
          data: responseData,
          timestamp: Date.now()
        });

        // Clean old cache entries (keep only last 100 entries)
        if (responseCache.size > 100) {
          const entries = Array.from(responseCache.entries());
          entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
          const toDelete = entries.slice(100);
          toDelete.forEach(([key]) => responseCache.delete(key));
        }

        await logSnagEvent(
          '🔄 News Rotation',
          `Rotated ${rotatedNews.length} articles for category: ${category}`
        );

        return NextResponse.json(responseData, {
          headers: {
            'Cache-Control': 'public, max-age=120, stale-while-revalidate=300',
            'X-Cache': 'MISS'
          }
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn('Error in news-rotation API:', error);

        // Return empty response instead of error
        return NextResponse.json({
          success: true,
          data: {
            featured: null,
            mainArticles: [],
            suggestedArticles: []
          },
          category: category || 'general',
          count: 0,
          timestamp: new Date().toISOString(),
          message: 'No news available at the moment'
        });
      }
    }
  );
}

// Function to shuffle articles
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Function to fetch news from database
async function fetchNewsFromDatabase(category: string, limit: number, offset: number): Promise<NewsArticle[]> {
  // Use hardcoded values as fallback
  const supabaseUrl = process.env.SUPABASE_URL || 'https://xernfvwyruihyezuwybi.supabase.co';
  const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhlcm5mdnd5cnVpaHllenV3eWJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NzA3NjEsImV4cCI6MjA2NTM0Njc2MX0.ZmhaLrkfOz9RcTXx8lp_z0wJCmUznXQwNHb0TKhX4mw';

  console.log('Environment check:', {
    SUPABASE_URL: supabaseUrl ? 'defined' : 'undefined',
    SUPABASE_KEY: supabaseKey ? 'defined' : 'undefined'
  });

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase environment variables not defined, using fallback values');
    return [];
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // First try to get category_id
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category)
      .single();

    let dbArticles: any[] = [];

    // Strategy 1: Try to fetch by category_id
    if (categoryData?.id) {
      const { data, error } = await supabase
        .from('news')
        .select('id, title, description, content, url, image_url, published_at, slug, author, category_id, is_featured, views_count, source_name')
        .eq('category_id', categoryData.id)
        .order('published_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (!error && data && data.length > 0) {
        dbArticles = data;
      }
    }

    // Strategy 2: If no articles found, try general category
    if (dbArticles.length === 0 && category.toLowerCase() !== 'general') {
      const { data, error } = await supabase
        .from('news')
        .select('id, title, description, content, url, image_url, published_at, slug, author, category_id, is_featured, views_count, source_name')
        .order('published_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (!error && data && data.length > 0) {
        dbArticles = data;
      }
    }

    // Convert to NewsArticle format
    return dbArticles.map(article => ({
      source: {
        id: null,
        name: article.source_name || 'Unknown Source'
      },
      author: article.author,
      title: article.title,
      description: article.description,
      url: article.url,
      image_url: article.image_url,
      published_at: article.published_at,
      content: article.content,
      slug: article.slug,
      category: category,
      is_featured: article.is_featured,
      views_count: article.views_count
    }));

  } catch (error) {
    console.error('Error fetching news from database:', error);
    return [];
  }
}
