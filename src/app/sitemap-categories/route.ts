import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://globaleye.live';

  // Categories
  const categories = [
    'world',
    'politics', 
    'business',
    'technology',
    'sports',
    'entertainment',
    'health',
    'science'
  ];

  let urls = '';
  if (categories.length > 0) {
    urls = categories.map(
      (category) => `
        <url>
          <loc>${baseUrl}/${category}</loc>
          <changefreq>daily</changefreq>
          <priority>0.7</priority>
          <lastmod>${new Date().toISOString()}</lastmod>
        </url>
      `
    ).join('');
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urls}
    </urlset>
  `;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
} 