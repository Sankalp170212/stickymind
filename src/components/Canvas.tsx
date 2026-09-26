"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Note, PRESET_NOTE_COLORS } from "@/types/note";
import { StickyNote } from "./StickyNote";
import { ChatDrawer } from "./ChatDrawer";
import { useAuth } from "@/context/AuthContext";
import {
  Plus,
  Sparkles,
  LogOut,
  Tag,
  Maximize2,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from "lucide-react";

export function Canvas() {
  const { user, token, logout } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Load notes
  const fetchNotes = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/notes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load notes");
      }
      setNotes(data.notes || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch notes");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Create new note with staggered offset
  const handleCreateNote = async () => {
    if (!token) return;

    // Calculate staggered offset based on count
    const offsetFactor = (notes.length % 8);
    const initialX = 80 + offsetFactor * 45;
    const initialY = 100 + offsetFactor * 35;
    const defaultColor = PRESET_NOTE_COLORS[notes.length % PRESET_NOTE_COLORS.length].hex;

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: "New Note",
          content: "Click to write your ideas...",
          category: selectedCategory !== "All" ? selectedCategory : "General",
          posX: initialX,
          posY: initialY,
          color: defaultColor,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create note");
      }

      setNotes((prev) => [...prev, data.note]);
    } catch (err: any) {
      alert(`Error creating note: ${err.message}`);
    }
  };

  // Immediate local update for smooth UI
  const handleUpdateNoteLocal = (id: string, updates: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates } : n))
    );

    // If color, title, category, or content was changed (not dragging), PATCH immediately
    if (
      updates.color !== undefined ||
      updates.title !== undefined ||
      updates.content !== undefined ||
      updates.category !== undefined
    ) {
      persistNoteUpdate(id, updates);
    }
  };

  // Debounced / drag-end API PATCH for position
  const persistNoteUpdate = async (id: string, updates: Partial<Note>) => {
    if (!token) return;
    try {
      await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.error("Failed to persist note update:", err);
    }
  };

  const handleDragEnd = (id: string, finalX: number, finalY: number) => {
    persistNoteUpdate(id, { posX: finalX, posY: finalY });
  };

  // Delete note
  const handleDeleteNote = async (id: string) => {
    if (!token) return;
    try {
      // Optimistic removal
      setNotes((prev) => prev.filter((n) => n.id !== id));
      await fetch(`/api/notes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Failed to delete note:", err);
      fetchNotes();
    }
  };

  // Distinct categories available in current notes
  const availableCategories = [
    "All",
    ...Array.from(
      new Set(
        notes
          .map((n) => n.category)
          .filter((cat): cat is string => Boolean(cat && cat.trim() !== ""))
      )
    ),
  ];

  // Filter notes based on category & search query
  const filteredNotes = notes.filter((n) => {
    const matchesCategory =
      selectedCategory === "All" || n.category?.toLowerCase() === selectedCategory.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      (n.title && n.title.toLowerCase().includes(query)) ||
      n.content.toLowerCase().includes(query) ||
      (n.category && n.category.toLowerCase().includes(query));
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="relative w-full h-[calc(100vh-49px)] overflow-hidden flex flex-col bg-slate-100 dark:bg-slate-950">
      {/* Top Navbar / Canvas Controls */}
      <header className="z-30 h-16 w-full px-4 sm:px-6 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md select-none shrink-0 shadow-xs">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-black shadow-md shadow-amber-500/20 text-lg">
            📝
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight">
                StickyMind
              </h1>
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-100/80 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                Spatial Canvas
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px] sm:max-w-xs">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="hidden md:flex items-center gap-2">
          <div className="relative w-48 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter notes..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-sm py-1">
            {availableCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? "bg-amber-500 text-slate-950 shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons: New Note, AI Drawer, Logout */}
        <div className="flex items-center gap-2">
          {/* New Note Button */}
          <button
            type="button"
            onClick={handleCreateNote}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 shadow-sm shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Note</span>
          </button>

          {/* AI Chatbot Launcher (Unique Identifier) */}
          <button
            type="button"
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
              isChatOpen
                ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20"
                : "bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700/60 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400 animate-pulse" />
            <span className="hidden sm:inline">Ask AI</span>
            <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-black rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900">
              {notes.length}
            </span>
          </button>

          {/* Logout */}
          <button
            type="button"
            onClick={logout}
            title="Log Out"
            className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Draggable Freeform Canvas */}
      <div
        ref={canvasContainerRef}
        className="relative flex-1 overflow-auto cursor-default touch-none"
        style={{
          backgroundImage: `radial-gradient(circle, #cbd5e1 1.2px, transparent 1.2px)`,
          backgroundSize: "28px 28px",
        }}
      >
        {/* Large Canvas Bounds (3200px x 2400px) */}
        <div className="relative w-[3200px] h-[2400px]">
          {/* Notes rendering */}
          {filteredNotes.map((note) => (
            <StickyNote
              key={note.id}
              note={note}
              onUpdate={handleUpdateNoteLocal}
              onDelete={handleDeleteNote}
              onDragEnd={handleDragEnd}
            />
          ))}

          {/* Empty state hint */}
          {!loading && notes.length === 0 && (
            <div className="absolute top-28 left-20 max-w-sm p-6 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-md">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Your Canvas is Ready! ✨
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                Click <strong>&quot;Add Note&quot;</strong> in the toolbar above to place your first sticky note. Drag notes anywhere, color-code them, and ask the AI assistant questions about your thoughts!
              </p>
              <button
                type="button"
                onClick={handleCreateNote}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Note</span>
              </button>
            </div>
          )}

          {/* Database error or guidance alert */}
          {error && (
            <div className="absolute top-8 left-8 max-w-lg p-4 rounded-xl bg-rose-50 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs shadow-lg">
              <p className="font-bold mb-1">Notice: Database Connection Pending</p>
              <p className="leading-relaxed">
                {error}
              </p>
              <p className="mt-2 text-[11px] text-rose-600 dark:text-rose-400">
                You can add your PostgreSQL `DATABASE_URL` in `.env` and run `npx prisma db push` when ready.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Canvas Quick Controls (bottom-left) */}
      <div className="absolute bottom-5 left-5 z-20 flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-lg text-xs text-slate-600 dark:text-slate-300 select-none">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="font-semibold">{notes.length} note{notes.length === 1 ? "" : "s"} on canvas</span>
        <span className="text-slate-300 dark:text-slate-700">|</span>
        <button
          onClick={fetchNotes}
          className="hover:text-amber-500 transition-colors flex items-center gap-1 text-[11px]"
          title="Refresh canvas"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Sync</span>
        </button>
      </div>

      {/* Unique Identifier AI Chatbot Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        notesCount={notes.length}
      />
    </div>
  );
}

export default Canvas;
