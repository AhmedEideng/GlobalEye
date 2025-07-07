import { fetchNews } from '../../utils/fetchNews';
import { NextResponse } from 'next/server';

export const revalidate = 300; // Cache for 5 minutes

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'general';
  
  try {
  const articles = await fetchNews(category);
    
    return NextResponse.json({ 
      articles,
      category,
      timestamp: new Date().toISOString(),
      count: articles.length
    });
      } catch {
    return NextResponse.json({ 
      articles: [],
      error: 'Failed to fetch news',
      category,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 