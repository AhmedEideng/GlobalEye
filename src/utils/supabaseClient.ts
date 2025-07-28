import { createClient } from '@supabase/supabase-js'

// Use server-side environment variables with fallback
const supabaseUrl = process.env.SUPABASE_URL || 'https://xernfvwyruihyezuwybi.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhlcm5mdnd5cnVpaHllenV3eWJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NzA3NjEsImV4cCI6MjA2NTM0Njc2MX0.ZmhaLrkfOz9RcTXx8lp_z0wJCmUznXQwNHb0TKhX4mw';

// Check environment variables (only warn if using fallback values)
if (supabaseUrl === 'https://xernfvwyruihyezuwybi.supabase.co' && supabaseAnonKey.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')) {
  console.warn('Using fallback Supabase values - consider setting environment variables');
}

// Create Supabase client only if we have valid configuration
let supabase: any = null;

if (supabaseUrl && supabaseAnonKey && 
    supabaseUrl !== 'https://placeholder.supabase.co' && 
    supabaseAnonKey !== 'placeholder-key') {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
  }
}

// Export a safe supabase instance
export { supabase };

// Mock authentication for development
class MockSupabaseAuth {
  private mockUser: any = null;

  async signInWithPassword({ email, password }: { email: string; password: string }) {
    // Simple mock authentication
    if (email && password && password.length >= 8) {
      this.mockUser = {
        id: 'mock-user-id',
        email: email,
        created_at: new Date().toISOString(),
        user_metadata: { name: email.split('@')[0] }
      };
      
      // Store in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('mock-user', JSON.stringify(this.mockUser));
      }
      
      return { data: { user: this.mockUser }, error: null };
    } else {
      return { 
        data: { user: null }, 
        error: { message: 'Email not registered or password incorrect' }
      };
    }
  }

  async signUp({ email, password }: { email: string; password: string }) {
    // Simple mock signup
    if (email && password && password.length >= 8) {
      this.mockUser = {
        id: 'mock-user-id',
        email: email,
        created_at: new Date().toISOString(),
        user_metadata: { name: email.split('@')[0] }
      };
      
      // Store in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('mock-user', JSON.stringify(this.mockUser));
      }
      
      return { data: { user: this.mockUser }, error: null };
    } else {
      return { 
        data: { user: null }, 
        error: { message: 'Password must be at least 8 characters long' }
      };
    }
  }

  async signInWithOAuth({ provider, options }: { provider: string; options?: any }) {
    // Mock Google OAuth
    if (provider === 'google') {
      // Simulate Google OAuth flow
      const mockGoogleUser = {
        id: 'google-mock-user-id',
        email: 'user@gmail.com',
        created_at: new Date().toISOString(),
        user_metadata: { 
          name: 'Google User',
          avatar_url: 'https://via.placeholder.com/150',
          provider: 'google'
        }
      };
      
      this.mockUser = mockGoogleUser;
      
      // Store in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('mock-user', JSON.stringify(this.mockUser));
        
        // Simulate redirect
        if (options?.redirectTo) {
          setTimeout(() => {
            window.location.href = options.redirectTo;
          }, 1000);
        }
      }
      
      return { data: { user: this.mockUser }, error: null };
    }
    
    return { 
      data: { user: null }, 
      error: { message: 'Authentication provider not supported' }
    };
  }

  async signOut() {
    this.mockUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mock-user');
    }
    return { error: null };
  }

  getSession() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mock-user');
      if (stored) {
        this.mockUser = JSON.parse(stored);
      }
    }
    return Promise.resolve({ 
      data: { session: this.mockUser ? { user: this.mockUser } : null }, 
      error: null 
    });
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    // Mock auth state change
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mock-user');
      if (stored) {
        const user = JSON.parse(stored);
        callback('SIGNED_IN', { user });
      }
    }
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
}

// Create mock auth instance
const mockAuth = new MockSupabaseAuth();

// Override auth methods when Supabase is not configured
if (!isSupabaseConfigured()) {
  // Use type assertion to override auth methods
  (supabase.auth as any).signInWithPassword = mockAuth.signInWithPassword.bind(mockAuth);
  (supabase.auth as any).signUp = mockAuth.signUp.bind(mockAuth);
  (supabase.auth as any).signInWithOAuth = mockAuth.signInWithOAuth.bind(mockAuth);
  (supabase.auth as any).signOut = mockAuth.signOut.bind(mockAuth);
  (supabase.auth as any).getSession = mockAuth.getSession.bind(mockAuth);
  (supabase.auth as any).onAuthStateChange = mockAuth.onAuthStateChange.bind(mockAuth);
}

// Helper function to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  // For development, allow mock authentication even without Supabase
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  return !!(supabaseUrl && supabaseAnonKey);
}

// Helper function to safely use Supabase operations
export async function safeSupabaseOperation<T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, returning fallback value');
    return fallback;
  }
  
  try {
    return await operation();
  } catch (error) {
    console.error('Supabase operation failed:', error);
    return fallback;
  }
}
