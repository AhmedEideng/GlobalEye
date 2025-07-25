"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@utils/supabaseClient";

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
  const router = useRouter();

  const handleLoginOrSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

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
          setError("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
        } else {
          setError(signupError.message);
        }
        setLoading(false);
        return;
      }
      router.push("/");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center text-red-700 mb-2">{mode === "login" ? "Sign In" : "Create Account"}</h1>
        <p className="text-center text-gray-500 mb-6">Access the latest news and manage your favorites</p>
        <form onSubmit={handleLoginOrSignup} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
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
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
              placeholder="Enter your password"
            />
          </div>
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded text-sm text-center">{error}</div>
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
                Create one
              </button>
            </>
          ) : (
            <>
              <span className="text-gray-600">Already have an account?</span>
              <button
                className="ml-2 text-red-600 hover:underline font-semibold"
                onClick={() => { setMode("login"); setError(""); }}
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 