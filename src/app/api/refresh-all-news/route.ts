import { NextResponse } from 'next/server'
import { fetchExternalNews } from '@utils/fetchExternalNews'
import { saveNewsToSupabase } from '@utils/saveNewsToSupabase'
import { getCategoriesFromSupabase } from '@utils/getCategoriesFromSupabase'
import { z } from 'zod';

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
  console.log('Starting refresh-all-news API');
  try {
    console.log('Fetching categories from Supabase...');
    const categories = await getCategoriesFromSupabase()
    console.log('Categories:', categories);

    for (const category of categories) {
      console.log('Processing category:', category.name, 'ID:', category.id);
      const newsItems = await fetchExternalNews(category.name)
      console.log('Fetched newsItems:', newsItems.length);
      if (newsItems.length > 0) {
        // Validate each news item using zod
        const validNewsItems = [];
        for (const item of newsItems) {
          const parsed = ExternalNewsArticleSchema.safeParse(item);
          if (parsed.success) {
            validNewsItems.push(parsed.data);
          } else {
            console.warn('Invalid news item skipped:', parsed.error);
          }
        }
        console.log('Valid news items after zod validation:', validNewsItems.length);
        if (validNewsItems.length === 0) continue;
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
        console.log('Saving newsArticles to Supabase:', newsArticles.length);
        await saveNewsToSupabase(newsArticles, category.id)
        console.log('Saved newsArticles for category:', category.name);
      }
    }

    return NextResponse.json({ message: 'News updated successfully' })
  } catch (err) {
    console.error('Error in refresh-all-news API:', err);
    return NextResponse.json({ error: 'Failed to refresh news' }, { status: 500 })
  }
}
