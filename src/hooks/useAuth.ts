"use client";
import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured, safeSupabaseOperation } from '@utils/supabaseClient';

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
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setTimeoutReached(true), 5000);
    return () => clearTimeout(t);
  }, [setTimeoutReached]);

  useEffect(() => {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      setConfigError('Supabase not configured - check environment variables');
      setLoading(false);
      return;
    }

    // Get current user on load
    const getUser = async () => {
      setLoading(true);
      setConfigError(null);
      
      try {
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
          } catch (error) {
            console.warn('Error fetching user admin status:', error);
            // Continue without admin status
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
      } catch (error) {
        console.error('Error getting user:', error);
        setUser(null);
        setConfigError('Failed to get user authentication status');
      } finally {
        setLoading(false);
      }
    };

    getUser();

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
    if (!isSupabaseConfigured()) {
      setConfigError('Supabase not configured - cannot sign in');
      return;
    }

    setLoading(true);
    setConfigError(null);
    
    try {
      const options: { redirectTo?: string } = {};
      if (typeof window !== 'undefined') {
        options.redirectTo = window.location.origin + '/profile';
      }
      
      await supabase.auth.signInWithOAuth({ 
        provider: 'google',
        options
      });
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setConfigError('Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const signOut = async () => {
    if (!isSupabaseConfigured()) {
      setConfigError('Supabase not configured - cannot sign out');
      return;
    }

    setLoading(true);
    setConfigError(null);
    
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      setConfigError('Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  return { 
    user, 
    loading, 
    timeout, 
    configError,
    signInWithGoogle, 
    signOut,
    isConfigured: isSupabaseConfigured()
  };
} 