"use client";
import { useAuth } from '@hooks/useAuth';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
      
      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link 
            href="/admin/news" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-center"
          >
            Manage Articles
          </Link>
          <Link 
            href="/admin/categories" 
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-center"
          >
            Manage Categories
          </Link>
          <Link 
            href="/admin/fix-images" 
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-center"
          >
            Fix Missing Images
          </Link>
          <Link 
            href="/admin/users" 
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-center"
          >
            Manage Users
          </Link>
          <Link 
            href="/admin/stats" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-center"
          >
            View Statistics
          </Link>
        </div>
      </div>
      
      <div className="text-gray-500 text-sm">Welcome, admin! Use the quick actions above or the sidebar to manage articles, categories, users, and view site statistics.</div>
    </main>
  );
} 