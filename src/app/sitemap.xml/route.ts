import { NextResponse } from 'next/server';
import { fetchNews } from '@utils/fetchNews';

export async function GET() {
  const baseUrl = 'https://globaleye.live'; // عدل هذا إلى دومين موقعك

  // الصفحات الثابتة
  const staticPages = [
    '',
    'about',
    'contact-us',
    'privacy',
    'terms-and-conditions',
    // أضف المزيد حسب الحاجة
  ];

  // جلب التصنيفات (مثال: يمكنك تعديلها لجلب التصنيفات من قاعدة البيانات)
  const categories = [
    'business',
    'sports',
    'technology',
    'health',
    // أضف أو اجلب التصنيفات ديناميكياً
  ];

  // جلب المقالات (مثال: جلب أول 50 مقال من كل تصنيف)
  let articleSlugs: string[] = [];
  for (const category of categories) {
    try {
      const articles = await fetchNews(category);
      articleSlugs.push(...articles.slice(0, 50).map(article => article.slug));
    } catch {}
  }
  // إزالة التكرار
  articleSlugs = Array.from(new Set(articleSlugs));

  // بناء الروابط
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