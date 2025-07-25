"use client";
import { useAuth } from '@hooks/useAuth';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';

export default function AdminEditCategoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';
  const [form, setForm] = useState({ name: '', slug: '' });
  const [loadingForm, setLoadingForm] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; key: number; error?: boolean } | null>(null);

  useEffect(() => {
    if (!loading && user && !user.is_admin) {
      router.replace('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchCategory = async () => {
      setLoadingForm(true);
      const { data } = await supabase.from('categories').select('*').eq('id', id).single();
      if (data) {
        setForm({ name: data.name || '', slug: data.slug || '' });
      }
      setLoadingForm(false);
    };
    if (user && user.is_admin && id) fetchCategory();
  }, [user, id]);

  if (loading || loadingForm) return <div className="min-h-[60vh] flex items-center justify-center text-lg">Loading...</div>;
  if (!user || !user.is_admin) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('categories').update({
        name: form.name,
        slug: form.slug,
      }).eq('id', id);
      if (error) throw error;
      setToast({ msg: 'Category updated successfully!', key: Date.now() });
      setTimeout(() => router.push('/admin/categories'), 1200);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setToast({ msg: err.message || 'Failed to update category', key: Date.now(), error: true });
      } else {
        setToast({ msg: 'Failed to update category', key: Date.now(), error: true });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="max-w-md mx-auto mt-10 p-4">
      {toast && (
        <div key={toast.key} className={`fixed bottom-6 right-6 px-4 py-2 rounded shadow-lg z-50 animate-fade-in ${toast.error ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>{toast.msg}</div>
      )}
      <h1 className="text-2xl font-bold mb-8 text-gray-900">Edit Category</h1>
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
          <button type="submit" disabled={saving} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-6 py-2 rounded transition disabled:opacity-60">{saving ? 'Saving...' : 'Update Category'}</button>
        </div>
      </form>
    </main>
  );
} 