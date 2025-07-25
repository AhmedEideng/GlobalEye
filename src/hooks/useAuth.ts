"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@utils/supabaseClient';

export type User = {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  is_admin?: boolean;
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
  }, [setTimeoutReached]);

  useEffect(() => {
    // Get current user on load
    const getUser = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        // Fetch admin status from users table
        let is_admin = false;
        try {
          const { data: userRow } = await supabase
            .from('users')
            .select('is_admin')
            .eq('id', data.user.id)
            .single();
          is_admin = !!userRow?.is_admin;
        } catch {
          // In a real application, you would log this error
          // console.error('Error fetching user admin status:', error);
        }
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || '',
          avatar_url: data.user.user_metadata?.avatar_url || '',
          is_admin,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    getUser().catch(() => {});
    // Listen to session changes
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [setLoading, setUser]);

  // Login with Google
  const signInWithGoogle = async () => {
    setLoading(true);
    const options: { redirectTo?: string } = {};
    if (typeof window !== 'undefined') {
      options.redirectTo = window.location.origin + '/profile';
    }
    await supabase.auth.signInWithOAuth({ 
      provider: 'google',
      options
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