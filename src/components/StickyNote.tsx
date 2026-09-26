"use client";

import React, { useState, useRef, useEffect } from "react";
import { Note, PRESET_NOTE_COLORS, COMMON_CATEGORIES } from "@/types/note";
import { GripVertical, Trash2, Tag, Check, Calendar } from "lucide-react";

interface StickyNoteProps {
  note: Note;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onDelete: (id: string) => void;
  onDragStart?: (id: string) => void;
  onDragEnd?: (id: string, x: number, y: number) => void;
}

export function StickyNote({
  note,
  onUpdate,
  onDelete,
  onDragStart,
  onDragEnd,
}: StickyNoteProps) {
  const [title, setTitle] = useState(note.title || "");
  const [content, setContent] = useState(note.content || "");
  const [category, setCategory] = useState(note.category || "");
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Synchronize incoming note changes if they differ
  useEffect(() => {
    setTitle(note.title || "");
  }, [note.title]);

  useEffect(() => {
    setContent(note.content || "");
  }, [note.content]);

  useEffect(() => {
    setCategory(note.category || "");
  }, [note.category]);

  const dragStartRef = useRef<{ startX: number; startY: number; initialPosX: number; initialPosY: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only drag when using the drag handle or card top bar
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    setIsDragging(true);
    if (onDragStart) onDragStart(note.id);

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPosX: note.posX,
      initialPosY: note.posY,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) return;
    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;

    const newX = Math.max(10, Math.round(dragStartRef.current.initialPosX + deltaX));
    const newY = Math.max(10, Math.round(dragStartRef.current.initialPosY + deltaY));

    onUpdate(note.id, { posX: newX, posY: newY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored if capture already lost
    }
    setIsDragging(false);

    if (onDragEnd) {
      onDragEnd(note.id, note.posX, note.posY);
    }
    dragStartRef.current = null;
  };

  const handleTitleBlur = () => {
    if (title !== (note.title || "")) {
      onUpdate(note.id, { title: title.trim() || null });
    }
  };

  const handleContentBlur = () => {
    if (content !== note.content && content.trim() !== "") {
      onUpdate(note.id, { content: content.trim() });
    }
  };

  const handleCategorySelect = (cat: string) => {
    const newCat = cat.trim() || null;
    setCategory(newCat || "");
    setIsEditingCategory(false);
    onUpdate(note.id, { category: newCat });
  };

  const formattedDate = new Date(note.updatedAt || note.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <div
      id={`note-${note.id}`}
      tabIndex={0}
      role="region"
      aria-label={`Sticky note: ${title || "Untitled"}`}
      style={{
        transform: `translate3d(${note.posX}px, ${note.posY}px, 0)`,
        zIndex: note.zIndex,
        backgroundColor: note.color || "#FEF08A",
      }}
      className={`absolute top-0 left-0 w-[240px] h-[250px] rounded-xl shadow-lg transition-shadow duration-150 flex flex-col border border-black/10 select-none ${
        isDragging
          ? "shadow-2xl ring-2 ring-amber-500/80 scale-[1.02] cursor-grabbing opacity-95"
          : "hover:shadow-xl focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
      }`}
    >
      {/* Top Bar / Drag Handle */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="flex items-center justify-between px-2.5 py-1.5 border-b border-black/10 bg-black/5 rounded-t-xl cursor-grab active:cursor-grabbing text-slate-800 touch-none"
      >
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <GripVertical className="w-3.5 h-3.5 text-slate-700/60" aria-label="Drag Handle" />
          
          {/* Category Tag Badge */}
          <div className="relative">
            {category ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingCategory(!isEditingCategory);
                }}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-black/10 text-slate-900 hover:bg-black/15 transition-colors"
                title="Change Category"
              >
                <Tag className="w-2.5 h-2.5" />
                <span className="truncate max-w-[70px]">{category}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingCategory(!isEditingCategory);
                }}
                className="text-[10px] text-slate-700/60 hover:text-slate-900 font-medium px-1 hover:underline"
              >
                + Tag
              </button>
            )}

            {/* Category Dropdown Menu */}
            {isEditingCategory && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute left-0 top-6 z-50 w-36 rounded-lg bg-white shadow-xl border border-slate-200 p-1 text-xs text-slate-800 animate-in fade-in zoom-in-95"
              >
                <div className="p-1 font-semibold text-[10px] text-slate-600 uppercase tracking-wider">
                  Select Category
                </div>
                {COMMON_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategorySelect(cat)}
                    className="w-full text-left px-2 py-1 rounded hover:bg-amber-50 text-[11px] font-medium flex items-center justify-between"
                  >
                    <span>{cat}</span>
                    {category === cat && <Check className="w-3 h-3 text-amber-600" />}
                  </button>
                ))}
                <div className="border-t border-slate-100 my-1"></div>
                <button
                  type="button"
                  onClick={() => handleCategorySelect("")}
                  className="w-full text-left px-2 py-1 rounded hover:bg-rose-50 text-[11px] text-rose-600 font-medium"
                >
                  Clear Tag
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Delete Button */}
        <button
          type="button"
          aria-label="Delete note"
          onClick={(e) => {
            e.stopPropagation();
            if (confirm("Delete this sticky note?")) {
              onDelete(note.id);
            }
          }}
          className="p-1 rounded-md text-slate-700/60 hover:text-rose-600 hover:bg-black/10 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Note Body: Title & Content */}
      <div className="flex-1 flex flex-col p-2.5 space-y-1.5 overflow-hidden">
        <input
          type="text"
          value={title}
          placeholder="Note title..."
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          maxLength={100}
          className="w-full bg-transparent font-bold text-sm text-slate-900 placeholder-slate-700/40 border-none outline-none focus:ring-0 px-0"
        />

        <textarea
          value={content}
          placeholder="Write your note here..."
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleContentBlur}
          className="w-full flex-1 bg-transparent resize-none text-xs text-slate-800 placeholder-slate-700/40 border-none outline-none focus:ring-0 leading-relaxed font-sans px-0"
        />
      </div>

      {/* Bottom Bar: 5 Color Presets Swatches & Date */}
      <div className="flex items-center justify-between px-2.5 py-1.5 border-t border-black/10 bg-black/5 rounded-b-xl">
        <div className="flex items-center gap-1.5">
          {PRESET_NOTE_COLORS.map((preset) => (
            <button
              key={preset.hex}
              type="button"
              aria-label={`Set color to ${preset.name}`}
              onClick={() => onUpdate(note.id, { color: preset.hex })}
              style={{ backgroundColor: preset.hex }}
              className={`w-3.5 h-3.5 rounded-full border border-black/25 transition-transform hover:scale-125 ${
                note.color === preset.hex ? "ring-2 ring-slate-800 scale-110" : ""
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-1 text-[10px] text-slate-700/60 font-medium">
          <Calendar className="w-2.5 h-2.5" />
          <span>{formattedDate}</span>
        </div>
      </div>
    </div>
  );
}

export default StickyNote;
