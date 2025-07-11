"use client";
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@utils/supabaseClient';
import { NewsArticle } from '@utils/fetchNews';

export default function AdminReviewPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [editing, setEditing] = useState<Record<string, Partial<NewsArticle>>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [alert, setAlert] = useState<string | null>(null);
  const alertTimeout = useRef<NodeJS.Timeout | null>(null);

  // قائمة التصنيفات
  const categories = [
    'business', 'technology', 'sports', 'entertainment', 'health', 'science', 'politics', 'world', 'general'
  ];

  useEffect(() => {
    fetchUnpublished();
  }, []);

  async function fetchUnpublished() {
    setLoading(true);
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('published', false)
      .order('published_at', { ascending: false });
    setArticles(data || []);
    setLoading(false);
    // إشعار إذا وُجد مقال جديد مهم أو عاجل
    if (data && data.some(a => ['breaking', 'politics', 'world'].includes(a.category))) {
      setAlert('تم إضافة خبر جديد مهم أو عاجل!');
      if (alertTimeout.current) clearTimeout(alertTimeout.current);
      alertTimeout.current = setTimeout(() => setAlert(null), 7000);
    }
  }

  function handleEdit(slug: string, field: keyof NewsArticle, value: string) {
    setEditing(prev => ({
      ...prev,
      [slug]: { ...prev[slug], [field]: value }
    }));
  }

  async function saveEdits(slug: string) {
    setSaving(slug);
    const changes = editing[slug];
    if (changes) {
      await supabase.from('news').update(changes).eq('slug', slug);
      setEditing(prev => { const p = { ...prev }; delete p[slug]; return p; });
      await fetchUnpublished();
    }
    setSaving(null);
  }

  async function publishArticle(slug: string) {
    setPublishing(slug);
    await supabase.from('news').update({ published: true }).eq('slug', slug);
    await fetchUnpublished();
    setPublishing(null);
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {alert && (
        <div className="mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 font-bold rounded">
          {alert}
        </div>
      )}
      <h1 className="text-3xl font-bold mb-6">مراجعة المقالات قبل النشر</h1>
      {loading ? (
        <div>جاري التحميل...</div>
      ) : articles.length === 0 ? (
        <div>لا توجد مقالات بحاجة للمراجعة.</div>
      ) : (
        <div className="space-y-8">
          {articles.map(article => {
            const edit = editing[article.slug] || {};
            return (
              <div key={article.slug} className="border rounded-lg p-4 bg-white shadow">
                <label className="block mb-2 font-bold">العنوان:
                  <input
                    className="block w-full border rounded px-2 py-1 mt-1"
                    value={edit.title ?? article.title}
                    onChange={e => handleEdit(article.slug, 'title', e.target.value)}
                  />
                </label>
                <label className="block mb-2 font-bold">الوصف:
                  <textarea
                    className="block w-full border rounded px-2 py-1 mt-1"
                    value={edit.description ?? article.description ?? ''}
                    onChange={e => handleEdit(article.slug, 'description', e.target.value)}
                    rows={2}
                  />
                </label>
                <label className="block mb-2 font-bold">التصنيف:
                  <select
                    className="block w-full border rounded px-2 py-1 mt-1"
                    value={edit.category ?? article.category}
                    onChange={e => handleEdit(article.slug, 'category', e.target.value)}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </label>
                <div className="mb-2 text-xs text-gray-400">تاريخ: {article.publishedAt}</div>
                <details className="mb-2">
                  <summary className="cursor-pointer text-blue-600">عرض التفاصيل</summary>
                  <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto mt-2">{article.content}</pre>
                </details>
                <div className="flex gap-2 mt-2">
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    onClick={() => saveEdits(article.slug)}
                    disabled={saving === article.slug}
                  >
                    {saving === article.slug ? '...جاري الحفظ' : 'حفظ التعديلات'}
                  </button>
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                    onClick={() => publishArticle(article.slug)}
                    disabled={publishing === article.slug}
                  >
                    {publishing === article.slug ? '...جاري النشر' : 'نشر المقال'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 