export interface Note {
  id: string;
  userId: string;
  title: string | null;
  content: string;
  category: string | null;
  posX: number;
  posY: number;
  zIndex: number;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  createdAt?: string;
}

export const PRESET_NOTE_COLORS = [
  { name: "Yellow", hex: "#FEF08A", border: "#FDE047", darkText: "#713F12" },
  { name: "Pink", hex: "#FBCFE8", border: "#F472B6", darkText: "#831843" },
  { name: "Blue", hex: "#BAE6FD", border: "#38BDF8", darkText: "#0C4A6E" },
  { name: "Green", hex: "#BBF7D0", border: "#4ADE80", darkText: "#14532D" },
  { name: "Purple", hex: "#DDD6FE", border: "#A78BFA", darkText: "#4C1D95" },
];

export const COMMON_CATEGORIES = [
  "Work",
  "Idea",
  "Personal",
  "Todo",
  "Urgent",
  "Research",
];
