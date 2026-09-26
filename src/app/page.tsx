"use client";

import React, { useState } from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Canvas } from "@/components/Canvas";
import { AuthModal } from "@/components/AuthModal";
import { Footer } from "@/components/Footer";
import {
  Sparkles,
  Bot,
  Move,
  Lock,
  Layers,
  Palette,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

function MainContent() {
  const { user, isLoading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  if (user) {
    return (
      <main className="flex-1 flex flex-col min-h-screen">
        <Canvas />
        <Footer />
      </main>
    );
  }

  // Guest / Landing Page
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {/* Navbar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-black text-lg shadow-md shadow-amber-500/20">
            📝
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white">StickyMind</span>
        </div>

        <div className="flex items-center gap-3">
          {isLoading ? (
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              Checking session...
            </span>
          ) : (
            <>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 px-4 py-2 rounded-xl shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                Open Canvas
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-20 max-w-6xl mx-auto flex-1 flex flex-col items-center justify-center text-center">
        {/* Glow orb background */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-gradient-to-tr from-amber-500/20 to-yellow-500/10 blur-[100px] pointer-events-none rounded-full"></div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Next-Gen Spatial Canvas + Read-Only Gemini AI</span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-3xl leading-tight">
          Sticky Notes that live in <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 bg-clip-text text-transparent">Free Space</span>, Understood by AI.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          Break out of rigid lists. Drag, color-code, and organize your thoughts on an infinite private spatial canvas. Ask our read-only Gemini AI assistant to summarize, uncover patterns, and answer questions about your notes safely.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-extrabold text-sm sm:text-base shadow-xl shadow-amber-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <span>Get Started with Canvas</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold text-sm sm:text-base transition-colors cursor-pointer"
          >
            <Bot className="w-4 h-4 text-amber-400" />
            <span>Try AI Chatbot Demo</span>
          </button>
        </div>

        {/* Interactive Sticky Notes Showcase Cards */}
        <div className="mt-14 w-full grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Card 1 */}
          <div className="p-5 rounded-2xl bg-[#FEF08A] text-slate-900 shadow-xl border border-yellow-300/40 transform -rotate-1 hover:rotate-0 transition-transform">
            <div className="flex items-center justify-between pb-2 border-b border-black/10">
              <span className="text-[10px] font-black uppercase tracking-wider bg-black/10 px-2 py-0.5 rounded-full">
                Work · Spatial
              </span>
              <Move className="w-3.5 h-3.5 opacity-60" />
            </div>
            <h4 className="font-extrabold text-sm mt-3">Free-Form Canvas</h4>
            <p className="text-xs text-slate-800 mt-1 leading-relaxed">
              Drag notes anywhere on a massive tactile board. Note positions persist exactly where you leave them.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-5 rounded-2xl bg-[#BAE6FD] text-slate-900 shadow-xl border border-sky-300/40 transform rotate-1 hover:rotate-0 transition-transform">
            <div className="flex items-center justify-between pb-2 border-b border-black/10">
              <span className="text-[10px] font-black uppercase tracking-wider bg-black/10 px-2 py-0.5 rounded-full">
                AI Intelligence
              </span>
              <Bot className="w-3.5 h-3.5 opacity-60" />
            </div>
            <h4 className="font-extrabold text-sm mt-3">Read-Only Gemini Assistant</h4>
            <p className="text-xs text-slate-800 mt-1 leading-relaxed">
              Ask questions about your notes without risk. The AI reads context but cannot mutate or delete your canvas data.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-5 rounded-2xl bg-[#BBF7D0] text-slate-900 shadow-xl border border-emerald-300/40 transform -rotate-1 hover:rotate-0 transition-transform">
            <div className="flex items-center justify-between pb-2 border-b border-black/10">
              <span className="text-[10px] font-black uppercase tracking-wider bg-black/10 px-2 py-0.5 rounded-full">
                Private &amp; Fast
              </span>
              <Lock className="w-3.5 h-3.5 opacity-60" />
            </div>
            <h4 className="font-extrabold text-sm mt-3">Private Per-User Canvas</h4>
            <p className="text-xs text-slate-800 mt-1 leading-relaxed">
              Every user has their own private board backed by PostgreSQL and secured with JWT authentication.
            </p>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-16 w-full max-w-4xl border-t border-slate-800/80 pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3">
            <Palette className="w-5 h-5 mx-auto text-amber-400 mb-2" />
            <h5 className="font-bold text-sm text-white">5 Pastel Presets</h5>
            <p className="text-xs text-slate-400 mt-0.5">Quick color swatches</p>
          </div>
          <div className="p-3">
            <Layers className="w-5 h-5 mx-auto text-yellow-400 mb-2" />
            <h5 className="font-bold text-sm text-white">Z-Index Stacking</h5>
            <p className="text-xs text-slate-400 mt-0.5">Persistent layers</p>
          </div>
          <div className="p-3">
            <ShieldCheck className="w-5 h-5 mx-auto text-emerald-400 mb-2" />
            <h5 className="font-bold text-sm text-white">Zod Validation</h5>
            <p className="text-xs text-slate-400 mt-0.5">Sanitized API routes</p>
          </div>
          <div className="p-3">
            <CheckCircle2 className="w-5 h-5 mx-auto text-sky-400 mb-2" />
            <h5 className="font-bold text-sm text-white">Render Ready</h5>
            <p className="text-xs text-slate-400 mt-0.5">Deployable in 1 click</p>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function HomePage() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
