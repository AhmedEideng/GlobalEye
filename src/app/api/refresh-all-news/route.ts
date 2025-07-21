// src/app/api/refresh-all-news/route.ts
import { NextResponse } from 'next/server'
import { fetchExternalNews } from '@/app/utils/fetchExternalNews'
import { saveNewsToSupabase } from '@/app/utils/saveNewsToSupabase'
import { getAllCategories, getOrAddCategoryId } from '@/app/utils/categoryHelpers'
import { createClient } from '@/utils/supabase/server'

export const revalidate = 0

export async function GET() {
  try {
    const supabase = createClient()
    const { data: categories, error } = await getAllCategories(supabase)

    if (error) {
      console.error('Error fetching categories:', error)
      return NextResponse.json({ error: 'Error fetching categories' }, { status: 500 })
    }

    for (const category of categories) {
      const externalNews = await fetchExternalNews(category.name)

      for (const news of externalNews) {
        const categoryId = await getOrAddCategoryId(supabase, category.name)
        await saveNewsToSupabase(supabase, news, categoryId)
      }
    }

    return NextResponse.json({ message: 'News refreshed successfully' })
  } catch (err: any) {
    console.error('Unexpected error:', err)
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 })
  }
}
