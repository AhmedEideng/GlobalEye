// src/app/utils/saveNewsToSupabase.ts

import { supabase } from './supabaseClient';
import { ExternalNewsArticle } from './fetchExternalNews';

function generateSlug(title: string, url: string): string {
  if (title && title.trim()) {
    const cleanTitle = title
      .toLowerCase()
      .trim()
      .replace(/[^-\w\s]/g, '')
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

export async function saveNewsToSupabase(articles: ExternalNewsArticle[], category_id: number) {
  try {
    if (!articles.length) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.warn('No articles to save.');
      }
      return;
    }

    if (!category_id) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Category ID is missing.');
      }
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
    }));

    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(`Saving ${mapped.length} articles to Supabase...`);
    }

    const { error } = await supabase
      .from('news')
      .upsert(mapped, { onConflict: 'url' });

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Supabase upsert error:', error.message || error);
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('Articles saved successfully to Supabase.');
      }
    }
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Exception in saveNewsToSupabase:', err);
    }
  }
}
