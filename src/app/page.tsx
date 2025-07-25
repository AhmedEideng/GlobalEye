"use client";
import { useEffect, useState, useRef } from "react";
import { getCategoriesFromSupabase } from "@/utils/getCategoriesFromSupabase";
import { fetchNews } from "@/utils/fetchNews";
import HomeNewsGrid from "@/components/HomeNewsGrid";
import { Category } from "@/utils/getCategoriesFromSupabase";
import { NewsArticle } from "@/utils/fetchNews";

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newsByCategory, setNewsByCategory] = useState<Record<string, NewsArticle[]>>({});
  const [loading, setLoading] = useState(true);
  const [hasNewNews, setHasNewNews] = useState(false);
  const latestSlugsRef = useRef<Record<string, string>>( {} );
  const pendingNewsRef = useRef<Record<string, NewsArticle[]>>( {} );

  // جلب الأقسام مرة واحدة
  useEffect(() => {
    getCategoriesFromSupabase().then((cats) => {
      setCategories(cats);
    });
  }, []);

  // جلب الأخبار لكل قسم وتحديثها كل دقيقة
  useEffect(() => {
    if (categories.length === 0) return;
    let cancelled = false;
    const fetchAllNews = async (showImmediately = false) => {
      setLoading(true);
      const newsData: Record<string, NewsArticle[]> = {};
      for (const cat of categories) {
        newsData[cat.name] = await fetchNews(cat.name, 10, 0);
      }
      if (!cancelled) {
        // مقارنة أحدث slug لكل قسم
        let foundNew = false;
        for (const cat of categories) {
          const newFirst = newsData[cat.name]?.[0]?.slug;
          const oldFirst = latestSlugsRef.current[cat.name];
          if (newFirst && oldFirst && newFirst !== oldFirst) {
            foundNew = true;
          }
        }
        if (showImmediately || !hasNewNews) {
          setNewsByCategory(newsData);
          // حفظ أحدث slug لكل قسم
          const newSlugs: Record<string, string> = {};
          for (const cat of categories) {
            newSlugs[cat.name] = newsData[cat.name]?.[0]?.slug || "";
          }
          latestSlugsRef.current = newSlugs;
          setHasNewNews(false);
        } else if (foundNew) {
          // هناك أخبار جديدة لم تظهر بعد
          pendingNewsRef.current = newsData;
          setHasNewNews(true);
        }
        setLoading(false);
      }
    };
    fetchAllNews(true); // أول تحميل
    const interval = setInterval(() => fetchAllNews(false), 60000); // كل 60 ثانية
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [categories, hasNewNews]);

  const handleShowNewNews = () => {
    setNewsByCategory({ ...pendingNewsRef.current });
    // حفظ أحدث slug لكل قسم
    const newSlugs: Record<string, string> = {};
    for (const cat of categories) {
      newSlugs[cat.name] = pendingNewsRef.current[cat.name]?.[0]?.slug || "";
    }
    latestSlugsRef.current = newSlugs;
    setHasNewNews(false);
  };

  if (loading && categories.length === 0) {
    return <div className="text-center py-12">جاري تحميل الأقسام...</div>;
  }

  return (
    <main>
      {hasNewNews && (
        <div className="bg-yellow-100 border-b border-yellow-300 text-yellow-900 px-4 py-2 text-center cursor-pointer sticky top-0 z-50 flex items-center justify-center gap-2 animate-fade-in">
          <span>🟡 New articles are available</span>
          <button onClick={handleShowNewNews} className="bg-yellow-300 hover:bg-yellow-400 text-yellow-900 font-bold px-3 py-1 rounded transition ml-2">Refresh now</button>
        </div>
      )}
      {categories.map((cat: Category) => (
        <section key={cat.id} className="mb-12">
          <h2 className="text-2xl font-bold mb-4">{cat.name}</h2>
          <HomeNewsGrid articles={newsByCategory[cat.name] || []} />
        </section>
      ))}
    </main>
  );
} 