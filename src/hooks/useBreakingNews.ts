import { useState, useEffect, useCallback, useRef } from 'react';

export interface BreakingNewsItem {
  id: string;
  title: string;
  url: string;
  category: string;
  timestamp: string;
  priority?: 'high' | 'medium' | 'low';
}

// Cache for breaking news to avoid unnecessary API calls
let newsCache: BreakingNewsItem[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Mock API function - replace with real API call
const fetchBreakingNews = async (): Promise<BreakingNewsItem[]> => {
  // Check cache first
  const now = Date.now();
  if (newsCache && (now - lastFetchTime) < CACHE_DURATION) {
    return newsCache;
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const data: BreakingNewsItem[] = [
    {
      id: '1',
      title: 'Breaking: Major breakthrough in renewable energy technology announced',
      url: '/article/1',
      category: 'Technology',
      timestamp: '2 hours ago',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Global markets react to new economic policy changes',
      url: '/article/2',
      category: 'Business',
      timestamp: '3 hours ago',
      priority: 'high'
    },
    {
      id: '3',
      title: 'International summit addresses climate change concerns',
      url: '/article/3',
      category: 'World',
      timestamp: '4 hours ago',
      priority: 'medium'
    },
    {
      id: '4',
      title: 'New scientific discovery could revolutionize medical treatments',
      url: '/article/4',
      category: 'Science',
      timestamp: '5 hours ago',
      priority: 'medium'
    },
    {
      id: '5',
      title: 'Sports: Championship final draws record-breaking viewership',
      url: '/article/5',
      category: 'Sports',
      timestamp: '6 hours ago',
      priority: 'low'
    },
    {
      id: '6',
      title: 'Tech giant announces revolutionary AI breakthrough',
      url: '/article/6',
      category: 'Technology',
      timestamp: '1 hour ago',
      priority: 'high'
    },
    {
      id: '7',
      title: 'World leaders meet for emergency climate summit',
      url: '/article/7',
      category: 'World',
      timestamp: '30 minutes ago',
      priority: 'high'
    },
    {
      id: '8',
      title: 'Stock markets reach all-time high amid economic recovery',
      url: '/article/8',
      category: 'Business',
      timestamp: '45 minutes ago',
      priority: 'medium'
    },
    {
      id: '9',
      title: 'Space exploration mission discovers new planet',
      url: '/article/9',
      category: 'Science',
      timestamp: '15 minutes ago',
      priority: 'medium'
    },
    {
      id: '10',
      title: 'Olympic athlete breaks world record in stunning performance',
      url: '/article/10',
      category: 'Sports',
      timestamp: '20 minutes ago',
      priority: 'low'
    }
  ];

  // Update cache
  newsCache = data;
  lastFetchTime = now;
  
  return data;
};

export const useBreakingNews = () => {
  const [news, setNews] = useState<BreakingNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchBreakingNews();
      // Shuffle the news array to make it appear more dynamic
      const shuffledData = [...data].sort(() => Math.random() - 0.5);
      setNews(shuffledData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch breaking news');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshNews = useCallback(() => {
    // Clear cache to force fresh fetch
    newsCache = null;
    lastFetchTime = 0;
    fetchNews();
  }, [fetchNews]);

  useEffect(() => {
    fetchNews();
    
    // Set up interval for real-time updates (every 5 minutes instead of 2)
    intervalRef.current = setInterval(fetchNews, CACHE_DURATION);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchNews]);

  return {
    news,
    loading,
    error,
    refreshNews
  };
}; 