import { fetchNews } from '../../utils/fetchNews';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'general';
  const articles = await fetchNews(category);
  return NextResponse.json(articles);
} 