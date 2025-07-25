"use client";
import { useAuth } from '@hooks/useAuth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';

export default function AdminAddCategoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', slug: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; key: number; error?: boolean } | null>(null);

  useEffect(() => {
    if (!loading && user && !user.is_admin) {
      router.replace('/');
    }
  }, [user, loading, router]);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-lg">Loading...</div>;
  if (!user || !user.is_admin) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('categories').insert([
        { name: form.name, slug: form.slug },
      ]);
      if (error) throw error;
      setToast({ msg: 'Category added successfully!', key: Date.now() });
      setTimeout(() => router.push('/admin/categories'), 1200);
    } catch (err: unknown) {
      setToast({ msg: (err as Error).message || 'Failed to add category', key: Date.now(), error: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="max-w-md mx-auto mt-10 p-4">
      {toast && (
        <div key={toast.key} className={`fixed bottom-6 right-6 px-4 py-2 rounded shadow-lg z-50 animate-fade-in ${toast.error ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>{toast.msg}</div>
      )}
      <h1 className="text-2xl font-bold mb-8 text-gray-900">Add Category</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl shadow p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input name="name" value={form.name} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <input name="slug" value={form.slug} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded transition disabled:opacity-60">{saving ? 'Saving...' : 'Add Category'}</button>
        </div>
      </form>
    </main>
  );
} 