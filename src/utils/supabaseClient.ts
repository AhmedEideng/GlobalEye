import { createClient } from '@supabase/supabase-js';

const isBrowser = typeof window !== 'undefined';

const supabaseUrl = isBrowser
  ? process.env.NEXT_PUBLIC_SUPABASE_URL
  : process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseAnonKey = isBrowser
  ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  : process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase environment variables are missing");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client with service role for operations that require higher privileges
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase; 