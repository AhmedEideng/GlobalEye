"use client";

import { useAuth } from '@hooks/useAuth';
import { redirect } from 'next/navigation';
import Image from 'next/image';

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-lg">Loading...</div>;
  }

  if (!loading && !user) {
    redirect('/login');
    return null;
  }

  return (
    <main className="max-w-lg mx-auto mt-12 bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-500 mb-4">
        <Image src={user?.avatar_url || '/placeholder-news.jpg'} alt={user?.name || user?.email || 'User'} className="w-full h-full object-cover" width={96} height={96} />
      </div>
      <h1 className="text-2xl font-bold mb-2 text-gray-900">{user?.name || 'No Name'}</h1>
      <p className="text-gray-500 mb-4">{user?.email || ''}</p>
      <button
        onClick={signOut}
        className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow transition"
      >
        Logout
      </button>
    </main>
  );
} 