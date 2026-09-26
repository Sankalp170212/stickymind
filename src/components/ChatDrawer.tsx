"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Sparkles,
  Bot,
  Send,
  X,
  Copy,
  Check,
  ShieldCheck,
  HelpCircle,
  FileText,
  AlertTriangle,
} from "lucide-react";

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notesCount: number;
}

const SUGGESTIONS = [
  "✨ Summarize all my canvas notes",
  "🔍 What are the main subjects I wrote about?",
  "💡 Find connections or patterns across my ideas",
  "🏷️ Group my notes by topic or theme",
];

export function ChatDrawer({ isOpen, onClose, notesCount }: ChatDrawerProps) {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleAsk = async (queryText?: string) => {
    const textToSend = queryText || message;
    if (!textToSend.trim() || loading) return;

    setLoading(true);
    setError(null);
    if (queryText) setMessage(queryText);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify({ message: textToSend }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to query Gemini AI");
      }

      setResponse(data.response);
    } catch (err: any) {
      setError(err.message || "Failed to reach AI assistant");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!response) return;
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transition-all duration-300 ease-out animate-in slide-in-from-right">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  StickyMind AI
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Read-Only
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                <FileText className="w-3 h-3 text-amber-500" />
                <span>Reading <strong>{notesCount}</strong> active sticky note{notesCount === 1 ? "" : "s"}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close Assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security / Architecture Guarantee Banner */}
        <div className="mt-3 flex items-start gap-2 p-2.5 rounded-lg bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200 leading-snug">
          <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>Architecturally Read-Only:</strong> Gemini analyzes your notes to answer questions, but cannot mutate or delete anything on your canvas.
          </span>
        </div>
      </div>

      {/* Main Conversation & Response Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {/* Suggestion Chips */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Quick Prompts
          </label>
          <div className="flex flex-col gap-1.5">
            {SUGGESTIONS.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleAsk(suggestion)}
                className="text-left text-xs font-medium p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-700 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-300 border border-slate-200/60 dark:border-slate-700/60 transition-colors flex items-center justify-between group"
              >
                <span>{suggestion}</span>
                <Sparkles className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-amber-500 transition-opacity" />
              </button>
            ))}
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {/* AI Answer Box */}
        {loading && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 text-slate-600 dark:text-slate-300 text-xs animate-pulse">
            <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <span>StickyMind AI is reviewing your canvas notes...</span>
          </div>
        )}

        {response && !loading && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Response
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[11px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-3 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-3 [&>h1]:font-bold [&>h2]:font-bold [&>h3]:font-bold [&>h3]:text-base [&>h3]:mb-2">
              <ReactMarkdown>{response}</ReactMarkdown>
            </div>
          </div>
        )}

        {!response && !loading && (
          <div className="text-center py-6 text-slate-400 dark:text-slate-500">
            <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">
              Ask anything about your notes, like &quot;Find notes about design&quot; or &quot;What themes do you see in my ideas?&quot;
            </p>
          </div>
        )}
      </div>

      {/* Input Box Area (Single input box + Single response per spec) */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your canvas notes... (Press Enter to send)"
            rows={3}
            disabled={loading}
            className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-3 pr-12 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all disabled:opacity-50"
          />

          <button
            type="button"
            disabled={loading || !message.trim()}
            onClick={() => handleAsk()}
            className="absolute right-2.5 bottom-3.5 p-2 rounded-lg bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 shadow-md shadow-amber-500/20 disabled:opacity-40 transition-all cursor-pointer"
            aria-label="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
          <span>Powered by Gemini 1.5/2.0 Flash</span>
          <span>Shift+Enter for newline</span>
        </div>
      </div>
    </div>
  );
}

export default ChatDrawer;
