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

// قائمة إيميلات المشرفين المسموح لهم
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

      // عدد المقالات المدمجة
      const articlesCount = data.length;
      
      // عدد المصادر المستخدمة
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
      
      // عدد الفقرات المكررة المحذوفة
      let totalParagraphs = 0;
      let totalUniqueParagraphs = 0;
      const categoryCounts: Record<string, number> = {};
      
      data.forEach((article: NewsArticle) => {
        const content = article.content || '';
        const match = content.match(/المصادر:/);
        const mainContent = match ? content.slice(0, match.index || 0) : content;
        const paragraphs = mainContent.split(/\n+/).map((p: string) => p.trim()).filter(Boolean);
        totalUniqueParagraphs += paragraphs.length;
        // نفترض أن كل مقال مدمج كان يحتوي على 2.5 مصدر في المتوسط
        totalParagraphs += Math.round(paragraphs.length * 2.5);
        
        // حساب التصنيفات
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
    return <div className="max-w-2xl mx-auto py-10 px-4">جاري التحقق من الصلاحيات...</div>;
  }

  if (!isAuthorized) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4 text-center">
        <Head>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="text-red-600 font-bold mb-4">غير مصرح لك بالوصول لهذه الصفحة.</div>
        {!user && (
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors" 
            onClick={signInWithGoogle}
          >
            تسجيل الدخول كمشرف
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
      <h1 className="text-3xl font-bold mb-6">إحصائيات جودة الدمج</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>خطأ:</strong> {error}
          <button 
            onClick={fetchStats}
            className="ml-4 text-red-800 underline hover:no-underline"
          >
            إعادة المحاولة
          </button>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-8">جاري التحميل...</div>
      ) : !stats ? (
        <div className="text-center py-8">لا توجد بيانات.</div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-lg font-semibold mb-2">عدد المقالات المدمجة: <span className="text-blue-600">{stats.articlesCount}</span></div>
            <div className="text-lg font-semibold mb-2">عدد المصادر المستخدمة: <span className="text-green-600">{stats.sourcesCount}</span></div>
            <div className="text-lg font-semibold mb-2">عدد الفقرات المكررة التي تم حذفها (تقديري): <span className="text-orange-600">{stats.removedParagraphs}</span></div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-3">أكثر التصنيفات تكرارًا:</h3>
            <ul className="list-disc pl-6 space-y-1">
              {stats.topCategories.map(renderCategory)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
} 