"use client";
import { useAuth } from '@hooks/useAuth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import Link from 'next/link';
import { supabase } from '@/utils/supabaseClient';

export interface News {
  id: number;
  title?: string | null;
  description?: string | null;
  content?: string | null;
  url: string;
  image_url?: string | null;
  published_at?: string | null;
  slug?: string | null;
  author?: string | null;
  source_name?: string | null;
  category_id?: number | null;
  is_featured?: boolean | null;
  views_count?: number | null;
  created_at?: string | null;
  categories?: { name: string };
}

export default function AdminNewsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [news, setNews] = useState<News[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [toast, setToast] = useState<{ msg: string; key: number; error?: boolean } | null>(null);

  useEffect(() => {
    if (!loading && user && !user.is_admin) {
      router.replace('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchAllNews = async () => {
      setLoadingNews(true);
      const { data: articles, error } = await supabase
        .from('news')
        .select('*, categories(name)')
        .order('published_at', { ascending: false });
      
      if (error) {
        setNews([]);
      } else {
        setNews(articles || []);
      }
      setLoadingNews(false);
    };
    if (user && user.is_admin) fetchAllNews();
  }, [user]);

  const handleDelete = async (slug: string) => {
    if (!window.confirm('Are you sure you want to delete this news article?')) return;
    try {
      const { error } = await supabase.from('news').delete().eq('slug', slug);
      if (error) throw error;
      setNews((prev) => prev.filter((a) => a.slug !== slug));
      setToast({ msg: 'News deleted successfully!', key: Date.now() });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setToast({ msg: err.message || 'Failed to delete news', key: Date.now(), error: true });
      } else {
        setToast({ msg: 'Failed to delete news', key: Date.now(), error: true });
      }
    }
  };

  if (loading || loadingNews) {
    return <div className="min-h-[60vh] flex items-center justify-center text-lg">Loading news...</div>;
  }
  if (!user || !user.is_admin) {
    return null;
  }

  return (
    <main className="max-w-6xl mx-auto mt-10 p-4">
      {toast && (
        <div key={toast.key} className={`fixed bottom-6 right-6 px-4 py-2 rounded shadow-lg z-50 animate-fade-in ${toast.error ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>{toast.msg}</div>
      )}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manage News</h1>
        <Link href="/admin/news/new" className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded transition">+ Add News</Link>
      </div>
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {news.map((article) => (
              <tr key={article.slug}>
                <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{article.title}</td>
                <td className="px-4 py-3 text-gray-700">{article.categories?.name || 'N/A'}</td>
                <td className="px-4 py-3 text-gray-500">{article.published_at ? new Date(article.published_at).toLocaleDateString() : 'N/A'}</td>
                <td className="px-4 py-3 flex gap-2">
                  <Link href={`/admin/news/edit/${article.slug}`} className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold px-3 py-1 rounded transition">Edit</Link>
                  <button onClick={() => handleDelete(article.slug!)} className="bg-red-500 hover:bg-red-600 text-white font-bold px-3 py-1 rounded transition">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
} 