import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function GET() {
  try {
    console.log('Fetching all categories...');
    
    // Check if Supabase client is available
    if (!supabase) {
      console.error('Supabase client not available');
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      );
    }

    console.log('Categories fetched successfully:', data?.length || 0);

    // Basic statistics
    const stats = {
      total_categories: data?.length || 0,
      categories_with_slug: data?.filter(cat => cat.slug).length || 0,
      categories_with_description: data?.filter(cat => cat.description).length || 0,
      unique_names: new Set(data?.map(cat => cat.name.toLowerCase())).size
    };

    return NextResponse.json({
      success: true,
      categories: data || [],
      stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in categories API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 