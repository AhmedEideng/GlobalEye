import { NextResponse } from 'next/server'
import { fetchExternalNews } from '@utils/fetchExternalNews'
import { saveNewsToSupabase } from '@utils/saveNewsToSupabase'
import { getCategoriesFromSupabase } from '@utils/getCategoriesFromSupabase'
import { z } from 'zod';
import type { NewsArticle } from '@utils/fetchNews';

const ExternalNewsArticleSchema = z.object({
  title: z.string(),
  description: z.string().optional().nullable(),
  url: z.string().url(),
  author: z.string().optional().nullable(),
  urlToImage: z.string().optional().nullable(),
  publishedAt: z.string().optional(),
  source: z.object({ name: z.string().optional() }).optional(),
});

export async function GET() {
  const results = [];
  let totalFetched = 0;
  let totalSaved = 0;
  let allSampleNews: NewsArticle[] = [];
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
        const newsArticles = validNewsItems.map(item => ({
          source: { id: null, name: item.source?.name || '' },
          author: item.author || null,
          title: item.title,
          description: item.description || null,
          url: item.url,
          urlToImage: item.urlToImage || null,
          publishedAt: item.publishedAt || '',
          content: null,
          slug: toSlug(item.title),
          category: category.name,
        }));
        try {
          await saveNewsToSupabase(newsArticles, category.id)
          totalSaved += newsArticles.length;
        } catch (err) {
          errors.push({ category: category.name, error: err instanceof Error ? err.message : String(err) });
        }
        allSampleNews = allSampleNews.concat(newsArticles.slice(0, 3));
      }
      results.push({
        name: category.name,
        fetched: newsItems.length,
        saved: validNewsItems.length,
        sample: validNewsItems.slice(0, 3),
        error: fetchError
      });
    }

    return NextResponse.json({
      message: 'News updated successfully',
      categories: results,
      totalFetched,
      totalSaved,
      sampleNews: allSampleNews.slice(0, 10),
      errors
    })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to refresh news', details: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
