"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@utils/supabaseClient";
import { useAuth } from "@hooks/useAuth";

export default function LoginPage() {
  const [step, setStep] = useState<"email" | "loginOrSignup">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Password validation function
  const validatePassword = (password: string) => {
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password);
    
    return { hasLowerCase, hasUpperCase, hasNumber, hasSpecialChar };
  };

  const passwordValidation = validatePassword(password);
  const { signOut } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signOut();
      const options: Record<string, unknown> = { skipBrowserRedirect: true };
      if (typeof window !== 'undefined') {
        options.redirectTo = window.location.origin + '/profile';
      }
      const { data } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options
      });
      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert("Google login failed. Please check your Supabase settings and API keys.");
      }
    } catch (err) {
      alert("Exception during Google login: " + err);
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStep("loginOrSignup");
  };

  const handleLoginOrSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validate password for signup
    if (mode === "signup") {
      const validation = validatePassword(password);
      if (!validation.hasLowerCase || !validation.hasUpperCase || !validation.hasNumber || !validation.hasSpecialChar) {
        setError("Password must contain:");
        setLoading(false);
        return;
      }
      // Additional check for minimum length
      if (password.length < 8) {
        setError("Password must be at least 8 characters long");
        setLoading(false);
        return;
      }
    }
    
    setLoading(true);
    if (mode === "login") {
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) {
        if (loginError.message.toLowerCase().includes("invalid login credentials")) {
          setError("Email not registered or password incorrect. You can try to create an account.");
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
          setError("Email already registered. Please log in instead.");
        } else if (signupError.message.toLowerCase().includes("password should contain")) {
          // Ignore Supabase's default password validation message
          setError("Password must contain:");
        } else {
          setError(signupError.message);
        }
        setLoading(false);
        return;
      }
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#FAFAFA] px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          {step === "email" && "Log in or create an account"}
          {step === "loginOrSignup" && (mode === "login" ? "Enter your password" : "Create your free account")}
        </h1>
        {step === "email" && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block font-semibold mb-1">Email Address</label>
              <input
                id="email"
                type="email"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded font-semibold mt-2 hover:bg-gray-900 transition"
              disabled={loading}
            >
              {loading ? "Loading..." : "Continue"}
            </button>
            
            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>
            
            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded font-medium hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </form>
        )}
        {step === "loginOrSignup" && (
          <form onSubmit={handleLoginOrSignup} className="space-y-4">
            <div>
              <label className="block font-semibold mb-1">Email Address</label>
              <input
                type="email"
                className="w-full border rounded px-3 py-2 bg-gray-100"
                value={email}
                disabled
              />
            </div>
            <div>
              <label htmlFor="password" className="block font-semibold mb-1">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400 pr-10"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoFocus
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 focus:outline-none"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.234.938-4.675M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.274.857-.67 1.664-1.175 2.4M15.54 15.54A5.978 5.978 0 0112 17c-3.314 0-6-2.686-6-6 0-.795.155-1.552.438-2.25" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            {/* Password validation messages for signup mode */}
            {mode === "signup" && password.length > 0 && (
              <div className="text-xs space-y-1 text-black">
                <div className="flex items-center gap-1">
                  {password.length >= 8 ? <span className="text-green-600">&#10003;</span> : <span className="inline-block w-4" />}
                  <span>Password should contain at least 8 characters</span>
                </div>
                <div className="flex items-center gap-1">
                  {passwordValidation.hasLowerCase ? <span className="text-green-600">&#10003;</span> : <span className="inline-block w-4" />}
                  <span>Password should contain lowercase letter</span>
                </div>
                <div className="flex items-center gap-1">
                  {passwordValidation.hasUpperCase ? <span className="text-green-600">&#10003;</span> : <span className="inline-block w-4" />}
                  <span>Password should contain uppercase letter</span>
                </div>
                <div className="flex items-center gap-1">
                  {passwordValidation.hasNumber ? <span className="text-green-600">&#10003;</span> : <span className="inline-block w-4" />}
                  <span>Password should contain number</span>
                </div>
                <div className="flex items-center gap-1">
                  {passwordValidation.hasSpecialChar ? <span className="text-green-600">&#10003;</span> : <span className="inline-block w-4" />}
                  <span>Password should contain special character</span>
                </div>
              </div>
            )}
            
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded font-semibold mt-2 hover:bg-gray-900 transition"
              disabled={loading}
            >
              {loading ? (mode === "login" ? "Logging in..." : "Creating account...") : (mode === "login" ? "Log In" : "Create Account")}
            </button>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">{mode === "login" ? "Don't have an account?" : "Already have an account?"}</span>
              <button
                type="button"
                className="text-blue-600 text-xs underline ml-2"
                onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
              >
                {mode === "login" ? "Create Account" : "Log In"}
              </button>
            </div>
            
            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>
            
            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded font-medium hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </form>
        )}
        <div className="text-xs text-gray-500 text-center mt-6">
          By continuing, you agree to the <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
        </div>
      </div>
    </div>
  );
} 