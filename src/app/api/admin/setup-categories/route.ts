import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { supabaseAdmin } from '@utils/supabaseClient';
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

export async function POST() {
  try {
    // Verify admin access (you can add more security here)
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized - Admin access required'
      }, { status: 401 });
    }

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const category of categories) {
      try {
        // Check if category already exists
        const { data: existingCategory } = await supabaseAdmin
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

        // Insert new category using admin client
        const { data, error } = await supabaseAdmin
          .from('categories')
          .insert({
            name: category.name,
            slug: category.slug,
            description: category.description,
            created_at: new Date().toISOString()
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
      '🔧 Admin Categories Setup', 
      `Created ${successCount} categories, ${errorCount} errors`
    );

    return NextResponse.json({
      success: errorCount === 0,
      message: `Admin categories setup completed: ${successCount} successful, ${errorCount} failed`,
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
    await logSnagEvent('❌ Admin Categories Setup Error', errorMessage);
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'Use POST method for admin operations'
  }, { status: 405 });
} 