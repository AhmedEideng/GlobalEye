"use client";
import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@utils/supabaseClient';
import { NewsArticle } from '@utils/fetchNews';
import Head from 'next/head';
import { useAuth } from '@hooks/useAuth';

interface Stats {
  articlesCount: number;
  sourcesCount: number;
  removedParagraphs: number;
  topCategories: [string, number][];
}

interface NewsArticleWithSourceName extends NewsArticle {
  source_name?: string;
}

// List of authorized admin emails
const ADMINS = ['nadianow120@gmail.com', 'ahmed3id333@gmail.com'];

export default function AdminStatsPage() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from('news')
        .select('*')
        .eq('published', true);

      if (supabaseError) {
        throw new Error(`Database error: ${supabaseError.message}`);
      }

      if (!data || data.length === 0) {
        setStats({
          articlesCount: 0,
          sourcesCount: 0,
          removedParagraphs: 0,
          topCategories: []
        });
        return;
      }

      // Number of merged articles
      const articlesCount = data.length;
      
      // Number of used sources
      const sourcesSet = new Set<string>();
      (data as NewsArticleWithSourceName[]).forEach((article) => {
        let names: string[] = [];
        if (article.source && typeof article.source === 'object' && 'name' in article.source) {
          names = (article.source.name || '').split(' + ');
        } else if (article.source_name) {
          names = article.source_name.split(' + ');
        }
        names.forEach((name) => name && sourcesSet.add(name.trim()));
      });
      const sourcesCount = sourcesSet.size;
      
      // Number of duplicate paragraphs removed
      let totalParagraphs = 0;
      let totalUniqueParagraphs = 0;
      const categoryCounts: Record<string, number> = {};
      
      data.forEach((article: NewsArticle) => {
        const content = article.content || '';
        const regex = /\u0627\u0644\u0645\u0635\u0627\u062f\u0631:/u;
        const match = regex.exec(content);
        const mainContent = match ? content.slice(0, match.index || 0) : content;
        const paragraphs = mainContent.split(/\n+/).map((p: string) => p.trim()).filter(Boolean);
        totalUniqueParagraphs += paragraphs.length;
        // We assume each merged article had an average of 2.5 sources
        totalParagraphs += Math.round(paragraphs.length * 2.5);
        
        // Calculate categories
        categoryCounts[article.category] = (categoryCounts[article.category] || 0) + 1;
      });
      
      const removedParagraphs = totalParagraphs - totalUniqueParagraphs;
      const topCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
      
      setStats({ articlesCount, sourcesCount, removedParagraphs, topCategories });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && ADMINS.includes(user.email)) {
      fetchStats();
    }
  }, [user, fetchStats]);

  const renderCategory = useCallback(([cat, count]: [string, number]) => (
    <li key={cat}>{cat}: {count}</li>
  ), []);

  const isAuthorized = useMemo(() => {
    return user && ADMINS.includes(user.email);
  }, [user]);

  if (authLoading) {
    return <div className="max-w-2xl mx-auto py-10 px-4">Checking permissions...</div>;
  }

  if (!isAuthorized) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4 text-center">
        <Head>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="text-red-600 font-bold mb-4">You are not authorized to access this page.</div>
        {!user && (
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors" 
            onClick={signInWithGoogle}
          >
            Sign in as Admin
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <h1 className="text-3xl font-bold mb-6">Merge Quality Statistics</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
          <button 
            onClick={fetchStats}
            className="ml-4 text-red-800 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : !stats ? (
        <div className="text-center py-8">No data available.</div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-lg font-semibold mb-2">Number of merged articles: <span className="text-blue-600">{stats.articlesCount}</span></div>
            <div className="text-lg font-semibold mb-2">Number of used sources: <span className="text-green-600">{stats.sourcesCount}</span></div>
            <div className="text-lg font-semibold mb-2">Number of duplicate paragraphs removed (estimated): <span className="text-orange-600">{stats.removedParagraphs}</span></div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-3">Most frequent categories:</h3>
            <ul className="list-disc pl-6 space-y-1">
              {stats.topCategories.map(renderCategory)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
} 