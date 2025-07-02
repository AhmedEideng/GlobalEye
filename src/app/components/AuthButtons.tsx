"use client";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

interface User {
  id: string;
  email: string;
  name?: string;
}

export default function AuthButtons() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || "",
          name: data.user.user_metadata?.name || undefined,
        });
      } else {
        setUser(null);
      }
    });
    // Listen to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          name: session.user.user_metadata?.name || undefined,
        });
      } else {
        setUser(null);
      }
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  async function handleSignIn() {
    setIsLoading(true);
    setError("");
    try {
      await supabase.auth.signInWithOAuth({ provider: 'google' });
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Auth error');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSignOut() {
    setIsLoading(true);
    setError("");
    try {
      await supabase.auth.signOut();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Sign out error');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', gap: '16px', marginLeft: 'auto', alignItems: 'center' }}>
      {user ? (
        <div className="relative group">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors shadow text-gray-800 font-semibold focus:outline-none">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-red-600 text-white text-lg font-bold uppercase">
              {user.name ? user.name[0] : user.email[0]}
            </span>
            <span className="hidden md:inline text-base font-medium text-gray-800">
              {user.name ? user.name.split(' ')[0] : user.email.split('@')[0]}
            </span>
            <svg className="w-4 h-4 text-gray-500 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto transition-all z-50">
            <button
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-t-lg"
              onClick={handleSignOut}
              disabled={isLoading}
            >
              {isLoading ? 'Signing out...' : 'Sign out'}
            </button>
            <div className="border-t border-gray-200" />
            <span className="block px-4 py-2 text-xs text-gray-400">{user.email}</span>
          </div>
        </div>
      ) : (
        <>
          <button
            className="btn btn-primary"
            style={{ minWidth: 110 }}
            onClick={handleSignIn}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'SIGN IN'}
          </button>
        </>
      )}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
} 