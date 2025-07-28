import { createClient } from '@supabase/supabase-js';
import { getOrAddCategoryId } from './categoryUtils';
import { LRUCache } from 'lru-cache';

// Remove supabase import from supabaseClient
// import { supabase } from '@utils/supabaseClient';

// Define NewsArticle type
export type NewsArticle = {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  image_url: string | null;
  published_at: string;
  content: string | null;
  slug: string;
  category: string;
  is_featured?: boolean;
  views_count?: number;
};

// Define NewsWithCategory type
interface NewsWithCategory {
  source: string;
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  image_url: string | null;
  published_at: string;
  content: string | null;
  slug: string;
  categories?: { name: string };
  source_name?: string;
  is_featured?: boolean;
  views_count?: number;
}

// Cache for news articles
const newsCache = new LRUCache<string, NewsArticle[]>({
  max: 200, // Increased cache size
  ttl: 1000 * 60 * 10, // 10 minutes cache
});

// Cache for category IDs
const categoryIdCache = new Map<string, number>();
const CATEGORY_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * Force refresh news cache for a category
 */
export async function forceRefreshNews(category = 'general') {
  // Clear cache for this category
  newsCache.delete(category);
  categoryIdCache.delete(category);
  console.log(`🗑️ Cleared cache for category: ${category}`);
  
  // Fetch fresh data
  return await fetchNews(category);
}

// Function to clear all caches
export function clearAllCaches() {
  newsCache.clear();
  categoryIdCache.clear();
  console.log('🗑️ Cleared all caches');
}

/**
 * Fetch news from database by category
 * @param category - the category (default: 'general')
 * @param limit - number of articles (default: 50)
 * @param offset - number of articles to skip (default: 0)
 * @returns Promise<NewsArticle[]>
 */
export async function fetchNews(category = 'general', limit = 50, offset = 0): Promise<NewsArticle[]> {
  // Create Supabase client inside the function
  const supabaseUrl = process.env.SUPABASE_URL || 'https://xernfvwyruihyezuwybi.supabase.co';
  const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhlcm5mdnd5cnVpaHllenV3eWJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NzA3NjEsImV4cCI6MjA2NTM0Njc2MX0.ZmhaLrkfOz9RcTXx8lp_z0wJCmUznXQwNHb0TKhX4mw';

  // Check if Supabase client is available
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase environment variables not defined, using fallback values');
    
    // Return mock data instead of throwing error
    return generateMockNews(category, limit);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Check cache (for default settings only)
  if (limit === 50 && offset === 0) {
    const cached = newsCache.get(category);
    if (cached) {
      console.log(`🎯 Cache hit for category: ${category}`);
      return cached;
    }
  }

  console.log(`🔍 Fetching news for category: ${category}`);

  // First, try to get category_id from cache
  let categoryId = categoryIdCache.get(category);
  if (!categoryId) {
    categoryId = await getOrAddCategoryId(category);
    if (categoryId) {
      categoryIdCache.set(category, categoryId);
    }
  }
  console.log(`📋 Category ID for '${category}': ${categoryId}`);

  let dbArticles: any[] = [];
  let error: any = null;

  // Strategy 1: Try to fetch by category_id (optimized query)
  if (categoryId) {
    console.log(`🔍 Strategy 1: Fetching by category_id = ${categoryId}`);
    const { data, error: categoryError } = await supabase
      .from('news')
      .select('id, title, description, content, url, image_url, published_at, slug, author, category_id, is_featured, views_count, source_name')
      .eq('category_id', categoryId)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (!categoryError && data && data.length > 0) {
      console.log(`✅ Found ${data.length} articles by category_id`);
      dbArticles = data;
    } else {
      console.log(`⚠️ No articles found by category_id: ${categoryError?.message || 'No data'}`);
    }
  }

  // Strategy 2: If no articles found by category_id, try to fetch articles by category name in content/title
  if (dbArticles.length === 0) {
    console.log(`🔍 Strategy 2: Fetching articles by category name in content/title`);
    
    // Get category keywords for better matching
    const categoryKeywords = CATEGORY_KEYWORDS[category.toLowerCase()] || [];
    if (categoryKeywords.length > 0) {
      // Create a search query using category keywords
      const searchTerms = categoryKeywords.slice(0, 5).join(' | '); // Use first 5 keywords
      console.log(`🔍 Searching for keywords: ${searchTerms}`);
      
      const { data: keywordData, error: keywordError } = await supabase
        .from('news')
        .select('id, title, description, content, url, image_url, published_at, slug, author, category_id, is_featured, views_count, source_name')
        .or(`title.ilike.%${category}%,description.ilike.%${category}%`)
        .order('published_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (!keywordError && keywordData && keywordData.length > 0) {
        console.log(`✅ Found ${keywordData.length} articles by category keywords`);
        dbArticles = keywordData;
      } else {
        console.log(`⚠️ No articles found by category keywords: ${keywordError?.message || 'No data'}`);
      }
    }
    
    // If still no articles, try general category
    if (dbArticles.length === 0 && category.toLowerCase() !== 'general') {
      console.log(`🔍 Strategy 3: Falling back to general category`);
      const { data: generalData, error: generalError } = await supabase
        .from('news')
        .select('id, title, description, content, url, image_url, published_at, slug, author, category_id, is_featured, views_count, source_name')
        .order('published_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (!generalError && generalData && generalData.length > 0) {
        console.log(`✅ Found ${generalData.length} general articles as fallback`);
        dbArticles = generalData;
      } else {
        console.log(`⚠️ No articles found in general query: ${generalError?.message || 'No data'}`);
        error = generalError;
      }
    }
  }

  if (dbArticles && dbArticles.length > 0) {
    const result = dbArticles.map((article: NewsWithCategory) => ({
      source: { id: null, name: article.source_name || 'Unknown Source' },
      author: article.author,
      title: article.title,
      description: article.description,
      url: article.url,
      image_url: article.image_url,
      published_at: article.published_at,
      content: article.content,
      slug: article.slug,
      category: article.categories?.name || category,
      is_featured: article.is_featured || false,
      views_count: article.views_count || 0,
    }) as NewsArticle);

    // Store in cache for default settings
    if (limit === 50 && offset === 0) {
      newsCache.set(category, result);
      console.log(`💾 Cached ${result.length} articles for category '${category}'`);
    }

    console.log(`🎉 Returning ${result.length} articles for category '${category}'`);
    return result;
  }

  console.log(`❌ No articles found for category '${category}'`);
  return [];
}

// List of keywords for each category - optimized
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  business: [
    'business', 'market', 'economy', 'finance', 'stock', 'trade', 'investment', 'bank', 'currency', 'banking',
    'economic', 'financial', 'commercial', 'enterprise', 'corporate', 'revenue', 'profit', 'earnings', 'shares',
    'wall street', 'dow jones', 'nasdaq', 'federal reserve', 'interest rate', 'inflation', 'gdp', 'recession',
    'stock', 'economy', 'money', 'trade', 'investment', 'bank', 'currency', 'company', 'profits', 'shares'
  ],
  technology: [
    'technology', 'tech', 'ai', 'artificial intelligence', 'software', 'hardware', 'internet', 'robot', 'gadget', 'app',
    'digital', 'computer', 'smartphone', 'mobile', 'cyber', 'cybersecurity', 'blockchain', 'crypto', 'bitcoin',
    'machine learning', 'deep learning', 'neural network', 'algorithm', 'data science', 'cloud computing',
    'startup', 'innovation', 'digital transformation', 'automation', 'virtual reality', 'augmented reality',
    'technology', 'software', 'artificial intelligence', 'internet', 'robot', 'smartphone', 'app', 'digital', 'computer'
  ],
  sports: [
    'sport', 'football', 'soccer', 'basketball', 'tennis', 'baseball', 'hockey', 'golf', 'cricket', 'rugby',
    'match', 'game', 'goal', 'score', 'league', 'championship', 'tournament', 'olympic', 'olympics', 'world cup',
    'nfl', 'nba', 'mlb', 'nhl', 'premier league', 'la liga', 'serie a', 'bundesliga', 'champions league',
    'player', 'team', 'coach', 'referee', 'stadium', 'arena', 'athlete', 'athletics', 'fitness', 'training',
    'sport', 'ball', 'match', 'goal', 'league', 'championship', 'olympics', 'player', 'team', 'coach'
  ],
  entertainment: [
    'entertainment', 'movie', 'film', 'cinema', 'music', 'celebrity', 'actor', 'actress', 'director', 'producer',
    'hollywood', 'netflix', 'disney', 'marvel', 'dc', 'star wars', 'game of thrones', 'tv show', 'television',
    'award', 'oscar', 'grammy', 'emmy', 'golden globe', 'festival', 'premiere', 'box office', 'streaming',
    'album', 'song', 'concert', 'tour', 'performance', 'theater', 'broadway', 'comedy', 'drama', 'reality tv',
    'entertainment', 'movie', 'music', 'celebrity', 'drama', 'comedy', 'series', 'party', 'festival'
  ],
  health: [
    'health', 'medical', 'medicine', 'doctor', 'physician', 'hospital', 'clinic', 'patient', 'treatment',
    'covid', 'coronavirus', 'virus', 'disease', 'illness', 'symptom', 'diagnosis', 'therapy', 'vaccine',
    'pharmaceutical', 'drug', 'medication', 'surgery', 'emergency', 'ambulance', 'nurse', 'dentist',
    'mental health', 'psychology', 'psychiatry', 'wellness', 'fitness', 'nutrition', 'diet', 'exercise',
    'health', 'medical', 'doctor', 'hospital', 'virus', 'treatment', 'medicine', 'surgery', 'vaccine', 'disease'
  ],
  science: [
    'science', 'scientific', 'research', 'study', 'discovery', 'experiment', 'laboratory', 'scientist',
    'space', 'astronomy', 'planet', 'galaxy', 'universe', 'nasa', 'spacex', 'mars', 'moon', 'satellite',
    'physics', 'chemistry', 'biology', 'genetics', 'dna', 'evolution', 'climate', 'environment', 'ecology',
    'technology', 'innovation', 'breakthrough', 'theory', 'hypothesis', 'data', 'analysis', 'publication',
    'science', 'research', 'study', 'discovery', 'space', 'astronomy', 'planet', 'physics', 'chemistry', 'biology'
  ],
  politics: [
    'politics', 'election', 'government', 'congress', 'senate', 'parliament', 'minister', 'president', 'prime minister',
    'political', 'policy', 'legislation', 'bill', 'law', 'vote', 'voting', 'campaign', 'candidate', 'party',
    'democrat', 'republican', 'liberal', 'conservative', 'democracy', 'republic', 'constitution', 'amendment',
    'foreign policy', 'domestic policy', 'budget', 'tax', 'immigration', 'healthcare', 'education', 'defense',
    'politics', 'election', 'government', 'congress', 'senate', 'parliament', 'minister', 'president', 'prime minister'
  ],

  world: [
    'world', 'international', 'global', 'foreign', 'overseas', 'abroad', 'nation', 'country', 'state',
    'united nations', 'un', 'eu', 'european union', 'nato', 'g7', 'g20', 'summit', 'conference', 'meeting',
    'war', 'conflict', 'peace', 'treaty', 'agreement', 'sanction', 'embargo', 'trade', 'diplomatic',
    'border', 'immigration', 'refugee', 'humanitarian', 'aid', 'development', 'crisis', 'emergency',
    'world', 'international', 'global', 'foreign', 'country', 'nation', 'war', 'peace', 'treaty', 'border'
  ],
  general: []
};

// Smart classification based on keywords - optimized
export function detectCategory(article: NewsArticle): string {
  const text = `${article.title} ${article.description || ''} ${article.content || ''}`.toLowerCase();
  let bestCategory = 'general';
  let maxScore = 0;
  
      // Give more weight to title
  const titleWeight = 3;
  const descriptionWeight = 2;
  const contentWeight = 1;
  
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    
    // Calculate points for title
    if (article.title) {
      const titleText = article.title.toLowerCase();
      for (const kw of keywords) {
        const regex = new RegExp(`\\b${kw.replace(/[-/\\^$*+?.()|[\]{}]/gu, '\\$&')}\\b`, 'giu');
        const matches = [...titleText.matchAll(regex)];
        score += matches.length * titleWeight;
      }
    }
    
    // Calculate points for description
    if (article.description) {
      const descText = article.description.toLowerCase();
      for (const kw of keywords) {
        const regex = new RegExp(`\\b${kw.replace(/[-/\\^$*+?.()|[\]{}]/gu, '\\$&')}\\b`, 'giu');
        const matches = [...descText.matchAll(regex)];
        score += matches.length * descriptionWeight;
      }
    }
    
    // Calculate points for content
    if (article.content) {
      const contentText = article.content.toLowerCase();
      for (const kw of keywords) {
        const regex = new RegExp(`\\b${kw.replace(/[-/\\^$*+?.()|[\]{}]/gu, '\\$&')}\\b`, 'giu');
        const matches = [...contentText.matchAll(regex)];
        score += matches.length * contentWeight;
      }
    }
    
    // Additional improvements
    if (score > 0) {
              // Give extra points for important keywords
      const importantKeywords = ['ai', 'artificial intelligence', 'covid', 'coronavirus', 'election', 'olympic', 'nba', 'nfl'];
      for (const importantKw of importantKeywords) {
        if (keywords.includes(importantKw) && text.includes(importantKw)) {
          score += 5;
        }
      }
      
              // Give extra points for Arabic words
      const arabicKeywords = keywords.filter(kw => /[\u0600-\u06FF]/.test(kw));
      for (const arabicKw of arabicKeywords) {
        if (text.includes(arabicKw)) {
          score += 3;
        }
      }
    }
    
    if (score > maxScore) {
      maxScore = score;
      bestCategory = cat;
    }
  }
  
      // If score is too low, use 'general'
  if (maxScore < 2) {
    return 'general';
  }
  
  return bestCategory;
}

/**
 * Fetch related news from the same category
 * @param currentArticle - the current article
 * @param category - the category
 * @returns Promise<NewsArticle[]>
 */
export async function fetchRelatedNews(currentArticle: NewsArticle, category = 'general'): Promise<NewsArticle[]> {
  try {
    const articles = await fetchNews(category);
    return articles.filter(article => article.slug !== currentArticle.slug).slice(0, 5);
  } catch {
    return [];
  }
}

/**
 * Fetch a single article by slug
 * @param slug - the article slug
 * @returns Promise<NewsArticle | null>
 */
export async function getArticleBySlug(slug: string): Promise<NewsArticle | null> {
  const supabaseUrl = process.env.SUPABASE_URL || 'https://xernfvwyruihyezuwybi.supabase.co';
  const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhlcm5mdnd5cnVpaHllenV3eWJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NzA3NjEsImV4cCI6MjA2NTM0Njc2MX0.ZmhaLrkfOz9RcTXx8lp_z0wJCmUznXQwNHb0TKhX4mw';

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase environment variables not defined, using fallback values');
    return null;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Try exact slug match first
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!error && data) {
    return {
      source: { id: data.source_id, name: data.source_name || 'Unknown Source' },
      author: data.author,
      title: data.title,
      description: data.description,
      url: data.url,
      image_url: data.image_url,
      published_at: data.published_at,
      content: data.content,
      slug: data.slug,
      category: data.category || 'general',
      is_featured: data.is_featured || false,
      views_count: data.views_count || 0,
    };
  }

  // Try partial slug match
  const slugWords = slug.split('-').slice(0, 3).join('-');
  const { data: partialData, error: partialError } = await supabase
    .from('news')
    .select('*')
    .ilike('slug', `%${slugWords}%`)
    .limit(5);

  if (!partialError && partialData && partialData.length > 0) {
    const article = partialData[0];
    return {
      source: { id: null, name: article.source_name || 'Unknown Source' },
      author: article.author,
      title: article.title,
      description: article.description,
      url: article.url,
      image_url: article.image_url,
      published_at: article.published_at,
      content: article.content,
      slug: article.slug,
      category: article.category || 'general',
      is_featured: article.is_featured || false,
      views_count: article.views_count || 0,
    };
  }

  // Try title search
  const titleSearch = slug.replace(/-/gu, ' ').replace(/\d+$/u, '').trim();
  const { data: titleData, error: titleError } = await supabase
    .from('news')
    .select('*')
    .ilike('title', `%${titleSearch}%`)
    .limit(5);

  if (!titleError && titleData && titleData.length > 0) {
    const article = titleData[0];
    return {
      source: { id: null, name: article.source_name || 'Unknown Source' },
      author: article.author,
      title: article.title,
      description: article.description,
      url: article.url,
      image_url: article.image_url,
      published_at: article.published_at,
      content: article.content,
      slug: article.slug,
      category: article.category || 'general',
      is_featured: article.is_featured || false,
      views_count: article.views_count || 0,
    };
  }

  return null;
}

/**
 * Sort articles based on user preferences
 */
export function sortArticlesByUserPreferences(articles: NewsArticle[], favoriteSlugs: string[]): NewsArticle[] {
  if (!favoriteSlugs || favoriteSlugs.length === 0) return articles;
  const favoriteCategories = Array.from(new Set(
    articles.filter(a => favoriteSlugs.includes(a.slug)).map(a => a.category)
  ));
  return [
    ...articles.filter(a => favoriteCategories.includes(a.category)),
    ...articles.filter(a => !favoriteCategories.includes(a.category)),
  ];
}

/**
 * Send event to Google Analytics
 */
export function sendAnalyticsEvent(eventName: string, params: Record<string, unknown> = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}

/**
 * Format date
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get image URL
 */
export function getImageUrl(url?: string | null): string {
  if (!url || url.trim() === '') {
    return '/placeholder-news.jpg';
  }
  
  const trimmedUrl = url.trim();
  
  // If the URL starts with http, use it as is
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    return trimmedUrl;
  }
  
  // If the URL starts with //, add https
  if (trimmedUrl.startsWith('//')) {
    return 'https:' + trimmedUrl;
  }
  
  // If the URL is relative, add https://
  if (!trimmedUrl.startsWith('http')) {
    return 'https://' + trimmedUrl;
  }
  
  // If none match, use the default image
  return '/placeholder-news.jpg';
}

/**
 * Calculate Jaccard similarity between two texts
 */
export function jaccardSimilarity(str1: string, str2: string): number {
  const set1 = new Set(str1.toLowerCase().split(/\s+/));
  const set2 = new Set(str2.toLowerCase().split(/\s+/));
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
}

/**
 * Generate mock news data when database is not configured
 */
function generateMockNews(category: string, limit: number): NewsArticle[] {
  const mockArticles: NewsArticle[] = [];
  const sources = ['GlobalEye News', 'World News', 'Tech Daily', 'Business Times', 'Sports Central'];
  const authors = ['John Smith', 'Sarah Johnson', 'Mike Wilson', 'Lisa Brown', 'David Lee'];
  
  const categoryTitles = {
    world: [
      'Global Economic Summit Addresses Climate Change',
      'International Peace Talks Show Progress',
      'World Leaders Meet for Trade Agreement',
      'Global Health Initiative Launched',
      'International Space Mission Announced'
    ],
    technology: [
      'New AI Breakthrough in Medical Diagnosis',
      'Revolutionary Quantum Computing Development',
      'Latest Smartphone Technology Unveiled',
      'Cybersecurity Threats on the Rise',
      'Green Technology Solutions for Cities'
    ],
    business: [
      'Major Merger Creates Industry Giant',
      'Stock Market Reaches New Heights',
      'Startup Secures Record Funding',
      'Corporate Sustainability Initiatives',
      'Global Supply Chain Innovations'
    ],
    sports: [
      'Championship Game Breaks Viewing Records',
      'Olympic Athlete Sets New World Record',
      'Team Wins Historic Victory',
      'Sports Technology Revolution',
      'Youth Sports Development Program'
    ],
    entertainment: [
      'Blockbuster Movie Breaks Box Office Records',
      'Award Show Celebrates Diversity',
      'Music Festival Draws Global Audience',
      'Streaming Service Launches New Series',
      'Celebrity Charity Event Raises Millions'
    ],
    health: [
      'Breakthrough in Cancer Treatment Research',
      'Mental Health Awareness Campaign',
      'New Vaccine Development Success',
      'Healthcare Technology Innovations',
      'Global Health Crisis Response'
    ],
    science: [
      'Revolutionary Discovery in Physics',
      'Climate Change Research Findings',
      'Space Exploration Mission Success',
      'Medical Breakthrough Announced',
      'Environmental Conservation Efforts'
    ],
    politics: [
      'Election Results Show Political Shift',
      'Policy Reform Bill Passes',
      'International Diplomatic Relations',
      'Government Transparency Initiative',
      'Public Service Announcement'
    ],
    general: [
      'Breaking News: Major Development',
      'Community Event Draws Large Crowd',
      'Local Business Expansion',
      'Education Reform Initiative',
      'Cultural Festival Celebration'
    ]
  };

  const titles = categoryTitles[category as keyof typeof categoryTitles] || categoryTitles.general;

  for (let i = 0; i < Math.min(limit, titles.length); i++) {
    const title = titles[i];
    const source = sources[Math.floor(Math.random() * sources.length)];
    const author = authors[Math.floor(Math.random() * authors.length)];
    const date = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Random date within last week
    
    mockArticles.push({
      source: { id: null, name: source },
      author: author,
      title: title,
      description: `This is a sample news article about ${category}. The content provides an overview of the latest developments in this field.`,
      url: `https://example.com/news/${category}-${i + 1}`,
      image_url: `/placeholder-news.svg`,
      published_at: date.toISOString(),
      content: `This is the full content of the news article about ${title}. It includes detailed information about the topic and provides context for readers.`,
      slug: `${category}-news-${i + 1}`,
      category: category,
      is_featured: i === 0, // First article is featured
      views_count: Math.floor(Math.random() * 10000) + 100
    });
  }

  return mockArticles;
}
