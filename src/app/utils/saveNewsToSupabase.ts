import { supabase } from './supabaseClient';
import { ExternalNewsArticle } from './fetchExternalNews';
import { getOrAddCategoryId } from './categoryUtils';

// دالة لتوليد slug من العنوان أو الرابط
function generateSlug(title: string, url: string): string {
  if (title && title.trim()) {
    const cleanTitle = title
      .toLowerCase()
      .trim()
      .replace(/[^ -\w\s-]/g, '')
      .replace(/[\s\-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50);
    if (!cleanTitle) {
      return `article-${Math.abs(hashCode(url)).toString()}`;
    }
    const urlHash = Math.abs(hashCode(url)).toString().slice(0, 8);
    return `${cleanTitle}-${urlHash}`;
  }
  return `article-${Math.abs(hashCode(url)).toString()}`;
}
function hashCode(str: string): number {
  let hash = 0, i, chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash;
}

export async function saveNewsToSupabase(articles: ExternalNewsArticle[], category: string) {
  console.log('Fetched articles:', articles.length);
  if (!articles.length) return;

  // جلب category_id من الاسم
  const category_id = await getOrAddCategoryId(category);
  if (!category_id) {
    console.log('Category ID not found for category:', category);
    return;
  }

  const mapped = articles.map(article => ({
    title: article.title,
    description: article.description,
    url: article.url,
    published_at: article.publishedAt ? new Date(article.publishedAt) : null,
    slug: generateSlug(article.title, article.url),
    content: article.content,
    author: article.author,
    url_to_image: article.urlToImage,
    is_featured: false,
    views_count: 0,
    source_name: article.source.name,
    category_id,
    // created_at: يُفضل تركها للقاعدة لتوليدها تلقائياً
  }));

  console.log('Articles to upsert:', mapped.length);
  const { data, error } = await supabase.from('news').upsert(mapped, { onConflict: 'url' });
  console.log('Upsert result:', { data, error });
} 