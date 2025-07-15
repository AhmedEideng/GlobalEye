import { supabase } from './supabaseClient';
import { ExternalNewsArticle } from './fetchExternalNews';

export async function saveNewsToSupabase(articles: ExternalNewsArticle[], category: string) {
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

  // upsert لتجنب التكرار بناءً على url
  await supabase.from('news').upsert(mapped, { onConflict: 'url' });
} 