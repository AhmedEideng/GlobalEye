import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_KEY || '';

// Check environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables not defined, using fallback values');
}

// Create Supabase client only if environment variables are available
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export interface Category {
  id: string
  name: string
}

export async function getCategoriesFromSupabase(): Promise<Category[]> {
  try {
    console.log('Starting to fetch categories from Supabase...');
    
    // Check if Supabase client is available
    if (!supabase) {
      console.warn('Supabase client not available - environment variables missing');
      throw new Error('Supabase configuration not available');
    }
    
    console.log('URL:', supabaseUrl);
    
    const { data, error } = await supabase.from('categories').select('*')

    if (error) {
      console.error('Error fetching categories from Supabase:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
      console.warn('No data received from Supabase');
      return [];
    }

    console.log('Categories fetched successfully:', data);

    // Return all categories without filtering
    const categories = data
      .map((cat: any) => ({
        id: cat.id.toString(),
        name: cat.name,
        description: cat.description,
        slug: cat.slug,
        created_at: cat.created_at,
        updated_at: cat.updated_at
      }))
      // Sort by date (newest first)
      .sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

    console.log('Processed categories:', categories);
    return categories.map(cat => ({
      id: cat.id,
      name: cat.name
    }));
  } catch (error) {
    console.error('General error fetching categories:', error);
    throw error;
  }
}
