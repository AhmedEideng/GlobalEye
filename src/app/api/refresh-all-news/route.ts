import { NextResponse } from 'next/server';
import { fetchExternalNews } from '@/utils/fetchExternalNews';
import { saveNewsToSupabase } from '@/utils/saveNewsToSupabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (token !== process.env.REFRESH_TOKEN) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  try {
    const newsItems = await fetchExternalNews();
    if (!newsItems.length) {
      return NextResponse.json({ error: 'No news items fetched' }, { status: 400 });
    }

    await saveNewsToSupabase(newsItems);
    return NextResponse.json({ message: `News refreshed successfully: ${newsItems.length} items` });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to refresh news' }, { status: 500 });
  }
}
