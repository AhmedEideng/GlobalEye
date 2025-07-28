import { NewsItem } from '../types';
import { sources } from './sources';

// Interface to match NewsAPI response
interface NewsApiArticle {
  title: string | null;
  description: string | null;
  content: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string | null;
  source: { name: string };
  author: string | null;
}

// Optimize fetching news from multiple sources with fallback strategy
export async function fetchExternalNews(): Promise<NewsItem[]> {
  const allNewsItems: NewsItem[] = [];
  const failedSources: string[] = [];
  const successfulSources: string[] = [];

  console.log('Starting to fetch news from multiple sources...');

  // Fetch news from all available sources
  for (let i = 0; i < sources.length; i++) {
    const sourceFunction = sources[i];
    const sourceName = getSourceName(sourceFunction);
    
    try {
      console.log(`Fetching from ${sourceName}...`);
      
      // Attempt to fetch news from current source
      const newsFromSource = await sourceFunction('general');
      
      if (newsFromSource && newsFromSource.length > 0) {
        // Transform data to required format
        const convertedNews = newsFromSource.map((article: any) => ({
          title: article.title,
          description: article.description || '',
          content: article.content || '',
          url: article.url,
          image_url: article.urlToImage || article.image || '',
          published_at: article.publishedAt || article.published_at || new Date().toISOString(),
          source_name: article.source?.name || sourceName,
          author: article.author || null,
        })).filter((item: NewsItem) => item.url && item.title); // Filter valid items

        allNewsItems.push(...convertedNews);
        successfulSources.push(sourceName);
        console.log(`✅ Successfully fetched ${convertedNews.length} articles from ${sourceName}`);
      } else {
        failedSources.push(sourceName);
        console.log(`⚠️ No articles received from ${sourceName}`);
      }
    } catch (error) {
      failedSources.push(sourceName);
      console.error(`❌ Failed to fetch from ${sourceName}:`, error);
    }
  }

  // Remove duplicates based on URL
  const uniqueNews = removeDuplicateNews(allNewsItems);
  
  console.log(`📊 Fetch Summary:`);
  console.log(`   ✅ Successful sources: ${successfulSources.join(', ')}`);
  console.log(`   ❌ Failed sources: ${failedSources.join(', ')}`);
  console.log(`   📰 Total unique articles: ${uniqueNews.length}`);

  return uniqueNews;
}

// Helper function to extract source name
function getSourceName(sourceFunction: Function): string {
  const functionName = sourceFunction.name;
  if (functionName.includes('GEnews')) return 'GNews';
  if (functionName.includes('NewsAPI')) return 'NewsAPI';
  if (functionName.includes('Theguardian')) return 'The Guardian';
  if (functionName.includes('Mediastack')) return 'Mediastack';
  return 'Unknown Source';
}

// Remove duplicate news based on URL
function removeDuplicateNews(newsItems: NewsItem[]): NewsItem[] {
  const seenUrls = new Set<string>();
  const uniqueNews: NewsItem[] = [];

  for (const item of newsItems) {
    if (item.url && !seenUrls.has(item.url)) {
      seenUrls.add(item.url);
      uniqueNews.push(item);
    }
  }

  return uniqueNews;
}

// Fallback function to fetch news from a single source (for compatibility with old code)
export async function fetchExternalNewsFromSingleSource(): Promise<NewsItem[]> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    console.warn('NEWS_API_KEY not found, trying alternative sources...');
    return fetchExternalNews();
  }

  const url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`;

  try {
    console.log('Fetching from NewsAPI as primary source...');
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    const validNewsItems = data.articles
      .map((article: NewsApiArticle) => {
        if (!article.url) {
          return null;
        }
        return {
          title: article.title,
          description: article.description,
          content: article.content,
          url: article.url,
          image_url: article.urlToImage,
          published_at: article.publishedAt,
          source_name: article.source.name,
          author: article.author,
        };
      })
      .filter(Boolean);

    console.log(`✅ Successfully fetched ${validNewsItems.length} articles from NewsAPI`);
    return validNewsItems;
  } catch (error) {
    console.error('❌ Failed to fetch from NewsAPI, trying alternative sources...', error);
    // If NewsAPI fails, try alternative sources
    return fetchExternalNews();
  }
}

// Function to fetch news by category from multiple sources
export async function fetchExternalNewsByCategory(category: string): Promise<NewsItem[]> {
  const allNewsItems: NewsItem[] = [];
  const failedSources: string[] = [];
  const successfulSources: string[] = [];

  console.log(`Fetching ${category} news from multiple sources...`);

  for (let i = 0; i < sources.length; i++) {
    const sourceFunction = sources[i];
    const sourceName = getSourceName(sourceFunction);
    
    try {
      console.log(`Fetching ${category} from ${sourceName}...`);
      
      const newsFromSource = await sourceFunction(category);
      
      if (newsFromSource && newsFromSource.length > 0) {
        const convertedNews = newsFromSource.map((article: any) => ({
          title: article.title,
          description: article.description || '',
          content: article.content || '',
          url: article.url,
          image_url: article.urlToImage || article.image || '',
          published_at: article.publishedAt || article.published_at || new Date().toISOString(),
          source_name: article.source?.name || sourceName,
          author: article.author || null,
        })).filter((item: NewsItem) => item.url && item.title);

        allNewsItems.push(...convertedNews);
        successfulSources.push(sourceName);
        console.log(`✅ Successfully fetched ${convertedNews.length} ${category} articles from ${sourceName}`);
      } else {
        failedSources.push(sourceName);
        console.log(`⚠️ No ${category} articles received from ${sourceName}`);
      }
    } catch (error) {
      failedSources.push(sourceName);
      console.error(`❌ Failed to fetch ${category} from ${sourceName}:`, error);
    }
  }

  const uniqueNews = removeDuplicateNews(allNewsItems);
  
  console.log(`📊 ${category} Fetch Summary:`);
  console.log(`   ✅ Successful sources: ${successfulSources.join(', ')}`);
  console.log(`   ❌ Failed sources: ${failedSources.join(', ')}`);
  console.log(`   📰 Total unique ${category} articles: ${uniqueNews.length}`);

  return uniqueNews;
}
