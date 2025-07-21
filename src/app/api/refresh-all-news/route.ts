import { NextResponse } from 'next/server'
import { getOrAddCategoryId } from '@/utils/categoryUtils'
import { logSnagEvent } from '@/utils/logsnag'
import rateLimit from '@/utils/rateLimit'
import { fetchExternalNews } from '@/utils/fetchExternalNews'
import ContentQualityService from '@/utils/contentQualityService'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const now = new Date().toISOString()
  if (!rateLimit('refresh_all_news', 1)) {
    return NextResponse.json({ message: 'Rate limit exceeded' }, { status: 429 })
  }

  const supabase = createClient()
  const { data: categories, error } = await supabase.from('categories').select('*')

  if (error || !categories) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }

  const qualityService = new ContentQualityService()
  const refreshedCategories: string[] = []

  for (const category of categories) {
    const categoryId = await getOrAddCategoryId(category.name)

    // جلب الأخبار من جميع المصادر الخارجية لهذه الفئة
    const newsArticles = await fetchExternalNews(category.name)

    // فلترة المقالات ذات الجودة العالية
    const highQualityArticles = await qualityService.filter(newsArticles)

    const { error: insertError } = await supabase.from('news').insert(
      highQualityArticles.map((article) => ({
        ...article,
        category_id: categoryId,
      }))
    )

    if (!insertError) {
      refreshedCategories.push(category.name)
    } else {
      console.error(`Error inserting news for ${category.name}:`, insertError)
    }
  }

  logSnagEvent('news_refreshed', {
    timestamp: now,
    categories: refreshedCategories,
  })

  return NextResponse.json({ message: 'News refreshed', categories: refreshedCategories })
}
