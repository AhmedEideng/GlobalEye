import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function GET() {
  try {
    // Fetch politics articles from database
    const { data: articles, error } = await supabase
      .from('news')
      .select(`
        slug,
        title,
        published_at,
        updated_at
      `)
      .eq('categories.slug', 'politics')
      .order('published_at', { ascending: false })
      .limit(1000);

    if (error) {
      console.error('Error fetching politics articles:', error);
      return new NextResponse('Error fetching articles', { status: 500 });
    }

    // Generate XML sitemap
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${articles?.map(article => `
  <url>
    <loc>https://globaleye.live/article/${article.slug}</loc>
    <lastmod>${new Date(article.updated_at || article.published_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('') || ''}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating politics sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
} 