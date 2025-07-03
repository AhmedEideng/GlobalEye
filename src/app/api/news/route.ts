import { fetchNews } from '../../utils/fetchNews';
import { NextResponse } from 'next/server';

export const revalidate = 300; // Cache for 5 minutes

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'general';
  
  console.log(`DEBUG: API route called for category: ${category}`);
  
  try {
  const articles = await fetchNews(category);
    console.log(`DEBUG: API route returning ${articles.length} articles for ${category}`);
    
    return NextResponse.json({ 
      articles,
      category,
      timestamp: new Date().toISOString(),
      count: articles.length
    });
  } catch (error) {
    console.error(`DEBUG: API route error for ${category}:`, error);
    return NextResponse.json({ 
      articles: [],
      error: 'Failed to fetch news',
      category,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 