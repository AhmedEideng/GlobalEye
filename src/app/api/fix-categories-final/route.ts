import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function POST() {
  try {
    console.log('Starting comprehensive category fix...');

    // Check if Supabase client is available
    if (!supabase) {
      console.error('Supabase client not available');
      return NextResponse.json({
        success: false,
        error: 'Database connection not configured'
      }, { status: 500 });
    }

    // 1. Fetch current data
    const { data: categories, error: fetchError } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching categories:', fetchError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch categories',
        details: fetchError.message
      }, { status: 500 });
    }

    if (!categories || categories.length === 0) {
      console.log('No categories to fix');
      return NextResponse.json({
        success: true,
        message: 'No categories to fix',
        data: { fixed: 0, total: 0 }
      });
    }

    let fixedCount = 0;
    const results = {
      added_slugs: 0,
      unified_names: 0,
      removed_duplicates: 0
    };

    // 2. Add missing slugs
    for (const category of categories) {
      if (!category.slug) {
        const { error: updateError } = await supabase
          .from('categories')
          .update({ slug: category.name.toLowerCase() })
          .eq('id', category.id);

        if (!updateError) {
          results.added_slugs++;
          fixedCount++;
        }
      }
    }

    // 3. Unify name casing
    for (const category of categories) {
      const normalizedName = category.name.charAt(0).toUpperCase() + 
                           category.name.slice(1).toLowerCase();
      
      if (category.name !== normalizedName) {
        const { error: updateError } = await supabase
          .from('categories')
          .update({ name: normalizedName })
          .eq('id', category.id);

        if (!updateError) {
          results.unified_names++;
          fixedCount++;
        }
      }
    }

    // 4. Remove duplicates (keep newest)
    const nameGroups = new Map();
    
    // Group categories by name
    for (const category of categories) {
      const nameKey = category.name.toLowerCase();
      if (!nameGroups.has(nameKey)) {
        nameGroups.set(nameKey, []);
      }
      nameGroups.get(nameKey).push(category);
    }

    // Remove duplicates
    for (const [nameKey, group] of nameGroups) {
      if (group.length > 1) {
        // Sort by date (newest first)
        group.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        // Delete all categories except the newest
        for (let i = 1; i < group.length; i++) {
          const { error: deleteError } = await supabase
            .from('categories')
            .delete()
            .eq('id', group[i].id);

          if (!deleteError) {
            results.removed_duplicates++;
            fixedCount++;
          }
        }
      }
    }

    console.log('Category fix completed:', results);

    return NextResponse.json({
      success: true,
      message: 'Categories fixed successfully',
      data: {
        fixed: fixedCount,
        total: categories.length,
        details: results
      }
    });

  } catch (error) {
    console.error('Error in comprehensive category fix:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fix categories',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 