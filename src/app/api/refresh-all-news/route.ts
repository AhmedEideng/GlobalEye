import { NextResponse } from 'next/server'
import { fetchExternalNews } from '@utils/fetchExternalNews'
import { saveNewsToSupabase } from '@utils/saveNewsToSupabase'
import { getCategoriesFromSupabase } from '@utils/getCategoriesFromSupabase'
import { z } from 'zod';
// تم حذف NewsArticle لأنه غير مستخدم

const ExternalNewsArticleSchema = z.object({
  title: z.string(),
  description: z.string().optional().nullable(),
  url: z.string().url(),
  author: z.string().optional().nullable(),
  urlToImage: z.string().optional().nullable(),
  publishedAt: z.string().optional(),
  source: z.object({ name: z.string().optional() }).optional(),
});

export async function GET(request: Request) {
  // حماية endpoint بتوكن سري
  const url = new URL(request.url);
  const token = url.searchParams.get('token') || request.headers.get('x-api-token');
  const SECRET_TOKEN = process.env.REFRESH_NEWS_TOKEN || 'my_secret_token';
  if (token !== SECRET_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized: invalid or missing token' }, { status: 401 });
  }
  const results = [];
  let totalFetched = 0;
  let totalSaved = 0;
  const allSampleNews: {
    source: { id: null; name: string | null };
    author: string | null;
    title: string;
    description: string | null;
    url: string;
    urlToImage: string | null;
    publishedAt: string | null;
    content: null;
    slug: string;
    category: string;
  }[] = [];
  const errors = [];
  try {
    const categories = await getCategoriesFromSupabase()

    for (const category of categories) {
      let newsItems = [];
      const validNewsItems = [];
      let fetchError = null;
      try {
        newsItems = await fetchExternalNews(category.name)
        totalFetched += newsItems.length;
        // Validate each news item using zod
        for (const item of newsItems) {
          const parsed = ExternalNewsArticleSchema.safeParse(item);
          if (parsed.success) {
            validNewsItems.push(parsed.data);
          }
        }
        if (!newsItems || newsItems.length === 0) {
          errors.push({ category: category.name, error: 'No news fetched from API' });
        }
      } catch (err) {
        fetchError = err instanceof Error ? err.message : String(err);
        errors.push({ category: category.name, error: fetchError });
      }
      if (validNewsItems.length > 0) {
        const toSlug = (title: string) =>
          title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
        // أولاً: newsArticles بصيغة NewsArticle (للاستخدام الداخلي)
        const newsArticles = validNewsItems.map(item => ({
          source: { id: null, name: item.source?.name || null },
          author: item.author || null,
          title: item.title,
          description: item.description || null,
          url: item.url,
          urlToImage: item.urlToImage || null,
          publishedAt: item.publishedAt || null,
          content: null, // Content is null as external APIs don't provide it
          slug: toSlug(item.title),
          category: category.name,
        }));
        // ثانياً: newsArticlesForDb بصيغة snake_case (للحفظ في Supabase)
        const newsArticlesForDb = newsArticles.map(item => ({
          title: item.title,
          description: item.description,
          content: null, // لا يوجد محتوى من المصدر الخارجي
          url: item.url,
          url_to_image: item.urlToImage,
          published_at: item.publishedAt,
          slug: item.slug,
          author: item.author,
          source_name: item.source?.name || null,
          category_id: category.id ? Number(category.id) : null,
          is_featured: false,
          views_count: 0,
        }));
        try {
          await saveNewsToSupabase(newsArticlesForDb); // مرر فقط البيانات بصيغة snake_case
          totalSaved += newsArticles.length;
        } catch (err) {
          errors.push({ category: category.name, error: err instanceof Error ? err.message : String(err) });
        }
        newsArticles.slice(0, 3).forEach(article => allSampleNews.push(article));
        results.push({
          name: category.name,
          fetched: newsItems.length,
          saved: validNewsItems.length,
          sample: newsArticles.slice(0, 3),
          error: fetchError
        });
      }
    }

    return NextResponse.json({
      message: 'News updated successfully',
      categories: results,
      totalFetched,
      totalSaved,
      sampleNews: allSampleNews.length > 10 ? allSampleNews.filter((_, i) => i < 10) : allSampleNews,
      errors
    })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to refresh news', details: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
