import { supabase } from './supabaseClient'

interface NewsDbItem {
  title: string;
  description: string | null;
  content: string | null;
  url: string;
  image_url: string | null;
  published_at: string | null;
  slug: string;
  author: string | null;
  source: string | null;
  category_id: number | null;
  is_featured: boolean;
  views_count: number;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function newsExists({ url, title }: { url: string; title: string }): Promise<boolean> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from('news')
    .select('id')
    .or(`url.eq.${encodeURIComponent(url)},title.eq.${encodeURIComponent(title)}`)
    .gte('published_at', sevenDaysAgo)
    .limit(1);
  return !!(data && data.length > 0);
}

export async function saveNewsToSupabase(newsItems: NewsDbItem[]): Promise<void> {
  if (!newsItems.length) return;

  const filtered = (
    await Promise.all(
      newsItems.map(async (item) => {
        const exists = await newsExists({ url: item.url, title: item.title });
        if (exists) return null;

        if (!item.slug) item.slug = generateSlug(item.title);
        return item;
      })
    )
  ).filter(Boolean) as NewsDbItem[];

  if (!filtered.length) return;

  await supabase.from('news').upsert(
    filtered,
    { onConflict: 'url' }
  );
}
