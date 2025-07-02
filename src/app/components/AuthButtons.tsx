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
        <>
          <span className="text-sm text-muted-foreground">{user.email}</span>
          <button
            className="btn btn-secondary"
            style={{ minWidth: 110 }}
            onClick={handleSignOut}
            disabled={isLoading}
          >
            {isLoading ? 'Signing out...' : 'Sign out'}
          </button>
        </>
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