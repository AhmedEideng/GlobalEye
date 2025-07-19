// src/app/utils/saveNewsToSupabase.ts

import { supabase } from './supabaseClient';
import { NewsArticle } from './fetchNews';
import { logSnagEvent } from './logsnag';
import { measureAsyncOperation } from './performanceMonitor';

interface SaveResult {
  success: boolean;
  count: number;
  errors: string[];
  duplicates: number;
  newArticles: number;
}

interface BatchResult {
  saved: number;
  duplicates: number;
  errors: string[];
}

export async function saveNewsToSupabase(articles: NewsArticle[], category: string): Promise<SaveResult> {
  return measureAsyncOperation(
    'saveNewsToSupabase',
    async () => {
      if (!articles || articles.length === 0) {
        return { success: true, count: 0, errors: [], duplicates: 0, newArticles: 0 };
      }

      const errors: string[] = [];
      let totalSaved = 0;
      let totalDuplicates = 0;
      let totalNewArticles = 0;

      try {
        // Get category ID once (cached for better performance)
        const categoryId = await getCategoryId(category);
        if (!categoryId) {
          return { 
            success: false, 
            count: 0, 
            errors: ['Category not found'], 
            duplicates: 0, 
            newArticles: 0 
          };
        }

        // Process articles in batches for better memory management
        const BATCH_SIZE = 50;
        const batches = chunkArray(articles, BATCH_SIZE);
        
        for (let i = 0; i < batches.length; i++) {
          const batch = batches[i];
          const batchResult = await processBatch(batch, categoryId, category);
          
          totalSaved += batchResult.saved;
          totalDuplicates += batchResult.duplicates;
          totalNewArticles += batchResult.saved;
          errors.push(...batchResult.errors);
          
          // Log progress for large batches
          if (batches.length > 1) {
            await logSnagEvent(
              "📊 Batch Progress", 
              `Batch ${i + 1}/${batches.length}: ${batchResult.saved} saved, ${batchResult.duplicates} duplicates`
            );
          }
        }

        await logSnagEvent(
          '✅ Articles Saved', 
          `Saved ${totalNewArticles} new articles, ${totalDuplicates} duplicates for ${category}`
        );

        return {
          success: errors.length === 0,
          count: totalSaved,
          errors,
          duplicates: totalDuplicates,
          newArticles: totalNewArticles
        };

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        errors.push(`Exception: ${errorMessage}`);
        
        await logSnagEvent('❌ Save Error', `Failed to save articles for ${category}: ${errorMessage}`);
        
        return {
          success: false,
          count: totalSaved,
          errors,
          duplicates: totalDuplicates,
          newArticles: totalNewArticles
        };
      }
    },
    category
  );
}

// Cache for category IDs to avoid repeated database calls
const categoryCache = new Map<string, number>();

async function getCategoryId(category: string): Promise<number | null> {
  // Check cache first
  if (categoryCache.has(category)) {
    return categoryCache.get(category)!;
  }

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category)
      .single();

    if (error || !data) {
      return null;
    }

    // Cache the result
    categoryCache.set(category, data.id);
    return data.id;
  } catch {
    return null;
  }
}

async function processBatch(
  articles: NewsArticle[], 
  categoryId: number, 
  category: string
): Promise<BatchResult> {
  const errors: string[] = [];
  let saved = 0;
  let duplicates = 0;

  try {
    // Map articles to database format
    const mapped = articles.map(article => ({
      title: article.title,
      description: article.description,
      content: article.content,
      url: article.url,
      url_to_image: article.urlToImage,
      published_at: article.publishedAt ? new Date(article.publishedAt) : null,
      source_name: article.source?.name || '',
      source_id: article.source?.id || null,
      author: article.author,
      slug: article.slug,
      category_id: categoryId,
      category: category,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    // Check for existing articles first (more efficient than upsert for large datasets)
    const existingSlugs = await checkExistingSlugs(mapped.map(article => article.slug));
    
    // Separate new and existing articles
    const newArticles = mapped.filter(article => !existingSlugs.has(article.slug));
    const existingArticles = mapped.filter(article => existingSlugs.has(article.slug));

    // Insert new articles
    if (newArticles.length > 0) {
      const { error: insertError } = await supabase
        .from('news')
        .insert(newArticles);

      if (insertError) {
        errors.push(`Insert error: ${insertError.message}`);
      } else {
        saved = newArticles.length;
      }
    }

    // Update existing articles (optional - only if you want to update)
    if (existingArticles.length > 0) {
      // You can choose to update existing articles or just count them as duplicates
      duplicates = existingArticles.length;
      
      // Uncomment below if you want to update existing articles
      /*
      for (const article of existingArticles) {
        const { error: updateError } = await supabase
          .from('news')
          .update({
            title: article.title,
            description: article.description,
            content: article.content,
            url_to_image: article.url_to_image,
            updated_at: new Date().toISOString()
          })
          .eq('slug', article.slug);
        
        if (updateError) {
          errors.push(`Update error for ${article.slug}: ${updateError.message}`);
        } else {
          saved++;
        }
      }
      */
    }

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    errors.push(`Batch processing error: ${errorMessage}`);
  }

  return { saved, duplicates, errors };
}

async function checkExistingSlugs(slugs: string[]): Promise<Set<string>> {
  try {
    const { data, error } = await supabase
      .from('news')
      .select('slug')
      .in('slug', slugs);

    if (error || !data) {
      return new Set();
    }

    return new Set(data.map(item => item.slug));
  } catch {
    return new Set();
  }
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// Clear category cache periodically (optional)
export function clearCategoryCache(): void {
  categoryCache.clear();
}

// Get cache statistics (for monitoring)
export function getCategoryCacheStats(): { size: number; keys: string[] } {
  return {
    size: categoryCache.size,
    keys: Array.from(categoryCache.keys())
  };
}
