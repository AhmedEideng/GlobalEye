"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/utils/supabaseClient";

function validatePassword(password: string) {
  return {
    hasLowerCase: /[a-z]/.test(password),
    hasUpperCase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[^A-Za-z0-9]/.test(password),
  };
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      // Check if using mock authentication
      if (!isSupabaseConfigured()) {
        // Mock Google sign in
        setError("");
        setTimeout(() => {
          router.push("/");
        }, 1000);
        return;
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        setError("Failed to sign in with Google. Please try again.");
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginOrSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      setError("Authentication service is not configured. Please contact support.");
      setLoading(false);
      return;
    }

    if (mode === "signup") {
      const validation = validatePassword(password);
      if (!validation.hasLowerCase || !validation.hasUpperCase || !validation.hasNumber || !validation.hasSpecialChar) {
        setError("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
        setLoading(false);
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters long.");
        setLoading(false);
        return;
      }
    }

    try {
      if (mode === "login") {
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) {
          if (loginError.message.toLowerCase().includes("invalid login credentials")) {
            setError("Email not registered or incorrect password. You can create a new account.");
          } else {
            setError(loginError.message);
          }
          setLoading(false);
          return;
        }
        router.push("/");
      } else {
        const { error: signupError } = await supabase.auth.signUp({ email, password });
        if (signupError) {
          if (signupError.message.toLowerCase().includes("user already registered")) {
            setError("Email is already registered. Please sign in instead.");
          } else if (signupError.message.toLowerCase().includes("password should contain")) {
            setError("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
          } else {
            setError(signupError.message);
          }
          setLoading(false);
          return;
        }
        router.push("/");
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Wait for component to mount
  if (!mounted) {
    return null;
  }

  // Show info message if using mock authentication
  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm mb-4">
              🔧 Development Mode: Mock Authentication Enabled
            </div>
            <p className="text-gray-600 text-sm">
              You can sign in with any email and password (at least 8 characters)
            </p>
          </div>
          
          <h1 className="text-2xl font-bold text-center text-red-700 mb-2">
            {mode === "login" ? "Sign In" : "Create Account"}
          </h1>
          <p className="text-center text-gray-500 mb-6">Access the latest news and manage favorites</p>
          
          <form onSubmit={handleLoginOrSignup} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                placeholder="Enter password (at least 8 characters)"
              />
            </div>
            
            {error && (
              <div className="bg-red-100 text-red-700 px-4 py-2 rounded text-sm text-center">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              ) : null}
              {mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            {mode === "login" ? (
              <>
                <span className="text-gray-600">Don&apos;t have an account?</span>
                <button
                  className="ml-2 text-red-600 hover:underline font-semibold"
                  onClick={() => { setMode("signup"); setError(""); }}
                >
                  Create Account
                </button>
              </>
            ) : (
              <>
                <span className="text-gray-600">Already have an account?</span>
                <button
                  className="ml-2 text-red-600 hover:underline font-semibold"
                  onClick={() => { setMode("login"); setError(""); }}
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center text-red-700 mb-2">
          {mode === "login" ? "Sign In" : "Create Account"}
        </h1>
        <p className="text-center text-gray-500 mb-6">Access the latest news and manage favorites</p>
        
        <form onSubmit={handleLoginOrSignup} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
              placeholder="you@example.com"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
              placeholder="Enter password"
            />
          </div>
          
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded text-sm text-center">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            ) : null}
            {mode === "login" ? "Sign In" : "Create Account"}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
            disabled={loading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? "Loading..." : "Sign in with Google"}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          {mode === "login" ? (
            <>
              <span className="text-gray-600">Don&apos;t have an account?</span>
              <button
                className="ml-2 text-red-600 hover:underline font-semibold"
                onClick={() => { setMode("signup"); setError(""); }}
              >
                Create Account
              </button>
            </>
          ) : (
            <>
              <span className="text-gray-600">Already have an account?</span>
              <button
                className="ml-2 text-red-600 hover:underline font-semibold"
                onClick={() => { setMode("login"); setError(""); }}
              >
                Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 