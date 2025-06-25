"use client";
import { useState } from "react";
import { supabase } from "../utils/supabaseClient";

export function AuthButton() {
  const [show, setShow] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState("");

  // Check session on mount
  useState(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser(data.user);
    });
  });

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
    setShow(false);
  }

  async function handleGoogleSignIn() {
    setError("");
    try {
      await supabase.auth.signInWithOAuth({ provider: 'google' });
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    }
  }

  return (
    <>
      {user ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{user.email}</span>
          <button 
            onClick={handleSignOut} 
            className="text-sm bg-transparent border-none text-destructive cursor-pointer hover:text-destructive/80 transition-colors"
          >
            Sign out
          </button>
        </div>
      ) : (
        <button 
          onClick={() => setShow(true)} 
          className="text-sm bg-foreground text-background border-none rounded-lg px-4 py-1.5 cursor-pointer hover:bg-foreground/90 transition-colors"
        >
          Sign in
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
            <button
              onClick={handleGoogleSignIn}
              className="flex items-center justify-center gap-2 p-2 rounded-md bg-blue-600 text-white font-semibold border-none cursor-pointer hover:bg-blue-700 transition-colors"
              style={{marginBottom: '10px'}}
            >
              <svg width="20" height="20" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 33.1 30.1 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.3 6.3 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.2-4z"/><path fill="#34A853" d="M6.3 14.7l7 5.1C15.5 16.1 19.4 13 24 13c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.3 6.3 29.4 4 24 4c-7.1 0-13.1 3.7-16.7 9.3z"/><path fill="#FBBC05" d="M24 44c5.4 0 10.3-1.8 14.1-4.9l-6.5-5.3C29.7 35.7 27 36.5 24 36.5c-6.1 0-10.7-2.9-11.7-7.1l-7 5.4C7.1 40.3 14.1 44 24 44z"/><path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-1.1 3.1-4.2 5.5-7.7 5.5-4.6 0-8.3-3.7-8.3-8.3s3.7-8.3 8.3-8.3c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.3 6.3 29.4 4 24 4c-7.1 0-13.1 3.7-16.7 9.3z"/></g></svg>
              Sign in with Google
            </button>
            {error && <div className="text-destructive text-xs">{error}</div>}
          </div>
        </div>
      )}
    </>
  );
} 