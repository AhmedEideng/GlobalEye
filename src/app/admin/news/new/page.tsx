"use client";
import { useAuth } from '@hooks/useAuth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';

export default function AdminAddNewsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    image_url: '',
    content: '',
    author: '',
    published_at: '',
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; key: number; error?: boolean } | null>(null);

  useEffect(() => {
    if (!loading && user && !user.is_admin) {
      router.replace('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('id, name');
      setCategories(data || []);
    };
    if (user && user.is_admin) fetchCategories();
  }, [user]);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-lg">Loading...</div>;
  if (!user || !user.is_admin) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('news').insert([
        {
          title: form.title,
          category: form.category,
          description: form.description,
          image_url: form.image_url,
          content: form.content,
          author: form.author,
          published_at: form.published_at || new Date().toISOString(),
        },
      ]);
      if (error) throw error;
      setToast({ msg: 'News added successfully!', key: Date.now() });
      setTimeout(() => router.push('/admin/news'), 1200);
    } catch (err: unknown) {
      setToast({ msg: (err as Error).message || 'Failed to add news', key: Date.now(), error: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto mt-10 p-4">
      {toast && (
        <div key={toast.key} className={`fixed bottom-6 right-6 px-4 py-2 rounded shadow-lg z-50 animate-fade-in ${toast.error ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>{toast.msg}</div>
      )}
      <h1 className="text-2xl font-bold mb-8 text-gray-900">Add News</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl shadow p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input name="title" value={form.title} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select name="category" value={form.category} onChange={handleChange} required className="w-full border rounded px-3 py-2">
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={2} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
          <input name="image_url" value={form.image_url} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
          <textarea name="content" value={form.content} onChange={handleChange} rows={6} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
            <input name="author" value={form.author} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Published Date</label>
            <input name="published_at" type="datetime-local" value={form.published_at} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded transition disabled:opacity-60">{saving ? 'Saving...' : 'Add News'}</button>
        </div>
      </form>
    </main>
  );
} 