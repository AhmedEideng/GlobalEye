"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import { getCategoriesFromSupabase } from "@/utils/getCategoriesFromSupabase";
import { fetchNews } from "@/utils/fetchNews";
import HomeNewsGrid from "@/components/HomeNewsGrid";
import { Category } from "@/utils/getCategoriesFromSupabase";
import { NewsArticle } from "@/utils/fetchNews";
import { PageLoadingSpinner } from "@/components/LoadingSpinner";

// مكون عرض الأقسام
function CategoriesSection({ categories, newsByCategory, hasNewNews, onShowNewNews }: {
  categories: Category[];
  newsByCategory: Record<string, NewsArticle[]>;
  hasNewNews: boolean;
  onShowNewNews: () => void;
}) {
  if (categories.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📰</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">GlobalEye News</h1>
          <p className="text-gray-600">جاري تحميل الأقسام...</p>
        </div>
      </div>
    );
  }

  return (
    <main>
      {hasNewNews && (
        <div className="bg-yellow-100 border-b border-yellow-300 text-yellow-900 px-4 py-2 text-center cursor-pointer sticky top-0 z-50 flex items-center justify-center gap-2 animate-fade-in">
          <span>🟡 New articles are available</span>
          <button onClick={onShowNewNews} className="bg-yellow-300 hover:bg-yellow-400 text-yellow-900 font-bold px-3 py-1 rounded transition ml-2">Refresh now</button>
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

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newsByCategory, setNewsByCategory] = useState<Record<string, NewsArticle[]>>({});
  const [loading, setLoading] = useState(true);
  const [hasNewNews, setHasNewNews] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latestSlugsRef = useRef<Record<string, string>>({});
  const pendingNewsRef = useRef<Record<string, NewsArticle[]>>({});

  // جلب الأقسام مرة واحدة
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getCategoriesFromSupabase();
      setCategories(cats);
      } catch (err) {
        console.error('Error loading categories:', err);
        setError('Failed to load categories');
      }
    };
    loadCategories();
  }, []);

  // جلب الأخبار لكل قسم وتحديثها كل دقيقة
  useEffect(() => {
    if (categories.length === 0) return;
    
    let cancelled = false;
    const fetchAllNews = async (showImmediately = false) => {
      try {
      setLoading(true);
      const newsData: Record<string, NewsArticle[]> = {};
        
      for (const cat of categories) {
          try {
        newsData[cat.name] = await fetchNews(cat.name, 10, 0);
          } catch (err) {
            console.error(`Error fetching news for category ${cat.name}:`, err);
            newsData[cat.name] = [];
          }
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
      } catch (err) {
        console.error('Error fetching news:', err);
        if (!cancelled) {
          setError('Failed to load news');
          setLoading(false);
        }
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

  // عرض رسالة الخطأ
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-bold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // عرض شاشة التحميل
  if (loading && categories.length === 0) {
    return <PageLoadingSpinner />;
  }

  return (
    <Suspense fallback={<PageLoadingSpinner />}>
      <CategoriesSection 
        categories={categories}
        newsByCategory={newsByCategory}
        hasNewNews={hasNewNews}
        onShowNewNews={handleShowNewNews}
      />
    </Suspense>
  );
} 