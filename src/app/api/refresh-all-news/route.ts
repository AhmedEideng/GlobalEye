import { NextResponse } from 'next/server'
import { fetchExternalNews } from '@utils/fetchExternalNews'
import { saveNewsToSupabase } from '@utils/saveNewsToSupabase'
import { getCategoriesFromSupabase } from '@utils/getCategoriesFromSupabase'

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
  } catch {
    return NextResponse.json({ error: 'Failed to refresh news' }, { status: 500 })
  }
}
