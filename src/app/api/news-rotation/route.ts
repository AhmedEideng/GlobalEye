import { NextRequest, NextResponse } from 'next/server';
import { fetchNews } from '@/utils/fetchNews';
import { logSnagEvent } from '@/utils/logsnag';
import { measureAsyncOperation } from '@/utils/performanceMonitor';

export async function GET(request: NextRequest) {
  return measureAsyncOperation(
    'news-rotation-api',
    async () => {
      try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category') || 'general';
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Validate category
        const validCategories = [
          'general', 'business', 'technology', 'sports', 
          'entertainment', 'health', 'science', 'politics'
        ];

        if (!validCategories.includes(category)) {
          return NextResponse.json(
            { error: 'Invalid category' },
            { status: 400 }
          );
        }

        // Fetch news for the category
        const news = await fetchNews(category, limit, offset);

        // Rotate articles (shuffle for variety)
        const rotatedNews = shuffleArray([...news]);

        await logSnagEvent(
          '🔄 News Rotation', 
          `Rotated ${rotatedNews.length} articles for category: ${category}`
        );

        return NextResponse.json({
          success: true,
          category,
          count: rotatedNews.length,
          articles: rotatedNews,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        await logSnagEvent(
          '❌ News Rotation Error', 
          `Failed to rotate news: ${errorMessage}`
        );

        return NextResponse.json(
          { 
            error: 'Failed to fetch rotated news',
            details: errorMessage 
          },
          { status: 500 }
        );
      }
    }
  );
}

// Helper function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
} 