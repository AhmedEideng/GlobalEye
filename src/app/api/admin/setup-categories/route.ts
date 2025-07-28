import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function GET() {
  try {
    console.log('Setting up categories...');

    // Check if Supabase client is available
    if (!supabase) {
      console.error('Supabase client not available');
      return NextResponse.json({ 
        error: 'Database connection not configured' 
      }, { status: 500 });
    }

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

    const { error } = await supabase.from('categories').upsert(categories, { onConflict: 'slug' });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ 
        error: `Database error: ${error.message}` 
      }, { status: 500 });
    }

    console.log('Categories set up successfully');
    return NextResponse.json({ message: 'Categories set up successfully' });
  } catch (error) {
    console.error('Error setting up categories:', error);
    return NextResponse.json({ 
      error: 'Failed to set up categories' 
    }, { status: 500 });
  }
}
