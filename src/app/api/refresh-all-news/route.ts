import { NextResponse } from 'next/server';
import { fetchExternalNews, fetchExternalNewsByCategory } from '@/utils/fetchExternalNews';
import { saveNewsToSupabase } from '@/utils/saveNewsToSupabase';
import { logger } from '@/utils/logger';

// Available categories list
const CATEGORIES = [
  'world', 'business', 'technology', 
  'sports', 'entertainment', 'health', 'science', 'politics', 'general'
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const category = searchParams.get('category'); // Optional - specific category
const forceRefresh = searchParams.get('force') === 'true'; // Optional - force refresh

// Token verification
  if (token !== process.env.REFRESH_TOKEN) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  try {
    logger.info('Starting news refresh process...', { category, forceRefresh });

    let totalNewsItems: any[] = [];
    let refreshResults: any = {
      totalArticles: 0,
      categoriesProcessed: 0,
      successfulSources: [],
      failedSources: [],
      errors: []
    };

    if (category) {
      // Update specific category
      logger.info(`Refreshing news for category: ${category}`);
      
      try {
        const categoryNews = await fetchExternalNewsByCategory(category);
        if (categoryNews.length > 0) {
          await saveNewsToSupabase(categoryNews);
          totalNewsItems = categoryNews;
          refreshResults.totalArticles = categoryNews.length;
          refreshResults.categoriesProcessed = 1;
          logger.info(`Successfully refreshed ${categoryNews.length} articles for ${category}`);
        } else {
          logger.warn(`No articles found for category: ${category}`);
        }
      } catch (error) {
        logger.error(`Error refreshing category ${category}:`, error);
        refreshResults.errors.push(`Failed to refresh ${category}: ${error}`);
      }
    } else {
      // Update all categories
      logger.info('Refreshing news for all categories...');
      
      for (const cat of CATEGORIES) {
        try {
          logger.info(`Processing category: ${cat}`);
          
          const categoryNews = await fetchExternalNewsByCategory(cat);
          
          if (categoryNews.length > 0) {
            await saveNewsToSupabase(categoryNews);
            totalNewsItems.push(...categoryNews);
            refreshResults.totalArticles += categoryNews.length;
            refreshResults.categoriesProcessed++;
            logger.info(`✅ Successfully processed ${categoryNews.length} articles for ${cat}`);
          } else {
            logger.warn(`⚠️ No articles found for category: ${cat}`);
          }
        } catch (error) {
          logger.error(`❌ Error processing category ${cat}:`, error);
          refreshResults.errors.push(`Failed to process ${cat}: ${error}`);
        }
      }

      // If no news was found from categories, try the general news source
      if (totalNewsItems.length === 0) {
        logger.info('No category-specific news found, trying general news...');
        
        try {
          const generalNews = await fetchExternalNews();
          if (generalNews.length > 0) {
            await saveNewsToSupabase(generalNews);
            totalNewsItems = generalNews;
            refreshResults.totalArticles = generalNews.length;
            logger.info(`✅ Successfully fetched ${generalNews.length} general articles`);
          }
        } catch (error) {
          logger.error('❌ Error fetching general news:', error);
          refreshResults.errors.push(`Failed to fetch general news: ${error}`);
        }
      }
    }

    // Remove final duplicates
    const uniqueNewsItems = removeDuplicateNews(totalNewsItems);
    const finalCount = uniqueNewsItems.length;

    logger.info('News refresh completed', {
      totalArticles: finalCount,
      categoriesProcessed: refreshResults.categoriesProcessed,
      errors: refreshResults.errors.length
    });

    return NextResponse.json({
      success: true,
      message: `News refreshed successfully: ${finalCount} unique articles`,
      details: {
        totalArticles: finalCount,
        categoriesProcessed: refreshResults.categoriesProcessed,
        errors: refreshResults.errors,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Critical error in news refresh:', error);
    return NextResponse.json({ 
      error: 'Failed to refresh news',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to remove duplicates
function removeDuplicateNews(newsItems: any[]): any[] {
  const seenUrls = new Set<string>();
  const uniqueNews: any[] = [];

  for (const item of newsItems) {
    if (item.url && !seenUrls.has(item.url)) {
      seenUrls.add(item.url);
      uniqueNews.push(item);
    }
  }

  return uniqueNews;
}
