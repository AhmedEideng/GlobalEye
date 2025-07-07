"use client";

import { fetchNews, NewsArticle, sortArticlesByUserPreferences } from './utils/fetchNews';
import { getFavorites } from '../services/favorites';
import { useAuth } from '@hooks/useAuth';
import HomeFeatured from '@components/HomeFeatured';
import HomeNewsGrid from '@components/HomeNewsGrid';
import { useEffect, useState } from 'react';
import { sendAnalyticsEvent } from './utils/fetchNews';

export default function HomePage() {
  const { user, loading } = useAuth();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [featuredArticle, setFeaturedArticle] = useState<NewsArticle | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const fetchAndSort = async () => {
      setPageLoading(true);
      const allArticles = await fetchNews();
      let sortedArticles = allArticles;
      if (user) {
        const favSlugs = await getFavorites(user.id);
        sortedArticles = sortArticlesByUserPreferences(allArticles, favSlugs);
      }
      setFeaturedArticle(sortedArticles[0] || null);
      setArticles(sortedArticles.slice(0, 30));
      setPageLoading(false);
      sendAnalyticsEvent('home_view', { userId: user?.id || null });
    };
    fetchAndSort();
  }, [user]);

  if (loading || pageLoading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-lg">Loading...</div>;
  }

  return (
    <main>
      {featuredArticle && <HomeFeatured article={featuredArticle} />}
      {articles.length > 0 && <HomeNewsGrid articles={articles.slice(0, 30)} />}
    </main>
  );
} 