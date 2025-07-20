import { NextResponse } from 'next/server';
import { supabase } from '@utils/supabaseClient';
import { logSnagEvent } from '@utils/logsnag';

const categories = [
  { name: 'General', slug: 'general', description: 'General news and current events' },
  { name: 'Business', slug: 'business', description: 'Business, economy, and financial news' },
  { name: 'Sports', slug: 'sports', description: 'Sports news and updates' },
  { name: 'Technology', slug: 'technology', description: 'Technology and innovation news' },
  { name: 'Health', slug: 'health', description: 'Health and medical news' },
  { name: 'Science', slug: 'science', description: 'Science and research news' },
  { name: 'Entertainment', slug: 'entertainment', description: 'Entertainment and celebrity news' }
];

export async function GET() {
  try {
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const category of categories) {
      try {
        // Check if category already exists
        const { data: existingCategory } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', category.slug)
          .single();

        if (existingCategory) {
          results.push({
            category: category.slug,
            status: 'exists',
            message: 'Category already exists'
          });
          successCount++;
          continue;
        }

        // Insert new category
        const { data, error } = await supabase
          .from('categories')
          .insert({
            name: category.name,
            slug: category.slug,
            description: category.description,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          results.push({
            category: category.slug,
            status: 'error',
            message: error.message
          });
          errorCount++;
        } else {
          results.push({
            category: category.slug,
            status: 'created',
            message: 'Category created successfully',
            id: data.id
          });
          successCount++;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        results.push({
          category: category.slug,
          status: 'error',
          message: errorMessage
        });
        errorCount++;
      }
    }

    await logSnagEvent(
      '🔧 Categories Setup', 
      `Created ${successCount} categories, ${errorCount} errors`
    );

    return NextResponse.json({
      success: errorCount === 0,
      message: `Categories setup completed: ${successCount} successful, ${errorCount} failed`,
      results,
      summary: {
        total: categories.length,
        success: successCount,
        errors: errorCount
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await logSnagEvent('❌ Categories Setup Error', errorMessage);
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 