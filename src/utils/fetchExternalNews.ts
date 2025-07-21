import { getNewsFromGNews } from './sources/gnews'
import { getNewsFromNewsAPI } from './sources/newsapi'
import { getNewsFromGuardian } from './sources/guardian'
import { getNewsFromMediastack } from './sources/mediastack'

import type { NewsItem } from './types'

export async function fetchExternalNews(category: string): Promise<NewsItem[]> {
  try {
    const [gnews, newsapi, guardian, mediastack] = await Promise.all([
      getNewsFromGNews(category),
      getNewsFromNewsAPI(category),
      getNewsFromGuardian(category),
      getNewsFromMediastack(category)
    ])

    const allNews = [...gnews, ...newsapi, ...guardian, ...mediastack]

    const uniqueNews = allNews.filter((item, index, self) =>
      index === self.findIndex((t) => t.url === item.url)
    )

    return uniqueNews
  } catch {
    return []
  }
}
