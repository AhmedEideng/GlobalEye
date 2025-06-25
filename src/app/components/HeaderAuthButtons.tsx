"use client";
import { supabase } from "../utils/supabaseClient";

export default function HeaderAuthButtons() {
  async function handleGoogleSignIn() {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  }
  return (
    <div style={{ display: 'flex', gap: '16px', marginLeft: 'auto' }}>
      <button
        className="btn btn-primary"
        style={{ minWidth: 110 }}
        onClick={handleGoogleSignIn}
      >
        SUBSCRIBE
      </button>
      <button
        className="btn btn-secondary"
        style={{ minWidth: 110 }}
        onClick={handleGoogleSignIn}
      >
        SIGN IN
      </button>
    </div>
  );
} 