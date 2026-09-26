import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

export const PRESET_COLORS = [
  "#FEF08A", // Pastel Yellow
  "#FBCFE8", // Pastel Pink
  "#BAE6FD", // Pastel Blue
  "#BBF7D0", // Pastel Green
  "#DDD6FE", // Pastel Purple
] as const;

export const createNoteSchema = z.object({
  title: z.string().max(100, "Title is too long").optional().nullable(),
  content: z.string().min(1, "Content cannot be empty"),
  category: z.string().max(50, "Category name is too long").optional().nullable(),
  posX: z.number().optional().default(100),
  posY: z.number().optional().default(100),
  color: z.string().optional().default("#FEF08A"),
});

export const updateNoteSchema = z.object({
  title: z.string().max(100).optional().nullable(),
  content: z.string().min(1).optional(),
  category: z.string().max(50).optional().nullable(),
  posX: z.number().optional(),
  posY: z.number().optional(),
  zIndex: z.number().int().optional(),
  color: z.string().optional(),
});

export const chatSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(2000, "Message is too long"),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type ChatInput = z.infer<typeof chatSchema>;
