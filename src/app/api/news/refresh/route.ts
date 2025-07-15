import { NextResponse } from 'next/server';
import { fetchExternalNews } from '@/app/utils/fetchExternalNews';
import { saveNewsToSupabase } from '@/app/utils/saveNewsToSupabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'general';
  try {
    const articles = await fetchExternalNews(category); // الآن يجلب من جميع المصادر ويدمج النتائج
    await saveNewsToSupabase(articles, category);
    return NextResponse.json({ success: true, count: articles.length, message: 'News updated successfully' });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Failed to refresh news' }, { status: 500 });
  }
} 