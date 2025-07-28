import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_KEY || '';

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({
      error: 'Supabase not configured',
      details: {
        SUPABASE_URL: supabaseUrl ? 'defined' : 'undefined',
        SUPABASE_KEY: supabaseKey ? 'defined' : 'undefined'
      }
    }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: {
      SUPABASE_URL: supabaseUrl ? 'configured' : 'missing',
      SUPABASE_KEY: supabaseKey ? 'configured' : 'missing'
    },
    tables: {},
    issues: [],
    recommendations: []
  };

  try {
    // Test 1: Check categories table
    console.log('🔍 Testing categories table...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });

    if (categoriesError) {
      diagnostics.issues.push(`Categories table error: ${categoriesError.message}`);
      diagnostics.tables.categories = { error: categoriesError.message };
    } else {
      diagnostics.tables.categories = {
        count: categories?.length || 0,
        sample: categories?.slice(0, 3) || [],
        hasSlug: categories?.every(cat => cat.slug) || false,
        hasDescription: categories?.some(cat => cat.description) || false
      };
      
      if (!categories || categories.length === 0) {
        diagnostics.issues.push('Categories table is empty');
        diagnostics.recommendations.push('Run the categories setup script');
      }
    }

    // Test 2: Check news table
    console.log('🔍 Testing news table...');
    const { data: news, error: newsError } = await supabase
      .from('news')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(10);

    if (newsError) {
      diagnostics.issues.push(`News table error: ${newsError.message}`);
      diagnostics.tables.news = { error: newsError.message };
    } else {
      diagnostics.tables.news = {
        count: news?.length || 0,
        sample: news?.slice(0, 3) || [],
        hasCategoryId: news?.some(article => article.category_id) || false,
        hasSourceName: news?.some(article => article.source_name) || false,
        hasSlug: news?.some(article => article.slug) || false,
        hasAuthor: news?.some(article => article.author) || false
      };

      if (!news || news.length === 0) {
        diagnostics.issues.push('News table is empty');
        diagnostics.recommendations.push('Run the news refresh API');
      } else {
        // Check for articles without category_id
        const articlesWithoutCategory = news?.filter(article => !article.category_id) || [];
        if (articlesWithoutCategory.length > 0) {
          diagnostics.issues.push(`${articlesWithoutCategory.length} articles without category_id`);
          diagnostics.recommendations.push('Run the database migration script to fix category relationships');
        }

        // Check for articles without source_name
        const articlesWithoutSource = news?.filter(article => !article.source_name) || [];
        if (articlesWithoutSource.length > 0) {
          diagnostics.issues.push(`${articlesWithoutSource.length} articles without source_name`);
          diagnostics.recommendations.push('Run the database migration script to fix source names');
        }
      }
    }

    // Test 3: Check category relationships
    if (categories && categories.length > 0 && news && news.length > 0) {
      console.log('🔍 Testing category relationships...');
      const categoryIds = categories.map(cat => cat.id);
      const articlesWithValidCategory = news?.filter(article => 
        article.category_id && categoryIds.includes(article.category_id)
      ) || [];
      
      diagnostics.categoryRelationships = {
        totalArticles: news.length,
        articlesWithValidCategory: articlesWithValidCategory.length,
        articlesWithoutCategory: news.length - articlesWithValidCategory.length,
        percentageWithCategory: Math.round((articlesWithValidCategory.length / news.length) * 100)
      };

      if (articlesWithValidCategory.length === 0) {
        diagnostics.issues.push('No articles have valid category relationships');
        diagnostics.recommendations.push('Run the database migration script to link articles with categories');
      }
    }

    // Test 4: Check table structure
    console.log('🔍 Checking table structure...');
    try {
      const { data: categoriesStructure } = await supabase
        .from('categories')
        .select('id, name, slug, description, created_at, updated_at')
        .limit(1);

      const { data: newsStructure } = await supabase
        .from('news')
        .select('id, title, description, url, image_url, published_at, source_name, author, slug, category_id')
        .limit(1);

      diagnostics.tableStructure = {
        categories: categoriesStructure ? 'OK' : 'Missing columns',
        news: newsStructure ? 'OK' : 'Missing columns'
      };
    } catch (error) {
      diagnostics.issues.push(`Table structure check failed: ${error}`);
    }

    // Generate summary
    const hasIssues = diagnostics.issues.length > 0;
    const hasNews = diagnostics.tables.news?.count > 0;
    const hasCategories = diagnostics.tables.categories?.count > 0;
    const hasRelationships = diagnostics.categoryRelationships?.articlesWithValidCategory > 0;

    diagnostics.summary = {
      status: hasIssues ? 'needs_attention' : 'healthy',
      hasNews,
      hasCategories,
      hasRelationships,
      totalIssues: diagnostics.issues.length,
      priority: hasIssues ? 'high' : 'low'
    };

    console.log('📊 Database diagnostics completed:', diagnostics.summary);

    return NextResponse.json(diagnostics);

  } catch (error) {
    console.error('❌ Database diagnostic error:', error);
    return NextResponse.json({
      error: 'Database diagnostic failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 