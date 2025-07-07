import { NextResponse } from 'next/server';
import { fetchNews } from '@utils/fetchNews';

export async function GET() {
  const baseUrl = 'https://globaleye.live'; // Change this to your site domain

  // Static pages
  const staticPages = [
    '',
    'about',
    'contact-us',
    'privacy',
    'terms-and-conditions',
    // Add more as needed
  ];

  // Categories (example: you can modify to fetch categories from DB)
  const categories = [
    'business',
    'sports',
    'technology',
    'health',
    // Add or fetch categories dynamically
  ];

  // Fetch articles (example: fetch first 50 articles from each category)
  let articleSlugs: string[] = [];
  for (const category of categories) {
    try {
      const articles = await fetchNews(category);
      articleSlugs.push(...articles.slice(0, 50).map(article => article.slug));
    } catch {}
  }
  // Remove duplicates
  articleSlugs = Array.from(new Set(articleSlugs));

  // Build URLs
  const urls = [
    ...staticPages.map(
      (page) => `
        <url>
          <loc>${baseUrl}/${page}</loc>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>
      `
    ),
    ...categories.map(
      (cat) => `
        <url>
          <loc>${baseUrl}/${cat}</loc>
          <changefreq>daily</changefreq>
          <priority>0.7</priority>
        </url>
      `
    ),
    ...articleSlugs.map(
      (slug) => `
        <url>
          <loc>${baseUrl}/article/${slug}</loc>
          <changefreq>daily</changefreq>
          <priority>0.9</priority>
        </url>
      `
    ),
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urls.join('')}
    </urlset>
  `;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
} 