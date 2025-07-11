"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@utils/supabaseClient';

export type User = {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
};

/**
 * useAuth hook for managing user state and login/logout with Supabase (Google OAuth)
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeout, setTimeoutReached] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setTimeoutReached(true), 5000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    // Get current user on load
    const getUser = async () => {
      setLoading(true);
      console.log('بدء جلب بيانات المستخدم');
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser({
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || '',
          avatar_url: data.user.user_metadata?.avatar_url || '',
        });
        console.log('تم جلب بيانات المستخدم:', data.user.email);
      } else {
        setUser(null);
        console.log('لم يتم العثور على مستخدم مسجل الدخول');
      }
      setLoading(false);
      console.log('انتهى جلب بيانات المستخدم');
    };
    getUser();
    // Listen to session changes
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Login with Google
  const signInWithGoogle = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({ 
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? window.location.origin + '/profile' : undefined
      }
    });
    setLoading(false);
  };

  // Logout
  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
  };

  return { user, loading, timeout, signInWithGoogle, signOut };
} 