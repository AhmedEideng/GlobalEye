import { supabase } from './supabaseClient';
import { ExternalNewsArticle } from './fetchExternalNews';

export async function saveNewsToSupabase(articles: ExternalNewsArticle[], category: string) {
  console.log('Fetched articles:', articles.length);
  if (!articles.length) return;

  // تجهيز البيانات لتناسب بنية جدول news
  const mapped = articles.map(article => ({
    title: article.title,
    description: article.description,
    url: article.url,
    url_to_image: article.urlToImage,
    published_at: article.publishedAt ? new Date(article.publishedAt) : null,
    content: article.content,
    source_name: article.source.name,
    author: article.author,
    category, // يمكنك تعديل هذا الحقل حسب بنية الجدول لديك
  }));

  console.log('Articles to upsert:', mapped.length);
  const { data, error } = await supabase.from('news').upsert(mapped, { onConflict: 'url' });
  console.log('Upsert result:', { data, error });
} 