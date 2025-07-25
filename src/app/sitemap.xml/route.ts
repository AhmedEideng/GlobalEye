import { supabase } from '@utils/supabaseClient';
import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://globaleye.live';

  // Get all categories from database
  const { data: categories, error } = await supabase
    .from('categories')
    .select('slug');

  if (error) {
    return new NextResponse('Error fetching categories', { status: 500 });
  }

  // Build sitemap index
  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <!-- Static pages sitemap -->
      <sitemap>
        <loc>${baseUrl}/sitemap-static.xml</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
      </sitemap>
      <!-- Category pages sitemap -->
      <sitemap>
        <loc>${baseUrl}/sitemap-categories.xml</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
      </sitemap>
      <!-- Articles sitemaps by category -->
      ${(categories as { slug: string }[] | null)?.map(cat => `
        <sitemap>
          <loc>${baseUrl}/sitemap-articles-${cat.slug}.xml</loc>
          <lastmod>${new Date().toISOString()}</lastmod>
        </sitemap>
      `).join('')}
    </sitemapindex>
  `;

  return new NextResponse(sitemapIndex, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
} 