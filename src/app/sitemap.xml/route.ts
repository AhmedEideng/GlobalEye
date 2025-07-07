import { NextResponse } from 'next/server';
import { fetchNews } from '@utils/fetchNews';

export async function GET() {
  const baseUrl = 'https://globaleye.live';

  // Static pages
  const staticPages = [
    '',
    'about',
    'contact-us',
    'privacy',
    'terms-and-conditions',
  ];

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
      ${categories.map(category => `
        <sitemap>
          <loc>${baseUrl}/sitemap-articles-${category}.xml</loc>
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