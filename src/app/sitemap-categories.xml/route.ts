import { supabase } from '@utils/supabaseClient';
import { NextResponse } from 'next/server';

export async function GET() {
  // جلب جميع الأقسام من قاعدة البيانات
  const { data: categories, error } = await supabase
    .from('categories')
    .select('slug');

  if (error) {
    return new NextResponse('Error fetching categories', { status: 500 });
  }

  const baseUrl = 'https://globaleye.live';
  const urls = (categories as { slug: string }[] | null)?.map((cat) =>
    `<url><loc>${baseUrl}/category/${cat.slug}</loc></url>`
  ).join('') || '';

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
    },
  });
} 