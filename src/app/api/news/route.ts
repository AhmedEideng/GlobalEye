import { fetchNews } from '../../utils/fetchNews';
import { NextResponse } from 'next/server';

export const revalidate = 900; // Cache for 5 minutes

const allowedCategories = [
  'world', 'politics', 'business', 'technology', 'sports', 'entertainment', 'health', 'science', 'general'
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let category = searchParams.get('category') || 'general';
  if (!allowedCategories.includes(category)) {
    category = 'general';
  }
  
  try {
    const articles = await fetchNews(category);
    const response = NextResponse.json({ 
      articles,
      category,
      timestamp: new Date().toISOString(),
      count: articles.length
    });
    response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    return response;
  } catch {
    const errorResponse = NextResponse.json({ 
      articles: [],
      error: 'Failed to fetch news',
      category,
      timestamp: new Date().toISOString()
    }, { status: 500 });
    errorResponse.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    return errorResponse;
  }
} 