import { NextRequest, NextResponse } from 'next/server';
import { fetchNews } from '@/utils/fetchNews';
import { logSnagEvent } from '@/utils/logsnag';
import { measureAsyncOperation } from '@/utils/performanceMonitor';

// جعل المسار ديناميكي لتجنب التنفيذ أثناء البناء
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return measureAsyncOperation(
    'news-rotation-api',
    async () => {
      try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category') || 'general';
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = parseInt(searchParams.get('offset') || '0');

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

        const news = await fetchNews(category, limit, offset);

        const rotatedNews = shuffleArray([...news]);

        const featured = rotatedNews[0] || null;
        const mainArticles = featured ? rotatedNews.filter(a => a.slug !== featured.slug).slice(0, 51) : rotatedNews.slice(0, 51);
        const suggestedArticles = mainArticles.slice(0, 40);

        await logSnagEvent(
          '🔄 News Rotation',
          `Rotated ${rotatedNews.length} articles for category: ${category}`
        );

        return NextResponse.json({
          success: true,
          data: {
            featured,
            mainArticles,
            suggestedArticles
          },
          category,
          count: rotatedNews.length,
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

// دالة لخلط المقالات
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
