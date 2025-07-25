"use client";
import { useAuth } from '@hooks/useAuth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import Link from 'next/link';

export interface Category {
  id: number;
  name: string;
  description?: string | null;
  created_at?: string | null;
  slug?: string | null;
}

export default function AdminCategoriesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [toast, setToast] = useState<{ msg: string; key: number; error?: boolean } | null>(null);

  useEffect(() => {
    if (!loading && user && !user.is_admin) {
      router.replace('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCats(true);
      const { data } = await supabase.from('categories').select('*');
      setCategories(data || []);
      setLoadingCats(false);
    };
    if (user && user.is_admin) fetchCategories();
  }, [user]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setToast({ msg: 'Category deleted successfully!', key: Date.now() });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setToast({ msg: err.message || 'Failed to delete category', key: Date.now(), error: true });
      } else {
        setToast({ msg: 'Failed to delete category', key: Date.now(), error: true });
      }
    }
  };

  if (loading || loadingCats) {
    return <div className="min-h-[60vh] flex items-center justify-center text-lg">Loading categories...</div>;
  }
  if (!user || !user.is_admin) {
    return null;
  }

  return (
    <main className="max-w-3xl mx-auto mt-10 p-4">
      {toast && (
        <div key={toast.key} className={`fixed bottom-6 right-6 px-4 py-2 rounded shadow-lg z-50 animate-fade-in ${toast.error ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>{toast.msg}</div>
      )}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manage Categories</h1>
        <Link href="/admin/categories/new" className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded transition">+ Add Category</Link>
      </div>
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{cat.name}</td>
                <td className="px-4 py-3 text-gray-700">{cat.slug}</td>
                <td className="px-4 py-3 flex gap-2">
                  <Link href={`/admin/categories/edit/${cat.id}`} className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold px-3 py-1 rounded transition">Edit</Link>
                  <button onClick={() => handleDelete(cat.id)} className="bg-red-500 hover:bg-red-600 text-white font-bold px-3 py-1 rounded transition">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
} 