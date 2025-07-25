"use client";
import { useAuth } from '@hooks/useAuth';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { getArticleBySlug } from '@/utils/fetchNews';

export default function AdminEditNewsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? params.slug : Array.isArray(params?.slug) ? params.slug[0] : '';
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
  const [loadingForm, setLoadingForm] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; key: number; error?: boolean } | null>(null);

  useEffect(() => {
    if (!loading && user && !user.is_admin) {
      router.replace('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingForm(true);
      const [{ data: cats }, article] = await Promise.all([
        supabase.from('categories').select('id, name'),
        getArticleBySlug(slug),
      ]);
      setCategories(cats || []);
      if (article) {
        setForm({
          title: article.title || '',
          category: article.category || '',
          description: article.description || '',
          image_url: article.image_url || '',
          content: article.content || '',
          author: article.author || '',
          published_at: article.published_at ? article.published_at.slice(0, 16) : '',
        });
      }
      setLoadingForm(false);
    };
    if (user && user.is_admin && slug) fetchData();
  }, [user, slug]);

  if (loading || loadingForm) return <div className="min-h-[60vh] flex items-center justify-center text-lg">Loading...</div>;
  if (!user || !user.is_admin) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('news').update({
        title: form.title,
        category: form.category,
        description: form.description,
        image_url: form.image_url,
        content: form.content,
        author: form.author,
        published_at: form.published_at || new Date().toISOString(),
      }).eq('slug', slug);
      if (error) throw error;
      setToast({ msg: 'News updated successfully!', key: Date.now() });
      setTimeout(() => router.push('/admin/news'), 1200);
    } catch (err: unknown) {
      setToast({ msg: (err as Error).message || 'Failed to update news', key: Date.now(), error: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto mt-10 p-4">
      {toast && (
        <div key={toast.key} className={`fixed bottom-6 right-6 px-4 py-2 rounded shadow-lg z-50 animate-fade-in ${toast.error ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>{toast.msg}</div>
      )}
      <h1 className="text-2xl font-bold mb-8 text-gray-900">Edit News</h1>
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
          <button type="submit" disabled={saving} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-6 py-2 rounded transition disabled:opacity-60">{saving ? 'Saving...' : 'Update News'}</button>
        </div>
      </form>
    </main>
  );
} 