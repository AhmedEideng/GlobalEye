// src/app/api/refresh-all-news/route.ts

import { NextResponse } from 'next/server';
import { fetchExternalNews } from '../../utils/fetchExternalNews';
import { saveNewsToSupabase } from '../../utils/saveNewsToSupabase';
import { getOrAddCategoryId } from '../../utils/categoryHelpers';
import { supabase } from '../../../utils/supabase/server';

export async function GET() {
  try {
    const { data: categories, error } = await supabase.from('categories').select('*');

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    for (const category of categories) {
      const categoryId = await getOrAddCategoryId(category.name);
      const externalNews = await fetchExternalNews(category.name);
      await saveNewsToSupabase(externalNews, categoryId);
    }

    return NextResponse.json({ message: 'All news refreshed successfully.' });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
