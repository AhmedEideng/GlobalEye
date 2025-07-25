"use client";
import { useAuth } from '@hooks/useAuth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';

export interface User {
  id: string;
  email: string;
  password_hash?: string | null;
  name?: string | null;
  avatar_url?: string | null;
  created_at?: string | null;
  is_admin?: boolean;
}

export default function AdminUsersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [toast, setToast] = useState<{ msg: string; key: number; error?: boolean } | null>(null);

  useEffect(() => {
    if (!loading && user && !user.is_admin) {
      router.replace('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      const { data } = await supabase.from('users').select('id, email, name, is_admin');
      setUsers(data || []);
      setLoadingUsers(false);
    };
    if (user && user.is_admin) fetchUsers();
  }, [user]);

  const handleToggleRole = async (id: string, is_admin: boolean) => {
    try {
      const { error } = await supabase.from('users').update({ is_admin: !is_admin }).eq('id', id);
      if (error) throw error;
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, is_admin: !is_admin } : u));
      setToast({ msg: 'Role updated successfully!', key: Date.now() });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setToast({ msg: err.message || 'Failed to update role', key: Date.now(), error: true });
      } else {
        setToast({ msg: 'Failed to update role', key: Date.now(), error: true });
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setToast({ msg: 'User deleted successfully!', key: Date.now() });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setToast({ msg: err.message || 'Failed to delete user', key: Date.now(), error: true });
      } else {
        setToast({ msg: 'Failed to delete user', key: Date.now(), error: true });
      }
    }
  };

  if (loading || loadingUsers) {
    return <div className="min-h-[60vh] flex items-center justify-center text-lg">Loading users...</div>;
  }
  if (!user || !user.is_admin) {
    return null;
  }

  return (
    <main className="max-w-3xl mx-auto mt-10 p-4">
      {toast && (
        <div key={toast.key} className={`fixed bottom-6 right-6 px-4 py-2 rounded shadow-lg z-50 animate-fade-in ${toast.error ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>{toast.msg}</div>
      )}
      <h1 className="text-2xl font-bold mb-8 text-gray-900">Manage Users</h1>
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{u.email}</td>
                <td className="px-4 py-3 text-gray-700">{u.name || '-'}</td>
                <td className="px-4 py-3 text-gray-700">{u.is_admin ? 'Admin' : 'User'}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => handleToggleRole(u.id, u.is_admin || false)} className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold px-3 py-1 rounded transition">{u.is_admin ? 'Revoke Admin' : 'Make Admin'}</button>
                  <button onClick={() => handleDelete(u.id)} className="bg-red-500 hover:bg-red-600 text-white font-bold px-3 py-1 rounded transition">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
} 