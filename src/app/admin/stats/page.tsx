"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@utils/supabaseClient';
import { NewsArticle } from '@utils/fetchNews';
import Head from 'next/head';
import { useAuth } from '@hooks/useAuth';

export default function AdminStatsPage() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  interface Stats {
    articlesCount: number;
    sourcesCount: number;
    removedParagraphs: number;
    topCategories: [string, number][];
  }
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  // قائمة إيميلات المشرفين المسموح لهم
  const ADMINS = ['nadianow120@gmail.com', 'ahmed3id333@gmail.com']; // عدل القائمة حسب الحاجة

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    setLoading(true);
    const { data } = await supabase
      .from('news')
      .select('*')
      .eq('published', true);
    if (!data) {
      setStats(null);
      setLoading(false);
      return;
    }
    // عدد المقالات المدمجة
    const articlesCount = data.length;
    // عدد المصادر المستخدمة
    const sourcesSet = new Set<string>();
    data.forEach((a: NewsArticle) => {
      // دعم كلا الحالتين: source.name أو source_name
      let names: string[] = [];
      if (a.source && typeof a.source === 'object' && a.source.name) {
        names = a.source.name.split(' + ');
      } else if ((a as any).source_name) {
        names = (a as any).source_name.split(' + ');
      }
      names.forEach((s: string) => s && sourcesSet.add(s.trim()));
    });
    const sourcesCount = sourcesSet.size;
    // عدد الفقرات المكررة المحذوفة (تقدير: الفرق بين عدد الفقرات الأصلية والمحتوى النهائي)
    let totalParagraphs = 0;
    let totalUniqueParagraphs = 0;
    data.forEach((a: NewsArticle) => {
      const content = a.content || '';
      const match = content.match(/المصادر:/);
      const mainContent = match ? content.slice(0, match.index) : content;
      const paragraphs = mainContent.split(/\n+/).map((p: string) => p.trim()).filter(Boolean);
      totalUniqueParagraphs += paragraphs.length;
      // نفترض أن كل مقال مدمج كان يحتوي على 2.5 مصدر في المتوسط
      totalParagraphs += Math.round(paragraphs.length * 2.5);
    });
    const removedParagraphs = totalParagraphs - totalUniqueParagraphs;
    // أكثر التصنيفات تكرارًا
    const categoryCounts: Record<string, number> = {};
    data.forEach((a: NewsArticle) => {
      categoryCounts[a.category] = (categoryCounts[a.category] || 0) + 1;
    });
    const topCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
    setStats({ articlesCount, sourcesCount, removedParagraphs, topCategories });
    setLoading(false);
  }

  if (authLoading) {
    return <div className="max-w-2xl mx-auto py-10 px-4">جاري التحقق من الصلاحيات...</div>;
  }
  if (!user || !ADMINS.includes(user.email)) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4 text-center">
        <Head>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="text-red-600 font-bold mb-4">غير مصرح لك بالوصول لهذه الصفحة.</div>
        {!user && <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={signInWithGoogle}>تسجيل الدخول كمشرف</button>}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <h1 className="text-3xl font-bold mb-6">إحصائيات جودة الدمج</h1>
      {loading ? (
        <div>جاري التحميل...</div>
      ) : !stats ? (
        <div>لا توجد بيانات.</div>
      ) : (
        <div className="space-y-4">
          <div>عدد المقالات المدمجة: <span className="font-bold">{stats.articlesCount}</span></div>
          <div>عدد المصادر المستخدمة: <span className="font-bold">{stats.sourcesCount}</span></div>
          <div>عدد الفقرات المكررة التي تم حذفها (تقديري): <span className="font-bold">{stats.removedParagraphs}</span></div>
          <div>
            أكثر التصنيفات تكرارًا:
            <ul className="list-disc pl-6">
              {stats.topCategories.map(([cat, count]) => (
                <li key={cat}>{cat}: {count}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
} 