"use client";
import { useAuth } from '@hooks/useAuth';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState({ articles: 0, categories: 0, users: 0, favorites: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && !user.is_admin) {
      router.replace('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      setStatsLoading(true);
      const [{ count: articles = 0 }, { count: categories = 0 }, { count: users = 0 }, { count: favorites = 0 }] = await Promise.all([
        supabase.from('news').select('id', { count: 'exact', head: true }),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('favorites').select('id', { count: 'exact', head: true }),
      ]);
      setStats({ articles, categories, users, favorites });
      setStatsLoading(false);
    };
    fetchStats();
  }, [user]);

  if (loading || statsLoading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-lg">Loading dashboard...</div>;
  }

  // Only allow admins
  if (!user || !user.is_admin) {
    return null;
  }

  return (
    <main className="max-w-5xl mx-auto mt-10 p-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <div className="text-4xl font-bold text-red-600 mb-2">{stats.articles}</div>
          <div className="text-gray-700 font-medium">Articles</div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <div className="text-4xl font-bold text-yellow-600 mb-2">{stats.categories}</div>
          <div className="text-gray-700 font-medium">Categories</div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <div className="text-4xl font-bold text-blue-600 mb-2">{stats.users}</div>
          <div className="text-gray-700 font-medium">Users</div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <div className="text-4xl font-bold text-green-600 mb-2">{stats.favorites}</div>
          <div className="text-gray-700 font-medium">Favorites</div>
        </div>
      </div>
      <div className="text-gray-500 text-sm">Welcome, admin! Use the sidebar to manage articles, categories, users, and view site statistics.</div>
    </main>
  );
} 