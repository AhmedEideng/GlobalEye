import { supabase } from './supabaseClient'

// نوع snake_case المناسب للجدول
interface NewsDbItem {
  title: string;
  description: string | null;
  content: string | null;
  url: string;
  url_to_image: string | null;
  published_at: string | null;
  slug: string;
  author: string | null;
  source_name: string | null;
  category_id: number | null;
  is_featured: boolean;
  views_count: number;
}

// Check if news exists in DB by url or title (last 7 days)
export async function newsExists({ url, title }: { url: string; title: string }): Promise<boolean> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('news')
    .select('id')
    .or(`url.eq.${url},title.eq.${title}`)
    .gte('published_at', sevenDaysAgo)
    .limit(1);
  return !!(data && data.length > 0);
}

export async function saveNewsToSupabase(newsItems: NewsDbItem[]): Promise<void> {
  if (!newsItems.length) return;

  // تحقق من التكرار في قاعدة البيانات قبل الحفظ
  const filtered: NewsDbItem[] = [];
  for (const item of newsItems) {
    // تحقق من وجود الخبر بنفس العنوان أو url
    const exists = await newsExists({ url: item.url, title: item.title });
    if (!exists) {
      filtered.push(item);
    }
  }
  if (!filtered.length) return;

  const { error } = await supabase.from('news').upsert(
    filtered,
    { onConflict: 'url' }
  );
  // يمكن معالجة الخطأ هنا إذا رغبت، أو تجاهله إذا لم يكن مطلوبًا
}
