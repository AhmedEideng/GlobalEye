import { NextResponse } from 'next/server'
import { fetchExternalNews } from '@/app/utils/fetchExternalNews'
import { saveNewsToSupabase } from '@/app/utils/saveNewsToSupabase'
import { getCategoriesFromSupabase } from '@/app/utils/getCategoriesFromSupabase'

export async function GET() {
  try {
    const categories = await getCategoriesFromSupabase()

    for (const category of categories) {
      const newsItems = await fetchExternalNews(category.name)
      if (newsItems.length > 0) {
        await saveNewsToSupabase(newsItems, category.id)
      }
    }

    return NextResponse.json({ message: 'News updated successfully' })
  } catch (error: any) {
    console.error('Error refreshing news:', error)
    return NextResponse.json({ error: 'Failed to refresh news' }, { status: 500 })
  }
}
