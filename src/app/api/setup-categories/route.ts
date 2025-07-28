import { NextResponse } from 'next/server';
import { supabase } from '@utils/supabaseClient';
import { logSnagEvent } from '@utils/logsnag';

const categories = [
  { name: 'World', slug: 'world', description: 'Comprehensive coverage of international news, global events, diplomatic relations, and major world developments affecting multiple countries and regions' },
  { name: 'Business', slug: 'business', description: 'In-depth analysis of global markets, economic trends, corporate developments, financial news, and business strategies from leading companies worldwide' },
  { name: 'Technology', slug: 'technology', description: 'Latest innovations in tech industry, breakthrough developments, startup news, gadget reviews, and digital transformation trends shaping our future' },
  { name: 'Sports', slug: 'sports', description: 'Comprehensive sports coverage including major leagues, international competitions, athlete profiles, match results, and sports industry developments' },
  { name: 'Entertainment', slug: 'entertainment', description: 'Celebrity news, movie releases, music industry updates, TV show developments, and cultural events from the entertainment world' },
  { name: 'Health', slug: 'health', description: 'Medical breakthroughs, healthcare innovations, wellness trends, public health updates, and scientific discoveries in medicine and healthcare' },
  { name: 'Science', slug: 'science', description: 'Cutting-edge scientific research, space exploration, environmental studies, breakthrough discoveries, and technological advancements in research' },
  { name: 'General', slug: 'general', description: 'Breaking news, current events, and important developments that don\'t fit into specific categories but are significant for public awareness' }
];

export async function GET() {
  try {
    // Note: This endpoint requires RLS policies to be disabled or configured properly
    // for the categories table in Supabase. The current error suggests that
    // row-level security is preventing insertions.
    
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