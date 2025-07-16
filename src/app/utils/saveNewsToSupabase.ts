import { supabase } from './supabaseClient';

// ✅ تعريف نوع المقالات المستوردة من API
interface ExternalNewsArticle {
  title: string;
  description?: string;
  url: string;
  publishedAt?: string;
  content?: string;
  author?: string;
  urlToImage?: string;
  source: {
    name: string;
  };
}

// ✅ دالة لتوليد slug فريد وآمن من العنوان أو الرابط
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
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

// ✅ الدالة الرئيسية لحفظ الأخبار في Supabase
export async function saveNewsToSupabase(articles: ExternalNewsArticle[], category_id: number) {
  try {
    if (!articles.length) {
      console.warn('⚠️ No articles to save.');
      return;
    }

    if (!category_id) {
      console.error('❌ Category ID is missing.');
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

    console.log(`📦 Saving ${mapped.length} articles to Supabase...`);

    const { error } = await supabase
      .from('news')
      .upsert(mapped, { onConflict: 'url' });

    if (error) {
      console.error('❌ Supabase upsert error:', error.message || error);
    } else {
      console.log('✅ Articles saved successfully to Supabase.');
    }
  } catch (err) {
    console.error('❌ Exception in saveNewsToSupabase:', err);
  }
}
