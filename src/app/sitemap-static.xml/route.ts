import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://globaleye.live';
  const urls = [
    '', // Home
    'about',
    'privacy',
    'terms-and-conditions',
    'contact-us',
  ].map(path => `<url><loc>${baseUrl}/${path}</loc></url>`).join('');

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