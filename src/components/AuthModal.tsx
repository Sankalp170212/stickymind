"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Sparkles, KeyRound, Mail, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = isSignUp ? "/api/auth/signup" : "/api/auth/login";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      login(data.token, data.user);
      if (onClose) onClose();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail("demo@stickymind.io");
    setPassword("password123");
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl transition-all">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-400 p-6 text-slate-950">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/30 backdrop-blur-md shadow-sm font-black text-xl">
              📝
            </span>
            <h2 className="text-2xl font-black tracking-tight">StickyMind</h2>
          </div>
          <p className="text-sm font-medium text-slate-900/80">
            Spatial AI Canvas for your thoughts, tasks, and ideas.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setError(null);
            }}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              !isSignUp
                ? "border-b-2 border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-900"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setError(null);
            }}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              isSignUp
                ? "border-b-2 border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-900"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
              />
            </div>
            {isSignUp && (
              <p className="text-xs text-slate-500 mt-1">Must be at least 6 characters</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 shadow-md shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>{isSignUp ? "Sign Up & Open Canvas" : "Log In & Continue"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Quick Demo Pre-fill */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleFillDemo}
              className="w-full py-2 px-3 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Fill demo test credentials</span>
            </button>
          </div>
        </form>

        <div className="bg-slate-50 dark:bg-slate-950/60 px-6 py-3 border-t border-slate-100 dark:border-slate-800/60 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            JWT Auth · Private per-user canvas · PostgreSQL
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
