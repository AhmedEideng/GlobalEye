import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { detectCategory } from '@/utils/fetchNews';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (token !== process.env.REFRESH_TOKEN) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_KEY || '';

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const results: any = {
    timestamp: new Date().toISOString(),
    processed: 0,
    updated: 0,
    errors: [],
    categoryMapping: {}
  };

  try {
    console.log('🔧 Starting category fix process...');

    // Step 1: Get all categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, slug');

    if (categoriesError) {
      return NextResponse.json({ error: 'Failed to fetch categories', details: categoriesError }, { status: 500 });
    }

    if (!categories || categories.length === 0) {
      return NextResponse.json({ error: 'No categories found' }, { status: 400 });
    }

    console.log(`📋 Found ${categories.length} categories`);

    // Create category mapping
    const categoryMap = new Map();
    categories.forEach(cat => {
      categoryMap.set(cat.slug, cat.id);
      categoryMap.set(cat.name.toLowerCase(), cat.id);
    });

    // Step 2: Get all articles without category_id
    const { data: articles, error: articlesError } = await supabase
      .from('news')
      .select('id, title, description, content, source_name, author, slug, category_id')
      .is('category_id', null);

    if (articlesError) {
      return NextResponse.json({ error: 'Failed to fetch articles', details: articlesError }, { status: 500 });
    }

    if (!articles || articles.length === 0) {
      return NextResponse.json({ 
        message: 'No articles without category_id found',
        processed: 0,
        updated: 0
      });
    }

    console.log(`📰 Found ${articles.length} articles without category_id`);

    // Step 3: Process each article
    for (const article of articles) {
      try {
        results.processed++;

        // Create a NewsArticle object for category detection
        const newsArticle = {
          title: article.title,
          description: article.description,
          content: article.content,
          url: '',
          image_url: null,
          published_at: '',
          source: { id: null, name: article.source_name || 'Unknown' },
          author: article.author,
          slug: article.slug,
          category: ''
        };

        // Detect category using the existing function
        const detectedCategory = detectCategory(newsArticle);
        
        // Get category ID
        const categoryId = categoryMap.get(detectedCategory);
        
        if (categoryId) {
          // Update the article with the detected category
          const { error: updateError } = await supabase
            .from('news')
            .update({ category_id: categoryId })
            .eq('id', article.id);

          if (updateError) {
            console.error(`❌ Failed to update article ${article.id}:`, updateError);
            results.errors.push(`Article ${article.id}: ${updateError.message}`);
          } else {
            results.updated++;
            results.categoryMapping[article.id] = detectedCategory;
            console.log(`✅ Updated article ${article.id} with category: ${detectedCategory}`);
          }
        } else {
          console.warn(`⚠️ No category ID found for detected category: ${detectedCategory}`);
          results.errors.push(`Article ${article.id}: No category ID for ${detectedCategory}`);
        }

      } catch (error) {
        console.error(`❌ Error processing article ${article.id}:`, error);
        results.errors.push(`Article ${article.id}: ${error}`);
      }
    }

    // Step 4: Update source_name for articles that don't have it
    console.log('🔧 Fixing source_name for articles...');
    const { data: articlesWithoutSource, error: sourceError } = await supabase
      .from('news')
      .select('id, source, source_name')
      .is('source_name', null)
      .not('source', 'is', null);

    if (!sourceError && articlesWithoutSource && articlesWithoutSource.length > 0) {
      console.log(`📰 Found ${articlesWithoutSource.length} articles without source_name`);
      
      for (const article of articlesWithoutSource) {
        if (article.source) {
          const { error: updateError } = await supabase
            .from('news')
            .update({ source_name: article.source })
            .eq('id', article.id);

          if (!updateError) {
            console.log(`✅ Updated source_name for article ${article.id}`);
          }
        }
      }
    }

    // Step 5: Generate summary
    results.summary = {
      totalProcessed: results.processed,
      totalUpdated: results.updated,
      successRate: results.processed > 0 ? Math.round((results.updated / results.processed) * 100) : 0,
      totalErrors: results.errors.length
    };

    console.log('📊 Category fix completed:', results.summary);

    return NextResponse.json({
      success: true,
      message: `Category fix completed: ${results.updated} articles updated out of ${results.processed} processed`,
      results
    });

  } catch (error) {
    console.error('❌ Category fix error:', error);
    return NextResponse.json({
      error: 'Category fix failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      results
    }, { status: 500 });
  }
} 