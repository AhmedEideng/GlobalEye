import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Make route dynamic to avoid execution during build
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ 
        error: 'Database connection not configured' 
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // First, let's check the table structure
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'news')
      .order('ordinal_position');

    if (columnsError) {
      console.log('Could not fetch table structure, proceeding with basic query');
    } else {
      console.log('Table structure:', columns);
    }

    // Check current state
    const { data: stats, error: statsError } = await supabase
      .from('news')
      .select('image_url');

    if (statsError) {
      return NextResponse.json({ 
        error: 'Failed to fetch stats', 
        details: statsError.message 
      }, { status: 500 });
    }

    const totalArticles = stats.length;
    const missingImages = stats.filter(article => 
      !article.image_url || 
      article.image_url === '' || 
      article.image_url === 'null' || 
      article.image_url === 'undefined'
    ).length;
    const hasImages = totalArticles - missingImages;

    // Update articles with missing images
    const { data: updateResult, error: updateError } = await supabase
      .from('news')
      .update({ image_url: '/placeholder-news.jpg' })
      .or('image_url.is.null,image_url.eq.,image_url.eq.null,image_url.eq.undefined')
      .select('id, title, image_url');

    if (updateError) {
      return NextResponse.json({ 
        error: 'Failed to update images', 
        details: updateError.message 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalArticles,
        missingImages,
        hasImages,
        updatedArticles: updateResult?.length || 0
      },
      updatedArticles: updateResult,
      message: `Updated ${updateResult?.length || 0} articles with missing images`
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in fix-images API:', error);

    return NextResponse.json({
      error: 'Failed to fix images',
      details: errorMessage
    }, { status: 500 });
  }
} 