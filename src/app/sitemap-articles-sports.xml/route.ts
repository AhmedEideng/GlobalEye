import { NextResponse } from 'next/server';
import { fetchNews } from '@utils/fetchNews';

export async function GET() {
  const baseUrl = 'https://globaleye.live';
  const category = 'sports';

  try {
    const articles = await fetchNews(category);
    const limitedArticles = articles.slice(0, 1000);

    let urls = '';
    if (limitedArticles.length > 0) {
      urls = limitedArticles.map(
        (article) => `
          <url>
            <loc>${baseUrl}/article/${article.slug}</loc>
            <changefreq>daily</changefreq>
            <priority>0.9</priority>
            <lastmod>${new Date(article.published_at).toISOString()}</lastmod>
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
  } catch {
    const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      </urlset>
    `;
    return new NextResponse(emptySitemap, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }
} 