"use client";
import { useState } from "react";
import { supabase } from "../utils/supabaseClient";

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthButtonProps {
  user?: User | null;
  onLogin?: () => void;
  onLogout?: () => void;
}

export default function AuthButton({ user, onLogin, onLogout }: AuthButtonProps) {
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Check session on mount
  useState(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        onLogin?.();
      }
    });
  });

  async function handleAuth() {
    setIsLoading(true);
    try {
      if (user) {
        await supabase.auth.signOut();
        onLogout?.();
      } else {
        await supabase.auth.signInWithOAuth({ provider: 'google' });
        onLogin?.();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Auth error';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {user ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{user.email}</span>
          <button 
            onClick={handleAuth} 
            className="text-sm bg-transparent border-none text-destructive cursor-pointer hover:text-destructive/80 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      ) : (
        <button 
          onClick={handleAuth} 
          className="text-sm bg-foreground text-background border-none rounded-lg px-4 py-1.5 cursor-pointer hover:bg-foreground/90 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      )}
      
      {show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-8 rounded-lg shadow-lg min-w-[320px] flex flex-col gap-4 relative">
            <button 
              onClick={() => setShow(false)} 
              className="self-end bg-transparent border-none text-2xl cursor-pointer hover:text-muted-foreground transition-colors"
            >
              ×
            </button>
            {error && <div className="text-destructive text-xs">{error}</div>}
          </div>
        </div>
      )}
    </>
  );
} 